# Supabase Auth 認証の設定

このアプリは Supabase Auth でメール＋パスワード認証を行います。

---

## 1. 環境変数

`.env.local` に次を設定（既に Supabase を使っている場合は設定済みのはずです）：

```env
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase Anon Key
```

---

## 2. Supabase でのメール設定（任意）

Supabase ダッシュボードで **Authentication → Providers → Email** を開きます。

- **Enable Email provider**: 有効
- **Confirm email**: オフにするとサインアップ後すぐログイン可能。オンだと確認メール送信が必要

---

## 3. リダイレクト URL（本番デプロイ時）

Netlify などにデプロイする場合、Supabase の **Authentication → URL Configuration** で：

- **Site URL**: `https://あなたのサイト.netlify.app`
- **Redirect URLs** に追加: `https://あなたのサイト.netlify.app/auth/callback`
- ローカル開発用: `http://localhost:3000/auth/callback`

---

## 4. 動作の流れ

1. トップページ（`/`）→ ログイン済みなら `/influencer/manage` へ
2. 未ログインなら「サインイン / サインアップ」リンク
3. `/login` でメール＋パスワードでサインイン or サインアップ
4. `/influencer/*` は未ログインでアクセスすると `/` にリダイレクト
