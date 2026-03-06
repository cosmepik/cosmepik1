"use client";

import { usePathname } from "next/navigation";
import { ProfileProvider } from "@/lib/profile-context";

/** パスから slug を取得（/dashboard/edit/xxx → xxx、それ以外 → demo） */
function getSlugFromPath(pathname: string | null): string {
  if (!pathname) return "demo";
  const match = pathname.match(/^\/dashboard\/edit\/([^/]+)/);
  return match ? match[1] : "demo";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const slug = getSlugFromPath(pathname);

  return <ProfileProvider slug={slug}>{children}</ProfileProvider>;
}
