"use client";

/** 緑トップバー付きレイアウト（--green はテーマで自動切り替え） */
export function ThemeBackground({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative z-20 h-1.5 bg-green" />
      {children}
    </>
  );
}
