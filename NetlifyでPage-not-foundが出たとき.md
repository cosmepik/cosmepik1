# Netlify で「Page not found」が出たときの対処

## 1. やること（順番に試す）

### ① Netlify の「Framework」が Next.js になっているか

1. Netlify ダッシュボードで対象サイトを開く  
2. **Site configuration** → **Build & deploy** → **Build settings** を開く  
3. **Framework detection** または **Build settings** で、**「Next.js」** が選ばれているか確認する  
4. もし **「Static site」** や **「None」** になっていたら、**「Edit settings」** で **「Next.js」** を選び直す（または「Detect automatically」にして保存）  
5. **Deploy site** で再デプロイする  

Next.js でない設定のままビルドすると、サーバー側のルーティングが動かず、ほぼすべてのパスで「Page not found」になります。

---

### ② ビルドコマンドと公開ディレクトリ

1. **Build settings** の **Build command** を確認  
   - **空** または **`npm run build`** または **`next build`** なら OK  
   - 別のコマンド（例: `npm run build:static`）になっていたら、**`npm run build`** に変更  

2. **Publish directory** を確認  
   - **空** のままがおすすめ（Netlify の Next.js 用アダプターが自動で正しいディレクトリを使います）  
   - **`.next`** だけを指定している場合は、**空** にしてみる  
   - **`out`** や **`dist`** など、このプロジェクトにないフォルダになっていたら **空** に変更  

3. 変更したら **Trigger deploy** で再デプロイする  

---

### ③ リポジトリに netlify.toml を入れて再デプロイ

このリポジトリには **`netlify.toml`** を入れてあります。

- **Build command:** `npm run build`  
- **Node のバージョン:** 20  

Netlify はこのファイルを読んでビルドするので、**最新のコードを GitHub に push したうえで**、Netlify の **Deploy site**（または **Trigger deploy**）を実行してください。

```bash
git add netlify.toml
git commit -m "Add Netlify config for Next.js"
git push
```

---

### ④ ビルドログでエラーが出ていないか

1. Netlify の **Deploys** タブを開く  
2. 直近のデプロイをクリック → **Build log** を開く  
3. 最後まで **Failed** や **Error** が出ていないか確認する  

- **Build failed** のときは、ログの赤い部分（エラーメッセージ）をコピーして、検索したりサポートに貼ると原因を特定しやすいです。  
- **Build succeeded** なのに「Page not found」のときは、ほぼ **① の Framework 設定** か **② の Publish directory** が原因です。  

---

## 2. このプロジェクトの動き（参考）

- トップ (`/`) にアクセスすると、Next.js の **サーバー側リダイレクト** で `/influencer/manage` に飛びます。  
- `/influencer/manage` や `/demo` などは、Next.js の **App Router** でサーバー／クライアントの両方で処理されます。  

そのため、Netlify 側で **「Next.js としてビルド・実行されている」** ことが必須です。  
Framework が「Static site」のままでは、どのURLを開いても「Page not found」になりやすいです。

---

## 3. それでも直らないとき

- **Deploys** の **Build log** の最後 20〜30 行をコピーして、原因を一緒に確認できます。  
- Netlify の **Functions** や **Edge** は、このプロジェクトでは使っていないので、まずは **Build settings** と **netlify.toml** の確認で大丈夫です。
