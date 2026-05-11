/**
 * 画像処理ユーティリティ
 *
 * - AI背景除去（@imgly/background-removal）
 * - Canvasベースの手動クロップ
 * - 外部URL（楽天等）を /api/img-proxy 経由で Blob 取得
 */

import type { Area } from "react-easy-crop";
import type { Config } from "@imgly/background-removal";

/**
 * 背景除去の共通設定。
 * `preload()` と `removeBackground()` に同じ設定を渡すことで、
 * warmup 時に取得したモデル/wasm が実行時にもそのまま再利用される。
 *
 * - `model: "isnet_quint8"` は量子化済みの軽量モデル（~40MB）。
 *   デフォルトの `isnet_fp16`（~80MB）に比べて初回ダウンロードが半減し、
 *   推論時間も 20〜30% ほど速い。コスメ商品写真のようにエッジが明瞭な
 *   被写体では画質差はほぼ目視で分からない。
 * - `device: "cpu"` は安定性優先（GPU/WebGPU は過去にクラッシュ実績あり）。
 * - 出力は WebP（PNGよりエンコード高速＋ファイルサイズ小）。
 */
const BG_CONFIG: Config = {
  model: "isnet_quint8",
  device: "cpu",
  output: { format: "image/webp", quality: 0.9 },
};

/**
 * 外部URL（楽天など）を Blob として取得。
 * 同一オリジンでない画像はブラウザのCORS制約でCanvas描画が汚染されるため、
 * サーバー側プロキシ経由で取得する。
 * data/blob URL や同一オリジン（相対パスを含む）は直接フェッチする。
 */
export async function fetchImageAsBlob(url: string): Promise<Blob> {
  if (url.startsWith("data:") || url.startsWith("blob:") || isSameOrigin(url)) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Image fetch failed: ${res.status}`);
    }
    return res.blob();
  }
  const proxied = `/api/img-proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied);
  if (!res.ok) {
    throw new Error(`Image fetch failed: ${res.status}`);
  }
  return res.blob();
}

/** 背景除去で扱う画像の最大辺（これを超えると縮小してモデルに渡す） */
const BG_REMOVAL_MAX_DIM = 1024;

/**
 * 背景除去 Worker の運用ルール:
 *
 * - 「**ホット待機 Worker を 1 個だけキープする**」方式を採用。
 *   過去のシングルトン共有では、同じ Worker で複数リクエストを処理すると
 *   @imgly の内部 ONNX セッションが共有された結果、稀に直前のリクエストの
 *   結果が次に混入するバグが本番で再現した。
 *   一方でリクエストごとに完全新規 spawn すると ONNX 初期化/preload の
 *   コスト（数百ms〜2秒）が毎回ユーザーの待ち時間として表面化する。
 *
 * - そこで「**Worker は 1 リクエスト 1 個の使い捨て**」というルールは維持しつつ、
 *   spawn のタイミングだけ前倒しする。具体的には、リクエスト前のアイドル時間に
 *   1 個だけ Worker を立てて preload 完了状態で待機させ、リクエストが来たら
 *   その Worker を取り出して remove を送り、終わったら必ず terminate。
 *   取り出し直後に次回用の新しいホット Worker をバックグラウンドで spawn する。
 *
 * - 結果: 連続使用でも初回以外は「ボタンを押す→即推論開始」となり、混入バグの
 *   原因（Worker の状態共有）は引き続き発生しない。モデルファイル本体はブラウザの
 *   HTTP キャッシュに残るので、2 個目以降の Worker でも DL は再発生しない。
 */
let workerUnavailable = false;
function createWorker(): Worker | null {
  if (typeof window === "undefined") return null;
  if (workerUnavailable) return null;
  try {
    const w = new Worker(
      new URL("./workers/bg-removal.worker.ts", import.meta.url),
      { type: "module" },
    );
    w.addEventListener("error", (e) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[bg-removal] worker error", e.message);
      }
    });
    return w;
  } catch (e) {
    workerUnavailable = true;
    if (process.env.NODE_ENV !== "production") {
      console.warn("[bg-removal] worker unavailable, falling back to main thread", e);
    }
    return null;
  }
}

/**
 * 待機状態のホット Worker（preload 完了で remove リクエストを待っている）。
 * 一度だけ立てて、次のリクエストで「取り出して使い捨て」される。
 */
let hotWorker: Worker | null = null;
let hotWorkerReady: Promise<void> | null = null;

/**
 * ホット待機 Worker を 1 個だけ保証する。既にあれば何もしない（冪等）。
 * preload まで完了したら `hotWorkerReady` が resolve する。
 *
 * preload に失敗した場合はホット待機を破棄して resolve する（呼び出し側で
 * メインスレッドフォールバックに進めるように）。
 */
function ensureHotWorker(): void {
  if (typeof window === "undefined") return;
  if (hotWorker) return;
  const w = createWorker();
  if (!w) return;
  hotWorker = w;
  hotWorkerReady = new Promise<void>((resolve) => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string };
      if (d.type === "preloaded") {
        w.removeEventListener("message", onMsg);
        resolve();
        return;
      }
      if (d.type === "error") {
        w.removeEventListener("message", onMsg);
        if (hotWorker === w) {
          hotWorker = null;
          hotWorkerReady = null;
        }
        try {
          w.terminate();
        } catch {
          /* ignore */
        }
        if (process.env.NODE_ENV !== "production") {
          console.warn("[warmupBackgroundRemoval] preload failed in hot worker");
        }
        resolve();
      }
    };
    w.addEventListener("message", onMsg);
    w.postMessage({ type: "preload" });
  });
}

/**
 * 背景除去ライブラリと **モデル/wasm本体** を事前ロードしてブラウザキャッシュに載せ、
 * remove 用のホット Worker を 1 個だけ待機状態にしておく。
 *
 * - 編集画面のマウント時 / アイテム追加モーダル open 時 / 画像選択直前 など、
 *   複数箇所で呼んで構わない（冪等）。
 * - これにより、ユーザーが「AIで背景を除去」を押した瞬間は Worker spawn /
 *   ONNX セッション初期化のコストがほぼゼロから始まる。
 */
export function warmupBackgroundRemoval(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  ensureHotWorker();
  return hotWorkerReady ?? Promise.resolve();
}

/**
 * 画像を指定最大辺に収まるようダウンスケール。すでに小さい場合は元Blobを返す。
 * JPEG(0.85)で再エンコードするので、楽天の大きな PNG 画像も軽量化される。
 */
async function downscaleImageBlob(blob: Blob, maxDim: number): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return blob;
  }
  try {
    const { width, height } = bitmap;
    if (Math.max(width, height) <= maxDim) return blob;
    const scale = maxDim / Math.max(width, height);
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const out = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    return out ?? blob;
  } finally {
    bitmap.close();
  }
}

/**
 * AI背景除去。成功時は透過WebPの data URL を返す。
 *
 * 動作:
 *  1) `ensureHotWorker()` でホット Worker（preload 完了済み）を保証する
 *  2) 画像 fetch とダウンスケールを進める
 *  3) ホット Worker を取り出し → 即時 remove を送る（preload 待ちなし）
 *  4) 取り出した直後に次回用のホット Worker を新規 spawn
 *  5) 結果が返ったら使った Worker は terminate
 */
export async function removeImageBackground(
  srcUrl: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  ensureHotWorker();
  const readyPromise = hotWorkerReady;

  // 画像 fetch と preload を並列に進める
  const blob = await fetchImageAsBlob(srcUrl);
  await readyPromise;
  const downscaled = await downscaleImageBlob(blob, BG_REMOVAL_MAX_DIM);

  // 待機中の Worker を取り出して使い切る
  const worker = hotWorker;
  hotWorker = null;
  hotWorkerReady = null;

  // 次の処理のため、即時にバックグラウンドで新規ホット Worker を立て直す
  ensureHotWorker();

  if (worker) {
    try {
      const resultBlob = await runRemoveOnReadyWorker(worker, downscaled, onProgress);
      return blobToDataUrl(resultBlob);
    } finally {
      try {
        worker.terminate();
      } catch {
        /* ignore */
      }
    }
  }

  // フォールバック: Worker が使えない環境ではメインスレッドで実行
  return runOnMainThread(downscaled, onProgress);
}

/**
 * 既に preload 済みのホット Worker に remove リクエストを送って結果 Blob を受け取る。
 * 1 リクエスト = 1 Worker（呼び出し側で必ず terminate する）。
 */
function runRemoveOnReadyWorker(
  worker: Worker,
  blob: Blob,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const REQUEST_ID = 1;
  return new Promise((resolve, reject) => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data as
        | { type: "preloaded" }
        | { type: "progress"; requestId: number; value: number }
        | { type: "result"; requestId: number; blob: Blob }
        | { type: "error"; requestId: number | null; message: string };

      if (d.type === "progress") {
        onProgress?.(d.value);
        return;
      }
      if (d.type === "result") {
        worker.removeEventListener("message", onMessage);
        resolve(d.blob);
        return;
      }
      if (d.type === "error") {
        worker.removeEventListener("message", onMessage);
        reject(new Error(d.message));
        return;
      }
      // "preloaded" は ensureHotWorker 側で既に消費済み（届くことはほぼ無いが無視）。
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", (e) => {
      worker.removeEventListener("message", onMessage);
      reject(new Error(e.message || "Worker error"));
    });
    worker.postMessage({ type: "remove", requestId: REQUEST_ID, blob });
  });
}

/** メインスレッド実行のフォールバック（Worker 非対応環境用） */
async function runOnMainThread(
  blob: Blob,
  onProgress?: (p: number) => void,
): Promise<string> {
  const { removeBackground } = await import("@imgly/background-removal");
  const runConfig: Config = {
    ...BG_CONFIG,
    progress: (_key, current, total) => {
      if (onProgress && total > 0) {
        onProgress(Math.round((current / total) * 100));
      }
    },
  };
  try {
    const resultBlob = await removeBackground(blob, runConfig);
    return blobToDataUrl(resultBlob);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[removeImageBackground] retrying with default model", e);
    }
    const fallbackConfig: Config = { ...runConfig };
    delete (fallbackConfig as { model?: string }).model;
    const resultBlob = await removeBackground(blob, fallbackConfig);
    return blobToDataUrl(resultBlob);
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * react-easy-crop から受け取った pixelCrop で切り抜き、data URL を返す。
 */
export async function cropImageToDataUrl(
  srcUrl: string,
  pixelCrop: Area,
  mimeType: "image/png" | "image/jpeg" = "image/png",
): Promise<string> {
  // 外部URLの場合はプロキシ経由でBlobを取り、Object URL化してCanvasに描画
  let imageSrc = srcUrl;
  let revokeUrl: string | null = null;
  if (
    !srcUrl.startsWith("data:") &&
    !srcUrl.startsWith("blob:") &&
    !isSameOrigin(srcUrl)
  ) {
    const blob = await fetchImageAsBlob(srcUrl);
    imageSrc = URL.createObjectURL(blob);
    revokeUrl = imageSrc;
  }

  try {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(pixelCrop.width));
    canvas.height = Math.max(1, Math.round(pixelCrop.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return canvas.toDataURL(mimeType, 0.92);
  } finally {
    if (revokeUrl) URL.revokeObjectURL(revokeUrl);
  }
}

function isSameOrigin(url: string): boolean {
  try {
    const u = new URL(url, window.location.href);
    return u.origin === window.location.origin;
  } catch {
    return false;
  }
}
