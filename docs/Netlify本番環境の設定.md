# Netlify 本番環境の設定

本番URL: **https://cosmepikdemo1.netlify.app**

---

## 検索エンジン対策（本番・テストの分離）

develop ブランチ用のテストサイトが Google などにインデックスされないようにするため、**本番サイト（main ブランチ用）のみ** に環境変数を設定します。

### 本番サイト（main ブランチ用）でやること

1. [Netlify](https://app.netlify.com) にログイン
2. **本番サイト**（main ブランチと連携している方）を選択
3. **Site configuration** → **Environment variables**
4. **Add a variable** で次を追加：
   - **Key**: `IS_PRODUCTION`
   - **Value**: `true`
5. **Save** 後、再デプロイ

### テストサイト（develop ブランチ用）でやること

**何もしない**。`IS_PRODUCTION` を設定しないままにしておくことで、自動的に `noindex` と `robots.txt` の `Disallow: /` が適用され、検索エンジンがクロールを控えます。

---

## OGP（Twitter・LINEでシェア時のプレビュー）を効かせる

`/p/あなたのID` のリンクをシェアしたときに、プロフィール写真とコスメが並んだ画像が出るようにするには、**環境変数** でアプリのURLを指定します。

### Netlify での設定手順

1. [Netlify](https://app.netlify.com) にログイン
2. 対象サイト（cosmepikdemo1）を選択
3. **Site configuration** → **Environment variables**
4. **Add a variable** または **Add from .env**
5. 次を追加：
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://cosmepikdemo1.netlify.app`
6. **Save** 後、**Deploys** から再デプロイ（または次のデプロイで反映）

これで OGP 画像の URL が `https://cosmepikdemo1.netlify.app/api/og?username=xxx` のように正しく生成され、シェア時にプレビューが表示されます。

---

## その他の環境変数（本番で必要なもの）

Netlify の Environment variables に、開発時と同様に以下も設定してください。

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 退会時に auth ユーザーを削除する場合に使用（任意） |
| `RAKUTEN_APPLICATION_ID` | 楽天API を使う場合（任意） |
