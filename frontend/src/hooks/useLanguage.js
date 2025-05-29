import React, { createContext, useState, useContext, useEffect } from 'react';

// إنشاء سياق اللغة
const LanguageContext = createContext();

// قائمة اللغات المدعومة في التطبيق
const supportedLanguages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' }
];

// مزود اللغة الذي يحيط بالتطبيق
export const LanguageProvider = ({ children }) => {
  // تحديد اللغة الافتراضية من التخزين المحلي أو من لغة المستعرض
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      return savedLanguage;
    }
    // محاولة الكشف عن لغة المستعرض
    const browserLang = navigator.language.split('-')[0];
    return supportedLanguages.some(lang => lang.code === browserLang) ? browserLang : 'en';
  });

  // الحصول على معلومات اللغة الحالية
  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];
  };

  // تغيير اتجاه الصفحة بناءً على اللغة (RTL للعربية، LTR للإنجليزية)
  useEffect(() => {
    const currentLang = getCurrentLanguage();
    document.documentElement.dir = currentLang.dir;
    document.documentElement.lang = currentLang.code;
    document.body.classList.toggle('rtl', currentLang.dir === 'rtl');
    localStorage.setItem('language', language);
  }, [language]);

  // وظيفة تغيير اللغة
  const changeLanguage = (langCode) => {
    if (supportedLanguages.some(lang => lang.code === langCode)) {
      setLanguage(langCode);
    }
  };

  // توفير قيم السياق للمكونات الفرعية
  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        changeLanguage, 
        supportedLanguages,
        getCurrentLanguage,
        isRTL: getCurrentLanguage().dir === 'rtl'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// هوك useLanguage لاستخدامه في المكونات
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// لا نصدر هذا الملف كـ default لتجنب تضارب الاستيراد