# 添加翻译数据指南

## 快速开始

### 步骤 1：访问 Supabase 控制台

1. 打开浏览器，访问您的 Supabase 项目
2. 进入 **SQL Editor**

### 步骤 2：运行翻译脚本

复制 `supabase/seed_translations.sql` 文件的内容，粘贴到 SQL Editor 中，点击 **Run**

### 步骤 3：验证结果

运行以下查询验证翻译是否添加成功：

```sql
-- 查看分类翻译
SELECT * FROM category_translations WHERE locale = 'en';

-- 查看提示词翻译
SELECT * FROM prompt_translations WHERE locale = 'en';
```

### 步骤 4：刷新网站

1. 访问 http://localhost:3000
2. 点击右上角的语言切换器
3. 选择 **English**
4. 查看提示词是否显示英文

## 如果没有 Supabase 访问权限

可以通过代码添加翻译：

```typescript
// 在 app/api/seed-translations/route.ts 创建 API 端点
// 然后访问 http://localhost:3000/api/seed-translations
```

## 批量翻译工具（可选）

如果需要为大量提示词添加翻译，可以：

1. 使用 AI API（如 OpenAI）批量翻译
2. 导出 CSV，人工翻译后导入
3. 使用翻译服务 API

## 当前状态

✅ 翻译表结构已创建
✅ 翻译脚本已准备好
✅ 语言切换器已改为下拉式
⏳ 等待运行翻译脚本

## 效果预览

**运行脚本前（英文界面）：**
- 提示词标题：小红书爆款文案生成器（中文）
- 提示词内容：中文内容

**运行脚本后（英文界面）：**
- 提示词标题：Xiaohongshu Viral Content Generator（英文）
- 提示词内容：英文内容
