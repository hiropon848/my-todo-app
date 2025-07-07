# Phase 8: ソート機能強化 実装計画書

## 概要
現在は作成日時（created_at）の降順固定となっているソート機能を、ユーザーが自由に選択・変更できるように強化する。

## 現状分析

### 現在の実装状況
- **ソート条件**: `created_at`（作成日時）の降順のみ
- **実装箇所**: `useTodos.ts`の49行目で固定実装
- **UI**: ソート選択UIなし
- **永続化**: なし（リロードで初期状態）

### 技術的制約
- Supabaseのクエリビルダーを使用
- リアルタイム更新との整合性を保つ必要あり
- フィルター機能（Phase 6）と協調動作が必要

## ソート仕様

### ソートオプション
以下の8つのソートオプションを実装する：

1. **作成日時新しい順** - 単一ソート
2. **作成日時古い順** - 単一ソート
3. **更新日時新しい順** - 単一ソート
4. **更新日時古い順** - 単一ソート
5. **優先度高い順** - 第1ソート：優先度（高→中→低）、第2ソート：更新日時新しい順
6. **優先度低い順** - 第1ソート：優先度（低→中→高）、第2ソート：更新日時新しい順
7. **状態進捗順** - 第1ソート：状態（完了→処理済→処理中→未着手）、第2ソート：更新日時新しい順
8. **状態未進捗順** - 第1ソート：状態（未着手→処理中→処理済→完了）、第2ソート：更新日時新しい順

### 状態の定義
- 未着手（display_order: 1）
- 処理中（display_order: 2）
- 処理済（display_order: 3）
- 完了（display_order: 4）

## 実装スコープ

### Phase 8統合実装
シンプルな仕様により、Phase 8-1とPhase 8-2を統合して実装：
1. ソート選択UI（単一のセレクトボックス）
2. 8つのソートオプションの実装
3. URLパラメータでのソート状態管理
4. 第2ソートの自動適用（優先度・状態の場合）

### 将来的な拡張（Phase 9以降）
- カスタムソート順（ドラッグ&ドロップ）
- ソートプリセット機能
- ユーザーごとのソート設定保存

## 実装ステップ詳細

### Step 1: ソート型定義とフック作成
**目的**: ソート機能の基盤作成

**実装内容**:
1. ソート関連の型定義追加
   ```typescript
   type SortOption = 
     | 'created_desc'      // 作成日時新しい順
     | 'created_asc'       // 作成日時古い順  
     | 'updated_desc'      // 更新日時新しい順
     | 'updated_asc'       // 更新日時古い順
     | 'priority_high'     // 優先度高い順
     | 'priority_low'      // 優先度低い順
     | 'state_progress'    // 状態進捗順
     | 'state_no_progress' // 状態未進捗順
   ```

2. `useTodoSort`カスタムフック作成
   - URLパラメータからソート状態を読み取り
   - ソート状態の更新関数
   - デフォルトソート設定（created_desc）

**検証項目**:
- TypeScript型チェック
- URLパラメータの読み書き確認

### Step 2: useTodosフックの拡張
**目的**: ソート機能をデータ取得ロジックに統合

**実装内容**:
1. `useTodos`にソートパラメータ追加
2. ソートオプションに応じたクエリ構築
   ```typescript
   switch (sortOption) {
     case 'created_desc':
       query = query.order('created_at', { ascending: false });
       break;
     case 'created_asc':
       query = query.order('created_at', { ascending: true });
       break;
     case 'updated_desc':
       query = query.order('updated_at', { ascending: false });
       break;
     case 'updated_asc':
       query = query.order('updated_at', { ascending: true });
       break;
     case 'priority_high':
       // 第1ソート: 優先度高い順（display_order昇順）
       // 第2ソート: 更新日時新しい順
       query = query
         .order('todo_priorities.display_order', { ascending: true })
         .order('updated_at', { ascending: false });
       break;
     case 'priority_low':
       // 第1ソート: 優先度低い順（display_order降順）
       // 第2ソート: 更新日時新しい順
       query = query
         .order('todo_priorities.display_order', { ascending: false })
         .order('updated_at', { ascending: false });
       break;
     case 'state_progress':
       // 第1ソート: 状態進捗順（display_order降順: 4→3→2→1）
       // 第2ソート: 更新日時新しい順
       query = query
         .order('todo_statuses.display_order', { ascending: false })
         .order('updated_at', { ascending: false });
       break;
     case 'state_no_progress':
       // 第1ソート: 状態未進捗順（display_order昇順: 1→2→3→4）
       // 第2ソート: 更新日時新しい順
       query = query
         .order('todo_statuses.display_order', { ascending: true })
         .order('updated_at', { ascending: false });
       break;
   }
   ```
3. 優先度・状態テーブルとの適切なJOIN処理

**注意点**:
- リアルタイム更新との整合性維持
- JOINクエリのパフォーマンス考慮

### Step 3: ソート選択UIコンポーネント作成
**目的**: ユーザーがソート条件を選択できるUI提供

**実装内容**:
1. `SortSelector`コンポーネント作成
   - CustomSelectを使用（統一性のため）
   - 単一のセレクトボックスで8つのオプションを選択

2. ソートオプションの表示:
   ```typescript
   const sortOptions = [
     { value: 'created_desc', label: '作成日時（新しい順）' },
     { value: 'created_asc', label: '作成日時（古い順）' },
     { value: 'updated_desc', label: '更新日時（新しい順）' },
     { value: 'updated_asc', label: '更新日時（古い順）' },
     { value: 'priority_high', label: '優先度（高い順）' },
     { value: 'priority_low', label: '優先度（低い順）' },
     { value: 'state_progress', label: '状態（進捗順）' },
     { value: 'state_no_progress', label: '状態（未進捗順）' }
   ];
   ```

**UIデザイン**:
- フィルターボタンの隣に配置
- アイコン: ソートアイコン使用
- 選択中のオプションをセレクトボックスに表示

### Step 4: TodoListへの統合
**目的**: ソート機能をメイン画面に組み込み

**実装内容**:
1. AppHeaderにSortSelectorを追加
2. ソート状態変更時の処理実装
3. ローディング状態の考慮

**レイアウト調整**:
- フィルターとソートの配置バランス
- モバイル対応

### Step 5: 最終調整と品質保証
**目的**: 実装の完成度向上

**実装内容**:
1. パフォーマンス測定と最適化
2. エッジケースのテスト
3. ドキュメント更新

**品質チェック項目**:
- [ ] 全ソート条件での動作確認
- [ ] URLパラメータの永続化確認
- [ ] フィルターとの併用テスト
- [ ] リアルタイム更新時の挙動確認
- [ ] レスポンシブデザイン確認

## 実装上の注意点

### パフォーマンス考慮事項
- インデックスの確認（created_at, updated_at）
- 優先度・状態ソート時のJOINパフォーマンス
- 大量データでのソート性能
- 不要な再レンダリングの防止

### UI/UX考慮事項
- ソート変更時のローディング表示
- 現在のソート状態の明確な表示
- シンプルな選択UIで複雑な操作を不要に

### 技術的考慮事項
- Supabaseのorder句の制限事項
- JOINを含むクエリでのソート（優先度・状態）
- 第2ソートの自動適用ロジック
- TypeScriptの型安全性維持

## リスクと対策

### リスク1: パフォーマンス劣化
**対策**: 
- 適切なインデックス設定
- ページネーション実装の検討
- クエリ最適化

### リスク2: 複雑なUI
**対策**:
- 段階的な機能追加
- ユーザーテストの実施
- シンプルなデフォルト設定

### リスク3: 既存機能との競合
**対策**:
- フィルター機能との統合テスト
- リアルタイム更新の動作確認
- 十分な結合テスト

## 成功基準
1. ユーザーが任意のカラムでソートできる
2. ソート状態がURLで永続化される
3. パフォーマンスの劣化がない
4. 直感的で使いやすいUI
5. 既存機能との完全な互換性

## スケジュール目安
- Step 1: 型定義とフック作成（1時間）
- Step 2: useTodosフックの拡張（2時間）
- Step 3: ソート選択UI実装（1.5時間）
- Step 4: TodoListへの統合（1時間）
- Step 5: 品質保証（0.5時間）

合計: 約6時間（シンプル化により短縮）