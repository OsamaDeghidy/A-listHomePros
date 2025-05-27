import { useEffect } from 'react';

/**
 * هوك مخصص للكشف عن النقرات خارج عنصر محدد
 * يستخدم غالبًا لإغلاق القوائم المنبثقة واللوحات عندما ينقر المستخدم خارجها
 * 
 * @param {React.RefObject} ref - مرجع للعنصر الذي نريد الكشف عن النقرات خارجه
 * @param {Function} handler - الدالة التي سيتم استدعاؤها عند النقر خارج العنصر
 * @param {Array} dependencies - مصفوفة التبعيات التي ستؤدي إلى إعادة تسجيل المستمع
 */
function useOnClickOutside(ref, handler, dependencies = []) {
  useEffect(() => {
    // تأكد من أن الدالة المقدمة صالحة
    if (!handler || typeof handler !== 'function') {
      return;
    }

    // دالة المعالج التي ستتحقق مما إذا كانت النقرة خارج العنصر
    const listener = (event) => {
      // إذا لم يتم تعيين المرجع أو إذا كان العنصر المحدد يحتوي على العنصر الذي تم النقر عليه
      // فلا نفعل شيئًا
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      // استدعاء الدالة المقدمة مع الحدث
      handler(event);
    };

    // تسجيل مستمعي الأحداث
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // دالة التنظيف لإزالة مستمعي الأحداث
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, ...dependencies]);
}

export default useOnClickOutside; 