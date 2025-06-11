import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { notificationService, messagingService } from '../services/api';
import { 
  FaBell, 
  FaEnvelope,
  FaSms,
  FaMobileAlt,
  FaToggleOn,
  FaToggleOff,
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaComments,
  FaStar,
  FaTools,
  FaUserCheck,
  FaExclamationCircle,
  FaBullhorn,
  FaTimes,
  FaCheck,
  FaArrowLeft,
  FaCog,
  FaTrash,
  FaEye,
  FaClock,
  FaFilter
} from 'react-icons/fa';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, unread, settings
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [filter, setFilter] = useState('all'); // all, message, appointment, payment, system
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Notification type icons and colors
  const notificationConfig = {
    MESSAGE: {
      icon: <FaComments />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      title: isArabic ? 'رسالة جديدة' : 'New Message'
    },
    APPOINTMENT: {
      icon: <FaCalendarAlt />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      title: isArabic ? 'تحديث الموعد' : 'Appointment Update'
    },
    PAYMENT: {
      icon: <FaMoneyBillWave />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      title: isArabic ? 'تحديث الدفع' : 'Payment Update'
    },
    REVIEW: {
      icon: <FaStar />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      title: isArabic ? 'تقييم جديد' : 'New Review'
    },
    SYSTEM: {
      icon: <FaExclamationCircle />,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      title: isArabic ? 'إشعار النظام' : 'System Notification'
    },
    REGISTRATION: {
      icon: <FaUserCheck />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      title: isArabic ? 'التسجيل' : 'Registration'
    },
    PROFILE_UPDATE: {
      icon: <FaCog />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      title: isArabic ? 'تحديث الملف الشخصي' : 'Profile Update'
    },
    ALISTPRO_ONBOARDING: {
      icon: <FaTools />,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      title: isArabic ? 'إعداد المحترف' : 'Professional Onboarding'
    },
    ALISTPRO_VERIFICATION: {
      icon: <FaUserCheck />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      title: isArabic ? 'التحقق من المحترف' : 'Professional Verification'
    },
    MARKETING: {
      icon: <FaBullhorn />,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      title: isArabic ? 'عرض خاص' : 'Special Offer'
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent('/notifications'));
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch notifications and settings on mount
  useEffect(() => {
    if (isAuthenticated) {
    fetchNotifications();
      fetchSettings();
    }
  }, [isAuthenticated]);
  
  // Auto-refresh notifications every minute
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchNotifications(true); // Silent refresh
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (!silent) {
        setError(isArabic ? 'فشل في تحميل الإشعارات' : 'Failed to load notifications');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await notificationService.getSettings();
      setSettings(response.data);
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      // Create default settings if not found
      setSettings({
        email_enabled: true,
        sms_enabled: false,
        push_enabled: true,
        new_message_email: true,
        new_message_sms: false,
        new_message_push: true,
        appointment_reminder_email: true,
        appointment_reminder_sms: false,
        appointment_reminder_push: true,
        appointment_status_change_email: true,
        appointment_status_change_sms: false,
        appointment_status_change_push: true,
        payment_email: true,
        payment_sms: false,
        payment_push: true,
        marketing_email: true,
        marketing_sms: false,
        marketing_push: false
      });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true, read_at: new Date().toISOString() }
          : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        read: true,
        read_at: new Date().toISOString()
      })));
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError(isArabic ? 'فشل في تحديد الكل كمقروء' : 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // Check if this is a messaging notification or general notification
      if (notifications.find(n => n.id === notificationId)?.notification_type === 'MESSAGE') {
        await messagingService.deleteNotification(notificationId);
      } else {
        // For now, we'll just remove it from the UI
        // Add delete endpoint when available
      }
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف الإشعارات المحددة؟' : 'Are you sure you want to delete selected notifications?')) {
      return;
    }

    for (const id of selectedNotifications) {
      await handleDeleteNotification(id);
    }
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await notificationService.updateSettings(settings);
      setError(null);
      // Show success message
      const successMsg = isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully';
      setError(successMsg); // Using error state for success message temporarily
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(isArabic ? 'فشل في حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read first
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type and related object
    if (notification.notification_type === 'MESSAGE' && notification.related_object_id) {
      navigate(`/dashboard/messages/${notification.related_object_id}`);
    } else if (notification.notification_type === 'APPOINTMENT' && notification.related_object_id) {
      navigate(`/dashboard/appointments/${notification.related_object_id}`);
    } else if (notification.notification_type === 'PAYMENT' && notification.related_object_id) {
      navigate(`/dashboard/payments/${notification.related_object_id}`);
    } else if (notification.notification_type === 'REVIEW' && notification.related_object_id) {
      navigate(`/pro-dashboard/reviews`);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return isArabic ? 'الآن' : 'Just now';
    } else if (diffMins < 60) {
      return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      month: 'short', 
      day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread' && notif.read) return false;
    if (filter !== 'all' && notif.notification_type.toLowerCase() !== filter) return false;
    return true;
  });

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
    </div>
  );
  }
  
  return (
    <>
      <Helmet>
        <title>{isArabic ? 'الإشعارات | A-List Home Pros' : 'Notifications | A-List Home Pros'}</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Link
                  to={currentUser?.role === 'client' ? '/dashboard' : '/pro-dashboard'}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <FaArrowLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaBell className="mr-3 text-blue-500" />
              {isArabic ? 'الإشعارات' : 'Notifications'}
                  {unreadCount > 0 && (
                    <span className="ml-3 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                      {unreadCount}
                </span>
              )}
            </h1>
            </div>
              
              {activeTab !== 'settings' && notifications.length > 0 && (
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  {unreadCount > 0 && (
            <button
                      onClick={handleMarkAllAsRead}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      <FaCheck className="mr-2" />
                      {isArabic ? 'تحديد الكل كمقروء' : 'Mark all as read'}
            </button>
                  )}
                  {showBulkActions && selectedNotifications.length > 0 && (
            <button
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-800 font-medium flex items-center"
            >
                      <FaTrash className="mr-2" />
                      {isArabic ? `حذف (${selectedNotifications.length})` : `Delete (${selectedNotifications.length})`}
            </button>
                  )}
          </div>
              )}
        </div>

            {/* Tabs */}
            <div className="flex space-x-1 rtl:space-x-reverse bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {isArabic ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {isArabic ? 'غير مقروء' : 'Unread'}
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaCog className="inline mr-2" />
                {isArabic ? 'الإعدادات' : 'Settings'}
              </button>
            </div>
          </div>
          
          {/* Content */}
          {activeTab === 'settings' ? (
            // Settings Tab
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">
                {isArabic ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </h2>

              {settings && (
                <div className="space-y-6">
                  {/* Global Settings */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium mb-4">
                      {isArabic ? 'الإعدادات العامة' : 'General Settings'}
                    </h3>
                    <div className="space-y-4">
                      <SettingToggle
                        icon={<FaEnvelope />}
                        label={isArabic ? 'الإشعارات عبر البريد الإلكتروني' : 'Email Notifications'}
                        value={settings.email_enabled}
                        onChange={(value) => handleSettingChange('email_enabled', value)}
                      />
                      <SettingToggle
                        icon={<FaSms />}
                        label={isArabic ? 'الإشعارات عبر الرسائل النصية' : 'SMS Notifications'}
                        value={settings.sms_enabled}
                        onChange={(value) => handleSettingChange('sms_enabled', value)}
                      />
                      <SettingToggle
                        icon={<FaMobileAlt />}
                        label={isArabic ? 'إشعارات الهاتف' : 'Push Notifications'}
                        value={settings.push_enabled}
                        onChange={(value) => handleSettingChange('push_enabled', value)}
                      />
            </div>
          </div>
          
                  {/* Specific Notification Types */}
                  <div className="space-y-6">
                    {/* Messages */}
                    <NotificationTypeSettings
                      title={isArabic ? 'الرسائل' : 'Messages'}
                      icon={<FaComments />}
                      settings={settings}
                      prefix="new_message"
                      onChange={handleSettingChange}
                      isArabic={isArabic}
                    />

                    {/* Appointments */}
                    <NotificationTypeSettings
                      title={isArabic ? 'المواعيد' : 'Appointments'}
                      icon={<FaCalendarAlt />}
                      settings={settings}
                      prefix="appointment_reminder"
                      onChange={handleSettingChange}
                      isArabic={isArabic}
                    />

                    {/* Payments */}
                    <NotificationTypeSettings
                      title={isArabic ? 'المدفوعات' : 'Payments'}
                      icon={<FaMoneyBillWave />}
                      settings={settings}
                      prefix="payment"
                      onChange={handleSettingChange}
                      isArabic={isArabic}
                    />

                    {/* Marketing */}
                    <NotificationTypeSettings
                      title={isArabic ? 'العروض والأخبار' : 'Offers & News'}
                      icon={<FaBullhorn />}
                      settings={settings}
                      prefix="marketing"
                      onChange={handleSettingChange}
                      isArabic={isArabic}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="pt-6">
                <button
                      onClick={saveSettings}
                      disabled={savingSettings}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {savingSettings ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <FaCheck className="mr-2" />
                          {isArabic ? 'حفظ الإعدادات' : 'Save Settings'}
                        </span>
                      )}
                    </button>
            </div>
            </div>
              )}
          </div>
          ) : (
            // Notifications List
            <>
              {/* Filter Bar */}
              {notifications.length > 0 && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <FaFilter className="text-gray-500" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'جميع الأنواع' : 'All Types'}</option>
                      <option value="message">{isArabic ? 'الرسائل' : 'Messages'}</option>
                      <option value="appointment">{isArabic ? 'المواعيد' : 'Appointments'}</option>
                      <option value="payment">{isArabic ? 'المدفوعات' : 'Payments'}</option>
                      <option value="system">{isArabic ? 'النظام' : 'System'}</option>
                    </select>
                  </div>
                  
                <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {showBulkActions ? isArabic ? 'إلغاء' : 'Cancel' : isArabic ? 'تحديد' : 'Select'}
                </button>
                  </div>
              )}

              {/* Notifications */}
              <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FaBell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      {activeTab === 'unread'
                        ? isArabic ? 'لا توجد إشعارات غير مقروءة' : 'No unread notifications'
                        : isArabic ? 'لا توجد إشعارات' : 'No notifications'}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
              {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        config={notificationConfig[notification.notification_type] || notificationConfig.SYSTEM}
                        onRead={() => handleMarkAsRead(notification.id)}
                        onDelete={() => handleDeleteNotification(notification.id)}
                        onClick={() => handleNotificationClick(notification)}
                        formatTimestamp={formatTimestamp}
                        isArabic={isArabic}
                        showBulkActions={showBulkActions}
                        isSelected={selectedNotifications.includes(notification.id)}
                        onSelect={(selected) => {
                          if (selected) {
                            setSelectedNotifications(prev => [...prev, notification.id]);
                          } else {
                            setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                          }
                        }}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </>
          )}

          {/* Error/Success Message */}
          <AnimatePresence>
            {error && (
          <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
                  error.includes('نجاح') || error.includes('success')
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{error}</span>
              <button
                    onClick={() => setError(null)}
                    className="text-white hover:text-gray-200"
              >
                    <FaTimes className="h-4 w-4" />
              </button>
            </div>
              </motion.div>
            )}
          </AnimatePresence>
                </div>
      </div>
    </>
  );
};

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  config, 
  onRead, 
  onDelete, 
  onClick, 
  formatTimestamp, 
  isArabic,
  showBulkActions,
  isSelected,
  onSelect 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-md p-4 transition-all cursor-pointer hover:shadow-lg ${
        !notification.read ? 'border-l-4 border-blue-500' : ''
      }`}
      onClick={() => !showBulkActions && onClick()}
    >
      <div className="flex items-start">
        {showBulkActions && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            className="mr-3 mt-1"
          />
        )}
        
        <div className={`p-3 rounded-full ${config.bgColor} mr-4`}>
          <div className={`h-6 w-6 ${config.color}`}>
            {config.icon}
              </div>
              </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
              <div>
              <h3 className="font-semibold text-gray-900">
                {notification.title || config.title}
              </h3>
              <p className="text-gray-600 mt-1">{notification.message}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <FaClock className="mr-1" />
                {formatTimestamp(notification.created_at)}
              </div>
              </div>

            <div className="flex items-center space-x-2 ml-4">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRead();
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title={isArabic ? 'تحديد كمقروء' : 'Mark as read'}
                >
                  <FaEye className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title={isArabic ? 'حذف' : 'Delete'}
              >
                <FaTrash className="h-4 w-4" />
              </button>
              </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

// Setting Toggle Component
const SettingToggle = ({ icon, label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <div className="text-gray-500 mr-3">{icon}</div>
        <span className="text-gray-700">{label}</span>
      </div>
              <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
              </button>
    </div>
  );
};

// Notification Type Settings Component
const NotificationTypeSettings = ({ title, icon, settings, prefix, onChange, isArabic }) => {
  return (
    <div>
      <h4 className="text-lg font-medium mb-3 flex items-center">
        <div className="text-gray-500 mr-2">{icon}</div>
        {title}
      </h4>
      <div className="ml-8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">{isArabic ? 'بريد إلكتروني' : 'Email'}</span>
          <button
            onClick={() => onChange(`${prefix}_email`, !settings[`${prefix}_email`])}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              settings[`${prefix}_email`] ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                settings[`${prefix}_email`] ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">{isArabic ? 'رسائل نصية' : 'SMS'}</span>
                <button
            onClick={() => onChange(`${prefix}_sms`, !settings[`${prefix}_sms`])}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              settings[`${prefix}_sms`] ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                settings[`${prefix}_sms`] ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
                </button>
          </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">{isArabic ? 'إشعارات الهاتف' : 'Push'}</span>
          <button
            onClick={() => onChange(`${prefix}_push`, !settings[`${prefix}_push`])}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              settings[`${prefix}_push`] ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                settings[`${prefix}_push`] ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 