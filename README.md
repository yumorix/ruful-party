# 婚活イベント マッチングアプリ

複数パーティ対応の婚活イベント向けマッチングシステムです。参加者間の「気になる人」投票を収集し、AIを活用して最適な席替えやマッチング結果を提供します。QRコードによる簡易アクセス方式を採用し、イベント運営をスムーズにします。

このシステムは2つの独立したNext.jsアプリケーションで構成されています：
- **管理者アプリ** (`/admin`) - イベント主催者向けの管理インターフェース（ポート3100）
- **マッチングアプリ** (`/matching-app`) - 参加者向けの投票・結果確認インターフェース（ポート3000）

## 機能

- 複数パーティを個別に作成・管理
- パーティごとの参加者登録・削除
- パーティごとのマッチング設定
- 中間マッチング投票と席替え案の生成
- 最終マッチング投票とカップル組み合わせの決定
- QRコードによる参加者アクセス

## 技術スタック

- フロントエンド：Next.js (App Router）、MUI、react-hook-form + zod
- バックエンド：Next.js Route Handlers
- データベース：Supabase (PostgreSQL)
- AI：Google Gemini AI (gemini-2.0-flash-001) - マッチング・座席配置の最適化
- デプロイ：Vercel
- 開発言語：TypeScript
- スタイリング：Tailwind CSS
- パッケージマネージャー：pnpm
- ID生成：ULID (Universally Unique Lexicographically Sortable Identifier)
- QRコード：qrcode ライブラリ

### Supabase 構成

- **認証**: Supabaseの認証機能は使用せず、独自のトークンベース認証を実装
- **データベース**: PostgreSQL 15
- **型安全性**: Supabase型定義を使用したTypeScriptの完全な型安全性
- **マイグレーション**: SQLベースのマイグレーションファイル

## マイグレーション方法

このプロジェクトではSupabaseのマイグレーション機能を使用してデータベーススキーマを管理しています。

### マイグレーションファイル

マイグレーションファイルは `supabase/migrations` ディレクトリに保存されています。各ファイルは以下の命名規則に従います：

```
{timestamp}_{description}.sql
```

例: `20250428025858_initial.sql`

### 新しいマイグレーションの作成

1. Supabase CLIをインストールします（まだの場合）:
   ```bash
   npm install -g supabase
   ```

2. 新しいマイグレーションファイルを作成します:
   ```bash
   supabase migration new {description}
   ```

3. 生成されたSQLファイルにスキーマの変更を記述します。

### マイグレーションの適用

ローカル開発環境でマイグレーションを適用するには:

```bash
supabase db reset
```

または、特定のマイグレーションまで適用するには:

```bash
supabase db reset --target-version {version}
```

### 本番環境へのデプロイ

Vercelへのデプロイ時に、Supabaseプロジェクトに対してマイグレーションを適用します:

```bash
supabase db push
```

### 型の生成

データベーススキーマから最新のTypeScript型定義を生成するには:

```bash
supabase gen types typescript --local > src/lib/db/database.types.ts
```

## 開発環境のセットアップ

### 前提条件

- Node.js 18.0.0以上
- pnpm 8.0.0以上
- Supabaseアカウント

### インストール

```bash
# プロジェクトルートから両アプリの依存関係をインストール
pnpm install

# 管理者アプリの起動（ポート3100）
cd admin
pnpm dev

# マッチングアプリの起動（ポート3000）- 別のターミナルで
cd matching-app
pnpm dev
```

両方のアプリを同時に起動することで、完全な開発環境が構築されます。

### 環境変数の設定

各アプリケーションのディレクトリに`.env.local`ファイルを作成し、以下の環境変数を設定してください。

#### 管理者アプリ (`/admin/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BASIC_AUTH_USERNAME=admin-username
BASIC_AUTH_PASSWORD=admin-password
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_QR_SERVER_DOMAIN=your-qr-server-domain
```

#### マッチングアプリ (`/matching-app/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## アプリケーション構造

プロジェクトは2つの独立したNext.jsアプリケーションで構成されています：

### 管理者アプリ (`/admin`)
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

### マッチングアプリ (`/matching-app`)
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

## 使い方

### 管理者

1. `http://localhost:3100/parties`にアクセスして、新しいパーティを作成します（基本認証が必要）。
2. パーティの詳細ページから参加者を追加します。
3. 参加者のQRコードを生成し、印刷または配布します。
4. パーティの設定ページでマッチングルールを設定します。
5. パーティ開催中に、マッチング管理ページから投票モードを切り替えます。
6. AI機能を使用して席替えプランを生成し、投票結果を元に最終マッチングを生成します。

### 参加者

1. QRコードをスキャンしてアプリにアクセスします。
2. 中間投票で気になった異性の参加者番号を選択します（最大3人）。
3. 席替え後、最終投票で気になった異性の参加者番号を選択します（最大3人）。
4. 最終マッチング結果を確認します。

### 参加者の削除

1. 参加者一覧ページから削除ボタンをクリックします。
2. または、参加者詳細ページから削除ボタンをクリックします。
3. 確認ダイアログで「削除」をクリックすると参加者が削除されます。

## データベース構造

- **parties**: パーティ情報
- **participants**: 参加者情報
- **votes**: 投票情報
- **party_settings**: パーティごとの設定
- **matches**: マッチング結果
- **seating_plans**: 席替え計画

## 開発者向け情報

このプロジェクトには`CLAUDE.md`ファイルが含まれており、Claude Code (claude.ai/code) を使用して開発を行う際のガイドラインと、プロジェクトのアーキテクチャに関する詳細な情報が記載されています。
