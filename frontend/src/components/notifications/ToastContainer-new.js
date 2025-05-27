import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../hooks/useLanguage';
import NotificationToast from './NotificationToast';

// حاوية الإشعارات المنبثقة
const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // لا نعرض شيئًا إذا لم تكن هناك إشعارات
  if (!toasts || toasts.length === 0) return null;

  // إنشاء بوابة لعرض الإشعارات خارج تدفق DOM العادي
  return createPortal(
    <div className={`fixed top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 w-full max-w-sm space-y-2`}>
      {toasts.map(toast => (
        <NotificationToast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          removeNotification={removeToast}
          autoClose={true}
          duration={toast.duration || 5000}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer; 