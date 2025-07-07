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

### ✅ Step 1: ソート型定義とフック作成（完了）
**目的**: ソート機能の基盤作成

**実装内容**:
1. ソート関連の型定義追加（`/src/types/todo.ts`）
   ```typescript
   export type SortOption = 
     | 'created_desc'      // 作成日時新しい順
     | 'created_asc'       // 作成日時古い順  
     | 'updated_desc'      // 更新日時新しい順
     | 'updated_asc'       // 更新日時古い順
     | 'priority_high'     // 優先度高い順
     | 'priority_low'      // 優先度低い順
     | 'state_progress'    // 状態進捗順
     | 'state_no_progress' // 状態未進捗順
   ```

2. URLパラメータ型拡張（`/src/types/filter.ts`）
   ```typescript
   export interface URLFilterParams {
     priorities?: string[];
     statuses?: string[];
     sort?: string; // Phase 8: ソート機能強化で追加
   }
   ```

3. `useTodoSort`カスタムフック作成（`/src/hooks/useTodoSort.ts`）
   - URLパラメータからソート状態を読み取り
   - ソート状態の更新関数
   - バリデーション機能（有効なソートオプションのみ許可）
   - デフォルトソート設定（created_desc）
   - 既存のuseURLFiltersフックと同様のパターンで実装

**完了済み検証項目**:
- ✅ TypeScript型チェック: エラーなし
- ✅ ESLint: 警告・エラーなし
- ✅ URLパラメータの読み書き確認: 正常動作
- ✅ 既存機能への影響: なし

### ✅ Step 2: useTodosフックの拡張（完了）
**目的**: ソート機能をデータ取得ロジックに統合

**実装内容**:
1. `useTodos`パラメータ拡張
   ```typescript
   export function useTodos(userId: string | null, filterParams?: {
     priorityIds?: string[];
     statusIds?: string[];
     sortOption?: SortOption; // Phase 8: ソート機能強化で追加
   }) {
   ```

2. ソートクエリ構築関数実装（`applySortToQuery`）
   ```typescript
   const applySortToQuery = useCallback((query: any, sortOption: SortOption = 'created_desc') => {
     switch (sortOption) {
       case 'created_desc':
         return query.order('created_at', { ascending: false });
       case 'priority_high':
         // 第1ソート: 優先度高い順（display_order昇順：1→2→3）
         // 第2ソート: 更新日時新しい順
         return query
           .order('priority.display_order', { ascending: true })
           .order('updated_at', { ascending: false });
       case 'state_progress':
         // 第1ソート: 状態進捗順（display_order降順：4→3→2→1）
         // 第2ソート: 更新日時新しい順
         return query
           .order('status.display_order', { ascending: false })
           .order('updated_at', { ascending: false });
       // ... 他の全8パターン実装済み
     }
   }, []);
   ```

3. 既存JOIN処理の活用と拡張
   - 既存の`priority:todo_priorities(*)`、`status:todo_statuses(*)`を活用
   - display_orderフィールドによる複合ソート実現
   - パフォーマンス最適化ロジック維持

4. CRUD操作のソート対応
   - 追加/更新時のソート状態考慮
   - デフォルト以外のソート時は完全データ再取得

**完了済み検証項目**:
- ✅ TypeScript型チェック: エラーなし
- ✅ ESLint: 警告・エラーなし（any型は適切にdisable）
- ✅ 本番ビルド: 正常終了
- ✅ 既存フィルター機能: 保持確認
- ✅ CRUD操作: 既存動作維持

**重要事項**:
- 🔶 ソートロジックは完成、UI統合待ち
- 🔶 JOIN処理のフィールド参照（`priority.display_order`）は実動作検証が必要

### ✅ Step 3: ソート選択UIコンポーネント作成（完了）
**目的**: 既存のフィルターモーダルにソート機能を統合

**設計変更**:
- **配置**: ConditionModal内の優先度・状態フィルターの下部にソートUIを追加
- **レイアウト**: ディバイダーで区切り、全幅（col-span-2）で配置
- **ヘッダー**: 既存の「絞り込み/並び替え」がそのまま適用

**実装内容**:
1. **ConditionModalProps拡張**
   ```typescript
   interface ConditionModalProps {
     // 既存
     onSave: (
       selectedPriorities: Set<string>, 
       selectedStatuses: Set<string>,
       sortOption: SortOption  // 新規追加
     ) => Promise<boolean>;
     // 新規
     initialSortOption?: SortOption;
   }
   ```

2. **ソート状態管理の追加**
   ```typescript
   const [selectedSortOption, setSelectedSortOption] = useState<SortOption>('created_desc');
   ```

3. **ソートUIの実装**
   - CustomSelectを使用して統一感を保持
   - 8つのソートオプションを選択肢として提供
   - 既存のフィルターUIと同じデザインパターンを採用

4. **レイアウト構造**
   ```tsx
   <div className="grid grid-cols-2 gap-6">
     {/* 既存: 優先度フィルタ */}
     {/* 既存: 状態フィルタ */}
   </div>
   
   {/* 新規: ディバイダー */}
   <div className="border-t border-white/30 my-4" />
   
   {/* 新規: ソート選択 */}
   <div>
     <label className="block text-sm font-medium text-text mb-1">ソート</label>
     <CustomSelect
       options={sortOptions}
       value={selectedSortOption}
       onChange={setSelectedSortOption}
     />
   </div>
   ```

**ソートオプション定義**:
```typescript
const sortOptions = [
  { id: 'created_desc', name: '作成日時（新しい順）' },
  { id: 'created_asc', name: '作成日時（古い順）' },
  { id: 'updated_desc', name: '更新日時（新しい順）' },
  { id: 'updated_asc', name: '更新日時（古い順）' },
  { id: 'priority_high', name: '優先度（高い順）' },
  { id: 'priority_low', name: '優先度（低い順）' },
  { id: 'state_progress', name: '状態（進捗順）' },
  { id: 'state_no_progress', name: '状態（未進捗順）' }
];
```

**UI設計の利点**:
- 既存の「絞り込み/並び替え」ヘッダーと完全に一致
- フィルター機能との統合により1つのモーダルで完結
- CustomSelectを再利用してデザインの統一性を保持
- レスポンシブ対応（ソート部分は全幅使用）

### 🔄 Step 4: TodoListページの統合（進行中）
**目的**: ソート機能をメインページに統合

**実装内容**:
1. **✅ page.tsx（/todos）の修正**
   - ✅ useTodoSortフックの追加
   - ✅ filterParamsにsortOptionを統合
   - ✅ ConditionModalのprops拡張
   - ✅ handleConditionSave関数の拡張
   - ✅ SortOption型のインポート追加

2. **🔲 状態管理の統合**
   ```typescript
   // 新規追加
   const { getSortFromURL, updateSort, currentSort } = useTodoSort();
   
   // 既存のfilterParamsを拡張
   const filterParams = useMemo(() => ({
     priorityIds: activeFilters.priorityIds,
     statusIds: activeFilters.statusIds,
     sortOption: currentSort  // 新規追加
   }), [activeFilters.priorityIds, activeFilters.statusIds, currentSort]);
   ```

3. **ConditionModalの統合**
   ```typescript
   const handleConditionSave = async (
     priorities: Set<string>, 
     statuses: Set<string>,
     sortOption: SortOption  // 新規追加
   ) => {
     // フィルター更新（既存）
     updateFilters(Array.from(priorities), Array.from(statuses));
     // ソート更新（新規）
     updateSort(sortOption);
     return true;
   };
   ```

4. **初期値の設定**
   - ConditionModalにinitialSortOptionを渡す
   - URLパラメータからソート状態を復元

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
- [ ] JOIN処理（`priority.display_order`、`status.display_order`）の実動作確認

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

## 進捗状況

### 完了済み
- ✅ **Step 1**: 型定義とフック作成（実時間: 1時間）
  - SortOption型定義（8パターン）
  - useTodoSortフック実装
  - URLパラメータ型拡張
  
- ✅ **Step 2**: useTodosフックの拡張（実時間: 1.5時間）
  - ソートクエリ構築関数実装
  - CRUD操作のソート対応
  - 既存フィルター機能との統合

### 残り作業
- ✅ **Step 3**: ソート選択UIコンポーネント作成（完了: 1.5時間）
- 🔲 **Step 4**: TodoListページの統合（予定: 1時間）
- 🔲 **Step 5**: 品質保証（予定: 0.5時間）

**進捗率**: 3/5ステップ完了（60%）  
**残り予定時間**: 約1.5時間

## 次のステップ

### 🎯 **次の実装: Step 4 - TodoListページの統合**

**実装順序**:
1. **✅ page.tsx（/todos）の修正** - 完了
2. **🎯 状態管理の統合** - conditionModalInitialStateにソート初期値を追加
3. **ConditionModalの統合** - 既存実装で完了済み
4. **初期値の設定** - 既存実装で完了済み

**重要ポイント**:
- 既存のフィルター機能への影響を最小化
- handleConditionSave関数の拡張でソート状態も管理
- メモ化を適切に維持してパフォーマンス確保
- ソート状態のURL同期確認