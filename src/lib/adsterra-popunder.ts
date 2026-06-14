import { isProduction } from "@/lib/env";
import { isPremiumUser } from "@/lib/premium-client";

const ADSTERRA_SCRIPT =
  "https://pl29739283.effectivecpmnetwork.com/70/94/7c/70947cee7705762c52c824baf46dd636.js";

declare global {
  interface Window {
    __cosmepikAdsterraLoaded?: boolean;
  }
}

/** Adsterra ポップアンダースクリプトを1回だけ読み込む（ユーザー操作直後に呼ぶ） */
export function loadAdsterraPopunderScript(): void {
  if (!isProduction || typeof window === "undefined") return;
  if (window.__cosmepikAdsterraLoaded) return;
  window.__cosmepikAdsterraLoaded = true;

  const script = document.createElement("script");
  script.src = ADSTERRA_SCRIPT;
  script.async = true;
  document.body.appendChild(script);
}

/**
 * メイクレシピ保存開始時に呼ぶ。プレミアム会員以外のみポップアンダーを発火させる。
 * 保存処理（画像生成）と並行して走らせ、保存中に広告が出るようにする。
 */
export async function maybeShowRecipeSavePopunder(): Promise<void> {
  if (!isProduction) return;
  try {
    const premium = await isPremiumUser();
    if (!premium) loadAdsterraPopunderScript();
  } catch {
    /* プレミアム判定失敗時は広告を出さない（誤表示を避ける） */
  }
}
