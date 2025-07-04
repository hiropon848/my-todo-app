# フィルタ機能実装計画

## 🛡️ **安全優先の段階的実装計画**

### **基本方針**
1. **既存UIは一切変更しない** まま新機能を追加
2. **各段階で必ず動作確認** を行い、問題があれば即座に復旧
3. **機能フラグ** を使用して新機能を段階的に有効化
4. **TypeScript厳密チェック** で型安全性を保証

### **背景**
- 過去に「URLクエリパラメータ管理」実装中にUIレイアウトが破壊された経緯あり
- 現状のConditionModalは実装済みだが、onSaveがプレースホルダー状態
- 安全かつ確実な実装が必要

---

## **Phase 1: 基盤準備（UI影響なし）**

### **Step 1-1: 型定義の追加**

**ファイル作成**: `src/types/filter.ts`

```typescript
// src/types/filter.ts (新規作成)
export interface FilterState {
  selectedPriorities: Set<string>;
  selectedStatuses: Set<string>;
}

export interface URLFilterParams {
  priorities?: string[];
  statuses?: string[];
}
```

### **Step 1-2: useURLFiltersフック作成**

**ファイル作成**: `src/hooks/useURLFilters.ts`

```typescript
// src/hooks/useURLFilters.ts (新規作成)
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useURLFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  
  // まずは読み取り専用で実装
  const getFiltersFromURL = () => {
    const priorities = searchParams.get('priorities')?.split(',') || [];
    const statuses = searchParams.get('statuses')?.split(',') || [];
    return { priorities, statuses };
  };
  
  // URL更新機能は後で実装
  const updateFilters = (priorities: string[], statuses: string[]) => {
    // Phase 2で実装
    console.log('updateFilters called', { priorities, statuses });
  };
  
  return { getFiltersFromURL, updateFilters, isReady };
}
```

### **✅ Phase 1 確認項目:**
- [x] アプリケーションが正常に起動する
- [x] todos/page.tsxの表示が変わらない
- [x] TypeScriptエラーが発生しない
- [x] `npm run typecheck` が通る
- [x] `npm run lint` が通る
- [x] `npm run build` が成功する
- [x] IDEでエラー・警告なし
- [x] ブラウザでの動作確認完了（ユーザー確認済み）

**📅 実装完了日時**: 2025-07-04
**🔍 実装詳細**:
- `src/types/filter.ts`: FilterState, URLFilterParams インターフェース定義
- `src/hooks/useURLFilters.ts`: 読み取り専用URLフィルター管理フック作成
- ESLintエラー対応済み（未使用router変数のeslint-disable対応）
- 完全にUI非破壊で実装、既存機能への影響なし確認済み

---

## **Phase 2: ConditionModal拡張（UI破壊防止）**

### **Step 2-1: ConditionModalに初期値props追加**

**ファイル編集**: `src/components/common/ConditionModal.tsx`

```typescript
// src/components/common/ConditionModal.tsx
interface ConditionModalProps {
  isOpen: boolean;
  onSave: (selectedPriorities: Set<string>, selectedStatuses: Set<string>) => Promise<boolean>;
  onCancel: () => void;
  // 新規追加（デフォルト値でUI破壊防止）
  initialPriorities?: Set<string>;
  initialStatuses?: Set<string>;
}

export function ConditionModal({ 
  isOpen, 
  onSave, 
  onCancel,
  initialPriorities = new Set(),
  initialStatuses = new Set()
}: ConditionModalProps) {
  // 既存のuseStateを修正
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(initialPriorities);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(initialStatuses);
  
  // 初期値復元のuseEffect追加
  useEffect(() => {
    if (isOpen) {
      setSelectedPriorities(initialPriorities);
      setSelectedStatuses(initialStatuses);
    }
  }, [isOpen, initialPriorities, initialStatuses]);
  
  // 既存のロジックは一切変更しない
}
```

### **Step 2-2: todos/page.tsxでの安全な統合**

**ファイル編集**: `src/app/todos/page.tsx`

```typescript
// src/app/todos/page.tsx
import { useURLFilters } from '@/hooks/useURLFilters';

export default function TodosPage() {
  // 既存のコードは一切変更しない
  
  // 新規追加（既存に影響しない）
  const { getFiltersFromURL } = useURLFilters();
  const [conditionModalInitialState, setConditionModalInitialState] = useState({
    priorities: new Set<string>(),
    statuses: new Set<string>()
  });

  // ConditionModalを開く際の初期値設定（既存の関数を拡張）
  const handleConditionModalOpen = () => {
    // 現在は空のSet（既存動作を維持）
    setConditionModalInitialState({
      priorities: new Set(),
      statuses: new Set()
    });
    setShowConditionModal(true);
  };
  
  // フィルターボタンのonClickを変更
  // 変更前: onClick={() => setShowConditionModal(true)}
  // 変更後: onClick={handleConditionModalOpen}
  
  // ConditionModalの呼び出し部分のみ変更
  return (
    // ... 既存のJSX
    <ConditionModal
      isOpen={showConditionModal}
      onSave={async (priorities, statuses) => { 
        // 既存の動作を維持
        setShowConditionModal(false); 
        return true; 
      }}
      onCancel={() => setShowConditionModal(false)}
      initialPriorities={conditionModalInitialState.priorities}
      initialStatuses={conditionModalInitialState.statuses}
    />
  );
}
```

### **✅ Phase 2 確認項目:**
- [x] ConditionModalが正常に開閉する
- [x] 既存の選択・保存動作が変わらない
- [x] UIレイアウトが崩れない
- [x] TypeScriptエラーが発生しない
- [x] フィルターボタンクリック時の動作が変わらない
- [x] `npm run typecheck` が通る
- [x] `npm run lint` が通る
- [x] `npm run build` が成功する
- [x] IDEでエラー・警告なし
- [x] ブラウザでの動作確認完了（ユーザー確認済み）

**📅 実装完了日時**: 2025-07-04
**🔍 実装詳細**:
- ConditionModalに `initialPriorities`, `initialStatuses` オプショナルprops追加
- デフォルト値で既存動作を完全に維持、初期値復元用useEffect追加
- todos/page.tsxに `useURLFilters` インポート、`conditionModalInitialState` 状態追加
- `handleConditionModalOpen` ハンドラー関数作成、フィルターボタンのonClick変更
- ConditionModalに新しいpropsを追加、既存のロジックは一切変更なし
- **重要**: Next.js 15のSuspense boundary問題を回避、useSearchParamsを一時的に無効化
- Phase 3で適切なSuspense境界とともに実装予定、ESLintエラーすべて解決済み

---

## **Phase 3: URL管理機能実装（段階的有効化）**

### **Step 3-1: 機能フラグ導入** ✅ **完了**

**ファイル編集**: `src/app/todos/page.tsx`

```typescript
// src/app/todos/page.tsx
export default function TodosPage() {
  // Phase 3: 機能フラグ（段階的有効化用）
  const ENABLE_URL_FILTERS = false; // Phase 3-2でtrueに変更予定

  const { getFiltersFromURL } = useURLFilters();
  
  // 機能フラグで制御
  const handleConditionModalOpen = () => {
    if (ENABLE_URL_FILTERS) {
      // Phase 3-2で実装予定: URLフィルターから復元
      const urlFilters = getFiltersFromURL();
      setConditionModalInitialState({
        priorities: new Set(urlFilters.priorities),
        statuses: new Set(urlFilters.statuses)
      });
    } else {
      // 既存動作を維持（Phase 2と同じ）
      setConditionModalInitialState({
        priorities: new Set(),
        statuses: new Set()
      });
    }
    setShowConditionModal(true);
  };
}
```

**📅 実装完了日時**: 2025-07-04
**🔍 実装詳細**:
- `ENABLE_URL_FILTERS = false` 機能フラグを todos/page.tsx に追加
- `handleConditionModalOpen` を機能フラグで分岐実装
- 機能フラグfalse時: 既存動作を完全に維持（Phase 2と同一）
- 機能フラグtrue時: URLフィルターから復元（Phase 3-2で有効化予定）
- 未使用eslint-disableコメント削除、`getFiltersFromURL`の使用で警告解消
- false/true両方でビルド・動作確認済み、既存機能への影響なし

### **Step 3-2: useURLFiltersのURL更新機能実装** ✅ **完了**

**ファイル編集**: `src/hooks/useURLFilters.ts`

```typescript
// src/hooks/useURLFilters.ts
export function useURLFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const getFiltersFromURL = () => {
    const priorities = searchParams.get('priorities')?.split(',') || [];
    const statuses = searchParams.get('statuses')?.split(',') || [];
    return { priorities, statuses };
  };
  
  const updateFilters = (priorities: string[], statuses: string[]) => {
    const params = new URLSearchParams(searchParams);
    
    // 空の場合はパラメータを削除
    if (priorities.length === 0) {
      params.delete('priorities');
    } else {
      params.set('priorities', priorities.join(','));
    }
    
    if (statuses.length === 0) {
      params.delete('statuses');
    } else {
      params.set('statuses', statuses.join(','));
    }
    
    // ブラウザ履歴に追加してURL更新（scroll無効化）
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  return { getFiltersFromURL, updateFilters, isReady: true };
}
```

**📅 実装完了日時**: 2025-07-04
**🔍 実装詳細**:
- useSearchParams と useRouter を有効化、実際のURL読み取り・更新機能を実装
- `getFiltersFromURL`: URLパラメータを解析して配列で返す機能を実装
- `updateFilters`: URLSearchParams を使用してURL更新機能を実装
- 空配列の場合はパラメータ削除、値がある場合はカンマ区切りで設定
- **修正**: `router.push` で scroll:false を指定、ブラウザ履歴に記録
- **重要**: todos/page.tsx に Suspense境界を追加してNext.js 15要件を満たす
- TodosPageContent と TodosPage に分離、Suspense でラップ

### **Step 3-3: 機能フラグテスト** ✅ **完了**

1. **ENABLE_URL_FILTERS = false**で動作確認
2. **ENABLE_URL_FILTERS = true**に変更してURL管理をテスト
3. 問題があれば即座にfalseに戻す

**📅 実装完了日時**: 2025-07-04
**🔍 実装詳細**:
- `ENABLE_URL_FILTERS = true` に変更してURL管理機能を有効化
- ConditionModal の onSave ハンドラーを実装してURL更新機能を動作させる

#### **🚨 実装中に発見・修正した重要問題**:

**問題1: URLパラメータがUUID形式で人間が読めない**
- 修正前: `?priorities=c95322a9-1504-444e-ba19-5df8c91c6c4d`
- 修正後: `?priorities=高,中&statuses=未着手,進行中`
- **解決**: ConditionModal 内部の選択値管理をIDから名前ベースに変更

**問題2: ブラウザ履歴が機能しない（router.replace問題）**
- 現象: 戻るボタンで新規タブ状態に戻ってしまう
- 原因: `router.replace()` は履歴に残らない
- **解決**: `router.push()` に変更してブラウザ履歴に記録

**問題3: URL変化時にConditionModal初期値が自動更新されない**
- 現象: ブラウザ戻る/進むでURLが変化してもConditionModalの初期値が更新されない
- **解決**: URL変化監視機能を追加
  - `useURLFilters` フックに `currentFilters` 状態を追加
  - `todos/page.tsx` でURL変化を監視して `conditionModalInitialState` を自動更新

#### **追加実装**:
- **デバッグログ**: 動作確認用のコンソールログを追加
- **Suspense境界**: Next.js 15 要件に対応
- **名前⇔ID変換**: 将来のフィルタリング実装に備えた変換処理


### **✅ Phase 3 確認項目:**
- [x] `ENABLE_URL_FILTERS = false`でも既存動作が維持される
- [x] `ENABLE_URL_FILTERS = true`でURL管理が動作する
- [x] ブラウザの戻る/進むボタンで正常に動作する
- [x] URLパラメータが正しく設定・削除される
- [x] ページリロード時にフィルター状態が復元される
- [x] URLパラメータが人間が読みやすい形式になっている
- [x] ブラウザ履歴との完全同期が実現されている

---

## **Phase 4: フィルタリング機能統合**

### **Step 4-1: useTodosフック拡張** ✅ **完了**

**ファイル編集**: `src/hooks/useTodos.ts`

```typescript
// src/hooks/useTodos.ts
export function useTodos(userId: string | null, filterParams?: {
  priorityIds?: string[];
  statusIds?: string[];
}) {
  // 既存のuseEffectを拡張
  useEffect(() => {
    if (!userId) {
      setIsLoading(true);
      return;
    }
    setIsLoading(true);
    setError('');
    (async () => {
      try {
        let query = supabase
          .from('todos')
          .select(`
            *,
            priority:todo_priorities(*),
            status:todo_statuses(*)
          `)
          .eq('user_id', userId);
        
        // フィルターパラメータが存在する場合のみ適用
        if (filterParams?.priorityIds?.length) {
          query = query.in('todo_priority_id', filterParams.priorityIds);
        }
        if (filterParams?.statusIds?.length) {
          query = query.in('todo_status_id', filterParams.statusIds);
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data: todosData, error: todosError } = await query;
        
        if (todosError) {
          throw todosError;
        }
        
        setTodos(todosData || []);
      } catch {
        setError('ToDoの取得に失敗しました');
        setTodos([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId, filterParams]); // filterParamsを依存配列に追加
  
  // 既存のreturnは変更なし
}
```

**📅 実装完了日時**: 2025-07-04
**🔍 実装詳細**:
- `useTodos` 関数にオプショナル引数 `filterParams` を追加
- 既存のuseEffect内でフィルタークエリロジックを実装
- `filterParams?.priorityIds?.length` と `filterParams?.statusIds?.length` でフィルター適用判定
- 依存配列に `filterParams` を追加してフィルター変更時に再実行
- 既存機能への影響なし（backward compatibility完全維持）
- 全品質チェック完了（TypeScript, ESLint, Build）

### **Step 4-2: todos/page.tsxでの統合** ✅ **完了**

**ファイル編集**: `src/app/todos/page.tsx`

```typescript
// src/app/todos/page.tsx
export default function TodosPage() {
  const { getFiltersFromURL, updateFilters } = useURLFilters();
  const [activeFilters, setActiveFilters] = useState<{
    priorityIds: string[];
    statusIds: string[];
  }>({ priorityIds: [], statusIds: [] });
  
  // フィルターパラメータを useTodos に渡す
  const { 
    todos, 
    isLoading: loading, 
    error: todosError, 
    // ... 既存のreturn値
  } = useTodos(
    user?.id || null,
    ENABLE_URL_FILTERS ? {
      priorityIds: activeFilters.priorityIds,
      statusIds: activeFilters.statusIds
    } : undefined
  );
  
  // onSaveハンドラーを実装
  const handleConditionSave = async (priorities: Set<string>, statuses: Set<string>) => {
    if (ENABLE_URL_FILTERS) {
      const priorityIds = Array.from(priorities);
      const statusIds = Array.from(statuses);
      
      updateFilters(priorityIds, statusIds);
      setActiveFilters({ priorityIds, statusIds });
    }
    
    setShowConditionModal(false);
    return true;
  };
  
  // ConditionModalのonSaveを変更
  return (
    // ... 既存のJSX
    <ConditionModal
      isOpen={showConditionModal}
      onSave={handleConditionSave} // 変更箇所
      onCancel={() => setShowConditionModal(false)}
      initialPriorities={conditionModalInitialState.priorities}
      initialStatuses={conditionModalInitialState.statuses}
    />
  );
}
```

### **Step 4-3: URLからフィルター状態復元**

```typescript
// src/app/todos/page.tsx
export default function TodosPage() {
  // ページ読み込み時にURLからフィルター状態を復元
  useEffect(() => {
    if (ENABLE_URL_FILTERS && !prioritiesLoading && !statusesLoading) {
      const urlFilters = getFiltersFromURL();
      setActiveFilters({
        priorityIds: urlFilters.priorities,
        statusIds: urlFilters.statuses
      });
    }
  }, [ENABLE_URL_FILTERS, prioritiesLoading, statusesLoading]);
```

**📅 実装完了日時**: 2025-07-04
**🔍 実装詳細**:
- マスタデータフック（useTodoPriorities, useTodoStatuses）統合
- activeFilters状態でID変換後のフィルター値を管理
- useTodosにfilterParamsを渡すよう修正（useMemoで安定化）
- handleConditionSaveで名前→ID変換ロジックを実装
- URL変化監視とアクティブフィルター更新を統合（ブラウザバック対応）
- **重要修正**: 無限ループ問題を解決（useMemo、useEffect依存配列最適化）
- **重要修正**: ブラウザバック時のToDo一覧更新問題を解決
- ESLint警告解決（eslint-disable-next-line追加）
- 全品質チェック完了、ユーザー確認完了
}
```

### **✅ Phase 4 確認項目:**
- [ ] フィルターなしでも既存動作が維持される
- [ ] フィルター適用時に期待されるデータが表示される
- [ ] URLとフィルター状態が同期する
- [ ] ConditionModalの保存機能が正常に動作する
- [ ] ページリロード時にフィルターが復元される

---

## **Phase 5: UI状態表示・クリア機能**

### **Step 5-1: フィルター状態表示**

**ファイル編集**: `src/app/todos/page.tsx`

```typescript
// フィルター状態表示用の関数
const getActiveFiltersText = () => {
  const parts = [];
  if (activeFilters.priorityIds.length > 0) {
    parts.push(`優先度: ${activeFilters.priorityIds.length}件`);
  }
  if (activeFilters.statusIds.length > 0) {
    parts.push(`状態: ${activeFilters.statusIds.length}件`);
  }
  return parts.join(', ');
};

const hasActiveFilters = activeFilters.priorityIds.length > 0 || activeFilters.statusIds.length > 0;

// フィルターボタン近くに状態表示を追加
<div className="flex flex-col mb-6 bg-white/30 rounded-xl p-4 border border-white/20 shadow">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {ENABLE_URL_FILTERS && hasActiveFilters && (
        <div className="text-sm text-blue-600 font-medium">
          {getActiveFiltersText()}
        </div>
      )}
    </div>
    <div className="flex items-center gap-2">
      {ENABLE_URL_FILTERS && hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          クリア
        </button>
      )}
      <button
        onClick={handleConditionModalOpen}
        className="p-3 rounded-full hover:bg-black/10 transition-colors"
      >
        <SortAndFilterIcon 
          width="22" 
          height="22" 
          className="text-[#374151]"
        />
      </button>
    </div>
  </div>
</div>
```

### **Step 5-2: クリア機能実装**

```typescript
// src/app/todos/page.tsx
const handleClearFilters = () => {
  if (ENABLE_URL_FILTERS) {
    updateFilters([], []);
    setActiveFilters({ priorityIds: [], statusIds: [] });
  }
};
```

### **✅ Phase 5 確認項目:**
- [ ] フィルター状態が正しく表示される
- [ ] クリア機能が正常に動作する
- [ ] UI破壊が発生しない
- [ ] フィルター数が正確に表示される

---

## **Phase 6: 本格運用移行**

### **Step 6-1: 機能フラグ削除**

```typescript
// src/app/todos/page.tsx
// ENABLE_URL_FILTERS = false; を削除
// 条件分岐をすべて削除して本実装に統合

export default function TodosPage() {
  // 機能フラグ関連のコードを削除し、本実装に統合
  const handleConditionModalOpen = () => {
    // URL フィルターから復元（機能フラグ削除）
    const urlFilters = getFiltersFromURL();
    setConditionModalInitialState({
      priorities: new Set(urlFilters.priorities),
      statuses: new Set(urlFilters.statuses)
    });
    setShowConditionModal(true);
  };
  
  // その他の機能フラグ条件分岐も削除
}
```

### **Step 6-2: 最終確認・最適化**

**チェック項目:**
- [ ] パフォーマンステスト
- [ ] エラーハンドリング強化
- [ ] ユーザビリティ確認
- [ ] レスポンシブ対応確認
- [ ] アクセシビリティ確認

---

## **🔒 安全対策・復旧手順**

### **各Phase での確認コマンド**
```bash
# 型チェック
npm run typecheck

# リント
npm run lint

# ビルド確認
npm run build

# 開発サーバー起動
npm run dev
```

### **緊急復旧手順**
1. **git stash** で変更を一時保存
   ```bash
   git stash push -m "Phase X 実装中断"
   ```
2. **前のコミット** に戻す
   ```bash
   git reset --hard HEAD~1
   ```
3. **問題箇所を特定** し修正
4. **段階的に再適用**
   ```bash
   git stash pop
   # 問題箇所を修正後、再度実装
   ```

### **コミット戦略**
- 各Step完了時に必ずコミット
- コミットメッセージに実装内容を明記
- 問題発生時は即座にrevertできる状態を維持

**コミットメッセージ例:**
```
feat: Phase1-Step1 フィルター型定義追加

- src/types/filter.ts 新規作成
- FilterState, URLFilterParams インターフェース定義
- 既存UIに影響なし、型チェック通過確認済み
```

**🎯 Phase 1 実装済みコミットメッセージ:**
```
feat: Phase1 フィルター基盤準備完了

- src/types/filter.ts: FilterState, URLFilterParams型定義追加
- src/hooks/useURLFilters.ts: URLフィルター管理フック作成（読み取り専用）
- ESLintエラー対応済み、既存UI影響なし
- 全確認項目クリア、ユーザー動作確認完了

Phase 1: 基盤準備（UI影響なし） ✅ 完了
```

**🎯 Phase 2 実装済みコミットメッセージ:**
```
feat: Phase2 ConditionModal拡張完了

- ConditionModalに initialPriorities, initialStatuses オプショナルprops追加
- デフォルト値で既存動作完全維持、初期値復元useEffect追加
- todos/page.tsx: useURLFilters統合、conditionModalInitialState状態追加
- handleConditionModalOpen作成、フィルターボタンonClick変更
- Next.js 15 Suspense boundary問題回避、useSearchParams一時無効化
- 全確認項目クリア、ユーザー動作確認完了

Phase 2: ConditionModal拡張（UI破壊防止） ✅ 完了
```

### **注意事項**
- 各Phaseで必ず動作確認を行う
- 問題が発生した場合は即座に前の段階に戻す
- TypeScriptエラーは必ず解決してから次に進む
- UIの破壊が発生した場合は即座に作業を中断し、原因を特定する

### **🎓 Phase 3実装で学んだ重要な教訓**

#### **1. 「実装完了」の基準**
- **✅ 正しい**: 実際にブラウザで動作確認済み
- **❌ 間違い**: コードが「正しく見える」だけで動作未確認

#### **2. ブラウザAPI の理解**
- **router.replace()**: 履歴に残らない（現在のURLを置換）
- **router.push()**: 履歴に記録される（新しいエントリを追加）
- **用途を正しく理解**して選択する

#### **3. 段階的実装の重要性**
- 問題は **実装中に必ず発見される**
- 各段階での **動作確認は必須**
- 問題発見時は **即座に修正**する

#### **4. ユーザビリティの配慮**
- **UUID は人間が読めない** → 名前ベースに変更
- **ブラウザ履歴の動作** はユーザー体験に直結
- **URLの可読性** は共有・ブックマーク時に重要

---

## **📋 実装チェックリスト**

### **Phase 1: 基盤準備** ✅ **完了**
- [x] Step 1-1: 型定義追加完了
- [x] Step 1-2: useURLFiltersフック作成完了  
- [x] Phase 1 確認項目すべてクリア
- [x] **ユーザー確認完了（2025-07-04）**

### **Phase 2: ConditionModal拡張** ✅ **完了**
- [x] Step 2-1: ConditionModal props拡張完了
- [x] Step 2-2: todos/page.tsx安全統合完了
- [x] Phase 2 確認項目すべてクリア
- [x] **ユーザー確認完了（2025-07-04）**

### **Phase 3: URL管理機能** ✅ **完了**
- [x] Step 3-1: 機能フラグ導入完了 ✅ **（2025-07-04完了）**
- [x] Step 3-2: URL更新機能実装完了 ✅ **（2025-07-04完了）**
- [x] Step 3-3: 機能フラグテスト完了 ✅ **（2025-07-04完了）**
- [x] Phase 3 確認項目すべてクリア
- [x] **URLパラメータ人間可読化対応完了（2025-07-04）**
- [x] **ブラウザ履歴同期機能完了（2025-07-04）**
- [x] **実装中問題発見・修正完了（2025-07-04）**

### **Phase 4: フィルタリング統合**
- [x] Step 4-1: useTodosフック拡張完了 ✅ **（2025-07-04完了）**
- [x] Step 4-2: todos/page.tsx統合完了 ✅ **（2025-07-04完了）**
- [ ] Step 4-3: URL復元機能完了
- [ ] Phase 4 確認項目すべてクリア

### **Phase 5: UI状態表示**
- [ ] Step 5-1: フィルター状態表示完了
- [ ] Step 5-2: クリア機能実装完了
- [ ] Phase 5 確認項目すべてクリア

### **Phase 6: 本格運用**
- [ ] Step 6-1: 機能フラグ削除完了
- [ ] Step 6-2: 最終確認・最適化完了
- [ ] Phase 6 確認項目すべてクリア

---

## **🚀 今後の改善予定**

### **ユーザビリティ改善**

#### **Loading表示の最適化**
- **現状**: フィルター条件変更時に「Loading...」が一瞬表示される
- **理由**: データベースクエリ再実行時の正常な動作
- **改善案**:
  1. **スケルトンローディング**: 既存のToDo項目をグレーアウト表示
  2. **ローディング時間短縮**: クライアントサイドフィルタリング（大量データ時は非推奨）
  3. **専用メッセージ**: 「フィルタリング中...」などのカスタムメッセージ
  4. **トランジション効果**: より滑らかな画面遷移の実装
- **優先度**: 中（基本機能完了後の改善項目）
- **実装時期**: Phase 6完了後またはPhase 7として実装

---

この計画により、**UI破壊を回避しながら確実にフィルター機能を実装**できます。各段階での確認を怠らず、問題が発生した場合は即座に前の段階に戻して原因を特定してください。