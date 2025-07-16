# Toast Layer Problem - 解決計画書

## 問題の概要
Toast要素がモーダルウィンドウの背後に表示される問題。z-index設定にも関わらず、複数の独立useToastインスタンスが異なるDOM階層で競合している。

## 現状分析

### 技術的根拠
1. **複数の独立Toast状態**
   - HeaderWithMenu.tsx:34行 - 独立useToastインスタンス
   - todos/page.tsx:103行 - 独立useToastインスタンス
   - 各インスタンスが別々のDOM位置でToast要素を生成

2. **DOM階層の競合**
   - HeaderWithMenuのモーダル群とtodos/pageのToastが異なる親要素配下
   - stacking contextの分離により、z-index値だけでは解決不可

3. **現在のz-index設定**
   - Toast.tsx:66行 - `zIndex: 9999`（インラインスタイル）
   - MenuModal等 - `z-[100]`（TailwindCSS）

## 解決方針

### 中央集約型Toast管理システム
React Context + React Portalを使用した統一Toast管理システムの構築

## 実装計画（確実性：85%）

### Step 1: ToastContextの作成
**ファイル**: `/src/contexts/ToastContext.tsx`
**確実性**: 95%
**根拠**: AuthContext.tsxと同一パターン適用

```typescript
// ToastContext実装内容
interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
}

// React Portal使用でdocument.body直接配置
const ToastProvider: React.FC<{ children: React.ReactNode }>
```

**リスク**: なし（既存AuthContextパターンの踏襲）

### Step 2: layout.tsxへのToastProvider追加
**ファイル**: `/src/app/layout.tsx`
**確実性**: 95%
**根拠**: 既存AuthProvider配置パターンと同一

```typescript
// layout.tsx:31-33行の変更
<AuthProvider>
  <ToastProvider>
    {children}
  </ToastProvider>
</AuthProvider>
```

**リスク**: なし（単純な追加のみ）

### Step 3: useToast.tsの更新
**ファイル**: `/src/hooks/useToast.ts`
**確実性**: 90%
**根拠**: useAuthと同様のContext使用パターン

```typescript
// useToast.ts全体をContext使用版に変更
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
```

**リスク**: 既存のuseToast呼び出し箇所の互換性（インターフェース同一により解決）

### Step 4: Toast.tsxへのPortal適用
**ファイル**: `/src/components/common/Toast.tsx`
**確実性**: 90%
**根拠**: React 19.0.0でPortal標準サポート確認済み

```typescript
// Toast.tsx:ReactDOM.createPortal使用
return toast.isShow 
  ? ReactDOM.createPortal(
      <div style={{ zIndex: 9999, /* 既存スタイル */ }}>
        {/* 既存Toast UI */}
      </div>,
      document.body
    )
  : null;
```

**リスク**: SSR時のdocument.body未定義（useEffect内でのPortal生成により解決）

### Step 5: 各ファイルでのToast要素削除
**対象ファイル**: 
- `/src/app/todos/page.tsx` (662-669行のToast要素削除)
**確実性**: 95%
**根拠**: 単純な削除操作

**リスク**: なし（ToastProviderで全体管理のため不要）

### Step 6: 動作確認とテスト
**確認項目**:
1. HeaderWithMenuからのToast表示（モーダル表示中）
2. todos/pageからのToast表示（モーダル表示中）
3. Toast要素がdocument.body直下に配置されることの確認

**確実性**: 80%
**根拠**: ブラウザでの実際の表示確認が必要

## 全体の確実性評価

### 高確実性要素（95%）
- Context実装（AuthContextパターン踏襲）
- Provider追加（既存パターン踏襲）
- 既存ファイルからのToast削除（単純削除）

### 中確実性要素（90%）
- useToastフック更新（Context使用への変更）
- Toast Portal実装（React 19.0.0サポート確認済み）

### 低確実性要素（80%）
- 最終的なブラウザ表示確認（実装後の動作確認必要）

## 総合確実性：85%

### 80%未満にならない理由
1. **既存パターンの踏襲**: AuthContextの確立された実装パターンを使用
2. **技術的裏付け**: React 19.0.0でPortal完全サポート確認済み
3. **影響範囲限定**: インターフェース互換性維持により既存呼び出し箇所への影響最小
4. **段階的実装**: 各ステップが独立しており、問題発生時の切り戻し可能

### 残りの15%の不確実性
- ブラウザ実装後の実際の表示動作確認が必要
- 各種モーダルとの相互作用確認が必要

## 品質保証

### 実装後必須チェック
```bash
npm run lint && npm run typecheck && npm run build
```

### テスト項目
1. HeaderWithMenuのモーダル表示中Toast表示
2. todos/pageのモーダル表示中Toast表示  
3. Toast要素のDOM配置確認（document.body直下）
4. z-index有効性確認

## 虚偽チェック結果
- ✅ 全ファイル内容確認済み（具体的行番号記載）
- ✅ 技術的根拠明確（React Portal、Context実装確認済み）
- ✅ 確実性評価根拠明確（既存パターン踏襲）
- ✅ 実装手順具体的（コード例付き）

**虚偽なし - 実装可能状態**