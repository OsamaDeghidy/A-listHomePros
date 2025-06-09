import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useDarkMode } from '../../hooks/useDarkMode';

// Layout Context
const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// Safe useLocation hook that doesn't throw error if outside Router
const useSafeLocation = () => {
  try {
    return useLocation();
  } catch (error) {
    // Return a default location object if not inside Router
    return {
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    };
  }
};

// Layout Provider Component
const LayoutProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [layoutMode, setLayoutMode] = useState('dashboard'); // 'dashboard' | 'main' | 'auth'
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [pageTitle, setPageTitle] = useState('');
  const [pageActions, setPageActions] = useState([]);
  const [layoutLoading, setLayoutLoading] = useState(false);

  const { currentUser, isAuthenticated, isProfessional } = useAuth();
  const { language } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const location = useSafeLocation();

  const isArabic = language === 'ar';
  const isRTL = isArabic;

  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on location change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setQuickActionsOpen(false);
    setNotificationsOpen(false);
  }, [location]);

  // Auto-detect layout mode based on route
  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/dashboard') || path.startsWith('/pro-dashboard')) {
      setLayoutMode('dashboard');
    } else if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password')) {
      setLayoutMode('auth');
    } else {
      setLayoutMode('main');
    }
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

  // Generate breadcrumbs based on current path
  useEffect(() => {
    const generateBreadcrumbs = () => {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const crumbs = [];

      // Home/Dashboard
      if (pathSegments.length === 0) {
        crumbs.push({ name: isArabic ? 'الرئيسية' : 'Home', path: '/' });
      } else if (pathSegments[0] === 'dashboard' || pathSegments[0] === 'pro-dashboard') {
        const isPro = pathSegments[0] === 'pro-dashboard';
        crumbs.push({ 
          name: isPro ? (isArabic ? 'لوحة المحترف' : 'Pro Dashboard') : (isArabic ? 'لوحة التحكم' : 'Dashboard'), 
          path: `/${pathSegments[0]}` 
        });

        // Add sub-pages
        if (pathSegments.length > 1) {
          const subPage = pathSegments[1];
          const pageNames = {
            'calendar': isArabic ? 'المواعيد' : 'Appointments',
            'messages': isArabic ? 'الرسائل' : 'Messages',
            'clients': isArabic ? 'العملاء' : 'Clients',
            'services': isArabic ? 'الخدمات' : 'Services',
            'reviews': isArabic ? 'التقييمات' : 'Reviews',
            'payment-history': isArabic ? 'سجل المدفوعات' : 'Payment History',
            'activity': isArabic ? 'سجل النشاطات' : 'Activity Log',
            'notifications': isArabic ? 'الإشعارات' : 'Notifications',
            'profile': isArabic ? 'الملف الشخصي' : 'Profile',
            'settings': isArabic ? 'الإعدادات' : 'Settings',
            'availability': isArabic ? 'الأوقات المتاحة' : 'Availability'
          };

          crumbs.push({
            name: pageNames[subPage] || subPage,
            path: `/${pathSegments[0]}/${subPage}`
          });
        }
      } else {
        // Other pages
        crumbs.push({ name: isArabic ? 'الرئيسية' : 'Home', path: '/' });
        
        if (pathSegments.length > 0) {
          const pageNames = {
            'search': isArabic ? 'البحث' : 'Search',
            'services': isArabic ? 'الخدمات' : 'Services',
            'pricing': isArabic ? 'الأسعار' : 'Pricing',
            'about': isArabic ? 'من نحن' : 'About',
            'contact': isArabic ? 'اتصل بنا' : 'Contact',
            'help': isArabic ? 'المساعدة' : 'Help',
            'blog': isArabic ? 'المدونة' : 'Blog'
          };

          crumbs.push({
            name: pageNames[pathSegments[0]] || pathSegments[0],
            path: `/${pathSegments[0]}`
          });
        }
      }

      setBreadcrumbs(crumbs);
    };

    generateBreadcrumbs();
  }, [location, isArabic]);

  // Functions
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const toggleQuickActions = () => setQuickActionsOpen(!quickActionsOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);
  const closeQuickActions = () => setQuickActionsOpen(false);
  const closeNotifications = () => setNotificationsOpen(false);
  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setQuickActionsOpen(false);
    setNotificationsOpen(false);
  };

  const updatePageInfo = (title, actions = []) => {
    setPageTitle(title);
    setPageActions(actions);
  };

  const addBreadcrumb = (name, path) => {
    setBreadcrumbs(prev => [...prev, { name, path }]);
  };

  const setCustomBreadcrumbs = (crumbs) => {
    setBreadcrumbs(crumbs);
  };

  const showLayoutLoading = () => setLayoutLoading(true);
  const hideLayoutLoading = () => setLayoutLoading(false);

  // Layout state object
  const layoutState = {
    // State
    sidebarOpen,
    mobileMenuOpen,
    userMenuOpen,
    quickActionsOpen,
    notificationsOpen,
    searchQuery,
    headerScrolled,
    layoutMode,
    breadcrumbs,
    pageTitle,
    pageActions,
    layoutLoading,
    isRTL,
    isArabic,
    
    // User & Auth
    currentUser,
    isAuthenticated,
    isProfessional,
    
    // Theme & Language
    isDarkMode,
    language,
    
    // Functions
    toggleSidebar,
    toggleMobileMenu,
    toggleUserMenu,
    toggleQuickActions,
    toggleNotifications,
    closeMobileMenu,
    closeUserMenu,
    closeQuickActions,
    closeNotifications,
    closeAllMenus,
    setSearchQuery,
    updatePageInfo,
    addBreadcrumb,
    setCustomBreadcrumbs,
    showLayoutLoading,
    hideLayoutLoading,
    
    // Layout utilities
    getSidebarWidth: () => {
      if (window.innerWidth < 1024) {
        return sidebarOpen ? '100%' : '0px';
      }
      return sidebarOpen ? '280px' : '80px';
    },
    
    getMainContentMargin: () => {
      if (window.innerWidth < 1024) {
        return '0px';
      }
      return sidebarOpen ? '280px' : '80px';
    },
    
    isActivePath: (path) => {
      return location.pathname === path || location.pathname.startsWith(path + '/');
    },
    
    // Navigation helpers
    getNavigationItems: (mode = 'client') => {
      const baseItems = {
        client: [
          { 
            name: isArabic ? 'لوحة التحكم' : 'Dashboard', 
            path: '/dashboard', 
            icon: 'FaTachometerAlt',
            color: 'bg-blue-500',
            description: isArabic ? 'نظرة عامة على حسابك' : 'Overview of your account'
          },
          { 
            name: isArabic ? 'المواعيد' : 'Appointments', 
            path: '/dashboard/calendar', 
            icon: 'FaCalendarAlt',
            color: 'bg-green-500',
            description: isArabic ? 'إدارة مواعيدك' : 'Manage your appointments'
          },
          { 
            name: isArabic ? 'الرسائل' : 'Messages', 
            path: '/dashboard/messages', 
            icon: 'FaEnvelope',
            color: 'bg-purple-500',
            description: isArabic ? 'التواصل مع المحترفين' : 'Chat with professionals'
          },
          { 
            name: isArabic ? 'التقييمات' : 'Reviews', 
            path: '/dashboard/reviews', 
            icon: 'FaStar',
            color: 'bg-yellow-500',
            description: isArabic ? 'تقييماتك وآرائك' : 'Your reviews and ratings'
          },
          { 
            name: isArabic ? 'سجل المدفوعات' : 'Payment History', 
            path: '/dashboard/payment-history', 
            icon: 'FaCreditCard',
            color: 'bg-indigo-500',
            description: isArabic ? 'تاريخ عمليات الدفع' : 'Payment transactions'
          },
          { 
            name: isArabic ? 'سجل النشاطات' : 'Activity Log', 
            path: '/dashboard/activity', 
            icon: 'FaHistory',
            color: 'bg-gray-500',
            description: isArabic ? 'تاريخ أنشطة الحساب' : 'Account activity history'
          },
          { 
            name: isArabic ? 'الإشعارات' : 'Notifications', 
            path: '/dashboard/notifications', 
            icon: 'FaBell',
            color: 'bg-red-500',
            description: isArabic ? 'إشعاراتك الجديدة' : 'Your notifications'
          },
          { 
            name: isArabic ? 'الملف الشخصي' : 'Profile', 
            path: '/dashboard/profile', 
            icon: 'FaUser',
            color: 'bg-pink-500',
            description: isArabic ? 'معلوماتك الشخصية' : 'Your personal information'
          },
          { 
            name: isArabic ? 'الإعدادات' : 'Settings', 
            path: '/dashboard/settings', 
            icon: 'FaCog',
            color: 'bg-orange-500',
            description: isArabic ? 'إعدادات الحساب' : 'Account settings'
          }
        ],
        pro: [
          { 
            name: isArabic ? 'لوحة المحترف' : 'Pro Dashboard', 
            path: '/pro-dashboard', 
            icon: 'FaChartLine',
            color: 'bg-blue-500',
            description: isArabic ? 'إحصائيات أعمالك' : 'Business analytics'
          },
          { 
            name: isArabic ? 'المواعيد' : 'Appointments', 
            path: '/pro-dashboard/calendar', 
            icon: 'FaCalendarAlt',
            color: 'bg-green-500',
            description: isArabic ? 'جدولة المواعيد' : 'Schedule appointments'
          },
          { 
            name: isArabic ? 'العملاء' : 'Clients', 
            path: '/pro-dashboard/clients', 
            icon: 'FaUsers',
            color: 'bg-purple-500',
            description: isArabic ? 'إدارة العملاء' : 'Manage clients'
          },
          { 
            name: isArabic ? 'الرسائل' : 'Messages', 
            path: '/pro-dashboard/messages', 
            icon: 'FaEnvelope',
            color: 'bg-indigo-500',
            description: isArabic ? 'التواصل مع العملاء' : 'Chat with clients'
          },
          { 
            name: isArabic ? 'خدماتي' : 'My Services', 
            path: '/pro-dashboard/services', 
            icon: 'FaBriefcase',
            color: 'bg-teal-500',
            description: isArabic ? 'إدارة الخدمات' : 'Manage services'
          },
          { 
            name: isArabic ? 'الأوقات المتاحة' : 'Availability', 
            path: '/pro-dashboard/availability', 
            icon: 'FaClock',
            color: 'bg-cyan-500',
            description: isArabic ? 'إعدادات الأوقات' : 'Time availability'
          },
          { 
            name: isArabic ? 'التقييمات' : 'Reviews', 
            path: '/pro-dashboard/reviews', 
            icon: 'FaStar',
            color: 'bg-yellow-500',
            description: isArabic ? 'تقييمات العملاء' : 'Client reviews'
          },
          { 
            name: isArabic ? 'المدفوعات' : 'Payments', 
            path: '/pro-dashboard/payment-history', 
            icon: 'FaCreditCard',
            color: 'bg-emerald-500',
            description: isArabic ? 'الأرباح والمدفوعات' : 'Earnings and payments'
          },
          { 
            name: isArabic ? 'الإشعارات' : 'Notifications', 
            path: '/pro-dashboard/notifications', 
            icon: 'FaBell',
            color: 'bg-red-500',
            description: isArabic ? 'إشعارات الأعمال' : 'Business notifications'
          },
          { 
            name: isArabic ? 'الملف المهني' : 'Profile', 
            path: '/pro-dashboard/profile', 
            icon: 'FaUser',
            color: 'bg-pink-500',
            description: isArabic ? 'ملفك المهني' : 'Professional profile'
          },
          { 
            name: isArabic ? 'الإعدادات' : 'Settings', 
            path: '/pro-dashboard/settings', 
            icon: 'FaCog',
            color: 'bg-orange-500',
            description: isArabic ? 'إعدادات الأعمال' : 'Business settings'
          }
        ]
      };
      
      return baseItems[mode] || baseItems.client;
    },
    
    getQuickActions: () => [
      {
        name: isArabic ? 'موعد جديد' : 'New Appointment',
        icon: 'FaCalendarAlt',
        path: isProfessional ? '/pro-dashboard/calendar' : '/dashboard/calendar',
        color: 'text-green-600'
      },
      {
        name: isArabic ? 'رسالة جديدة' : 'New Message',
        icon: 'FaEnvelope',
        path: isProfessional ? '/pro-dashboard/messages' : '/dashboard/messages',
        color: 'text-blue-600'
      },
      {
        name: isArabic ? 'البحث' : 'Search',
        icon: 'FaSearch',
        path: '/search',
        color: 'text-purple-600'
      },
      {
        name: isArabic ? 'المساعدة' : 'Help',
        icon: 'FaQuestionCircle',
        path: '/help',
        color: 'text-orange-600'
      }
    ]
  };

  return (
    <LayoutContext.Provider value={layoutState}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutProvider; 