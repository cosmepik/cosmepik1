"use client";

import { useEffect } from "react";

export function AnalyticsBeacon({ username }: { username: string }) {
  useEffect(() => {
    fetch(`/api/analytics/view?username=${encodeURIComponent(username)}`, {
      method: "POST",
    }).catch(() => {});
  }, [username]);
  return null;
}
