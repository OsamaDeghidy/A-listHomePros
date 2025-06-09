import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  FaTools, 
  FaMapMarkerAlt, 
  FaClock, 
  FaDollarSign, 
  FaInfoCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { serviceService, proService } from '../services/api';

const ServiceRequestPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Form state
  const [serviceCategory, setServiceCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [budget, setBudget] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone_number || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [images, setImages] = useState([]);
  const [providerPreference, setProviderPreference] = useState('any');
  const [specificProvider, setSpecificProvider] = useState('');

  // Data state
  const [serviceCategories, setServiceCategories] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/new-request');
    }
  }, [isAuthenticated, navigate]);

  // Fetch service categories and providers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service categories
        const categoriesResponse = await serviceService.getCategories();
        setServiceCategories(categoriesResponse.data.results || []);

        // Fetch available providers
        const providersResponse = await proService.searchPros({ limit: 20 });
        setAvailableProviders(providersResponse.data.results || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(isArabic ? 'خطأ في تحميل البيانات' : 'Error loading data');
      }
    };

    fetchData();
  }, [isArabic]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!serviceCategory || !title || !description || !address) {
        throw new Error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      }

      // Create service request
      const requestData = {
        category: serviceCategory,
        title,
        description,
        urgency,
        budget: budget ? parseFloat(budget) : null,
        preferred_date: preferredDate || null,
        preferred_time: preferredTime || null,
        address,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        provider_preference: providerPreference,
        specific_provider: specificProvider || null,
        status: 'open'
      };

      // Here you would call the API to create the service request
      // const response = await serviceService.createRequest(requestData);
      console.log('Service request data:', requestData);

      // Show success message and redirect
      alert(isArabic ? 'تم إنشاء طلب الخدمة بنجاح!' : 'Service request created successfully!');
      navigate('/dashboard');

    } catch (err) {
      console.error('Error creating service request:', err);
      setError(err.message || (isArabic ? 'فشل في إنشاء طلب الخدمة' : 'Failed to create service request'));
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'طلب خدمة جديد | A-List Home Pros' : 'New Service Request | A-List Home Pros'}</title>
      </Helmet>

      <motion.div 
        className="min-h-screen bg-gray-50 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {isArabic ? 'طلب خدمة جديد' : 'Create New Service Request'}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isArabic 
                ? 'صف مشكلتك بالتفصيل وسنساعدك في العثور على أفضل مقدمي الخدمة لحلها'
                : 'Describe your problem in detail and we\'ll help you find the best service providers to solve it'}
            </p>
          </motion.div>

          {/* Form */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8"
            variants={itemVariants}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Service Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaTools className="inline mr-2 text-blue-600" />
                  {isArabic ? 'نوع الخدمة' : 'Service Category'} *
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">
                    {isArabic ? 'اختر نوع الخدمة' : 'Select service type'}
                  </option>
                  {serviceCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'عنوان المشكلة' : 'Problem Title'} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isArabic ? 'مثال: تسريب في المطبخ' : 'Example: Kitchen sink leak'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'وصف المشكلة بالتفصيل' : 'Detailed Problem Description'} *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isArabic 
                    ? 'اشرح المشكلة بالتفصيل، متى بدأت، وأي معلومات أخرى مهمة...'
                    : 'Explain the problem in detail, when it started, and any other important information...'}
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Urgency and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaExclamationTriangle className="inline mr-2 text-orange-500" />
                    {isArabic ? 'مستوى الأولوية' : 'Urgency Level'}
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">{isArabic ? 'عادي' : 'Low'}</option>
                    <option value="normal">{isArabic ? 'متوسط' : 'Normal'}</option>
                    <option value="high">{isArabic ? 'عاجل' : 'High'}</option>
                    <option value="emergency">{isArabic ? 'طارئ' : 'Emergency'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaDollarSign className="inline mr-2 text-green-600" />
                    {isArabic ? 'الميزانية المقترحة' : 'Estimated Budget'}
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={isArabic ? 'اختياري' : 'Optional'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Preferred Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-2 text-purple-600" />
                    {isArabic ? 'التاريخ المفضل' : 'Preferred Date'}
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaClock className="inline mr-2 text-purple-600" />
                    {isArabic ? 'الوقت المفضل' : 'Preferred Time'}
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{isArabic ? 'أي وقت' : 'Any time'}</option>
                    <option value="morning">{isArabic ? 'صباحاً (8-12)' : 'Morning (8-12)'}</option>
                    <option value="afternoon">{isArabic ? 'بعد الظهر (12-17)' : 'Afternoon (12-17)'}</option>
                    <option value="evening">{isArabic ? 'مساءً (17-20)' : 'Evening (17-20)'}</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2 text-red-600" />
                  {isArabic ? 'عنوان الخدمة' : 'Service Address'} *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isArabic ? 'العنوان الكامل مع تفاصيل الوصول' : 'Full address with access details'}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2 text-blue-600" />
                    {isArabic ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-blue-600" />
                    {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Provider Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  <FaUser className="inline mr-2 text-indigo-600" />
                  {isArabic ? 'تفضيل مقدم الخدمة' : 'Service Provider Preference'}
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="providerPreference"
                      value="any"
                      checked={providerPreference === 'any'}
                      onChange={(e) => setProviderPreference(e.target.value)}
                      className="mr-3"
                    />
                    <span>{isArabic ? 'أي مقدم خدمة مناسب' : 'Any suitable provider'}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="providerPreference"
                      value="specialist"
                      checked={providerPreference === 'specialist'}
                      onChange={(e) => setProviderPreference(e.target.value)}
                      className="mr-3"
                    />
                    <span>{isArabic ? 'أفضل أخصائي معتمد (A-List Specialist)' : 'Prefer certified specialist (A-List Specialist)'}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="providerPreference"
                      value="crew"
                      checked={providerPreference === 'crew'}
                      onChange={(e) => setProviderPreference(e.target.value)}
                      className="mr-3"
                    />
                    <span>{isArabic ? 'أفضل طاقم عمل (A-List Crew)' : 'Prefer work crew (A-List Crew)'}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="providerPreference"
                      value="homepro"
                      checked={providerPreference === 'homepro'}
                      onChange={(e) => setProviderPreference(e.target.value)}
                      className="mr-3"
                    />
                    <span>{isArabic ? 'أفضل محترف منزلي (Home Pro)' : 'Prefer home professional (Home Pro)'}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="providerPreference"
                      value="specific"
                      checked={providerPreference === 'specific'}
                      onChange={(e) => setProviderPreference(e.target.value)}
                      className="mr-3"
                    />
                    <span>{isArabic ? 'مقدم خدمة محدد' : 'Specific provider'}</span>
                  </label>
                </div>

                {/* Specific Provider Selection */}
                {providerPreference === 'specific' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'اختر مقدم الخدمة' : 'Select Provider'}
                    </label>
                    <select
                      value={specificProvider}
                      onChange={(e) => setSpecificProvider(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">
                        {isArabic ? 'اختر مقدم خدمة' : 'Select a provider'}
                      </option>
                      {availableProviders.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.business_name || provider.name} - {provider.profession}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <FaExclamationTriangle className="inline mr-2" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      {isArabic ? 'جارٍ الإنشاء...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FaTools className="mr-2" />
                      {isArabic ? 'إنشاء طلب الخدمة' : 'Create Service Request'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Info Box */}
          <motion.div 
            className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
            variants={itemVariants}
          >
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-blue-900 font-semibold mb-2">
                  {isArabic ? 'كيف يعمل النظام؟' : 'How does it work?'}
                </h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>{isArabic ? '• سيتم إرسال طلبك إلى مقدمي الخدمة المناسبين' : '• Your request will be sent to suitable service providers'}</li>
                  <li>{isArabic ? '• ستحصل على عروض أسعار من محترفين مختلفين' : '• You\'ll receive quotes from different professionals'}</li>
                  <li>{isArabic ? '• يمكنك مراجعة الملفات الشخصية واختيار الأفضل' : '• You can review profiles and choose the best one'}</li>
                  <li>{isArabic ? '• نضمن جودة الخدمة ونوفر الحماية المالية' : '• We guarantee service quality and provide financial protection'}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ServiceRequestPage; 