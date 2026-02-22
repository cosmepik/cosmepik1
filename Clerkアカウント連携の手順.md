# Clerk の導入とアカウント連携の手順

このプロジェクトにはすでに Clerk の**コード**は入っています。ここでは **Clerk ダッシュボードでの設定**と**アカウント連携（サインイン方法の追加・同一ユーザーの紐付け）**のやり方をまとめます。

---

## 1. アプリ作成と API キーの取得（必須）

1. **Clerk にログイン**  
   [https://dashboard.clerk.com](https://dashboard.clerk.com) にアクセスし、アカウントを作成またはログインします。

2. **アプリを作成**  
   「Add application」で新しいアプリを作成し、名前（例: Cosmepik）を付けます。

3. **API キーをコピー**  
   - 左メニュー **Configure → API Keys** を開く  
   - **Publishable key**（`pk_test_...`）と **Secret key**（`sk_test_...`）をコピー

4. **プロジェクトに設定**  
   プロジェクトルートの `.env.local` に次を追加（または上書き）します。

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ここに貼り付け
   CLERK_SECRET_KEY=sk_test_ここに貼り付け
   ```

5. **動作確認**  
   `npm run dev` で起動し、`http://localhost:3000` でサインイン／サインアップ画面が出ればOKです。

ここまでで「Clerk の導入」は完了です。次は「どの方法でログインできるか」を増やします。

---

## 2. サインイン方法の追加（「連携」＝ログイン手段の追加）

「アカウントの連携」の多くは、**Google やメールなど、サインインできる方法を増やす**ことを指します。Clerk では「認証方法」をダッシュボードでオンにするだけで使えます。

### 2-1. メール＋パスワード（初期状態で有効なことが多い）

- 左メニュー **Configure → User & Authentication** を開く  
- **Email address** が有効になっていれば、メール＋パスワードでサインアップ／サインインできます。  
- 必要なら **Password** の強さや「メール認証必須」などをここで変更できます。

### 2-2. Google でサインイン（推奨）

1. 左メニュー **Configure → User & Authentication → Social connections**（または **SSO connections**）を開く。  
2. **Google** を選び、**Add connection** → **For all users** を選ぶ。  
3. **開発環境**のときは、Clerk の共有 OAuth 設定が使えるので、**追加の設定は不要**で有効になります。  
4. **本番環境**で使うときは、[Google Cloud Console](https://console.cloud.google.com/) で OAuth 2.0 のクライアント ID／シークレットを発行し、Clerk の同じ画面の「Use custom credentials」に Client ID と Client Secret を入力します。  
   - 認証画面の設定（OAuth consent screen）と、**Authorized redirect URIs** に Clerk が表示する URL を登録する必要があります（Clerk の画面に表示される URI をコピーして Google 側に追加）。

これでサインイン画面に「Continue with Google」が表示され、Google アカウントでログインできるようになります。

### 2-3. その他の連携（GitHub・Apple など）

- 同じ **Social connections** の一覧から、**GitHub** や **Apple** などを選び、**Add connection** で追加します。  
- 本番では各サービスの開発者コンソールで OAuth アプリを作成し、Clerk に Client ID / Secret を登録します。

---

## 3. アカウントリンキング（同一ユーザーの紐付け）

**アカウントリンキング**は、「メールで作ったアカウント」と「あとから Google でログインしたアカウント」を**同じ 1 人のユーザー**として扱う機能です。

- Clerk は**メールアドレス**を共通の識別子として使い、**同じメール**でサインインした OAuth（Google など）を既存アカウントに自動でリンクします。  
- メールが「Clerk 側で未認証」の場合は、認証フローが挟まることがあります。  
- 設定は多くの場合 **User & Authentication** や **Account linking** の項目で有効／無効や挙動を確認できます（Clerk のバージョンでメニュー名が少し変わる場合があります）。

**やることのまとめ**

1. ダッシュボードで **Social connections** を有効にすると、サインイン画面に Google などが表示される（＝「連携」の追加）。  
2. 同じメールで別の方法（メール vs Google）でログインすると、Clerk が同じユーザーにリンクしてくれる（＝アカウントリンキング）。  
3. 特別なコードは不要で、**ダッシュボードの設定だけで**動作します。

---

## 4. 本番・Netlify で使うとき

- Clerk ダッシュボードで **本番用のキー**（Production の Publishable key / Secret key）を発行します。  
- Netlify の **Site settings → Environment variables** に、次を追加します。  
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  
  - `CLERK_SECRET_KEY`  
- 本番ドメインを Clerk の **Configure → Domains** に登録し、表示されている **Redirect URL** を Google OAuth の「Authorized redirect URIs」に追加します。

---

## 5. まとめ

| やりたいこと           | やること |
|------------------------|----------|
| Clerk を「導入」する   | ダッシュボードでアプリ作成 → API キーを `.env.local` に設定（§1） |
| Google などでログイン  | ダッシュボードの Social connections で Google などを追加（§2-2） |
| 同一ユーザーにまとめる | メールを共通にしてログインすれば自動でリンク（§3） |
| 本番で動かす           | 本番キーを発行し、Netlify の環境変数とドメイン設定（§4） |

コード側の実装はすでに済んでいるので、上記の**ダッシュボード設定と環境変数**だけで、Clerk の導入とアカウント連携が使えるようになります。
