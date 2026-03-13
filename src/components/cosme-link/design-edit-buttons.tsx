"use client";

import { useEffect } from "react";

interface DesignEditButtonsProps {
  slug: string;
  hasBackground?: boolean;
  onBackgroundChange?: () => void;
  onBackgroundUrl?: (url: string) => void;
}

/** 編集画面用：スタイルピッカーでの背景変更時に onBackgroundChange を呼ぶ（背景削除はスタイルピッカーのプレビュー右上の×で行う） */
export function DesignEditButtons({ onBackgroundChange, onBackgroundUrl }: DesignEditButtonsProps) {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ backgroundImageUrl?: string }>).detail;
      if (detail && "backgroundImageUrl" in detail) {
        onBackgroundUrl?.(detail.backgroundImageUrl ?? "");
      } else {
        onBackgroundChange?.();
      }
    };
    window.addEventListener("cosmepik-background-change", handler);
    return () => window.removeEventListener("cosmepik-background-change", handler);
  }, [onBackgroundChange, onBackgroundUrl]);

  return null;
}
