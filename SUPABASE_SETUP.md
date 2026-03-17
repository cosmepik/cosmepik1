# Supabase セットアップ（DBで他端末同期）

localStorage の代わりに Supabase（DB）を使うと、**複数端末で同じデータを参照**できます。

## 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) にアクセスしてログイン
2. **New Project** でプロジェクトを作成
3. **Settings → API** から以下をコピー:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` の鍵 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. 環境変数を設定

`.env.local` を作成（`.env.local.example` をコピーして編集）:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

## 3. DB テーブルを作成

Supabase ダッシュボード → **SQL Editor** を開き、以下を実行:

```sql
-- supabase/migrations/20250307000000_initial_schema.sql の内容をコピー＆実行
```

または、プロジェクトルートで Supabase CLI を使う場合:

```bash
npx supabase db push
```

## 4. 動作確認

1. **`.env.local` を追加したら必ず `npm run dev` を再起動**（NEXT_PUBLIC_* はビルド時に埋め込まれるため）
2. サイドメニュー左下に `(supabase)` と表示されれば DB 使用中
3. `(localStorage)` のままなら env 未設定 → `.env.local` を確認して再起動
4. プロフィール保存でエラーが出る場合 → ブラウザコンソールを確認

## トラブルシューティング

### 「Could not find the 'background_image_url' column」エラー

`profiles` テーブルにカラムが不足している場合に出ます。Supabase ダッシュボード → **SQL Editor** で以下を実行:

```sql
-- supabase/migrations/20250307000001_add_missing_profile_columns.sql の内容
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_sub TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skin_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sns_links JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rakuten_affiliate_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

実行後、プロフィール保存を再度お試しください。

### 壁紙選択機能（use_preset）用

壁紙選択時にアップロード写真を保持する機能を使う場合:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS use_preset BOOLEAN DEFAULT false;
```

### テーマ・壁紙・フォント（本番リンク反映）用

本番リンク（/p/username）でテーマ・壁紙・フォントを反映する場合:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_id TEXT;
```

### 楽天アフィリエイト（確率分散型レベニューシェア）用

`supabase/migrations/20250307000002_affiliate_and_click_logs.sql` を実行:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rakuten_affiliate_id TEXT;

CREATE TABLE IF NOT EXISTS click_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  item_id TEXT,
  product_url TEXT,
  used_id TEXT NOT NULL CHECK (used_id IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_click_logs_username ON click_logs(username);
CREATE INDEX IF NOT EXISTS idx_click_logs_used_id ON click_logs(used_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_created_at ON click_logs(created_at);

ALTER TABLE click_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "click_logs_insert" ON click_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "click_logs_select_admin" ON click_logs FOR SELECT USING (true);
```

## 補足

- **Supabase 未設定時**: 従来通り localStorage を使用
- **Supabase 設定後**: すべてのデータ（プロフィール・セクション・コスメセット・リスト）が DB に保存され、他端末で同期されます
