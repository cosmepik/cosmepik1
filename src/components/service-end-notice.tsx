"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SERVICE_END_DATE_LABEL, SERVICE_END_NOTICE_PATH } from "@/lib/service-end";

const DISMISS_KEY = `cosmepik-service-end-notice:${SERVICE_END_DATE_LABEL}`;

export function ServiceEndNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setOpen(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
    document.body.style.overflow = "";
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-end-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
      >
        <p className="text-xs font-medium tracking-wide text-muted-foreground">お知らせ</p>
        <h2 id="service-end-title" className="mt-2 text-lg font-semibold text-foreground">
          cosmepik は {SERVICE_END_DATE_LABEL} に終了します
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          この日をもって、公開ページの表示とログインを停止し、登録データはすべて削除します。作ったメイクレシピは、終了日までに画像として保存してください。終了後はデータを復元できません。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          詳細は{" "}
          <Link href={SERVICE_END_NOTICE_PATH} onClick={dismiss} className="font-medium text-green hover:underline">
            サービス終了のお知らせ
          </Link>{" "}
          をご確認ください。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          ご不明点は{" "}
          <a href="mailto:info@cosmepik.me" className="font-medium text-green hover:underline">
            info@cosmepik.me
          </a>{" "}
          までご連絡ください。
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-5 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          確認した
        </button>
      </div>
    </div>,
    document.body,
  );
}
