import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { userService, notificationService, paymentService } from '../services/api';
import { 
  FaUser, 
  FaBell, 
  FaShieldAlt, 
  FaGlobe, 
  FaCreditCard, 
  FaEnvelope, 
  FaMobile,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEdit,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaSave,
  FaLock,
  FaKey,
  FaSignOutAlt,
  FaUserCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaDownload,
  FaCog,
  FaHeart,
  FaCalendarAlt
} from 'react-icons/fa';

const SettingsPage = () => {
  const { currentUser, updateUserProfile, logout, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    avatar: '',
    date_of_birth: '',
    gender: '',
    language: language || 'en',
    timezone: 'America/New_York',
    currency: 'USD'
  });

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Password change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    appointment_reminders: true,
    payment_confirmations: true,
    system_updates: true,
    marketing_emails: false,
    newsletter: false,
    instant_messages: true,
    review_requests: true
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: false,
    login_notifications: true,
    remember_devices: true,
    session_timeout: 30,
    email_on_password_change: true
  });

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    show_phone: false,
    show_email: false,
    data_collection: true,
    analytics: true
  });
  
  // Account statistics
  const [accountStats, setAccountStats] = useState({
    appointmentsCount: 0,
    reviewsCount: 0,
    favoritesCount: 0,
    joinDate: '',
    lastLogin: ''
  });

  // Tab configurations
  const tabs = [
    {
      id: 'profile',
      name: isArabic ? 'الملف الشخصي' : 'Profile',
      icon: FaUser,
      description: isArabic ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'
    },
    {
      id: 'notifications',
      name: isArabic ? 'الإشعارات' : 'Notifications',
      icon: FaBell,
      description: isArabic ? 'إعدادات الإشعارات' : 'Notification preferences'
      },
    {
      id: 'security',
      name: isArabic ? 'الأمان' : 'Security',
      icon: FaShieldAlt,
      description: isArabic ? 'كلمة المرور والأمان' : 'Password and security settings'
    },
    {
      id: 'payments',
      name: isArabic ? 'المدفوعات' : 'Payments',
      icon: FaCreditCard,
      description: isArabic ? 'وسائل الدفع' : 'Payment methods'
    },
    {
      id: 'privacy',
      name: isArabic ? 'الخصوصية' : 'Privacy',
      icon: FaLock,
      description: isArabic ? 'إعدادات الخصوصية' : 'Privacy settings'
    }
  ];

  // Languages
  const languages = [
    { value: 'en', label: isArabic ? 'الإنجليزية' : 'English' },
    { value: 'ar', label: isArabic ? 'العربية' : 'Arabic' }
  ];
  
  // Timezones
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (GMT-5)' },
    { value: 'America/Chicago', label: 'Central Time (GMT-6)' },
    { value: 'America/Denver', label: 'Mountain Time (GMT-7)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (GMT-8)' },
    { value: 'Europe/London', label: 'London Time (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris Time (GMT+1)' },
    { value: 'Asia/Dubai', label: 'Dubai Time (GMT+4)' },
    { value: 'Asia/Riyadh', label: 'Riyadh Time (GMT+3)' }
  ];

  const currencies = [
    { value: 'USD', label: '$' },
    { value: 'EUR', label: '€' },
    { value: 'SAR', label: 'ر.س' },
    { value: 'AED', label: 'د.إ' }
  ];
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/profile');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load user data
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserData();
      loadNotificationSettings();
      loadPaymentMethods();
      loadAccountStats();
    }
  }, [isAuthenticated, currentUser]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
    if (currentUser) {
        setProfileData({
          name: currentUser.name || currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
          bio: currentUser.bio || '',
          location: currentUser.location || '',
          avatar: currentUser.avatar || currentUser.profile_picture || '',
          date_of_birth: currentUser.date_of_birth || '',
          gender: currentUser.gender || '',
          language: currentUser.language || language || 'en',
          timezone: currentUser.timezone || 'America/New_York',
          currency: currentUser.currency || 'USD'
        });
        setAvatarPreview(currentUser.avatar || currentUser.profile_picture || '');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(isArabic ? 'خطأ في تحميل بيانات المستخدم' : 'Error loading user data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
        try {
          const response = await notificationService.getSettings();
          setNotificationSettings(response.data);
        } catch (err) {
      console.error('Error loading notification settings:', err);
          // Use defaults if API fails
        }
      };
      
  const loadPaymentMethods = async () => {
    try {
      const response = await paymentService.getPaymentMethods();
      setPaymentMethods(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      // Use mock data as fallback
      setPaymentMethods(getMockPaymentMethods());
    }
  };

  const loadAccountStats = async () => {
    try {
      const response = await userService.getAccountStats();
      setAccountStats(response.data);
    } catch (err) {
      console.error('Error loading account stats:', err);
      // Use mock data
      setAccountStats({
        appointmentsCount: 12,
        reviewsCount: 8,
        favoritesCount: 5,
        joinDate: '2023-01-15',
        lastLogin: new Date().toISOString()
      });
    }
  };

  const getMockPaymentMethods = () => {
    return [
      {
        id: 'pm_1',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2024
        },
        billing_details: {
          name: profileData.name || 'User'
        },
        is_default: true
      },
      {
        id: 'pm_2',
        type: 'card',
        card: {
          brand: 'mastercard',
          last4: '5678',
          exp_month: 10,
          exp_year: 2025
        },
        billing_details: {
          name: profileData.name || 'User'
        },
        is_default: false
      }
    ];
  };

  const handleInputChange = (section, field, value) => {
    switch (section) {
      case 'profile':
        setProfileData(prev => ({ ...prev, [field]: value }));
        break;
      case 'password':
        setPasswordData(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotificationSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecuritySettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'privacy':
        setPrivacySettings(prev => ({ ...prev, [field]: value }));
        break;
      default:
        break;
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
  };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      let avatarUrl = profileData.avatar;

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarResponse = await userService.uploadAvatar(formData);
        avatarUrl = avatarResponse.data.avatar_url;
    }

      // Update profile
      await updateUserProfile({
        ...profileData,
        avatar: avatarUrl
      });

      setSuccess(isArabic ? 'تم حفظ الملف الشخصي بنجاح' : 'Profile saved successfully');
      setAvatarFile(null);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(isArabic ? 'خطأ في حفظ الملف الشخصي' : 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError(isArabic ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setError(isArabic ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters long');
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await userService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setSuccess(isArabic ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
    } catch (err) {
      console.error('Error changing password:', err);
      setError(isArabic ? 'خطأ في تغيير كلمة المرور' : 'Error changing password');
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await notificationService.updateSettings(notificationSettings);
      setSuccess(isArabic ? 'تم حفظ إعدادات الإشعارات بنجاح' : 'Notification settings saved successfully');
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError(isArabic ? 'خطأ في حفظ إعدادات الإشعارات' : 'Error saving notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const deletePaymentMethod = async (id) => {
    try {
      await paymentService.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      setSuccess(isArabic ? 'تم حذف وسيلة الدفع بنجاح' : 'Payment method deleted successfully');
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError(isArabic ? 'خطأ في حذف وسيلة الدفع' : 'Error deleting payment method');
    }
  };

  const setDefaultPaymentMethod = async (id) => {
    try {
      await paymentService.setDefaultPaymentMethod(id);
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          is_default: method.id === id
        }))
      );
      setSuccess(isArabic ? 'تم تعيين وسيلة الدفع الافتراضية' : 'Default payment method set');
    } catch (err) {
      console.error('Error setting default payment method:', err);
      setError(isArabic ? 'خطأ في تعيين وسيلة الدفع الافتراضية' : 'Error setting default payment method');
    }
  };

  const downloadAccountData = async () => {
    try {
      const response = await userService.downloadAccountData();
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading account data:', err);
      setError(isArabic ? 'خطأ في تحميل بيانات الحساب' : 'Error downloading account data');
    }
  };

  const deleteAccount = async () => {
    try {
      await userService.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(isArabic ? 'خطأ في حذف الحساب' : 'Error deleting account');
    }
  };

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}</p>
    </div>
  );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      <Helmet>
        <title>{isArabic ? 'الإعدادات - قائمة المنزل للمحترفين' : 'Settings - A List Home Pros'}</title>
        <meta name="description" content={isArabic ? 'إدارة إعدادات حسابك الشخصي' : 'Manage your account settings'} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isArabic ? 'إعدادات الحساب' : 'Account Settings'}
          </h1>
          <p className="text-gray-600">
            {isArabic ? 'إدارة معلوماتك الشخصية وإعدادات الحساب' : 'Manage your personal information and account preferences'}
          </p>
        </motion.div>

        {/* Account Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? 'المواعيد' : 'Appointments'}
                </h3>
                <p className="text-3xl font-bold">{accountStats.appointmentsCount}</p>
              </div>
              <FaCalendarAlt className="text-3xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? 'التقييمات' : 'Reviews'}
                </h3>
                <p className="text-3xl font-bold">{accountStats.reviewsCount}</p>
              </div>
              <FaCheckCircle className="text-3xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? 'المفضلة' : 'Favorites'}
                </h3>
                <p className="text-3xl font-bold">{accountStats.favoritesCount}</p>
              </div>
              <FaHeart className="text-3xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? 'تاريخ الانضمام' : 'Member Since'}
                </h3>
                <p className="text-lg font-bold">
                  {new Date(accountStats.joinDate).getFullYear()}
                </p>
              </div>
              <FaUserCircle className="text-3xl opacity-80" />
            </div>
          </div>
        </motion.div>

        {/* Alert Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center"
            >
              <FaCheckCircle className="mr-3 text-green-600" />
              <span>{success}</span>
                <button
                onClick={clearMessages}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <FaTimesCircle />
                </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center"
            >
              <FaExclamationTriangle className="mr-3 text-red-600" />
              <span>{error}</span>
                <button
                onClick={clearMessages}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <FaTimesCircle />
                </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={avatarPreview || profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=0D8ABC&color=fff`}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-white"
                    />
                <button
                      onClick={() => document.getElementById('avatar-upload').click()}
                      className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                      <FaCamera className="text-sm" />
                </button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{profileData.name || (isArabic ? 'مستخدم' : 'User')}</h3>
                  <p className="text-blue-100">{profileData.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                      >
                        <Icon className={`text-lg ${isArabic ? 'ml-3' : 'mr-3'}`} />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{tab.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                        </div>
                </button>
                    );
                  })}
              </div>
            </nav>
          </div>
          </motion.div>
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isArabic ? 'الملف الشخصي' : 'Profile Information'}
                    </h2>
                    <FaEdit className="text-gray-400 text-xl" />
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                        value={profileData.email}
                      disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {isArabic ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                    </p>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                    />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الموقع' : 'Location'}
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'أدخل موقعك' : 'Enter your location'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'تاريخ الميلاد' : 'Date of Birth'}
                      </label>
                      <input
                        type="date"
                        value={profileData.date_of_birth}
                        onChange={(e) => handleInputChange('profile', 'date_of_birth', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الجنس' : 'Gender'}
                    </label>
                    <select
                        value={profileData.gender}
                        onChange={(e) => handleInputChange('profile', 'gender', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="">{isArabic ? 'اختر الجنس' : 'Select Gender'}</option>
                        <option value="male">{isArabic ? 'ذكر' : 'Male'}</option>
                        <option value="female">{isArabic ? 'أنثى' : 'Female'}</option>
                        <option value="other">{isArabic ? 'آخر' : 'Other'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'اللغة' : 'Language'}
                      </label>
                      <select
                        value={profileData.language}
                        onChange={(e) => handleInputChange('profile', 'language', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'المنطقة الزمنية' : 'Timezone'}
                    </label>
                    <select
                        value={profileData.timezone}
                        onChange={(e) => handleInputChange('profile', 'timezone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'نبذة عنك' : 'Bio'}
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder={isArabic ? 'اكتب نبذة عن نفسك...' : 'Tell us about yourself...'}
                    />
                  </div>

                  <div className="mt-8 flex justify-end">
                  <button
                      onClick={saveProfile}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <FaSave className={`${isArabic ? 'ml-2' : 'mr-2'}`} />
                          {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                        </>
                      )}
                  </button>
                </div>
                </motion.div>
            )}
            
              {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isArabic ? 'إعدادات الإشعارات' : 'Notification Settings'}
                    </h2>
                    <FaBell className="text-gray-400 text-xl" />
                  </div>

                  <div className="space-y-6">
                    {[
                      { key: 'email_notifications', label: isArabic ? 'إشعارات البريد الإلكتروني' : 'Email Notifications', desc: isArabic ? 'تلقي الإشعارات عبر البريد الإلكتروني' : 'Receive notifications via email' },
                      { key: 'sms_notifications', label: isArabic ? 'إشعارات الرسائل النصية' : 'SMS Notifications', desc: isArabic ? 'تلقي الإشعارات عبر الرسائل النصية' : 'Receive notifications via SMS' },
                      { key: 'push_notifications', label: isArabic ? 'الإشعارات الفورية' : 'Push Notifications', desc: isArabic ? 'تلقي الإشعارات الفورية' : 'Receive push notifications' },
                      { key: 'appointment_reminders', label: isArabic ? 'تذكير المواعيد' : 'Appointment Reminders', desc: isArabic ? 'تذكير بالمواعيد القادمة' : 'Reminders for upcoming appointments' },
                      { key: 'payment_confirmations', label: isArabic ? 'تأكيد المدفوعات' : 'Payment Confirmations', desc: isArabic ? 'إشعارات تأكيد المدفوعات' : 'Payment confirmation notifications' },
                      { key: 'system_updates', label: isArabic ? 'تحديثات النظام' : 'System Updates', desc: isArabic ? 'إشعارات تحديثات النظام' : 'System update notifications' },
                      { key: 'marketing_emails', label: isArabic ? 'رسائل التسويق' : 'Marketing Emails', desc: isArabic ? 'تلقي رسائل التسويق والعروض' : 'Receive marketing emails and offers' },
                      { key: 'newsletter', label: isArabic ? 'النشرة الإخبارية' : 'Newsletter', desc: isArabic ? 'اشتراك في النشرة الإخبارية' : 'Subscribe to newsletter' }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{label}</h3>
                          <p className="text-sm text-gray-500">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[key]}
                            onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={saveNotificationSettings}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <FaSave className={`${isArabic ? 'ml-2' : 'mr-2'}`} />
                          {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
            {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Change Password */}
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                      </h2>
                      <FaKey className="text-gray-400 text-xl" />
                    </div>

                    <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
                      </label>
                        <div className="relative">
                      <input
                            type={showPasswordFields.current ? 'text' : 'password'}
                        value={passwordData.current_password}
                            onChange={(e) => handleInputChange('password', 'current_password', e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={isArabic ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordFields(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswordFields.current ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                      </label>
                        <div className="relative">
                      <input
                            type={showPasswordFields.new ? 'text' : 'password'}
                        value={passwordData.new_password}
                            onChange={(e) => handleInputChange('password', 'new_password', e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={isArabic ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordFields(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswordFields.new ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      <p className="text-xs text-gray-500 mt-1">
                          {isArabic ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters long'}
                      </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                      </label>
                        <div className="relative">
                      <input
                            type={showPasswordFields.confirm ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                            onChange={(e) => handleInputChange('password', 'confirm_password', e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={isArabic ? 'أعد كتابة كلمة المرور الجديدة' : 'Confirm new password'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordFields(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswordFields.confirm ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={changePassword}
                        disabled={isSaving || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            {isArabic ? 'جاري التغيير...' : 'Changing...'}
                          </>
                        ) : (
                          <>
                            <FaLock className={`${isArabic ? 'ml-2' : 'mr-2'}`} />
                            {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {isArabic ? 'إعدادات الأمان' : 'Security Settings'}
                      </h2>
                      <FaShieldAlt className="text-gray-400 text-xl" />
                </div>
                
                    <div className="space-y-6">
                      {[
                        { key: 'two_factor_auth', label: isArabic ? 'المصادقة الثنائية' : 'Two-Factor Authentication', desc: isArabic ? 'أضف طبقة حماية إضافية لحسابك' : 'Add an extra layer of security to your account' },
                        { key: 'login_notifications', label: isArabic ? 'إشعارات تسجيل الدخول' : 'Login Notifications', desc: isArabic ? 'تلقي إشعار عند تسجيل الدخول من جهاز جديد' : 'Get notified when someone logs in from a new device' },
                        { key: 'remember_devices', label: isArabic ? 'تذكر الأجهزة' : 'Remember Devices', desc: isArabic ? 'تذكر الأجهزة التي سجلت الدخول منها مسبقاً' : 'Remember devices you\'ve logged in from before' },
                        { key: 'email_on_password_change', label: isArabic ? 'إشعار تغيير كلمة المرور' : 'Password Change Notification', desc: isArabic ? 'إرسال إشعار عند تغيير كلمة المرور' : 'Send notification when password is changed' }
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{label}</h3>
                            <p className="text-sm text-gray-500">{desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={securitySettings[key]}
                              onChange={(e) => handleInputChange('security', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                  </div>
                      ))}
                </div>
                </div>
                </motion.div>
            )}
            
              {/* Payments Tab */}
            {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isArabic ? 'وسائل الدفع' : 'Payment Methods'}
                    </h2>
                    <FaCreditCard className="text-gray-400 text-xl" />
                  </div>
                
                <div className="space-y-4 mb-8">
                  {paymentMethods.map(method => (
                    <div 
                      key={method.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4">
                              <FaCreditCard className={`text-2xl ${
                                method.card.brand === 'visa' 
                                  ? 'text-blue-600' 
                                  : method.card.brand === 'mastercard' 
                                  ? 'text-red-500' 
                                  : 'text-gray-600'
                              }`} />
                        </div>
                        <div>
                              <h3 className="font-medium text-gray-900 capitalize">
                                {method.card.brand} •••• {method.card.last4}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {isArabic ? 'تنتهي في' : 'Expires'} {method.card.exp_month}/{method.card.exp_year}
                              </p>
                              <p className="text-sm text-gray-500">{method.billing_details.name}</p>
                        </div>
                      </div>
                          <div className="flex items-center space-x-3">
                            {method.is_default && (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {isArabic ? 'افتراضي' : 'Default'}
                          </span>
                            )}
                            {!method.is_default && (
                          <button
                            onClick={() => setDefaultPaymentMethod(method.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                                {isArabic ? 'جعل افتراضي' : 'Make Default'}
                          </button>
                        )}
                        <button
                          onClick={() => deletePaymentMethod(method.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                              <FaTrash />
                        </button>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                  <button
                    onClick={() => setShowAddPayment(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <FaCreditCard className="mr-3" />
                    {isArabic ? 'إضافة وسيلة دفع جديدة' : 'Add New Payment Method'}
                  </button>
                </motion.div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Privacy Settings */}
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {isArabic ? 'إعدادات الخصوصية' : 'Privacy Settings'}
                      </h2>
                      <FaLock className="text-gray-400 text-xl" />
                    </div>

                    <div className="space-y-6">
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'ظهور الملف الشخصي' : 'Profile Visibility'}
                        </label>
                        <select
                          value={privacySettings.profile_visibility}
                          onChange={(e) => handleInputChange('privacy', 'profile_visibility', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="public">{isArabic ? 'عام - يمكن لأي شخص رؤية ملفك الشخصي' : 'Public - Anyone can see your profile'}</option>
                          <option value="private">{isArabic ? 'خاص - فقط الأشخاص المعتمدون' : 'Private - Only approved people'}</option>
                          <option value="hidden">{isArabic ? 'مخفي - غير مرئي في البحث' : 'Hidden - Not visible in search'}</option>
                        </select>
                      </div>

                      {[
                        { key: 'show_phone', label: isArabic ? 'إظهار رقم الهاتف' : 'Show Phone Number', desc: isArabic ? 'السماح للآخرين برؤية رقم هاتفك' : 'Allow others to see your phone number' },
                        { key: 'show_email', label: isArabic ? 'إظهار البريد الإلكتروني' : 'Show Email Address', desc: isArabic ? 'السماح للآخرين برؤية بريدك الإلكتروني' : 'Allow others to see your email address' },
                        { key: 'data_collection', label: isArabic ? 'جمع البيانات' : 'Data Collection', desc: isArabic ? 'السماح بجمع البيانات لتحسين الخدمة' : 'Allow data collection to improve service' },
                        { key: 'analytics', label: isArabic ? 'التحليلات' : 'Analytics', desc: isArabic ? 'السماح بجمع بيانات الاستخدام' : 'Allow usage analytics collection' }
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{label}</h3>
                            <p className="text-sm text-gray-500">{desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacySettings[key]}
                              onChange={(e) => handleInputChange('privacy', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {isArabic ? 'إدارة البيانات' : 'Data Management'}
                      </h2>
                      <FaDownload className="text-gray-400 text-xl" />
                    </div>

                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {isArabic ? 'تحميل بياناتك' : 'Download Your Data'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {isArabic ? 'احصل على نسخة من جميع بياناتك الشخصية' : 'Get a copy of all your personal data'}
                        </p>
                  <button
                          onClick={downloadAccountData}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors"
                  >
                          <FaDownload className={`${isArabic ? 'ml-2' : 'mr-2'}`} />
                          {isArabic ? 'تحميل البيانات' : 'Download Data'}
                  </button>
                </div>
                
                      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                        <h3 className="text-lg font-medium text-red-900 mb-2">
                          {isArabic ? 'حذف الحساب' : 'Delete Account'}
                        </h3>
                        <p className="text-red-700 mb-4">
                          {isArabic ? 'حذف حسابك نهائياً. هذا الإجراء لا يمكن التراجع عنه.' : 'Permanently delete your account. This action cannot be undone.'}
                  </p>
                  <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors"
                  >
                          <FaTrash className={`${isArabic ? 'ml-2' : 'mr-2'}`} />
                          {isArabic ? 'حذف الحساب' : 'Delete Account'}
                  </button>
                </div>
              </div>
                  </div>
                </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
          </div>

        {/* Delete Account Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
              >
                <div className="text-center">
                  <FaExclamationTriangle className="text-red-600 text-4xl mb-4 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {isArabic ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isArabic ? 'هل أنت متأكد من أنك تريد حذف حسابك نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to permanently delete your account? This action cannot be undone.'}
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => {
                        deleteAccount();
                        setShowDeleteConfirm(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
        </div>
      </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsPage; 