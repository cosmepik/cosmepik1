"use client";

import { useState, useEffect, useRef } from "react";
import liff from "@line/liff";
import { createClient } from "@/lib/supabase/client";

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";

type LiffState = {
  isInLiff: boolean;
  ready: boolean;
  loggingIn: boolean;
  error: string | null;
};

/**
 * LIFF 環境を検出し、LINE 内ブラウザからのアクセス時に
 * 自動的に Supabase セッションを確立するフック。
 */
export function useLiff(): LiffState {
  const [state, setState] = useState<LiffState>({
    isInLiff: false,
    ready: false,
    loggingIn: false,
    error: null,
  });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !LIFF_ID) return;
    ran.current = true;

    (async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
      } catch {
        setState((s) => ({ ...s, ready: true }));
        return;
      }

      if (!liff.isInClient()) {
        setState((s) => ({ ...s, ready: true }));
        return;
      }

      setState((s) => ({ ...s, isInLiff: true, loggingIn: true }));

      // Supabase にすでにセッションがあればスキップ
      const supabase = createClient();
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setState({ isInLiff: true, ready: true, loggingIn: false, error: null });
          return;
        }
      }

      // LIFF でログインしていなければログインを促す
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const accessToken = liff.getAccessToken();
      if (!accessToken) {
        setState({ isInLiff: true, ready: true, loggingIn: false, error: "no_token" });
        return;
      }

      // サーバーで LINE トークンを検証し token_hash を取得
      const res = await fetch("/api/auth/liff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (!res.ok) {
        setState({ isInLiff: true, ready: true, loggingIn: false, error: "auth_failed" });
        return;
      }

      const { token_hash } = await res.json();

      // Supabase セッション確立
      if (supabase && token_hash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "magiclink",
        });
        if (error) {
          setState({ isInLiff: true, ready: true, loggingIn: false, error: error.message });
          return;
        }
      }

      setState({ isInLiff: true, ready: true, loggingIn: false, error: null });
      window.location.reload();
    })();
  }, []);

  return state;
}
