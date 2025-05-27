import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // تحقق من حالة الظلام المحفوظة محلياً
    const savedMode = localStorage.getItem('darkMode');
    // تحقق من تفضيلات النظام إذا لم يتم تعيين الوضع مسبقًا
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedMode ? savedMode === 'true' : prefersDark;
  });

  useEffect(() => {
    // تحديث وسوم HTML عند تغيير الوضع
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // حفظ التفضيل في التخزين المحلي
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // وظيفة للتبديل بين وضع الظلام والوضع الفاتح
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return { isDarkMode, toggleDarkMode };
};

export default useDarkMode; 