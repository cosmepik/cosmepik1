-- コスメ検索キャッシュ（SerpApi結果を保存）
CREATE TABLE IF NOT EXISTS cosme_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  results_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(keyword)
);

CREATE INDEX IF NOT EXISTS idx_cosme_search_cache_keyword ON cosme_search_cache(keyword);

ALTER TABLE cosme_search_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cosme_search_cache viewable by everyone" ON cosme_search_cache;
DROP POLICY IF EXISTS "cosme_search_cache insertable by anon" ON cosme_search_cache;
DROP POLICY IF EXISTS "cosme_search_cache insertable by authenticated" ON cosme_search_cache;
DROP POLICY IF EXISTS "cosme_search_cache updatable by anon" ON cosme_search_cache;
DROP POLICY IF EXISTS "cosme_search_cache updatable by authenticated" ON cosme_search_cache;
CREATE POLICY "cosme_search_cache viewable by everyone"
  ON cosme_search_cache FOR SELECT USING (true);
CREATE POLICY "cosme_search_cache insertable by anon"
  ON cosme_search_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "cosme_search_cache insertable by authenticated"
  ON cosme_search_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cosme_search_cache updatable by anon"
  ON cosme_search_cache FOR UPDATE USING (true);
CREATE POLICY "cosme_search_cache updatable by authenticated"
  ON cosme_search_cache FOR UPDATE TO authenticated USING (true);
