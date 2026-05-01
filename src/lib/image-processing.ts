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
 * 背景除去 Worker は **リクエストごとに新規生成し、終わったら必ず terminate** する。
 *
 * 以前は Worker をシングルトンとして再利用していたが、`@imgly/background-removal`
 * の内部 ONNX Runtime セッションが Worker 内で共有された結果、稀に「直前の
 * リクエストの結果が次のリクエストに混入する（B の画像をリクエストしたのに
 * A の処理結果が返る）」というバグが本番で再現していた。
 *
 * Worker をリクエストごとに完全に作り直すことで、@imgly のモジュール状態 /
 * onnx セッション / バッファが call ごとに完全に独立し、混入が原理的に
 * 発生しなくなる。モデルファイル本体はブラウザの HTTP キャッシュに残るため、
 * 2 回目以降の Worker 起動でもダウンロード自体は再発生しない（インスタンス
 * 化のコストのみ）。
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
 * 背景除去ライブラリと **モデル/wasm本体** を事前ロードしてブラウザキャッシュに載せる。
 *
 * 使い捨て Worker を立てて preload だけ行い、すぐ terminate する。
 * モデルファイル本体は HTTP キャッシュに残るので、本番の remove 用 Worker は
 * モデルファイルのダウンロードをスキップして起動できる。
 *
 * - 失敗時は warmupPromise を null に戻して再試行可能にする。
 */
let warmupPromise: Promise<void> | null = null;
export function warmupBackgroundRemoval(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (warmupPromise) return warmupPromise;

  const worker = createWorker();
  if (worker) {
    warmupPromise = new Promise<void>((resolve) => {
      const cleanup = () => {
        try {
          worker.terminate();
        } catch {
          /* ignore */
        }
      };
      const onMessage = (e: MessageEvent) => {
        const d = e.data as { type?: string };
        if (d.type === "preloaded" || d.type === "error") {
          worker.removeEventListener("message", onMessage);
          if (d.type === "error") {
            warmupPromise = null;
            if (process.env.NODE_ENV !== "production") {
              console.warn("[warmupBackgroundRemoval] preload failed in worker");
            }
          }
          cleanup();
          resolve();
        }
      };
      worker.addEventListener("message", onMessage);
      worker.postMessage({ type: "preload" });
    });
    return warmupPromise;
  }

  // フォールバック: メインスレッドで preload
  warmupPromise = (async () => {
    try {
      const { preload } = await import("@imgly/background-removal");
      await preload(BG_CONFIG);
    } catch (e) {
      warmupPromise = null;
      if (process.env.NODE_ENV !== "production") {
        console.warn("[warmupBackgroundRemoval] preload failed", e);
      }
    }
  })();
  return warmupPromise;
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
 * 初回呼び出し時にモデル（~40MB / isnet_quint8）がダウンロードされブラウザキャッシュに保存される。
 *
 * アーキテクチャ：
 *  - **リクエストごとに使い捨ての Web Worker を立てて推論**する。
 *    Worker のシングルトン再利用は @imgly の内部状態が次のリクエストに
 *    混入するバグを誘発するため避ける。
 *  - メインスレッドはブロックされないので、スピナーや進捗バーが滑らか。
 *  - 入力画像を事前にダウンスケール（1024px上限）してモデル処理量を削減。
 *  - 量子化モデル (`isnet_quint8`) で推論を 20-30% 高速化。
 *  - 出力は WebP（PNGよりエンコード高速＋ファイルサイズ小）。
 *
 * 注：以前 `device: "gpu"` + `isnet_quint8` を試したが、
 * 一部ブラウザ（ONNX Runtime のWebGPUビルドと相性悪し）でクラッシュしたため取り止め。
 * CPU + quint8 の組み合わせは安定して動作する。
 */
export async function removeImageBackground(
  srcUrl: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // warmup が未完了でも同じ Promise を共有することで重複ロードを防ぐ。
  // 完了済みであれば即時解決される。モデルファイル自体はブラウザキャッシュに残る。
  const warm = warmupBackgroundRemoval();
  const blob = await fetchImageAsBlob(srcUrl);
  await warm;
  const downscaled = await downscaleImageBlob(blob, BG_REMOVAL_MAX_DIM);

  const worker = createWorker();
  if (worker) {
    try {
      const resultBlob = await runInDisposableWorker(worker, downscaled, onProgress);
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
 * 使い捨て Worker にジョブを投げて結果の Blob を受け取る。
 *
 * Worker は呼び出し側で必ず terminate される前提なので、preload と remove を
 * シーケンシャルに送って結果を待つだけのシンプルな実装で良い。requestId を
 * 使い回す必要も無い（1 Worker = 1 リクエスト）。
 */
function runInDisposableWorker(
  worker: Worker,
  blob: Blob,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const REQUEST_ID = 1;
  return new Promise((resolve, reject) => {
    let preloadDone = false;
    const onMessage = (e: MessageEvent) => {
      const d = e.data as
        | { type: "preloaded" }
        | { type: "progress"; requestId: number; value: number }
        | { type: "result"; requestId: number; blob: Blob }
        | { type: "error"; requestId: number | null; message: string };

      if (d.type === "preloaded") {
        preloadDone = true;
        worker.postMessage({ type: "remove", requestId: REQUEST_ID, blob });
        return;
      }
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
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", (e) => {
      worker.removeEventListener("message", onMessage);
      reject(new Error(e.message || "Worker error"));
    });
    // まず preload して @imgly が完全に初期化されるのを待ってから remove を送る。
    // preload 自体は HTTP キャッシュ済みなのでネットワーク往復は発生しない。
    if (!preloadDone) {
      worker.postMessage({ type: "preload" });
    }
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
