"use client";

import Script from "next/script";
import { isProduction } from "@/lib/env";

const ADSENSE_CLIENT = "ca-pub-1902302166778833";

export function AdSenseHead() {
  if (!isProduction) return null;

  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export function AdBanner({ className }: { className?: string }) {
  if (!isProduction) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id="adsense-banner-init" strategy="afterInteractive">
        {`try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}`}
      </Script>
    </div>
  );
}
