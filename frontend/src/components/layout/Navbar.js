import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, 
  FaTimes, 
  FaSearch, 
  FaBell, 
  FaUser, 
  FaMoon, 
  FaSun, 
  FaLanguage,
  FaSignInAlt,
  FaUserPlus,
  FaChevronDown,
  FaTachometerAlt,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaEnvelope,
  FaCalendarAlt
} from 'react-icons/fa';
import Logo from '../../assets/Logo';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useLayout } from './LayoutProvider';
import Navigation from './Navigation';

const Navbar = ({ 
  variant = 'default',
  className = '',
  showSearch = true,
  showAuth = true,
  fixed = false 
}) => {
  // States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for dropdowns
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Hooks
  const { 
    currentUser, 
    isAuthenticated, 
    isProfessional, 
    logout, 
    loading 
  } = useAuth();
  
  const { language, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { notifications } = useLayout();
  const navigate = useNavigate();
  
  const isArabic = language === 'ar';

  // Mock notifications for testing
  const mockNotifications = [
    {
      id: 1,
      title: isArabic ? 'حجز جديد' : 'New Booking',
      message: isArabic ? 'لديك حجز جديد من أحمد محمد' : 'You have a new booking from Ahmed Mohamed',
      time: isArabic ? 'منذ دقيقتين' : '2 minutes ago',
      type: 'booking',
      unread: true
    },
    {
      id: 2,
      title: isArabic ? 'مراجعة جديدة' : 'New Review',
      message: isArabic ? 'تم إضافة مراجعة جديدة لخدماتك' : 'A new review has been added to your services',
      time: isArabic ? 'منذ ساعة' : '1 hour ago',
      type: 'review',
      unread: true
    },
    {
      id: 3,
      title: isArabic ? 'رسالة جديدة' : 'New Message',
      message: isArabic ? 'رسالة جديدة من عميل' : 'New message from client',
      time: isArabic ? 'منذ 3 ساعات' : '3 hours ago',
      type: 'message',
      unread: false
    }
  ];

  const unreadNotifications = mockNotifications.filter(n => n.unread).length;

  // Handle scroll effect
  useEffect(() => {
    if (!fixed) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fixed]);

  // Simple and effective click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      
      // Close notifications
      if (isNotificationsOpen && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      
      // Close mobile menu
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const mobileButton = event.target.closest('[data-mobile-toggle]');
        if (!mobileButton) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isNotificationsOpen, isMobileMenuOpen]);

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    // Close other menus
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    // Close other menus
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close other menus
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: -10
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.15 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.1 }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0,
      height: 0
    },
    visible: { 
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.15 }
    }
  };

  // Navbar classes
  const getNavbarClasses = () => {
    let baseClasses = `w-full z-50 transition-all duration-300 ${className}`;
    
    if (fixed) {
      baseClasses += ' fixed top-0';
    }
    
    switch (variant) {
      case 'transparent':
        return `${baseClasses} ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`;
      case 'minimal':
        return `${baseClasses} bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`;
      default:
        return `${baseClasses} bg-white dark:bg-gray-900 shadow-sm ${isScrolled ? 'shadow-lg' : ''}`;
    }
  };

  const userMenuItems = [
    {
      label: isArabic ? 'لوحة التحكم' : 'Dashboard',
      path: isProfessional ? '/pro-dashboard' : '/dashboard',
      icon: FaTachometerAlt
    },
    {
      label: isArabic ? 'الملف الشخصي' : 'Profile',
      path: '/dashboard/profile',
      icon: FaUserCircle
    },
    {
      label: isArabic ? 'الرسائل' : 'Messages',
      path: '/dashboard/messages',
      icon: FaEnvelope
    },
    {
      label: isArabic ? 'المواعيد' : 'Appointments',
      path: '/dashboard/calendar',
      icon: FaCalendarAlt
    },
    {
      label: isArabic ? 'الإعدادات' : 'Settings',
      path: '/dashboard/settings',
      icon: FaCog
    }
  ];

  return (
    <nav
      className={getNavbarClasses()}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Logo className="h-10 w-auto" />
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                {isArabic ? 'قائمة المحترفين' : 'A-List Pros'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <Navigation variant="horizontal" className="flex items-center" />
          </div>

          {/* Search Bar - Desktop */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث عن الخدمات...' : 'Search for services...'}
                  className={`w-full px-4 py-2 ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <FaSearch className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
              </form>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            
            {/* Search Button - Mobile */}
            {showSearch && (
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaSearch />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDarkMode ? (isArabic ? 'الوضع النهاري' : 'Light Mode') : (isArabic ? 'الوضع الليلي' : 'Dark Mode')}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isArabic ? 'English' : 'العربية'}
            >
              <FaLanguage />
              <span className="ml-1 rtl:ml-0 rtl:mr-1 text-xs font-medium">
                {isArabic ? 'EN' : 'العر'}
              </span>
            </button>

            {/* Authentication Actions */}
            {showAuth && (
              <>
                {isAuthenticated ? (
                  <>
                    {/* Notifications */}
                    <div className="relative" ref={notificationsRef}>
                      <button
                        onClick={toggleNotifications}
                        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={isArabic ? 'الإشعارات' : 'Notifications'}
                      >
                        <FaBell />
                        {unreadNotifications > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadNotifications}
                          </span>
                        )}
                      </button>

                      {/* Notifications Dropdown */}
                      <AnimatePresence>
                        {isNotificationsOpen && (
                          <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={`absolute ${isArabic ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden`}
                          >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {isArabic ? 'الإشعارات' : 'Notifications'}
                                </h3>
                                {unreadNotifications > 0 && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                    {unreadNotifications} {isArabic ? 'جديد' : 'new'}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="max-h-64 overflow-y-auto">
                              {mockNotifications.length > 0 ? (
                                mockNotifications.map((notification) => (
                                  <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                      notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                    onClick={() => {
                                      setIsNotificationsOpen(false);
                                    }}
                                  >
                                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                          {notification.title}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                                          {notification.message}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                          {notification.time}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-6 text-center">
                                  <FaBell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {isArabic ? 'لا توجد إشعارات' : 'No notifications'}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {mockNotifications.length > 0 && (
                              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                  to="/dashboard/notifications"
                                  className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                  onClick={() => setIsNotificationsOpen(false)}
                                >
                                  {isArabic ? 'عرض جميع الإشعارات' : 'View all notifications'}
                                </Link>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={toggleUserMenu}
                        className="flex items-center space-x-2 rtl:space-x-reverse p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {currentUser?.avatar ? (
                          <img 
                            src={currentUser.avatar} 
                            alt="User" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <FaUser className="w-5 h-5" />
                        )}
                        <span className="hidden sm:block font-medium">
                          {currentUser?.first_name || currentUser?.email?.split('@')[0]}
                        </span>
                        <FaChevronDown className={`text-xs transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* User Dropdown */}
                      <AnimatePresence>
                        {isUserMenuOpen && (
                          <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={`absolute ${isArabic ? 'left-0' : 'right-0'} mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`}
                          >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {currentUser?.first_name} {currentUser?.last_name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {currentUser?.email}
                              </p>
                              {isProfessional && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                  {isArabic ? 'محترف' : 'Professional'}
                                </span>
                              )}
                            </div>
                            
                            <div className="py-2">
                              {userMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => setIsUserMenuOpen(false)}
                                  >
                                    <Icon className="w-4 h-4 mr-3 rtl:mr-0 rtl:ml-3" />
                                    {item.label}
                                  </Link>
                                );
                              })}
                              
                              <hr className="my-2 border-gray-200 dark:border-gray-700" />
                              
                              <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <FaSignOutAlt className="w-4 h-4 mr-3 rtl:mr-0 rtl:ml-3" />
                                {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Link
                      to="/login"
                      className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <FaSignInAlt className="inline mr-1 rtl:mr-0 rtl:ml-1" />
                      {isArabic ? 'دخول' : 'Login'}
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <FaUserPlus className="inline mr-1 rtl:mr-0 rtl:ml-1" />
                      {isArabic ? 'انضمام' : 'Sign Up'}
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              data-mobile-toggle
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
            >
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث عن الخدمات...' : 'Search for services...'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="py-4">
                <Navigation variant="minimal" />
                
                {/* Mobile Auth Actions */}
                {!isAuthenticated && showAuth && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-2">
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FaSignInAlt className="mr-3 rtl:mr-0 rtl:ml-3" />
                        {isArabic ? 'تسجيل الدخول' : 'Login'}
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center px-4 py-3 mx-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FaUserPlus className="mr-3 rtl:mr-0 rtl:ml-3" />
                        {isArabic ? 'إنشاء حساب' : 'Sign Up'}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Mobile User Menu */}
                {isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentUser?.first_name} {currentUser?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentUser?.email}
                      </p>
                    </div>
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-4 h-4 mr-3 rtl:mr-0 rtl:ml-3" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3 rtl:mr-0 rtl:ml-3" />
                      {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar; 