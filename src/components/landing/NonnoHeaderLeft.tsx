"use client";

import Link from "next/link";
import { Search, LogOut } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";

export function NonnoHeaderLeft() {
  const { user } = useUser();

  const handleSignOut = async () => {
    const supabase = createClient() ?? supabaseFallback;
    if (supabase) {
      await supabase.auth.signOut();
      document.cookie = "cosmepik_demo=; path=/; max-age=0";
      window.location.href = "/";
    }
  };

  if (user) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className="flex flex-col items-center gap-0.5 min-w-[44px]"
      >
        <LogOut className="w-5 h-5" style={{ color: "#555" }} />
        <span className="text-[9px] tracking-[0.12em] font-medium" style={{ color: "#555" }}>
          LOGOUT
        </span>
      </button>
    );
  }

  return (
    <Link href="/login" className="flex flex-col items-center gap-0.5 min-w-[44px]">
      <Search className="w-5 h-5" style={{ color: "#555" }} />
      <span className="text-[9px] tracking-[0.12em] font-medium" style={{ color: "#555" }}>
        LOGIN
      </span>
    </Link>
  );
}
