import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  FaFileInvoiceDollar, 
  FaDollarSign, 
  FaCalendarAlt, 
  FaClock, 
  FaTools, 
  FaShieldAlt,
  FaArrowLeft,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { alistProsService } from '../services/api';

const CreateQuotePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Get data from navigation state
  const { clientId, clientName, conversationId, serviceRequestId } = location.state || {};

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_price: '',
    estimated_duration: '',
    start_date: '',
    completion_date: '',
    materials_included: true,
    warranty_period: '',
    terms_and_conditions: '',
    service_request: serviceRequestId || null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated or not professional
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const isProfessional = currentUser?.role === 'contractor' || currentUser?.role === 'specialist' || currentUser?.role === 'crew';
    if (!isProfessional) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Set default title based on client
  useEffect(() => {
    if (clientName && !formData.title) {
      setFormData(prev => ({
        ...prev,
        title: isArabic ? `عرض سعر لـ ${clientName}` : `Quote for ${clientName}`
      }));
    }
  }, [clientName, isArabic, formData.title]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.total_price) {
      setError(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const quoteData = {
        ...formData,
        total_price: parseFloat(formData.total_price),
        client: clientId
      };

      console.log('📤 Creating quote:', quoteData);

      const response = await alistProsService.createServiceQuote(quoteData);
      
      console.log('✅ Quote created successfully:', response.data);
      
      setSuccess(true);
      
      // Determine the correct dashboard path based on user role
      let dashboardPath = '/pro-dashboard';
      if (currentUser?.role === 'specialist') {
        dashboardPath = '/specialist-dashboard';
      } else if (currentUser?.role === 'crew') {
        dashboardPath = '/crew-dashboard';
      }
      
      // Redirect after success
      setTimeout(() => {
        if (conversationId) {
          navigate(`${dashboardPath}/messages/${conversationId}`);
        } else {
          navigate(`${dashboardPath}/service-requests`);
        }
      }, 2000);

    } catch (err) {
      console.error('❌ Error creating quote:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message;
      setError(isArabic ? `فشل في إنشاء العرض: ${errorMessage}` : `Failed to create quote: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle going back
  const handleGoBack = () => {
    // Determine the correct dashboard path based on user role
    let dashboardPath = '/pro-dashboard';
    if (currentUser?.role === 'specialist') {
      dashboardPath = '/specialist-dashboard';
    } else if (currentUser?.role === 'crew') {
      dashboardPath = '/crew-dashboard';
    }
    
    if (conversationId) {
      navigate(`${dashboardPath}/messages/${conversationId}`);
    } else {
      navigate(`${dashboardPath}/service-requests`);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isArabic ? 'تم إنشاء العرض بنجاح!' : 'Quote Created Successfully!'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isArabic ? 'سيتم إشعار العميل بالعرض الجديد' : 'The client will be notified about the new quote'}
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'إنشاء عرض سعر | A-List Home Pros' : 'Create Quote | A-List Home Pros'}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isArabic ? 'إنشاء عرض سعر' : 'Create Quote'}
                  </h1>
                  {clientName && (
                    <p className="text-gray-600 mt-1">
                      {isArabic ? `للعميل: ${clientName}` : `For client: ${clientName}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <FaFileInvoiceDollar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <FaExclamationTriangle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Quote Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'عنوان العرض *' : 'Quote Title *'}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isArabic ? 'أدخل عنوان العرض' : 'Enter quote title'}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'وصف العمل *' : 'Work Description *'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isArabic ? 'اوصف العمل المطلوب بالتفصيل' : 'Describe the work in detail'}
                  required
                />
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaDollarSign className="inline h-4 w-4 mr-1" />
                    {isArabic ? 'السعر الإجمالي * ($)' : 'Total Price * ($)'}
                  </label>
                  <input
                    type="number"
                    name="total_price"
                    value={formData.total_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isArabic ? 'أدخل السعر' : 'Enter price'}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaClock className="inline h-4 w-4 mr-1" />
                    {isArabic ? 'المدة المقدرة' : 'Estimated Duration'}
                  </label>
                  <input
                    type="text"
                    name="estimated_duration"
                    value={formData.estimated_duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isArabic ? 'مثال: 3 أيام' : 'e.g., 3 days'}
                  />
                </div>
              </div>

              {/* Start and Completion Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                    {isArabic ? 'تاريخ البدء' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                    {isArabic ? 'تاريخ الانتهاء' : 'Completion Date'}
                  </label>
                  <input
                    type="date"
                    name="completion_date"
                    value={formData.completion_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Materials and Warranty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="materials_included"
                      checked={formData.materials_included}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      <FaTools className="inline h-4 w-4 mr-1" />
                      {isArabic ? 'المواد مشمولة' : 'Materials Included'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaShieldAlt className="inline h-4 w-4 mr-1" />
                    {isArabic ? 'فترة الضمان' : 'Warranty Period'}
                  </label>
                  <input
                    type="text"
                    name="warranty_period"
                    value={formData.warranty_period}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isArabic ? 'مثال: سنة واحدة' : 'e.g., 1 year'}
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الشروط والأحكام' : 'Terms and Conditions'}
                </label>
                <textarea
                  name="terms_and_conditions"
                  value={formData.terms_and_conditions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isArabic ? 'أدخل أي شروط إضافية' : 'Enter any additional terms'}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading && <FaSpinner className="animate-spin mr-2 h-4 w-4" />}
                  <FaFileInvoiceDollar className="h-4 w-4 mr-2" />
                  {loading 
                    ? (isArabic ? 'جاري الإنشاء...' : 'Creating...') 
                    : (isArabic ? 'إنشاء العرض' : 'Create Quote')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateQuotePage; 