/**
 * 网站配置
 */

export const siteConfig = {
  name: 'AI提示词库',
  description: '收录各类优质AI提示词，涵盖ChatGPT、Claude、Midjourney等主流AI工具',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // 导航菜单
  navItems: [
    { label: '首页', href: '/' },
    { label: '分类', href: '/categories' },
    { label: '提交提示词', href: '/submit' },
  ],
  
  // 分页配置
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // 搜索配置
  search: {
    minLength: 2,
    maxLength: 50,
  },
  
  // 用户提交配置
  submission: {
    contentMaxLength: 10000,
    descriptionMaxLength: 200,
    nameMaxLength: 50,
  },
};

/**
 * 难度等级配置
 */
export const difficultyConfig = {
  beginner: {
    label: '入门',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  intermediate: {
    label: '进阶',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  advanced: {
    label: '高级',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

/**
 * 语言配置 - 支持多语言显示
 */
export const languageConfig: Record<string, { label: Record<string, string>; flag: string }> = {
  'zh-CN': { 
    label: { zh: '中文', en: 'Chinese' }, 
    flag: '🇨🇳' 
  },
  'en-US': { 
    label: { zh: '英语', en: 'English' }, 
    flag: '🇺🇸' 
  },
  'ja-JP': { 
    label: { zh: '日语', en: 'Japanese' }, 
    flag: '🇯🇵' 
  },
  other: { 
    label: { zh: '其他', en: 'Other' }, 
    flag: '🌐' 
  },
};

// 获取语言显示名称
export function getLanguageLabel(langCode: string, currentLocale: 'zh' | 'en' = 'zh'): string {
  const config = languageConfig[langCode] || languageConfig.other;
  return config.label[currentLocale] || config.label.zh;
}

/**
 * 状态配置
 */
export const statusConfig = {
  draft: { label: '草稿', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  pending: { label: '待审核', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  published: { label: '已发布', color: 'text-green-600', bgColor: 'bg-green-100' },
  rejected: { label: '已拒绝', color: 'text-red-600', bgColor: 'bg-red-100' },
};

/**
 * 常用 AI 模型
 */
export const commonAIModels = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Midjourney',
  'Stable Diffusion',
  '文心一言',
  '通义千问',
  'Copilot',
];

