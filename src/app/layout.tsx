import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { LayoutBackground } from "@/components/LayoutBackground";
import { LazyFonts } from "@/components/LazyFonts";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
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
  description: "インフルエンサーの愛用コスメをまとめたリンクツリー",
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
