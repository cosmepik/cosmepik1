# コスメ取得ができない時の調査手順

本番環境で楽天APIのコスメ検索が動作しない場合の原因追求ガイドです。

---

## 1. 本番での挙動（変更後）

- **ダミーデータは表示しません**（localhost のみダミー表示）
- 取得できない場合は**エラーメッセージ**を表示
- エラー時に **`_debug`** 情報を表示（原因追求用）

---

## 2. よくある原因と対処

### ① RAKUTEN_APPLICATION_ID が未設定

**表示されるエラー例:**
```
RAKUTEN_APPLICATION_ID が未設定です。Netlifyの環境変数に RAKUTEN_APPLICATION_ID を設定してください。
```

**対処:**
1. Netlify → Site settings → Environment variables
2. `RAKUTEN_APPLICATION_ID` を追加（楽天デベロッパーズの Application ID）
3. ビルドを再実行

### ② 楽天APIのドメイン制限（403）

**表示されるエラー例:**
```
楽天APIのドメイン制限のため、許可されたウェブサイトに本番URLを追加してください
```

**対処:**
1. [楽天デベロッパーズ](https://webservice.rakuten.co.jp/) にログイン
2. 対象アプリ → 編集
3. 「許可されたウェブサイト」に本番URLを追加
   - 例: `cosmepikdemo1.netlify.app`
   - ワイルドカード: `*.netlify.app`

### ③ Application ID が無効（specify valid applicationId）

**表示されるエラー例:**
```
楽天API認証エラー: specify valid applicationId
```

**対処:**
- Application ID のコピーミスを確認
- 楽天デベロッパーズでアプリが有効か確認

### ④ RAKUTEN_ACCESS_KEY が未設定（2026年以降）

楽天APIの仕様変更で `accessKey` が必須になる場合があります。

**対処:**
- Netlify に `RAKUTEN_ACCESS_KEY` を追加
- 楽天デベロッパーズの「Access Key」をコピー（Application ID と混同しない）

---

## 3. _debug 情報の見方

本番で検索すると、エラー時に JSON 形式の診断情報が表示されます。

| キー | 意味 |
|------|------|
| `appIdSet` | RAKUTEN_APPLICATION_ID がサーバーで取得できているか |
| `accessKeySet` | RAKUTEN_ACCESS_KEY が設定されているか |
| `rawItemCount` | API から返ってきた生の件数 |
| `status` | HTTP ステータスコード |
| `message` | 例外メッセージ（接続失敗時） |

---

## 4. 直接 API を試す

ブラウザで以下にアクセスしてレスポンスを確認できます。

```
https://あなたのサイト.netlify.app/api/rakuten/search?keyword=ファンデーション&hits=5&debug=1
```

- `debug=1` を付けると `_debug` が含まれます
- エラー時は `error` と `_debug` が返ります
