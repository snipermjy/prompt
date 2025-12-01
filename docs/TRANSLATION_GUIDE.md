# 翻译系统使用指南

## 问题诊断

### 根本原因
切换到英文页面仍然显示中文的根本原因是：**数据库中缺少英文翻译数据**。

系统的翻译架构是完善的：
- ✅ 翻译表结构正确 (`prompt_translations`, `category_translations`)
- ✅ 翻译逻辑正确（根据 locale 自动获取对应语言的翻译）
- ✅ AI 翻译功能已实现
- ❌ **但是数据库中没有英文翻译数据**

## 解决方案

我已经创建了完整的批量翻译系统，包括：

### 1. 批量翻译 API
**文件**: `app/api/translate/batch/route.ts`

功能：
- 自动翻译所有没有英文版本的提示词
- 自动翻译所有没有英文版本的分类
- 跳过已有翻译的内容
- 提供详细的翻译结果统计

### 2. 管理后台翻译页面
**文件**: `app/(admin)/admin/translations/page.tsx`

访问地址：`http://localhost:3000/admin/translations`

功能：
- 一键批量翻译所有内容
- 查看翻译结果统计
- 显示成功/失败/跳过的数量
- 查看错误详情

### 3. 批量操作增强
**文件**: `app/(admin)/admin/prompts/BatchActions.tsx`

功能：
- 在提示词管理页面选中提示词后，可以批量生成翻译
- 支持选中部分提示词进行翻译

## 使用方法

### 方法一：使用翻译管理页面（推荐）

1. 访问管理后台：`http://localhost:3000/admin`
2. 点击左侧菜单的"翻译管理"
3. 点击"开始批量翻译"按钮
4. 等待翻译完成（可能需要几分钟）
5. 查看翻译结果统计

### 方法二：在提示词管理页面批量翻译

1. 访问 `http://localhost:3000/admin/prompts`
2. 选中需要翻译的提示词（勾选复选框）
3. 点击底部弹出的"生成翻译"按钮
4. 等待翻译完成

### 方法三：直接调用 API

```bash
# 批量翻译所有内容
curl -X POST http://localhost:3000/api/translate/batch

# 翻译单个提示词
curl -X POST http://localhost:3000/api/translate/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "promptId": "提示词ID",
    "title": "标题",
    "description": "描述",
    "content": "内容",
    "sourceLocale": "zh",
    "targetLocale": "en"
  }'
```

## 环境配置

翻译功能需要配置 AI API。请在 `.env.local` 文件中设置：

```env
# AI API 配置（必需）
AI_API_KEY=your_api_key_here

# AI API 地址（可选，默认使用硅基流动）
AI_API_URL=https://api.siliconflow.cn/v1/chat/completions

# AI 模型（可选，默认使用 DeepSeek）
AI_MODEL=deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
```

## 翻译流程

1. **检查现有翻译**：系统会先检查数据库中是否已有英文翻译
2. **跳过已翻译内容**：如果已有翻译，则跳过
3. **调用 AI 翻译**：使用 AI 服务将中文翻译成英文
4. **保存到数据库**：将翻译结果保存到 `prompt_translations` 或 `category_translations` 表
5. **自动应用**：前端切换到英文时，会自动使用翻译后的内容

## 翻译质量

AI 翻译会保证：
- ✅ 准确传达原文含义
- ✅ 使用地道的英文表达
- ✅ 保持专业术语的准确性
- ✅ 保持原文格式（Markdown、换行等）

如果翻译质量不满意，可以：
1. 在数据库中删除对应的翻译记录
2. 重新执行翻译
3. 或手动编辑翻译内容

## 数据库结构

### prompt_translations 表
```sql
- id: UUID (主键)
- prompt_id: UUID (外键，关联 prompts 表)
- locale: VARCHAR (语言代码，如 'en', 'zh')
- title: TEXT (翻译后的标题)
- description: TEXT (翻译后的描述)
- content: TEXT (翻译后的内容)
- translation_status: VARCHAR (翻译状态)
- translated_by: VARCHAR (翻译者，'ai' 或 'manual')
- translated_at: TIMESTAMP (翻译时间)
```

### category_translations 表
```sql
- id: UUID (主键)
- category_id: UUID (外键，关联 categories 表)
- locale: VARCHAR (语言代码)
- name: TEXT (翻译后的名称)
- description: TEXT (翻译后的描述)
- translation_status: VARCHAR (翻译状态)
- translated_by: VARCHAR (翻译者)
- translated_at: TIMESTAMP (翻译时间)
```

## 常见问题

### Q: 翻译需要多长时间？
A: 取决于提示词数量。每个提示词大约需要 2-3 秒，如果有 100 个提示词，大约需要 3-5 分钟。

### Q: 翻译失败怎么办？
A: 检查以下几点：
1. AI_API_KEY 是否正确配置
2. 网络连接是否正常
3. API 配额是否充足
4. 查看错误详情，根据提示解决

### Q: 如何重新翻译某个提示词？
A: 
1. 在数据库中删除对应的翻译记录
2. 重新执行批量翻译，系统会自动翻译缺失的内容

### Q: 可以手动编辑翻译吗？
A: 可以。直接在数据库中编辑 `prompt_translations` 或 `category_translations` 表的内容即可。

### Q: 翻译后前端还是显示中文？
A: 检查以下几点：
1. 确认翻译已成功保存到数据库
2. 刷新页面（清除缓存）
3. 确认语言切换器已切换到英文
4. 检查浏览器控制台是否有错误

## 技术细节

### 翻译逻辑
```typescript
// 获取带翻译的提示词
export async function getPromptsWithTranslation(locale: Locale) {
  // 1. 获取所有提示词
  const prompts = await getPrompts();
  
  // 2. 如果是中文，直接返回
  if (locale === 'zh') {
    return prompts;
  }
  
  // 3. 如果是英文，获取翻译
  const translations = await getTranslations(promptIds, 'en');
  
  // 4. 合并翻译数据
  return prompts.map(prompt => {
    const translation = translations.get(prompt.id);
    return translation 
      ? { ...prompt, ...translation }  // 使用翻译
      : prompt;                         // 降级到原文
  });
}
```

### AI 翻译提示词
系统使用专业的翻译提示词，确保翻译质量：
- 准确性：准确传达原文含义
- 自然性：使用地道的英文表达
- 专业性：AI 术语使用行业标准
- 格式保持：保持 Markdown 和特殊符号

## 总结

问题的根本原因是数据库缺少英文翻译数据，而不是代码或缓存问题。

解决方案：
1. ✅ 访问 `/admin/translations` 页面
2. ✅ 点击"开始批量翻译"
3. ✅ 等待翻译完成
4. ✅ 切换到英文页面查看效果

现在系统已经具备完整的翻译功能，可以随时生成和管理多语言内容。
