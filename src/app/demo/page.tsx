import PublicProfilePage from "../[username]/page";

/**
 * プレビュー用：編集中の公開ページを表示（username=demo またはユーザーID）
 * ダッシュボードのプレビューボタンから開く
 */
export default function DemoPage() {
  return <PublicProfilePage username="demo" />;
}
