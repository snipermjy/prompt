import Breadcrumb from '@/components/layout/Breadcrumb';
import NotificationList from './NotificationList';
import { createAdminClient } from '@/lib/supabase/server';

export const metadata = {
  title: '系统通知 - 管理后台',
  description: '查看系统通知',
};

export default async function NotificationsPage() {
  const supabase = createAdminClient();

  // 获取所有通知
  const { data: notifications } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  // 获取未读数量
  const { count: unreadCount } = await supabase
    .from('admin_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { label: '管理后台', href: '/admin' },
          { label: '系统通知' },
        ]}
      />

      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统通知</h1>
          <p className="text-sm text-gray-500 mt-1">
            查看分类冲突、新分类创建等系统通知
          </p>
        </div>
        {unreadCount && unreadCount > 0 && (
          <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
            {unreadCount} 条未读
          </div>
        )}
      </div>

      {/* 通知列表 */}
      <NotificationList initialNotifications={notifications || []} />
    </div>
  );
}
