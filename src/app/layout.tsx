import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { LayoutBackground } from "@/components/LayoutBackground";
import { LazyFonts } from "@/components/LazyFonts";
import { Toaster } from "sonner";
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
};

export const viewport: Viewport = {
  themeColor: "#56c8c8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSans.variable}>
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
