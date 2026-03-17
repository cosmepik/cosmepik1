"use client";

import Link from "next/link";
import { CosmepikLogo } from "@/components/cosmepik-logo";

interface AppHeaderProps {
  children?: React.ReactNode;
}

/** LP・ガイド等の共通ヘッダー：UIBASE 完全準拠 */
export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <CosmepikLogo className="h-6" height={26} />
        </Link>
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </header>
  );
}
