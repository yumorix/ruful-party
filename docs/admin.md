# 管理者アプリ ドキュメント

婚活イベント向けマッチングシステムの管理者用インターフェースです。イベント主催者がパーティーの作成、参加者の管理、マッチング結果の生成を行うためのアプリケーションです。

## 概要

- **ポート**: 3100
- **パス**: `/admin`
- **認証**: Basic認証（環境変数で設定）
- **用途**: イベント主催者向けの管理インターフェース

## 技術スタック

- **フレームワーク**: Next.js 15.3.1 (App Router)
- **UI**: MUI、react-hook-form + zod
- **データベース**: Supabase (PostgreSQL)
- **AI**: Google Gemini AI (gemini-2.0-flash-001)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **ID生成**: ULID
- **QRコード**: qrcode ライブラリ

## 環境変数

`/admin/.env.local`ファイルに以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BASIC_AUTH_USERNAME=admin-username
BASIC_AUTH_PASSWORD=admin-password
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_QR_SERVER_DOMAIN=your-qr-server-domain
```

## 開発環境のセットアップ

```bash
# adminディレクトリに移動
cd admin

# 依存関係のインストール
pnpm install

# 開発サーバーの起動（ポート3100）
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

# マイグレーションと型生成
pnpm migration:local
```

## アプリケーション構造

```
/admin
  /src
    /app                    # App Router構造
      /api                  # API Route Handlers
        /parties
          /[partyId]/route.ts
          /[partyId]/delete/route.ts
          /[partyId]/participants/[participantId]/route.ts
          /route.ts
        /vote
          /validate/route.ts
          /submit/route.ts
        /admin
          /participants/route.ts
          /participants/[participantId]/route.ts
          /settings/route.ts
          /matching/route.ts
          /seating-plan/route.ts
      /parties              # パーティ管理ページ
        /page.tsx
        /new/page.tsx
        /[partyId]/page.tsx
        /[partyId]/participants/page.tsx
        /[partyId]/participants/[participantId]/page.tsx
        /[partyId]/participants/[participantId]/edit/page.tsx
        /[partyId]/participants/new/page.tsx
        /[partyId]/settings/page.tsx
        /[partyId]/matching/page.tsx
      AdminLayout.tsx       # 管理者用レイアウト
      layout.tsx
      page.tsx
    /components             # UIコンポーネント
      /admin
        /PartyForm.tsx
        /PartyListClient.tsx
        /ParticipantForm.tsx
        /DeleteParticipantButton.tsx
        /DeletePartyButton.tsx
        /DeleteModal.tsx
        /SettingForm.tsx
        /QRCodeGenerator.tsx
        /GenerateFinalMatchingButton.tsx
        /GenerateSeatingPlanButton.tsx
        /SeatingPlanViewer.tsx
        /TableConfigEditor.tsx
    /lib                    # ユーティリティ関数
      /ai
        /gemini.ts          # Gemini AIクライアント
        /geminiClient.ts
        /matchingEngine.ts
        /seatingEngine.ts
        /prompts/           # AIプロンプトテンプレート
      /db
        /database.types.ts  # Supabase型定義
        /supabase.ts
        /queries.ts
      /utils
        /token.ts           # トークン処理
        /validation.ts      # バリデーション
        /constants.ts
```

## 主な機能

### パーティー管理
- 新規パーティーの作成
- パーティー情報の編集・削除
- パーティー一覧の表示

### 参加者管理
- 参加者の追加・編集・削除
- 参加者番号の自動採番
- QRコードの生成（参加者のアクセストークン付き）

### マッチング設定
- 男女別の参加者数設定
- 年齢の考慮有無
- テーブル配置設定（行数・列数）
- カップル成立の条件設定

### AI機能
- **席替えプラン生成**: 中間投票結果を基に、Gemini AIが最適な座席配置を提案
- **最終マッチング生成**: 最終投票結果を基に、Gemini AIが最適なカップルペアを生成

### 投票管理
- 投票フェーズの管理（中間投票・最終投票）
- 投票結果の集計・表示
- リアルタイムでの投票状況確認

## 使い方

1. **パーティーの作成**
   - `http://localhost:3100/parties`にアクセス（Basic認証が必要）
   - 「新しいパーティーを作成」ボタンをクリック
   - パーティー名、開催日時、場所を入力

2. **参加者の登録**
   - パーティー詳細ページから「参加者を追加」
   - 名前、性別、年齢を入力
   - 参加者番号は自動的に割り当てられる

3. **QRコードの生成**
   - 参加者一覧から個別のQRコードを生成
   - 印刷または配布用に保存

4. **マッチング設定**
   - パーティー設定ページでルールを設定
   - テーブル配置、年齢考慮などを調整

5. **投票フェーズの管理**
   - マッチング管理ページから投票モードを切り替え
   - 「中間投票開始」→「席替えプラン生成」→「最終投票開始」→「マッチング生成」

6. **結果の確認**
   - AI生成の席替えプランを確認
   - 最終的なマッチング結果を表示

## API エンドポイント

### パーティー関連
- `GET /api/parties` - パーティー一覧取得
- `POST /api/parties` - 新規パーティー作成
- `GET /api/parties/[partyId]` - パーティー詳細取得
- `PUT /api/parties/[partyId]` - パーティー情報更新
- `DELETE /api/parties/[partyId]/delete` - パーティー削除

### 参加者関連
- `GET /api/admin/participants?partyId=xxx` - 参加者一覧取得
- `POST /api/admin/participants` - 参加者追加
- `GET /api/admin/participants/[participantId]` - 参加者詳細取得
- `PUT /api/admin/participants/[participantId]` - 参加者情報更新
- `DELETE /api/admin/participants/[participantId]` - 参加者削除

### マッチング関連
- `POST /api/admin/settings` - マッチング設定更新
- `POST /api/admin/matching` - 投票フェーズ切り替え
- `POST /api/admin/seating-plan` - 席替えプラン生成

## セキュリティ

- Basic認証による管理画面へのアクセス制限
- Supabase Service Role Keyを使用した管理者権限での操作
- 参加者トークンはULIDで生成され、推測困難