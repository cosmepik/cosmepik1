import { createAdminClient } from "@/lib/supabase/admin";

export async function checkPremiumByUsername(username: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    if (!admin) return false;

    const { data: cosmeSet } = await admin
      .from("cosme_sets")
      .select("user_id")
      .eq("slug", username)
      .limit(1)
      .single();

    if (!cosmeSet?.user_id) return false;

    const { data: sub } = await admin
      .from("user_subscriptions")
      .select("stripe_subscription_status")
      .eq("user_id", cosmeSet.user_id)
      .single();

    return sub?.stripe_subscription_status === "active" || sub?.stripe_subscription_status === "past_due";
  } catch {
    return false;
  }
}
