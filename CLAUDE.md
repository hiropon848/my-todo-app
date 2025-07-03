# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要
Next.js 15 + TypeScript + Supabaseを使用したToDoアプリケーション。ガラスモーフィズムUIと洗練されたアニメーションが特徴。

## 技術スタック
- **フロントエンド**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **スタイリング**: TailwindCSS 3.4 + ガラスモーフィズムデザイン
- **バックエンド**: Supabase (PostgreSQL + Authentication + RLS)
- **アニメーション**: Framer Motion 12.18
- **アイコン**: SVG Components（@svgr/webpack）
- **品質管理**: ESLint + TypeScript strict mode

## 主要コマンド
```bash
npm run dev        # 開発サーバー起動 (http://localhost:3000)
npm run build      # 本番ビルド
npm run start      # 本番サーバー起動
npm run lint       # ESLintチェック
npx tsc --noEmit   # TypeScriptコンパイルチェック
```

## アーキテクチャ構成

### フロントエンド構造
- **App Router** (Next.js 15): `/app`ディレクトリベースのルーティング
- **コンポーネント**: `/components`に配置、カテゴリごとに整理
- **カスタムフック**: `/hooks`でビジネスロジックを分離
- **型定義**: `/types`で一元管理
- **ユーティリティ**: `/lib`にSupabaseクライアントなど

### 状態管理パターン
```typescript
// 非同期処理の統一パターン
const result = await someAsyncFunction();
if (result.success) {
  // 成功処理
} else {
  showToast(result.error || 'エラーが発生しました', 'error');
}
```

### UIパターン
- **アニメーション時間**: 300msで統一
- **モーダル管理**: `showModal`状態で制御
- **トースト通知**: 全てのユーザーフィードバックで使用
- **ガラスモーフィズム**: `background: rgba(255, 255, 255, 0.15)` + `backdrop-filter: blur(10px)`

### フォームバリデーションパターン
```typescript
// リアルタイムバリデーション + フォーカス離脱時厳密チェック
const validateField = (value: string, blur = false) => {
  if (blur && value === '') {
    setFieldError('必須項目です');
    return;
  }
  // リアルタイムバリデーション
  setFieldError('');
};
```

## データベース構造
最近の命名規則統一により、以下のテーブル構造に変更済み：
- `todos`: ToDo管理のメインテーブル
- `todo_priorities`: 優先度管理
- `todo_statuses`: ステータス管理
- `profiles`: ユーザープロフィール管理（姓・名）

### マスタデータの詳細構造

#### todo_priorities（優先度マスタ）
```sql
-- 初期データ
INSERT INTO todo_priorities (name, display_order, color_code) VALUES
('高', 1, '#FF3B30'),    -- 赤色
('中', 2, '#FF9500'),    -- オレンジ色  
('低', 3, '#34C759');    -- 緑色
```

#### todo_statuses（ステータスマスタ）
```sql
-- 初期データ  
INSERT INTO todo_statuses (name, display_order, color_code) VALUES
('未着手', 1, '#6B7280'),  -- グレー
('進行中', 2, '#007AFF'),  -- ブルー
('完了', 3, '#34C759');    -- 緑色
```

### マスタデータ管理方針
- **デフォルト優先度**: 「中」を自動選択
- **デフォルトステータス**: 「未着手」を自動選択
- **表示順序**: display_orderで制御
- **色分け**: color_codeによる視覚的区別
- **論理削除**: is_activeフラグで管理

マイグレーション用SQLファイル（`database_migration.sql`）が存在し、旧テーブルからの移行手順が記載されている。

## 重要な実装詳細

### Supabase統合
- 認証: メール/パスワード認証を実装
- RLS: 全テーブルでRow Level Securityを有効化
- リアルタイム: ToDoの更新をリアルタイムで反映

### コンポーネント設計
- `TodoAddModal` / `TodoEditModal`: ToDoの作成・編集用モーダル（実装済み）
- `AuthForm`: 認証フォーム（実装済み）
- `HeaderWithMenu`: ヘッダーとメニューコンポーネント（実装済み）
- `Toast`: トースト通知システム（実装済み）
- `PriorityBadge` / `StatusBadge`: 優先度・ステータス表示バッジ（実装済み）
- `TodoList`: ToDo一覧表示、フィルタリング、並び替え機能（※実装予定）
- `CategoryManager`: カテゴリの管理UI（※実装予定）
- `FilterControls`: 検索とフィルタリング機能（※実装予定）

### カスタムフック設計
#### データ管理フック
- `useTodos`: ToDo CRUD操作、リアルタイム更新
- `useTodoPriorities`: 優先度マスターデータ管理
- `useTodoStatuses`: ステータスマスターデータ管理
- `useProfile`: ユーザープロフィール管理

#### UI制御フック
- `useToast`: 統一されたトースト通知システム
- `useBodyScrollLock`: モーダル表示時のスクロール制御
- `usePasswordChange`: パスワード変更専用ロジック

### マスタデータ処理
- **初期データ投入**: データベースマイグレーション時に必須
- **デフォルト値取得**: `getDefaultPriorityId()`で「中」を取得
- **名前検索**: `getPriorityByName()`で名前から優先度を取得
- **RLSポリシー**: 全ユーザーが読み取り可能（`is_active = true`のみ）

## 環境設定

### 必須環境変数（`.env.local`）
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### SVGアイコン処理
- `@svgr/webpack`で処理
- 開発時はmemo無効化でHMR問題回避
- TypeScript型定義: `src/types/svg.d.ts`

## 品質保証システム

### 自動承認コマンド（実装後必須実行）
```bash
npm run lint       # ESLintチェック
npx tsc --noEmit   # TypeScriptコンパイルチェック
npm run build      # 本番ビルド確認
```

### 品質管理ルール
- **TypeScript Strict Mode**: 厳密な型チェック有効
- **ESLint**: Next.js推奨設定 + React Hooks ルール
- **3回再試行ルール**: 品質チェック失敗時は最大3回まで修正試行
- **エラーハンドリング必須**: データベース操作時は必ずエラーハンドリング実装

## 開発時の注意点

### コーディング規約
- TypeScriptの厳密な型チェックが有効
- ESLintの設定に従うこと
- Supabaseの環境変数設定が必要（`.env.local`）
- データベース操作時は必ずエラーハンドリングを実装
- 既存コードの変数名を変更する場合、必ず代替案を提案すること

### マスタデータ関連
- **必須初期投入**: 優先度・ステータスマスタデータの投入必須
- **参照整合性**: 外部キー制約によりマスタデータ削除時は注意
- **デフォルト値**: カスタムフックで「中」優先度、「未着手」ステータスを自動設定

### 現在の実装状況
- **実装済み**: 認証システム、ToDo CRUD、モーダル、トースト通知、マスタデータ管理
- **実装予定**: TodoList（一覧表示）、フィルタリング、検索機能
- **制限事項**: メインページ（`/`）はNext.jsデフォルトページのまま

### トラブルシューティング
- **SVGインポートエラー**: `@svgr/webpack`設定確認
- **Supabase接続エラー**: 環境変数とRLSポリシー確認
- **マスタデータエラー**: 初期データ投入とデフォルト値設定確認
- **ビルドエラー**: TypeScript・ESLintチェック実行
- **HMR問題**: 開発時memo無効化設定を確認