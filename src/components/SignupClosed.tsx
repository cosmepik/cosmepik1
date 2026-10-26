import Link from "next/link";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { SERVICE_END_DATE_LABEL, SERVICE_END_NOTICE_PATH } from "@/lib/service-end";

/** サービス終了に伴い、新規登録・新規プロフィール作成の代わりに表示する案内 */
export function SignupClosed() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="hover:opacity-80">
            <CosmepikLogo className="h-7" height={30} />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">新規登録は終了しました</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            cosmepik は {SERVICE_END_DATE_LABEL} をもってサービスを終了するため、新規登録の受付を停止しています。
          </p>
          <Link
            href={SERVICE_END_NOTICE_PATH}
            className="mt-5 inline-block text-sm font-medium text-green hover:underline"
          >
            サービス終了のお知らせを見る
          </Link>
        </div>
        <p className="mt-5">
          <Link href="/login" className="text-sm text-muted-foreground hover:underline">
            登録済みの方はこちらからログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
