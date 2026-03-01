"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/lib/theme-context";
import { ThemeBackground } from "@/components/ThemeBackground";
import { StylePickerProvider, StylePicker } from "@/components/cosme-link/style-picker";

/** テーマプロバイダー＋背景適用＋スタイルピッカーのラッパー */
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTopPage = pathname === "/";

  return (
    <ThemeProvider>
      <StylePickerProvider>
        <ThemeBackground>
          {children}
        </ThemeBackground>
        {!isTopPage && (
          <Suspense fallback={null}>
            <StylePicker />
          </Suspense>
        )}
      </StylePickerProvider>
    </ThemeProvider>
  );
}
