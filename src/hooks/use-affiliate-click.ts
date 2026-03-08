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

      window.open(url, "_blank", "noopener,noreferrer");
    },
    [slug, userAffiliateId]
  );

  return handleClick;
}
