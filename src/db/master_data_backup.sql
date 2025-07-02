-- priorities table backup data
INSERT INTO todo_priorities (id, name, display_order, color_code, is_active) VALUES
('c95322e9-1504-444e-ba19-5df8c91c6c4d', '高', 1, '#ef4444', true),
('d78c89d5-1767-4a1e-b6b5-3079a0c3ece2', '中', 2, '#f59e0b', true),
('1ecdda55-79c8-4677-9d35-2d2c667346f2', '低', 3, '#10b981', true);

-- task_statuses table backup data
INSERT INTO todo_statuses (id, name, display_order, color_code, is_active) VALUES
('83ecb8ac-8ce3-48b7-8197-e482eecb4b53', '未着手', 1, '#ef4444', true),
('a982edba-fb07-4fbd-b16e-cf9e443a857d', '処理中', 2, '#f59e0b', true),
('a96835d2-f146-483c-a8da-850ce15d826d', '処理済', 3, '#3b82f6', true),
('0a52177a-a2f4-4a1b-9072-e9a8404a65c9', '完了', 4, '#10b981', true); 