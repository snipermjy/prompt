-- 修复翻译表的 RLS 策略
-- 允许服务端（使用 service_role key）完全访问翻译表

-- 1. 为 prompt_translations 表添加策略
DROP POLICY IF EXISTS "Enable all access for service role" ON prompt_translations;
CREATE POLICY "Enable all access for service role"
ON prompt_translations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. 为 category_translations 表添加策略
DROP POLICY IF EXISTS "Enable all access for service role" ON category_translations;
CREATE POLICY "Enable all access for service role"
ON category_translations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. 允许匿名用户读取翻译（前端需要）
DROP POLICY IF EXISTS "Enable read access for all users" ON prompt_translations;
CREATE POLICY "Enable read access for all users"
ON prompt_translations
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON category_translations;
CREATE POLICY "Enable read access for all users"
ON category_translations
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. 确保表启用了 RLS
ALTER TABLE prompt_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
