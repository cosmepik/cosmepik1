graph TD
    %% 一般公開エリア
    Top[トップページ / LP] --> Price[料金プラン / lit.link Plus]
    Top --> Usage[使い方ガイド]
    Top --> FAQ[よくある質問]
    Top --> Contact[お問い合わせ]
    
    %% 認証フロー
    Top --> Register[新規登録画面]
    Top --> Login[ログイン画面]
    
    Register --> Onboarding[初期設定ウィザード]
    Login --> Dashboard[管理ダッシュボード]
    Onboarding --> Dashboard
    
    %% 管理・編集エリア
    subgraph Dashboard_Area [管理・編集モード]
        Dashboard <--> EditMode[編集画面 / ライブプレビュー]
        EditMode --> BlockAdd[ブロック追加 / 編集メニュー]
        BlockAdd --> LinkBlock[リンク/画像/動画/音楽等]
        EditMode --> Design[デザイン設定 / テンプレート]
        Dashboard --> Settings[アカウント設定 / プロフィール編集]
        Dashboard --> Analytics[アナリティクス / アクセス解析]
    end
    
    %% 公開エリア
    EditMode -- 公開保存 --> PublishedPage[公開プロフィールページ @ID]
    Dashboard -- URL確認 --> PublishedPage
    
    PublishedPage --> External[各SNS・外部サイトへ遷移]


    1. 一般公開エリア（未ログイン）
トップページ (LP): サービスの概要説明、新規登録・ログインボタンが配置されています。

使い方 / FAQ: 初心者向けのガイドやトラブルシューティング。

2. 認証・オンボーディング
新規登録: LINE連携、またはメールアドレスでの登録が選べます。

初期設定: 最初に「URLの決定」や「ジャンル選択」を行い、ベースとなるデザインを決定します。

3. 管理・編集エリア（ログイン後）
管理ダッシュボード: 自分のページの管理や、有料プランへの切り替え、統計の確認などを行うハブとなる画面です。

編集画面 (Edit Mode): 「見たまま編集」画面。スイッチを「編集」に切り替えることで、各パーツ（ブロック）の追加や並び替えができます。

ブロック編集メニュー: 、追加したいコスメを選択するポップアップや遷移先。

4. 公開プロフィールページ
ユーザーページ (サービスドメイン/@ユーザー名): 実際に外部からアクセスされるページです。インフルエンサーが自分のコスメ群をファンに公開でき、ここからコスメの販売ページへファンを飛ばします