import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const content = (
    <html lang="ja">
      <body className="min-h-screen bg-cream-100 text-stone-900">
        {children}
      </body>
    </html>
  );
  return publishableKey ? (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  ) : (
    content
  );
}
