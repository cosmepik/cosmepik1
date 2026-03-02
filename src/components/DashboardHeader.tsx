"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import type { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  rightContent?: React.ReactNode;
}

/** ログイン中のプロフィールアイコン（他コンポーネントからも利用可能） */
export function ProfileIcon({ user, onClick, className }: { user: User; onClick?: () => void; className?: string }) {
  const avatarUrl =
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    undefined;
  const initial = (user.email?.[0] ?? user.user_metadata?.name?.[0] ?? "?").toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-full overflow-hidden border-2 border-border bg-secondary hover:bg-accent transition-colors shrink-0 ${className ?? ""}`}
      aria-label="プロフィール"
      style={{ width: 36, height: 36 }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold text-muted-foreground">{initial}</span>
      )}
    </button>
  );
}

export function DashboardHeader({ onMenuClick, rightContent }: DashboardHeaderProps) {
  const user = useUser();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="-m-2 rounded-lg p-2 text-foreground hover:bg-accent"
            aria-label="メニューを開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-foreground hover:opacity-80">
            cosmepik
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {rightContent}
          {isLoggedIn && user && (
            <ProfileIcon user={user} onClick={onMenuClick} />
          )}
        </div>
      </div>
    </header>
  );
}
