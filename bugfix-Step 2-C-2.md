# bugfix-Step 2-C-2.md

## 🎯 目的
エラー発生時の挙動を統一し、以下の動作を実現する：
- ヘッダー下には「ToDoの追加に失敗しました」を表示しない
- トーストに操作固有のメッセージ（「ToDoの追加に失敗しました」等）を表示
- エラー復旧UIにエラー種別に応じたメッセージを表示

## 📋 現状の問題点

### ファイル確認結果
- src/hooks/useTodoDatabase.ts 12行目: `const [error, setError] = useState('')`
- ~~src/hooks/useTodoDatabase.ts 96行目: `setError('ToDoの追加に失敗しました')`~~ **Step 1で削除済み**
- src/hooks/useFilteredTodos.ts 22行目: `const { error: databaseError, ... } = useTodoDatabase()`
- src/hooks/useFilteredTodos.ts 345行目: `const combinedError = error || databaseError`
- src/hooks/useTodos.ts 19行目: `error,` (useFilteredTodosから取得)
- src/app/todos/page.tsx 95行目: `error: todosError,` (useTodosから取得)
- src/app/todos/page.tsx 586-590行目: ヘッダー下にtodosErrorを表示
- src/app/todos/page.tsx 276行目: 新規作成時 `showToast(classifiedError.message, 'error')`
- src/app/todos/page.tsx 195行目: 編集時 `showToast(classifiedError.message, 'error')`
- src/app/todos/page.tsx 233行目: 削除時 `showToast(classifiedError.message, 'error')`
- src/components/TodoAddModal.tsx 103-114行目: validateTitle関数（バリデーションエラー）
- src/components/TodoAddModal.tsx 295行目: onBlurでvalidateTitle実行

### 技術的根拠
**Step 1完了後の状況**:
- ~~useTodoDatabase.ts:96でsetError('ToDoの追加に失敗しました')~~ **削除済み**
- バリデーションエラー（32,47,64行目）は維持されヘッダー下表示継続
- 新規作成時のネットワークエラーはヘッダー下表示されない

**残存問題**:
1. トーストにclassifiedError.message（「インターネット接続に問題があります」等）が表示される（全操作共通）
2. 操作固有のメッセージがトーストに表示されない

## 🔧 修正計画

### ~~Step 1: CRUD例外エラー時のsetError削除~~ ✅ **完了**
**修正対象**: ~~src/hooks/useTodoDatabase.ts~~

- ~~addTodo 96行目: `setError('ToDoの追加に失敗しました');` を削除~~ ✅ **完了**
- 理由: 97-100行目でthrow処理があるため、ヘッダー下表示とエラー復旧UI両方が表示される
- updateTodo, deleteTodoにはsetError呼び出しなし（修正不要）
- バリデーションエラー（32,47,64行目）は維持（例外を投げないため）

### ~~Step 2: トーストメッセージの修正~~ ✅ **完了**
**修正対象**: src/app/todos/page.tsx

#### ~~2-1. handleAddModalSave（新規作成）~~ ✅ **完了**
- ~~276行目: `showToast(classifiedError.message, 'error')`~~ 
  → `showToast('ToDoの追加に失敗しました', 'error')` ✅

#### ~~2-2. handleModalSave（編集）~~ ✅ **完了**
- ~~195行目: `showToast(classifiedError.message, 'error')`~~
  → `showToast('ToDoの更新に失敗しました', 'error')` ✅

#### ~~2-3. handleDeleteConfirm（削除）~~ ✅ **完了**
- ~~233行目: `showToast(classifiedError.message, 'error')`~~
  → `showToast('ToDoの削除に失敗しました', 'error')` ✅

### Step 3: エラー復旧UIの確認
**確認対象**: src/app/todos/page.tsx 575-583行目のErrorRecoveryコンポーネント

#### 3-1. エラー復旧UI表示確認
- setLastError(classifiedError)により、ErrorRecoveryコンポーネントが適切に表示される
- エラー復旧UIにはclassifiedError.messageが表示される（変更不要）

#### 3-2. 再試行ボタン機能確認
- src/app/todos/page.tsx 147-169行目のhandleRetry実装
- **現在の実装**: 簡易版（1秒後にエラー状態クリア+トースト表示のみ）
- **実際の操作再実行機能**: 未実装

**handleRetryの現在の動作**:
1. 再試行ボタンをクリック
2. isRetrying=trueでローディング状態
3. 1秒後にsetLastError(null)でエラー復旧UIが消える
4. トースト「再試行しました。問題が続く場合はページを再読み込みしてください。」表示

## 📊 影響範囲
- ~~src/hooks/useTodoDatabase.ts（addTodoの96行目setError削除のみ）~~ ✅ **完了**
- ~~src/app/todos/page.tsx（3箇所のshowToast変更: 276行目、195行目、233行目）~~ ✅ **完了**
- バリデーションエラーのヘッダー下表示は維持
- エラー復旧UIの表示ロジックには影響なし

## ✅ 実装後の動作確認項目
1. **Step 1完了後の確認（実施済み）**
   - オフライン状態で新規作成時にヘッダー下エラー表示されないこと ✅
   - バリデーションエラー（タイトルフォーカスアウト）でヘッダー下表示されること ✅

2. **Step 2完了後の確認（実施必要）**
   - オフライン状態で新規作成: トースト「ToDoの追加に失敗しました」
   - オフライン状態で編集: トースト「ToDoの更新に失敗しました」  
   - オフライン状態で削除: トースト「ToDoの削除に失敗しました」
   - エラー復旧UI: 「インターネット接続に問題があります...」（全操作共通）

3. **Step 3完了後の確認（実施必要）**
   - エラー復旧UIが適切に表示されること
   - 再試行ボタンの動作確認（現在の簡易実装での動作）

## 🚨 無限ループ検証
- setError削除によりエラー状態変更なし
- トースト文字列変更のみ
- 無限ループの可能性なし

## 📝 品質チェック項目
実装後に以下を実行：
```bash
npm run lint && npm run typecheck && npm run build
```

## 🎯 次ステップの判断基準
**Step 3確認完了後の判断**:
1. **現在の簡易実装で十分** → Step 2-C-2完了
2. **実際の再試行機能が必要** → 追加実装計画（problem-20250714.md参照）

**実際の再試行機能とは**:
- 失敗した操作（addTodo/updateTodo/deleteTodo）の再実行
- 操作コンテキストの保存と復元
- より高度な復旧手順の提供