import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaUserCircle, 
  FaBars, 
  FaTimes, 
  FaAngleDown, 
  FaCog, 
  FaQuestionCircle, 
  FaSignOutAlt,
  FaHome,
  FaSearch,
  FaTools,
  FaDollarSign,
  FaInfoCircle,
  FaBlog,
  FaTachometerAlt,
  FaPlus
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../assets/Logo';
import DarkModeToggle from '../common/DarkModeToggle';
import LanguageSelector from '../common/LanguageSelector';
import NotificationCenter from '../notifications/NotificationCenter';
import CreateServiceModal from '../services/CreateServiceModal';
import { useLanguage } from '../../hooks/useLanguage';

const Header = () => {
  const { currentUser, isAuthenticated, logout, isProfessional, isClient, isAdmin } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Single state object for all menus
  const [menuState, setMenuState] = useState({
    mobile: false,
    user: false,
    notifications: false
  });

  // Scroll state for header styling
  const [headerScrolled, setHeaderScrolled] = useState(false);

  // Create Service Modal state
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);

  // Refs for click outside handling
  const headerRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Navigation items configuration
  const navItems = [
    {
      label: language === 'ar' ? 'الرئيسية' : 'Home',
      path: '/',
      icon: FaHome
    },
    {
      label: language === 'ar' ? 'البحث عن محترفين' : 'Find Pros',
      path: '/search',
      icon: FaSearch
    },
    {
      label: language === 'ar' ? 'الخدمات' : 'Services',
      path: '/services',
      icon: FaTools
    },
    {
      label: language === 'ar' ? 'الأسعار' : 'Pricing',
      path: '/pricing',
      icon: FaDollarSign
    },
    {
      label: language === 'ar' ? 'كيف يعمل' : 'How it Works',
      path: '/how-it-works',
      icon: FaInfoCircle
    },
    {
      label: language === 'ar' ? 'المدونة' : 'Blog',
      path: '/blog',
      icon: FaBlog
    }
  ];

  // Add Pro Dashboard for professionals
  if (isProfessional) {
    navItems.push({
      label: language === 'ar' ? 'لوحة المحترف' : 'Pro Dashboard',
      path: '/pro-dashboard',
      icon: FaTachometerAlt
    });
  }

  // User menu items
  const userMenuItems = [
    {
      label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard',
      path: isProfessional ? '/pro-dashboard' : '/dashboard',
      icon: FaTachometerAlt
    },
    {
      label: language === 'ar' ? 'الإعدادات' : 'Settings',
      path: isProfessional ? '/pro-dashboard/settings' : '/dashboard/settings',
      icon: FaCog
    },
    {
      label: language === 'ar' ? 'المساعدة' : 'Help & Support',
      path: '/help',
      icon: FaQuestionCircle
    }
  ];

  // Toggle menu function
  const toggleMenu = (menuType) => {
    setMenuState(prev => ({
      mobile: menuType === 'mobile' ? !prev.mobile : false,
      user: menuType === 'user' ? !prev.user : false,
      notifications: menuType === 'notifications' ? !prev.notifications : false
    }));
  };

  // Close all menus
  const closeAllMenus = () => {
    setMenuState({
      mobile: false,
      user: false,
      notifications: false
    });
  };

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is inside header, handle specific menu logic
      if (headerRef.current?.contains(event.target)) {
        // Check if click is outside user menu
        if (menuState.user && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
          toggleMenu('user');
        }
        
        // Check if click is outside mobile menu (but not on mobile button)
        if (menuState.mobile && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
          const mobileButton = event.target.closest('[data-mobile-toggle]');
          if (!mobileButton) {
            toggleMenu('mobile');
          }
        }
        
        // Check if click is outside notifications
        if (menuState.notifications && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
          toggleMenu('notifications');
        }
    } else {
        // Click outside header - close all menus
        closeAllMenus();
    }
  };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuState]);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  // Handle logout
  const handleLogout = () => {
    logout();
    closeAllMenus();
    navigate('/');
  };

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    closeAllMenus();
  };

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        headerScrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md' 
          : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center" onClick={closeAllMenus}>
              <Logo className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 rtl:space-x-reverse">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={closeAllMenus}
                >
                  {item.label}
            </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Selector */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>

            {/* Dark Mode Toggle */}
            <div className="hidden md:block">
              <DarkModeToggle />
            </div>

            {/* Create Service Button */}
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateServiceModal(true)}
                className="hidden md:flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaPlus className="text-sm" />
                <span>{language === 'ar' ? 'إنشاء خدمة' : 'Create Service'}</span>
              </button>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <div ref={notificationsRef}>
                <NotificationCenter />
              </div>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center space-x-1 rtl:space-x-reverse focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleMenu('user')}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <FaAngleDown 
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                      menuState.user ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* User Dropdown Menu */}
                {menuState.user && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                          <span className="font-medium">
                            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {currentUser?.name || (language === 'ar' ? 'مستخدم' : 'User')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {currentUser?.email || 'user@example.com'}
                          </p>
                          {isProfessional && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                              {language === 'ar' ? 'محترف' : 'Professional'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <Icon className="mr-3 rtl:mr-0 rtl:ml-3 text-gray-400" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <button
                      onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                        <FaSignOutAlt className="mr-3 rtl:mr-0 rtl:ml-3" />
                      {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                    </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons for Non-authenticated Users */
              <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={closeAllMenus}
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  onClick={closeAllMenus}
                >
                  {language === 'ar' ? 'انضم الآن' : 'Join Now'}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => toggleMenu('mobile')}
              data-mobile-toggle
            >
              {menuState.mobile ? (
                <FaTimes className="h-5 w-5" />
              ) : (
                <FaBars className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuState.mobile && (
        <div 
          className="md:hidden bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700" 
          ref={mobileMenuRef}
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* Navigation Links */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors text-left ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="mr-3 rtl:mr-0 rtl:ml-3 w-5 h-5" />
                  {item.label}
                </button>
              );
            })}

            {/* Auth Section for Non-authenticated Users */}
            {!isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FaUserCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                  <div className="ml-3 rtl:mr-3 rtl:ml-0">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleNavigation('/login')}
                        className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                      >
                        {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                      </button>
                      <span className="text-gray-500">{language === 'ar' ? 'أو' : 'or'}</span>
                      <button
                        onClick={() => handleNavigation('/register')}
                        className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                      >
                        {language === 'ar' ? 'انضم الآن' : 'Join Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Menu for Authenticated Users */}
            {isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                {/* User Info */}
                <div className="flex items-center px-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                      <span className="font-medium">
                        {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 rtl:mr-3 rtl:ml-0">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {currentUser?.name || (language === 'ar' ? 'مستخدم' : 'User')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {currentUser?.email || 'user@example.com'}
                    </div>
                    {isProfessional && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                        {language === 'ar' ? 'محترف' : 'Professional'}
                      </span>
                    )}
                  </div>
                </div>

                {/* User Menu Items */}
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left"
                    >
                      <Icon className="mr-3 rtl:mr-0 rtl:ml-3 w-5 h-5 text-gray-400" />
                      {item.label}
                    </button>
                  );
                })}

                {/* Create Service Button - Mobile */}
                <button
                  onClick={() => {
                    setShowCreateServiceModal(true);
                    closeAllMenus();
                  }}
                  className="w-full flex items-center px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-md transition-all text-left mt-2"
                >
                  <FaPlus className="mr-3 rtl:mr-0 rtl:ml-3 w-5 h-5" />
                  {language === 'ar' ? 'إنشاء خدمة' : 'Create Service'}
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left mt-2"
                >
                  <FaSignOutAlt className="mr-3 rtl:mr-0 rtl:ml-3 w-5 h-5" />
                  {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </button>
              </div>
            )}

            {/* Settings Section */}
            <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <LanguageSelector />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateServiceModal && (
        <CreateServiceModal 
          isOpen={showCreateServiceModal} 
          onClose={() => setShowCreateServiceModal(false)} 
        />
      )}
    </header>
  );
};

export default Header; 