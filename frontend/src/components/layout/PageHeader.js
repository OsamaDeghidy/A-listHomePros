import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { useLayout } from './LayoutProvider';
import Breadcrumb from './Breadcrumb';

const PageHeader = ({ 
  title = null, 
  subtitle = null, 
  actions = null, 
  showBreadcrumbs = true,
  className = '',
  variant = 'default' // 'default' | 'minimal' | 'hero'
}) => {
  const { 
    pageTitle, 
    pageActions, 
    layoutLoading, 
    isArabic, 
    isRTL 
  } = useLayout();

  const displayTitle = title || pageTitle;
  const displayActions = actions || pageActions;

  // Loading state
  if (layoutLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin text-blue-500 text-xl" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {isArabic ? 'جارٍ التحميل...' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const headerVariants = {
    default: 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
    minimal: 'bg-transparent',
    hero: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
  };

  const textVariants = {
    default: 'text-gray-900 dark:text-white',
    minimal: 'text-gray-900 dark:text-white',
    hero: 'text-white'
  };

  const subtitleVariants = {
    default: 'text-gray-600 dark:text-gray-400',
    minimal: 'text-gray-600 dark:text-gray-400',
    hero: 'text-blue-100'
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${headerVariants[variant]} ${className}`}
    >
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {showBreadcrumbs && variant !== 'hero' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <Breadcrumb />
          </motion.div>
        )}

        {/* Main Header Content */}
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            {displayTitle && (
              <motion.h1
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-2xl lg:text-3xl font-bold ${textVariants[variant]} truncate`}
              >
                {displayTitle}
              </motion.h1>
            )}
            
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`mt-1 text-sm lg:text-base ${subtitleVariants[variant]}`}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Actions Section */}
          {displayActions && displayActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-3 rtl:space-x-reverse ml-4 rtl:ml-0 rtl:mr-4"
            >
              {displayActions.map((action, index) => {
                const ActionIcon = action.icon;
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`
                      inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${action.variant === 'primary' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
                        : action.variant === 'secondary'
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
                        : action.variant === 'danger'
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                      }
                      ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${variant === 'hero' ? 'bg-white/20 hover:bg-white/30 text-white border-white/30' : ''}
                    `}
                  >
                    {ActionIcon && <ActionIcon className="mr-2 text-base" />}
                    {action.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Hero Breadcrumbs */}
        {showBreadcrumbs && variant === 'hero' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <Breadcrumb className="text-white [&_.text-gray-500]:text-blue-100 [&_.text-gray-400]:text-blue-200 [&_.hover\\:text-blue-600]:hover:text-white" />
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default PageHeader; 