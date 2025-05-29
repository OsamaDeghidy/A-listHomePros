import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { notificationService } from '../services/api';
import { 
  FaBell, 
  FaCalendarAlt, 
  FaComment, 
  FaMoneyBillWave, 
  FaUser, 
  FaSearch, 
  FaCheck, 
  FaTrashAlt, 
  FaCheckDouble,
  FaSpinner,
  FaExclamationCircle,
  FaTimesCircle,
  FaEye,
  FaFilter,
  FaClock,
  FaEnvelope,
  FaShieldAlt,
  FaCog,
  FaStar,
  FaInfo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHeart,
  FaGift
} from 'react-icons/fa';

const NotificationsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // State management
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  
  // Filter and search states
  const [activeFilter, setActiveFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
  
  // Statistics
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
    byType: {}
  });

  // Notification details modal
  const [selectedNotificationDetails, setSelectedNotificationDetails] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/notifications');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Filter and sort notifications
  useEffect(() => {
    filterAndSortNotifications();
  }, [notifications, activeFilter, statusFilter, searchQuery, sortOrder]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotifications();
      const notificationsData = response.data.results || response.data || [];
      
      setNotifications(notificationsData);
      calculateStats(notificationsData);

    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // Use mock data as fallback
      const mockNotifications = getMockNotifications();
      setNotifications(mockNotifications);
      calculateStats(mockNotifications);
      
      setError(isArabic ? 'تم تحميل بيانات تجريبية (فشل الاتصال)' : 'Loaded demo data (connection failed)');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (notifications) => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.setDate(now.getDate() - 7));

    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.is_read && !n.read).length,
      today: notifications.filter(n => new Date(n.created_at || n.timestamp) >= today).length,
      thisWeek: notifications.filter(n => new Date(n.created_at || n.timestamp) >= weekAgo).length,
      byType: {}
    };

    // Calculate by type
    notifications.forEach(notification => {
      const type = notification.type || 'system';
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;
    });

    setNotificationStats(stats);
  };

  const filterAndSortNotifications = () => {
    let filtered = [...notifications];

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(notification => (notification.type || 'system') === activeFilter);
    }

    // Apply status filter
    if (statusFilter === 'unread') {
      filtered = filtered.filter(notification => !notification.is_read && !notification.read);
    } else if (statusFilter === 'read') {
      filtered = filtered.filter(notification => notification.is_read || notification.read);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        (notification.title && notification.title.toLowerCase().includes(query)) ||
        (notification.message && notification.message.toLowerCase().includes(query)) ||
        (notification.body && notification.body.toLowerCase().includes(query))
      );
    }

    // Sort notifications
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp);
      const dateB = new Date(b.created_at || b.timestamp);
      
      if (sortOrder === 'desc') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    setFilteredNotifications(filtered);
    
    // Reset selection when filter changes
    setSelectedNotifications([]);
    setSelectAll(false);
  };

  const markAsRead = async (ids) => {
    setMarkingAsRead(true);
    
    try {
      if (ids.length === 1) {
        await notificationService.markAsRead(ids[0]);
      } else {
        // Mark multiple as read
        await Promise.all(ids.map(id => notificationService.markAsRead(id)));
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification.id) 
            ? { ...notification, is_read: true, read: true } 
            : notification
        )
      );
      
      // Clear selection
      setSelectedNotifications([]);
      setSelectAll(false);
      
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      
      // Fall back to local update if API fails
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification.id) 
            ? { ...notification, is_read: true, read: true } 
            : notification
        )
      );
    } finally {
      setMarkingAsRead(false);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.is_read && !n.read)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const deleteNotifications = async (ids) => {
    try {
      // API call to delete notifications
      await Promise.all(ids.map(id => notificationService.deleteNotification(id)));
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => !ids.includes(notification.id))
      );
      
      // Clear selection
      setSelectedNotifications([]);
      setSelectAll(false);
      
    } catch (err) {
      console.error('Error deleting notifications:', err);
      
      // Fall back to local update if API fails
      setNotifications(prev => 
        prev.filter(notification => !ids.includes(notification.id))
      );
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
    setSelectAll(!selectAll);
  };

  const showNotificationDetails = (notification) => {
    setSelectedNotificationDetails(notification);
    setShowNotificationModal(true);
    
    // Mark as read when opened
    if (!notification.is_read && !notification.read) {
      markAsRead([notification.id]);
    }
  };

  const closeNotificationModal = () => {
    setSelectedNotificationDetails(null);
    setShowNotificationModal(false);
  };

  const getNotificationIcon = (type, priority = 'normal') => {
    const iconProps = {
      size: 16,
      className: priority === 'high' ? 'animate-pulse' : ''
    };

    switch (type) {
      case 'appointment':
        return <FaCalendarAlt className="text-blue-500" {...iconProps} />;
      case 'message':
        return <FaEnvelope className="text-green-500" {...iconProps} />;
      case 'payment':
        return <FaMoneyBillWave className="text-yellow-600" {...iconProps} />;
      case 'system':
        return <FaCog className="text-purple-500" {...iconProps} />;
      case 'security':
        return <FaShieldAlt className="text-red-500" {...iconProps} />;
      case 'user':
        return <FaUser className="text-indigo-500" {...iconProps} />;
      case 'review':
        return <FaStar className="text-orange-500" {...iconProps} />;
      case 'reminder':
        return <FaClock className="text-blue-400" {...iconProps} />;
      case 'success':
        return <FaCheckCircle className="text-green-500" {...iconProps} />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" {...iconProps} />;
      case 'info':
        return <FaInfo className="text-blue-500" {...iconProps} />;
      case 'promotion':
        return <FaGift className="text-pink-500" {...iconProps} />;
      case 'favorite':
        return <FaHeart className="text-red-400" {...iconProps} />;
      default:
        return <FaBell className="text-gray-500" {...iconProps} />;
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };
  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notifTime) / 1000);
    
    if (diffInSeconds < 60) {
      return isArabic ? 'الآن' : 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return isArabic ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return isArabic ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return isArabic ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;
    }
    
    const options = { 
      month: 'short', 
      day: 'numeric',
      year: notifTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    };
    return notifTime.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', options);
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  const getMockNotifications = () => {
    const now = new Date();
    const notifications = [];

    for (let i = 0; i < 20; i++) {
      const date = new Date(now - (i * 2 * 60 * 60 * 1000) - (Math.random() * 24 * 60 * 60 * 1000));
      const types = ['appointment', 'message', 'payment', 'system', 'security', 'review', 'reminder'];
      const priorities = ['low', 'normal', 'medium', 'high'];
      const type = types[i % types.length];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const titleMap = {
        appointment: isArabic ? ['موعد جديد', 'تأكيد موعد', 'تذكير موعد', 'إلغاء موعد'] : ['New Appointment', 'Appointment Confirmed', 'Appointment Reminder', 'Appointment Cancelled'],
        message: isArabic ? ['رسالة جديدة', 'رد جديد', 'رسالة من الدعم'] : ['New Message', 'New Reply', 'Message from Support'],
        payment: isArabic ? ['دفعة ناجحة', 'فاتورة جديدة', 'استرداد', 'فشل في الدفع'] : ['Payment Successful', 'New Invoice', 'Refund Processed', 'Payment Failed'],
        system: isArabic ? ['تحديث النظام', 'تحديث الحساب', 'إعدادات جديدة'] : ['System Update', 'Account Updated', 'New Settings'],
        security: isArabic ? ['تغيير كلمة المرور', 'تسجيل دخول جديد', 'تحديث الأمان'] : ['Password Changed', 'New Login', 'Security Update'],
        review: isArabic ? ['طلب تقييم', 'تقييم جديد', 'شكراً للتقييم'] : ['Review Request', 'New Review', 'Thank you for Review'],
        reminder: isArabic ? ['تذكير مهم', 'موعد قريب', 'مهمة معلقة'] : ['Important Reminder', 'Upcoming Appointment', 'Pending Task']
      };

      const descriptionMap = {
        appointment: isArabic ? 'لديك موعد مع أحمد محمد غداً في الساعة 2:00 مساءً' : 'You have an appointment with Ahmed Mohamed tomorrow at 2:00 PM',
        message: isArabic ? 'تلقيت رسالة جديدة من سارة أحمد' : 'You received a new message from Sarah Ahmed',
        payment: isArabic ? 'تم الدفع بنجاح بمبلغ 150 دولار' : 'Payment of $150 was processed successfully',
        system: isArabic ? 'تم تحديث معلومات حسابك بنجاح' : 'Your account information has been updated successfully',
        security: isArabic ? 'تم تغيير كلمة المرور الخاصة بك' : 'Your password has been changed',
        review: isArabic ? 'يرجى تقييم تجربتك مع محمد علي' : 'Please review your experience with Mohamed Ali',
        reminder: isArabic ? 'لديك موعد مهم غداً، لا تنس!' : 'You have an important appointment tomorrow, don\'t forget!'
      };

      notifications.push({
        id: i + 1,
        type,
        priority,
        title: titleMap[type][Math.floor(Math.random() * titleMap[type].length)],
        message: descriptionMap[type],
        body: descriptionMap[type],
        created_at: date.toISOString(),
        timestamp: date.toISOString(),
        is_read: Math.random() > 0.6,
        read: Math.random() > 0.6,
        action_url: `/${type === 'appointment' ? 'appointments' : type === 'message' ? 'messages' : type}/${i + 1}`
      });
    }

    return notifications;
  };
  
  const NotificationItem = ({ notification, isSelected, onSelect }) => {
    const isUnread = !notification.is_read && !notification.read;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          border-l-4 border-b last:border-b-0 p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer
          ${isUnread ? 'bg-blue-50 border-l-blue-500' : getPriorityColor(notification.priority)}
          ${isSelected ? 'bg-blue-100 hover:bg-blue-100' : ''}
        `}
        onClick={() => showNotificationDetails(notification)}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 mt-1">
            <input 
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(notification.id);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-shrink-0 mr-3 mt-1">
            <div className="p-2 rounded-full bg-white shadow-sm">
              {getNotificationIcon(notification.type, notification.priority)}
            </div>
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <h3 className={`text-sm font-medium ${isUnread ? 'text-blue-800' : 'text-gray-900'}`}>
                {notification.title}
                {isUnread && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {formatTimeAgo(notification.created_at || notification.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message || notification.body}
            </p>
            
            {notification.priority && notification.priority !== 'normal' && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                  notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {notification.priority === 'high' ? (isArabic ? 'عالي' : 'High') :
                   notification.priority === 'medium' ? (isArabic ? 'متوسط' : 'Medium') :
                   (isArabic ? 'منخفض' : 'Low')}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل الإشعارات...' : 'Loading notifications...'}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'الإشعارات | A-List Home Pros' : 'Notifications | A-List Home Pros'}</title>
        <meta name="description" content={isArabic ? 'عرض وإدارة إشعاراتك' : 'View and manage your notifications'} />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isArabic ? 'الإشعارات' : 'Notifications'}
              {notificationStats.unread > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-sm">
                  {notificationStats.unread}
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              {isArabic ? 'عرض وإدارة جميع إشعاراتك' : 'View and manage all your notifications'}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
            </button>
            <button
              onClick={markAllAsRead}
              disabled={markingAsRead || notificationStats.unread === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {markingAsRead ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckDouble className="mr-2" />}
              {isArabic ? 'قراءة الكل' : 'Mark All Read'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">{isArabic ? 'إجمالي الإشعارات' : 'Total Notifications'}</p>
                <p className="text-3xl font-bold">{notificationStats.total}</p>
              </div>
              <FaBell className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">{isArabic ? 'غير مقروءة' : 'Unread'}</p>
                <p className="text-3xl font-bold">{notificationStats.unread}</p>
              </div>
              <FaExclamationCircle className="h-8 w-8 text-red-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">{isArabic ? 'اليوم' : 'Today'}</p>
                <p className="text-3xl font-bold">{notificationStats.today}</p>
              </div>
              <FaClock className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">{isArabic ? 'هذا الأسبوع' : 'This Week'}</p>
                <p className="text-3xl font-bold">{notificationStats.thisWeek}</p>
              </div>
              <FaCalendarAlt className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder={isArabic ? 'البحث في الإشعارات...' : 'Search notifications...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle />
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {isArabic ? `عرض ${filteredNotifications.length} من ${notifications.length} إشعار` : `Showing ${filteredNotifications.length} of ${notifications.length} notifications`}
            </div>
          </div>
          
          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'نوع الإشعار' : 'Notification Type'}
                    </label>
                    <select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'جميع الإشعارات' : 'All Notifications'}</option>
                      <option value="appointment">{isArabic ? 'المواعيد' : 'Appointments'}</option>
                      <option value="message">{isArabic ? 'الرسائل' : 'Messages'}</option>
                      <option value="payment">{isArabic ? 'المدفوعات' : 'Payments'}</option>
                      <option value="system">{isArabic ? 'النظام' : 'System'}</option>
                      <option value="security">{isArabic ? 'الأمان' : 'Security'}</option>
                      <option value="review">{isArabic ? 'التقييمات' : 'Reviews'}</option>
                      <option value="reminder">{isArabic ? 'التذكيرات' : 'Reminders'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'الحالة' : 'Status'}
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
                      <option value="unread">{isArabic ? 'غير مقروءة' : 'Unread'}</option>
                      <option value="read">{isArabic ? 'مقروءة' : 'Read'}</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setActiveFilter('all');
                        setStatusFilter('all');
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      {isArabic ? 'إعادة تعيين' : 'Reset Filters'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications list */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex items-center">
                <FaExclamationCircle className="text-yellow-400 mr-2" />
                <p className="text-yellow-800">{error}</p>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
              />
              <span className="text-sm text-gray-600">
                {selectedNotifications.length > 0 ? (
                  <span>{isArabic ? `${selectedNotifications.length} محدد` : `${selectedNotifications.length} selected`}</span>
                ) : (
                  <span>{isArabic ? 'تحديد الكل' : 'Select all'}</span>
                )}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedNotifications.length > 0 && (
                <>
                  <button
                    onClick={() => markAsRead(selectedNotifications)}
                    disabled={markingAsRead}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {markingAsRead ? <FaSpinner className="animate-spin mr-1" /> : <FaCheck className="mr-1" />}
                    {isArabic ? 'قراءة' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => deleteNotifications(selectedNotifications)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <FaTrashAlt className="mr-1" />
                    {isArabic ? 'حذف' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FaBell className="text-gray-300 text-6xl mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {isArabic ? 'لا توجد إشعارات' : 'No notifications found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || activeFilter !== 'all' || statusFilter !== 'all'
                  ? (isArabic ? 'جرب تعديل الفلاتر لرؤية المزيد من النتائج' : 'Try adjusting your filters to see more results')
                  : (isArabic ? 'لم تتلق أي إشعارات بعد' : "You don't have any notifications yet")
                }
              </p>
              {(searchQuery || activeFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {isArabic ? 'مسح جميع الفلاتر' : 'Clear all filters'}
                </button>
              )}
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isSelected={selectedNotifications.includes(notification.id)}
                  onSelect={handleSelectNotification}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Details Modal */}
      {showNotificationModal && selectedNotificationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-blue-50">
                  {getNotificationIcon(selectedNotificationDetails.type, selectedNotificationDetails.priority)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedNotificationDetails.title}</h3>
                  <p className="text-sm text-gray-500">{formatTimeAgo(selectedNotificationDetails.created_at || selectedNotificationDetails.timestamp)}</p>
                </div>
              </div>
              <button
                onClick={closeNotificationModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Notification Details */}
            <div className="space-y-4">
              {/* Priority */}
              {selectedNotificationDetails.priority && selectedNotificationDetails.priority !== 'normal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'الأولوية' : 'Priority'}
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedNotificationDetails.priority === 'high' ? 'bg-red-100 text-red-700' :
                    selectedNotificationDetails.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {selectedNotificationDetails.priority === 'high' ? (isArabic ? 'عالي' : 'High') :
                     selectedNotificationDetails.priority === 'medium' ? (isArabic ? 'متوسط' : 'Medium') :
                     (isArabic ? 'منخفض' : 'Low')}
                  </span>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'نوع الإشعار' : 'Notification Type'}
                </label>
                <p className="text-gray-900 capitalize">{selectedNotificationDetails.type}</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الرسالة' : 'Message'}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedNotificationDetails.message || selectedNotificationDetails.body}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الحالة' : 'Status'}
                </label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedNotificationDetails.is_read || selectedNotificationDetails.read 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedNotificationDetails.is_read || selectedNotificationDetails.read 
                    ? (isArabic ? 'مقروء' : 'Read') 
                    : (isArabic ? 'غير مقروء' : 'Unread')
                  }
                </span>
              </div>

              {/* Timestamp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
                </label>
                <p className="text-gray-900">{formatDate(selectedNotificationDetails.created_at || selectedNotificationDetails.timestamp)}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeNotificationModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
              
              {selectedNotificationDetails.action_url && (
                <Link
                  to={selectedNotificationDetails.action_url}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={closeNotificationModal}
                >
                  {isArabic ? 'الانتقال للصفحة' : 'View Details'}
                </Link>
              )}
              
              {(!selectedNotificationDetails.is_read && !selectedNotificationDetails.read) && (
                <button
                  onClick={() => {
                    markAsRead([selectedNotificationDetails.id]);
                    closeNotificationModal();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isArabic ? 'تعليم كمقروء' : 'Mark as Read'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default NotificationsPage; 