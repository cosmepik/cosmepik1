import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { LayoutBackground } from "@/components/LayoutBackground";
import { LazyFonts } from "@/components/LazyFonts";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AdSenseHead } from "@/components/AdSense";
import { isProduction } from "@/lib/env";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "#cosmepik(コスメピック) - メイクレシピを作って共有・収益化",
    template: "%s | #cosmepik",
  },
  description:
    "cosmepik（コスメピック）はメイクレシピを簡単に作って共有・収益化できる無料サービス。お気に入りのコスメをまとめて、あなただけのメイクレシピを公開しよう。",
  keywords: [
    "メイクレシピ",
    "メイクレシピ 作り方",
    "メイクレシピ 共有",
    "メイクレシピ アプリ",
    "コスメ",
    "化粧品 まとめ",
    "コスメ 収益化",
    "楽天アフィリエイト",
    "cosmepik",
    "コスメピック",
  ],
  metadataBase: new URL("https://cosmepik.me"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "#cosmepik(コスメピック) - メイクレシピを作って共有・収益化",
    description:
      "cosmepikはメイクレシピを簡単に作って共有・収益化できる無料サービス。お気に入りのコスメをまとめて、あなただけのメイクレシピを公開しよう。",
    images: [{ url: "/og-image.png", width: 1024, height: 764 }],
    siteName: "cosmepik",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "#cosmepik(コスメピック) - メイクレシピを作って共有・収益化",
    description:
      "cosmepikはメイクレシピを簡単に作って共有・収益化できる無料サービス。",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/favicon-96.png",
  },
  ...(isProduction ? {} : { robots: { index: false, follow: false } }),
};

/**
 * サイト全体の構造化データ。
 * - WebSite: Google に検索ボックスやサイト名を認識させる（サイトリンク検索ボックス機能）
 * - Organization: 運営組織の情報。E-E-A-T の評価で参照される。
 * これらは <head> 内にレンダーされ、全ページで共通。
 */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://cosmepik.me/#website",
      url: "https://cosmepik.me/",
      name: "cosmepik",
      alternateName: ["コスメピック", "#cosmepik"],
      description: "メイクレシピを簡単に作って共有・収益化できる無料サービス",
      inLanguage: "ja-JP",
      publisher: { "@id": "https://cosmepik.me/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://cosmepik.me/#organization",
      name: "cosmepik",
      url: "https://cosmepik.me/",
      logo: {
        "@type": "ImageObject",
        url: "https://cosmepik.me/og-image.png",
      },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#56c8c8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSans.variable} light`} style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <GoogleAnalytics />
        <AdSenseHead />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <LazyFonts />
        <LayoutBackground>
          <ThemeWrapper>{children}</ThemeWrapper>
          <Toaster richColors position="top-center" />
        </LayoutBackground>
      </body>
    </html>
  );
}
