"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadRecipeImage } from "@/lib/recipe-download";

interface Props {
  /**
   * ダウンロード対象の DOM 要素を返す getter。
   * クリック時に `null` の場合は何もしない。
   */
  getTarget: () => HTMLElement | null;
  filename?: string;
}

/**
 * メイクレシピキャンバスを画像で保存するための丸いダウンロードボタン。
 * canvas 系の要素の右上に配置することを想定している。
 */
export function RecipeDownloadButton({ getTarget, filename }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (downloading) return;
      const el = getTarget();
      if (!el) return;
      setDownloading(true);
      try {
        const result = await downloadRecipeImage(el, {
          filename: filename ?? `cosmepik-recipe-${Date.now()}`,
          shareTitle: "メイクレシピ",
        });
        if (!result.ok) {
          toast.error("画像の保存に失敗しました");
        } else if (result.method === "download") {
          toast.success("メイクレシピを保存しました");
        }
      } catch {
        toast.error("画像の保存に失敗しました");
      } finally {
        setDownloading(false);
      }
    },
    [downloading, getTarget, filename],
  );

  return (
    <button
      type="button"
      data-editor-decoration="1"
      aria-label="メイクレシピを画像で保存"
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      disabled={downloading}
      className="absolute right-2 top-2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/75 active:scale-95 disabled:opacity-60"
    >
      {downloading ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin" />
      ) : (
        <Download className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
