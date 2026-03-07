-- Cosmetree Supabase テーブル（Supabase ダッシュボードの SQL Editor で実行）

-- コスメセット（1ユーザーが複数持てる）
CREATE TABLE IF NOT EXISTS cosme_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'マイコスメ',
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- プロフィール（1 slug につき1行。slug = 公開URL用識別子）
CREATE TABLE IF NOT EXISTS profiles (
  username TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  background_image_url TEXT,
  bio TEXT,
  bio_sub TEXT,
  skin_type TEXT,
  personal_color TEXT,
  sns_links JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- セクション（username = slug ごとに JSON で保存）
CREATE TABLE IF NOT EXISTS sections (
  username TEXT PRIMARY KEY REFERENCES profiles(username) ON DELETE CASCADE,
  sections_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- リストアイテム（username = slug ごとに複数行）
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rakuten_url TEXT,
  amazon_url TEXT,
  comment TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(username, item_id)
);

-- 公開ページ閲覧数（slug ごと。簡易アナリティクス用）
CREATE TABLE IF NOT EXISTS profile_views (
  username TEXT PRIMARY KEY,
  view_count BIGINT NOT NULL DEFAULT 0
);

-- コスメ検索キャッシュ（SerpApi結果を保存）
CREATE TABLE IF NOT EXISTS cosme_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  results_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(keyword)
);
CREATE INDEX IF NOT EXISTS idx_cosme_search_cache_keyword ON cosme_search_cache(keyword);

-- RLS
ALTER TABLE cosme_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- cosme_sets（既存ポリシーは DROP してから作成＝再実行可能）
DROP POLICY IF EXISTS "cosme_sets viewable by everyone" ON cosme_sets;
DROP POLICY IF EXISTS "cosme_sets insertable by anon" ON cosme_sets;
DROP POLICY IF EXISTS "cosme_sets insertable by authenticated" ON cosme_sets;
DROP POLICY IF EXISTS "cosme_sets updatable by anon" ON cosme_sets;
DROP POLICY IF EXISTS "cosme_sets updatable by authenticated" ON cosme_sets;
DROP POLICY IF EXISTS "cosme_sets deletable by anon" ON cosme_sets;
DROP POLICY IF EXISTS "cosme_sets deletable by authenticated" ON cosme_sets;
CREATE POLICY "cosme_sets viewable by everyone"
  ON cosme_sets FOR SELECT USING (true);
CREATE POLICY "cosme_sets insertable by anon"
  ON cosme_sets FOR INSERT WITH CHECK (true);
CREATE POLICY "cosme_sets insertable by authenticated"
  ON cosme_sets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cosme_sets updatable by anon"
  ON cosme_sets FOR UPDATE USING (true);
CREATE POLICY "cosme_sets updatable by authenticated"
  ON cosme_sets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "cosme_sets deletable by anon"
  ON cosme_sets FOR DELETE USING (true);
CREATE POLICY "cosme_sets deletable by authenticated"
  ON cosme_sets FOR DELETE TO authenticated USING (true);

-- profiles
DROP POLICY IF EXISTS "profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "profiles are insertable by anon" ON profiles;
DROP POLICY IF EXISTS "profiles are insertable by authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles are updatable by anon" ON profiles;
DROP POLICY IF EXISTS "profiles are updatable by authenticated" ON profiles;
CREATE POLICY "profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles are insertable by anon"
  ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles are insertable by authenticated"
  ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles are updatable by anon"
  ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles are updatable by authenticated"
  ON profiles FOR UPDATE TO authenticated USING (true);

-- list_items
DROP POLICY IF EXISTS "list_items are viewable by everyone" ON list_items;
DROP POLICY IF EXISTS "list_items are insertable by anon" ON list_items;
DROP POLICY IF EXISTS "list_items are insertable by authenticated" ON list_items;
DROP POLICY IF EXISTS "list_items are updatable by anon" ON list_items;
DROP POLICY IF EXISTS "list_items are updatable by authenticated" ON list_items;
DROP POLICY IF EXISTS "list_items are deletable by anon" ON list_items;
DROP POLICY IF EXISTS "list_items are deletable by authenticated" ON list_items;
CREATE POLICY "list_items are viewable by everyone"
  ON list_items FOR SELECT USING (true);
CREATE POLICY "list_items are insertable by anon"
  ON list_items FOR INSERT WITH CHECK (true);
CREATE POLICY "list_items are insertable by authenticated"
  ON list_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "list_items are updatable by anon"
  ON list_items FOR UPDATE USING (true);
CREATE POLICY "list_items are updatable by authenticated"
  ON list_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "list_items are deletable by anon"
  ON list_items FOR DELETE USING (true);
CREATE POLICY "list_items are deletable by authenticated"
  ON list_items FOR DELETE TO authenticated USING (true);

-- sections
DROP POLICY IF EXISTS "sections viewable by everyone" ON sections;
DROP POLICY IF EXISTS "sections insertable by anon" ON sections;
DROP POLICY IF EXISTS "sections insertable by authenticated" ON sections;
DROP POLICY IF EXISTS "sections updatable by anon" ON sections;
DROP POLICY IF EXISTS "sections updatable by authenticated" ON sections;
CREATE POLICY "sections viewable by everyone"
  ON sections FOR SELECT USING (true);
CREATE POLICY "sections insertable by anon"
  ON sections FOR INSERT WITH CHECK (true);
CREATE POLICY "sections insertable by authenticated"
  ON sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sections updatable by anon"
  ON sections FOR UPDATE USING (true);
CREATE POLICY "sections updatable by authenticated"
  ON sections FOR UPDATE TO authenticated USING (true);

-- profile_views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_views viewable by everyone" ON profile_views;
DROP POLICY IF EXISTS "profile_views insertable by anon" ON profile_views;
DROP POLICY IF EXISTS "profile_views updatable by anon" ON profile_views;
CREATE POLICY "profile_views viewable by everyone"
  ON profile_views FOR SELECT USING (true);
CREATE POLICY "profile_views insertable by anon"
  ON profile_views FOR INSERT WITH CHECK (true);
CREATE POLICY "profile_views updatable by anon"
  ON profile_views FOR UPDATE USING (true);

-- cosme_search_cache
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
