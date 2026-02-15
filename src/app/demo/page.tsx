import PublicProfilePage from "../[username]/page";

/**
 * デモ用：公開ページを同じUIで表示（username=demo として同じコンポーネントを利用）
 */
export default function DemoPage() {
  return <PublicProfilePage username="demo" />;
}
