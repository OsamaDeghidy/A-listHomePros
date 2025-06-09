import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaBars,
  FaTimes,
  FaSearch,
  FaAngleDown,
  FaUser,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaCalendarAlt,
  FaEnvelope
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useDarkMode } from '../../hooks/useDarkMode';
import NotificationCenter from '../notifications/NotificationCenter';
import LanguageSelector from '../common/LanguageSelector';
import DarkModeToggle from '../common/DarkModeToggle';
import Logo from '../../assets/Logo';
import EnhancedSidebar from './EnhancedSidebar';

const RoleBasedDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  
  const { currentUser, logout, isProfessional, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isArabic = language === 'ar';

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

  // Quick actions based on user role
  const getQuickActions = () => {
    const userRole = currentUser?.role || 'client';
    const baseUrl = userRole === 'client' ? '/dashboard' : `/${userRole}-dashboard`;
    
    return [
      {
        name: isArabic ? 'موعد جديد' : 'New Appointment',
        icon: FaCalendarAlt,
        action: () => navigate(`${baseUrl}/calendar`),
        color: 'text-green-600'
      },
      {
        name: isArabic ? 'رسالة جديدة' : 'New Message',
        icon: FaEnvelope,
        action: () => navigate(`${baseUrl}/messages`),
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
  };

  const quickActions = getQuickActions();

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
                          {currentUser?.role && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                              {currentUser.role === 'specialist' ? (isArabic ? 'متخصص A-List' : 'A-List Specialist') :
                               currentUser.role === 'contractor' ? (isArabic ? 'مقدم خدمة' : 'Home Pro') :
                               currentUser.role === 'crew' ? (isArabic ? 'عضو طاقم' : 'Crew Member') :
                               isArabic ? 'عميل' : 'Client'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={currentUser?.role === 'client' ? '/dashboard/profile' : `/${currentUser?.role || 'client'}-dashboard/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaUser className="mr-3 text-gray-400" />
                        {isArabic ? 'الملف الشخصي' : 'Profile'}
                      </Link>
                      <Link
                        to={currentUser?.role === 'client' ? '/dashboard/settings' : `/${currentUser?.role || 'client'}-dashboard/settings`}
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
        <EnhancedSidebar 
          sidebarOpen={sidebarOpen} 
          onLogout={handleLogout}
        />
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

export default RoleBasedDashboard; 