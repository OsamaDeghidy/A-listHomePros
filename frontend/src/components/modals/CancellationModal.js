import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

const CancellationModal = ({ isOpen, onClose, onConfirm, appointmentDetails }) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { delay: 0.1 } }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-50 p-4 border-b border-red-100">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-full">
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                </div>
                <h3 className={`text-lg font-medium text-red-800 ${isArabic ? 'mr-3 text-right' : 'ml-3'}`}>
                  {isArabic ? 'تأكيد إلغاء الموعد' : 'Confirm Cancellation'}
                </h3>
              </div>
            </div>
            
            <div className={`p-6 ${isArabic ? 'text-right' : ''}`}>
              <p className="text-gray-700 mb-4">
                {isArabic 
                  ? 'هل أنت متأكد أنك تريد إلغاء هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to cancel this appointment? This action cannot be undone.'}
              </p>
              
              {appointmentDetails && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">
                      {isArabic ? 'الخدمة:' : 'Service:'}
                    </span>
                    <span className="font-medium">{appointmentDetails.service}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">
                      {isArabic ? 'المهني:' : 'Professional:'}
                    </span>
                    <span className="font-medium">{appointmentDetails.pro?.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">
                      {isArabic ? 'التاريخ:' : 'Date:'}
                    </span>
                    <span className="font-medium">
                      {new Date(appointmentDetails.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {isArabic ? 'الوقت:' : 'Time:'}
                    </span>
                    <span className="font-medium">{appointmentDetails.time}</span>
                  </div>
                </div>
              )}
              
              <div className={`flex ${isArabic ? 'flex-row-reverse' : ''} justify-end space-x-3 ${isArabic ? 'space-x-reverse' : ''}`}>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isArabic ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CancellationModal;
