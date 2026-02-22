import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cosmepik - あなたの愛用コスメをシェア",
  description: "インフルエンサーの愛用コスメをまとめたリンクツリー",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-cream-100 text-stone-900">
        {children}
      </body>
    </html>
  );
}
