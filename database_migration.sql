-- Priority機能実装: データベースマイグレーション
-- 実行順序: 1 → 2 → 3 の順番で実行してください

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

-- 2. 初期データ投入
INSERT INTO priorities (name, display_order, color_code) VALUES
('高', 1, '#ef4444'),
('中', 2, '#f59e0b'), 
('低', 3, '#10b981');

-- 3. todosテーブルにpriority_id列追加
ALTER TABLE todos 
ADD COLUMN priority_id UUID REFERENCES priorities(id);

-- 4. 既存のTODOに「中」優先度を設定
UPDATE todos 
SET priority_id = (SELECT id FROM priorities WHERE name = '中' LIMIT 1)
WHERE priority_id IS NULL;

-- 5. priority_idをNOT NULL制約に変更
ALTER TABLE todos 
ALTER COLUMN priority_id SET NOT NULL;

-- 6. RLS (Row Level Security) 設定
-- prioritiesテーブルは全ユーザーが読み取り可能（マスタデータのため）
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read priorities" ON priorities
  FOR SELECT USING (is_active = true);

-- 管理者のみ priority の更新が可能（将来的な拡張用）
-- CREATE POLICY "Admin can manage priorities" ON priorities
--   FOR ALL USING (auth.role() = 'admin'); 