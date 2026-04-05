"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { createClient } from "@/lib/supabase/client";

const NAV_BLUE = "#8dcfdc";
const PINK = "#e8729a";
const TEXT_DARK = "#1a1a1a";

export function LandingHeader() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = createClient();
    if (!sb) {
      setLoggedIn(false);
      return;
    }
    sb.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  const handleLogout = async () => {
    const sb = createClient();
    if (sb) {
      await sb.auth.signOut();
      setLoggedIn(false);
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ minHeight: "56px" }}
      >
        <Link href="/" className="flex items-center">
          <CosmepikLogo height={32} color={NAV_BLUE} />
        </Link>
        <div className="flex items-center gap-2">
          {loggedIn === null ? (
            <div className="h-7 w-20" />
          ) : loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full px-4 py-1.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: PINK }}
              >
                マイページ
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full px-4 py-1.5 text-[11px] font-medium border transition-colors hover:bg-gray-50"
                style={{ color: TEXT_DARK, borderColor: "#ccc" }}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-1.5 text-[11px] font-medium border transition-colors hover:bg-gray-50"
                style={{ color: TEXT_DARK, borderColor: "#ccc" }}
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-full px-4 py-1.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: PINK }}
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>

      {/* スカイブルーナビバー */}
      <nav
        className="flex items-center overflow-x-auto scrollbar-hide px-2"
        style={{ background: NAV_BLUE, minHeight: "34px" }}
      >
        {[
          { label: "2つのモード", href: "#modes" },
          { label: "cosmepikとは", href: "#about" },
          { label: "使い方", href: "#howto" },
          { label: "収益化", href: "/guide/rakuten-affiliate" },
          { label: "FAQ", href: "/faq" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-shrink-0 flex items-center px-3 text-[11px] font-medium tracking-wide text-white hover:opacity-80 transition-opacity whitespace-nowrap"
            style={{ lineHeight: "34px" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
