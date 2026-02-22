import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";

/**
 * 未ログイン: サインイン画面を表示
 * ログイン済み: 管理画面へリダイレクト
 */
export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/influencer/manage");
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-cream-100">
      <div className="w-full max-w-md">
        <p className="text-center text-gold-700 font-medium tracking-wide mb-6">
          Cosmepik
        </p>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-cream-300",
            },
          }}
        />
      </div>
    </main>
  );
}
