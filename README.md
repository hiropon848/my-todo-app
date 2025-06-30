# 📝 TODOアプリ

Next.js + TypeScript + Supabaseで構築されたモダンなTODOアプリケーションです。

## ✨ 主な機能

- **📱 レスポンシブデザイン**: モバイル・デスクトップ対応
- **🔐 認証システム**: ログイン・新規登録・パスワードリセット
- **✅ TODO管理**: 作成・編集・削除・完了切り替え
- **🎨 ガラスモーフィズムUI**: モダンで美しいデザイン
- **🔔 通知システム**: 操作結果のトースト通知
- **👤 プロフィール管理**: ユーザー情報の編集

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15.3.3, TypeScript, TailwindCSS
- **バックエンド**: Supabase (PostgreSQL, Auth, RLS)
- **スタイリング**: TailwindCSS, ガラスモーフィズム
- **状態管理**: React Hooks, Context API
- **開発ツール**: ESLint, TypeScript

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

### 4. 開発サーバーの起動

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
├── components/          # Reactコンポーネント
│   ├── auth/           # 認証関連
│   ├── common/         # 共通コンポーネント
│   └── TodoAddModal.tsx # TODO追加モーダル
├── contexts/           # React Context
├── hooks/              # カスタムフック
├── icons/              # SVGアイコン
├── lib/                # ライブラリ設定
└── types/              # TypeScript型定義
\`\`\`

## 🎯 主要機能の使い方

### TODO管理
- **➕ 新規作成**: ヘッダーの「+」ボタンでモーダル表示
- **✏️ 編集**: TODOアイテムのメニューから編集
- **🗑️ 削除**: TODOアイテムのメニューから削除
- **✅ 完了切り替え**: チェックボックスで完了状態を切り替え

### 認証
- **🔑 ログイン**: メールアドレスとパスワード
- **📝 新規登録**: アカウント作成
- **🔄 パスワードリセット**: メール経由でリセット

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
2. 進行中：作業開始時の状態
3. 完了：作業完了時の状態

各状態は編集モーダルから変更可能で、TODOの進捗に応じて適切な状態を選択できます。
