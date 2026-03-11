# Stripe プレミアムプラン セットアップ手順

## 1. Stripe アカウント作成

1. [Stripe](https://dashboard.stripe.com) にログイン（または新規登録）
2. テストモードで開発（本番は後で切り替え）

## 2. 商品・価格の作成

1. Stripe ダッシュボード → **商品** → **商品を追加**
2. 例：
   - 名前: `プレミアムプラン`
   - 説明: `バナー広告消去・ロゴ消去・限定壁紙`
   - 価格: 月額 980円 など（お好みで）
   - 請求: **定期**
3. 作成後、**価格 ID**（`price_xxxxx`）をコピー

## 3. 環境変数の設定

`.env.local` に追加：

```
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

- **Secret Key / Publishable Key**: ダッシュボード → 開発者 → API キー
- **Price ID**: 上記で作成した価格の ID
- **Webhook Secret**: 次のステップで取得

## 4. Webhook の設定

### ローカル開発

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

表示される `whsec_xxxxx` を `STRIPE_WEBHOOK_SECRET` に設定。

### 本番（Netlify など）

1. Stripe ダッシュボード → **開発者** → **Webhook**
2. **エンドポイントを追加**
3. URL: `https://あなたのドメイン/api/stripe/webhook`
4. イベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. 署名シークレットをコピー → Netlify の環境変数 `STRIPE_WEBHOOK_SECRET` に設定

## 5. Supabase マイグレーション

Supabase ダッシュボード → SQL Editor で実行：

```sql
-- supabase/migrations/20250309000000_stripe_subscriptions.sql の内容を実行
```

または `supabase db push` でマイグレーション適用。

## 6. 動作確認

1. 設定画面（`/dashboard/settings`）で「プレミアムにアップグレード」をクリック
2. Stripe Checkout にリダイレクト
3. テストカード `4242 4242 4242 4242` で決済
4. 成功後、`user_subscriptions` テーブルに `stripe_subscription_status: active` が保存される
