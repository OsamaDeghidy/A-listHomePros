import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaTrash, FaCheckDouble, FaCalendarCheck, FaComment, 
  FaCreditCard, FaStar, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { format, formatDistance } from 'date-fns';
import { enUS, arEG } from 'date-fns/locale';

import useNotifications from '../../hooks/useNotifications';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useUIState } from '../../hooks/useUIState';

const NotificationsPanel = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef();
  const { isDarkMode, isRTL } = useUIState();
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications();

  // استخدام مرجع للتعامل مع النقرات خارج لوحة الإشعارات
  useOnClickOutside(panelRef, () => setIsOpen(false));

  // إعادة تحميل الإشعارات عند فتح اللوحة
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // التعامل مع النقر على زر الإشعارات
  const handleTogglePanel = () => {
    setIsOpen(!isOpen);
  };

  // معالجة النقر على إشعار
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // يمكن إضافة المزيد من المنطق هنا للتعامل مع النقر مثل التنقل إلى صفحة معينة
    console.log('Notification clicked:', notification);
  };

  // إظهار الأيقونة المناسبة لنوع الإشعار
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <FaCalendarCheck className="text-blue-500" />;
      case 'message':
        return <FaComment className="text-green-500" />;
      case 'payment':
        return <FaCreditCard className="text-purple-500" />;
      case 'review':
        return <FaStar className="text-yellow-500" />;
      case 'system':
        return <FaInfoCircle className="text-gray-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-orange-500" />;
      default:
        return <FaBell className="text-blue-500" />;
    }
  };

  // تنسيق وقت الإشعار
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const locale = i18n.language === 'ar' ? arEG : enUS;
    
    // إذا كان أقل من 24 ساعة، عرض "منذ X ساعات/دقائق"
    if (now - date < 24 * 60 * 60 * 1000) {
      return formatDistance(date, now, { addSuffix: true, locale });
    }
    
    // وإلا عرض التاريخ والوقت
    return format(date, 'PPp', { locale });
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* زر الإشعارات مع مؤشر العدد */}
      <button
        onClick={handleTogglePanel}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('notifications.button')}
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full transform translate-x-1 -translate-y-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* لوحة الإشعارات */}
      {isOpen && (
        <div 
          className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-2 w-80 md:w-96 max-h-[80vh] overflow-auto rounded-md shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        >
          {/* رأس اللوحة */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">{t('notifications.title')}</h3>
            <div className="flex space-x-2 rtl:space-x-reverse">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                  title={t('notifications.markAllRead')}
                >
                  <FaCheckDouble className="text-lg" />
                </button>
              )}
              <button 
                onClick={deleteAllNotifications} 
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                title={t('notifications.clearAll')}
              >
                <FaTrash className="text-lg" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 p-1"
                title={t('common.close')}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>

          {/* محتوى لوحة الإشعارات */}
          <div className="p-1">
            {loading && (
              <div className="flex justify-center items-center p-4">
                <div className="w-6 h-6 border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin"></div>
                <span className="ms-2">{t('common.loading')}</span>
              </div>
            )}

            {error && (
              <div className="text-center p-4 text-red-600 dark:text-red-400">
                <p>{error}</p>
                <button 
                  onClick={fetchNotifications} 
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('common.retry')}
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                <FaBell className="mx-auto text-4xl mb-2 opacity-30" />
                <p>{t('notifications.empty')}</p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ms-3 flex-grow">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-start space-x-2 rtl:space-x-reverse">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title={t('notifications.markRead')}
                          >
                            <FaCheck className="text-xs" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title={t('notifications.delete')}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel; 