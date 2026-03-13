import type { Metadata, Viewport } from "next";
import {
  Noto_Sans_JP,
  Cormorant_Garamond,
  M_PLUS_Rounded_1c,
  Shippori_Mincho,
  Zen_Kaku_Gothic_New,
  Zen_Maru_Gothic,
  Kosugi_Maru,
  Noto_Serif_JP,
} from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { LayoutBackground } from "@/components/LayoutBackground";
import { Toaster } from "sonner";
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

const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rounded",
});

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mincho",
});

const zenKakuGothic = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen",
});

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen-maru",
});

const kosugiMaru = Kosugi_Maru({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-kosugi",
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
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
    <html lang="ja" className={`${notoSans.variable} ${cormorant.variable} ${mPlusRounded.variable} ${shipporiMincho.variable} ${zenKakuGothic.variable} ${zenMaruGothic.variable} ${kosugiMaru.variable} ${notoSerifJP.variable}`}>
      <body className="min-h-screen antialiased">
        <LayoutBackground>
          <ThemeWrapper>{children}</ThemeWrapper>
          <Toaster richColors position="top-center" />
        </LayoutBackground>
      </body>
    </html>
  );
}
