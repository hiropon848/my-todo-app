# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要
Next.js 15 + TypeScript + Supabaseを使用したToDoアプリケーション。ガラスモーフィズムUIと洗練されたアニメーションが特徴。

## 技術スタック
- **フロントエンド**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **スタイリング**: TailwindCSS 3.4 + ガラスモーフィズムデザイン
- **バックエンド**: Supabase (PostgreSQL + Authentication + RLS)
- **アニメーション**: Framer Motion 12.18.1
- **アイコン**: SVG Components（@svgr/webpack）
- **品質管理**: ESLint + TypeScript strict mode

## 主要コマンド
```bash
npm run dev        # 開発サーバー起動 (http://localhost:3000)
npm run build      # 本番ビルド
npm run start      # 本番サーバー起動
npm run lint       # ESLintチェック
npm run typecheck  # TypeScriptコンパイルチェック
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
- **トースト通知**: 全てのユーザーフィードバックで使用（表示時間3秒）
- **ガラスモーフィズム**: `background: rgba(255, 255, 255, 0.15)` + `backdrop-filter: blur(10px)`
- **モーダルフッター**: 2ボタンレイアウト（キャンセル・保存）で統一

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
INSERT INTO todo_priorities (id, name, display_order, color_code, is_active) VALUES
('c95322e9-1504-444e-ba19-5df8c91c6c4d', '高', 1, '#ef4444', true),
('d78c89d5-1767-4a1e-b6b5-3079a0c3ece2', '中', 2, '#f59e0b', true),
('1ecdda55-79c8-4677-9d35-2d2c667346f2', '低', 3, '#10b981', true);
```

#### todo_statuses（ステータスマスタ）
```sql
-- 初期データ  
INSERT INTO todo_statuses (id, name, display_order, color_code, is_active) VALUES
('83ecb8ac-8ce3-48b7-8197-e482eecb4b53', '未着手', 1, '#ef4444', true),
('a982edba-fb07-4fbd-b16e-cf9e443a857d', '処理中', 2, '#f59e0b', true),
('a96835d2-f146-483c-a8da-850ce15d826d', '処理済', 3, '#3b82f6', true),
('0a52177a-a2f4-4a1b-9072-e9a8404a65c9', '完了', 4, '#10b981', true);
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
- `ProfileModal`: プロフィール編集モーダル（実装済み）
- `ConditionModal`: フィルタリング条件選択モーダル（実装済み）
- `AuthForm`: 認証フォーム（実装済み）
- `HeaderWithMenu`: ヘッダーとメニューコンポーネント（実装済み）
- `Toast`: トースト通知システム（実装済み）
- `PriorityBadge` / `StatusBadge`: 優先度・ステータス表示バッジ（実装済み）
- `CustomSelect`: カスタムセレクトボックス（実装済み）
- `AppHeader`: アプリケーションヘッダー（実装済み）
- `MenuModal`: メニューモーダル（実装済み）
- `PasswordModal`: パスワード変更モーダル（実装済み）
- `LoadingScreen`: ローディング画面（実装済み）
- `ProfileForm`: プロフィール編集フォーム（実装済み）
- `ConfirmModal`: 確認ダイアログ（実装済み）

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

#### 機能制御フック
- `useTodoSort`: ソート機能管理（実装済み）
- `useURLFilters`: URLクエリパラメータ連携フィルター管理（実装済み）
- `useSearchKeyword`: 検索キーワード管理（実装済み）

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

環境変数のテンプレートファイル（`.env.local.example`）が用意されています。
新規セットアップ時は、このファイルをコピーして`.env.local`を作成してください。

### SVGアイコン処理
- `@svgr/webpack`で処理
- 開発時はmemo無効化でHMR問題回避
- TypeScript型定義: `src/types/svg.d.ts`

## 品質保証システム

### 自動承認コマンド（実装後必須実行）
```bash
npm run lint       # ESLintチェック
npm run typecheck  # TypeScriptコンパイルチェック
npm run build      # 本番ビルド確認
```

### 品質管理ルール
- **TypeScript Strict Mode**: 厳密な型チェック有効
- **ESLint**: Next.js推奨設定 + React Hooks ルール
- **3回再試行ルール**: 品質チェック失敗時は最大3回まで修正試行
- **エラーハンドリング必須**: データベース操作時は必ずエラーハンドリング実装

## LLM利用ガイドライン

### 実装制限事項
- **許可が必要な変更**: 以下の変更は必ずユーザーの明示的な許可を得てから実行
  - 新規ファイルの作成
  - 既存ファイルの変更
  - データベース構造の変更
  - 依存関係（パッケージ）の追加・更新
  - 環境変数の追加・変更

- **禁止事項**
  - mdファイルに記載されていないstep名、項目名、項目番号をターミナル上で表示しないこと

- **必須事項**
  - 実装前に関連する全ファイルを読み込み、動作フローを完全に理解すること。
  - 実装中の機能に関連するソースコードを理解した上で原因究明すること。
  - 実装後は必ず自己検証を行い、期待通りの動作をシミュレートすること。
  - 品質チェック（ESLint・TypeScript・Build）を実装毎に必ず実行すること。

### LLMの役割
- **許可された作業のみ実行**: 
  - コードレビュー
  - 実装提案の作成
  - 既存コードの説明
  - デバッグのサポート
  - ベストプラクティスの提案

### 作業フロー
1. **変更提案**: 
   - 具体的な変更内容を提案
   - 変更による影響範囲を説明
   - 代替案がある場合は併せて提示

2. **承認待ち**:
   - ユーザーからの明示的な承認を待つ
   - 承認なしでの実装は禁止

3. **実装後の確認**:
   - 承認された内容との一致を確認
   - 品質保証システムでのチェック実行

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
- **実装済み**: 認証システム、ToDo CRUD、プロフィール管理、モーダル統一UI、トースト通知、マスタデータ管理、フィルタリング機能（URLクエリパラメータ連携）、ソート機能、パスワードリセット機能
- **部分実装**: 検索機能（バックエンド・フック実装済み、UI未実装）
- **制限事項**: メインページ（`/`）はNext.jsデフォルトページのまま
- **ステータス管理**: 4段階ステータス（未着手→処理中→処理済→完了）で運用

### 実装済みページ一覧
- `/` - メインページ（Next.jsデフォルト）
- `/login` - ログイン画面
- `/signup` - サインアップ画面
- `/todos` - ToDo一覧画面
- `/profile` - プロフィール画面
- `/complete` - 完了画面
- `/reset-password` - パスワードリセット画面
- `/reset-password/confirm` - パスワードリセット確認画面

### 最新の改善履歴
- **フィルタリング機能完全実装**: Phase 1-6完了、URLクエリパラメータ連携、ブラウザ履歴対応、リアルタイム更新（2025-07-08）
- **ソート機能実装**: Phase 8完了、8つのソートオプション、URLパラメータ管理（2025-07-08）
- **検索機能部分実装**: Phase 7実装、バックエンド・フック完了、UI未実装（2025-07-08）
- **新規フック追加**: useTodoSort、useURLFilters、useSearchKeyword実装（2025-07-08）
- **実装済み機能の追加記載**: 実装されているが未記載だった追加コンポーネント（AppHeader、MenuModal、PasswordModal、LoadingScreen、ProfileForm、ConfirmModal）、追加ページ（/profile、/complete、/reset-password関連）、パスワードリセット機能をCLAUDE.mdに追記（2025-01-07）
- **マスタデータ仕様修正**: 実際のデータベースバックアップに合致するよう、4段階ステータス（未着手・処理中・処理済・完了）と正確な色コードに修正（2025-01-07）
- **トースト表示時間**: 2秒→3秒に変更（2025-07-03）
- **プロフィールモーダル**: 一瞬の元値表示問題を解決（2025-07-03）
- **モーダルUI統一**: 全モーダルで2ボタンレイアウト（キャンセル・保存）に統一（2025-07-03）
- **フィルタリングUI**: ConditionModalを実装、CustomSelectとデザイン統一（2025-07-03）
- **選択中背景色**: bg-blue-50からbg-blue-100に統一で視認性向上（2025-07-03）

### トラブルシューティング
- **SVGインポートエラー**: `@svgr/webpack`設定確認
- **Supabase接続エラー**: 環境変数とRLSポリシー確認
- **マスタデータエラー**: 初期データ投入とデフォルト値設定確認
- **ビルドエラー**: TypeScript・ESLintチェック実行
- **HMR問題**: 開発時memo無効化設定を確認