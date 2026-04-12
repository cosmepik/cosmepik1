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
  title: "#cosmepik(コスメピック)",
  description: "メイクレシピを簡単に作成、収益化しよう",
  metadataBase: new URL("https://cosmepik.me"),
  openGraph: {
    title: "#cosmepik(コスメピック)",
    description: "メイクレシピを簡単に作成、収益化しよう",
    images: [{ url: "/og-image.png", width: 1024, height: 764 }],
    siteName: "cosmepik",
  },
  twitter: {
    card: "summary_large_image",
    title: "#cosmepik(コスメピック)",
    description: "メイクレシピを簡単に作成、収益化しよう",
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
