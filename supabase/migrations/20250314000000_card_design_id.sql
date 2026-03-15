-- コスメカードデザインをプロフィールに永続化
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_design_id TEXT;
