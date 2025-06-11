import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useNotifications } from '../hooks/useNotifications';
import {
  FaBell,
  FaComments,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaStar,
  FaExclamationCircle,
  FaUserCheck,
  FaCog,
  FaTools,
  FaBullhorn,
  FaClock,
  FaCheck,
  FaEye
} from 'react-icons/fa';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  // Notification type configurations
  const notificationConfig = {
    MESSAGE: {
      icon: <FaComments />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    APPOINTMENT: {
      icon: <FaCalendarAlt />,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    PAYMENT: {
      icon: <FaMoneyBillWave />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    REVIEW: {
      icon: <FaStar />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    SYSTEM: {
      icon: <FaExclamationCircle />,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    },
    REGISTRATION: {
      icon: <FaUserCheck />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    PROFILE_UPDATE: {
      icon: <FaCog />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    ALISTPRO_ONBOARDING: {
      icon: <FaTools />,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50'
    },
    ALISTPRO_VERIFICATION: {
      icon: <FaUserCheck />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    MARKETING: {
      icon: <FaBullhorn />,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setShowDropdown(false);

    // Navigate based on notification type
    if (notification.notification_type === 'MESSAGE' && notification.related_object_id) {
      navigate(`/dashboard/messages/${notification.related_object_id}`);
    } else if (notification.notification_type === 'APPOINTMENT' && notification.related_object_id) {
      navigate(`/dashboard/appointments/${notification.related_object_id}`);
    } else if (notification.notification_type === 'PAYMENT' && notification.related_object_id) {
      navigate(`/dashboard/payments/${notification.related_object_id}`);
    } else if (notification.notification_type === 'REVIEW') {
      navigate(`/pro-dashboard/reviews`);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return isArabic ? 'الآن' : 'Just now';
    } else if (diffMins < 60) {
      return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Get recent notifications (max 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        ref={bellRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={isArabic ? 'الإشعارات' : 'Notifications'}
      >
        <FaBell className="h-5 w-5" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        
        {/* Pulse Animation for New Notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping opacity-75"></span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isArabic ? 'الإشعارات' : 'Notifications'}
                </h3>
                <Link
                  to="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isArabic ? 'عرض الكل' : 'View All'}
                </Link>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FaBell className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">
                    {isArabic ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentNotifications.map((notification) => {
                    const config = notificationConfig[notification.notification_type] || notificationConfig.SYSTEM;
                    
                    return (
                      <motion.div
                        key={notification.id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full ${config.bgColor} mr-3`}>
                            <div className={`h-4 w-4 ${config.color}`}>
                              {config.icon}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <FaClock className="mr-1" />
                              {formatTimestamp(notification.created_at)}
                              {!notification.read && (
                                <span className="ml-2 flex items-center text-blue-600">
                                  <FaEye className="mr-1" />
                                  {isArabic ? 'جديد' : 'New'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <Link
                  to="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {isArabic ? 'عرض جميع الإشعارات' : 'View All Notifications'}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 