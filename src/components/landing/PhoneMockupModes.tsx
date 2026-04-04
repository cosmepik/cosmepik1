"use client";

import { useState } from "react";
import Image from "next/image";

/* =====================================================================
   PhoneMockupModes - レシピモード / シンプルモード の説明用スマホモック
   non-no series セクション内に配置
   ===================================================================== */

function RecipeModePhone() {
  return (
    <div className="relative mx-auto w-[148px] shrink-0 aspect-[9/19.5]">
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: "30px",
          border: "3px solid #1a1a1a",
          background: "#111",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="absolute inset-[2px] overflow-hidden"
          style={{ borderRadius: "27px" }}
        >
          <Image
            src="/hero-mockup.png"
            alt="レシピモードの画面"
            fill
            className="object-cover object-top"
            sizes="148px"
          />
        </div>
      </div>
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2"
        style={{ width: "44px", height: "3px", background: "#333", borderRadius: "2px" }}
      />
    </div>
  );
}

function SimpleModePhone() {
  return (
    <div className="relative mx-auto w-[148px] shrink-0 aspect-[9/19.5]">
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: "30px",
          border: "3px solid #1a1a1a",
          background: "#111",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="absolute inset-[2px] overflow-hidden"
          style={{ borderRadius: "27px" }}
        >
          <Image
            src="/simple-mockup.png"
            alt="シンプルモードの画面"
            fill
            className="object-cover object-top"
            sizes="148px"
          />
        </div>
      </div>
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2"
        style={{ width: "44px", height: "3px", background: "#333", borderRadius: "2px" }}
      />
    </div>
  );
}

export function PhoneMockupModes() {
  const [activeMode, setActiveMode] = useState<"recipe" | "simple">("recipe");

  return (
    <div className="w-full">
      {/* モード切り替えタブ - ノンノフィルターボタンスタイル */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveMode("recipe")}
          className="flex-1 rounded-full py-2.5 text-[12px] font-bold transition-all"
          style={
            activeMode === "recipe"
              ? { background: "#e8729a", color: "white", boxShadow: "0 3px 10px rgba(232,114,154,0.4)" }
              : { background: "white", color: "#555", border: "1px solid #ddd" }
          }
        >
          レシピモード
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("simple")}
          className="flex-1 rounded-full py-2.5 text-[12px] font-bold transition-all"
          style={
            activeMode === "simple"
              ? { background: "#9b8ec4", color: "white", boxShadow: "0 3px 10px rgba(155,142,196,0.4)" }
              : { background: "white", color: "#555", border: "1px solid #ddd" }
          }
        >
          シンプルモード
        </button>
      </div>

      {/* モックアップ + 説明 */}
      <div className="flex justify-center gap-6">
        {/* レシピモード */}
        <div
          className="flex flex-col items-center transition-all duration-300"
          style={{ opacity: activeMode === "recipe" ? 1 : 0.35, transform: activeMode === "recipe" ? "scale(1)" : "scale(0.92)" }}
        >
          <RecipeModePhone />
          <div className="mt-3 text-center max-w-[150px]">
            <div
              className="inline-flex items-center gap-1 mb-1.5 px-3 py-1 rounded-full text-[10px] font-black text-white"
              style={{ background: "#e8729a" }}
            >
              レシピモード
            </div>
            <p className="text-[10.5px] leading-relaxed" style={{ color: "#664455" }}>
              写真の上にコスメを表示できるモード
            </p>
          </div>
        </div>

        {/* シンプルモード */}
        <div
          className="flex flex-col items-center transition-all duration-300"
          style={{ opacity: activeMode === "simple" ? 1 : 0.35, transform: activeMode === "simple" ? "scale(1)" : "scale(0.92)" }}
        >
          <SimpleModePhone />
          <div className="mt-3 text-center max-w-[150px]">
            <div
              className="inline-flex items-center gap-1 mb-1.5 px-3 py-1 rounded-full text-[10px] font-black text-white"
              style={{ background: "#9b8ec4" }}
            >
              シンプルモード
            </div>
            <p className="text-[10.5px] leading-relaxed" style={{ color: "#554466" }}>
              コスメをカードで並べるモード
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
