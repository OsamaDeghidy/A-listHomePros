import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheckCircle, FaCalendarAlt, FaCommentAlt, FaTimesCircle, FaDollarSign, FaUserCheck, FaExclamationCircle } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

const NotificationsWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate notifications data
        const mockNotifications = [
          {
            id: 1,
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: 'Your appointment with Ahmed Banna on Tuesday, October 15 at 2:00 PM has been confirmed.',
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            read: false,
            actionLink: '/booking/123',
            metadata: {
              appointmentId: '123',
              professionalName: 'Ahmed Banna'
            }
          },
          {
            id: 2,
            type: 'message_received',
            title: 'New Message',
            message: 'You have a new message from Mohamed El-Sayed.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: false,
            actionLink: '/messages/456',
            metadata: {
              conversationId: '456',
              senderName: 'Mohamed El-Sayed'
            }
          },
          {
            id: 3,
            type: 'payment_successful',
            title: 'Payment Successful',
            message: 'Your payment of $500 for service #789 has been received.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true,
            actionLink: '/payments/789',
            metadata: {
              amount: '500',
              serviceId: '789'
            }
          },
          {
            id: 4,
            type: 'profile_approved',
            title: 'Profile Approved',
            message: 'Congratulations! Your profile has been approved as a service provider on A-List Home Pros.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            read: true,
            actionLink: '/dashboard/profile',
            metadata: {
              profileId: '789'
            }
          },
          {
            id: 5,
            type: 'booking_reminder',
            title: 'Appointment Reminder',
            message: 'Reminder: You have an appointment tomorrow with Sarah Ahmed at 10:00 AM.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            read: true,
            actionLink: '/booking/456',
            metadata: {
              appointmentId: '456',
              clientName: 'Sarah Ahmed'
            }
          }
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      // In a real app, this would be an API call
      // await api.patch(`/notifications/${id}/read`);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // In a real app, this would be an API call
      // await api.post('/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
      case 'booking_reminder':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'message_received':
        return <FaCommentAlt className="text-green-500" />;
      case 'payment_successful':
        return <FaDollarSign className="text-green-500" />;
      case 'payment_failed':
        return <FaTimesCircle className="text-red-500" />;
      case 'profile_approved':
        return <FaUserCheck className="text-green-500" />;
      case 'profile_rejected':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaBell className="text-blue-500" />;
    }
  };

  // Format notification time
  const formatNotificationTime = (date) => {
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 1) {
      // Less than a day, show relative time
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (daysDiff < 7) {
      // Less than a week, show day of week
      return format(date, 'EEEE');
    } else {
      // More than a week, show date
      return format(date, 'MMM dd, yyyy');
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Notifications"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell className="mx-auto h-8 w-8 mb-2 opacity-30" />
                <p>You don't have any notifications at the moment</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <a 
                      href={notification.actionLink}
                      className="flex items-start space-x-3"
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                        </div>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
              <a href="/notifications" className="text-sm text-blue-500 hover:text-blue-700">
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsWidget; 