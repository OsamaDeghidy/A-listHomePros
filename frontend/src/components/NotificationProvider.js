import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaBell } from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications';

// Create context
const NotificationContext = createContext();

// Custom hook to use notification context
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

// Notification Provider Component
const NotificationProvider = ({ children }) => {
  const notifications = useNotifications();
  const [toasts, setToasts] = useState([]);
  const [toastId, setToastId] = useState(0);

  // Show toast notification
  const showToast = (message, type = 'info', duration = 5000, actions = null) => {
    const id = toastId + 1;
    setToastId(id);

    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      actions,
      createdAt: new Date()
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Show success toast
  const showSuccess = (message, duration = 4000) => {
    return showToast(message, 'success', duration);
  };

  // Show error toast
  const showError = (message, duration = 6000) => {
    return showToast(message, 'error', duration);
  };

  // Show warning toast
  const showWarning = (message, duration = 5000) => {
    return showToast(message, 'warning', duration);
  };

  // Show info toast
  const showInfo = (message, duration = 4000) => {
    return showToast(message, 'info', duration);
  };

  // Show confirmation dialog
  const showConfirmation = (message, onConfirm, onCancel = null) => {
    const actions = [
      {
        label: 'Cancel',
        onClick: () => {
          onCancel && onCancel();
          removeToast(toastId + 1);
        },
        variant: 'secondary'
      },
      {
        label: 'Confirm',
        onClick: () => {
          onConfirm();
          removeToast(toastId + 1);
        },
        variant: 'primary'
      }
    ];

    return showToast(message, 'warning', 0, actions); // 0 duration = manual dismiss
  };

  // Listen for new notifications and show toasts
  useEffect(() => {
    const unreadNotifications = notifications.getUnreadNotifications();
    
    // Show toast for high priority unread notifications
    unreadNotifications.forEach(notification => {
      if (notification.priority === 'high' && 
          !notification.toastShown && 
          notification.created_at) {
        
        const createdTime = new Date(notification.created_at);
        const now = new Date();
        const timeDiff = now - createdTime;
        
        // Only show toast for notifications created in the last 5 minutes
        if (timeDiff < 5 * 60 * 1000) {
          showInfo(notification.title || notification.message, 6000);
          
          // Mark as toast shown (local state only)
          notification.toastShown = true;
        }
      }
    });
  }, [notifications.notifications]);

  // Toast component
  const Toast = ({ toast }) => {
    const getIcon = () => {
      switch (toast.type) {
        case 'success':
          return <FaCheckCircle className="text-green-500" />;
        case 'error':
          return <FaExclamationCircle className="text-red-500" />;
        case 'warning':
          return <FaExclamationCircle className="text-yellow-500" />;
        default:
          return <FaInfoCircle className="text-blue-500" />;
      }
    };

    const getBackgroundColor = () => {
      switch (toast.type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        default:
          return 'bg-blue-50 border-blue-200';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`relative rounded-lg border p-4 shadow-lg ${getBackgroundColor()} max-w-sm`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {toast.message}
            </p>
            
            {toast.actions && (
              <div className="mt-3 flex space-x-2">
                {toast.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      action.variant === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={12} />
          </button>
        </div>
      </motion.div>
    );
  };

  // Context value
  const contextValue = {
    // Notification data
    ...notifications,
    
    // Toast functions
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    removeToast,
    
    // Computed values
    hasUnreadNotifications: notifications.unreadCount > 0,
    recentNotifications: notifications.getRecentNotifications(),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Notification Bell Indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-full p-3 shadow-lg border">
            <div className="relative">
              <FaBell className="text-gray-600" />
              {notifications.unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 