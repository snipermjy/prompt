-- ⚠️ 立即在 Supabase Dashboard > SQL Editor 中执行此脚本 ⚠️
-- 这将修复翻译功能的权限问题

-- 1. 删除所有现有的限制性策略
DROP POLICY IF EXISTS "Enable all access for service role" ON prompt_translations;
DROP POLICY IF EXISTS "Enable read access for all users" ON prompt_translations;
DROP POLICY IF EXISTS "Enable all access for service role" ON category_translations;
DROP POLICY IF EXISTS "Enable read access for all users" ON category_translations;

-- 2. 为 service_role 添加完全访问权限（后端API使用）
CREATE POLICY "service_role_all_prompt_translations"
ON prompt_translations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_category_translations"
ON category_translations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. 为匿名用户和认证用户添加读取权限（前端使用）
CREATE POLICY "public_read_prompt_translations"
ON prompt_translations
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "public_read_category_translations"
ON category_translations
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. 确认RLS已启用
ALTER TABLE prompt_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;

-- 5. 验证策略是否创建成功
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('prompt_translations', 'category_translations')
ORDER BY tablename, policyname;
