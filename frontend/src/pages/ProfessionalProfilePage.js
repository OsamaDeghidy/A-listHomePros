import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaEnvelope, 
  FaPhone,
  FaShieldAlt,
  FaCertificate,
  FaTools,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaCalendarAlt,
  FaDollarSign,
  FaUser,
  FaImages,
  FaQuoteLeft,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { professionalService } from '../services/professionalService';

const ProfessionalProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const isArabic = language === 'ar';

  const [professional, setProfessional] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchProfessionalData();
    fetchReviews();
  }, [userId]);

  const fetchProfessionalData = async () => {
    try {
      setLoading(true);
      const response = await professionalService.getProfessionalDetails(userId);
      setProfessional(response.data);
    } catch (error) {
      console.error('Error fetching professional data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await professionalService.getReviews(userId);
      setReviews(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleContactProfessional = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowContactModal(true);
  };

  const handleRequestService = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowRequestModal(true);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: إضافة API call لحفظ في المفضلة
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${professional.user?.name || professional.business_name} - ${isArabic ? 'محترف' : 'Professional'}`,
        text: professional.bio,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: إظهار toast message
    }
  };

  const ContactModal = () => (
    <AnimatePresence>
      {showContactModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowContactModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">
              {isArabic ? 'التواصل مع المحترف' : 'Contact Professional'}
            </h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaEnvelope className="mr-2" />
                {isArabic ? 'إرسال رسالة' : 'Send Message'}
              </button>
              
              {professional.user?.phone && (
                <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <FaPhone className="mr-2" />
                  {isArabic ? 'اتصال هاتفي' : 'Phone Call'}
                </button>
              )}
              
              <button 
                onClick={handleRequestService}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaCalendarAlt className="mr-2" />
                {isArabic ? 'طلب خدمة' : 'Request Service'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ServiceRequestModal = () => (
    <AnimatePresence>
      {showRequestModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRequestModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-4">
              {isArabic ? 'طلب خدمة جديد' : 'New Service Request'}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'عنوان الطلب' : 'Request Title'}
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={isArabic ? 'مثال: إصلاح السباكة' : 'Example: Plumbing Repair'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'وصف المشكلة' : 'Problem Description'}
                </label>
                <textarea
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={isArabic ? 'اشرح المشكلة بالتفصيل...' : 'Describe the problem in detail...'}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isArabic ? 'الميزانية المتوقعة' : 'Expected Budget'}
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="$100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isArabic ? 'الموعد المفضل' : 'Preferred Date'}
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isArabic ? 'إرسال الطلب' : 'Send Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جاري تحميل البيانات...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isArabic ? 'المحترف غير موجود' : 'Professional Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isArabic ? 'لم يتم العثور على هذا المحترف' : 'This professional could not be found'}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isArabic ? 'العودة للبحث' : 'Back to Search'}
          </button>
        </div>
      </div>
    );
  }

  const portfolio = professional.portfolio || [];
  const serviceCategories = professional.service_categories || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            {isArabic ? 'العودة' : 'Back'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {professional.cover_image && (
                  <img
                    src={professional.cover_image}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={toggleFavorite}
                    className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-white transition-colors"
                  >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <button
                    onClick={shareProfile}
                    className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  {/* Profile Image */}
                  <div className="relative -mt-16">
                    <div className="w-24 h-24 rounded-xl border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {professional.profile_image ? (
                        <img
                          src={professional.profile_image}
                          alt={professional.user?.name || professional.business_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-2xl text-white" />
                      )}
                    </div>
                    {professional.is_verified && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-white text-sm" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {professional.user?.name || professional.business_name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {professional.profession}
                    </p>
                    
                    {/* Rating and Stats */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="font-semibold">{professional.average_rating || 0}</span>
                        <span className="text-gray-500 ml-1">
                          ({professional.total_jobs || 0} {isArabic ? 'مشروع' : 'projects'})
                        </span>
                      </div>
                      <div className="text-gray-600">
                        {professional.years_of_experience} {isArabic ? 'سنوات خبرة' : 'years experience'}
                      </div>
                      <div className="text-green-600 font-semibold">
                        {professional.success_rate || 95}% {isArabic ? 'نجاح' : 'success rate'}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                      <FaMapMarkerAlt className="mr-2 text-red-500" />
                      <span>
                        {professional.address ? 
                          `${professional.address.city}, ${professional.address.state}` :
                          (isArabic ? 'الموقع غير محدد' : 'Location not specified')
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Categories */}
                {serviceCategories.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'التخصصات' : 'Specializations'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {serviceCategories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'نبذة عن المحترف' : 'About Professional'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {professional.bio || (isArabic ? 
                  'لم يتم إضافة وصف بعد.' :
                  'No description added yet.'
                )}
              </p>
            </div>

            {/* Portfolio/Gallery */}
            {portfolio.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaImages className="mr-2" />
                  {isArabic ? 'معرض الأعمال' : 'Portfolio'}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolio.map((item, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'التقييمات والآراء' : 'Reviews & Ratings'}
              </h2>
              
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-blue-600 mb-2" />
                  <p className="text-gray-600">{isArabic ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <FaUser className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {review.client?.name || (isArabic ? 'عميل' : 'Client')}
                            </h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`text-sm ${i < review.overall_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {review.comment}
                          </p>
                          {review.professional_response && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-2">
                              <div className="flex items-center mb-1">
                                <FaQuoteLeft className="text-blue-500 mr-2" />
                                <span className="text-sm font-semibold text-blue-600">
                                  {isArabic ? 'رد المحترف:' : 'Professional Response:'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {review.professional_response}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  {isArabic ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  ${professional.hourly_rate || 50}
                  <span className="text-lg text-gray-500">
                    /{isArabic ? 'ساعة' : 'hour'}
                  </span>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <FaClock className="mr-1 text-green-500" />
                  {professional.is_available ? 
                    (isArabic ? 'متاح للعمل' : 'Available for work') :
                    (isArabic ? 'مشغول حالياً' : 'Currently busy')
                  }
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRequestService}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {isArabic ? 'طلب خدمة' : 'Request Service'}
                </button>
                
                <button
                  onClick={handleContactProfessional}
                  className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-semibold"
                >
                  {isArabic ? 'تواصل معي' : 'Contact Me'}
                </button>
              </div>

              {/* Professional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'وقت الاستجابة:' : 'Response time:'}
                  </span>
                  <span className="font-semibold">
                    {professional.response_time_hours || 2} {isArabic ? 'ساعات' : 'hours'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'نطاق الخدمة:' : 'Service radius:'}
                  </span>
                  <span className="font-semibold">
                    {professional.service_radius || 25} {isArabic ? 'كم' : 'km'}
                  </span>
                </div>

                {professional.license_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {isArabic ? 'رقم الترخيص:' : 'License:'}
                    </span>
                    <div className="flex items-center">
                      <FaCertificate className="text-yellow-500 mr-1" />
                      <span className="font-semibold text-green-600">
                        {isArabic ? 'مرخص' : 'Licensed'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'معلومات إضافية' : 'Additional Info'}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'عضو منذ:' : 'Member since:'}
                  </span>
                  <span>
                    {new Date(professional.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'المشاريع المكتملة:' : 'Completed projects:'}
                  </span>
                  <span className="font-semibold">{professional.jobs_completed || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'معدل النجاح:' : 'Success rate:'}
                  </span>
                  <span className="font-semibold text-green-600">
                    {professional.success_rate || 95}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContactModal />
      <ServiceRequestModal />
    </div>
  );
};

export default ProfessionalProfilePage; 