import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaUser, 
  FaEnvelope, 
  FaStar, 
  FaCog, 
  FaSignOutAlt, 
  FaChevronLeft, 
  FaChevronRight, 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaCreditCard, 
  FaHistory, 
  FaBriefcase, 
  FaClock, 
  FaChartLine, 
  FaBell, 
  FaQuestionCircle,
  FaBars,
  FaTimes,
  FaSearch,
  FaSun,
  FaMoon,
  FaGlobe,
  FaAngleDown,
  FaUserCircle,
  FaShieldAlt,
  FaKey,
  FaEye,
  FaPaint,
  FaLanguage,
  FaHandshake
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useDarkMode } from '../../hooks/useDarkMode';
import NotificationCenter from '../notifications/NotificationCenter';
import LanguageSelector from '../common/LanguageSelector';
import DarkModeToggle from '../common/DarkModeToggle';
import Logo from '../../assets/Logo';
import EnhancedSidebar from './EnhancedSidebar';

const DashboardLayout = ({ isPro = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  
  const { currentUser, logout, isProfessional, isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isArabic = language === 'ar';
  const isProMode = isPro || isProfessional;

  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setQuickActionsOpen(false);
  }, [location]);

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleQuickActions = () => {
    setQuickActionsOpen(!quickActionsOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Navigation items for clients
  const clientNavItems = [
    { 
      name: isArabic ? 'لوحة التحكم' : 'Dashboard', 
      path: '/dashboard', 
      icon: FaTachometerAlt,
      color: 'bg-blue-500',
      description: isArabic ? 'نظرة عامة على حسابك' : 'Overview of your account'
    },
    { 
      name: isArabic ? 'المواعيد' : 'Appointments', 
      path: '/dashboard/calendar', 
      icon: FaCalendarAlt,
      color: 'bg-green-500',
      description: isArabic ? 'إدارة مواعيدك' : 'Manage your appointments'
    },
    { 
      name: isArabic ? 'الرسائل' : 'Messages', 
      path: '/dashboard/messages', 
      icon: FaEnvelope,
      color: 'bg-purple-500',
      description: isArabic ? 'التواصل مع المحترفين' : 'Chat with professionals'
    },
    { 
      name: isArabic ? 'طلبات الخدمة' : 'Service Requests', 
      path: '/dashboard/service-requests', 
      icon: FaHandshake,
      color: 'bg-green-600',
      description: isArabic ? 'متابعة طلبات الخدمة' : 'Track service requests'
    },
    { 
      name: isArabic ? 'التقييمات' : 'Reviews', 
      path: '/dashboard/reviews', 
      icon: FaStar,
      color: 'bg-yellow-500',
      description: isArabic ? 'تقييماتك وآرائك' : 'Your reviews and ratings'
    },
    { 
      name: isArabic ? 'سجل المدفوعات' : 'Payment History', 
      path: '/dashboard/payment-history', 
      icon: FaCreditCard,
      color: 'bg-indigo-500',
      description: isArabic ? 'تاريخ عمليات الدفع' : 'Payment transactions'
    },
    { 
      name: isArabic ? 'سجل النشاطات' : 'Activity Log', 
      path: '/dashboard/activity', 
      icon: FaHistory,
      color: 'bg-gray-500',
      description: isArabic ? 'تاريخ أنشطة الحساب' : 'Account activity history'
    },
    { 
      name: isArabic ? 'الإشعارات' : 'Notifications', 
      path: '/dashboard/notifications', 
      icon: FaBell,
      color: 'bg-red-500',
      description: isArabic ? 'إشعاراتك الجديدة' : 'Your notifications'
    },
    { 
      name: isArabic ? 'الملف الشخصي' : 'Profile', 
      path: '/dashboard/profile', 
      icon: FaUser,
      color: 'bg-pink-500',
      description: isArabic ? 'معلوماتك الشخصية' : 'Your personal information'
    },
    { 
      name: isArabic ? 'الإعدادات' : 'Settings', 
      path: '/dashboard/settings', 
      icon: FaCog,
      color: 'bg-orange-500',
      description: isArabic ? 'إعدادات الحساب' : 'Account settings'
    },
  ];

  // Navigation items for professionals
  const proNavItems = [
    { 
      name: isArabic ? 'لوحة المحترف' : 'Pro Dashboard', 
      path: '/pro-dashboard', 
      icon: FaChartLine,
      color: 'bg-blue-500',
      description: isArabic ? 'إحصائيات أعمالك' : 'Business analytics'
    },
    { 
      name: isArabic ? 'المواعيد' : 'Appointments', 
      path: '/pro-dashboard/calendar', 
      icon: FaCalendarAlt,
      color: 'bg-green-500',
      description: isArabic ? 'جدولة المواعيد' : 'Schedule appointments'
    },
    { 
      name: isArabic ? 'العملاء' : 'Clients', 
      path: '/pro-dashboard/clients', 
      icon: FaUsers,
      color: 'bg-purple-500',
      description: isArabic ? 'إدارة العملاء' : 'Manage clients'
    },
    { 
      name: isArabic ? 'الرسائل' : 'Messages', 
      path: '/pro-dashboard/messages', 
      icon: FaEnvelope,
      color: 'bg-indigo-500',
      description: isArabic ? 'التواصل مع العملاء' : 'Chat with clients'
    },
    { 
      name: isArabic ? 'طلبات الخدمة' : 'Service Requests', 
      path: '/pro-dashboard/service-requests', 
      icon: FaHandshake,
      color: 'bg-green-600',
      description: isArabic ? 'إدارة طلبات الخدمة الواردة' : 'Manage incoming service requests'
    },
    { 
      name: isArabic ? 'خدماتي' : 'My Services', 
      path: '/pro-dashboard/services', 
      icon: FaBriefcase,
      color: 'bg-teal-500',
      description: isArabic ? 'إدارة الخدمات' : 'Manage services'
    },
    { 
      name: isArabic ? 'الأوقات المتاحة' : 'Availability', 
      path: '/pro-dashboard/availability', 
      icon: FaClock,
      color: 'bg-cyan-500',
      description: isArabic ? 'إعدادات الأوقات' : 'Time availability'
    },
    { 
      name: isArabic ? 'التقييمات' : 'Reviews', 
      path: '/pro-dashboard/reviews', 
      icon: FaStar,
      color: 'bg-yellow-500',
      description: isArabic ? 'تقييمات العملاء' : 'Client reviews'
    },
    { 
      name: isArabic ? 'المدفوعات' : 'Payments', 
      path: '/pro-dashboard/payment-history', 
      icon: FaCreditCard,
      color: 'bg-emerald-500',
      description: isArabic ? 'الأرباح والمدفوعات' : 'Earnings and payments'
    },
    { 
      name: isArabic ? 'الإشعارات' : 'Notifications', 
      path: '/pro-dashboard/notifications', 
      icon: FaBell,
      color: 'bg-red-500',
      description: isArabic ? 'إشعارات الأعمال' : 'Business notifications'
    },
    { 
      name: isArabic ? 'الملف المهني' : 'Profile', 
      path: '/pro-dashboard/profile', 
      icon: FaUser,
      color: 'bg-pink-500',
      description: isArabic ? 'ملفك المهني' : 'Professional profile'
    },
    { 
      name: isArabic ? 'الإعدادات' : 'Settings', 
      path: '/pro-dashboard/settings', 
      icon: FaCog,
      color: 'bg-orange-500',
      description: isArabic ? 'إعدادات الأعمال' : 'Business settings'
    },
  ];

  // Quick actions for header
  const quickActions = [
    {
      name: isArabic ? 'موعد جديد' : 'New Appointment',
      icon: FaCalendarAlt,
      action: () => navigate(isProMode ? '/pro-dashboard/calendar' : '/dashboard/calendar'),
      color: 'text-green-600'
    },
    {
      name: isArabic ? 'رسالة جديدة' : 'New Message',
      icon: FaEnvelope,
      action: () => navigate(isProMode ? '/pro-dashboard/messages' : '/dashboard/messages'),
      color: 'text-blue-600'
    },
    {
      name: isArabic ? 'البحث' : 'Search',
      icon: FaSearch,
      action: () => navigate('/search'),
      color: 'text-purple-600'
    },
    {
      name: isArabic ? 'المساعدة' : 'Help',
      icon: FaQuestionCircle,
      action: () => navigate('/help'),
      color: 'text-orange-600'
    }
  ];

  const navItems = isProMode ? proNavItems : clientNavItems;

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Enhanced Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          headerScrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700' 
            : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'البحث في لوحة التحكم...' : 'Search dashboard...'}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Dark Mode Toggle */}
            <div className="hidden sm:block">
              <DarkModeToggle />
            </div>

            {/* Quick Actions */}
            <div className="relative hidden md:block">
              <button
                onClick={toggleQuickActions}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FaBars />
              </button>

              <AnimatePresence>
                {quickActionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.action();
                          setQuickActionsOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <action.icon className={`mr-3 ${action.color}`} />
                        {action.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                />
              ) : (
                    <span className="text-white text-sm font-medium">
                      {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
              )}
            </div>
                <FaAngleDown className="hidden sm:block text-gray-400 text-sm" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {currentUser?.name || (isArabic ? 'مستخدم' : 'User')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {currentUser?.email || 'user@example.com'}
                          </p>
                {isProMode && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                              {isArabic ? 'محترف' : 'Professional'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={isProMode ? '/pro-dashboard/profile' : '/dashboard/profile'}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaUser className="mr-3 text-gray-400" />
                        {isArabic ? 'الملف الشخصي' : 'Profile'}
                      </Link>
                      <Link
                        to={isProMode ? '/pro-dashboard/settings' : '/dashboard/settings'}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaCog className="mr-3 text-gray-400" />
                        {isArabic ? 'الإعدادات' : 'Settings'}
                      </Link>
                      <Link
                        to="/help"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaQuestionCircle className="mr-3 text-gray-400" />
                        {isArabic ? 'المساعدة' : 'Help & Support'}
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaSignOutAlt className="mr-3" />
                        {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'البحث...' : 'Search...'}
                className="w-full h-10 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </form>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Sidebar */}
      <motion.aside 
        initial={{ x: isArabic ? 100 : -100 }}
        animate={{ 
          x: 0,
          width: sidebarOpen ? (window.innerWidth < 1024 ? '100%' : '280px') : '80px'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-16 ${isArabic ? 'right-0' : 'left-0'} bottom-0 z-40 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : (window.innerWidth < 1024 ? (isArabic ? 'translate-x-full' : '-translate-x-full') : 'translate-x-0')
        } lg:translate-x-0 overflow-y-auto`}
        style={{ width: sidebarOpen ? (window.innerWidth < 1024 ? '100%' : '280px') : '80px' }}
      >
        {/* Sidebar Header */}
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {isArabic ? 'مرحباً' : 'Welcome'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {currentUser?.name || (isArabic ? 'مستخدم' : 'User')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`group flex items-center ${
                      sidebarOpen ? 'px-4' : 'justify-center px-2'
                    } py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-md ${
                      active ? 'text-white' : `${item.color} bg-opacity-10`
                    }`}>
                      <Icon className="text-lg" />
                    </div>
                    
                    {sidebarOpen && (
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs mt-0.5 ${
                          active ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    )}
                    
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
              
              {/* Help Section */}
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <h4 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {isArabic ? 'المساعدة والدعم' : 'Help & Support'}
              </h4>
                <Link
                  to="/help"
                className="group flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                <FaQuestionCircle className="text-lg text-orange-500" />
                <span className="ml-3">{isArabic ? 'مركز المساعدة' : 'Help Center'}</span>
                </Link>
            </motion.div>
          )}
          </nav>
          
        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${!sidebarOpen && 'flex justify-center'}`}>
            <button
              onClick={handleLogout}
            className={`group flex items-center ${
              sidebarOpen ? 'w-full px-4' : 'justify-center px-2'
            } py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
          >
            <FaSignOutAlt className="text-lg" />
            {sidebarOpen && <span className="ml-3">{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>}
            </button>
          </div>
      </motion.aside>
        
        {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${
        sidebarOpen && window.innerWidth >= 1024 
          ? (isArabic ? 'pr-[280px]' : 'pl-[280px]') 
          : (isArabic ? 'pr-20' : 'pl-20')
      } lg:${isArabic ? 'pr-0' : 'pl-0'}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 