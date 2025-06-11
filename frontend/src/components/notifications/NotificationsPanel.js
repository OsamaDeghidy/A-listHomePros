import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaTrash, FaCheckDouble, FaCalendarCheck, FaComment, 
  FaCreditCard, FaStar, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';
import { format, formatDistance } from 'date-fns';
import { enUS, arEG } from 'date-fns/locale';

import useNotifications from '../../hooks/useNotifications';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const NotificationsPanel = () => {
  const { isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef();
  
  const {
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
    const locale = isArabic ? arEG : enUS;
    
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
        aria-label={isArabic ? 'الإشعارات' : 'Notifications'}
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
          className={`absolute ${isArabic ? 'right-0' : 'left-0'} mt-2 w-80 md:w-96 max-h-[80vh] overflow-auto rounded-md shadow-lg border border-gray-200 bg-white z-50 transition-all duration-300 ease-in-out`}
        >
          {/* رأس اللوحة */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">{isArabic ? 'الإشعارات' : 'Notifications'}</h3>
            <div className={`flex space-x-2 ${isArabic ? 'space-x-reverse' : ''}`}>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-sm text-blue-600 hover:text-blue-800 p-1"
                  title={isArabic ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                >
                  <FaCheckDouble className="text-lg" />
                </button>
              )}
              <button 
                onClick={deleteAllNotifications} 
                className="text-sm text-red-600 hover:text-red-800 p-1"
                title={isArabic ? 'حذف الكل' : 'Clear all'}
              >
                <FaTrash className="text-lg" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-sm text-gray-600 hover:text-gray-800 p-1"
                title={isArabic ? 'إغلاق' : 'Close'}
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
                <span className={`${isArabic ? 'mr-2' : 'ml-2'}`}>{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
              </div>
            )}

            {error && (
              <div className="text-center p-4 text-red-600">
                <p>{error}</p>
                <button 
                  onClick={fetchNotifications} 
                  className="mt-2 text-blue-600 hover:underline"
                >
                  {isArabic ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                <FaBell className="mx-auto text-4xl mb-2 opacity-30" />
                <p>{isArabic ? 'لا توجد إشعارات' : 'No notifications'}</p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className={`${isArabic ? 'mr-3' : 'ml-3'} flex-grow`}>
                        <p className="font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className={`flex-shrink-0 flex items-start space-x-2 ${isArabic ? 'space-x-reverse' : ''}`}>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title={isArabic ? 'تحديد كمقروء' : 'Mark as read'}
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
                          title={isArabic ? 'حذف' : 'Delete'}
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