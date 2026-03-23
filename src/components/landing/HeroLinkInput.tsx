"use client";

import Link from "next/link";

export function HeroLinkInput() {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <p
        className="text-base md:text-lg font-medium tracking-wide"
        style={{ color: "#1a6b66" }}
      >
        cosmepik.me/あなたのID
      </p>
      <Link
        href="/register"
        className="w-full rounded-full py-3.5 md:py-4 px-8 md:px-10 text-sm md:text-base font-semibold text-center transition-all hover:scale-[1.02]"
        style={{
          background: "#ffffff",
          color: "#0d4f4a",
          boxShadow: "0 4px 24px rgba(13,79,74,0.2)",
        }}
      >
        コスメリンクを作成
      </Link>
    </div>
  );
}
