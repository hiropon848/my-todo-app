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

### **Step 3-1: 機能フラグ導入**

**ファイル編集**: `src/app/todos/page.tsx`

```typescript
// src/app/todos/page.tsx
const ENABLE_URL_FILTERS = false; // 開発時にtrueに変更

export default function TodosPage() {
  const { getFiltersFromURL, updateFilters } = useURLFilters();
  
  // 機能フラグで制御
  const handleConditionModalOpen = () => {
    if (ENABLE_URL_FILTERS) {
      // URL フィルターから復元
      const urlFilters = getFiltersFromURL();
      setConditionModalInitialState({
        priorities: new Set(urlFilters.priorities),
        statuses: new Set(urlFilters.statuses)
      });
    } else {
      // 既存動作を維持
      setConditionModalInitialState({
        priorities: new Set(),
        statuses: new Set()
      });
    }
    setShowConditionModal(true);
  };
}
```

### **Step 3-2: useURLFiltersのURL更新機能実装**

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
    
    // ページ遷移ではなくURLの更新のみ
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  
  return { getFiltersFromURL, updateFilters, isReady: true };
}
```

### **Step 3-3: 機能フラグテスト**

1. **ENABLE_URL_FILTERS = false**で動作確認
2. **ENABLE_URL_FILTERS = true**に変更してURL管理をテスト
3. 問題があれば即座にfalseに戻す

### **✅ Phase 3 確認項目:**
- [ ] `ENABLE_URL_FILTERS = false`でも既存動作が維持される
- [ ] `ENABLE_URL_FILTERS = true`でURL管理が動作する
- [ ] ブラウザの戻る/進むボタンで正常に動作する
- [ ] URLパラメータが正しく設定・削除される
- [ ] ページリロード時にフィルター状態が復元される

---

## **Phase 4: フィルタリング機能統合**

### **Step 4-1: useTodosフック拡張**

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

### **Step 4-2: todos/page.tsxでの統合**

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

### **Phase 3: URL管理機能**
- [ ] Step 3-1: 機能フラグ導入完了
- [ ] Step 3-2: URL更新機能実装完了
- [ ] Step 3-3: 機能フラグテスト完了
- [ ] Phase 3 確認項目すべてクリア

### **Phase 4: フィルタリング統合**
- [ ] Step 4-1: useTodosフック拡張完了
- [ ] Step 4-2: todos/page.tsx統合完了
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

この計画により、**UI破壊を回避しながら確実にフィルター機能を実装**できます。各段階での確認を怠らず、問題が発生した場合は即座に前の段階に戻して原因を特定してください。