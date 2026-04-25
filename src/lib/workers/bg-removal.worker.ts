/**
 * 背景除去を Web Worker で実行するためのワーカー。
 *
 * CPU上の wasm 推論はメインスレッドをブロックするため、
 * CSS アニメーション（スピナー）や React 状態更新が一時的に停止し、
 * ユーザーから「フリーズした」ように見える。
 *
 * このワーカーで `@imgly/background-removal` を実行することで、
 * メインスレッドを一切ブロックせずに推論できる。
 *
 * 注: `@imgly/background-removal` は内部で `OffscreenCanvas` を使うため
 * Worker 内でも問題なく動作する（主要ブラウザで対応済み）。
 */

/// <reference lib="webworker" />

import type { Config } from "@imgly/background-removal";

declare const self: DedicatedWorkerGlobalScope;

// 背景除去の共通設定（image-processing.ts の BG_CONFIG と一致させること）
const BG_CONFIG: Config = {
  model: "isnet_quint8",
  device: "cpu",
  output: { format: "image/webp", quality: 0.9 },
};

type InMessage =
  | { type: "preload" }
  | { type: "remove"; requestId: number; blob: Blob };

type OutMessage =
  | { type: "preloaded" }
  | { type: "progress"; requestId: number; value: number }
  | { type: "result"; requestId: number; blob: Blob }
  | { type: "error"; requestId: number | null; message: string };

function post(msg: OutMessage, transfer: Transferable[] = []) {
  self.postMessage(msg, transfer);
}

self.addEventListener("message", async (event: MessageEvent<InMessage>) => {
  const data = event.data;

  if (data.type === "preload") {
    try {
      const { preload } = await import("@imgly/background-removal");
      await preload(BG_CONFIG);
      post({ type: "preloaded" });
    } catch (err) {
      post({
        type: "error",
        requestId: null,
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (data.type === "remove") {
    const { requestId, blob } = data;
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const result = await removeBackground(blob, {
        ...BG_CONFIG,
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            post({
              type: "progress",
              requestId,
              value: Math.round((current / total) * 100),
            });
          }
        },
      });
      post({ type: "result", requestId, blob: result });
    } catch (err) {
      // quint8 モデルで失敗した場合はデフォルトモデルで 1 回だけ再試行
      try {
        const { removeBackground } = await import("@imgly/background-removal");
        const fallback: Config = { ...BG_CONFIG };
        delete (fallback as { model?: string }).model;
        const result = await removeBackground(blob, {
          ...fallback,
          progress: (_key: string, current: number, total: number) => {
            if (total > 0) {
              post({
                type: "progress",
                requestId,
                value: Math.round((current / total) * 100),
              });
            }
          },
        });
        post({ type: "result", requestId, blob: result });
      } catch (err2) {
        post({
          type: "error",
          requestId,
          message: err2 instanceof Error ? err2.message : String(err2),
        });
      }
      if (err) {
        // 元エラーは dev で追跡できるようにログ
        // eslint-disable-next-line no-console
        console.warn("[bg-removal.worker] retrying with default model", err);
      }
    }
  }
});

export {};
