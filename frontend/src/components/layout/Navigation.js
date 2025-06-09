import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaSearch, 
  FaServicestack, 
  FaDollarSign, 
  FaInfoCircle, 
  FaEnvelope, 
  FaBlog, 
  FaQuestionCircle,
  FaUserTie,
  FaTachometerAlt,
  FaChevronRight,
  FaChevronLeft
} from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useLayout } from './LayoutProvider';

const Navigation = ({ variant = 'default', className = '' }) => {
  const { language } = useLanguage();
  const { isAuthenticated, isProfessional } = useAuth();
  const { isActivePath } = useLayout();
  const location = useLocation();
  
  const isArabic = language === 'ar';
  const ChevronIcon = isArabic ? FaChevronLeft : FaChevronRight;

  const navigationItems = [
    {
      name: isArabic ? 'الرئيسية' : 'Home',
      path: '/',
      icon: FaHome,
      description: isArabic ? 'العودة للصفحة الرئيسية' : 'Back to homepage',
      color: 'text-blue-600',
      public: true
    },
    {
      name: isArabic ? 'البحث عن محترفين' : 'Find Pros',
      path: '/search',
      icon: FaSearch,
      description: isArabic ? 'ابحث عن مقدمي الخدمات' : 'Search for service providers',
      color: 'text-green-600',
      public: true
    },
    {
      name: isArabic ? 'الخدمات' : 'Services',
      path: '/services',
      icon: FaServicestack,
      description: isArabic ? 'تصفح جميع الخدمات' : 'Browse all services',
      color: 'text-purple-600',
      public: true
    },
    {
      name: isArabic ? 'الأسعار' : 'Pricing',
      path: '/pricing',
      icon: FaDollarSign,
      description: isArabic ? 'خطط الأسعار' : 'Pricing plans',
      color: 'text-orange-600',
      public: true
    },
    {
      name: isArabic ? 'كيف يعمل' : 'How it Works',
      path: '/how-it-works',
      icon: FaInfoCircle,
      description: isArabic ? 'تعرف على طريقة العمل' : 'Learn how our platform works',
      color: 'text-indigo-600',
      public: true
    },
    {
      name: isArabic ? 'المدونة' : 'Blog',
      path: '/blog',
      icon: FaBlog,
      description: isArabic ? 'أحدث المقالات والنصائح' : 'Latest articles and tips',
      color: 'text-pink-600',
      public: true
    },
    {
      name: isArabic ? 'اتصل بنا' : 'Contact',
      path: '/contact',
      icon: FaEnvelope,
      description: isArabic ? 'تواصل معنا' : 'Get in touch with us',
      color: 'text-teal-600',
      public: true
    },
    {
      name: isArabic ? 'المساعدة' : 'Help',
      path: '/help',
      icon: FaQuestionCircle,
      description: isArabic ? 'مركز المساعدة' : 'Help center',
      color: 'text-gray-600',
      public: true
    }
  ];

  // Add authenticated user items
  if (isAuthenticated) {
    navigationItems.push({
      name: isArabic ? 'لوحة التحكم' : 'Dashboard',
      path: isProfessional ? '/pro-dashboard' : '/dashboard',
      icon: FaTachometerAlt,
      description: isProfessional 
        ? (isArabic ? 'لوحة تحكم المحترف' : 'Professional dashboard')
        : (isArabic ? 'لوحة تحكم العميل' : 'Client dashboard'),
      color: 'text-blue-700',
      auth: true
    });

    if (!isProfessional) {
      navigationItems.push({
        name: isArabic ? 'انضم كمحترف' : 'Become a Pro',
        path: '/register?type=pro',
        icon: FaUserTie,
        description: isArabic ? 'انضم كمقدم خدمة' : 'Join as a service provider',
        color: 'text-emerald-600',
        auth: true
      });
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isArabic ? 20 : -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const navClasses = {
    default: 'flex flex-col space-y-1',
    horizontal: 'flex flex-row space-x-4 rtl:space-x-reverse space-y-0',
    grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
    minimal: 'flex flex-col space-y-2'
  };

  const getItemClasses = (item, isActive) => {
    const baseClasses = 'group flex items-center transition-all duration-200 rounded-lg';
    
    switch (variant) {
      case 'horizontal':
        return `${baseClasses} px-3 py-2 text-sm ${
          isActive 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`;
      case 'grid':
        return `${baseClasses} p-4 border border-gray-200 dark:border-gray-700 flex-col text-center ${
          isActive 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
        }`;
      case 'minimal':
        return `${baseClasses} px-2 py-1 text-sm ${
          isActive 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`;
      default:
        return `${baseClasses} px-4 py-3 ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`;
    }
  };

  const renderIcon = (item, isActive) => {
    const Icon = item.icon;
    const iconClasses = variant === 'grid' 
      ? 'text-2xl mb-2' 
      : `text-lg ${variant === 'horizontal' || variant === 'minimal' ? 'mr-2 rtl:mr-0 rtl:ml-2' : 'mr-3 rtl:mr-0 rtl:ml-3'}`;
    
    return (
      <Icon 
        className={`${iconClasses} ${
          isActive 
            ? (variant === 'grid' ? item.color : 'text-white') 
            : `${item.color} group-hover:scale-110 transition-transform`
        }`} 
      />
    );
  };

  const renderContent = (item, isActive) => {
    if (variant === 'grid') {
      return (
        <>
          {renderIcon(item, isActive)}
          <div>
            <div className="font-medium">{item.name}</div>
            {item.description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.description}
              </div>
            )}
          </div>
        </>
      );
    }

    if (variant === 'minimal') {
      return (
        <>
          {renderIcon(item, isActive)}
          <span>{item.name}</span>
        </>
      );
    }

    return (
      <>
        {renderIcon(item, isActive)}
        <div className="flex-1 min-w-0">
          <div className="font-medium">{item.name}</div>
          {variant === 'default' && item.description && (
            <div className={`text-xs mt-0.5 ${
              isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {item.description}
            </div>
          )}
        </div>
        {variant === 'default' && isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        )}
        {variant === 'horizontal' && !isActive && (
          <ChevronIcon className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </>
    );
  };

  return (
    <motion.nav
      className={`${navClasses[variant]} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {navigationItems.map((item, index) => {
        const isActive = isActivePath(item.path);
        
        return (
          <motion.div key={item.path} variants={itemVariants}>
            <Link
              to={item.path}
              className={getItemClasses(item, isActive)}
              title={item.description}
            >
              {renderContent(item, isActive)}
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
};

export default Navigation; 