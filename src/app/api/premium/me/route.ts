import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** ログイン中のユーザーのプレミアム状態を返す */
export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ premium: false });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ premium: false });
    }
    const user = session.user;

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ premium: false });
    }

    const { data: sub } = await admin
      .from("user_subscriptions")
      .select("stripe_subscription_status")
      .eq("user_id", user.id)
      .single();

    const premium = sub?.stripe_subscription_status === "active";
    return NextResponse.json({ premium });
  } catch (e) {
    console.error("[premium/me]", e);
    return NextResponse.json({ premium: false });
  }
}
