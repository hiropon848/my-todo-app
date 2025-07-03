# 📝 TODOアプリ

Next.js + TypeScript + Supabaseで構築されたモダンなTODOアプリケーションです。

## ✨ 主な機能

- **📱 レスポンシブデザイン**: モバイル・デスクトップ対応
- **🔐 認証システム**: 
  - ログイン・新規登録
  - パスワードリセット
  - パスワード変更
  - プロフィール管理（姓名の編集）
- **✅ TODO管理**: 
  - 作成・編集・削除
  - 優先度設定（高・中・低）
  - 状態管理（未着手・進行中・完了）
  - 完了済みTODOの表示/非表示切り替え
- **🎨 モダンUI**: 
  - ガラスモーフィズムデザイン
  - アニメーション効果
  - 統一されたモーダルデザイン
- **🔔 通知システム**: 操作結果のトースト通知

## 🛠️ 技術スタック

- **フロントエンド**: 
  - Next.js 15.3.3
  - TypeScript
  - TailwindCSS
  - ガラスモーフィズムUI
- **バックエンド**: 
  - Supabase
  - PostgreSQL
  - 認証（Auth）
  - 行レベルセキュリティ（RLS）
- **状態管理**: 
  - React Hooks
  - Context API
- **開発ツール**: 
  - ESLint
  - TypeScript

## 🚀 セットアップ

### 1. リポジトリのクローン

\`\`\`bash
git clone https://github.com/hiropon848/my-todo-app.git
cd my-todo-app
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
npm install
# または
yarn install
# または
pnpm install
\`\`\`

### 3. 環境変数の設定

\`.env.local\`ファイルを作成し、Supabaseの設定を追加：

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQLエディタで`src/db/database_migration.sql`の内容を実行：
   - todo_prioritiesテーブルの作成と初期データ投入
   - todo_statusesテーブルの作成と初期データ投入
   - todosテーブルのカラム名変更とデータ移行
   - マスタデータテーブル（todo_priorities, todo_statuses）のRLS設定
3. ⚠️ 注意: todosテーブルのRLS設定が別途必要です

### 5. 開発サーバーの起動

\`\`\`bash
npm run dev
# または
yarn dev
# または
pnpm dev
\`\`\`

[http://localhost:3000](http://localhost:3000) をブラウザで開いてアプリケーションを確認できます。

## 📂 プロジェクト構成

\`\`\`
src/
├── app/                 # Next.js App Router
│   ├── complete/       # 完了済みTODO
│   ├── login/         # ログイン
│   ├── profile/       # プロフィール
│   ├── reset-password/ # パスワードリセット
│   ├── signup/        # 新規登録
│   └── todos/         # TODO一覧
├── components/         # Reactコンポーネント
│   ├── auth/          # 認証関連
│   ├── common/        # 共通コンポーネント
│   └── TodoAddModal.tsx # TODO追加モーダル
├── contexts/          # React Context
├── hooks/             # カスタムフック
├── icons/             # SVGアイコン
├── lib/               # ライブラリ設定
└── types/             # TypeScript型定義
\`\`\`

## 🎯 主要機能の使い方

### TODO管理
- **➕ 新規作成**: ヘッダーの「+」ボタンでモーダル表示
- **✏️ 編集**: TODOアイテムのメニューから編集
- **🗑️ 削除**: TODOアイテムのメニューから削除（確認モーダル付き）
- **✅ 完了切り替え**: チェックボックスで完了状態を切り替え
- **🔄 状態管理**: 未着手・進行中・完了の3段階で管理
- **⭐ 優先度**: 高・中・低の3段階で設定可能

### アカウント管理
- **🔑 ログイン**: メールアドレスとパスワードでログイン
- **📝 新規登録**: メールアドレス、パスワード、姓名で登録
- **🔄 パスワードリセット**: メール経由でパスワードをリセット
- **👤 プロフィール編集**: 姓名の変更が可能
- **🔐 パスワード変更**: 現在のパスワードを確認後に変更可能

## 🧪 開発コマンド

\`\`\`bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# ESLintチェック
npm run lint

# 型チェック
npx tsc --noEmit
\`\`\`

## 🚢 デプロイ

### Vercelでのデプロイ

1. [Vercel](https://vercel.com)でGitHubリポジトリを連携
2. 環境変数を設定
3. 自動デプロイ開始

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します！

---

**📧 お問い合わせ**: [GitHub Issues](https://github.com/hiropon848/my-todo-app/issues)

## 機能一覧

### TODO管理
- TODOの作成（タイトル、本文、優先度）
- TODOの編集（タイトル、本文、優先度、状態）
- TODOの削除
- 優先度による分類
- 状態による進捗管理（未着手、進行中、完了）

### 状態管理
TODOの状態は以下の3段階で管理されます：
1. 未着手：新規作成時のデフォルト状態
2. 処理中：作業開始時の状態
3. 完了：作業完了時の状態

各状態は編集モーダルから変更可能で、TODOの進捗に応じて適切な状態を選択できます。
