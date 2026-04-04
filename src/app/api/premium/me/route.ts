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
      .select("stripe_subscription_status, payment_failed_at")
      .eq("user_id", user.id)
      .single();

    const status = sub?.stripe_subscription_status;
    const premium = status === "active" || status === "past_due";
    return NextResponse.json({
      premium,
      subscriptionStatus: status ?? null,
      paymentFailedAt: sub?.payment_failed_at ?? null,
    });
  } catch (e) {
    console.error("[premium/me]", e);
    return NextResponse.json({ premium: false });
  }
}
