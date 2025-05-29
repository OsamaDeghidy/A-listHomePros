import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { proService } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import getLocalizedData from '../../utils/mockData';

const FeaturedPros = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedPros = async () => {
      try {
        setLoading(true);
        // استخدام proService للحصول على المحترفين المميزين
        const response = await proService.getFeaturedPros(4);
        
        console.log('Featured Pros API Response:', response.data);
        
        if (response.data.results && response.data.results.length > 0) {
          setProfessionals(response.data.results);
        } else if (response.data && Array.isArray(response.data)) {
          setProfessionals(response.data);
        } else {
          // If no results or unexpected format, throw error to use fallback data
          throw new Error('No featured professionals found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured professionals:', err);
        setError(isArabic ? 'فشل في تحميل المحترفين المميزين' : 'Failed to load featured professionals');
        setLoading(false);
        
        // استخدام البيانات الاحتياطية المحلية في حالة فشل API
        const mockData = getLocalizedData(isArabic);
        setProfessionals(mockData.featuredPros);
      }
    };

    fetchFeaturedPros();
  }, [isArabic]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center items-center h-72">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{isArabic ? 'جاري تحميل المحترفين المميزين...' : 'Loading featured professionals...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && professionals.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 relative inline-block">
            {isArabic ? 'المحترفون المميزون' : 'Featured Professionals'}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-full"></span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {isArabic 
              ? 'تعرف على مقدمي الخدمات الحاصلين على أعلى التقييمات والذين يقدمون باستمرار جودة استثنائية ورضا العملاء'
              : 'Meet our top-rated service providers who consistently deliver exceptional quality and customer satisfaction'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {professionals.map((pro) => (
            <div 
              key={pro.id} 
              className="cursor-pointer"
              onClick={() => {
                if (isAuthenticated) {
                  navigate(`/pros/${pro.id}`);
                } else {
                  navigate(`/login?redirect=/pros/${pro.id}`);
                }
              }}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:scale-102">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={pro.profile_image || `https://ui-avatars.com/api/?name=${pro.user?.first_name || 'A'}+${pro.user?.last_name || 'Pro'}&background=0D8ABC&color=fff`} 
                    alt={`${pro.user?.first_name || ''} ${pro.user?.last_name || ''}`} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    {isArabic ? 'مميز' : 'Featured'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {pro.user?.first_name || ''} {pro.user?.last_name || ''}
                    {pro.business_name && <span className="block text-sm text-gray-600 mt-1">{pro.business_name}</span>}
                  </h3>
                  
                  <div className="mb-3 flex items-center">
                    <div className="flex mr-2 rtl:ml-2 rtl:mr-0">
                      {renderStars(pro.rating || 0)}
                    </div>
                    <span className="text-gray-600 text-sm">
                      {pro.rating || 0} ({pro.reviews_count || 0} {isArabic ? 'تقييم' : 'reviews'})
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mb-3">
                    <FaMapMarkerAlt className="mr-1 rtl:ml-1 rtl:mr-0 text-blue-500" />
                    <span className="text-sm">{pro.location || (isArabic ? 'الموقع غير محدد' : 'Location not specified')}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {pro.business_description || pro.bio || (isArabic ? 'لا يوجد وصف متاح' : 'No description available')}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(pro.service_categories || []).slice(0, 3).map((category, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        {typeof category === 'object' ? category.name : category}
                      </span>
                    ))}
                    {(pro.service_categories || []).length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        +{pro.service_categories.length - 3} {isArabic ? 'المزيد' : 'more'}
                      </span>
                    )}
                  </div>
                  
                  <div 
                    className="flex justify-between items-center pt-3 border-t border-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAuthenticated) {
                        navigate(`/pros/${pro.id}`);
                      } else {
                        navigate(`/login?redirect=/pros/${pro.id}`);
                      }
                    }}
                  >
                    <span className="text-blue-600 font-medium">
                      {isArabic ? 'عرض الملف الشخصي' : 'View Profile'}
                    </span>
                    <FaArrowRight className="text-blue-600 rtl:rotate-180" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/search" 
            className="inline-flex items-center justify-center border border-blue-600 bg-white text-blue-600 font-medium px-6 py-3 rounded-md hover:bg-blue-50 transition duration-300 shadow-sm hover:shadow"
          >
            {isArabic ? 'عرض جميع المحترفين' : 'View All Professionals'}
            <FaArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPros;