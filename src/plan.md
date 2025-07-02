# データベース構造とクライアントコード変更計画

## 目的
1. テーブル名の変更
   - `priorities` → `todo_priorities`
   - `task_statuses` → `todo_statuses`

2. カラム名の変更（`todos`テーブル）
   - `task_text` → `todo_text`
   - `task_title` → `todo_title`
   - `priority_id` → `todo_priority_id`
   - `status_id` → `todo_status_id`

3. クライアントコードの変数名を変更後の名称に統一

4. マイグレーションSQLの更新
   - 新規開発メンバーのデータベース環境構築
   - 既存メンバーのテーブル追加やカラム拡張対応

## Phase 1: 現状把握

### 担当者: Claude
- [x] 1. 現在の`database_migration.sql`の構造を分析
- [x] 2. 変更が必要な箇所の特定
- [x] 3. クライアントコードでの変数名使用箇所の特定

### 担当者: 開発者
- [x] 1. Supabaseの現在の設定のスクリーンショット提供
   - RLSポリシー設定
   - 外部キー制約
   - インデックス

## Phase 2: マイグレーションSQL作成

### 担当者: Claude
- [x] 1. 新しいテーブル構造の定義
   - [x] マスターデータのバックアップ作成（`master_data_backup.sql`）
   - [x] マイグレーションSQL作成（`database_migration_v2.sql`）
     - `priorities` → `todo_priorities`
     - `task_statuses` → `todo_statuses`
     - カラム名の変更
       - `task_text` → `todo_text`
       - `task_title` → `todo_title`
       - `priority_id` → `todo_priority_id`
       - `status_id` → `todo_status_id`

### 担当者: 開発者
- [x] 1. マイグレーション実行前の確認
   - [x] `master_data_backup.sql`の内容確認
   - [x] `database_migration_v2.sql`の内容確認
   - [x] GitHubへのコミット

### 次のステップ: マイグレーション実行
- [ ] 1. 実行手順書の作成
   - [ ] SQLの実行順序の詳細化
   - [ ] 実行時の注意点
   - [ ] ロールバック手順
   - [ ] 実行後の確認項目
- [ ] 2. テスト環境での実行
   - [ ] バックアップの確認
   - [ ] SQLの実行
   - [ ] データの整合性確認
   - [ ] RLSポリシーの動作確認
   - [ ] 外部キー制約の動作確認
- [ ] 3. 結果の確認と報告

## Phase 3: クライアントコード更新

### 担当者: Claude
- [ ] 1. 型定義の更新
- [ ] 2. カスタムフックの更新
- [ ] 3. コンポーネントの更新

### 担当者: 開発者
- [ ] 1. コードレビュー
- [ ] 2. テスト環境での動作確認

## Phase 4: マイグレーションファイル更新

### 担当者: Claude
- [ ] 1. `database_migration.sql`の更新
- [ ] 2. READMEの更新（必要に応じて）

### 担当者: 開発者
- [ ] 1. 最終確認
- [ ] 2. 本番環境への適用判断

## 実行順序

1. Phase 1: 現状把握
   - [ ] 現状を完全に把握するまで次のフェーズに進まない
   - [ ] 必要な情報が揃っていることを確認

2. Phase 2 & 3: SQL作成とコード更新
   - [ ] 並行して進行（相互に影響するため）
   - [ ] 各変更案の承認を得る
   - [ ] 必要に応じて調整と修正

3. Phase 4: 最終化
   - [ ] 承認された変更内容を反映
   - [ ] テスト環境での検証
   - [ ] 本番環境への適用計画の策定

## 次のステップ
Phase 1を開始するために、Supabaseの現在の設定のスクリーンショットの提供をお願いします。 