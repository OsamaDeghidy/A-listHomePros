import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from './useAuth';

/**
 * هوك مخصص لإدارة الإشعارات
 * يوفر وظائف لجلب الإشعارات وتحديدها كمقروءة وحذفها
 */
const useNotifications = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  // Real-time polling interval
  const pollingInterval = useRef(null);
  const POLLING_INTERVAL_MS = 30000; // 30 seconds

  // Fetch notifications
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!isAuthenticated) return;
    
    if (!silent) setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotifications();
      const data = response.data;
      
      if (data.results) {
        setNotifications(data.results);
        setUnreadCount(data.unread_count || data.results.filter(n => !n.read && !n.is_read).length);
      } else if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read && !n.is_read).length);
      }
      
      setLastFetchTime(new Date());
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      if (!silent) {
        setError('Failed to load notifications');
      }
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockNotifications = generateMockNotifications();
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read && !n.is_read).length);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.read && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      console.error('Failed to delete notification:', err);
      return false;
    }
  }, [notifications]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    if (!notification.read && !notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type || n.notification_type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read && !n.is_read);
  }, [notifications]);

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return notifications.filter(n => {
      const notificationDate = new Date(n.created_at || n.timestamp);
      return notificationDate >= yesterday;
    });
  }, [notifications]);

  // Start real-time polling
  const startPolling = useCallback(() => {
    if (!isAuthenticated) return;
    
    stopPolling(); // Clear any existing interval
    
    pollingInterval.current = setInterval(() => {
      fetchNotifications(true); // Silent fetch
    }, POLLING_INTERVAL_MS);
  }, [isAuthenticated, fetchNotifications]);

  // Stop real-time polling
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  // Initialize and setup polling
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchNotifications();
      startPolling();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isAuthenticated, currentUser, fetchNotifications, startPolling, stopPolling]);

  // Handle page visibility change to refresh notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // Page became visible, fetch latest notifications
        fetchNotifications(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, fetchNotifications]);

  // Generate mock notifications for development
  const generateMockNotifications = () => {
    const now = new Date();
    return [
      {
        id: 1,
        type: 'appointment',
        notification_type: 'APPOINTMENT',
        title: 'New Appointment Booked',
        message: 'You have a new plumbing appointment scheduled for tomorrow at 2:00 PM',
        created_at: new Date(now - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false,
        is_read: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'payment',
        notification_type: 'PAYMENT',
        title: 'Payment Received',
        message: 'You received a payment of $150.00 for electrical work',
        created_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        is_read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'message',
        notification_type: 'MESSAGE',
        title: 'New Message',
        message: 'You have a new message from Sarah Ahmed',
        created_at: new Date(now - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        read: true,
        is_read: true,
        priority: 'normal'
      },
      {
        id: 4,
        type: 'review',
        notification_type: 'REVIEW',
        title: 'New Review Received',
        message: 'Ahmed Mohamed left you a 5-star review!',
        created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        is_read: true,
        priority: 'normal'
      },
      {
        id: 5,
        type: 'system',
        notification_type: 'SYSTEM',
        title: 'Profile Updated',
        message: 'Your professional profile has been successfully updated',
        created_at: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        read: true,
        is_read: true,
        priority: 'low'
      }
    ];
  };

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    lastFetchTime,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    
    // Utilities
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications,
    
    // Real-time controls
    startPolling,
    stopPolling
  };
};

export default useNotifications; 