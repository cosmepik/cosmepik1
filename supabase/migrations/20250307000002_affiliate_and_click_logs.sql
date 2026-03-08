-- 楽天アフィリエイトID（ユーザーごと）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rakuten_affiliate_id TEXT;

-- クリックログ（分析用）
CREATE TABLE IF NOT EXISTS click_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  item_id TEXT,
  product_url TEXT,
  used_id TEXT NOT NULL CHECK (used_id IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_click_logs_username ON click_logs(username);
CREATE INDEX IF NOT EXISTS idx_click_logs_used_id ON click_logs(used_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_created_at ON click_logs(created_at);

ALTER TABLE click_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "click_logs_insert" ON click_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "click_logs_select_admin" ON click_logs FOR SELECT USING (true);
