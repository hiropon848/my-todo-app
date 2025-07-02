-- 新しいテーブル構造への移行
-- 実行順序: 1 → 2 → 3 → 4 → 5 の順番で実行してください

-- 1. 新しいテーブルの作成
CREATE TABLE todo_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL UNIQUE,
  color_code VARCHAR(7) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE todo_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL UNIQUE,
  color_code VARCHAR(7) NOT NULL DEFAULT '#6b7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. データの移行
INSERT INTO todo_priorities (id, name, display_order, color_code, is_active, created_at, updated_at)
SELECT id, name, display_order, color_code, is_active, created_at, updated_at
FROM priorities;

INSERT INTO todo_statuses (id, name, display_order, color_code, is_active, created_at, updated_at)
SELECT id, name, display_order, color_code, is_active, created_at, updated_at
FROM task_statuses;

-- 3. todosテーブルのカラム名変更
ALTER TABLE todos 
RENAME COLUMN task_text TO todo_text;

ALTER TABLE todos 
RENAME COLUMN task_title TO todo_title;

ALTER TABLE todos 
RENAME COLUMN priority_id TO todo_priority_id;

ALTER TABLE todos 
RENAME COLUMN status_id TO todo_status_id;

-- 4. 外部キー制約の更新
-- 一時的に外部キー制約を削除
ALTER TABLE todos 
DROP CONSTRAINT todos_priority_id_fkey,
DROP CONSTRAINT todos_status_id_fkey;

-- 新しい外部キー制約を追加
ALTER TABLE todos 
ADD CONSTRAINT todos_todo_priority_id_fkey 
FOREIGN KEY (todo_priority_id) 
REFERENCES todo_priorities(id);

ALTER TABLE todos 
ADD CONSTRAINT todos_todo_status_id_fkey 
FOREIGN KEY (todo_status_id) 
REFERENCES todo_statuses(id);

-- 5. 古いテーブルの削除（すべての確認が完了後）
DROP TABLE priorities;
DROP TABLE task_statuses; 