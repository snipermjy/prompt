import { notFound } from 'next/navigation';
import { getPromptById, getRelatedPrompts, incrementViewCount } from '@/app/actions/prompts';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PromptCard from '@/components/features/PromptCard';
import { formatNumber } from '@/lib/utils/formatNumber';
import { formatDate } from '@/lib/utils/formatDate';
import { languageConfig } from '@/lib/config/site';
import CopyButton from './CopyButton';
import ShareButton from './ShareButton';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

/**
 * 提示词详情页
 * 禁用缓存，确保统计数据实时更新
 */

// 禁用页面缓存，每次请求都重新获取数据
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const prompt = await getPromptById(id);
  
  if (!prompt) {
    return {
      title: '提示词不存在',
    };
  }
  
  return {
    title: `${prompt.title} - AI提示词库`,
    description: prompt.description || prompt.title,
  };
}

export default async function PromptDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // 获取提示词详情
  const prompt = await getPromptById(id);
  
  if (!prompt) {
    notFound();
  }
  
  // 获取相关推荐
  const relatedPrompts = await getRelatedPrompts(id, prompt.category, 4);
  
  // 增加浏览量（异步执行，不阻塞页面渲染）
  incrementViewCount(id).catch(err => console.error('Failed to increment view count:', err));
  
  const language = languageConfig[prompt.language];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: prompt.category, href: `/category/${prompt.category}` },
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
              {prompt.category}
            </span>
          </div>
          
          {/* 适用AI模型 + 统计信息 */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* 适用AI模型 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">适用：</span>
              <div className="flex gap-1">
                {prompt.target_ai.slice(0, 3).map((ai, index) => (
                  <span key={index} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded">
                    {ai}
                  </span>
                ))}
              </div>
            </div>
            
            {/* 统计图标 - 带动画效果 */}
            <div className="flex items-center gap-3 text-gray-500">
              <div className="flex items-center gap-1" title="浏览量">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <AnimatedNumber value={prompt.view_count} format={formatNumber} className="text-xs" />
              </div>
              <div className="flex items-center gap-1" title="复制量">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <AnimatedNumber value={prompt.copy_count} format={formatNumber} className="text-xs" />
              </div>
              <div className="flex items-center gap-1" title="分享量">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <AnimatedNumber value={prompt.share_count} format={formatNumber} className="text-xs" />
              </div>
            </div>
          </div>
        </div>
        
        {/* 语言、标签 */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
            {language.flag} {language.label}
          </span>
          {prompt.tags.map((tag, index) => (
            <span key={index} className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded">
              #{tag}
            </span>
          ))}
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
            <span className="text-xs">来源：</span>
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
            <h2 className="text-lg font-semibold text-gray-900">提示词内容</h2>
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
          <div className="text-xs text-gray-500 mt-2">
            发布于 {formatDate(prompt.created_at)}
          </div>
        </div>
        
        {/* 右侧：相关推荐 */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900">相关推荐</h2>
              </div>
              {relatedPrompts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {relatedPrompts.map((relatedPrompt) => (
                    <PromptCard key={relatedPrompt.id} prompt={relatedPrompt} compact />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-4">
                  暂无相关推荐
                </p>
              )}
            </div>
            {/* 返回按钮 */}
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回上一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

