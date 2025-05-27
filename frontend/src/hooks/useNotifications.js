import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import notificationService from '../services/notificationService';

/**
 * هوك مخصص لإدارة الإشعارات
 * يوفر وظائف لجلب الإشعارات وتحديدها كمقروءة وحذفها
 */
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  // إضافة تبديل للوضع التجريبي (سيتم استخدام البيانات الوهمية إذا كان true)
  const isDemoMode = !token || process.env.REACT_APP_USE_DEMO_DATA === 'true';

  // الحصول على الإشعارات من الخادم
  const fetchNotifications = useCallback(async () => {
    if (!token && !isDemoMode) return;

    setLoading(true);
    setError(null);

    try {
      let fetchedNotifications = [];
      
      if (isDemoMode) {
        // استخدام البيانات الوهمية في وضع العرض التوضيحي
        // تأخير اصطناعي لمحاكاة الاتصال بالشبكة
        await new Promise(resolve => setTimeout(resolve, 500));

        // بيانات الإشعارات الوهمية
        fetchedNotifications = [
          {
            id: '1',
            type: 'message',
            title: 'رسالة جديدة',
            message: 'لديك رسالة جديدة من محمد أحمد',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // قبل 5 دقائق
            link: '/messages'
          },
          {
            id: '2',
            type: 'appointment',
            title: 'تذكير بالموعد',
            message: 'لديك موعد مع فني الكهرباء غدًا في الساعة 10 صباحًا',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // قبل ساعة
            link: '/appointments'
          },
          {
            id: '3',
            type: 'payment',
            title: 'تم تأكيد الدفع',
            message: 'تم تأكيد دفعتك البالغة $150 لخدمات السباكة',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // قبل يوم
            link: '/payments'
          },
          {
            id: '4',
            type: 'system',
            title: 'تحديث النظام',
            message: 'تم تحديث حسابك بميزات جديدة متاحة الآن',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // قبل يومين
            link: '/account'
          },
          {
            id: '5',
            type: 'service',
            title: 'تقييم الخدمة',
            message: 'الرجاء تقييم تجربتك الأخيرة مع فني التكييف',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // قبل 3 ساعات
            link: '/reviews'
          }
        ];
      } else {
        // في وضع الإنتاج، نستخدم API حقيقية
        const response = await notificationService.getNotifications(token);
        fetchedNotifications = response.data;
      }

      setNotifications(fetchedNotifications);
      
      // حساب عدد الإشعارات غير المقروءة
      const unread = fetchedNotifications.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('حدث خطأ أثناء جلب الإشعارات. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, [token, user, isDemoMode]);

  // تحديث إشعار كمقروء
  const markAsRead = useCallback(async (notificationId) => {
    if (!token && !isDemoMode) return;

    try {
      if (!isDemoMode) {
        // في وضع الإنتاج، نستخدم API حقيقية
        await notificationService.markAsRead(token, notificationId);
      }

      // تحديث حالة الإشعار في واجهة المستخدم
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );

      // تحديث عدد الإشعارات غير المقروءة
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('حدث خطأ أثناء تحديث الإشعار. الرجاء المحاولة مرة أخرى.');
    }
  }, [token, isDemoMode]);

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(async () => {
    if (!token && !isDemoMode) return;

    try {
      if (!isDemoMode) {
        // في وضع الإنتاج، نستخدم API حقيقية
        await notificationService.markAllAsRead(token);
      }

      // تحديث جميع الإشعارات كمقروءة في واجهة المستخدم
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      // تصفير عدد الإشعارات غير المقروءة
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('حدث خطأ أثناء تحديث الإشعارات. الرجاء المحاولة مرة أخرى.');
    }
  }, [token, isDemoMode]);

  // حذف إشعار
  const deleteNotification = useCallback(async (notificationId) => {
    if (!token && !isDemoMode) return;

    try {
      if (!isDemoMode) {
        // في وضع الإنتاج، نستخدم API حقيقية
        await notificationService.deleteNotification(token, notificationId);
      }

      // التحقق مما إذا كان الإشعار غير مقروء قبل حذفه
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      const wasUnread = notificationToDelete && !notificationToDelete.read;

      // حذف الإشعار من واجهة المستخدم
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

      // تحديث عدد الإشعارات غير المقروءة إذا تم حذف إشعار غير مقروء
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('حدث خطأ أثناء حذف الإشعار. الرجاء المحاولة مرة أخرى.');
    }
  }, [token, isDemoMode, notifications]);

  // جلب الإشعارات غير المقروءة فقط
  const fetchUnreadNotifications = useCallback(async () => {
    if (!token && !isDemoMode) return;

    setLoading(true);
    setError(null);

    try {
      if (isDemoMode) {
        // في وضع العرض التوضيحي، نستخدم البيانات الوهمية ونصفيها
        const response = await fetchNotifications();
        return notifications.filter(n => !n.read);
      } else {
        // في وضع الإنتاج، نستخدم API حقيقية
        const response = await notificationService.getUnreadNotifications(token);
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
      setError('حدث خطأ أثناء جلب الإشعارات غير المقروءة. الرجاء المحاولة مرة أخرى.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, isDemoMode, fetchNotifications, notifications]);

  // جلب الإشعارات عند تحميل المكون أو تغيير المستخدم أو الرمز
  useEffect(() => {
    fetchNotifications();
    
    // إعداد تحديث دوري للإشعارات كل دقيقة
    const intervalId = setInterval(fetchNotifications, 60000);
    
    // تنظيف الفاصل الزمني عند فك تحميل المكون
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isDemoMode
  };
};

export default useNotifications; 