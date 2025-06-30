-- データベース構造定義
-- 実行順序: 1 → 2 → 3 → 4 → 5 の順番で実行してください

-- 1. prioritiesテーブル作成
CREATE TABLE priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL UNIQUE,
  color_code VARCHAR(7) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 優先度の初期データ投入
INSERT INTO priorities (name, display_order, color_code) VALUES
('高', 1, '#ef4444'),
('中', 2, '#f59e0b'), 
('低', 3, '#10b981');

-- 3. task_statusesテーブル作成
CREATE TABLE task_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL UNIQUE,
  color_code VARCHAR(7) NOT NULL DEFAULT '#6b7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 状態の初期データ投入
INSERT INTO task_statuses (name, display_order, color_code) VALUES
('未着手', 1, '#6b7280'),
('処理中', 2, '#f59e0b'),
('処理済', 3, '#3b82f6'),
('完了', 4, '#10b981');

-- 5. todosテーブルに外部キー列を追加
ALTER TABLE todos 
ADD COLUMN priority_id UUID REFERENCES priorities(id);

ALTER TABLE todos 
ADD COLUMN status_id UUID REFERENCES task_statuses(id);

-- 6. 既存のTODOにデフォルト値を設定
UPDATE todos 
SET priority_id = (SELECT id FROM priorities WHERE name = '中' LIMIT 1)
WHERE priority_id IS NULL;

UPDATE todos 
SET status_id = (SELECT id FROM task_statuses WHERE name = '未着手' LIMIT 1)
WHERE status_id IS NULL;

-- 7. NOT NULL制約を追加
ALTER TABLE todos 
ALTER COLUMN priority_id SET NOT NULL;

ALTER TABLE todos 
ALTER COLUMN status_id SET NOT NULL;

-- 8. RLS (Row Level Security) 設定
-- prioritiesテーブルは全ユーザーが読み取り可能（マスタデータのため）
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read priorities" ON priorities
  FOR SELECT USING (is_active = true);

-- task_statusesテーブルも全ユーザーが読み取り可能（マスタデータのため）
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read task_statuses" ON task_statuses
  FOR SELECT USING (is_active = true);

-- 管理者のみマスタデータの更新が可能（将来的な拡張用）
-- CREATE POLICY "Admin can manage priorities" ON priorities
--   FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Admin can manage task_statuses" ON task_statuses
--   FOR ALL USING (auth.role() = 'admin'); 

-- 9. 状態の色を更新（既存データの場合）
UPDATE task_statuses
SET color_code = CASE name
  WHEN '処理中' THEN '#f59e0b'
  WHEN '処理済' THEN '#3b82f6'
  WHEN '完了' THEN '#10b981'
END
WHERE name IN ('処理中', '処理済', '完了'); 