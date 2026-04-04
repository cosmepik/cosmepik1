-- 課金失敗の追跡用カラムを追加
-- invoice.payment_failed 時に記録し、invoice.paid 時に NULL にクリアする
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;
