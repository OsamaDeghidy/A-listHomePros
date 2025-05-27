import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';

// معرف للإشارة إلى ما إذا كانت WebSocket مفتوحة
// Flag to indicate whether WebSocket is open
let isWebSocketOpen = false;

/**
 * خطاف WebSocket للإشعارات في الوقت الحقيقي
 * WebSocket hook for real-time notifications
 */
export const useWebSocketNotifications = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const websocketRef = useRef(null);

  /**
   * إعادة الاتصال بالخادم عند انقطاع الاتصال
   * Reconnect to server when connection is lost
   */
  const reconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    initializeWebSocket();
  }, []);

  /**
   * إنشاء اتصال WebSocket وإعداد مستمعي الأحداث
   * Create WebSocket connection and set up event listeners
   */
  const initializeWebSocket = useCallback(() => {
    if (!isAuthenticated || !currentUser || isWebSocketOpen) return;

    // الحصول على رمز المصادقة من التخزين المحلي
    // Get authentication token from local storage
    const token = localStorage.getItem('token');
    if (!token) return;

    // مسار WebSocket من متغيرات البيئة أو القيمة الافتراضية
    // WebSocket path from environment variables or default value
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
    
    // إنشاء عنوان WebSocket مع رمز المصادقة
    // Create WebSocket address with authentication token
    const websocketUrl = `${wsUrl}/notifications/?token=${token}`;
    
    try {
      // إنشاء اتصال WebSocket
      // Create WebSocket connection
      websocketRef.current = new WebSocket(websocketUrl);
      
      // تعيين معالج فتح الاتصال
      // Set connection open handler
      websocketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        isWebSocketOpen = true;
      };
      
      // تعيين معالج الرسائل
      // Set message handler
      websocketRef.current.onmessage = (event) => {
        try {
          // تحليل الرسالة المستلمة
          // Parse received message
          const data = JSON.parse(event.data);
          
          // التحقق مما إذا كانت الرسالة إشعارًا
          // Check if message is a notification
          if (data.type === 'notification') {
            // إضافة الإشعار باستخدام الدالة المقدمة من سياق الإشعارات
            // Add notification using function provided by notification context
            addNotification({
              id: data.id,
              title: data.title,
              message: data.message,
              category: data.category,
              read: false,
              createdAt: data.created_at || new Date().toISOString(),
              link: data.link
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      // تعيين معالج الأخطاء
      // Set error handler
      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        isWebSocketOpen = false;
      };
      
      // تعيين معالج إغلاق الاتصال
      // Set connection close handler
      websocketRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        isWebSocketOpen = false;
        
        // إعادة الاتصال بعد فترة إذا لم يتم إغلاق الاتصال عمدًا
        // Reconnect after a period if connection was not closed intentionally
        if (event.code !== 1000) {
          console.log('Attempting to reconnect...');
          setTimeout(reconnect, 5000);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      isWebSocketOpen = false;
    }
  }, [isAuthenticated, currentUser, addNotification, reconnect]);

  // إنشاء اتصال WebSocket عند تحميل المكون
  // Create WebSocket connection when component mounts
  useEffect(() => {
    initializeWebSocket();
    
    // تنظيف اتصال WebSocket عند إزالة المكون
    // Clean up WebSocket connection when component unmounts
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close(1000, 'Component unmounted');
        isWebSocketOpen = false;
      }
    };
  }, [initializeWebSocket, isAuthenticated]);

  // إعادة الاتصال عند تغيير حالة المصادقة
  // Reconnect when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isWebSocketOpen) {
      initializeWebSocket();
    }
  }, [isAuthenticated, initializeWebSocket]);

  return {
    websocketStatus: isWebSocketOpen ? 'connected' : 'disconnected',
    reconnect
  };
};

export default useWebSocketNotifications; 