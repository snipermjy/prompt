import Link from 'next/link';
import { getSubmissions } from '@/app/actions/submissions';
import SubmissionsTable from './SubmissionsTable';

/**
 * 用户提交管理页面
 * 审核、通过、拒绝用户提交的提示词
 */

// 禁用页面缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function SubmissionsManagePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { status } = params;

  // 获取所有提交数据用于统计
  const allSubmissions = await getSubmissions();
  // 获取筛选后的数据
  const submissions = status ? allSubmissions.filter(s => s.status === status) : allSubmissions;

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户提交管理</h1>
        <p className="text-sm text-gray-600 mt-1">共 {submissions.length} 条提交</p>
      </div>

      {/* 状态筛选 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">状态筛选:</label>
          <div className="flex gap-2">
            <Link
              href="/admin/submissions"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部 ({allSubmissions.length})
            </Link>
            <Link
              href="/admin/submissions?status=pending"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              待审核 ({allSubmissions.filter(s => s.status === 'pending').length})
            </Link>
            <Link
              href="/admin/submissions?status=approved"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已通过 ({allSubmissions.filter(s => s.status === 'approved').length})
            </Link>
            <Link
              href="/admin/submissions?status=rejected"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已拒绝 ({allSubmissions.filter(s => s.status === 'rejected').length})
            </Link>
          </div>
        </div>
      </div>

      {/* 提交列表 */}
      <SubmissionsTable submissions={submissions} />
    </div>
  );
}

