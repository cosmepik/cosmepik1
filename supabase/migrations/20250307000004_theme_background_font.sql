-- テーマ・壁紙・フォントをプロフィールに永続化（本番リンクで反映用）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_id TEXT;
