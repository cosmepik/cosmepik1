/**
 * 画像処理ユーティリティ
 *
 * - AI背景除去（@imgly/background-removal）
 * - Canvasベースの手動クロップ
 * - 外部URL（楽天等）を /api/image-proxy 経由で Blob 取得
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
  const proxied = `/api/image-proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied);
  if (!res.ok) {
    throw new Error(`Image fetch failed: ${res.status}`);
  }
  return res.blob();
}

/** 背景除去で扱う画像の最大辺（これを超えると縮小してモデルに渡す） */
const BG_REMOVAL_MAX_DIM = 1024;

/**
 * 背景除去 Worker を遅延生成して再利用する。
 *
 * Worker 内で推論することで、メインスレッドが完全に自由になり、
 *   - スピナーなど CSS アニメーションが停止しない
 *   - 進捗バーの更新がスムーズ
 *   - キャンセルボタンなど UI が常に応答する
 *
 * Worker 生成に失敗した環境（極めて古いブラウザなど）では、
 * メインスレッドでのフォールバックに戻る。
 */
let workerInstance: Worker | null = null;
let workerUnavailable = false;
function getWorker(): Worker | null {
  if (typeof window === "undefined") return null;
  if (workerUnavailable) return null;
  if (workerInstance) return workerInstance;
  try {
    workerInstance = new Worker(
      new URL("./workers/bg-removal.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerInstance.addEventListener("error", (e) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[bg-removal] worker error", e.message);
      }
    });
    return workerInstance;
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
 * Worker が使える場合は Worker 側で preload する（推論時と同じコンテキストで
 * キャッシュが効くように）。Worker が使えない場合はメインスレッドで preload。
 *
 * - 失敗時は warmupPromise を null に戻して再試行可能にする（ネットワーク一時エラー対策）。
 */
let warmupPromise: Promise<void> | null = null;
export function warmupBackgroundRemoval(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (warmupPromise) return warmupPromise;

  const worker = getWorker();
  if (worker) {
    warmupPromise = new Promise<void>((resolve) => {
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
 *  - **Web Worker 内で推論**することでメインスレッドをブロックしない
 *    → スピナーが止まらず、進捗バーもスムーズ、キャンセル操作も即応答
 *  - 入力画像を事前にダウンスケール（1024px上限）してモデル処理量を削減
 *  - 量子化モデル (`isnet_quint8`) により推論自体も 20-30% 高速化
 *  - 出力は WebP（PNGよりエンコード高速＋ファイルサイズ小）
 *
 * 注：以前 `device: "gpu"` + `isnet_quint8` を試したが、
 * 一部ブラウザ（ONNX Runtime のWebGPUビルドと相性悪し）でクラッシュしたため取り止め。
 * CPU + quint8 の組み合わせは安定して動作する。
 */
let nextRequestId = 1;
export async function removeImageBackground(
  srcUrl: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // warmup が未完了でも同じ Promise を共有することで重複ロードを防ぐ。
  // 完了済みであれば即時解決される。
  const warm = warmupBackgroundRemoval();
  const blob = await fetchImageAsBlob(srcUrl);
  await warm;
  const downscaled = await downscaleImageBlob(blob, BG_REMOVAL_MAX_DIM);

  const worker = getWorker();
  if (worker) {
    const resultBlob = await runInWorker(worker, downscaled, onProgress);
    return blobToDataUrl(resultBlob);
  }

  // フォールバック: Worker が使えない環境ではメインスレッドで実行
  return runOnMainThread(downscaled, onProgress);
}

/** Worker にジョブを投げて結果の Blob を受け取る */
function runInWorker(
  worker: Worker,
  blob: Blob,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const requestId = nextRequestId++;
  return new Promise((resolve, reject) => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data as
        | { type: "progress"; requestId: number; value: number }
        | { type: "result"; requestId: number; blob: Blob }
        | { type: "error"; requestId: number | null; message: string };
      if (!("requestId" in d) || d.requestId !== requestId) {
        if (d.type === "error" && d.requestId === null) {
          worker.removeEventListener("message", onMessage);
          reject(new Error(d.message));
        }
        return;
      }
      if (d.type === "progress") {
        onProgress?.(d.value);
      } else if (d.type === "result") {
        worker.removeEventListener("message", onMessage);
        resolve(d.blob);
      } else if (d.type === "error") {
        worker.removeEventListener("message", onMessage);
        reject(new Error(d.message));
      }
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ type: "remove", requestId, blob });
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
