import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

/**
 * 未ログイン: サインインへの誘導
 * ログイン済み: 管理画面へリダイレクト
 */
export default async function HomePage() {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      redirect("/influencer/manage");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-cream-100">
      <div className="w-full max-w-md">
        <p className="text-center text-gold-700 font-medium tracking-wide mb-6">
          Cosmepik
        </p>
        <p className="text-center text-stone-600 text-sm mb-6">
          あなたの愛用コスメをシェアしよう
        </p>
        <Link
          href="/login"
          className="block w-full rounded-xl border-2 border-gold-500/50 text-gold-700 py-4 px-6 text-center font-medium hover:bg-cream-200 transition-colors"
        >
          サインイン / サインアップ
        </Link>
      </div>
    </main>
  );
}
