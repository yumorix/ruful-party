# 婚活イベント マッチングアプリ

複数パーティ対応の婚活イベント向けマッチングシステムです。参加者間の「気になる人」投票を収集し、AIを活用して最適な席替えやマッチング結果を提供します。QRコードによる簡易アクセス方式を採用し、イベント運営をスムーズにします。

## 機能

- 複数パーティを個別に作成・管理
- パーティごとの参加者登録
- パーティごとのマッチング設定
- 中間マッチング投票と席替え案の生成
- 最終マッチング投票とカップル組み合わせの決定
- QRコードによる参加者アクセス

## 技術スタック

- フロントエンド：Next.js (App Router）、MUI、react-hook-form + zod
- バックエンド：Next.js Route Handlers
- データベース：Supabase
- デプロイ：Vercel

## 開発環境のセットアップ

### 前提条件

- Node.js 18.0.0以上
- pnpm 8.0.0以上
- Supabaseアカウント

### インストール

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

### 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください。

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## アプリケーション構造

```
/src
  /app                      # App Router構造
    /api                    # API Route Handlers
      /parties
        /[partyId]/route.ts
        /route.ts
      /vote
        /validate/route.ts
        /submit/route.ts
      /admin
        /participants/route.ts
        /settings/route.ts
        /matching/route.ts
    /admin                  # 管理者ページ
      /page.tsx
      /parties              # パーティ管理
        /page.tsx
        /new/page.tsx
        /[partyId]/page.tsx
        /[partyId]/participants/page.tsx
        /[partyId]/settings/page.tsx
        /[partyId]/matching/page.tsx
  /components               # UIコンポーネント
    /admin
      /PartyForm.tsx
      /PartyList.tsx
      /ParticipantForm.tsx
      /SettingForm.tsx
      /QRCodeGenerator.tsx
  /lib                      # ユーティリティ関数
    /ai
      /matchingEngine.ts
      /seatingPlanner.ts
    /db
      /supabase.ts
      /queries.ts
    /utils
      /token.ts             # トークン処理
      /validation.ts        # バリデーション
```

## 使い方

### 管理者

1. `/admin/parties`にアクセスして、新しいパーティを作成します。
2. パーティの詳細ページから参加者を追加します。
3. 参加者のQRコードを生成し、印刷または配布します。
4. パーティの設定ページでマッチングルールを設定します。
5. パーティ開催中に、マッチング管理ページから投票モードを切り替えます。
6. 投票結果を元にマッチングを生成します。

### 参加者

1. QRコードをスキャンしてアプリにアクセスします。
2. 中間投票で気になった異性の参加者番号を選択します（最大3人）。
3. 席替え後、最終投票で気になった異性の参加者番号を選択します（最大3人）。
4. 最終マッチング結果を確認します。

## データベース構造

- **parties**: パーティ情報
- **participants**: 参加者情報
- **votes**: 投票情報
- **party_settings**: パーティごとの設定
- **matches**: マッチング結果
- **seating_plans**: 席替え計画

## ライセンス

MIT
