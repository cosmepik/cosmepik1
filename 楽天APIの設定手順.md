# 楽天APIの設定手順

## 1. APIキーの取得

1. [楽天デベロッパーズ](https://webservice.rakuten.co.jp/) にログイン
2. [アプリ登録](https://webservice.rakuten.co.jp/app/create) で新規アプリケーションを作成
3. **Application type** で **Web application** または **Backend service** を選択
   - このアプリではサーバーサイド（Next.js API ルート）から楽天APIを呼び出すため、**Backend service** を推奨
4. **Application ID** と **Access Key** をコピー

---

## 2. 許可されたウェブサイト（Allowed domains）に何を書くか

> 1行につき1つのドメインを入力してください。ワイルドカード（*）がサポートされています。アプリケーションがAPIリクエストを送信するすべてのドメインを含めてください。

以下のように **1行1ドメイン** で入力します。

### 開発環境

```
localhost
127.0.0.1
localhost:3000
localhost:3001
```

- ポート番号付き（`localhost:3000`）とポートなし（`localhost`）の両方を入れておくと安全です
- `127.0.0.1` も同様に登録しておくと、IP でアクセスした場合にも対応できます

### 本番環境（Netlify デプロイ時）

```
あなたのサイト名.netlify.app
```

- 例：`cosmepik.netlify.app`
- プレビューデプロイ用にワイルドカードを使う場合：`*.netlify.app`

### 独自ドメインを使う場合

```
あなたのドメイン.com
www.あなたのドメイン.com
```

- 例：`cosmepik.com`、`www.cosmepik.com`
- ディレクトリ（`/path`）は不要です。ドメインのみでOKです

### 記入例（まとめ）

```
localhost
127.0.0.1
localhost:3000
localhost:3001
cosmepik.netlify.app
*.netlify.app
```

- 開発用に `localhost` 系
- 本番用に Netlify のサイトURL
- プレビューブランチも使う場合は `*.netlify.app`

---

## 3. 環境変数の設定

プロジェクトルートの `.env.local` に次を追加します。

```env
RAKUTEN_APPLICATION_ID=あなたのApplication ID
RAKUTEN_ACCESS_KEY=あなたのAccess Key
```

- キーは**サーバー側のみ**で使用され、ブラウザには送信されません
- Netlify でデプロイする場合は、Site settings → Environment variables に同じ2つを登録してください

---

## 4. 動作確認

1. `.env.local` を保存後、`npm run dev` で開発サーバーを起動
2. ログインして管理画面 → 「＋ コスメを追加」から検索ページへ
3. 「ファンデーション」「SHISEIDO」などで検索
4. 楽天の商品が表示されれば成功です

未設定の場合はダミーデータで動作します。

---

## 5. 「楽天APIでエラーが発生しました」が出る場合

### 403エラー（ドメイン制限）

ローカル（localhost）で開発しているとき、**許可されたウェブサイト**に localhost が含まれていないと 403 になります。この場合はダミーデータで検索し、メッセージが表示されます。

**対処**: 本番環境（cosmepikdemo1.netlify.app）にデプロイして検索すると、楽天APIが動作します。

### その他のエラー

- `specify valid applicationId` → Application ID が正しいか確認
- `keyword parameter is not valid` → キーワードは2文字以上
- `RAKUTEN_ACCESS_KEY` は楽天デベロッパーズの「Access Key」をそのまま使う（Application ID と混同しない）
