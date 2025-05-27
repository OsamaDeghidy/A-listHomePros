import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaRegBell, FaTrash, FaEllipsisH, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * Notification Center
 * Displays a dropdown with latest notifications and allows navigation to all notifications page
 */
const NotificationCenter = ({ className = '', maxNotifications = 5 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    loading
  } = useNotifications();

  // Close the dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  // Determine notification icon based on unread count
  const getNotificationIcon = () => {
    if (unreadCount > 0) {
      return <FaBell className="w-5 h-5" />;
    }
    return <FaRegBell className="w-5 h-5" />;
  };

  // Format timestamp to relative time text
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Determine notification type color and icon
  const getNotificationTypeDetails = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return { 
          color: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200', 
          icon: '✓' 
        };
      case 'booking_canceled':
        return { 
          color: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200', 
          icon: '✕' 
        };
      case 'payment_success':
        return { 
          color: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200', 
          icon: '$' 
        };
      case 'new_message':
        return { 
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200', 
          icon: '✉' 
        };
      case 'appointment_reminder':
        return { 
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200', 
          icon: '⏰' 
        };
      case 'promotion':
        return { 
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-200', 
          icon: '%' 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200', 
          icon: 'i' 
        };
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Close dropdown
    setIsOpen(false);
    
    // Navigate to related link if exists
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Limit displayed notifications
  const displayedNotifications = notifications.slice(0, maxNotifications);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors `}
        aria-label="Notifications"
      >
        {getNotificationIcon()}
        
        {/* Unread count indicator */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications dropdown */}
      {isOpen && (
        <div 
          className={`absolute top-full mt-2 ${isRTL ? 'right-0' : 'left-0'} w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`}
          style={{ minWidth: '320px' }}
        >
          {/* Dropdown header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex space-x-2 rtl:space-x-reverse">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Mark all as read"
                >
                  <FaCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                </button>
              )}
              <button 
                onClick={() => navigate('/notifications')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Notification settings"
              >
                <FaCog className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Notifications list */}
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : displayedNotifications.length > 0 ? (
            <div>
              {displayedNotifications.map((notification) => {
                const { color, icon } = getNotificationTypeDetails(notification.type);
                return (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${color} flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      <div className="relative">
                        <button 
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          title="Delete notification"
                        >
                          <FaTrash className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* View all notifications button */}
              <div className="p-3 text-center">
                <button 
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No new notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 