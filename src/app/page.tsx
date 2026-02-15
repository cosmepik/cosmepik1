import { redirect } from "next/navigation";

/**
 * ログイン後（現状はトップ表示時）はインフルエンサー管理画面へ直接遷移
 */
export default function HomePage() {
  redirect("/influencer/manage");
}
