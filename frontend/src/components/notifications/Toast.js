import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-white text-xl" />;
      case 'error':
        return <FaExclamationCircle className="text-white text-xl" />;
      case 'info':
        return <FaInfoCircle className="text-white text-xl" />;
      default:
        return <FaInfoCircle className="text-white text-xl" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-md"
          initial={{ opacity: 0, y: -50, x: isArabic ? -50 : 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`${getBackgroundColor()} rounded-lg shadow-lg overflow-hidden`}>
            <div className={`flex items-center p-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 ${isArabic ? 'ml-3' : 'mr-3'}`}>
                {getIcon()}
              </div>
              <div className={`flex-1 ${isArabic ? 'text-right' : ''}`}>
                <p className="text-white font-medium">{message}</p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
