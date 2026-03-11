import Stripe from "stripe";

/** サーバーサイド用 Stripe クライアント */
export function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return null;
  return new Stripe(secret);
}
