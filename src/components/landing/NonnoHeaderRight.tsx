"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";

export function NonnoHeaderRight() {
  const { user } = useUser();

  return (
    <Link
      href={user ? "/dashboard" : "/register"}
      className="flex flex-col items-center gap-0.5 min-w-[44px]"
    >
      {/* ハンバーガー3本線アイコン */}
      <div className="flex flex-col gap-[4px] items-center justify-center w-5 h-5">
        <span className="block w-[18px] h-[2px] rounded-full" style={{ background: "#555" }} />
        <span className="block w-[18px] h-[2px] rounded-full" style={{ background: "#555" }} />
        <span className="block w-[18px] h-[2px] rounded-full" style={{ background: "#555" }} />
      </div>
      <span className="text-[9px] tracking-[0.12em] font-medium" style={{ color: "#555" }}>
        {user ? "MYPAGE" : "MENU"}
      </span>
    </Link>
  );
}
