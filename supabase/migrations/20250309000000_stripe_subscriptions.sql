-- Stripe プレミアムプラン用：ユーザーごとのサブスクリプション状態
-- user_id = Supabase auth.uid()::text

CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id TEXT PRIMARY KEY,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_subscription_status TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: ユーザーは自分のレコードのみ閲覧・更新可能
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_subscriptions_select" ON user_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "user_subscriptions_insert" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "user_subscriptions_update" ON user_subscriptions
  FOR UPDATE USING (auth.uid()::text = user_id);
