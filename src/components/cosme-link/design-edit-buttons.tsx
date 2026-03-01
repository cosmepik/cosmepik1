"use client";

import { useEffect } from "react";
import { setProfile } from "@/lib/store";

interface DesignEditButtonsProps {
  slug: string;
  hasBackground?: boolean;
  onBackgroundChange?: () => void;
}

/** 編集画面用：カスタム背景を削除するボタン（画像アップロードはスタイルピッカーの背景タブに統合） */
export function DesignEditButtons({ slug, hasBackground, onBackgroundChange }: DesignEditButtonsProps) {
  useEffect(() => {
    const handler = () => onBackgroundChange?.();
    window.addEventListener("cosmepik-background-change", handler);
    return () => window.removeEventListener("cosmepik-background-change", handler);
  }, [onBackgroundChange]);

  if (!hasBackground) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setProfile({
            username: slug,
            backgroundImageUrl: "",
            updatedAt: new Date().toISOString(),
          });
          window.dispatchEvent(new CustomEvent("cosmepik-background-change"));
          onBackgroundChange?.();
        }}
        className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
      >
        背景を削除
      </button>
    </div>
  );
}
