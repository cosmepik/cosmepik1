"use client";

import Script from "next/script";
import { isProduction } from "@/lib/env";

const ADSENSE_CLIENT = "ca-pub-6342491111387215";

export function AdSenseHead() {
  // 審査中は無効化（審査通過後に true に戻す）
  const ENABLE_ADSENSE = false;
  if (!isProduction || !ENABLE_ADSENSE) return null;

  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export function AdBanner({ className }: { className?: string }) {
  // 審査中は無効化（審査通過後に true に戻す）
  const ENABLE_ADSENSE = false;
  if (!isProduction || !ENABLE_ADSENSE) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot="1916296093"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id="adsense-banner-init" strategy="afterInteractive">
        {`try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}`}
      </Script>
    </div>
  );
}
