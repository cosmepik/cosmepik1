"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * /dashboard/edit（slug なし）へのアクセス。
 * ユーザーの最初のメイクレシピの編集ページに直接リダイレクトする。
 * LIFF（LINE リッチメニュー）からのアクセスで特に有用。
 */
export default function EditRedirect() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        const sets = data.sets ?? [];
        if (sets.length > 0) {
          router.replace(`/dashboard/edit/${sets[0].slug}`);
        } else {
          router.replace("/dashboard/onboarding");
        }
      })
      .catch(() => setError(true));
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">読み込みに失敗しました</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
