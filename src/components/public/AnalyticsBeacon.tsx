"use client";

import Script from "next/script";

export function AnalyticsBeacon({ username }: { username: string }) {
  return (
    <Script
      id="analytics-beacon"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `fetch("/api/analytics/view?username=${encodeURIComponent(username)}",{method:"POST"}).catch(function(){})`,
      }}
    />
  );
}
