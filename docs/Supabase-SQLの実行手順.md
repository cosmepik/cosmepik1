# Supabase で SQL を実行する手順（profile_views テーブル）

簡易アナリティクス用の `profile_views` テーブルを Supabase に作成する手順です。

---

## 1. Supabase にログインする

1. ブラウザで [https://supabase.com](https://supabase.com) を開く
2. 右上の **Sign in** からログイン
3. 対象の **プロジェクト** を選択（cosmepik 用のプロジェクト）

---

## 2. SQL Editor を開く

1. 左サイドバーで **「SQL Editor」** をクリック  
   （アイコンは `</>` のようなマーク）
2. **「New query」** をクリックして、新しいクエリ用の画面を開く

---

## 3. 以下の SQL を貼り付ける

クエリ入力エリアに、次の SQL を **そのままコピー＆ペースト** してください。

```sql
-- 公開ページ閲覧数（slug ごと。簡易アナリティクス用）
CREATE TABLE IF NOT EXISTS profile_views (
  username TEXT PRIMARY KEY,
  view_count BIGINT NOT NULL DEFAULT 0
);

-- RLS（Row Level Security）を有効化
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能
CREATE POLICY "profile_views viewable by everyone"
  ON profile_views FOR SELECT USING (true);

-- 誰でも新規行を追加可能（初回カウント用）
CREATE POLICY "profile_views insertable by anon"
  ON profile_views FOR INSERT WITH CHECK (true);

-- 誰でも更新可能（カウント増加用）
CREATE POLICY "profile_views updatable by anon"
  ON profile_views FOR UPDATE USING (true);
```

---

## 4. 実行する

1. 画面右下の **「Run」** ボタン（または **Ctrl + Enter** / **Cmd + Enter**）を押す
2. 実行が終わると、下部に **「Success. No rows returned」** のようなメッセージが出れば成功です

---

## 5. テーブルができたか確認する（任意）

1. 左サイドバーで **「Table Editor」** をクリック
2. 一覧に **`profile_views`** が表示されていれば OK です
3. 中身は最初は空で、誰かが公開ページ（`/p/xxx`）を開くと行が増え、`view_count` が増えていきます

---

## エラーが出た場合

- **「relation "profile_views" already exists」**  
  → テーブルは既に作成済みです。そのままで大丈夫です。
- **「policy ... already exists」**  
  → ポリシーが既にあります。該当する `CREATE POLICY` の行を削除してから、足りない部分だけ実行するか、一度ポリシーを削除してから再度実行してください。
- **「permission denied」**  
  → ログインしているアカウントが、そのプロジェクトのオーナーまたは権限のあるメンバーか確認してください。

---

## まとめ

| やること       | 場所           | 操作                         |
|----------------|----------------|------------------------------|
| ログイン       | supabase.com   | Sign in → プロジェクト選択   |
| SQL を実行     | SQL Editor     | New query → SQL 貼り付け → Run |
| 確認（任意）   | Table Editor   | `profile_views` が一覧にあるか |

これでダッシュボードの「あなたのページの閲覧数」が正しく動くようになります。

---

## 本番でコスメセット作成が失敗する場合

ログイン済みユーザー（authenticated）が Supabase に INSERT するには、RLS ポリシーに `authenticated` 用の設定が必要です。

プロジェクトルートの `supabase-migration-authenticated-policies.sql` を SQL Editor で実行してください。
