/**
 * 画像処理ユーティリティ
 *
 * - AI背景除去（@imgly/background-removal）
 * - Canvasベースの手動クロップ
 * - 外部URL（楽天等）を /api/image-proxy 経由で Blob 取得
 */

import type { Area } from "react-easy-crop";

/**
 * 外部URL（楽天など）を Blob として取得。
 * 同一オリジンでない画像はブラウザのCORS制約でCanvas描画が汚染されるため、
 * サーバー側プロキシ経由で取得する。
 */
export async function fetchImageAsBlob(url: string): Promise<Blob> {
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    const res = await fetch(url);
    return res.blob();
  }
  const proxied = `/api/image-proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied);
  if (!res.ok) {
    throw new Error(`Image fetch failed: ${res.status}`);
  }
  return res.blob();
}

/**
 * AI背景除去。成功時は透過PNGの data URL を返す。
 * 初回呼び出し時にモデル（~50MB）がダウンロードされブラウザキャッシュに保存される。
 */
export async function removeImageBackground(
  srcUrl: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const { removeBackground } = await import("@imgly/background-removal");
  const blob = await fetchImageAsBlob(srcUrl);

  const resultBlob = await removeBackground(blob, {
    progress: (_key, current, total) => {
      if (onProgress && total > 0) {
        onProgress(Math.round((current / total) * 100));
      }
    },
    output: { format: "image/png" },
  });

  return blobToDataUrl(resultBlob);
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
