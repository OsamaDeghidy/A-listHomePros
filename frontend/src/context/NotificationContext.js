import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

// Create notifications context
const NotificationContext = createContext();

// Provider for notifications context
export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/notifications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data.results || []);
      countUnread(response.data.results || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Error fetching notifications');
      setLoading(false);
      // Use demo data in case of failure - ولا نستدعي Hook مباشرة
      const demoNotifications = getDemoData();
      setNotifications(demoNotifications);
      countUnread(demoNotifications);
    }
  }, [isAuthenticated, token]);
  
  // Count unread notifications
  const countUnread = (notificationsList) => {
    const count = notificationsList.filter(notification => !notification.is_read).length;
    setUnreadCount(count);
  };
  
  // Get demo data for development environment
  const getDemoData = () => { // تغيير الاسم من useDemoData إلى getDemoData لأنها ليست hook
    return [
      {
        id: 1,
        title: 'New Booking',
        message: 'Your booking with plumber Mohammed has been confirmed',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        is_read: false,
        type: 'booking_confirmed',
        link: '/bookings/123'
      },
      {
        id: 2,
        title: 'Reminder',
        message: 'You have an appointment tomorrow with an electrician at 10 AM',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        is_read: true,
        type: 'appointment_reminder',
        link: '/bookings/456'
      },
      {
        id: 3,
        title: 'Special Discount',
        message: 'Get 15% off on cleaning services this week',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        is_read: false,
        type: 'promotion',
        link: '/services/cleaning'
      }
    ];
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated || !token) return;
    
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/notifications/notifications/${notificationId}/read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local list after marking as read
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Update UI even if request fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/notifications/notifications/read_all/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local list
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Update UI even if request fails
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    }
  };
  
  // Delete a notification
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated || !token) return;
    
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/notifications/notifications/${notificationId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local list after deletion
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      countUnread(updatedNotifications);
    } catch (err) {
      console.error('Error deleting notification:', err);
      // Update UI even if request fails
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      setNotifications(updatedNotifications);
      countUnread(updatedNotifications);
    }
  };
  
  // Add a toast notification
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    
    // Remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };
  
  // Remove a toast notification
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Add a new notification (used for testing or WebSocket integration)
  const addNotification = (notification) => {
    const newNotification = {
      id: notification.id || Date.now(),
      ...notification,
      created_at: notification.created_at || new Date().toISOString(),
      is_read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast for new notification
    addToast(notification.message || notification.title, 'info');
  };
  
  // Fetch notifications on component load and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Fetch notifications every minute for updates
      const interval = setInterval(fetchNotifications, 60000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);
  
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toasts,
    addToast,
    removeToast,
    addNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to access notifications context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;