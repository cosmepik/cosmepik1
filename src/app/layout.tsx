import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Cormorant_Garamond } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "cosmepik - あなたの愛用コスメをシェア",
  description: "インフルエンサーの愛用コスメをまとめたリンクツリー",
};

export const viewport: Viewport = {
  themeColor: "#56c8c8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${cormorant.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <div
          className="min-h-screen transition-all duration-300"
          style={{
            backgroundColor: "var(--page-bg, var(--background))",
            backgroundImage: "var(--page-bg-image, none)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <ThemeWrapper>{children}</ThemeWrapper>
        </div>
      </body>
    </html>
  );
}
