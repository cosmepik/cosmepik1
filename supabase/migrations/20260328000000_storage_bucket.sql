-- Supabase Storage バケット作成（画像用）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 誰でも読める
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- 認証ユーザーのみアップロード可能
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 認証ユーザーのみ上書き可能
CREATE POLICY "Authenticated update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
