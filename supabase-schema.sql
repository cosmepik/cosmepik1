-- Cosmetree Supabase テーブル（Supabase ダッシュボードの SQL Editor で実行）

-- プロフィール（1 username につき1行）
CREATE TABLE IF NOT EXISTS profiles (
  username TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  skin_type TEXT,
  personal_color TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- リストアイテム（username ごとに複数行）
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

-- 公開ページで username 指定で読むため RLS は「誰でも読める」にしておく（必要なら後で制限）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "list_items are viewable by everyone"
  ON list_items FOR SELECT USING (true);

-- 書き込みは anon でも許可（本番では認証後に制限する）
CREATE POLICY "profiles are insertable by anon"
  ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles are updatable by anon"
  ON profiles FOR UPDATE USING (true);

CREATE POLICY "list_items are insertable by anon"
  ON list_items FOR INSERT WITH CHECK (true);
CREATE POLICY "list_items are updatable by anon"
  ON list_items FOR UPDATE USING (true);
CREATE POLICY "list_items are deletable by anon"
  ON list_items FOR DELETE USING (true);
