import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { useLayout } from './LayoutProvider';

const Breadcrumb = ({ className = '', showHome = true, separator = null }) => {
  const { breadcrumbs, isArabic, isRTL } = useLayout();

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  const ChevronIcon = isRTL ? FaChevronLeft : FaChevronRight;
  const defaultSeparator = <ChevronIcon className="mx-2 text-gray-400 text-sm" />;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center space-x-1 rtl:space-x-reverse text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1 rtl:space-x-reverse">
        {/* Home Icon (optional) */}
        {showHome && breadcrumbs[0]?.path === '/' && (
          <li>
            <Link
              to="/"
              className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <FaHome className="text-base" />
              <span className="sr-only">{isArabic ? 'الرئيسية' : 'Home'}</span>
            </Link>
          </li>
        )}

        {/* Breadcrumb Items */}
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;
          
          // Skip home if we're showing home icon
          if (showHome && isFirst && crumb.path === '/') {
            return null;
          }

          return (
            <React.Fragment key={crumb.path || index}>
              {/* Separator */}
              {(index > 0 || (showHome && breadcrumbs[0]?.path === '/')) && (
                <li className="flex items-center">
                  {separator || defaultSeparator}
                </li>
              )}

              {/* Breadcrumb Item */}
              <li className="flex items-center">
                {isLast ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="font-medium text-gray-900 dark:text-white"
                    aria-current="page"
                  >
                    {crumb.name}
                  </motion.span>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={crumb.path}
                      className="font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  </motion.div>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumb; 