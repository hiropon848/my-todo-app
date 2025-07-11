# boolean型変数の「isXxxXxx」フォーマット違反一覧

## 概要
このドキュメントは、アプリケーション内のboolean型変数で「isXxxXxx」フォーマットに従っていない変数を一覧化したものです。

## 違反変数一覧

| ファイル名 | 該当する変数名 | 行番号 | 備考 |
|------------|----------------|--------|------|
| `src/contexts/AuthContext.tsx` | `showCompleted` | 10行目 | インターフェース定義のプロパティ |
| `src/components/TodoAddModal.tsx` | `titleTouched` | 26行目 | useState変数 |
| `src/components/TodoAddModal.tsx` | `titleFocused` | 27行目 | useState変数 |
| `src/components/TodoAddModal.tsx` | `showModal` | 29行目 | useState変数 |
| `src/components/TodoEditModal.tsx` | `titleTouched` | 37行目 | useState変数 |
| `src/components/TodoEditModal.tsx` | `titleFocused` | 38行目 | useState変数 |
| `src/components/TodoEditModal.tsx` | `showModal` | 40行目 | useState変数 |
| `src/components/auth/AuthForm.tsx` | ✅ `emailTouched` | 13行目 | useState変数 |
| `src/components/auth/AuthForm.tsx` | ✅ `emailFocused` | 14行目 | useState変数 |
| `src/components/auth/AuthForm.tsx` | ✅ `passwordTouched` | 18行目 | useState変数 |
| `src/components/auth/AuthForm.tsx` | ✅ `passwordFocused` | 19行目 | useState変数 |
| `src/components/auth/AuthForm.tsx` | ✅ `showPassword` | 74行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `currentPasswordTouched` | 16行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `currentPasswordFocused` | 17行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `showCurrentPassword` | 19行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `newPasswordTouched` | 22行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `newPasswordFocused` | 23行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `showNewPassword` | 25行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `confirmPasswordTouched` | 28行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `confirmPasswordFocused` | 29行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `showConfirmPassword` | 31行目 | useState変数 |
| `src/components/common/PasswordModal.tsx` | `showModal` | 34行目 | useState変数 |
| `src/components/common/ConfirmModal.tsx` | ✅ `showModal` | 29行目 | useState変数 |
| `src/components/common/ConditionModal.tsx` | ✅ `showModal` | 34行目 | useState変数 |
| `src/components/auth/ProfileForm.tsx` | ✅ `lastNameTouched` | 8行目 | useState変数 |
| `src/components/auth/ProfileForm.tsx` | ✅ `lastNameFocused` | 9行目 | useState変数 |
| `src/components/auth/ProfileForm.tsx` | ✅ `firstNameTouched` | 13行目 | useState変数 |
| `src/components/auth/ProfileForm.tsx` | ✅ `firstNameFocused` | 14行目 | useState変数 |
| `src/app/reset-password/page.tsx` | ✅ `emailTouched` | 7行目 | useState変数 |
| `src/app/reset-password/page.tsx` | ✅ `emailFocused` | 8行目 | useState変数 |
| `src/app/todos/page.tsx` | `showTodoEditModal` | 38行目 | useState変数 |
| `src/app/todos/page.tsx` | `showTodoDeleteModal` | 51行目 | useState変数 |
| `src/app/todos/page.tsx` | `showProfileModal` | 53行目 | useState変数 |
| `src/app/todos/page.tsx` | `showTodoAddModal` | 54行目 | useState変数 |
| `src/app/todos/page.tsx` | `showConditionModal` | 55行目 | useState変数 |
| `src/components/common/ProfileModal.tsx` | `lastNameTouched` | 15行目 | useState変数 |
| `src/components/common/ProfileModal.tsx` | `lastNameFocused` | 16行目 | useState変数 |
| `src/components/common/ProfileModal.tsx` | `firstNameTouched` | 20行目 | useState変数 |
| `src/components/common/ProfileModal.tsx` | `firstNameFocused` | 21行目 | useState変数 |
| `src/components/common/ProfileModal.tsx` | `showModal` | 25行目 | useState変数 |
| `src/components/common/Toast.tsx` | ✅ `toastFade` | 14行目 | useState変数 |
| `src/components/common/Toast.tsx` | ✅ `showToast` | 15行目 | useState変数 |
| `src/app/reset-password/confirm/page.tsx` | `newPasswordTouched` | 9行目 | useState変数 |
| `src/app/reset-password/confirm/page.tsx` | `newPasswordFocused` | 10行目 | useState変数 |
| `src/app/reset-password/confirm/page.tsx` | `showNewPassword` | 12行目 | useState変数 |
| `src/app/reset-password/confirm/page.tsx` | `confirmPasswordTouched` | 15行目 | useState変数 |
| `src/app/reset-password/confirm/page.tsx` | `confirmPasswordFocused` | 16行目 | useState変数 |
| `src/app/reset-password/confirm/page.tsx` | `showConfirmPassword` | 18行目 | useState変数 |
| `src/components/common/MenuModal.tsx` | ✅ `showModal` | 18行目 | useState変数 |

**総計: 46個の変数（完了: 16個 / 残り: 30個）**

## 主な違反パターン

### 1. `showXxx` - モーダル表示制御（15個）
- モーダルの表示/非表示を制御する変数
- 例: `showModal`, `showTodoEditModal`, `showPassword`など

### 2. `xxxTouched` - フォームフィールドのタッチ状態（12個）
- フォームフィールドがタッチされたかどうかを示す変数
- 例: `emailTouched`, `titleTouched`, `lastNameTouched`など

### 3. `xxxFocused` - フォームフィールドのフォーカス状態（12個）
- フォームフィールドがフォーカスされているかどうかを示す変数
- 例: `emailFocused`, `titleFocused`, `lastNameFocused`など

### 4. `showCompleted` - 設定値（1個）
- 完了済みアイテムの表示設定

### 5. その他（6個）
- `toastFade` - トーストのフェード状態
- その他の特殊なケース

## 推奨される修正方針

### 1. `showXxx` → `isXxxVisible` または `isXxxOpen`
- `showModal` → `isModalVisible`
- `showTodoEditModal` → `isTodoEditModalOpen`
- `showPassword` → `isPasswordVisible`

### 2. `xxxTouched` → `isXxxTouched`
- `emailTouched` → `isEmailTouched`
- `titleTouched` → `isTitleTouched`
- `lastNameTouched` → `isLastNameTouched`

### 3. `xxxFocused` → `isXxxFocused`
- `emailFocused` → `isEmailFocused`
- `titleFocused` → `isTitleFocused`
- `lastNameFocused` → `isLastNameFocused`

### 4. `showCompleted` → `isCompletedVisible`
- 完了済みアイテムの表示設定

### 5. その他
- `toastFade` → `isToastFading`

## 注意事項

- データベース型定義の`is_active`は除外（アンダースコア区切りはデータベースの命名規則）
- 既に「isXxxXxx」フォーマットに従っている変数（`isSubmitted`, `isCompleted`, `isMenuOpen`など）は除外
- 変数名の変更時は、関連するすべての参照箇所も同時に更新する必要がある

## 安全実行計画

### 依存関係調査結果

全46個の変数について厳密な調査を実施した結果：
- **45個**: 完全に内部変数（コンポーネント内で完結）
- **1個**: Context経由の外部依存（`showCompleted`）- ただし現在未使用で削除予定

### フェーズ別実行計画（リスク最小化順）

#### ✅ フェーズ1: 完全内部変数・単一コンポーネント（最安全）11個 - **完了済み**

**グループ1A: アニメーション制御系（5個）**
```
src/components/common/Toast.tsx
- toastFade → isToastFading
- showToast → isToastVisible

src/components/common/ConfirmModal.tsx  
- showModal → isModalVisible

src/components/common/MenuModal.tsx
- showModal → isModalVisible

src/components/common/ConditionModal.tsx
- showModal → isModalVisible
```

**グループ1B: 単純フォーム系（6個）**
```
src/app/reset-password/page.tsx
- emailTouched → isEmailTouched
- emailFocused → isEmailFocused

src/components/auth/ProfileForm.tsx
- lastNameTouched → isLastNameTouched
- lastNameFocused → isLastNameFocused  
- firstNameTouched → isFirstNameTouched
- firstNameFocused → isFirstNameFocused
```

#### ✅ フェーズ2: 複数変数・同一コンポーネント（低リスク）11個 - **部分完了済み**

**グループ2A: AuthForm（5個）- 完了済み**
```
src/components/auth/AuthForm.tsx
- emailTouched → isEmailTouched
- emailFocused → isEmailFocused
- passwordTouched → isPasswordTouched  
- passwordFocused → isPasswordFocused
- showPassword → isPasswordVisible
```

**⭐ グループ2B: reset-password/confirm（6個）- 次の実行対象**
```
src/app/reset-password/confirm/page.tsx
- newPasswordTouched → isNewPasswordTouched
- newPasswordFocused → isNewPasswordFocused
- showNewPassword → isNewPasswordVisible
- confirmPasswordTouched → isConfirmPasswordTouched
- confirmPasswordFocused → isConfirmPasswordFocused  
- showConfirmPassword → isConfirmPasswordVisible
```

#### ✅ フェーズ3: 大規模コンポーネント（中リスク）17個

**グループ3A: PasswordModal（10個）**
```
src/components/common/PasswordModal.tsx
- currentPasswordTouched → isCurrentPasswordTouched
- currentPasswordFocused → isCurrentPasswordFocused
- showCurrentPassword → isCurrentPasswordVisible
- newPasswordTouched → isNewPasswordTouched
- newPasswordFocused → isNewPasswordFocused
- showNewPassword → isNewPasswordVisible
- confirmPasswordTouched → isConfirmPasswordTouched
- confirmPasswordFocused → isConfirmPasswordFocused
- showConfirmPassword → isConfirmPasswordVisible
- showModal → isModalVisible
```

**グループ3B: ProfileModal（5個）**
```
src/components/common/ProfileModal.tsx
- lastNameTouched → isLastNameTouched
- lastNameFocused → isLastNameFocused
- firstNameTouched → isFirstNameTouched
- firstNameFocused → isFirstNameFocused
- showModal → isModalVisible
```

**グループ3C: TodoModal系（6個）**
```
src/components/TodoAddModal.tsx
- titleTouched → isTitleTouched
- titleFocused → isTitleFocused
- showModal → isModalVisible

src/components/TodoEditModal.tsx  
- titleTouched → isTitleTouched
- titleFocused → isTitleFocused
- showModal → isModalVisible
```

#### ✅ フェーズ4: 中央制御ページ（中リスク）5個

**グループ4A: todos/page.tsx（5個）**
```
src/app/todos/page.tsx
- showTodoEditModal → isTodoEditModalOpen
- showTodoDeleteModal → isTodoDeleteModalOpen  
- showProfileModal → isProfileModalOpen
- showTodoAddModal → isTodoAddModalOpen
- showConditionModal → isConditionModalOpen
```

#### ✅ フェーズ5: Context変数（低リスク - 未使用）1個

**グループ5A: Context系（1個）**
```
src/contexts/AuthContext.tsx
- showCompleted → isCompletedVisible
※現在未使用、削除予定のためリスク最低
```

### 実行手順

#### 各グループ標準実行手順
```
1. 対象ファイルのGit状態確認
2. 変数名一括置換実行  
3. 品質チェック3点セット
   - npm run lint
   - npm run typecheck
   - npm run build
4. 該当機能の動作確認
5. コンソールエラー確認
6. 次グループ実行可否判定
```

### ✅ フェーズ1完了実績（2025-01-07）
- **品質チェック結果**: 
  - ESLint: ✅ No warnings or errors
  - TypeScript: ✅ No compilation errors  
  - Build: ✅ Successfully compiled
- **変更内容**: 11個の変数を「isXxxXxx」形式に変更
- **影響範囲**: ゼロ（完全内部変数のみ）
- **ブラウザ確認**: 不要（変数名変更のため）

### ✅ グループ2A完了実績（2025-01-07）
- **品質チェック結果**: 
  - ESLint: ✅ No warnings or errors
  - TypeScript: ✅ No compilation errors  
  - Build: ✅ Successfully compiled
- **変更内容**: AuthForm.tsx内5個の変数を「isXxxXxx」形式に変更
- **影響範囲**: ゼロ（完全内部変数のみ）
- **ブラウザ確認**: 不要（変数名変更のため）

#### Context変数特別手順（フェーズ5）
```
1. User型定義の変更（AuthContext.tsx line 11）
2. login/page.tsxのデフォルト値変更（line 47）
3. 全体ビルド確認
```

### 安全性評価

- **段階的実行**: 5フェーズ、10グループに分割
- **影響範囲限定**: 各グループ最大10変数
- **リスク分散**: 最もリスクの低い変数から順に実行
- **即座復旧可能**: Git管理によるロールバック

### 品質保証

- **各段階での完全検証**: 機能・品質・動作
- **エラー時即座停止**: 問題検出時は次フェーズ進行禁止
- **実行中断基準**: TypeScript/ESLintエラー、ビルド失敗、機能異常 