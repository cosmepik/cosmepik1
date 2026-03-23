import type { Metadata } from "next";

type Props = { params: Promise<{ username: string }> };

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const base = getBaseUrl();
  const ogImage = `${base}/api/og?username=${encodeURIComponent(username)}`;
  const url = `${base}/p/${username}`;

  return {
    title: `${username} のコスメ | cosmepik`,
    description: "愛用コスメをチェック",
    openGraph: {
      title: `${username} のコスメ | cosmepik`,
      description: "愛用コスメをチェック",
      url,
      siteName: "cosmepik",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "cosmepik" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${username} のコスメ | cosmepik`,
      description: "愛用コスメをチェック",
      images: [ogImage],
    },
  };
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
