import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useLanguage } from '../../hooks/useLanguage';

const DarkModeToggle = ({ className = '', variant = 'default' }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isArabic } = useLanguage();

  const getButtonClasses = () => {
    const baseClasses = 'p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    switch (variant) {
      case 'navbar':
        return `${baseClasses} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800`;
      case 'minimal':
        return `${baseClasses} text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`;
      default:
        return `${baseClasses} ${
          isDarkMode 
            ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        }`;
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`${getButtonClasses()} ${className}`}
      aria-label={isDarkMode 
        ? (isArabic ? 'التبديل إلى الوضع النهاري' : 'Switch to light mode')
        : (isArabic ? 'التبديل إلى الوضع الليلي' : 'Switch to dark mode')
      }
      title={isDarkMode 
        ? (isArabic ? 'الوضع النهاري' : 'Light mode')
        : (isArabic ? 'الوضع الليلي' : 'Dark mode')
      }
    >
      {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
    </button>
  );
};

export default DarkModeToggle; 