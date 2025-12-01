'use client';

import { useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationListProps {
  initialNotifications: Notification[];
}

export default function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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
                      {notification.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            查看详情
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(notification.data, null, 2)}
                          </pre>
                        </details>
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
    </div>
  );
}
