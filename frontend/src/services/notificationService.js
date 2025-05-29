import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { notificationService as apiNotificationService } from './api';
import { useAuth } from '../hooks/useAuth';

/**
 * NotificationService - خدمة للتعامل مع الإشعارات
 */
class NotificationService {
  /**
   * الحصول على جميع إشعارات المستخدم الحالي
   * @param {string} token رمز المصادقة
   * @param {Object} params معلمات التصفية والترتيب
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getUserNotifications(token, params = {}) {
    return apiNotificationService.getNotifications(token, params)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching user notifications:', error);
        throw error;
      });
  }

  /**
   * تحديث حالة الإشعار كمقروء
   * @param {string} token رمز المصادقة
   * @param {string} notificationId معرف الإشعار
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  markAsRead(token, notificationId) {
    return apiNotificationService.markAsRead(token, notificationId)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error marking notification ${notificationId} as read:`, error);
        throw error;
      });
  }

  /**
   * تحديث حالة جميع الإشعارات كمقروءة
   * @param {string} token رمز المصادقة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  markAllAsRead(token) {
    return apiNotificationService.markAllAsRead(token)
      .then(response => response.data)
      .catch(error => {
        console.error('Error marking all notifications as read:', error);
        throw error;
      });
  }

  /**
   * حذف إشعار
   * @param {string} token رمز المصادقة
   * @param {string} notificationId معرف الإشعار
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  deleteNotification(token, notificationId) {
    return apiNotificationService.deleteNotification(token, notificationId)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error deleting notification ${notificationId}:`, error);
        throw error;
      });
  }

  /**
   * حذف جميع الإشعارات
   * @param {string} token رمز المصادقة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  deleteAllNotifications(token) {
    return apiNotificationService.deleteAllNotifications(token)
      .then(response => response.data)
      .catch(error => {
        console.error('Error deleting all notifications:', error);
        throw error;
      });
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   * @param {string} token رمز المصادقة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getUnreadCount(token) {
    return apiNotificationService.getUnreadCount(token)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching unread notifications count:', error);
        throw error;
      });
  }

  /**
   * تحديث إعدادات الإشعارات للمستخدم
   * @param {string} token رمز المصادقة
   * @param {Object} settings إعدادات الإشعارات المحدثة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  updateNotificationSettings(token, settings) {
    return apiNotificationService.updateNotificationSettings(token, settings)
      .then(response => response.data)
      .catch(error => {
        console.error('Error updating notification settings:', error);
        throw error;
      });
  }

  /**
   * الحصول على إعدادات الإشعارات الحالية للمستخدم
   * @param {string} token رمز المصادقة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getNotificationSettings(token) {
    return apiNotificationService.getNotificationSettings(token)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching notification settings:', error);
        throw error;
      });
  }

  /**
   * الاشتراك في إشعارات الوقت الفعلي
   * @param {string} token رمز المصادقة
   * @param {Object} deviceInfo معلومات جهاز المستخدم
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  subscribeToRealTimeNotifications(token, deviceInfo) {
    return apiNotificationService.subscribeToRealTimeNotifications(token, deviceInfo)
      .then(response => response.data)
      .catch(error => {
        console.error('Error subscribing to real-time notifications:', error);
        throw error;
      });
  }

  /**
   * إلغاء الاشتراك من إشعارات الوقت الفعلي
   * @param {string} token رمز المصادقة
   * @param {string} deviceId معرف الجهاز
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  unsubscribeFromRealTimeNotifications(token, deviceId) {
    return apiNotificationService.unsubscribeFromRealTimeNotifications(token, deviceId)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error unsubscribing from real-time notifications for device ${deviceId}:`, error);
        throw error;
      });
  }
}

export default new NotificationService();

// النوع الافتراضي للإشعار هو 'info'
// Default notification type is 'info'
const DEFAULT_DURATION = 5000; // 5 seconds

// بيانات إشعارات تجريبية للاختبار
// Demo notification data for testing
const getDemoNotifications = () => [
  {
    id: 1,
    title: 'New Message',
    message: 'You have received a new message from John Doe',
    category: 'message',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    link: '/messages/1'
  },
  {
    id: 2,
    title: 'Booking Confirmed',
    message: 'Your booking with Sarah Plumber has been confirmed',
    category: 'booking',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    link: '/bookings/2'
  },
  {
    id: 3,
    title: 'Payment Processed',
    message: 'Your payment of $150 has been successfully processed',
    category: 'payment',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    link: '/payments/3'
  },
  {
    id: 4,
    title: 'Welcome to A-List Home Pros',
    message: 'Thank you for joining our platform. Get started by completing your profile.',
    category: 'system',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    link: '/profile'
  },
  {
    id: 5,
    title: 'New Feature Available',
    message: 'Check out our new messaging system for better communication with professionals',
    category: 'system',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    link: '/help/features'
  }
];

// إنشاء سياق الإشعارات
// Create notification context
const NotificationContext = createContext();

// مزود الإشعارات الذي سيغلف التطبيق
// Notification provider that will wrap the application
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // جلب الإشعارات من الخادم
  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // استدعاء واجهة برمجة التطبيقات للحصول على الإشعارات
      // Call API to get notifications
      const response = await apiNotificationService.getNotifications();
      
      // تحميل البيانات من استجابة الخادم
      // Load data from server response
      if (response && response.data) {
        setNotifications(response.data.results || response.data);
        
        // استدعاء API للحصول على عدد الإشعارات غير المقروءة
        // Call API to get unread count
        const unreadResponse = await apiNotificationService.getUnreadCount();
        setUnreadCount(unreadResponse.data.count || 0);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
      
      // في حالة فشل الاتصال بالخادم، استخدم بيانات تجريبية للاختبار
      // In case of server connection failure, use demo data for testing
      const demoData = getDemoNotifications();
      setNotifications(demoData);
      setUnreadCount(demoData.filter(n => !n.read).length);
      
      setLoading(false);
    }
  }, [isAuthenticated]);

  // جلب الإشعارات عند تغيير حالة المصادقة
  // Fetch notifications when authentication state changes

  // جلب الإشعارات عند تغيير حالة المصادقة
  // Fetch notifications when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // إعداد محدث الإشعارات كل دقيقة (في التطبيق الفعلي يمكن استخدام WebSockets)
      // Set up a notification refresher every minute (in a real app, WebSockets would be used)
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 60000); // every minute
      
      return () => clearInterval(intervalId);
    } else {
      // إعادة تعيين الإشعارات عند تسجيل الخروج
      // Reset notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [fetchNotifications, isAuthenticated]);

  // تحديد إشعار كمقروء
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // استدعاء API لتحديد الإشعار كمقروء
      // Call API to mark notification as read
      await apiNotificationService.markAsRead(notificationId);
      
      // تحديث الواجهة محليًا
      // Update UI locally
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // تحديث عدد الإشعارات غير المقروءة
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // استدعاء API لتحديد جميع الإشعارات كمقروءة
      // Call API to mark all notifications as read
      await apiNotificationService.markAllAsRead();
      
      // تحديث الواجهة محليًا
      // Update UI locally
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // تحديث عدد الإشعارات غير المقروءة
      // Update unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  // حذف إشعار
  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      // في التطبيق الفعلي، يجب إضافة نقطة نهاية API لحذف الإشعارات
      // In a real app, an API endpoint for deleting notifications should be added
      // await apiNotificationService.deleteNotification(notificationId);
      
      // تحديث الواجهة محليًا
      // Update UI locally
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // تحديث عدد الإشعارات غير المقروءة إذا كان الإشعار المحذوف غير مقروء
      // Update unread count if the deleted notification was unread
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setError(err.message || 'Failed to delete notification');
    }
  };

  // حذف جميع الإشعارات
  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      // في التطبيق الفعلي، يجب إضافة نقطة نهاية API لحذف جميع الإشعارات
      // In a real app, an API endpoint for deleting all notifications should be added
      // await apiNotificationService.deleteAllNotifications();
      
      // تحديث الواجهة محليًا
      // Update UI locally
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
      setError(err.message || 'Failed to delete all notifications');
    }
  };

  // إضافة إشعار جديد (يمكن استخدامه محليًا أو عند استقبال إشعار من WebSocket)
  // Add new notification (can be used locally or when receiving a notification from WebSocket)
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now(), // استخدام المعرف من الخادم أو توليد معرف مؤقت
      createdAt: notification.createdAt || new Date().toISOString(),
      read: notification.read || false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// هوك مخصص لاستخدام سياق الإشعارات
// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 