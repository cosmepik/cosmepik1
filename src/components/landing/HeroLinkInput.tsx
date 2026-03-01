"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

/**
 * Linktree風：コスメリンクのURL入力＋CTA
 * ユーザーにサービス内容を直感的に伝える
 */
export function HeroLinkInput() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      router.push(`/register?username=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/register");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div
        className="flex rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#0d4f4a]/30 transition-all"
        style={{
          border: "2px solid rgba(13,79,74,0.2)",
          background: "#ffffff",
        }}
      >
        <span
          className="flex items-center pl-4 md:pl-5 text-sm md:text-base font-medium shrink-0"
          style={{ color: "#1a6b66" }}
        >
          cosmepik.com/
        </span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="あなたのID"
          className="flex-1 min-w-0 py-3.5 md:py-4 px-2 md:px-3 text-sm md:text-base focus:outline-none placeholder:text-[#1a6b66]/50"
          style={{
            color: "#0d4f4a",
          }}
          autoComplete="username"
        />
      </div>
      <button
        type="submit"
        className="mt-4 w-full rounded-full py-3.5 md:py-4 px-8 md:px-10 text-sm md:text-base font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: "#ffffff",
          color: "#0d4f4a",
          boxShadow: "0 4px 24px rgba(13,79,74,0.2)",
        }}
      >
        コスメリンクを作成
      </button>
    </form>
  );
}
