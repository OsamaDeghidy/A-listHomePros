import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaDollarSign, 
  FaFileInvoiceDollar,
  FaCalculator,
  FaHandshake,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

const InstallmentQuoteModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_price: '',
    estimated_duration: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = isArabic ? 'عنوان الخدمة مطلوب' : 'Service title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = isArabic ? 'وصف الخدمة مطلوب' : 'Service description is required';
    }

    if (!formData.total_price || parseFloat(formData.total_price) <= 0) {
      newErrors.total_price = isArabic ? 'يجب إدخال مبلغ صحيح' : 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      total_price: parseFloat(formData.total_price),
      supports_installments: true
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      total_price: '',
      estimated_duration: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  // Calculate installment amounts
  const totalAmount = parseFloat(formData.total_price) || 0;
  const firstPayment = totalAmount * 0.5;
  const secondPayment = totalAmount * 0.5;
  const platformFeePerPayment = totalAmount * 0.025; // 2.5% per payment (5% total)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <FaFileInvoiceDollar className="text-blue-600 mr-3 text-xl" />
                <h2 className="text-xl font-bold text-gray-900">
                  {isArabic ? 'إنشاء عرض سعر مقسط' : 'Create Installment Quote'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Service Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'عنوان الخدمة' : 'Service Title'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isArabic ? 'مثال: صيانة أعمال السباكة' : 'e.g., Plumbing Maintenance Work'}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Service Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'وصف الخدمة' : 'Service Description'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isArabic 
                    ? 'اشرح تفاصيل العمل المطلوب، المواد المستخدمة، والخطوات...' 
                    : 'Explain the work details, materials, and steps involved...'
                  }
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Total Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'إجمالي المبلغ (بالدولار)' : 'Total Amount (USD)'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="total_price"
                    value={formData.total_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.total_price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.total_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.total_price}</p>
                )}
              </div>

              {/* Estimated Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'المدة المتوقعة' : 'Estimated Duration'}
                </label>
                <input
                  type="text"
                  name="estimated_duration"
                  value={formData.estimated_duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isArabic ? 'مثال: 3-5 أيام' : 'e.g., 3-5 days'}
                />
              </div>

              {/* Additional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'ملاحظات إضافية' : 'Additional Notes'}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isArabic 
                    ? 'أي تفاصيل إضافية أو شروط خاصة...' 
                    : 'Any additional details or special conditions...'
                  }
                />
              </div>

              {/* Payment Breakdown */}
              {totalAmount > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <FaCalculator className="text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-900">
                      {isArabic ? 'تفاصيل نظام الدفع المقسط' : 'Installment Payment Breakdown'}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {isArabic ? 'الدفعة الأولى (50%):' : 'First Payment (50%):'}
                      </span>
                      <span className="font-medium">${firstPayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {isArabic ? 'الدفعة الثانية (50%):' : 'Second Payment (50%):'}
                      </span>
                      <span className="font-medium">${secondPayment.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {isArabic ? 'عمولة المنصة (5%):' : 'Platform Fee (5%):'}
                      </span>
                      <span className="font-medium text-red-600">-${(platformFeePerPayment * 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>{isArabic ? 'صافي المبلغ المستلم:' : 'Net Amount Received:'}</span>
                      <span className="text-green-600">${(totalAmount - (platformFeePerPayment * 2)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Important Notice */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-600 mr-2 mt-1 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">
                      {isArabic ? 'ملاحظة مهمة:' : 'Important Notice:'}
                    </p>
                    <p>
                      {isArabic 
                        ? 'سيتم إنشاء حساب ضمان تلقائياً مع نظام حجز لمدة 14 يوم لحماية الطرفين. يتم خصم 5% عمولة منصة من كل دفعة.'
                        : 'An escrow account will be automatically created with a 14-day hold system to protect both parties. 5% platform fee is deducted from each payment.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaHandshake className="mr-2" />
                      {isArabic ? 'إنشاء العرض المقسط' : 'Create Installment Quote'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallmentQuoteModal; 