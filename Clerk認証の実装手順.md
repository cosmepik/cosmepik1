# Clerk 認証の実装手順

Clerk（クラーク）は Next.js 向けの認証サービスで、サインイン・サインアップ・セッション管理を簡単に追加できます。**無料枠**（月間 10,000 MAU まで）で利用可能です。

---

## Clerk を選ぶ理由

- **Next.js App Router と相性が良い**（公式サポート）
- **Keyless モード**：最初は API キーなしで開発を始められる
- **Google / メール / パスワード**など複数の認証方法
- **`<SignIn />` `<UserButton />`** などコンポーネントが用意されている
- **Supabase との併用**：Clerk で「誰か」を判定し、Supabase にプロフィール・リストを保存する構成にしやすい

---

## 実装の流れ（概要）

1. **Clerk パッケージのインストール**
2. **ミドルウェア**で `/influencer` を「ログイン必須」に
3. **レイアウト**で `ClerkProvider` を追加
4. **トップページ**：未ログインならサインイン、ログイン済みなら管理画面へ
5. **プロフィール・リスト**を Clerk の `userId` に紐付ける（後述）

---

## ステップ1: パッケージのインストール

ターミナルでプロジェクトフォルダに移動し、次を実行します。

```bash
cd /Users/jojiyamaguchi/Downloads/cosmetree4
npm install @clerk/nextjs
```

---

## ステップ2: 環境変数（本番・Keyless 以外で使う場合）

Clerk ダッシュボードでアプリを作成したあと、次の2つを `.env.local` に追加します。

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

- **Keyless モード**：上記を設定せずに `npm run dev` すると、Clerk が一時キーで動きます。開発だけならこのままでもOKです。
- **本番**：Clerk のダッシュボードで本番用キーを発行し、Vercel / Netlify の環境変数に同じ名前で設定します。

---

## ステップ3: ミドルウェアでルート保護

`src/middleware.ts` で **`/influencer` 以下をログイン必須**にしています。

- 未ログインで `/influencer` にアクセス → Clerk のサインインページへリダイレクト
- `/`、`/p/*`、`/demo` は認証不要のまま（ファン向け・プレビュー用）

---

## ステップ4: レイアウトに ClerkProvider

`src/app/layout.tsx` のルートで `<ClerkProvider>` で children を包みます。テーマなどは Clerk のドキュメントを参照してカスタム可能です。

---

## ステップ5: トップページの振る舞い

- **未ログイン**：サインイン / サインアップできる画面を表示（またはリダイレクト）
- **ログイン済み**：これまで通り `/influencer/manage` にリダイレクト

---

## ステップ6: プロフィール・リストを「ユーザー」に紐付ける

現在は `username: "demo"` で1ユーザー想定です。Clerk 導入後は次のようにします。

- **Clerk の `userId`**（例: `user_2abc...`）を「その人」の一意な ID として使う
- **Supabase**：`profiles.username` や `list_items.username` に、Clerk の `userId` を保存する
- **ストア（getMyList / getProfile など）**：呼び出し元で `useUser()` から `userId` を取得し、`getMyList(userId)` のように渡す

こうすると「誰がログインしているか」と「誰のプロフィール・リストか」が一致します。公開ページ（`/p/[username]`）は、URL の `username` を **Clerk の userId** ではなく、**公開用のスラグ**（例: `cosmepik`）にしたい場合は、`profiles` に `slug` カラムを追加し、`/p/cosmepik` で検索する形に拡張できます（今回はシンプルに userId のままでも可）。

---

## 実装後の確認

1. `npm run dev` で起動
2. ブラウザで `http://localhost:3000` を開く
3. 未ログインならサインイン/サインアップ画面、ログイン後は管理画面へ遷移することを確認
4. `/influencer/manage` を直接開いたとき、未ログインなら Clerk のサインインに飛ぶことを確認

---

## アカウント連携（サインイン方法の追加）について

**ダッシュボードでの設定手順**と**Google などサインイン方法の追加・同一ユーザーへのリンク**は、別ドキュメントにまとめています。

→ **[Clerkアカウント連携の手順.md](./Clerkアカウント連携の手順.md)** を参照してください。

- アプリ作成と API キー取得
- Google / メールなどサインイン方法の追加
- アカウントリンキング（同じメールで複数ログイン方法を1アカウントにまとめる）
- 本番・Netlify の環境変数

---

## 参考リンク

- [Clerk Next.js クイックスタート](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk ダッシュボード](https://dashboard.clerk.com/)（アカウント作成・キー取得）
