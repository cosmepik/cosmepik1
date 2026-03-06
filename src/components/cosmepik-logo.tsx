"use client";

import { cn } from "@/lib/utils";

interface CosmepikLogoProps {
  className?: string;
  color?: string;
  strokeWidth?: number;
}

/** cosmepik ロゴ */
export function CosmepikLogo({
  className,
  color = "var(--primary)",
}: CosmepikLogoProps) {
  return (
    <span
      className={cn("font-bold tracking-tight", className)}
      style={{ color }}
    >
      cosmepik
    </span>
  );
}
