import React, { createContext, useState, useContext, useEffect } from 'react';

// Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    return localStorage.getItem('language') || 'en';
  });

  // Toggle between Arabic and English
  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Set specific language
  const setLanguageValue = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Update HTML dir attribute when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    toggleLanguage,
    setLanguage: setLanguageValue,
    isArabic: language === 'ar',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

export default LanguageContext;

// لا نصدر هذا الملف كـ default لتجنب تضارب الاستيراد