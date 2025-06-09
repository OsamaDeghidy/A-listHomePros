import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaComment, 
  FaCog, 
  FaUser,
  FaStar,
  FaShieldAlt,
  FaTimes,
  FaCheck,
  FaEye,
  FaTrash,
  FaSpinner
} from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

const NotificationBell = ({ className = '', showLabel = false }) => {
  const { currentUser } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const bellRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
      case 'APPOINTMENT':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'message':
      case 'MESSAGE':
        return <FaComment className="text-green-500" />;
      case 'payment':
      case 'PAYMENT':
        return <FaMoneyBillWave className="text-yellow-600" />;
      case 'system':
      case 'SYSTEM':
        return <FaCog className="text-purple-500" />;
      case 'security':
      case 'ALISTPRO_VERIFICATION':
        return <FaShieldAlt className="text-red-500" />;
      case 'review':
      case 'REVIEW':
        return <FaStar className="text-orange-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notifTime) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notifTime.toLocaleDateString();
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    setActionLoading(prev => ({ ...prev, [notificationId]: 'reading' }));
    
    const success = await markAsRead(notificationId);
    
    setActionLoading(prev => ({ ...prev, [notificationId]: null }));
    
    if (!success) {
      // Show error feedback if needed
      console.error('Failed to mark notification as read');
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    setActionLoading(prev => ({ ...prev, [notificationId]: 'deleting' }));
    
    const success = await deleteNotification(notificationId);
    
    setActionLoading(prev => ({ ...prev, [notificationId]: null }));
    
    if (!success) {
      // Show error feedback if needed
      console.error('Failed to delete notification');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    setActionLoading(prev => ({ ...prev, markAll: true }));
    
    const success = await markAllAsRead();
    
    setActionLoading(prev => ({ ...prev, markAll: false }));
    
    if (!success) {
      console.error('Failed to mark all notifications as read');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read && !notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Close dropdown
    setIsOpen(false);
    
    // Navigate to notification link if available
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  // Get recent notifications to display (max 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={`relative ${className}`} ref={bellRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors duration-200"
        aria-label="Notifications"
      >
        <FaBell className="h-6 w-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        
        {/* Pulse Animation for New Notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-400 rounded-full animate-ping opacity-75"></span>
        )}
      </button>

      {/* Label */}
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-1 text-red-500">({unreadCount})</span>
          )}
        </span>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={actionLoading.markAll}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {actionLoading.markAll ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        'Mark all read'
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-gray-400 text-xl" />
                  <span className="ml-2 text-gray-500">Loading notifications...</span>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <FaBell className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
                  <p className="text-xs text-gray-400">When you have notifications, they'll appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentNotifications.map((notification) => {
                    const isUnread = !notification.read && !notification.is_read;
                    const currentAction = actionLoading[notification.id];
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                          isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            <div className="p-1 bg-white rounded-full shadow-sm">
                              {getNotificationIcon(notification.type || notification.notification_type)}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${isUnread ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {notification.title}
                                  {isUnread && (
                                    <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTimeAgo(notification.created_at || notification.timestamp)}
                                </p>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center space-x-1 ml-2">
                                {isUnread && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                    disabled={currentAction === 'reading'}
                                    className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                    title="Mark as read"
                                  >
                                    {currentAction === 'reading' ? (
                                      <FaSpinner className="animate-spin h-3 w-3" />
                                    ) : (
                                      <FaCheck className="h-3 w-3" />
                                    )}
                                  </button>
                                )}
                                
                                <button
                                  onClick={(e) => handleDelete(notification.id, e)}
                                  disabled={currentAction === 'deleting'}
                                  className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                                  title="Delete notification"
                                >
                                  {currentAction === 'deleting' ? (
                                    <FaSpinner className="animate-spin h-3 w-3" />
                                  ) : (
                                    <FaTrash className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
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
                  to="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-blue-600 hover:text-blue-800 font-medium text-center"
                >
                  View all notifications
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