# Supabase 連携の手順

Cosmetree を Supabase と連携すると、プロフィールとマイリストがクラウドに保存され、別の端末やブラウザからも同じデータを参照できます。

---

## 1. Supabase でプロジェクトを作る

1. [Supabase](https://supabase.com/) にアクセスし、**Sign in**（GitHub でログイン可能）
2. **New project** をクリック
3. **Name** に `cosmetree` など好きな名前を入力
4. **Database Password** を設定（忘れないようにメモ）
5. **Region** は近い地域を選択（例: Northeast Asia (Tokyo)）
6. **Create new project** をクリックし、数分待つ

---

## 2. テーブルを作る

1. プロジェクトができたら、左メニューの **SQL Editor** を開く
2. **New query** をクリック
3. このリポジトリの **`supabase-schema.sql`** を開き、**中身をすべてコピー**
4. SQL Editor の入力欄に貼り付けて **Run**（または Ctrl+Enter）を押す
5. 「Success. No rows returned」などと表示されればOK

---

## 3. API キーをコピーする

1. 左メニューの **Project Settings**（歯車アイコン）を開く
2. **API** をクリック
3. 次の2つをメモする：
   - **Project URL**（例: `https://xxxxxxxxxxxx.supabase.co`）
   - **anon public** の **key**（長い文字列）

---

## 4. プロジェクトに環境変数を設定する

1. Cosmetree のプロジェクトフォルダ（`cosmetree4`）の **直下** に、次の名前のファイルを作る：  
   **`.env.local`**  
   （先頭のドットを忘れずに）

2. 次の2行を書き、Supabase の値に置き換える：

   ```
   NEXT_PUBLIC_SUPABASE_URL=ここに Project URL を貼る
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ここに anon public の key を貼る
   ```

   例：

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **保存** する

---

## 5. パッケージを入れて動かす

ターミナルで：

```bash
cd /Users/jojiyamaguchi/Downloads/cosmetree4
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開き、管理画面でプロフィールやリストを編集して **保存** を押すと、Supabase の **Table Editor**（左メニュー）の `profiles` と `list_items` にデータが入ります。

---

## 動作の切り替え

- **`.env.local` に Supabase の URL と Key がある**  
  → プロフィール・リストは **Supabase** に保存されます。

- **`.env.local` がない、または Supabase の変数がない**  
  → 今まで通り **ブラウザの localStorage** に保存されます。

どちらの場合も、アプリの操作は同じです。

---

## 注意

- **`.env.local` は Git にコミットしないでください。**（`.gitignore` に含まれています）
- Vercel などにデプロイするときは、Vercel の **Settings → Environment Variables** で同じ2つ（`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を設定してください。
