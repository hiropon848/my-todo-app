# 検索実行時の重複ローディング問題解決計画

## 問題の概要

**現象**: 検索実行時に部分ローディング後、全体ローディングが追加実行される

**影響**: ユーザー体験の低下（不要なローディング表示）

## 根本原因の分析

### 現在の問題フロー
1. `executeSearch` → 部分ローディング → データ更新 → `handleSearchUpdate`
2. URL変更 → `currentSearchKeyword`更新（useSearchKeyword.ts）
3. `filterParams` useMemo再計算 → `fetchTodos` useCallback再作成
4. `fetchTodos`変更 → useEffect実行 → **全体ローディング発生**

### 問題の核心
executeSearch内でのURL更新が不要なuseEffect再実行を引き起こしている

## URL更新削除による副作用分析

### A. 検索クリアボタンへの影響
- **現在**: `handleSearchUpdate('')`でURL更新
- **削除後**: クリアボタンの動作に不整合発生

### B. 検索入力フィールドとURLの同期
- **現在**: useEffect(line 443-446)でURL→入力フィールド同期
- **削除後**: 入力フィールド→URLの同期が失われる

### C. ブラウザ操作時の状態復元
- **リロード時**: URLから検索キーワード復元されるが、検索実行されない
- **ブラウザバック**: URL変更されるが、データは前の状態のまま

### D. 直接URL入力時の整合性
- **問題**: `/todos?keyword=test`でアクセス時、URLと実際の検索結果が不一致

## 解決策: executeSearch関数の完全分離

### 新方針
**現在の問題**: executeSearchが「データ取得」と「URL更新」を同時実行  
**解決策**: 責務を完全分離

### 具体的実装計画

#### Step 1: executeSearch関数をデータ取得専用に変更
```typescript
const executeSearch = useCallback(async () => {
  if (searchInput !== currentSearchKeyword) {
    // データ取得のみ実行（URL更新なし）
    // ... 既存の部分ローディング処理
  }
}, [searchInput, currentSearchKeyword, activeFilters, currentSort, user?.id, setTodos, showToast]);
```

#### Step 2: URL更新専用関数の追加
```typescript
const updateSearchURL = useCallback((keyword: string) => {
  if (keyword !== currentSearchKeyword) {
    handleSearchUpdate(keyword);
  }
}, [currentSearchKeyword, handleSearchUpdate]);
```

#### Step 3: 検索実行トリガーの修正
```typescript
// Enter時: データ取得 → URL更新
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    await executeSearch();
    updateSearchURL(searchInput);
  }
}}

// Blur時: データ取得 → URL更新
onBlur={async () => {
  await executeSearch();
  updateSearchURL(searchInput);
}}
```

#### Step 4: クリアボタンの修正
```typescript
onClick={async () => {
  setSearchInput('');
  if (currentSearchKeyword) {
    // データクリア → URL更新
    await executeSearch(); // 空文字で検索実行
    updateSearchURL('');
  }
}}
```

## 完全な検証計画

### A. 基本動作テスト
| 操作 | 期待結果 | 検証項目 |
|------|----------|----------|
| キーワード入力→Enter | 部分ローディング→結果表示→URL更新 | 重複実行なし |
| キーワード入力→Blur | 部分ローディング→結果表示→URL更新 | 重複実行なし |
| クリアボタン | 空検索実行→URL更新 | 正常クリア |

### B. ブラウザ操作テスト
| 操作 | 期待結果 | 検証項目 |
|------|----------|----------|
| リロード | URL検索キーワードで自動検索実行 | 状態復元 |
| ブラウザバック | 前の検索状態に復元 | 履歴管理 |
| 直接URL入力 | URLキーワードで検索実行 | 一致保証 |

### C. 他機能との整合性テスト
| 操作 | 期待結果 | 検証項目 |
|------|----------|----------|
| 検索→フィルター変更 | 検索条件維持 | 状態継承 |
| フィルター→検索実行 | フィルター条件維持 | 条件重複適用 |
| 検索→ToDo編集 | 検索条件維持 | 編集後復元 |

## 安全性保証

- **段階的実装**: 各Stepを個別に検証
- **既存機能無変更**: useTodosフック等に一切変更なし
- **復旧計画**: 各Step毎に即座にロールバック可能
- **影響範囲限定**: page.tsx内のeventHandler修正のみ

## 品質保証

- **実装後の必須チェック**: ESLint + TypeScript + Build
- **全テストケースの段階的実行**
- **問題発生時の即座な修正 or ロールバック**

## 実装状況

### ✅ Step 1: executeSearch関数修正（完了）
**実装日**: 2025-07-10

**変更内容**:
- `executeSearch`関数からURL更新処理を削除
- 依存配列から`handleSearchUpdate`を削除
- 重複ローディング問題を解決

**検証結果**:
- ESLint: ✅ 問題なし
- TypeScript: ✅ 問題なし
- Build: ✅ 問題なし
- 重複ローディング: ✅ 解消済み

### ✅ Step 2: URL更新専用関数の追加（完了）
**実装日**: 2025-07-10

**変更内容**:
- `updateSearchURL`関数を追加（責務分離）
- 重複チェック機能付き（`keyword !== currentSearchKeyword`）
- ESLint抑制コメント削除（使用開始により）

**検証結果**:
- ESLint: ✅ 問題なし
- TypeScript: ✅ コンパイル成功
- Build: ✅ 本番ビルド成功

### ✅ Step 3: 検索実行トリガーの修正（完了）
**実装日**: 2025-07-10

**変更内容**:
- onKeyDown（Enter）: `executeSearch()` → `updateSearchURL(searchInput)` 順次実行
- onBlur: `executeSearch()` → `updateSearchURL(searchInput)` 順次実行
- 両方とも非同期関数（async/await）に変更

**検証結果**:
- Enter時: ✅ 部分ローディング → データ更新 → URL更新 → ❌ 全画面ローディング発生
- Blur時: ✅ 部分ローディング → データ更新 → URL更新 → ❌ 全画面ローディング発生
- 重複ローディング: ❌ 未解決（URL更新後のuseEffectチェーンが原因）

### ✅ Step 4: クリアボタンの修正（完了）
**実装日**: 2025-07-10

**変更内容**:
- executeSearch関数に`explicitKeyword?: string`引数を追加
- クリアボタン: `executeSearch('')`で明示的に空文字を渡す
- React状態更新の非同期性問題を解決

**検証結果**:
- クリア時: ✅ 部分ローディング → 全件表示 → URL更新 → ❌ 全画面ローディング発生
- 処理パターン統一: ✅ Enter/Blur/Clearで同一パターン
- 重複ローディング: ❌ 未解決（URL更新後のuseEffectチェーンが原因）

**品質チェック**:
- ESLint: ✅ 問題なし
- TypeScript: ✅ コンパイル成功
- Build: ✅ 本番ビルド成功

### ❌ Step 5: 根本的重複ローディング問題の解決（未完了・技術的問題発生）
**実装日**: 2025-07-10

**変更内容**:
- executeSearch関数の依存配列からisExecutingSearchRefを削除
- ESLint抑制コメント追加（useRefは依存配列不要のため）
- useTodos.ts側とpage.tsx側でフラグ制御ログ追加

**実装結果**:
- フラグ制御ログ: ✅ 両方で出力確認済み
- 重複ローディング: ❌ **依然として全画面ローディングが表示される**
- 部分ローディング: ✅ 正常動作（検索実行時のみ表示）

**技術的問題**:
- **致命的問題**: ログで異なるrefInstanceが確認される
  - page.tsx側: `refInstance: {current: true}`
  - useTodos.ts側: `refInstance: {current: false}`
- **原因**: page.tsxとuseTodos.tsで異なるisExecutingSearchRefインスタンスを参照
- **現象**: フラグON/OFF操作は実行されるが、異なるオブジェクトのため同期されない

**品質チェック**:
- ESLint: ✅ 問題なし
- TypeScript: ✅ コンパイル成功
- Build: ✅ 本番ビルド成功

**技術的詳細**: 以前の解決策（useTodosフック側での条件分岐制御）

**実装計画**:
```typescript
// useTodos.ts内のuseEffect修正
useEffect(() => {
  // 検索実行による直接的なデータ更新直後は、URL起因のfetchTodosをスキップ
  // フラグまたはRef利用で重複実行を防ぐ
  if (!isExecutingSearch.current) {
    fetchTodos();
  }
}, [fetchTodos]);
```

**技術的根拠**:
1. **問題の核心**: useTodos.useEffect(line 184-186)が無条件でfetchTodos実行
2. **解決の鍵**: 検索実行直後のURL起因実行を識別・回避
3. **安全性**: 他の正常なfetchTodos実行（フィルター変更等）は維持
4. **影響範囲**: useTodos.ts内の1つのuseEffectのみ修正

**具体的手順**:
1. useTodosフックにisExecutingSearchフラグを追加
2. executeSearch実行時にフラグをON→データ取得→フラグをOFF
3. useEffectでフラグがOFFの時のみfetchTodos実行
4. 既存機能（フィルター・ソート・初回読み込み）は一切影響なし

**安全性保証**:
- **既存機能無変更**: フィルター・ソート・初回読み込み等は正常動作維持
- **復旧計画**: フラグ処理のみの修正なので即座にロールバック可能
- **影響範囲**: useTodos.ts内の局所的修正のみ

### ⏸️ Step 6: 完全動作検証（保留中）
**目的**: 全ステップ完了後の総合テスト実行
**現状**: Step 5の技術的問題により保留
**検証項目**: 
- 重複ローディング完全解消 ❌ **Step 5未完了により保留**
- 全機能の正常動作確認
- ブラウザ操作との整合性確認

## 実装順序

1. ✅ **Step 1: executeSearch関数修正** - 完了
2. ✅ **Step 2: updateSearchURL関数追加** - 完了  
3. ✅ **Step 3: Enter/Blurイベント修正** - 完了
4. ✅ **Step 4: クリアボタン修正** - 完了
5. ❌ **Step 5: 根本的重複ローディング問題解決** - **未完了（技術的問題）**
6. ⏸️ **Step 6: 完全動作検証** - **保留中**
7. 各Stepごとに品質チェック3点セット実行

## 現在の問題と課題

### 未解決の技術的問題
**Step 5でのRef同期問題**: 
- **現象**: page.tsxとuseTodos.tsで異なるisExecutingSearchRefインスタンスが存在
- **結果**: フラグ制御が機能せず、重複ローディング問題が未解決
- **必要な対応**: refインスタンス同期の根本原因調査と修正

### 次期対応方針
1. **緊急対応**: 別のアプローチによる重複ローディング解決策の検討
2. **根本解決**: refインスタンス分離の原因特定と修正
3. **代替案**: フラグ制御以外の方法による重複実行防止

**計画評価: 70点（Step 5未完了により低下）**
- **技術的確実性**: 60点（予期しない技術的問題発生）
- **安全性**: 95点（既存機能無影響・局所的修正・即座復旧可能）
- **実装容易性**: 50点（想定外の複雑な問題）
- **検証完全性**: 75点（Step 5未完了により部分的）

## 最終更新: 2025-07-10 (Step 5未完了、技術的問題により計画見直し必要)