import Link from 'next/link';
import { getPrompts } from '@/app/actions/prompts';
import { getSubmissions } from '@/app/actions/submissions';
import { getCategoriesWithCount } from '@/app/actions/categories';
import { formatNumber } from '@/lib/utils/formatNumber';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import { statusConfig } from '@/lib/config/site';

/**
 * 管理后台首页
 * 显示统计数据和最新/热门提示词
 */

// 禁用页面缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminHomePage() {
  // 获取数据 - 管理后台首页也显示所有状态
  const [allPrompts, pendingSubmissions, categories] = await Promise.all([
    getPrompts(undefined, 100, 0, true), // includeAll = true
    getSubmissions('pending'),
    getCategoriesWithCount(),
  ]);

  // 计算统计数据
  const totalViews = allPrompts.reduce((sum, p) => sum + p.view_count, 0);
  const latestPrompts = allPrompts.slice(0, 5);
  const popularPrompts = [...allPrompts]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5);

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">后台首页</h1>
        <p className="text-sm text-gray-600 mt-1">欢迎回来！这是您的数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总提示词数"
          value={allPrompts.length}
          icon={
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          bgColor="bg-blue-50"
        />
        <StatCard
          title="总浏览量"
          value={formatNumber(totalViews)}
          icon={
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          bgColor="bg-green-50"
        />
        <StatCard
          title="待审核"
          value={pendingSubmissions.length}
          icon={
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-yellow-50"
          link="/admin/submissions"
        />
        <StatCard
          title="总分类数"
          value={categories.length}
          icon={
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          bgColor="bg-purple-50"
        />
      </div>

      {/* 内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 最新提示词 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最新提示词</h2>
          <div className="space-y-3">
            {latestPrompts.map((prompt) => (
              <div key={prompt.id} className="flex items-start justify-between gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{prompt.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                      {prompt.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatNumber(prompt.view_count)} 浏览
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusConfig[prompt.status].bgColor} ${statusConfig[prompt.status].color}`}>
                      {statusConfig[prompt.status].label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/prompt/${prompt.id}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    查看
                  </Link>
                  <Link
                    href={`/admin/prompts/${prompt.id}/edit`}
                    className="text-xs text-gray-600 hover:text-gray-700"
                  >
                    编辑
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 热门提示词 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">热门提示词</h2>
          <div className="space-y-3">
            {popularPrompts.map((prompt, index) => (
              <div key={prompt.id} className="flex items-start justify-between gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{prompt.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                        {prompt.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatNumber(prompt.view_count)} 浏览
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/prompt/${prompt.id}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    查看
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 分类统计 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">分类统计</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium text-gray-900 text-sm">{category.name}</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{category.prompt_count}</div>
              <div className="text-xs text-gray-500 mt-1">个提示词</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 统计卡片组件
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  link?: string;
}

function StatCard({ title, value, icon, bgColor, link }: StatCardProps) {
  const content = (
    <div className={`${bgColor} rounded-lg p-4 transition-all ${link ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

