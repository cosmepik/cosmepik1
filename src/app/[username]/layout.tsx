import type { Metadata } from "next";
import { fetchPublicPageData } from "@/lib/supabase-fetch";
import { buildProfileMetadata } from "@/lib/profile-seo";

type Props = { params: Promise<{ username: string }> };

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  // fetchPublicPageData は次の Page 側でも呼ばれるが、Next.js の fetch dedupe で
  // 同一リクエスト内では一度しか実行されないため重複コストはない。
  const { profile, sections } = await fetchPublicPageData(username);
  return buildProfileMetadata({
    username,
    profile,
    sections,
    baseUrl: getBaseUrl(),
    pathPrefix: "/",
  });
}

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : null;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {supabaseHost && <link rel="preconnect" href={supabaseHost} />}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {children}
    </>
  );
}
