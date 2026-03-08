"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ProfileProvider } from "@/lib/profile-context";

/** パスまたはクエリから slug を取得。ダッシュボード本体では null（プロフィール読み込み不要） */
function getSlug(pathname: string | null, slugFromQuery: string | null): string | null {
  if (!pathname) return slugFromQuery ?? null;
  const match = pathname.match(/^\/dashboard\/edit\/([^/]+)/);
  if (match) return match[1];
  if (pathname === "/dashboard/preview") return slugFromQuery ?? null;
  return null;
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slugFromQuery = searchParams.get("slug");
  const slug = getSlug(pathname, slugFromQuery);

  return <ProfileProvider slug={slug}>{children}</ProfileProvider>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
