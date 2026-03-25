-- 招待コードとメイクレシピを紐付ける
-- 運営が作成したメイクレシピを、招待コード経由でインフルエンサーに引き継ぐ

-- cosme_set_id を追加（既存テーブルがある場合）
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS cosme_set_id UUID REFERENCES cosme_sets(id) ON DELETE CASCADE;

-- 1つのメイクレシピに1つの未使用コードのみ（重複防止）
CREATE UNIQUE INDEX IF NOT EXISTS idx_invite_codes_cosme_set_unclaimed
  ON invite_codes(cosme_set_id) WHERE is_claimed = false;

-- 招待コード引き継ぎ用関数（RLS をバイパスして cosme_sets の user_id を更新）
CREATE OR REPLACE FUNCTION claim_invite_code(p_code TEXT)
RETURNS TABLE(slug TEXT, ok BOOLEAN, err_msg TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_id UUID;
  v_cosme_set_id UUID;
  v_slug TEXT;
  v_uid TEXT;
BEGIN
  v_uid := auth.uid()::text;
  IF v_uid IS NULL OR v_uid = '' THEN
    RETURN QUERY SELECT NULL::TEXT, false, 'ログインが必要です'::TEXT;
    RETURN;
  END IF;

  IF p_code IS NULL OR length(trim(p_code)) != 6 OR trim(p_code) !~ '^\d{6}$' THEN
    RETURN QUERY SELECT NULL::TEXT, false, '6桁の数字を入力してください'::TEXT;
    RETURN;
  END IF;

  SELECT id, invite_codes.cosme_set_id INTO v_invite_id, v_cosme_set_id
  FROM invite_codes
  WHERE claim_code = trim(p_code) AND is_claimed = false;

  IF v_invite_id IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, false, 'このコードは有効期限切れか、既に使用されています'::TEXT;
    RETURN;
  END IF;

  IF v_cosme_set_id IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, false, 'このコードは無効です'::TEXT;
    RETURN;
  END IF;

  SELECT cosme_sets.slug INTO v_slug FROM cosme_sets WHERE id = v_cosme_set_id;
  IF v_slug IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, false, 'メイクレシピが見つかりません'::TEXT;
    RETURN;
  END IF;

  UPDATE cosme_sets SET user_id = v_uid WHERE id = v_cosme_set_id;
  UPDATE invite_codes SET is_claimed = true WHERE id = v_invite_id;

  RETURN QUERY SELECT v_slug, true, NULL::TEXT;
END;
$$;
