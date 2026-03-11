import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** プロフィール（username）のオーナーがプレミアムかどうかを返す */
export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")?.trim();
    if (!username) {
      return NextResponse.json({ premium: false });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ premium: false });
    }

    const { data: cosmeSet } = await admin
      .from("cosme_sets")
      .select("user_id")
      .eq("slug", username)
      .limit(1)
      .single();

    if (!cosmeSet?.user_id) {
      return NextResponse.json({ premium: false });
    }

    const { data: sub } = await admin
      .from("user_subscriptions")
      .select("stripe_subscription_status")
      .eq("user_id", cosmeSet.user_id)
      .single();

    const premium = sub?.stripe_subscription_status === "active";
    return NextResponse.json({ premium });
  } catch (e) {
    console.error("[premium/check]", e);
    return NextResponse.json({ premium: false });
  }
}
