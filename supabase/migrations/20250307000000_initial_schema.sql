-- cosmepik DB スキーマ（他端末でデータ共有するため）
-- Supabase ダッシュボード → SQL Editor で実行

-- プロフィール（username = 公開URLのslug）
CREATE TABLE IF NOT EXISTS profiles (
  username TEXT PRIMARY KEY,
  display_name TEXT DEFAULT '',
  avatar_url TEXT,
  background_image_url TEXT,
  bio TEXT,
  bio_sub TEXT,
  skin_type TEXT,
  personal_color TEXT,
  sns_links JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- リストアイテム（username で紐付け）
CREATE TABLE IF NOT EXISTS list_items (
  username TEXT NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  rakuten_url TEXT,
  amazon_url TEXT,
  comment TEXT DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (username, item_id)
);

-- セクション（username で紐付け）
CREATE TABLE IF NOT EXISTS sections (
  username TEXT PRIMARY KEY REFERENCES profiles(username) ON DELETE CASCADE,
  sections_json JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- コスメセット（user_id = 認証ユーザーID）
CREATE TABLE IF NOT EXISTS cosme_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'マイコスメ',
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- 閲覧数（簡易アナリティクス）
CREATE TABLE IF NOT EXISTS profile_views (
  username TEXT PRIMARY KEY REFERENCES profiles(username) ON DELETE CASCADE,
  view_count INTEGER NOT NULL DEFAULT 0
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_list_items_username ON list_items(username);
CREATE INDEX IF NOT EXISTS idx_cosme_sets_user_id ON cosme_sets(user_id);

-- RLS: 公開データは誰でも読める。書き込みは認証ユーザーまたは demo 用に許可
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosme_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- 公開プロフィール・リスト・セクション: 誰でも読める
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "list_items_select" ON list_items FOR SELECT USING (true);
CREATE POLICY "sections_select" ON sections FOR SELECT USING (true);
CREATE POLICY "profile_views_select" ON profile_views FOR SELECT USING (true);

-- profiles/list_items/sections: 書き込み許可（username で紐付け、cosme_sets と連携）
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);
CREATE POLICY "list_items_all" ON list_items FOR ALL USING (true);
CREATE POLICY "sections_all" ON sections FOR ALL USING (true);
CREATE POLICY "profile_views_all" ON profile_views FOR ALL USING (true);

-- cosme_sets: 認証ユーザーは自分のデータ、未認証は demo のみ
CREATE POLICY "cosme_sets_select" ON cosme_sets FOR SELECT USING (
  auth.uid()::text = user_id OR user_id = 'demo'
);
CREATE POLICY "cosme_sets_insert" ON cosme_sets FOR INSERT WITH CHECK (
  auth.uid()::text = user_id OR user_id = 'demo'
);
CREATE POLICY "cosme_sets_update" ON cosme_sets FOR UPDATE USING (
  auth.uid()::text = user_id OR user_id = 'demo'
);
CREATE POLICY "cosme_sets_delete" ON cosme_sets FOR DELETE USING (
  auth.uid()::text = user_id OR user_id = 'demo'
);
