-- 本番でメイクレシピ作成が失敗する場合の修正用
-- supabase-schema.sql に含まれているため、通常は不要です。
-- 既存DBに authenticated ポリシーだけ追加したい場合に実行（再実行可能）

-- cosme_sets: ログイン済みユーザー（authenticated）用
DROP POLICY IF EXISTS "cosme_sets insertable by authenticated" ON cosme_sets;
DROP POLICY IF EXISTS "cosme_sets updatable by authenticated" ON cosme_sets;
DROP POLICY IF EXISTS "cosme_sets deletable by authenticated" ON cosme_sets;
CREATE POLICY "cosme_sets insertable by authenticated"
  ON cosme_sets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cosme_sets updatable by authenticated"
  ON cosme_sets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "cosme_sets deletable by authenticated"
  ON cosme_sets FOR DELETE TO authenticated USING (true);

-- profiles: ログイン済みユーザー用
DROP POLICY IF EXISTS "profiles are insertable by authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles are updatable by authenticated" ON profiles;
CREATE POLICY "profiles are insertable by authenticated"
  ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles are updatable by authenticated"
  ON profiles FOR UPDATE TO authenticated USING (true);

-- list_items: ログイン済みユーザー用
DROP POLICY IF EXISTS "list_items are insertable by authenticated" ON list_items;
DROP POLICY IF EXISTS "list_items are updatable by authenticated" ON list_items;
DROP POLICY IF EXISTS "list_items are deletable by authenticated" ON list_items;
CREATE POLICY "list_items are insertable by authenticated"
  ON list_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "list_items are updatable by authenticated"
  ON list_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "list_items are deletable by authenticated"
  ON list_items FOR DELETE TO authenticated USING (true);
