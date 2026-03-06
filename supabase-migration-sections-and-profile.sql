-- セクション・プロフィール拡張用マイグレーション
-- Supabase SQL Editor で実行

-- profiles に不足カラムを追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_sub TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sns_links JSONB;

-- セクション用テーブル（username = slug ごとに JSON で保存）
CREATE TABLE IF NOT EXISTS sections (
  username TEXT PRIMARY KEY REFERENCES profiles(username) ON DELETE CASCADE,
  sections_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

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
