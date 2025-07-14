# DEVELOPMENT.md

このファイルは、CLAUDE.mdの前提知識として機能します。実装方法と検証手順を詳細に説明します。

## 🚨 **継続的注意喚起（重要）**

**⚠️ 注意**: LLMは作業に集中すると品質基準を忘れる傾向があります。以下のチェックポイントで継続的に確認してください。

### **実装サイクル中の継続的チェックポイント**

#### **1. 実装開始前（毎回確認）**
```
□ 推測表現を使用していないか
□ 具体的な根拠を提示しているか
□ ファイル内容を確認済みか
□ 技術的根拠を記載済みか
```

#### **2. 実装中（定期的確認）**
```
□ 推測表現（「〜のはず」「〜だと思う」）を使用していないか
□ 具体的な行番号・内容を記載しているか
□ 技術的根拠を随時更新しているか
□ 影響範囲を明確にしているか
```

#### **3. 問題発生時（即座確認）**
```
□ 推測ではなく具体的な根拠を提示しているか
□ エラーメッセージの具体的な内容を記載しているか
□ 修正方法の技術的根拠を説明しているか
□ 影響範囲を再確認しているか
```

#### **4. 実装完了時（最終確認）**
```
□ 品質チェック3点セットを実行したか
□ 報告フォーマットに従って記載しているか
□ テスト結果を具体的に記載しているか
□ 推測表現が一切含まれていないか
```

### **継続的注意喚起のための具体的手順**

#### **実装前チェックリスト（必須）**
```
□ ファイル内容確認（行番号・内容記載）
□ 技術的根拠記載
□ 影響範囲明記
□ 品質チェック実行
□ 推測表現禁止の確認
```

#### **実装中チェックリスト（継続的）**
```
□ 推測表現の使用禁止
□ 具体的な根拠の提示
□ ファイル内容の随時確認
□ 技術的根拠の更新
□ 影響範囲の再確認
```

#### **実装後チェックリスト（最終）**
```
□ 品質チェック3点セット実行
□ 報告フォーマット遵守
□ テスト結果の具体的記載
□ 推測表現の完全排除
□ 具体的根拠の最終確認
```

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
npm run typecheck  # TypeScript型チェック
```

## プロジェクト構造
```
src/
├── app/           # Next.js App Router
├── components/    # Reactコンポーネント
├── contexts/      # React Context
├── hooks/         # カスタムフック
├── lib/           # ユーティリティ・設定
├── types/         # TypeScript型定義
└── icons/         # SVGアイコン
```

## 虚偽報告防止のための具体的実装方法

### 1. ファイル内容確認の具体的手順

#### **実装前確認**
```bash
# 関連ファイルの内容を実際に確認
read_file target_file="src/hooks/useTodos.ts" start_line_one_indexed=1 end_line_one_indexed=50
read_file target_file="src/types/todo.ts" start_line_one_indexed=1 end_line_one_indexed=30
```

#### **確認結果の記載例**
```
**ファイル確認結果**:
- src/hooks/useTodos.ts 15-25行目: useTodosフックの実装
- src/types/todo.ts 8-12行目: Todo型定義
- 影響範囲: src/components/TodoList.tsx, src/app/todos/page.tsx
```

### 2. 技術的根拠の具体的提示方法

#### **問題分析の記載例**
```
**問題の原因**:
- src/hooks/useTodos.ts 45行目: useEffectの依存配列が不完全
- TypeScript型定義: src/types/todo.ts で必須フィールドが定義されている
- 影響: 検索機能で重複ローディングが発生

**解決方法**:
- useEffectの依存配列に検索キーワードを追加
- デバウンス処理の実装でAPI呼び出しを最適化
```

### 3. 品質チェックの具体的実行手順

#### **3点セットの実行**
```
```