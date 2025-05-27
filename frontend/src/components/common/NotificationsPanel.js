import React, { useRef, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaTimes, FaCheckDouble } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * مكون لوحة الإشعارات
 * يعرض الإشعارات الأخيرة مع إمكانية تحديدها كمقروءة وحذفها
 */
const NotificationsPanel = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = useRef(null);
  const { language, isRTL } = useLanguage();

  // استخدام هوك useOnClickOutside لإغلاق اللوحة عند النقر خارجها
  useOnClickOutside(panelRef, () => setIsOpen(false));

  // تعريف النصوص حسب اللغة
  const texts = {
    notifications: language === 'ar' ? 'الإشعارات' : 'Notifications',
    noNotifications: language === 'ar' ? 'لا توجد إشعارات' : 'No notifications',
    markAllRead: language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read',
    viewAll: language === 'ar' ? 'عرض الكل' : 'View all',
    loading: language === 'ar' ? 'جاري التحميل...' : 'Loading...',
    error: language === 'ar' ? 'حدث خطأ أثناء تحميل الإشعارات' : 'Error loading notifications',
    retry: language === 'ar' ? 'إعادة المحاولة' : 'Retry',
    justNow: language === 'ar' ? 'الآن' : 'Just now',
    minutesAgo: language === 'ar' ? 'دقائق مضت' : 'minutes ago',
    hourAgo: language === 'ar' ? 'ساعة مضت' : 'hour ago',
    hoursAgo: language === 'ar' ? 'ساعات مضت' : 'hours ago',
    dayAgo: language === 'ar' ? 'يوم مضى' : 'day ago',
    daysAgo: language === 'ar' ? 'أيام مضت' : 'days ago',
  };

  // وظيفة لتنسيق وقت الإشعار
  const formatTime = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return texts.justNow;
    if (diffMins < 60) return `${diffMins} ${texts.minutesAgo}`;
    if (diffHours === 1) return `1 ${texts.hourAgo}`;
    if (diffHours < 24) return `${diffHours} ${texts.hoursAgo}`;
    if (diffDays === 1) return `1 ${texts.dayAgo}`;
    return `${diffDays} ${texts.daysAgo}`;
  };

  // وظيفة لاختيار أيقونة الإشعار حسب نوعه
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-500 dark:text-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>;
      case 'appointment':
        return <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full text-green-500 dark:text-green-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>;
      case 'payment':
        return <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full text-purple-500 dark:text-purple-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>;
      case 'system':
        return <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>;
      case 'service':
        return <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full text-yellow-500 dark:text-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>;
      default:
        return <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-500 dark:text-blue-300">
          <FaBell className="h-5 w-5" />
        </div>;
    }
  };

  // تبديل حالة فتح/إغلاق لوحة الإشعارات
  const togglePanel = () => {
    if (!isOpen && unreadCount > 0) {
      // عند فتح اللوحة، قم بتحديث الإشعارات غير المقروءة
      // يمكن أن نترك هذا تعليقًا إذا أردنا أن يقرأ المستخدم الإشعارات بنفسه
      // markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  // وظيفة لمعالجة النقر على إشعار معين
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // يمكننا هنا تنفيذ منطق إضافي اعتمادًا على نوع الإشعار
    // مثلاً: التوجيه إلى صفحة معينة
  };

  // وظيفة لحذف إشعار
  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation(); // منع انتشار الحدث للعناصر الأب
    deleteNotification(notificationId);
  };

  // وظيفة لتحديد إشعار كمقروء
  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation(); // منع انتشار الحدث للعناصر الأب
    markAsRead(notificationId);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* زر الإشعارات */}
      <button
        onClick={togglePanel}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={texts.notifications}
      >
        <FaBell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        
        {/* شارة عدد الإشعارات غير المقروءة */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* لوحة الإشعارات */}
      {isOpen && (
        <div className={`absolute z-50 ${isRTL ? 'right-0' : 'left-0'} mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 animate-fade-in`}>
          {/* رأس اللوحة */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {texts.notifications}
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs py-0.5 px-2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => markAllAsRead()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {texts.markAllRead}
              </button>
              <button 
                onClick={togglePanel} 
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* محتوى الإشعارات */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">{texts.loading}</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-500 dark:text-red-400 mb-2">{texts.error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {texts.retry}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <FaBell className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p>{texts.noNotifications}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {/* أيقونة الإشعار */}
                  <div className="flex-shrink-0 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* محتوى الإشعار */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-semibold text-sm ${
                        !notification.read 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${
                      !notification.read 
                        ? 'text-gray-800 dark:text-gray-200' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {/* أزرار الإجراءات */}
                    <div className="mt-2 flex justify-end space-x-2">
                      {!notification.read && (
                        <button 
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs flex items-center"
                        >
                          <FaCheck className="mr-1 h-3 w-3" />
                          {language === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs flex items-center"
                      >
                        <FaTrash className="mr-1 h-3 w-3" />
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* تذييل اللوحة */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link 
                to="/notifications" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                {texts.viewAll}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel; 