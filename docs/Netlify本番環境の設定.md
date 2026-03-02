# Netlify 本番環境の設定

本番URL: **https://cosmepikdemo1.netlify.app**

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
