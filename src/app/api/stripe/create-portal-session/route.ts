import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

/** Stripe Customer Portal セッション作成（プラン管理・解約用） */
export async function POST() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase admin not configured" }, { status: 503 });
    }

    const { data: sub } = await admin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    const customerId = sub?.stripe_customer_id as string | undefined;
    if (!customerId) {
      return NextResponse.json(
        { error: "サブスクリプション情報が見つかりません" },
        { status: 404 },
      );
    }

    const returnUrl =
      (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000") +
      "/dashboard/premium";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[Stripe create-portal-session]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Portal session failed" },
      { status: 500 },
    );
  }
}
