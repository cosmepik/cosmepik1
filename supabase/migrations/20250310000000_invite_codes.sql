-- 招待コード（6桁数字）
-- 管理者が発行し、インフルエンサーが入力してコスメセットを受け取る
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_code TEXT NOT NULL UNIQUE,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_claim_code ON invite_codes(claim_code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_is_claimed ON invite_codes(is_claimed);

-- RLS: 認証ユーザーはコードの存在確認・claim 更新のみ（API経由で制御）
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- 未使用コードの存在確認（claim用）
CREATE POLICY "invite_codes_select_unclaimed" ON invite_codes
  FOR SELECT USING (is_claimed = false);

-- INSERT は API 経由（管理者チェック済み）のため、認証済みユーザーに許可
CREATE POLICY "invite_codes_insert_authenticated" ON invite_codes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE は claim 時のみ（未使用のコードのみ更新可）
CREATE POLICY "invite_codes_update_unclaimed" ON invite_codes
  FOR UPDATE USING (auth.uid() IS NOT NULL AND is_claimed = false);
