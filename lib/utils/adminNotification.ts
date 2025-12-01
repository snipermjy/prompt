/**
 * 管理员通知系统
 * 用于向管理员发送系统通知（分类冲突、新分类创建等）
 */

import { createAdminClient } from '@/lib/supabase/server';

/**
 * 通知类型
 */
export type NotificationType = 
  | 'category_conflict'    // 分类名称冲突
  | 'new_category'         // 新分类创建
  | 'low_quality_prompt'   // 低质量提示词
  | 'system_info';         // 系统信息

/**
 * 通知数据
 */
export interface AdminNotification {
  type: NotificationType;
  message: string;
  data?: unknown;
}

/**
 * 获取通知标题
 */
function getNotificationTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    'category_conflict': '⚠️ 分类名称冲突',
    'new_category': '✨ 新分类创建',
    'low_quality_prompt': '⚠️ 低质量提示词',
    'system_info': '📢 系统通知',
  };
  return titles[type] || '📢 系统通知';
}

/**
 * 发送管理员通知
 * 
 * @param notification - 通知内容
 * @returns 是否成功
 */
export async function notifyAdmin(notification: AdminNotification): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('admin_notifications')
      .insert([{
        type: notification.type,
        title: getNotificationTitle(notification.type),
        message: notification.message,
        data: notification.data || null,
        is_read: false,
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Failed to send admin notification:', error);
      return false;
    }
    
    console.log(`✅ Admin notification sent: ${notification.type}`);
    return true;
  } catch (error) {
    console.error('Error in notifyAdmin:', error);
    return false;
  }
}

/**
 * 获取未读通知数量
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    
    const { count, error } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    
    if (error) {
      console.error('Failed to get unread notification count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadNotificationCount:', error);
    return 0;
  }
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
}
