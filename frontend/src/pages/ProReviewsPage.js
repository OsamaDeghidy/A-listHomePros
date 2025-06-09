import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { alistProsService } from '../services/api';
import '../styles/reviews.css';
import {
  FaStar,
  FaRegStar,
  FaCalendarAlt,
  FaUser,
  FaSpinner,
  FaExclamationCircle,
  FaFilter,
  FaSearch,
  FaTimes,
  FaReply,
  FaCheck,
  FaEye,
  FaChartBar,
  FaThumbsUp,
  FaFlag,
  FaComment
} from 'react-icons/fa';

const ProReviewsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileId, setProfileId] = useState(null);
  
  // Filter and view states
  const [activeFilters, setActiveFilters] = useState({
    rating: 'all',
    response_status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Fetch professional profile and reviews
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfessionalReviews();
    }
  }, [isAuthenticated]);

  // Filter reviews when filters or search changes
  useEffect(() => {
    filterReviews();
  }, [reviews, activeFilters, searchQuery]);

  const fetchProfessionalReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get the professional profile
      const profileResponse = await alistProsService.getProfile('me');
      const profile = profileResponse.data;
      
      if (!profile || !profile.id) {
        throw new Error('Professional profile not found');
      }
      
      setProfileId(profile.id);
      
      // Get reviews for this professional using the correct endpoint
      const reviewsResponse = await alistProsService.getReviews(profile.id);
      const reviewsData = reviewsResponse.data.results || reviewsResponse.data || [];
      
      console.log('📋 Professional Reviews:', reviewsData);
      
      // Map the data to match our expected structure  
      const mappedReviews = reviewsData.map(review => ({
        ...review,
        user: review.client || review.user, // Backend uses 'client' field
        client: review.client,
        title: review.title || '', // Add title if missing
        professional_response: review.professional_response || null,
        response_date: review.response_date || null,
        helpful_count: review.helpful_count || 0,
        service_category: review.service_category || null
      }));
      
      setReviews(mappedReviews);
      
    } catch (err) {
      console.error('❌ Error fetching professional reviews:', err);
      setError(
        err.response?.status === 404 
          ? (isArabic ? 'لم يتم العثور على الملف الشخصي المهني' : 'Professional profile not found')
          : (isArabic ? 'فشل في تحميل المراجعات' : 'Failed to load reviews')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    // Filter by rating
    if (activeFilters.rating !== 'all') {
      const rating = parseInt(activeFilters.rating);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Filter by response status
    if (activeFilters.response_status !== 'all') {
      if (activeFilters.response_status === 'responded') {
        filtered = filtered.filter(review => review.professional_response);
      } else if (activeFilters.response_status === 'not_responded') {
        filtered = filtered.filter(review => !review.professional_response);
      }
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review =>
        (review.comment || '').toLowerCase().includes(query) ||
        (review.title || '').toLowerCase().includes(query) ||
        (review.user?.name || '').toLowerCase().includes(query) ||
        (review.user?.first_name || '').toLowerCase().includes(query) ||
        (review.user?.last_name || '').toLowerCase().includes(query)
      );
    }

    setFilteredReviews(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      rating: 'all',
      response_status: 'all'
    });
    setSearchQuery('');
  };

  const handleReplyToReview = async (reviewId) => {
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      // Use the new API endpoint to reply to review
      const response = await alistProsService.replyToReview(reviewId, { response: replyText });
      
      // Update local state with the response data
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, professional_response: replyText, response_date: new Date().toISOString() }
          : review
      ));
      
      setReplyText('');
      setSelectedReview(null);
      
      // Show success message
      console.log('✅ Reply sent successfully:', response.data);
      
    } catch (err) {
      console.error('❌ Error replying to review:', err);
      const errorMessage = err.response?.data?.detail || 
        (isArabic ? 'فشل في إرسال الرد' : 'Failed to send reply');
      alert(errorMessage);
    } finally {
      setIsReplying(false);
    }
  };

  // Generate rating stars
  const renderStars = (rating, size = 'text-base') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= rating ? (
            <FaStar className={`text-yellow-400 ${size}`} />
          ) : (
            <FaRegStar className={`text-gray-300 ${size}`} />
          )}
        </span>
      );
    }
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const getReviewStats = () => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
      : 0;
    
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => 
      reviews.filter(review => review.rating === rating).length
    );

    const respondedCount = reviews.filter(review => review.professional_response).length;
    const responseRate = totalReviews > 0 ? ((respondedCount / totalReviews) * 100).toFixed(1) : 0;

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      respondedCount,
      responseRate
    };
  };

  const stats = getReviewStats();

  // Review Card Component
  const ReviewCard = ({ review }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
            <FaUser className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {review.user?.name || `${review.user?.first_name} ${review.user?.last_name}` || 'Anonymous User'}
            </h3>
            <p className="text-sm text-gray-600">
              {review.service_category?.name || 'Service Review'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {renderStars(review.rating, 'text-sm')}
          <span className="text-sm font-medium text-gray-700">({review.rating})</span>
        </div>
      </div>

      <div className="mb-4">
        {review.title && (
          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
        )}
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {review.professional_response && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex items-center mb-2">
            <FaReply className="text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">
              {isArabic ? 'ردك' : 'Your Response'}
            </span>
          </div>
          <p className="text-blue-800">{review.professional_response}</p>
          {review.response_date && (
            <p className="text-sm text-blue-600 mt-2">
              {formatDate(review.response_date)}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1 h-3 w-3" />
            {formatDate(review.created_at)}
          </div>
          {review.helpful_count > 0 && (
            <div className="flex items-center">
              <FaThumbsUp className="mr-1 h-3 w-3" />
              {review.helpful_count}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedReview(review)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title={isArabic ? 'عرض التفاصيل' : 'View details'}
          >
            <FaEye />
          </button>
          {!review.professional_response && (
            <button
              onClick={() => {
                setSelectedReview(review);
                setReplyText('');
              }}
              className="text-green-600 hover:text-green-800 p-1"
              title={isArabic ? 'رد على المراجعة' : 'Reply to review'}
            >
              <FaReply />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل المراجعات...' : 'Loading reviews...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaExclamationCircle className="text-red-600 text-4xl mb-4" />
        <p className="text-gray-800 font-medium mb-2">
          {isArabic ? 'خطأ في تحميل المراجعات' : 'Error Loading Reviews'}
        </p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchProfessionalReviews}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isArabic ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'إدارة المراجعات | A-List Home Pros' : 'Manage Reviews | A-List Home Pros'}</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {isArabic ? 'إدارة المراجعات' : 'Manage Reviews'}
          </h1>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`p-2 rounded-lg transition-colors ${
                isFilterVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder={isArabic ? 'البحث في المراجعات...' : 'Search reviews...'}
                className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">{isArabic ? 'إجمالي المراجعات' : 'Total Reviews'}</p>
                <p className="text-3xl font-bold">{stats.totalReviews}</p>
              </div>
              <FaStar className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">{isArabic ? 'متوسط التقييم' : 'Average Rating'}</p>
                <p className="text-3xl font-bold">{stats.averageRating}</p>
              </div>
              <div className="flex">
                {renderStars(Math.round(stats.averageRating), 'text-yellow-200')}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">{isArabic ? 'تم الرد عليها' : 'Responded'}</p>
                <p className="text-3xl font-bold">{stats.respondedCount}</p>
              </div>
              <FaReply className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">{isArabic ? 'معدل الاستجابة' : 'Response Rate'}</p>
                <p className="text-3xl font-bold">{stats.responseRate}%</p>
              </div>
              <FaChartBar className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {isFilterVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{isArabic ? 'فلترة المراجعات' : 'Filter Reviews'}</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isArabic ? 'إعادة تعيين' : 'Reset Filters'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'التقييم' : 'Rating'}
                  </label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={activeFilters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                  >
                    <option value="all">{isArabic ? 'جميع التقييمات' : 'All Ratings'}</option>
                    <option value="5">5 {isArabic ? 'نجوم' : 'Stars'}</option>
                    <option value="4">4 {isArabic ? 'نجوم' : 'Stars'}</option>
                    <option value="3">3 {isArabic ? 'نجوم' : 'Stars'}</option>
                    <option value="2">2 {isArabic ? 'نجوم' : 'Stars'}</option>
                    <option value="1">1 {isArabic ? 'نجمة' : 'Star'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'حالة الرد' : 'Response Status'}
                  </label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={activeFilters.response_status}
                    onChange={(e) => handleFilterChange('response_status', e.target.value)}
                  >
                    <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
                    <option value="responded">{isArabic ? 'تم الرد عليها' : 'Responded'}</option>
                    <option value="not_responded">{isArabic ? 'لم يتم الرد' : 'Not Responded'}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews List */}
        <div>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <FaStar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isArabic ? 'لا توجد مراجعات' : 'No Reviews Yet'}
              </h3>
              <p className="text-gray-500">
                {isArabic 
                  ? 'لم تحصل على أي مراجعات بعد. تقديم خدمات ممتازة سيساعدك في الحصول على المراجعات الأولى!'
                  : "You haven't received any reviews yet. Providing excellent service will help you get your first reviews!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Details/Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                {selectedReview.professional_response 
                  ? (isArabic ? 'تفاصيل المراجعة' : 'Review Details')
                  : (isArabic ? 'الرد على المراجعة' : 'Reply to Review')
                }
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Review Details */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'العميل' : 'Client'}
                </label>
                <div className="flex items-center mt-1">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <FaUser className="text-gray-600 text-sm" />
                  </div>
                  <span className="text-gray-900">
                    {selectedReview.user?.name || `${selectedReview.user?.first_name} ${selectedReview.user?.last_name}` || 'Anonymous User'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'التقييم' : 'Rating'}
                </label>
                <div className="flex items-center mt-1">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2 text-gray-600">({selectedReview.rating}/5)</span>
                </div>
              </div>

              {selectedReview.title && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {isArabic ? 'العنوان' : 'Title'}
                  </label>
                  <p className="text-gray-900 mt-1">{selectedReview.title}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'المراجعة' : 'Review'}
                </label>
                <p className="text-gray-900 mt-1 leading-relaxed">{selectedReview.comment}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'تاريخ المراجعة' : 'Review Date'}
                </label>
                <p className="text-gray-900 mt-1">{formatDate(selectedReview.created_at)}</p>
              </div>

              {/* Reply Section */}
              {!selectedReview.professional_response ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {isArabic ? 'ردك' : 'Your Response'}
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isArabic ? 'اكتب ردك هنا...' : 'Write your response here...'}
                    className="w-full border rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {isArabic ? 'ردك' : 'Your Response'}
                  </label>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-1">
                    <p className="text-blue-800">{selectedReview.professional_response}</p>
                    {selectedReview.response_date && (
                      <p className="text-sm text-blue-600 mt-2">
                        {formatDate(selectedReview.response_date)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedReview(null)}
                className="flex-1 bg-gray-600 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
              
              {!selectedReview.professional_response && (
                <button
                  onClick={() => handleReplyToReview(selectedReview.id)}
                  disabled={!replyText.trim() || isReplying}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReplying ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      {isArabic ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <FaReply className="inline mr-2" />
                      {isArabic ? 'إرسال الرد' : 'Send Reply'}
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ProReviewsPage; 