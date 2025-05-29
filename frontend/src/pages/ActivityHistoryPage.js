import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { 
  schedulingService, 
  paymentService, 
  notificationService,
  alistProsService 
} from '../services/api';
import { 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaComment, 
  FaCog, 
  FaUserCircle, 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown,
  FaSpinner,
  FaExclamationCircle,
  FaClock,
  FaCheck,
  FaTimes,
  FaEye,
  FaChartLine,
  FaDownload,
  FaSyncAlt,
  FaBell,
  FaEdit,
  FaTrash,
  FaStar,
  FaTimesCircle,
  FaCalendarCheck,
  FaCreditCard,
  FaEnvelope,
  FaUserEdit,
  FaKey,
  FaShieldAlt
} from 'react-icons/fa';

const ActivityHistoryPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // State management
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter and search states
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    dateRange: 'all',
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
  
  // Statistics
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    weekActivities: 0,
    monthActivities: 0,
    byType: {}
  });

  // Activity details modal
  const [selectedActivityDetails, setSelectedActivityDetails] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/activity');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchActivityHistory();
    }
  }, [isAuthenticated]);

  // Filter and sort activities
  useEffect(() => {
    filterAndSortActivities();
  }, [activities, activeFilters, searchQuery, sortOrder]);

  const fetchActivityHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch activities from multiple sources
      const [appointments, payments, notifications] = await Promise.all([
        schedulingService.getAppointments().catch(() => ({ data: { results: [] } })),
        paymentService.getPayments().catch(() => ({ data: { results: [] } })),
        notificationService.getNotifications().catch(() => ({ data: { results: [] } }))
      ]);

      // Transform and combine activities
      const combinedActivities = [];

      // Add appointment activities
      const appointmentData = appointments.data.results || appointments.data || [];
      for (const appointment of appointmentData) {
        combinedActivities.push({
          id: `appointment_${appointment.id}`,
          type: 'appointment',
          subType: appointment.status,
          title: getAppointmentTitle(appointment),
          description: await getAppointmentDescription(appointment),
          timestamp: appointment.created_at || appointment.scheduled_date,
          status: appointment.status,
          link: `/dashboard/appointments/${appointment.id}`,
          data: appointment,
          priority: getPriority('appointment', appointment.status)
        });
      }

      // Add payment activities
      const paymentData = payments.data.results || payments.data || [];
      paymentData.forEach(payment => {
        combinedActivities.push({
          id: `payment_${payment.id}`,
          type: 'payment',
          subType: payment.status,
          title: getPaymentTitle(payment),
          description: getPaymentDescription(payment),
          timestamp: payment.created_at,
          status: payment.status,
          link: `/dashboard/payment-history`,
          data: payment,
          priority: getPriority('payment', payment.status)
        });
      });

      // Add notification activities
      const notificationData = notifications.data.results || notifications.data || [];
      notificationData.forEach(notification => {
        combinedActivities.push({
          id: `notification_${notification.id}`,
          type: 'notification',
          subType: notification.type,
          title: notification.title || (isArabic ? 'إشعار جديد' : 'New Notification'),
          description: notification.message || notification.body,
          timestamp: notification.created_at,
          status: notification.is_read ? 'read' : 'unread',
          link: notification.action_url || '/dashboard/notifications',
          data: notification,
          priority: getPriority('notification', notification.is_read ? 'read' : 'unread')
        });
      });

      // Add mock system activities if no real data
      if (combinedActivities.length === 0) {
        combinedActivities.push(...getMockActivities());
      }

      // Sort by timestamp (newest first by default)
      combinedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setActivities(combinedActivities);
      calculateStats(combinedActivities);

    } catch (err) {
      console.error('Error fetching activity history:', err);
      
      // Use mock data as fallback
      const mockActivities = getMockActivities();
      setActivities(mockActivities);
      calculateStats(mockActivities);
      
      setError(isArabic ? 'تم تحميل بيانات تجريبية (فشل الاتصال)' : 'Loaded demo data (connection failed)');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshActivities = async () => {
    setRefreshing(true);
    await fetchActivityHistory();
    setRefreshing(false);
  };

  const calculateStats = (activities) => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

    const stats = {
      totalActivities: activities.length,
      todayActivities: activities.filter(a => new Date(a.timestamp) >= today).length,
      weekActivities: activities.filter(a => new Date(a.timestamp) >= weekAgo).length,
      monthActivities: activities.filter(a => new Date(a.timestamp) >= monthAgo).length,
      byType: {}
    };

    // Calculate by type
    activities.forEach(activity => {
      if (!stats.byType[activity.type]) {
        stats.byType[activity.type] = 0;
      }
      stats.byType[activity.type]++;
    });

    setActivityStats(stats);
  };

  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // Apply type filter
    if (activeFilters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === activeFilters.type);
    }

    // Apply status filter
    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(activity => activity.status === activeFilters.status);
    }

    // Apply date range filter
    const now = new Date();
    let fromDate;

    switch (activeFilters.dateRange) {
      case 'today':
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
        break;
      case 'week':
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 7);
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
        break;
      case 'month':
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 1);
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
        break;
      case 'year':
        fromDate = new Date(now);
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
        break;
      default:
        // 'all' - no date filtering
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(query) || 
        activity.description.toLowerCase().includes(query)
      );
    }

    // Sort activities
    filtered.sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
    });

    setFilteredActivities(filtered);
  };

  // Helper functions
  const getAppointmentTitle = (appointment) => {
    const statusMap = {
      pending: isArabic ? 'موعد معلق' : 'Appointment Pending',
      confirmed: isArabic ? 'موعد مؤكد' : 'Appointment Confirmed',
      completed: isArabic ? 'موعد مكتمل' : 'Appointment Completed',
      cancelled: isArabic ? 'موعد ملغي' : 'Appointment Cancelled',
      rescheduled: isArabic ? 'موعد معاد جدولته' : 'Appointment Rescheduled'
    };
    return statusMap[appointment.status] || (isArabic ? 'موعد جديد' : 'New Appointment');
  };

  const getAppointmentDescription = async (appointment) => {
    let description = '';
    
    if (appointment.alistpro) {
      try {
        const alistproId = typeof appointment.alistpro === 'object' 
          ? appointment.alistpro.id 
          : appointment.alistpro;
        const proRes = await alistProsService.getProfileDetail(alistproId);
        const professionalName = proRes.data.business_name || proRes.data.user?.username;
        
        description = isArabic 
          ? `مع ${professionalName} - ${appointment.service_type || 'خدمة'}`
          : `with ${professionalName} - ${appointment.service_type || 'Service'}`;
      } catch {
        description = isArabic ? 'مع محترف' : 'with Professional';
      }
    }

    if (appointment.scheduled_date) {
      const date = formatDate(appointment.scheduled_date);
      description += ` ${isArabic ? 'في' : 'on'} ${date}`;
    }

    return description;
  };

  const getPaymentTitle = (payment) => {
    const statusMap = {
      completed: isArabic ? 'دفعة مكتملة' : 'Payment Completed',
      succeeded: isArabic ? 'دفعة ناجحة' : 'Payment Successful',
      pending: isArabic ? 'دفعة معلقة' : 'Payment Pending',
      failed: isArabic ? 'دفعة فاشلة' : 'Payment Failed',
      refunded: isArabic ? 'استرداد' : 'Refund Processed'
    };
    return statusMap[payment.status] || (isArabic ? 'معاملة مالية' : 'Financial Transaction');
  };

  const getPaymentDescription = (payment) => {
    const amount = formatCurrency(payment.amount || 0);
    return isArabic 
      ? `مبلغ ${amount} ${payment.description ? `- ${payment.description}` : ''}`
      : `Amount ${amount} ${payment.description ? `- ${payment.description}` : ''}`;
  };

  const getPriority = (type, status) => {
    const priorityMap = {
      appointment: { pending: 3, confirmed: 2, completed: 1, cancelled: 1 },
      payment: { pending: 3, failed: 3, completed: 1, succeeded: 1 },
      notification: { unread: 2, read: 1 }
    };
    
    return priorityMap[type]?.[status] || 1;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getActivityIcon = (type, subType = null, status = null) => {
    switch (type) {
      case 'appointment':
        if (status === 'confirmed') return <FaCalendarCheck className="text-green-500" />;
        if (status === 'completed') return <FaCheck className="text-blue-500" />;
        if (status === 'cancelled') return <FaTimes className="text-red-500" />;
        return <FaCalendarAlt className="text-blue-500" />;
      case 'payment':
        if (status === 'completed' || status === 'succeeded') return <FaCheck className="text-green-500" />;
        if (status === 'failed') return <FaTimes className="text-red-500" />;
        if (status === 'pending') return <FaClock className="text-yellow-500" />;
        return <FaCreditCard className="text-green-500" />;
      case 'notification':
        return <FaBell className={status === 'unread' ? 'text-blue-500' : 'text-gray-500'} />;
      case 'message':
        return <FaEnvelope className="text-purple-500" />;
      case 'settings':
        return <FaCog className="text-gray-500" />;
      case 'account':
        return <FaUserEdit className="text-yellow-600" />;
      case 'security':
        return <FaShieldAlt className="text-red-600" />;
      default:
        return <FaUserCircle className="text-gray-500" />;
    }
  };

  const getStatusBadge = (type, status) => {
    let config = { color: 'gray', text: status };

    if (type === 'appointment') {
      const statusMap = {
        pending: { color: 'yellow', text: isArabic ? 'معلق' : 'Pending' },
        confirmed: { color: 'blue', text: isArabic ? 'مؤكد' : 'Confirmed' },
        completed: { color: 'green', text: isArabic ? 'مكتمل' : 'Completed' },
        cancelled: { color: 'red', text: isArabic ? 'ملغي' : 'Cancelled' }
      };
      config = statusMap[status] || config;
    } else if (type === 'payment') {
      const statusMap = {
        completed: { color: 'green', text: isArabic ? 'مكتمل' : 'Completed' },
        succeeded: { color: 'green', text: isArabic ? 'نجح' : 'Succeeded' },
        pending: { color: 'yellow', text: isArabic ? 'معلق' : 'Pending' },
        failed: { color: 'red', text: isArabic ? 'فشل' : 'Failed' },
        refunded: { color: 'blue', text: isArabic ? 'مرتد' : 'Refunded' }
      };
      config = statusMap[status] || config;
    } else if (type === 'notification') {
      const statusMap = {
        unread: { color: 'blue', text: isArabic ? 'غير مقروء' : 'Unread' },
        read: { color: 'gray', text: isArabic ? 'مقروء' : 'Read' }
      };
      config = statusMap[status] || config;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return isArabic ? 'الآن' : 'Just now';
    if (diffInMinutes < 60) return isArabic ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return isArabic ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return isArabic ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;

    return formatDate(timestamp);
  };

  const getMockActivities = () => {
    const now = new Date();
    const activities = [];

    // Generate realistic mock activities
    for (let i = 0; i < 15; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000) - (Math.random() * 12 * 60 * 60 * 1000));
      
      if (i % 4 === 0) {
        activities.push({
          id: `mock_appointment_${i}`,
          type: 'appointment',
          subType: 'confirmed',
          title: isArabic ? 'موعد مؤكد' : 'Appointment Confirmed',
          description: isArabic ? 'مع أحمد محمد - خدمة السباكة' : 'with Ahmed Mohamed - Plumbing Service',
          timestamp: date.toISOString(),
          status: 'confirmed',
          link: `/dashboard/appointments/${i}`,
          priority: 2
        });
      } else if (i % 4 === 1) {
        activities.push({
          id: `mock_payment_${i}`,
          type: 'payment',
          subType: 'completed',
          title: isArabic ? 'دفعة مكتملة' : 'Payment Completed',
          description: isArabic ? 'مبلغ $125.50 - خدمة السباكة' : 'Amount $125.50 - Plumbing Service',
          timestamp: date.toISOString(),
          status: 'completed',
          link: '/dashboard/payment-history',
          priority: 1
        });
      } else if (i % 4 === 2) {
        activities.push({
          id: `mock_notification_${i}`,
          type: 'notification',
          subType: 'appointment_reminder',
          title: isArabic ? 'تذكير بالموعد' : 'Appointment Reminder',
          description: isArabic ? 'موعدك مع أحمد محمد غداً في الساعة 2:00 مساءً' : 'Your appointment with Ahmed Mohamed tomorrow at 2:00 PM',
          timestamp: date.toISOString(),
          status: 'unread',
          link: '/dashboard/notifications',
          priority: 2
        });
      } else {
        activities.push({
          id: `mock_account_${i}`,
          type: 'account',
          subType: 'profile_update',
          title: isArabic ? 'تحديث الملف الشخصي' : 'Profile Updated',
          description: isArabic ? 'تم تحديث معلومات ملفك الشخصي' : 'Your profile information was updated',
          timestamp: date.toISOString(),
          status: 'completed',
          link: '/dashboard/profile',
          priority: 1
        });
      }
    }

    return activities;
  };

  const exportActivities = () => {
    const headers = [
      isArabic ? 'التاريخ' : 'Date',
      isArabic ? 'النوع' : 'Type', 
      isArabic ? 'العنوان' : 'Title',
      isArabic ? 'الوصف' : 'Description',
      isArabic ? 'الحالة' : 'Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredActivities.map(activity => [
        formatDate(activity.timestamp),
        activity.type,
        `"${activity.title}"`,
        `"${activity.description}"`,
        activity.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const showActivityDetails = (activity) => {
    setSelectedActivityDetails(activity);
    setShowActivityModal(true);
  };

  const closeActivityModal = () => {
    setSelectedActivityDetails(null);
    setShowActivityModal(false);
  };

  const groupActivitiesByDate = (activities) => {
    const grouped = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dateString = date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      
      grouped[dateString].push(activity);
    });

    return grouped;
  };

  // Activity Item Component
  const ActivityItem = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative pb-8"
    >
      {/* Timeline line */}
      <div className="absolute top-0 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
      
      <div className="relative flex items-start space-x-3">
        {/* Icon */}
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-8 ring-white shadow-sm border border-gray-200">
            {getActivityIcon(activity.type, activity.subType, activity.status)}
          </div>
          {activity.priority > 2 && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-400 rounded-full"></div>
          )}
        </div>
        
        {/* Content */}
        <div className="min-w-0 flex-1 py-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 px-4 py-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                  {getStatusBadge(activity.type, activity.status)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
              </div>
              <div className="text-right ml-4">
                <time className="text-xs text-gray-500 block">{getTimeAgo(activity.timestamp)}</time>
                <time className="text-xs text-gray-400 block mt-1">{formatDate(activity.timestamp)}</time>
              </div>
            </div>
            
            {activity.link && (
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => showActivityDetails(activity)}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEye className="mr-1" size={12} />
                  {isArabic ? 'عرض التفاصيل' : 'View Details'}
                </button>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  activity.priority > 2 ? 'bg-red-100 text-red-700' :
                  activity.priority > 1 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.priority > 2 ? (isArabic ? 'عالي' : 'High') :
                   activity.priority > 1 ? (isArabic ? 'متوسط' : 'Medium') :
                   (isArabic ? 'منخفض' : 'Low')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل تاريخ الأنشطة...' : 'Loading activity history...'}</p>
      </div>
    );
  }

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'تاريخ الأنشطة | A-List Home Pros' : 'Activity History | A-List Home Pros'}</title>
        <meta name="description" content={isArabic ? 'عرض وإدارة تاريخ أنشطتك وتفاعلاتك على المنصة' : 'View and manage your activity history and interactions on the platform'} />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isArabic ? 'تاريخ الأنشطة' : 'Activity History'}
            </h1>
            <p className="text-gray-600">
              {isArabic ? 'تتبع أنشطتك الأخيرة وتفاعلاتك على المنصة' : 'Track your recent activities and interactions on the platform'}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={refreshActivities}
              disabled={refreshing}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
              title={isArabic ? 'ترتيب' : 'Sort'}
            >
              <FaSortAmountDown className={sortOrder === 'asc' ? 'transform rotate-180' : ''} />
            </button>
            <button
              onClick={exportActivities}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaDownload className="mr-2 h-4 w-4" />
              {isArabic ? 'تصدير' : 'Export'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">{isArabic ? 'إجمالي الأنشطة' : 'Total Activities'}</p>
                <p className="text-3xl font-bold">{activityStats.totalActivities}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">{isArabic ? 'أنشطة اليوم' : 'Today\'s Activities'}</p>
                <p className="text-3xl font-bold">{activityStats.todayActivities}</p>
              </div>
              <FaClock className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">{isArabic ? 'هذا الأسبوع' : 'This Week'}</p>
                <p className="text-3xl font-bold">{activityStats.weekActivities}</p>
              </div>
              <FaCalendarAlt className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">{isArabic ? 'هذا الشهر' : 'This Month'}</p>
                <p className="text-3xl font-bold">{activityStats.monthActivities}</p>
              </div>
              <FaUserCircle className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder={isArabic ? 'البحث في الأنشطة...' : 'Search activities...'}
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
              {isArabic ? `عرض ${filteredActivities.length} من ${activities.length} نشاط` : `Showing ${filteredActivities.length} of ${activities.length} activities`}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'نوع النشاط' : 'Activity Type'}
                    </label>
                    <select
                      value={activeFilters.type}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'جميع الأنشطة' : 'All Activities'}</option>
                      <option value="appointment">{isArabic ? 'المواعيد' : 'Appointments'}</option>
                      <option value="payment">{isArabic ? 'المدفوعات' : 'Payments'}</option>
                      <option value="notification">{isArabic ? 'الإشعارات' : 'Notifications'}</option>
                      <option value="message">{isArabic ? 'الرسائل' : 'Messages'}</option>
                      <option value="account">{isArabic ? 'الحساب' : 'Account'}</option>
                      <option value="settings">{isArabic ? 'الإعدادات' : 'Settings'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'الحالة' : 'Status'}
                    </label>
                    <select
                      value={activeFilters.status}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
                      <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
                      <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
                      <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                      <option value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</option>
                      <option value="failed">{isArabic ? 'فشل' : 'Failed'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'فترة التاريخ' : 'Date Range'}
                    </label>
                    <select
                      value={activeFilters.dateRange}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'كل الأوقات' : 'All Time'}</option>
                      <option value="today">{isArabic ? 'اليوم' : 'Today'}</option>
                      <option value="week">{isArabic ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                      <option value="month">{isArabic ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
                      <option value="year">{isArabic ? 'آخر سنة' : 'Last Year'}</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setActiveFilters({ type: 'all', dateRange: 'all', status: 'all' });
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

        {/* Activities Timeline */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex items-center">
                <FaExclamationCircle className="text-yellow-400 mr-2" />
                <p className="text-yellow-800">{error}</p>
              </div>
            </div>
          )}

          <div className="p-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <FaUserCircle className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {isArabic ? 'لا توجد أنشطة' : 'No activities found'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || activeFilters.type !== 'all' || activeFilters.dateRange !== 'all' || activeFilters.status !== 'all'
                    ? (isArabic ? 'جرب تعديل الفلاتر لرؤية المزيد من النتائج' : 'Try adjusting your filters to see more results')
                    : (isArabic ? 'لم تقم بأي أنشطة بعد' : "You don't have any activity history yet")
                  }
                </p>
                {(searchQuery || activeFilters.type !== 'all' || activeFilters.dateRange !== 'all' || activeFilters.status !== 'all') && (
                  <button
                    onClick={() => {
                      setActiveFilters({ type: 'all', dateRange: 'all', status: 'all' });
                      setSearchQuery('');
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {isArabic ? 'مسح جميع الفلاتر' : 'Clear all filters'}
                  </button>
                )}
              </div>
            ) : (
              <div>
                {Object.entries(groupedActivities).map(([date, activities]) => (
                  <div key={date} className="mb-8">
                    <motion.h2 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg mb-6 border-l-4 border-blue-500"
                    >
                      {date}
                    </motion.h2>
                    <div className="flow-root pl-2">
                      <div className="-mb-8">
                        {activities.map((activity) => (
                          <ActivityItem key={activity.id} activity={activity} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Details Modal */}
      {showActivityModal && selectedActivityDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  {getActivityIcon(selectedActivityDetails.type, selectedActivityDetails.subType, selectedActivityDetails.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedActivityDetails.title}</h3>
                  <p className="text-sm text-gray-500">{getTimeAgo(selectedActivityDetails.timestamp)}</p>
                </div>
              </div>
              <button
                onClick={closeActivityModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Activity Details */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الحالة' : 'Status'}
                </label>
                <div>
                  {getStatusBadge(selectedActivityDetails.type, selectedActivityDetails.status)}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الوصف' : 'Description'}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedActivityDetails.description}</p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'نوع النشاط' : 'Activity Type'}
                </label>
                <p className="text-gray-900 capitalize">{selectedActivityDetails.type}</p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الأولوية' : 'Priority'}
                </label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  selectedActivityDetails.priority > 2 ? 'bg-red-100 text-red-700' :
                  selectedActivityDetails.priority > 1 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {selectedActivityDetails.priority > 2 ? (isArabic ? 'عالي' : 'High') :
                   selectedActivityDetails.priority > 1 ? (isArabic ? 'متوسط' : 'Medium') :
                   (isArabic ? 'منخفض' : 'Low')}
                </span>
              </div>

              {/* Timestamp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
                </label>
                <p className="text-gray-900">{formatDate(selectedActivityDetails.timestamp)}</p>
              </div>

              {/* Additional Data (if available) */}
              {selectedActivityDetails.data && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'معلومات إضافية' : 'Additional Information'}
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {selectedActivityDetails.type === 'appointment' && selectedActivityDetails.data && (
                      <div className="space-y-2">
                        {selectedActivityDetails.data.service_type && (
                          <p><span className="font-medium">{isArabic ? 'نوع الخدمة:' : 'Service Type:'}</span> {selectedActivityDetails.data.service_type}</p>
                        )}
                        {selectedActivityDetails.data.scheduled_date && (
                          <p><span className="font-medium">{isArabic ? 'موعد الخدمة:' : 'Service Date:'}</span> {formatDate(selectedActivityDetails.data.scheduled_date)}</p>
                        )}
                        {selectedActivityDetails.data.address && (
                          <p><span className="font-medium">{isArabic ? 'العنوان:' : 'Address:'}</span> {selectedActivityDetails.data.address}</p>
                        )}
                      </div>
                    )}
                    
                    {selectedActivityDetails.type === 'payment' && selectedActivityDetails.data && (
                      <div className="space-y-2">
                        {selectedActivityDetails.data.amount && (
                          <p><span className="font-medium">{isArabic ? 'المبلغ:' : 'Amount:'}</span> {formatCurrency(selectedActivityDetails.data.amount)}</p>
                        )}
                        {selectedActivityDetails.data.payment_method && (
                          <p><span className="font-medium">{isArabic ? 'وسيلة الدفع:' : 'Payment Method:'}</span> {selectedActivityDetails.data.payment_method}</p>
                        )}
                      </div>
                    )}
                    
                    {selectedActivityDetails.type === 'notification' && selectedActivityDetails.data && (
                      <div className="space-y-2">
                        {selectedActivityDetails.data.type && (
                          <p><span className="font-medium">{isArabic ? 'نوع الإشعار:' : 'Notification Type:'}</span> {selectedActivityDetails.data.type}</p>
                        )}
                        {selectedActivityDetails.data.message && (
                          <p><span className="font-medium">{isArabic ? 'الرسالة:' : 'Message:'}</span> {selectedActivityDetails.data.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeActivityModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
              
              {selectedActivityDetails.link && (
                <Link
                  to={selectedActivityDetails.link}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={closeActivityModal}
                >
                  {isArabic ? 'الانتقال للصفحة' : 'Go to Page'}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ActivityHistoryPage; 