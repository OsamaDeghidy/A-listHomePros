import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

const LanguageSelector = ({ className = '', iconOnly = false }) => {
  const { language, toggleLanguage, isArabic, isEnglish } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Supported languages array (now locally defined)
  const supportedLanguages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' }
  ];

  // Get current language info
  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];
  };

  const currentLang = getCurrentLanguage();

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (langCode) => {
    // Use toggleLanguage for simple EN/AR switch
    if (langCode !== language) {
      toggleLanguage();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} dir={currentLang.dir}>
      <button
        onClick={toggleDropdown}
        className={`flex items-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          iconOnly 
            ? 'p-2 hover:bg-gray-100 dark:hover:bg-gray-700'
            : 'px-3 py-2 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
        }`}
        aria-label={isArabic ? 'تغيير اللغة' : 'Change language'}
      >
        <FaGlobe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        {!iconOnly && (
          <>
            <span className="mx-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
              {currentLang.name}
            </span>
            <FaChevronDown className={`h-3 w-3 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${isArabic ? 'left-0' : 'right-0'} mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700`}>
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                lang.code === language
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center">
                {lang.name}
                {lang.code === language && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400 font-bold">✓</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 