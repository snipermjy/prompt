import { notFound } from 'next/navigation';
import { getPromptWithTranslation, getCategoryWithTranslation, getPromptsWithTranslation } from '@/app/actions/translations';
import { getTranslations } from 'next-intl/server';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptCard from '@/components/features/PromptCard';
import { languageConfig, getLanguageLabel } from '@/lib/config/site';
import CopyButton from './CopyButton';
import ShareButton from './ShareButton';
import BackButton from './BackButton';
import ViewTracker from './ViewTracker';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

/**
 * 提示词详情页
 * 使用动态渲染，避免构建期预渲染错误
 */

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id, locale } = await params;
  const prompt = await getPromptWithTranslation(id, locale as 'zh' | 'en');
  const tSite = await getTranslations({ locale, namespace: 'site' });
  const siteName = tSite('name');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promtp.mom';
  const basePath = `/prompt/${id}`;
  
  if (!prompt) {
    return {
      title: locale === 'en' ? 'Prompt not found' : '提示词不存在',
    };
  }
  
  return {
    title: `${prompt.title} - ${siteName}`,
    description: prompt.description || prompt.title,
    keywords: [prompt.title, prompt.category, ...prompt.tags, ...(prompt.prompt_type || []), ...(prompt.use_cases || [])],
    openGraph: {
      title: `${prompt.title} - ${siteName}`,
      description: prompt.description || prompt.title,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${prompt.title} - ${siteName}`,
      description: prompt.description || prompt.title,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}${basePath}`,
      languages: {
        zh: `${siteUrl}/zh${basePath}`,
        en: `${siteUrl}/en${basePath}`,
      },
    },
  };
}

export default async function PromptDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  
  // 获取翻译
  const t = await getTranslations({ locale, namespace: 'prompt' });
  
  // 获取提示词详情（带翻译）
  const prompt = await getPromptWithTranslation(id, locale as 'zh' | 'en');
  
  if (!prompt) {
    notFound();
  }
  
  // 获取分类信息（带翻译）
  const category = await getCategoryWithTranslation(prompt.category, locale as 'zh' | 'en');
  const categoryName = category?.name || prompt.category;
  
  // 获取相关推荐（带翻译）
  const relatedAll = await getPromptsWithTranslation(locale as 'zh' | 'en', {
    category: prompt.category,
    status: 'published',
    limit: 8,
  });

  // 过滤掉当前提示词本身，并限制数量
  const relatedPrompts = relatedAll.filter(p => p.id !== prompt.id).slice(0, 4);

  // 为相关推荐添加分类名称
  const relatedPromptsWithCategoryName = relatedPrompts.map(p => ({
    ...p,
    categoryName: categoryName,
  }));
  
  // 如果是英文页面且有翻译，显示英语；否则显示原始语言
  const displayLanguage = locale === 'en' && prompt._translation_status ? 'en-US' : prompt.language;
  const language = languageConfig[displayLanguage] || languageConfig[prompt.language];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promtp.mom';
  const promptUrl = `${siteUrl}/${locale}/prompt/${id}`;
  
  return (
    <>
      <ArticleJsonLd prompt={prompt} url={promptUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: t('home'), url: `${siteUrl}/${locale}` },
          { name: categoryName, url: `${siteUrl}/${locale}/category/${prompt.category}` },
          { name: prompt.title, url: promptUrl },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* 浏览量追踪组件 */}
        <ViewTracker promptId={id} />
        {/* 面包屑导航 */}
        <Breadcrumb
          items={[
            { label: categoryName, href: `/${locale}/category/${prompt.category}` },
            { label: prompt.title },
          ]}
        />
      
      {/* 标题区域 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        {/* 标题行 */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-2 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded flex-shrink-0">
              {categoryName}
            </span>
          </div>
          
          {/* 统计信息 */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* 统计图标 - 带动画效果 */}
            <div className="flex items-center gap-3 text-gray-500">
              <div className="flex items-center gap-1" title={t('viewCount')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <AnimatedNumber value={prompt.view_count} useFormatNumber className="text-xs" />
              </div>
              <div className="flex items-center gap-1" title={t('copyCount')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <AnimatedNumber value={prompt.copy_count} useFormatNumber className="text-xs" />
              </div>
              <div className="flex items-center gap-1" title={t('shareCount')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <AnimatedNumber value={prompt.share_count} useFormatNumber className="text-xs" />
              </div>
            </div>
          </div>
        </div>
        
        
        {/* 描述 */}
        {prompt.description && (
          <p className="text-sm text-gray-700 mb-3 pb-3 border-b border-gray-100">
            {prompt.description}
          </p>
        )}
        
        {/* 来源作者 */}
        {prompt.author_name && prompt.author_link && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-0">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-xs">{t('source')}:</span>
            <a
              href={prompt.author_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>@{prompt.author_name}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
      
      {/* 内容区域 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：提示词内容 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
            <div className="flex items-center gap-2">
              <CopyButton content={prompt.content} promptId={prompt.id} />
              <ShareButton promptId={prompt.id} title={prompt.title} />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {prompt.content}
            </pre>
          </div>
        </div>
        
        {/* 右侧：元数据和相关推荐 */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-3">
            {/* 提示词元数据板块 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900">{t('info')}</h2>
              </div>
              
              <div className="space-y-3">
                {/* 语言 */}
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">{t('language')}</div>
                  <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-sm rounded">
                    {language.flag} {getLanguageLabel(displayLanguage, locale as 'zh' | 'en')}
                  </span>
                </div>
                
                {/* 提示词类型 */}
                {prompt.prompt_type && prompt.prompt_type.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1.5">{t('type')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {prompt.prompt_type.map((type, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 使用场景 */}
                {prompt.use_cases && prompt.use_cases.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1.5">{t('useCases')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {prompt.use_cases.map((useCase, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 标签 */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1.5">{t('tags')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {prompt.tags.map((tag, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 相关推荐板块 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900">{t('relatedPrompts')}</h2>
              </div>
              {relatedPromptsWithCategoryName.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {relatedPromptsWithCategoryName.map((relatedPrompt) => (
                    <PromptCard key={relatedPrompt.id} prompt={relatedPrompt} compact />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-4">
                  {t('noRelated')}
                </p>
              )}
            </div>
            
            {/* 返回按钮 */}
            <BackButton />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

