# Cosmetree（コスメ版リンクツリー）MVP

インフルエンサーが愛用コスメを検索・選択し、ファン向けの公開ページを作成できるプロトタイプです。  
現在は **ダミーデータ** と **localStorage** で動作し、楽天API・Supabase連携は未実装です。

## フォルダ構成

```
cosmetree4/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 共通レイアウト
│   │   ├── globals.css         # 全体スタイル（Tailwind・デパコス風カラー）
│   │   ├── page.tsx            # トップ（各画面へのリンク）
│   │   ├── influencer/
│   │   │   ├── search/
│   │   │   │   └── page.tsx    # 【インフルエンサー】検索・追加画面
│   │   │   └── manage/
│   │   │       └── page.tsx    # 【インフルエンサー】管理画面（一覧・並び替え・削除）
│   │   ├── [username]/
│   │   │   └── page.tsx        # 【ファン向け】公開プロフィールページ
│   │   └── demo/
│   │       └── page.tsx        # 公開ページのデモ（/demo）
│   ├── components/
│   │   ├── CosmeCard.tsx       # 検索結果の商品カード
│   │   └── AddCommentModal.tsx # 愛用コメント入力モーダル
│   ├── lib/
│   │   ├── mock-data.ts        # ダミーコスメデータ（検索用）
│   │   └── local-storage.ts    # リストの永続化（localStorage）
│   └── types/
│       └── index.ts            # CosmeItem, ListedCosmeItem, InfluencerProfile
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、トップから各画面へ遷移してください。

## 実装済み画面

1. **インフルエンサー：検索・追加** (`/influencer/search`)  
   検索窓に「ファンデーション」「SHISEIDO」などを入力するとダミー候補が表示され、「リストに追加」→ 愛用コメント入力モーダル → 「公開リストに追加」でマイリストに保存（localStorage）されます。

2. **インフルエンサー：管理画面** (`/influencer/manage`)  
   追加したコスメの一覧表示、並び替え（↑↓）、削除。公開ページのプレビューリンクあり。

3. **ファン向け：公開プロフィール** (`/demo` または `/[username]`)  
   白・ベージュ・ゴールド基調のミニマルなデザイン。各商品に「楽天で購入」「Amazonで購入」ボタン（現状はダミーURL）。

## 技術スタック

- **UI:** Next.js (App Router), React, Tailwind CSS
- **データ:** `lib/mock-data.ts` のダミー + `localStorage`（将来 Supabase に置き換え想定）
- **画像:** placehold.co のプレースホルダー（`next.config.ts` で許可済み）

## 今後の拡張

- 楽天API 連携で実商品検索
- Supabase でユーザー・リストを永続化
- `/[username]` をDBから取得して公開ページを表示
