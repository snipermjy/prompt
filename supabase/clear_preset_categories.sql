-- 清空预设分类，让AI自动生成
-- 注意：这会删除所有分类，但不会删除提示词（提示词会变成孤立状态）

-- 1. 删除所有分类
DELETE FROM categories;

-- 2. 重置自增ID（如果使用了序列）
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- 完成！现在所有分类都由AI自动生成
