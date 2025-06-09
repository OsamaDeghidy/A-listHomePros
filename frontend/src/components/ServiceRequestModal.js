import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaDollarSign,
  FaExclamationTriangle,
  FaImage,
  FaPlus,
  FaMinus
} from 'react-icons/fa';
import { useLanguage } from '../hooks/useLanguage';
import professionalService from '../services/professionalService';

const ServiceRequestModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  professionals = [],
  initialData = null 
}) => {
  const { language, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    budget_min: '',
    budget_max: '',
    preferred_date: '',
    preferred_time: '',
    location_address: '',
    location_city: '',
    location_state: '',
    location_zip_code: '',
    latitude: null,
    longitude: null,
    is_flexible_date: false,
    is_flexible_budget: false,
    requires_materials: false,
    images: [],
    notes: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  // Load categories and initialize form
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      
      // Initialize form with existing data if editing
      if (initialData) {
        setFormData({
          ...formData,
          ...initialData,
          preferred_date: initialData.preferred_date ? 
            new Date(initialData.preferred_date).toISOString().split('T')[0] : '',
          images: initialData.images || []
        });
      }
    }
  }, [isOpen, initialData]);

  const loadCategories = async () => {
    try {
      const response = await professionalService.getServiceCategories();
      if (response?.data) {
        setCategories(Array.isArray(response.data) ? response.data : response.data.results || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      setCategories([
        { id: 'plumbing', name: language === 'ar' ? 'السباكة' : 'Plumbing' },
        { id: 'electrical', name: language === 'ar' ? 'الكهرباء' : 'Electrical' },
        { id: 'carpentry', name: language === 'ar' ? 'النجارة' : 'Carpentry' },
        { id: 'painting', name: language === 'ar' ? 'الدهان' : 'Painting' },
        { id: 'cleaning', name: language === 'ar' ? 'التنظيف' : 'Cleaning' }
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: language === 'ar' ? 'يمكن رفع 5 صور كحد أقصى' : 'Maximum 5 images allowed'
      }));
      return;
    }

    // Convert to base64 for preview (in real app, upload to server)
    Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
          file,
          preview: e.target.result,
          name: file.name
        });
        reader.readAsDataURL(file);
      });
    })).then(newImages => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = language === 'ar' ? 'العنوان مطلوب' : 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = language === 'ar' ? 'الوصف مطلوب' : 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = language === 'ar' ? 'الفئة مطلوبة' : 'Category is required';
    }

    if (!formData.location_address.trim()) {
      newErrors.location_address = language === 'ar' ? 'العنوان مطلوب' : 'Address is required';
    }

    if (formData.budget_min && formData.budget_max && 
        parseFloat(formData.budget_min) > parseFloat(formData.budget_max)) {
      newErrors.budget_max = language === 'ar' ? 
        'الحد الأقصى للميزانية يجب أن يكون أكبر من الحد الأدنى' : 
        'Maximum budget must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        preferred_professionals: selectedProfessionals.map(p => p.user_id || p.id)
      };

      await onSubmit(submissionData);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        urgency: 'medium',
        budget_min: '',
        budget_max: '',
        preferred_date: '',
        preferred_time: '',
        location_address: '',
        location_city: '',
        location_state: '',
        location_zip_code: '',
        latitude: null,
        longitude: null,
        is_flexible_date: false,
        is_flexible_budget: false,
        requires_materials: false,
        images: [],
        notes: ''
      });
      setSelectedProfessionals([]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting service request:', error);
      setErrors({
        submit: error.message || (language === 'ar' ? 'حدث خطأ في إرسال الطلب' : 'Error submitting request')
      });
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { value: 'low', label: language === 'ar' ? 'منخفضة' : 'Low', color: 'text-green-600' },
    { value: 'medium', label: language === 'ar' ? 'متوسطة' : 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: language === 'ar' ? 'عالية' : 'High', color: 'text-orange-600' },
    { value: 'urgent', label: language === 'ar' ? 'عاجل' : 'Urgent', color: 'text-red-600' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? 
                (language === 'ar' ? 'تعديل طلب الخدمة' : 'Edit Service Request') :
                (language === 'ar' ? 'طلب خدمة جديد' : 'New Service Request')
              }
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'عنوان الطلب' : 'Request Title'} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' ? 'اكتب عنوان واضح لطلبك' : 'Enter a clear title for your request'}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'فئة الخدمة' : 'Service Category'} *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">
                    {language === 'ar' ? 'اختر الفئة' : 'Select category'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'مستوى الأولوية' : 'Urgency Level'}
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {urgencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'وصف تفصيلي للمطلوب' : 'Detailed Description'} *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder={language === 'ar' ? 
                  'اشرح بالتفصيل ما تحتاجه، حالة المشكلة، والعمل المطلوب...' : 
                  'Explain in detail what you need, the current condition, and required work...'
                }
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaDollarSign className="inline w-4 h-4 mr-1" />
                {language === 'ar' ? 'الميزانية المتوقعة' : 'Expected Budget'}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    name="budget_min"
                    value={formData.budget_min}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'الحد الأدنى' : 'Minimum'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="budget_max"
                    value={formData.budget_max}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'الحد الأقصى' : 'Maximum'}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.budget_max ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.budget_max && <p className="text-red-500 text-xs mt-1">{errors.budget_max}</p>}
                </div>
              </div>
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="is_flexible_budget"
                  checked={formData.is_flexible_budget}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {language === 'ar' ? 'الميزانية قابلة للتفاوض' : 'Budget is negotiable'}
                </span>
              </label>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline w-4 h-4 mr-1" />
                {language === 'ar' ? 'موقع الخدمة' : 'Service Location'} *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="location_address"
                    value={formData.location_address}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'العنوان الكامل' : 'Full address'}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.location_address && <p className="text-red-500 text-xs mt-1">{errors.location_address}</p>}
                </div>
                <input
                  type="text"
                  name="location_city"
                  value={formData.location_city}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' ? 'المدينة' : 'City'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="location_zip_code"
                  value={formData.location_zip_code}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' ? 'الرمز البريدي' : 'ZIP Code'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Preferred Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline w-4 h-4 mr-1" />
                {language === 'ar' ? 'التوقيت المفضل' : 'Preferred Schedule'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{language === 'ar' ? 'اختر الوقت' : 'Select time'}</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="is_flexible_date"
                  checked={formData.is_flexible_date}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {language === 'ar' ? 'التاريخ مرن' : 'Date is flexible'}
                </span>
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaImage className="inline w-4 h-4 mr-1" />
                {language === 'ar' ? 'صور توضيحية (اختيارية)' : 'Reference Images (Optional)'}
              </label>
              <div className="space-y-4">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <FaImage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {language === 'ar' ? 'اضغط لرفع الصور' : 'Click to upload images'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ar' ? 'الحد الأقصى 5 صور' : 'Maximum 5 images'}
                    </p>
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.images && <p className="text-red-500 text-xs">{errors.images}</p>}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requires_materials"
                  checked={formData.requires_materials}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {language === 'ar' ? 'يتطلب توفير مواد' : 'Requires materials'}
                </span>
              </label>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder={language === 'ar' ? 'أي معلومات إضافية...' : 'Any additional information...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  language === 'ar' ? 'إرسال الطلب' : 'Submit Request'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServiceRequestModal; 