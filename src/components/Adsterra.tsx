"use client";

import { useEffect, useRef } from "react";
import { isProduction } from "@/lib/env";

const NATIVE_SCRIPT_SRC =
  "https://pl29739282.effectivecpmnetwork.com/6d9a9dada8936faeed7efaf3c681f59c/invoke.js";
const NATIVE_CONTAINER_ID = "container-6d9a9dada8936faeed7efaf3c681f59c";

/**
 * Adsterra ネイティブバナー。公開プロフィールページ下部などに配置する。
 * コンテナ div を描画したうえで invoke.js を読み込む（プレミアムページ所有者には
 * PublicPageSSR 側で isPremium により非表示にする）。
 */
export function AdsterraNativeBanner({ className }: { className?: string }) {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!isProduction || scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    if (document.querySelector(`script[src="${NATIVE_SCRIPT_SRC}"]`)) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = NATIVE_SCRIPT_SRC;
    document.body.appendChild(script);
  }, []);

  if (!isProduction) return null;

  return (
    <div className={className}>
      <div id={NATIVE_CONTAINER_ID} className="min-h-[50px] w-full overflow-hidden" />
    </div>
  );
}
