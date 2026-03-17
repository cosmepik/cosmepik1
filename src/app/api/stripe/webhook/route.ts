import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

/** Stripe Webhook: サブスクリプション状態を保存 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    console.error("[Stripe webhook] Stripe or webhook secret not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    console.error("[Stripe webhook] Signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[Stripe webhook] Supabase not configured");
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (userId && subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        await supabase.from("user_subscriptions").upsert(
          {
            user_id: userId,
            stripe_subscription_id: subId,
            stripe_subscription_status: sub.status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        await supabase.from("user_subscriptions").upsert(
          {
            user_id: userId,
            stripe_subscription_id: sub.id,
            stripe_subscription_status: sub.status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }
      break;
    }
    default:
      // 未処理のイベントは無視
      break;
  }

  return NextResponse.json({ received: true });
}
