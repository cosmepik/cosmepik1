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

## 4. 確認メールテンプレートの変更（本番で「確認リンク→ログイン画面に戻る」場合）

**症状**: 確認メールのリンクをクリックすると、ログイン画面に戻ってしまう。

**原因**: デフォルトの Supabase 確認リンクは、認証後にセッションを URL の `#` フラグメントで返します。サーバーはフラグメントを受け取れないため、セッションが保存されずログイン画面に戻ります。

**解決策**: Supabase のメールテンプレートを変更し、リンクを直接アプリの `/auth/callback` に飛ばすようにします。

1. Supabase ダッシュボード → **Authentication** → **Email Templates**
2. **Confirm signup** を選択
3. **Confirm your signup** テンプレートのリンク部分を、次のように変更：

**変更前（デフォルト）例:**
```
{{ .ConfirmationURL }}
```

**変更後:**
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup
```

4. **Save** で保存

※ `{{ .SiteURL }}` は Supabase の「URL Configuration」の **Site URL** の値です。本番の Site URL が `https://あなたのサイト.netlify.app` になっていることを確認してください。

※ ローカル開発時は Site URL を `http://localhost:3000` に変更するか、Redirect URLs に両方追加して、確認メールのリンクが正しい先へ飛ぶようにしてください。

---

## 5. 動作の流れ

1. トップページ（`/`）→ ログイン済みなら `/influencer/manage` へ
2. 未ログインなら「サインイン / サインアップ」リンク
3. `/login` でメール＋パスワードでサインイン or サインアップ
4. `/influencer/*` は未ログインでアクセスすると `/` にリダイレクト
