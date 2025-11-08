# AI提示词库

一个基于 Next.js 14 + Supabase 的现代化 AI 提示词库系统。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS 3
- **语言**: TypeScript
- **表单**: React Hook Form
- **日期处理**: date-fns
- **部署**: Vercel

## 开始使用

### 前置要求

- Node.js 18+ 
- npm 或 pnpm
- Supabase 账号

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 环境配置

1. 复制 `.env.example` 为 `.env.local`
2. 填入你的 Supabase 配置信息

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 数据库设置

参考 `docs/数据库设计文档.md` 在 Supabase 中创建相应的表结构。

### 运行开发服务器

```bash
npm run dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看项目。

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── (frontend)/        # 前端路由组
│   ├── (admin)/          # 管理后台路由组
│   ├── api/              # API 路由
│   └── actions/          # Server Actions
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── layout/           # 布局组件
│   └── features/         # 业务组件
├── lib/                  # 工具库
│   ├── supabase/        # Supabase 客户端
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript 类型定义
│   └── config/          # 配置文件
├── hooks/               # 自定义 React Hooks
├── docs/                # 项目文档
└── preview/             # 原型预览页面
```

## 开发规范

请遵循 `.cursorrules` 中定义的开发规范。

## 开发进度

查看 `docs/开发进度管理.md` 了解项目开发进度。

## 文档

- [项目需求文档](docs/项目需求文档.md)
- [数据库设计文档](docs/数据库设计文档.md)
- [UI设计文档](docs/UI设计文档.md)
- [开发进度管理](docs/开发进度管理.md)

## 部署

本项目可一键部署到 Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-prompt-library)

## License

MIT

