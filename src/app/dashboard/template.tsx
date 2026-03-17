"use client";

/**
 * Next.js template.tsx はナビゲーションごとに再マウントされるため、
 * ページ遷移時に毎回 CSS アニメーションが発火する。
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-transition-enter">{children}</div>;
}
