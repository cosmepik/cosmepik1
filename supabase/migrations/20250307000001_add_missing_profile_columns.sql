-- 既存の profiles テーブルに不足カラムを追加
-- 「Could not find the 'background_image_url' column」エラーが出た場合に実行

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_sub TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skin_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sns_links JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rakuten_affiliate_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
