import AdminSidebar from '@/components/layout/AdminSidebar';

/**
 * 管理后台布局
 * 包含侧边栏导航
 */

export const metadata = {
  title: '管理后台 - AI提示词库',
  description: 'AI提示词库管理后台',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

