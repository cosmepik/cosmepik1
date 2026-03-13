"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/lib/theme-context";
import { ThemeBackground } from "@/components/ThemeBackground";
import { LayoutFont } from "@/components/LayoutFont";
import { StylePickerProvider, StylePicker } from "@/components/cosme-link/style-picker";

/** テーマプロバイダー＋背景適用＋スタイルピッカーのラッパー */
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditPage = pathname?.startsWith("/dashboard/edit");
  const showStylePicker = !!isEditPage;

  return (
    <ThemeProvider>
      <LayoutFont />
      <StylePickerProvider>
        <ThemeBackground>{children}</ThemeBackground>
        {showStylePicker && (
          <Suspense fallback={null}>
            <StylePicker />
          </Suspense>
        )}
      </StylePickerProvider>
    </ThemeProvider>
  );
}
