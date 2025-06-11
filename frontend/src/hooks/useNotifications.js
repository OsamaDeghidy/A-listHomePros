import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService, messagingService } from '../services/api';
import { useAuth } from './useAuth';

/**
 * هوك مخصص لإدارة الإشعارات
 * يوفر وظائف لجلب الإشعارات وتحديدها كمقروءة وحذفها
 */
const useNotifications = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      const notificationsData = response.data.results || response.data || [];
      setNotifications(notificationsData);
      
      // Calculate unread count
      const unread = notificationsData.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Connect to WebSocket for real-time notifications
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !currentUser) return;

    try {
      const wsUrl = messagingService.getWebSocketUrl();
      const token = localStorage.getItem('token');
      
      // Add authentication token to WebSocket URL
      const wsUrlWithAuth = `${wsUrl}?token=${token}`;
      
      wsRef.current = new WebSocket(wsUrlWithAuth);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for notifications');
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to user's notification channel
        wsRef.current.send(JSON.stringify({
          type: 'subscribe',
          channel: `notifications_${currentUser.id}`
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            // Add new notification to the list
            const newNotification = data.notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
              showBrowserNotification(newNotification);
            }
            
            // Play notification sound
            playNotificationSound();
          } else if (data.type === 'notification_read') {
            // Update notification as read
            const notificationId = data.notification_id;
            setNotifications(prev => prev.map(n => 
              n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
          } else if (data.type === 'notification_deleted') {
            // Remove deleted notification
            const notificationId = data.notification_id;
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            // Update unread count if the deleted notification was unread
            const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
            if (wasUnread) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, timeout);
        }
      };
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
    }
  }, [isAuthenticated, currentUser, notifications]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = (notification) => {
    const notificationConfig = {
      MESSAGE: { icon: '💬', title: 'New Message' },
      APPOINTMENT: { icon: '📅', title: 'Appointment Update' },
      PAYMENT: { icon: '💰', title: 'Payment Update' },
      REVIEW: { icon: '⭐', title: 'New Review' },
      SYSTEM: { icon: '🔔', title: 'System Notification' }
    };

    const config = notificationConfig[notification.notification_type] || notificationConfig.SYSTEM;
    
    new Notification(config.title, {
      body: notification.message,
      icon: '/logo192.png', // Your app icon
      badge: '/logo192.png',
      tag: `notification-${notification.id}`,
      requireInteraction: false,
      silent: false
    });
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3'); // Add this sound file to your public folder
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Could not play notification sound:', err));
    } catch (err) {
      console.log('Error playing notification sound:', err);
    }
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Send WebSocket update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_read',
          notification_id: notificationId
        }));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
      
      // Send WebSocket update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_all_read'
        }));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      // Check if this is a messaging notification or general notification
      const notification = notifications.find(n => n.id === notificationId);
      if (notification?.notification_type === 'MESSAGE') {
        await messagingService.deleteNotification(notificationId);
      } else {
        // For now, just remove from UI
        // Add delete endpoint when available
      }
      
      // Update local state
      const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Send WebSocket update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'delete_notification',
          notification_id: notificationId
        }));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  // Initialize
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      connectWebSocket();
      requestNotificationPermission();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, connectWebSocket, disconnectWebSocket, fetchNotifications]);

  // Auto-refresh notifications every 5 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    lastFetchTime,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
};

export default useNotifications; 