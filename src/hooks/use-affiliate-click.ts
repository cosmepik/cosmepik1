"use client";

import { useCallback } from "react";
import { useSections } from "@/lib/section-context";
import { generateAffiliateLink } from "@/utils/affiliate";

/** 楽天アフィリエイトリンクを生成し、クリックログを記録してから開く */
export function useAffiliateClick() {
  const { slug, userAffiliateId } = useSections();

  const handleClick = useCallback(
    (itemLink: string | undefined, itemId?: string) => {
      const link = itemLink?.trim();
      if (!link) return;

      const { url, usedId } = generateAffiliateLink(
        userAffiliateId || null,
        link
      );

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

      // ポップアップブロッカー対策: 一時的な <a> でクリック（window.open はブロックされやすい）
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [slug, userAffiliateId]
  );

  return handleClick;
}
