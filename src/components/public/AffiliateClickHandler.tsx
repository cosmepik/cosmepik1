"use client";

import { useEffect } from "react";
import { generateAffiliateLink } from "@/utils/affiliate";

/**
 * イベントデリゲーションでアフィリエイトクリックを処理。
 * DOM に一切の要素を追加せず、JS も最小限。
 */
export function AffiliateClickHandler({
  slug,
  userAffiliateId,
}: {
  slug: string;
  userAffiliateId?: string | null;
}) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-afl]");
      if (!el) return;
      const link = el.getAttribute("data-afl");
      if (!link) return;
      e.preventDefault();
      const itemId = el.getAttribute("data-item-id");
      const { url, usedId } = generateAffiliateLink(userAffiliateId || null, link);
      fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: slug,
          itemId: itemId ?? null,
          productUrl: link,
          usedId,
        }),
      }).catch(() => {});
      window.open(url, "_blank", "noopener,noreferrer");
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [slug, userAffiliateId]);

  return null;
}
