# マッチングアプリ ドキュメント

婚活イベント向けマッチングシステムの参加者用インターフェースです。参加者がQRコードを使ってアクセスし、投票や結果確認を行うためのアプリケーションです。

## 概要

- **ポート**: 3000
- **パス**: `/matching-app`
- **認証**: トークンベース認証（QRコード経由）
- **用途**: イベント参加者向けの投票・結果確認インターフェース

## 技術スタック

- **フレームワーク**: Next.js 15.3.1 (App Router)
- **UI**: react-hook-form + zod
- **データベース**: Supabase (PostgreSQL)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **パッケージマネージャー**: pnpm

## 環境変数

`/matching-app/.env.local`ファイルに以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 開発環境のセットアップ

```bash
# matching-appディレクトリに移動
cd matching-app

# 依存関係のインストール
pnpm install

# 開発サーバーの起動（ポート3000）
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバーの起動
pnpm start

# リンティング
pnpm lint
pnpm lint:fix

# コードフォーマット
pnpm format
```

## アプリケーション構造

```
/matching-app
  /src
    /app                    # App Router構造
      /api                  # API Route Handlers
        /participants
          /route.ts
          /validate/route.ts
        /votes
          /interim/route.ts
          /final/route.ts
        /results
          /route.ts
      /register             # 参加者登録
        /[token]/page.tsx
      /vote                 # 投票ページ
        /page.tsx
      /results              # 結果表示
        /page.tsx
      MatchingAppLayout.tsx # マッチングアプリ用レイアウト
      layout.tsx
      page.tsx
    /components             # UIコンポーネント
      /VoteClient.tsx
      /ResultClient.tsx
      /SeatingPlanViewer.tsx
    /lib                    # ユーティリティ関数
      /db
        /database.types.ts  # Supabase型定義
        /supabase.ts
        /queries.ts
      /utils
        /validation.ts
      /errors
        /RedirectError.ts   # エラーハンドリング
    /public
      /logo.png             # ロゴ画像
```

## 主な機能

### 参加者登録
- QRコードスキャン後の自動登録
- トークンによる認証
- セッションストレージでの情報保持

### 投票機能
- **中間投票**: 初回の気になる異性を最大3名まで選択
- **最終投票**: 席替え後の気になる異性を最大3名まで選択
- リアルタイムでの投票状態確認
- 投票済みの場合は再投票不可

### 結果表示
- 席替えプランの表示（中間投票後）
- 最終マッチング結果の表示
- カップル成立の確認

## 使い方（参加者向け）

1. **QRコードのスキャン**
   - イベント主催者から配布されたQRコードをスキャン
   - 自動的に参加者登録ページへリダイレクト

2. **参加者情報の確認**
   - 名前と参加者番号が表示される
   - 「投票画面へ」ボタンをクリック

3. **中間投票**
   - 気になった異性の参加者番号を最大3名まで入力
   - 「投票する」ボタンで送信
   - 投票完了後は結果待ち画面へ

4. **席替えプランの確認**
   - 主催者が席替えプランを生成すると自動表示
   - 新しい座席位置を確認

5. **最終投票**
   - 席替え後、再度気になった異性を最大3名まで選択
   - 「投票する」ボタンで送信

6. **マッチング結果の確認**
   - カップル成立の有無を確認
   - マッチング相手の情報を表示

## API エンドポイント

### 参加者関連
- `GET /api/participants?token=xxx` - 参加者情報取得
- `POST /api/participants/validate` - トークン検証

### 投票関連
- `POST /api/votes/interim` - 中間投票送信
- `POST /api/votes/final` - 最終投票送信

### 結果関連
- `GET /api/results?participantId=xxx` - 結果取得（席替えプラン、マッチング結果）

## セキュリティ

- トークンベース認証による参加者の識別
- セッションストレージを使用した一時的な情報保持
- 各参加者は自分の情報と結果のみアクセス可能
- 重複投票の防止機能

## エラーハンドリング

- 無効なトークンの場合はエラーページへリダイレクト
- ネットワークエラー時の適切なエラーメッセージ表示
- 投票済みの場合の警告表示

## ユーザビリティ

- モバイルファーストのレスポンシブデザイン
- 大きめのボタンとフォントサイズ
- シンプルで直感的なUI
- ローディング状態の明確な表示