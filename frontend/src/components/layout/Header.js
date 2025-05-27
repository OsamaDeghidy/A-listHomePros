import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBell, FaCalendarAlt, FaStar, FaCreditCard, FaComment, FaTools, FaUserCircle, FaBars, FaTimes, FaSearch, FaAngleDown } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../assets/Logo';
import DarkModeToggle from '../common/DarkModeToggle';
import LanguageSelector from '../common/LanguageSelector';
import NotificationCenter from '../notifications/NotificationCenter';
import { useLanguage } from '../../hooks/useLanguage';

const Header = () => {
  const { currentUser, isAuthenticated, logout, isProfessional, isClient, isAdmin } = useAuth();
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const handleScroll = () => {
    if (window.scrollY > 10) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
      scrolled ? 'bg-white dark:bg-gray-900 shadow-md' : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/search" className="text-gray-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium">
              {language === 'ar' ? 'البحث عن محترفين' : 'Find Pros'}
            </Link>
            <Link to="/services" className="text-gray-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium">
              {language === 'ar' ? 'الخدمات' : 'Services'}
            </Link>
            <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium">
              {language === 'ar' ? 'الأسعار' : 'Pricing'}
            </Link>
            <Link to="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium">
              {language === 'ar' ? 'كيف يعمل' : 'How it Works'}
            </Link>
            <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium">
              {language === 'ar' ? 'المدونة' : 'Blog'}
            </Link>
            {isProfessional && (
              <Link to="/pro-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-300 px-3 py-2 text-sm font-medium">
                {language === 'ar' ? 'لوحة المحترف' : 'Pro Dashboard'}
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Selector */}
            <div className="hidden md:block">
              <LanguageSelector iconOnly={true} />
            </div>

            {/* Dark Mode Toggle */}
            <div className="hidden md:block">
              <DarkModeToggle />
            </div>

            {/* Notifications */}
            {isAuthenticated && (
              <NotificationCenter locale={language} />
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-1 rtl:space-x-reverse focus:outline-none"
                  onClick={toggleUserMenu}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                    {currentUser?.name?.[0] || <FaUserCircle />}
                  </div>
                  <FaAngleDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-cyan-400 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-cyan-400 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {language === 'ar' ? 'الإعدادات' : 'Settings'}
                    </Link>
                    <button
                      className="w-full text-left rtl:text-right px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleLogout}
                    >
                      {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-300"
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-cyan-400 rounded-md hover:bg-cyan-500"
                >
                  {language === 'ar' ? 'انضم الآن' : 'Join Now'}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden -mr-1 rtl:mr-0 rtl:-ml-1 flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1 border-t border-cyan-400 dark:border-gray-800">
            <Link
              to="/search"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {language === 'ar' ? 'البحث عن محترفين' : 'Find Pros'}
            </Link>
            <Link
              to="/services"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {language === 'ar' ? 'الخدمات' : 'Services'}
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {language === 'ar' ? 'الأسعار' : 'Pricing'}
            </Link>
            <Link
              to="/how-it-works"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {language === 'ar' ? 'كيف يعمل' : 'How it Works'}
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {language === 'ar' ? 'المدونة' : 'Blog'}
            </Link>
            {isProfessional && (
              <Link
                to="/pro-dashboard"
                className="block px-3 py-2 text-base font-medium text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {language === 'ar' ? 'لوحة المحترف' : 'Pro Dashboard'}
              </Link>
            )}

            {!isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-cyan-400 dark:border-gray-800">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FaUserCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                  <div className="rtl:mr-3 ltr:ml-3">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Link
                        to="/login"
                        className="text-base font-medium text-gray-700 dark:text-gray-300"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                      </Link>
                      <span className="text-gray-500">{language === 'ar' ? 'أو' : 'or'}</span>
                      <Link
                        to="/register"
                        className="text-base font-medium text-cyan-600 dark:text-cyan-400"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {language === 'ar' ? 'انضم الآن' : 'Join Now'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-cyan-400 dark:border-gray-800">
              <LanguageSelector />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 