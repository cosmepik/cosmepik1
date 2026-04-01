"use client";

import { useState } from "react";
import { Instagram, Star, Sparkles } from "lucide-react";

interface ModePhoneProps {
  mode: "recipe" | "simple";
}

function RecipeModePhone() {
  return (
    <div className="relative mx-auto w-[160px] shrink-0 aspect-[9/19]">
      <div className="relative h-full w-full rounded-[28px] border-[3.5px] border-gray-800 bg-gray-900 shadow-2xl">
        {/* 内側ベゼル */}
        <div className="absolute inset-[2px] rounded-[25px] bg-black overflow-hidden">
          {/* 画面 */}
          <div className="absolute inset-[2px] rounded-[23px] overflow-hidden" style={{ background: "linear-gradient(160deg, #fff5f7 0%, #fff0f5 100%)" }}>
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[6px] -translate-x-1/2 w-[52px] h-[16px] rounded-full bg-black z-10" />
            {/* ステータスバー */}
            <div className="absolute left-0 right-0 top-0 h-[28px] flex items-center justify-between px-3 text-[8px] text-gray-800 font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-0.5">
                <span className="inline-block w-1.5 h-1 rounded-sm bg-gray-800 opacity-70" />
                <span className="inline-block w-2 h-1 rounded-sm bg-gray-800 opacity-90" />
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="absolute inset-x-0 top-[28px] bottom-0 overflow-hidden">
              {/* ヘッダー */}
              <div className="flex items-center justify-between px-2.5 pt-1 pb-1">
                <span className="text-[7px] font-bold tracking-wider" style={{ color: "#c8536e" }}>cosmepik</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-pink-100 flex items-center justify-center">
                    <Instagram className="w-2 h-2 text-pink-500" />
                  </div>
                </div>
              </div>

              {/* プロフィール */}
              <div className="flex flex-col items-center px-2 pt-1 pb-1.5">
                <div className="relative mb-1">
                  <div className="w-9 h-9 rounded-full border-[2px] border-pink-300 bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center shadow-sm">
                    <span className="text-[11px] font-bold text-pink-500">M</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-pink-400 border border-white flex items-center justify-center">
                    <span className="text-[4px] text-white font-bold">★</span>
                  </div>
                </div>
                <p className="text-[7px] font-semibold text-gray-800">@mina_beauty</p>
                <p className="text-[5.5px] text-gray-500 mt-0.5">スキンケアオタク✨</p>
              </div>

              {/* タブ */}
              <div className="flex mx-2 mb-1.5 rounded-full bg-pink-50 p-0.5">
                <div className="flex-1 rounded-full py-0.5 text-center" style={{ background: "#c8536e" }}>
                  <span className="text-[5.5px] font-bold text-white">レシピ</span>
                </div>
                <div className="flex-1 rounded-full py-0.5 text-center">
                  <span className="text-[5.5px] text-gray-400">アイテム</span>
                </div>
              </div>

              {/* レシピカード */}
              <div className="mx-2 space-y-1">
                {/* AM ルーティン */}
                <div className="rounded-xl bg-white shadow-sm border border-pink-50 p-1.5">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[5px] font-bold px-1 py-0.5 rounded-full text-white" style={{ background: "#f4a4b5" }}>AM</span>
                    <span className="text-[6px] font-semibold text-gray-700">朝のルーティン</span>
                  </div>
                  {[
                    { step: "1", name: "洗顔フォーム", brand: "FANCL" },
                    { step: "2", name: "化粧水", brand: "HADA LABO" },
                    { step: "3", name: "日焼け止め", brand: "Anessa" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-1 py-0.5">
                      <span className="w-3 h-3 rounded-full bg-pink-100 flex items-center justify-center text-[4.5px] font-bold text-pink-500 shrink-0">
                        {item.step}
                      </span>
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-pink-50 to-rose-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[5px] font-semibold text-gray-700 leading-tight truncate">{item.name}</p>
                        <p className="text-[4.5px] text-pink-400 leading-tight">{item.brand}</p>
                      </div>
                      <span className="text-[4.5px] text-gray-300">›</span>
                    </div>
                  ))}
                </div>

                {/* PM ルーティン */}
                <div className="rounded-xl bg-white shadow-sm border border-pink-50 p-1.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[5px] font-bold px-1 py-0.5 rounded-full text-white" style={{ background: "#9b8ec4" }}>PM</span>
                    <span className="text-[6px] font-semibold text-gray-700">夜のルーティン</span>
                  </div>
                  <div className="flex items-center gap-1 py-0.5">
                    <span className="w-3 h-3 rounded-full bg-purple-100 flex items-center justify-center text-[4.5px] font-bold text-purple-400 shrink-0">1</span>
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-50 to-indigo-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[5px] font-semibold text-gray-700 leading-tight">クレンジング</p>
                      <p className="text-[4.5px] text-purple-400 leading-tight">DHC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ホームインジケーター */}
      <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[40px] h-[3px] rounded-full bg-gray-700" />
    </div>
  );
}

function SimpleModePhone() {
  return (
    <div className="relative mx-auto w-[160px] shrink-0 aspect-[9/19]">
      <div className="relative h-full w-full rounded-[28px] border-[3.5px] border-gray-800 bg-gray-900 shadow-2xl">
        <div className="absolute inset-[2px] rounded-[25px] bg-black overflow-hidden">
          <div className="absolute inset-[2px] rounded-[23px] overflow-hidden" style={{ background: "linear-gradient(160deg, #f7f3ff 0%, #fdf0f7 100%)" }}>
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[6px] -translate-x-1/2 w-[52px] h-[16px] rounded-full bg-black z-10" />
            {/* ステータスバー */}
            <div className="absolute left-0 right-0 top-0 h-[28px] flex items-center justify-between px-3 text-[8px] text-gray-800 font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-0.5">
                <span className="inline-block w-1.5 h-1 rounded-sm bg-gray-800 opacity-70" />
                <span className="inline-block w-2 h-1 rounded-sm bg-gray-800 opacity-90" />
              </div>
            </div>

            <div className="absolute inset-x-0 top-[28px] bottom-0 overflow-hidden">
              {/* ヘッダー */}
              <div className="flex items-center justify-between px-2.5 pt-1 pb-1">
                <span className="text-[7px] font-bold tracking-wider" style={{ color: "#c8536e" }}>cosmepik</span>
                <Sparkles className="w-3 h-3 text-pink-400" />
              </div>

              {/* プロフィール */}
              <div className="flex flex-col items-center px-2 pt-0.5 pb-1.5">
                <div className="relative mb-1">
                  <div className="w-9 h-9 rounded-full border-[2px] border-purple-300 bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center shadow-sm">
                    <span className="text-[11px] font-bold text-purple-500">S</span>
                  </div>
                </div>
                <p className="text-[7px] font-semibold text-gray-800">@saki_cosme</p>
                <p className="text-[5.5px] text-gray-500 mt-0.5">お気に入りコスメをシェア♡</p>
                <div className="flex items-center gap-1 mt-1">
                  {["ig", "tw", "yt"].map((s) => (
                    <div key={s} className="w-4 h-4 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                      <span className="text-[4.5px] font-bold text-gray-400">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* コスメグリッド - シンプルなリスト表示 */}
              <div className="mx-2 space-y-1">
                <p className="text-[6px] font-semibold text-gray-600 mb-0.5">一軍コスメ ⭐</p>

                {/* グリッド */}
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { color: "from-pink-100 to-rose-200", label: "ファンデ" },
                    { color: "from-purple-100 to-violet-200", label: "アイシャドウ" },
                    { color: "from-orange-100 to-amber-200", label: "チーク" },
                    { color: "from-red-100 to-rose-200", label: "リップ" },
                    { color: "from-green-100 to-emerald-200", label: "美容液" },
                    { color: "from-blue-100 to-cyan-200", label: "化粧水" },
                  ].map((item, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center p-0.5">
                      <div className={`w-full h-4 rounded-md bg-gradient-to-br ${item.color} mb-0.5`} />
                      <span className="text-[4px] text-gray-500 leading-tight text-center">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* SNSリンク */}
                <div className="mt-1.5 rounded-xl bg-white shadow-sm border border-purple-50 p-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <Star className="w-2 h-2 text-white" />
                    </div>
                    <div>
                      <p className="text-[5.5px] font-semibold text-gray-700">YouTube</p>
                      <p className="text-[4.5px] text-gray-400">コスメレビュー動画</p>
                    </div>
                    <span className="ml-auto text-[4.5px] text-gray-300">›</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ホームインジケーター */}
      <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[40px] h-[3px] rounded-full bg-gray-700" />
    </div>
  );
}

export function PhoneMockupModes() {
  const [activeMode, setActiveMode] = useState<"recipe" | "simple">("recipe");

  return (
    <div className="w-full">
      {/* モード切り替えタブ */}
      <div className="flex justify-center mb-6">
        <div className="flex rounded-full p-1 gap-1" style={{ background: "rgba(200,83,110,0.08)" }}>
          <button
            type="button"
            onClick={() => setActiveMode("recipe")}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
              activeMode === "recipe"
                ? "text-white shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
            style={activeMode === "recipe" ? { background: "#c8536e" } : {}}
          >
            レシピモード
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("simple")}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
              activeMode === "simple"
                ? "text-white shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
            style={activeMode === "simple" ? { background: "#9b8ec4" } : {}}
          >
            シンプルモード
          </button>
        </div>
      </div>

      {/* モックアップ表示 */}
      <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center md:gap-16">
        {/* レシピモード */}
        <div className={`flex flex-col items-center transition-all duration-300 ${activeMode === "recipe" ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}>
          <RecipeModePhone />
          <div className="mt-4 text-center max-w-[160px]">
            <div className="inline-flex items-center gap-1 mb-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: "#c8536e" }}>
              🌿 レシピモード
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              朝・夜のスキンケア手順をステップ形式で紹介。ルーティン派に最適。
            </p>
          </div>
        </div>

        {/* シンプルモード */}
        <div className={`flex flex-col items-center transition-all duration-300 ${activeMode === "simple" ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}>
          <SimpleModePhone />
          <div className="mt-4 text-center max-w-[160px]">
            <div className="inline-flex items-center gap-1 mb-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: "#9b8ec4" }}>
              ✨ シンプルモード
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              お気に入りコスメをグリッドでおしゃれに展示。映えコレクション派に。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
