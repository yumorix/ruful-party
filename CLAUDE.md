# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

婚活イベント向けのマッチングアプリケーションで、2つのNext.jsアプリケーションで構成されています：
- **管理者アプリ** (`/admin`) - イベント管理インターフェース（ポート3100）
- **マッチングアプリ** (`/matching-app`) - 参加者インターフェース（ポート3000）

## 開発コマンド

### 管理者アプリ (cd admin/)
```bash
pnpm dev        # 開発サーバーをポート3100で起動
pnpm build      # プロダクションビルド
pnpm lint       # ESLintを実行
pnpm lint:fix   # リンティングエラーを自動修正
pnpm format     # Prettierでコードをフォーマット
pnpm migration:local # ローカルマイグレーションを実行し、型を生成
```

### マッチングアプリ (cd matching-app/)
```bash
pnpm dev        # 開発サーバーをポート3000で起動
pnpm build      # プロダクションビルド
pnpm lint       # ESLintを実行
pnpm lint:fix   # リンティングエラーを自動修正
pnpm format     # Prettierでコードをフォーマット
```

### データベース操作
```bash
# プロジェクトルートから
supabase migration new {説明}  # 新しいマイグレーションを作成
supabase db reset             # データベースをリセット
supabase db push              # マイグレーションを適用

# TypeScript型を生成（各アプリディレクトリから実行）
supabase gen types typescript --local > src/lib/db/database.types.ts
```

## アーキテクチャ概要

### 技術スタック
- **フレームワーク**: Next.js 15.3.1 (App Router使用)
- **言語**: TypeScript (strictモード)
- **スタイリング**: Tailwind CSS v4
- **データベース**: Supabase (PostgreSQL 15)
- **AI**: マッチングアルゴリズム用のGoogle Gemini AI
- **フォーム**: react-hook-form + Zodバリデーション
- **ID**: ユニーク識別子にULIDを使用

### 主要なアーキテクチャパターン

1. **データベーススキーマ** (6つの主要テーブル):
   - `parties` - イベントメタデータ
   - `participants` - アクセストークン付きユーザーデータ
   - `votes` - 投票記録（中間/最終フェーズ）
   - `party_settings` - イベント設定
   - `matches` - AI生成のマッチング結果
   - `seating_plans` - AI最適化された座席配置

2. **認証フロー**:
   - カスタムトークンベース認証（Supabase Authは不使用）
   - 管理者: 環境変数による基本認証
   - 参加者: QRコード → ユニークトークン → セッションストレージ

3. **AI統合** (`/src/lib/ai/`):
   - `geminiClient.ts` - Gemini APIクライアントラッパー
   - `seatingEngine.ts` - 投票に基づく最適な座席配置を生成
   - `matchingEngine.ts` - 最終的なマッチングペアを作成
   - 異なるシナリオ（年齢の好み、性別バランス）用のカスタムプロンプト

4. **アプリケーションフロー**:
   ```
   管理者がパーティーを作成 → QRコードを生成 → 参加者がQRをスキャン
   → 中間投票 → AI座席配置 → 最終投票 → AIマッチング
   → 結果表示
   ```

5. **コード構成**:
   - `/src/app/` - ページとAPIルート（App Router）
   - `/src/components/` - 機能別に整理されたUIコンポーネント
   - `/src/lib/` - コアユーティリティ:
     - `/db/` - データベースクエリと型
     - `/ai/` - AIマッチングエンジン
     - `/validations/` - Zodスキーマ
   - `/src/app/actions/` にサーバーアクション

### 重要な環境変数
- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY` - 管理操作用のサービスロールキー
- `BASIC_AUTH_USERNAME/PASSWORD` - 管理パネル認証
- `GEMINI_API_KEY` - Google Gemini AI APIキー
- `NEXT_PUBLIC_QR_SERVER_DOMAIN` - QRコード生成用ドメイン

### 開発メモ
- 両アプリとも高速な開発ビルドのためにTurbopackを使用
- 現在テストフレームワークは設定されていない
- コミット前にリンティングとフォーマッティングを実行すること
- データベースマイグレーションはローカルと本番環境の両方に適用する必要がある
- 型はデータベーススキーマから生成される - スキーマ変更後は再生成すること


## Claude Codeを利用した開発
- 実装後には必ずdocsの関連するファイルに変更点を追記してください。