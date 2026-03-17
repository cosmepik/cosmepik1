-- テーマ壁紙使用フラグ（true のとき背景オーバーレイ非表示、アップロード写真は保持）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS use_preset BOOLEAN DEFAULT false;
