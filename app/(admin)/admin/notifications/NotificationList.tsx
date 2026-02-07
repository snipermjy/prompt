'use client';

import { useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: {
    categoryId?: string;
    categoryName?: string;
    categorySlug?: string;
    parentCategory?: string;
    description?: string;
    reason?: string;
    [key: string]: unknown;
  };
  is_read: boolean;
  created_at: string;
}

interface NotificationListProps {
  initialNotifications: Notification[];
}

export default function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string; parent_category: string | null }>>([]);
  const [selectedTargetSlug, setSelectedTargetSlug] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 过滤通知
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  // 标记为已读
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        ));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // 全部标记为已读
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // 删除通知
  const deleteNotification = async (id: string) => {
    if (!confirm('确定要删除这条通知吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // 批准新分类（不做任何操作，只标记已读）
  const approveCategory = async (notification: Notification) => {
    if (!confirm('确认批准这个新分类吗？')) {
      return;
    }

    await markAsRead(notification.id);
    alert('✅ 已批准！新分类将继续使用。');
  };

  // 打开合并分类对话框
  const openMergeModal = async (notification: Notification) => {
    setSelectedNotification(notification);
    setMergeModalOpen(true);

    // 加载所有分类
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // 执行合并分类
  const executeMerge = async () => {
    if (!selectedNotification?.data?.categorySlug || !selectedTargetSlug) {
      alert('请选择目标分类');
      return;
    }

    if (!confirm(`确定要将"${selectedNotification.data.categoryName}"合并到选定的分类吗？`)) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/categories/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceSlug: selectedNotification.data.categorySlug,
          targetSlug: selectedTargetSlug,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        
        // 标记通知为已读并关闭对话框
        await markAsRead(selectedNotification.id);
        setMergeModalOpen(false);
        setSelectedNotification(null);
        setSelectedTargetSlug('');
      } else {
        const error = await response.json();
        alert(`❌ 合并失败: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to merge categories:', error);
      alert('❌ 合并失败，请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 通知类型图标
  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'category_conflict': '⚠️',
      'new_category': '✨',
      'low_quality_prompt': '⚠️',
      'system_info': '📢',
    };
    return icons[type] || '📢';
  };

  // 通知类型颜色
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'category_conflict': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'new_category': 'bg-blue-50 border-blue-200 text-blue-800',
      'low_quality_prompt': 'bg-red-50 border-red-200 text-red-800',
      'system_info': 'bg-gray-50 border-gray-200 text-gray-800',
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* 过滤器和操作栏 */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部 ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            未读 ({notifications.filter(n => !n.is_read).length})
          </button>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          全部标记为已读
        </button>
      </div>

      {/* 通知列表 */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            暂无通知
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
                notification.is_read ? 'border-gray-200' : 'border-blue-300 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* 图标 */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${getTypeColor(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                      
                      {/* 额外数据 */}
                      {notification.data != null && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            查看详情
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded text-sm space-y-1">
                            {notification.data.categoryName && (
                              <div><span className="font-medium">分类名称：</span>{notification.data.categoryName}</div>
                            )}
                            {notification.data.parentCategory && (
                              <div><span className="font-medium">一级分类：</span>{notification.data.parentCategory}</div>
                            )}
                            {notification.data.description && (
                              <div><span className="font-medium">描述：</span>{notification.data.description}</div>
                            )}
                            {notification.data.reason && (
                              <div><span className="font-medium">AI判断理由：</span>{notification.data.reason}</div>
                            )}
                          </div>
                        </details>
                      )}
                      
                      {/* 新分类审核操作 */}
                      {notification.type === 'new_category' && !notification.is_read && notification.data?.categorySlug && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => approveCategory(notification)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            ✅ 批准
                          </button>
                          <button
                            onClick={() => openMergeModal(notification)}
                            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            🔀 合并到现有分类
                          </button>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString('zh-CN')}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                        >
                          标记已读
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 合并分类对话框 */}
      {mergeModalOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                合并分类：{selectedNotification.data?.categoryName}
              </h2>
              
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 此操作将把所有使用"{selectedNotification.data?.categoryName}"分类的提示词迁移到目标分类，并删除该分类。
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择目标分类：
                </label>
                <select
                  value={selectedTargetSlug}
                  onChange={(e) => setSelectedTargetSlug(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                >
                  <option value="">-- 请选择 --</option>
                  {categories
                    .filter(c => c.slug !== selectedNotification.data?.categorySlug)
                    .map(category => (
                      <option key={category.slug} value={category.slug}>
                        {category.parent_category ? `${category.parent_category} > ` : ''}{category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setMergeModalOpen(false);
                    setSelectedNotification(null);
                    setSelectedTargetSlug('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isProcessing}
                >
                  取消
                </button>
                <button
                  onClick={executeMerge}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  disabled={!selectedTargetSlug || isProcessing}
                >
                  {isProcessing ? '处理中...' : '确认合并'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
