import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { alistProsService, api } from '../services/api';
import { FaStar, FaRegStar, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaSpinner, FaExclamationCircle, FaFilter, FaSearch, FaTimesCircle, FaEdit, FaTrash, FaPlus, FaThumbsUp, FaFlag, FaCheck, FaEye } from 'react-icons/fa';

const ReviewsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // State management
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    rating: 'all',
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/reviews');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's reviews
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserReviews();
    }
  }, [isAuthenticated]);

  // Filter reviews when filters change
  useEffect(() => {
    filterReviews();
  }, [reviews, activeFilters, searchQuery]);

  const fetchUserReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll try to get all reviews and filter by user
      // In a real implementation, we'd want a dedicated endpoint like /reviews/my-reviews/
      let allReviews = [];
      
      try {
        // Try to get reviews without parameters (this might fail)
        const response = await alistProsService.getReviews();
        allReviews = response.data.results || response.data || [];
      } catch (err) {
        // If that fails, we'll start with an empty array
        console.warn('Could not fetch all reviews, starting with empty array:', err);
        allReviews = [];
      }
      
      // Filter reviews by current user
      const userReviews = allReviews.filter(review => 
        review.user?.id === currentUser?.id || review.user === currentUser?.id
      );

      // Enhance reviews with professional details
      const enhancedReviews = await Promise.all(
        userReviews.map(async (review) => {
          if (review.alistpro) {
            try {
              const alistproId = typeof review.alistpro === 'object' 
                ? review.alistpro.id || review.alistpro_id
                : review.alistpro;
                
              if (alistproId) {
                const proRes = await alistProsService.getProfileDetail(alistproId);
                return {
                  ...review,
                  professional: proRes.data
                };
              }
            } catch (err) {
              console.error('Error fetching professional details:', err);
              return review;
            }
          }
          return review;
        })
      );

      setReviews(enhancedReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(isArabic ? 'فشل في تحميل التقييمات' : 'Failed to load reviews');
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

    // Filter by status (if the review has been responded to, etc.)
    if (activeFilters.status !== 'all') {
      // This would depend on what status fields exist in the review model
      // For now, we'll just keep all reviews
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        (review.professional?.business_name || '').toLowerCase().includes(query) ||
        (review.comment || '').toLowerCase().includes(query) ||
        (review.title || '').toLowerCase().includes(query)
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
      status: 'all'
    });
    setSearchQuery('');
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeleting(true);
    try {
      // This endpoint might need to be implemented in the backend
      // await api.delete(`/reviews/${reviewId}/`);
      
      // For now, remove from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setSelectedReview(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      alert(isArabic ? 'فشل في حذف التقييم' : 'Failed to delete review');
    } finally {
      setIsDeleting(false);
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

    return {
      totalReviews,
      averageRating,
      ratingDistribution
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
          {review.professional?.profile_image && (
            <img
              src={review.professional.profile_image}
              alt={review.professional.business_name}
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {review.professional?.business_name || 'Professional'}
            </h3>
            <p className="text-sm text-gray-600">
              {review.service_category?.name || 'Service'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {renderStars(review.rating, 'text-sm')}
          <span className="text-sm text-gray-600">({review.rating})</span>
        </div>
      </div>

      <div className="mb-4">
        {review.title && (
          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
        )}
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1 h-3 w-3" />
            {formatDate(review.created_at)}
          </div>
          {review.helpful_count > 0 && (
            <div className="flex items-center">
              <FaThumbsUp className="mr-1 h-3 w-3" />
              {review.helpful_count} {isArabic ? 'مفيد' : 'helpful'}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedReview(review)}
            className="text-blue-600 hover:text-blue-800"
            title={isArabic ? 'عرض التفاصيل' : 'View details'}
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleDeleteReview(review.id)}
            className="text-red-600 hover:text-red-800"
            title={isArabic ? 'حذف التقييم' : 'Delete review'}
            disabled={isDeleting}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaExclamationCircle className="text-red-600 text-4xl mb-4" />
        <p className="text-gray-800 font-medium mb-2">
          {isArabic ? 'خطأ في تحميل التقييمات' : 'Error Loading Reviews'}
        </p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchUserReviews}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isArabic ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    );
  }
  
  const ratingDistribution = stats.ratingDistribution;
  
  return (
    <>
      <Helmet>
        <title>{isArabic ? 'تقييماتي | A-List Home Pros' : 'My Reviews | A-List Home Pros'}</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {isArabic ? 'تقييماتي' : 'My Reviews'}
          </h1>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`p-2 rounded-lg transition-colors ${
                isFilterVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={isArabic ? 'فلترة التقييمات' : 'Filter reviews'}
            >
              <FaFilter />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder={isArabic ? 'البحث في التقييمات...' : 'Search reviews...'}
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
                  <FaTimesCircle />
                </button>
              )}
            </div>
            <Link
              to="/search"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              {isArabic ? 'حجز خدمة' : 'Book Service'}
            </Link>
                </div>
              </div>
              
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">{isArabic ? 'إجمالي التقييمات' : 'Total Reviews'}</p>
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
                <p className="text-green-100">{isArabic ? 'تقييمات 5 نجوم' : '5-Star Reviews'}</p>
                <p className="text-3xl font-bold">{stats.ratingDistribution[4]}</p>
              </div>
              <FaCheck className="h-8 w-8 text-green-200" />
                    </div>
                  </div>
                </div>
                
        {/* Filters */}
        {isFilterVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-4 border rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{isArabic ? 'فلترة التقييمات' : 'Filter Reviews'}</h3>
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
                  {isArabic ? 'الحالة' : 'Status'}
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={activeFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="responded">{isArabic ? 'تم الرد عليها' : 'Responded'}</option>
                  <option value="not_responded">{isArabic ? 'لم يتم الرد' : 'Not Responded'}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reviews List */}
        <div>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <FaStar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isArabic ? 'لا توجد تقييمات' : 'No Reviews Yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isArabic 
                  ? 'لم تكتب أي تقييمات بعد. احجز خدمة واكتب تقييمك الأول!'
                  : "You haven't written any reviews yet. Book a service and write your first review!"
                }
              </p>
              <Link
                to="/search"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                {isArabic ? 'حجز خدمة' : 'Book Service'}
              </Link>
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
                    
      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                {isArabic ? 'تفاصيل التقييم' : 'Review Details'}
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="h-5 w-5" />
              </button>
                    </div>
                    
            <div className="space-y-4">
              {selectedReview.professional && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {isArabic ? 'المحترف' : 'Professional'}
                      </label>
                  <div className="flex items-center mt-1">
                    <img
                      src={selectedReview.professional.profile_image || '/default-avatar.png'}
                      alt={selectedReview.professional.business_name}
                      className="h-10 w-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedReview.professional.business_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedReview.service_category?.name || 'Service'}
                      </p>
                    </div>
                    </div>
                </div>
              )}
              
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
                  {isArabic ? 'التعليق' : 'Comment'}
                </label>
                <p className="text-gray-900 mt-1 leading-relaxed">{selectedReview.comment}</p>
                      </div>
                      
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'تاريخ التقييم' : 'Review Date'}
                </label>
                <p className="text-gray-900 mt-1">{formatDate(selectedReview.created_at)}</p>
                        </div>
                        
              {selectedReview.helpful_count > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {isArabic ? 'مفيد' : 'Helpful'}
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedReview.helpful_count} {isArabic ? 'شخص وجده مفيد' : 'people found this helpful'}
                  </p>
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
              
              <button
                onClick={() => handleDeleteReview(selectedReview.id)}
                className="flex-1 bg-red-600 text-white text-center py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                <FaTrash className="inline mr-2" />
                {isDeleting ? (isArabic ? 'جاري الحذف...' : 'Deleting...') : (isArabic ? 'حذف' : 'Delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ReviewsPage; 