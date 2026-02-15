# GitHub に上げてデプロイする手順

このプロジェクトを GitHub にプッシュし、Vercel で公開するまでの流れです。

---

## 前提

- **Git** が入っていること（ターミナルで `git --version` で確認）
- **GitHub のアカウント**があること
- まだの場合は [GitHub](https://github.com/) で無料登録

---

## ステップ1: リポジトリを GitHub で作る

1. [GitHub](https://github.com/) にログイン
2. 右上の **「+」** → **「New repository」**
3. 次のように入力：
   - **Repository name:** `cosmetree4`（任意の名前でOK）
   - **Public** を選択
   - **「Add a README file」** は付けなくてOK（ローカルに既にあるため）
4. **「Create repository」** をクリック
5. 作成されたページの **「…or push an existing repository from the command line」** のところに、次のようなコマンドが表示されます（ユーザー名・リポジトリ名はあなたのものに置き換わります）：
   ```bash
   git remote add origin https://github.com/あなたのユーザー名/cosmetree4.git
   git branch -M main
   git push -u origin main
   ```
   この画面は開いたままにしておきます。

---

## ステップ2: ローカルで Git を初期化してプッシュする

Cursor のターミナル（または Mac のターミナル）で、**プロジェクトのフォルダに移動**してから、次のコマンドを **順番に** 実行します。

```bash
cd /Users/jojiyamaguchi/Downloads/cosmetree4
```

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit: Cosmetree MVP"
```

```bash
git branch -M main
```

次に、**ステップ1で作ったリポジトリのURL** を指定してリモートを追加します（`あなたのユーザー名` と `リポジトリ名` を自分のものに書き換えてください）。

```bash
git remote add origin https://github.com/あなたのユーザー名/cosmetree4.git
```

例：ユーザー名が `tanaka` でリポジトリ名が `cosmetree4` の場合  
`git remote add origin https://github.com/tanaka/cosmetree4.git`

```bash
git push -u origin main
```

- 初回は GitHub の **ユーザー名** と **パスワード** を聞かれることがあります。  
  パスワードの代わりに **Personal Access Token** を使う必要がある場合があります（下記「認証でエラーになる場合」を参照）。

ここまでで、コードが GitHub のリポジトリにアップロードされた状態になります。

---

## ステップ3: Vercel でデプロイする（サイトを公開する）

Next.js は **Vercel** を使うと無料で簡単にデプロイできます。

1. [Vercel](https://vercel.com/) を開く
2. **「Sign Up」** または **「Log in」** で、**「Continue with GitHub」** を選んで GitHub と連携
3. ログイン後、**「Add New…」** → **「Project」**
4. **「Import Git Repository」** で、さきほどプッシュした **cosmetree4**（または付けた名前）のリポジトリを選ぶ
5. **Framework Preset** に **Next.js** と出ていればそのままでOK
6. **「Deploy」** をクリック
7. 数十秒待つと、**「Congratulations」** と表示され、**本番のURL**（例: `https://cosmetree4-xxxx.vercel.app`）が表示されます

このURLが「デプロイしたサイト」のアドレスです。ブラウザで開いて動作を確認できます。

---

## このあとコードを直したとき

1. 変更を保存したあと、ターミナルで：
   ```bash
   cd /Users/jojiyamaguchi/Downloads/cosmetree4
   git add .
   git commit -m "説明を書く（例: プロフィール項目を追加）"
   git push
   ```
2. GitHub にプッシュすると、Vercel が自動で再デプロイし、数分で本番サイトが更新されます。

---

## 認証でエラーになる場合（git push で）

GitHub はパスワードでの push を廃止しているため、**Personal Access Token** を使います。

1. GitHub で **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **「Generate new token (classic)”」**
3. **Note:** 例）`cosmetree push`
4. **Expiration:** 90 days など
5. **repo** にチェック
6. **「Generate token」** で作成し、表示されたトークンを **コピー**（あとで見られないので注意）
7. `git push` でパスワードを聞かれたら、**そのトークンをペースト**して Enter

---

## まとめ

| やりたいこと           | やること                         |
|------------------------|----------------------------------|
| コードを GitHub に上げる | ステップ1 + ステップ2            |
| サイトを公開する       | ステップ2のあと + ステップ3（Vercel） |

「GitHubにデプロイ」＝ **GitHub にプッシュ** ＋ **Vercel でデプロイ** という流れです。
