"use client";

import { useState } from "react";
import { Instagram, Star, Sparkles } from "lucide-react";

/* =====================================================================
   PhoneMockupModes - レシピモード / シンプルモード の説明用スマホモック
   non-no series セクション内に配置
   ===================================================================== */

function RecipeModePhone() {
  return (
    <div className="relative mx-auto w-[148px] shrink-0 aspect-[9/19.5]">
      {/* 外フレーム */}
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: "30px",
          border: "3px solid #1a1a1a",
          background: "#111",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        {/* 内側画面 */}
        <div
          className="absolute inset-[2px] overflow-hidden"
          style={{
            borderRadius: "27px",
            background: "linear-gradient(160deg, #fff5f7 0%, #fff0f5 100%)",
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{
              top: "8px",
              width: "54px",
              height: "18px",
              background: "#111",
              borderRadius: "9px",
            }}
          />

          {/* ステータスバー */}
          <div className="absolute left-0 right-0 top-0 h-8 flex items-center justify-between px-4 text-[8px] text-gray-700 font-semibold">
            <span>9:41</span>
            <div className="flex items-center gap-0.5">
              <span className="inline-block w-1.5 h-1 rounded-sm bg-gray-700 opacity-70" />
              <span className="inline-block w-2 h-1 rounded-sm bg-gray-700 opacity-90" />
            </div>
          </div>

          {/* コンテンツ */}
          <div className="absolute inset-x-0 top-8 bottom-3 overflow-hidden">
            {/* アプリヘッダー */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: "#fce4ee" }}>
              <span className="text-[8px] font-black tracking-wider" style={{ color: "#e8729a" }}>cosmepik</span>
              <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center">
                <Instagram className="w-2.5 h-2.5 text-pink-400" />
              </div>
            </div>

            {/* プロフィール */}
            <div className="flex flex-col items-center pt-2 pb-1.5 px-2">
              <div className="relative mb-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, #fce4ee 0%, #f8c8d8 100%)", border: "2px solid #e8729a" }}
                >
                  <span className="text-[13px] font-black" style={{ color: "#e8729a" }}>M</span>
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ background: "#e8729a" }}
                >
                  <span className="text-[5px] text-white font-black">★</span>
                </div>
              </div>
              <p className="text-[8px] font-bold" style={{ color: "#1a1a1a" }}>@mina_beauty</p>
              <p className="text-[6px] mt-0.5" style={{ color: "#999" }}>スキンケアオタク✨</p>
            </div>

            {/* タブバー */}
            <div className="flex mx-2.5 mb-2 rounded-full p-[2px]" style={{ background: "#fce4ee" }}>
              <div className="flex-1 rounded-full py-1 text-center" style={{ background: "#e8729a" }}>
                <span className="text-[6px] font-black text-white">レシピ</span>
              </div>
              <div className="flex-1 rounded-full py-1 text-center">
                <span className="text-[6px] text-gray-400">アイテム</span>
              </div>
            </div>

            {/* AM ルーティンカード */}
            <div className="mx-2.5 space-y-1.5">
              <div className="rounded-xl bg-white shadow-sm p-2" style={{ border: "1px solid #fce4ee" }}>
                <div className="flex items-center gap-1 mb-1.5">
                  <span
                    className="text-[6px] font-black px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "#f4a4b5" }}
                  >
                    AM
                  </span>
                  <span className="text-[7px] font-bold" style={{ color: "#333" }}>朝のルーティン</span>
                </div>
                {[
                  { step: "1", name: "洗顔フォーム", brand: "FANCL" },
                  { step: "2", name: "化粧水", brand: "HADA LABO" },
                  { step: "3", name: "日焼け止め", brand: "Anessa" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-1.5 py-0.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[5px] font-black shrink-0"
                      style={{ background: "#fce4ee", color: "#e8729a" }}
                    >
                      {item.step}
                    </span>
                    <div
                      className="w-5 h-5 rounded-lg shrink-0"
                      style={{ background: "linear-gradient(135deg, #fce4ee, #f8d0e0)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[6px] font-bold truncate" style={{ color: "#333" }}>{item.name}</p>
                      <p className="text-[5px]" style={{ color: "#e8729a" }}>{item.brand}</p>
                    </div>
                    <span className="text-[7px]" style={{ color: "#ccc" }}>›</span>
                  </div>
                ))}
              </div>

              {/* PM カード */}
              <div className="rounded-xl bg-white shadow-sm p-2" style={{ border: "1px solid #ede4f8" }}>
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className="text-[6px] font-black px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "#9b8ec4" }}
                  >
                    PM
                  </span>
                  <span className="text-[7px] font-bold" style={{ color: "#333" }}>夜のルーティン</span>
                </div>
                <div className="flex items-center gap-1.5 py-0.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[5px] font-black shrink-0"
                    style={{ background: "#ede4f8", color: "#9b8ec4" }}
                  >
                    1
                  </span>
                  <div
                    className="w-5 h-5 rounded-lg shrink-0"
                    style={{ background: "linear-gradient(135deg, #ede4f8, #e0d4f4)" }}
                  />
                  <div>
                    <p className="text-[6px] font-bold" style={{ color: "#333" }}>クレンジング</p>
                    <p className="text-[5px]" style={{ color: "#9b8ec4" }}>DHC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ホームバー */}
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
          style={{
            borderRadius: "27px",
            background: "linear-gradient(160deg, #f7f3ff 0%, #fdf0f7 100%)",
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{
              top: "8px",
              width: "54px",
              height: "18px",
              background: "#111",
              borderRadius: "9px",
            }}
          />

          {/* ステータスバー */}
          <div className="absolute left-0 right-0 top-0 h-8 flex items-center justify-between px-4 text-[8px] text-gray-700 font-semibold">
            <span>9:41</span>
            <div className="flex items-center gap-0.5">
              <span className="inline-block w-1.5 h-1 rounded-sm bg-gray-700 opacity-70" />
              <span className="inline-block w-2 h-1 rounded-sm bg-gray-700 opacity-90" />
            </div>
          </div>

          <div className="absolute inset-x-0 top-8 bottom-3 overflow-hidden">
            {/* アプリヘッダー */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: "#ede4f8" }}>
              <span className="text-[8px] font-black tracking-wider" style={{ color: "#e8729a" }}>cosmepik</span>
              <Sparkles className="w-3 h-3 text-purple-400" />
            </div>

            {/* プロフィール */}
            <div className="flex flex-col items-center pt-2 pb-1 px-2">
              <div
                className="w-10 h-10 rounded-full mb-1 flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg, #ede4f8, #e0d4f4)", border: "2px solid #9b8ec4" }}
              >
                <span className="text-[13px] font-black" style={{ color: "#9b8ec4" }}>S</span>
              </div>
              <p className="text-[8px] font-bold" style={{ color: "#1a1a1a" }}>@saki_cosme</p>
              <p className="text-[6px] mt-0.5 text-center" style={{ color: "#999" }}>お気に入りコスメをシェア♡</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {["ig", "tw", "yt"].map((s) => (
                  <div
                    key={s}
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "white", border: "1px solid #e0d4f4" }}
                  >
                    <span className="text-[5px] font-bold" style={{ color: "#9b8ec4" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-2.5">
              <p className="text-[7px] font-bold mb-1" style={{ color: "#555" }}>一軍コスメ ⭐</p>

              {/* コスメグリッド */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                {[
                  { g: "from-pink-100 to-rose-200", l: "ファンデ" },
                  { g: "from-purple-100 to-violet-200", l: "アイシャドウ" },
                  { g: "from-orange-100 to-amber-200", l: "チーク" },
                  { g: "from-red-100 to-rose-200", l: "リップ" },
                  { g: "from-green-100 to-emerald-200", l: "美容液" },
                  { g: "from-blue-100 to-cyan-200", l: "化粧水" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center p-0.5"
                    style={{ background: "white", border: "1px solid #f0e8f4" }}
                  >
                    <div className={`w-full h-3.5 rounded-md bg-gradient-to-br ${item.g} mb-0.5`} />
                    <span className="text-[4.5px] text-center leading-tight" style={{ color: "#888" }}>
                      {item.l}
                    </span>
                  </div>
                ))}
              </div>

              {/* SNSリンクカード */}
              <div
                className="rounded-xl p-2 flex items-center gap-2"
                style={{ background: "white", border: "1px solid #ede4f8" }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #9b8ec4, #e8729a)" }}
                >
                  <Star className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <p className="text-[6.5px] font-bold" style={{ color: "#333" }}>YouTube</p>
                  <p className="text-[5px]" style={{ color: "#999" }}>コスメレビュー動画</p>
                </div>
                <span className="ml-auto text-[7px]" style={{ color: "#ccc" }}>›</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ホームバー */}
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
              朝・夜のスキンケア手順をステップで紹介。ルーティン派に最適。
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
              コスメをグリッドでおしゃれに展示。映えコレクション派に。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
