"use client";

import { cn } from "@/lib/utils";

interface CosmepikLogoProps {
  className?: string;
  color?: string;
  /** 高さ（ピクセル）。デフォルト: 24 */
  height?: number;
}

/** cosmepik ロゴ（SVGをmaskで表示し、色を継承） */
export function CosmepikLogo({
  className,
  color = "var(--primary)",
  height = 24,
}: CosmepikLogoProps) {
  return (
    <span
      role="img"
      aria-label="cosmepik"
      className={cn("inline-block shrink-0", className)}
      style={{
        width: height * 4,
        height,
        backgroundColor: color,
        maskImage: "url(/logo.svg)",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: "url(/logo.svg)",
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
