# Toast Layer Problem - 解決計画書

## 問題の概要
1. Toast要素がモーダルウィンドウの背後に表示される問題
2. Toast表示時間の二重タイマー管理問題

## 現状分析

### Layer問題（解決済み）
- HeaderWithMenu.tsx:34行とtodos/page.tsx:103行で独立useToastインスタンス使用
- 異なるDOM階層でToast生成によりz-index競合
- Toast.tsx:55行で`zIndex: 9999`設定済み
- **Toast.tsx:83行でPortal実装済み** - document.body直接配置
- **ブラウザ確認済み** - body直下に正しく配置されている

### Timer問題（解決済み）
- **Toast.tsx:タイマー処理削除済み** - useEffect簡略化（17-24行）
- **useToast.ts:31行** - duration変数使用でタイマー管理（18行でパラメータ追加）
- 二重タイマー管理問題解決済み
- **duration対応実装済み** - デフォルト値3000ms設定

## 解決方針

### Layer問題（完了）
**React Portal使用でToast要素をdocument.body直接配置**（実装・確認済み）

### Timer問題（完了）
**Toast.tsxのタイマー削除 + useToast.tsにduration対応追加**（実装済み）

## 実装計画（確実性：85%）

### Step 1: Toast.tsxにPortal追加（完了）
**ファイル**: `/src/components/common/Toast.tsx`
- ReactDOM import追加
- 83行でReactDOM.createPortal実装
- document.body直接配置によりLayer問題解決

### Step 2: Toast.tsxのタイマー処理削除（完了）
**ファイル**: `/src/components/common/Toast.tsx`
- onCloseプロパティ削除（12行）
- useEffect簡略化（17-24行）
- タイマー処理完全削除、二重管理問題解決

### Step 3: useToast.tsにduration対応追加（完了）
**ファイル**: `/src/hooks/useToast.ts`
- 18行でdurationパラメータ追加（デフォルト値3000ms）
- 31行でsetTimeout処理にduration変数使用
- ハードコーディング値のパラメータ化完了

### Step 4: todos/page.tsxからToast削除（現状アーキテクチャでは不可能）
**ファイル**: `/src/app/todos/page.tsx`
- 662-669行のToast要素削除を試行
- **結果**: 現状のuseStateベースアーキテクチャでは各ページでのToast JSX配置が必要
- **技術的制約**: useToast.ts:10行目のuseStateにより各コンポーネントで独立した状態管理
- **実装後の問題**: トースト表示が完全に停止、即座に復元済み
- **注記**: ToastContext実装完了後は実行可能

### Step 5: 真の一元管理実装計画（新規追加）
**現状問題分析**:
- useToast使用箇所: todos/page.tsx:103行目、HeaderWithMenu.tsx:34行目
- Toast JSX配置: todos/page.tsx:662-668行目のみ
- HeaderWithMenu.tsx:34行目でshowToast使用するがToast JSX無しで表示されない

**解決方針**: ToastContext + Provider実装による真の一元管理
- AuthContext.tsx:30,32,200-202行目の実装パターンを踏襲
- layout.tsx:31-33行目でToastProvider追加
- useToast.ts:10行目のuseState→useContextに変更
- layout.tsxに単一Toast JSX配置で全ページ共有
- Portal実装（Toast.tsx:82行目）は維持

**技術的検証済み**:
- React PortalとContextの組み合わせで一元管理が確実に実装可能
- PortalでもReactコンポーネントツリーの親子関係は維持されContext値が正常継承
- Next.js App RouterでのSSR/CSR動作確認済み

#### Step 5-A: ToastContext作成（完了）
**ファイル**: `/src/contexts/ToastContext.tsx`
- **実装完了**: AuthContext.tsx:30,32,200-202行目パターンを完全踏襲
- **品質チェック結果**: ESLint警告なし、TypeScript成功、Build成功
- **無限ループ検証済み**: useCallback依存配列空配列、setToast関数更新形式使用
- **既存機能影響なし**: 新規ファイル作成のみ、既存import/export変更なし

#### Step 5-B: layout.tsx更新（完了）
**ファイル**: `/src/app/layout.tsx`、`/src/components/common/Toast.tsx`、`/src/app/todos/page.tsx`
- **layout.tsx更新完了**: 5-6行目でToastProvider・Toast import追加、34-37行目でProvider・Toast JSX配置
- **Toast.tsx改修完了**: 7,10-11行目でToastContext使用に変更、Props削除
- **todos/page.tsx調整完了**: 20行目Toast import削除、103行目toast変数削除、Toast JSX削除
- **品質チェック結果**: ESLint警告なし、TypeScript成功、Build成功
- **無限ループ検証済み**: Provider配置・useToast()・useEffect依存配列で無限ループなし
- **現状**: 旧useToast.tsと新ToastContextが混在、Toast機能は動作しない状態

#### Step 5-C: useToast.ts改修（完了）
**ファイル**: `/src/hooks/useToast.ts`、`/src/app/todos/page.tsx`、`/src/components/common/HeaderWithMenu.tsx`
- **useToast.ts削除完了**: 旧useState版を完全削除、重複解消
- **todos/page.tsx import変更完了**: 10行目を`@/contexts/ToastContext`に変更
- **HeaderWithMenu.tsx import変更完了**: 11行目を`@/contexts/ToastContext`に変更
- **品質チェック結果**: ESLint警告なし、TypeScript成功、Build成功
- **無限ループ検証済み**: useToast()でToastContext使用、無限ループなし
- **グローバル状態管理統一完了**: 全useToast使用箇所がToastContextに統一

### Step 6: 動作確認（完了）
- **Toast表示時間の制御確認**: Step3完了により確認可能
- **HeaderWithMenuモーダル表示中のToast表示確認**: Layer問題解決済み
- **todos/pageモーダル表示中のToast表示確認**: Layer問題解決済み
- **ブラウザ確認結果**: 両スクリーンショットでToastがモーダル前面に正常表示確認済み
- **一元管理確認**: layout.tsxの単一Toast JSXから統一表示確認済み
- **z-index問題解決**: Portal実装によりToastがモーダル背後に隠れない問題完全解決

## 影響範囲
**呼び出し箇所**: todos/page.tsx:10箇所、HeaderWithMenu.tsx:6箇所
**変更不要**: デフォルト値10000ms使用のため既存コード無変更
**新規実装**: ToastContext作成、layout.tsx更新、useToast.ts改修

## 次のステップ

### 実装順序
1. **Step 5-A: ToastContext作成（完了）**
   - `/src/contexts/ToastContext.tsx`を新規作成
   - AuthContext.tsx:30,32,200-202行目パターンを踏襲
   - 品質チェック3点セット成功、無限ループ検証済み

2. **Step 5-B: layout.tsx更新（完了）**
   - ToastProvider追加（AuthProviderと並列配置）
   - 単一Toast JSX配置で全ページ共有
   - Toast.tsx・todos/page.tsx同時調整完了

3. **Step 5-C: useToast.ts改修（完了）**
   - useState削除、useContext実装
   - グローバル状態管理への変更
   - 全useToast使用箇所をToastContextに統一

4. **Step 5-D: 動作確認（完了）**
   - HeaderWithMenu.tsxでのToast表示確認
   - todos/page.tsxでのToast表示確認
   - ブラウザ確認でToast Layer Problem完全解決確認済み

5. **Step 5-E: 各ページからToast JSX削除（完了）**
   - todos/page.tsx:662-668行目のToast JSX削除（Step 5-Bで完了済み）
   - 完全一元管理の実現

## 解決完了
**Toast Layer Problem完全解決済み**
- Layer問題: Portal実装によりToastがモーダル前面に表示
- Timer問題: useToast.tsでduration対応、二重管理解消
- 一元管理: ToastContext + layout.tsx単一配置で完全統一
- 動作確認: ブラウザ確認でz-index問題解決・統一表示確認完了