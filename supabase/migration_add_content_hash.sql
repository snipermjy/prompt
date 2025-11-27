-- 提示词去重功能 - 数据库迁移脚本
-- 执行时机：在部署新代码之前手动执行
-- 执行命令：psql -d your_database -f migration_add_content_hash.sql

-- 1. 添加 content_hash 字段
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

-- 2. 为现有数据生成 hash
-- 使用 PostgreSQL 的 encode 和 sha256 函数
UPDATE prompts 
SET content_hash = encode(sha256(content::bytea), 'hex')
WHERE content_hash IS NULL;

-- 3. 创建索引（只对已发布的提示词建索引，提高查询效率）
CREATE INDEX IF NOT EXISTS idx_prompts_content_hash 
ON prompts(content_hash) 
WHERE status = 'published';

-- 4. 添加注释
COMMENT ON COLUMN prompts.content_hash IS '提示词内容的SHA256哈希值，用于快速去重检查';

-- 5. 验证迁移结果
DO $$
DECLARE
    hash_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM prompts;
    SELECT COUNT(*) INTO hash_count FROM prompts WHERE content_hash IS NOT NULL;
    
    RAISE NOTICE '迁移完成！';
    RAISE NOTICE '总提示词数: %', total_count;
    RAISE NOTICE '已生成hash: %', hash_count;
    
    IF hash_count < total_count THEN
        RAISE WARNING '部分提示词未生成hash，请检查数据';
    END IF;
END $$;
