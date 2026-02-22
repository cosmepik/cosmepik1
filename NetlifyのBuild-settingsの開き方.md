# Netlify で Build settings を開く手順

「Framework」は Netlify の新しい画面では **別項目では出ない** ことがあります。  
代わりに **Build command** と **Publish directory** だけ設定すれば、Next.js は動きます。

---

## 1. Build settings を開く

1. **https://app.netlify.com** にログイン
2. 一覧から **自分のサイト（cosmepik1 など）** をクリック
3. 上のメニューから **「Site configuration」** をクリック  
   （または **「Configure」** → **「Site configuration」**）
4. 左サイドバーで **「Build & deploy」** をクリック
5. その中で **「Continuous deployment」** を開く
6. **「Build settings」** の右側にある **「Edit settings」** または **「Configure」** をクリック

※ 表示が違う場合：
- **「Build」** や **「Deploys」** の下に **「Build settings」** がある場合もあります
- **「Options」** → **「Build & deploy」** → **「Build settings」** のパターンもあります

---

## 2. ここで設定するもの（Next.js 用）

**「Framework」という項目がなくても大丈夫です。** 次の2つだけ確認してください。

| 項目 | 設定する値 |
|------|------------|
| **Build command** | `npm run build` または 空欄（リポジトリの `netlify.toml` で指定しているなら空でOK） |
| **Publish directory** | **空欄** のまま（Next.js は Netlify が自動で扱います） |

- **Publish directory** に `out` や `dist` や `.next` が入っている場合は **削除して空** にしてください。
- 変更したら **「Save」** を押し、**「Trigger deploy」** → **「Deploy site」** でもう一度デプロイします。

---

## 3. まだ Build settings が見つからない場合

- 左メニューで **「Build & deploy」** を探す
- その中に **「Build settings」** または **「Continuous deployment」** があるので、そこを開く
- サイトを **Git と連携して作成** していないと「Build settings」が出ないことがあります。  
  → その場合は **Site configuration** の **「Build & deploy」** で **「Link repository」** から GitHub を連携してください。

---

## 4. 環境変数（必須）

Netlify でビルドする前に、次の環境変数を設定してください。

1. **Site configuration** → **Environment variables**（または **Build & deploy** → **Environment**）
2. **「Add a variable」** または **「Add environment variables」** をクリック
3. 次の変数を追加：

| Key | Value | 備考 |
|-----|-------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` または `pk_test_...` | [Clerk ダッシュボード](https://dashboard.clerk.com) で取得 |
| `CLERK_SECRET_KEY` | `sk_live_...` または `sk_test_...` | 同上 |
| `NEXT_PUBLIC_SUPABASE_URL` | （あなたの Supabase URL） | Supabase を使用する場合 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | （あなたの Supabase Anon Key） | Supabase を使用する場合 |
| `RAKUTEN_APPLICATION_ID` | （楽天 API の Application ID） | 楽天検索を使う場合 |
| `RAKUTEN_ACCESS_KEY` | （楽天 API の Access Key） | 楽天検索を使う場合 |

※ `.env.local` は GitHub に含まれないため、Netlify の環境変数に同じ値を設定する必要があります。  
※ 変更後は **再デプロイ**してください。

---

## 5. まとめ

- **「Framework」は探さなくてOK**（項目がないUIです）
- **Build command:** `npm run build`
- **Publish directory:** 空
- 保存して **再デプロイ** すれば Next.js が動きやすくなります。
