import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, 
  FaCalendarAlt, FaCertificate, FaTools, FaImages, 
  FaArrowLeft, FaShare, FaHeart, FaUserTie, FaAward, 
  FaDollarSign, FaTags, FaClock, FaShieldAlt, FaThumbsUp,
  FaEye, FaComment, FaChevronDown, FaChevronUp, FaMap,
  FaBookmark, FaQuoteLeft, FaPlay, FaDownload
} from 'react-icons/fa';
import { alistProsService } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import MapComponent from '../components/common/MapComponent';

const ProfessionalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  
  // State Management
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchProfessionalDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch professional profile
        const response = await alistProsService.getProfileDetail(id);
        console.log('Professional detail response:', response.data);
        setProfessional(response.data);

        // Fetch reviews in parallel
        const fetchPromises = [
          alistProsService.getReviews(id).catch(err => {
            console.log('Reviews API failed:', err);
            return { data: [] };
          }),
          alistProsService.getPortfolio({ alistpro: id }).catch(err => {
            console.log('Portfolio API failed:', err);
            return { data: [] };
          })
        ];

        const [reviewsResponse, portfolioResponse] = await Promise.all(fetchPromises);
        
        setReviews(reviewsResponse.data?.results || reviewsResponse.data || []);
        setPortfolio(portfolioResponse.data?.results || portfolioResponse.data || []);

      } catch (err) {
        console.error('Error fetching professional detail:', err);
        setError(err.response?.data?.detail || 'Failed to load professional details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfessionalDetail();
    }
  }, [id]);

  // Helper Functions
  const formatRating = (rating) => {
    if (rating === null || rating === undefined || rating === '' || isNaN(rating)) {
      return '0.0';
    }
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return language === 'ar' ? 'غير محدد' : 'Not specified';
    return `$${parseFloat(amount).toFixed(0)}`;
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    const safeRating = parseFloat(rating) || 0;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${size} ${i < Math.floor(safeRating) ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getProLocation = (pro) => {
    if (pro.latitude && pro.longitude) {
      return [parseFloat(pro.latitude), parseFloat(pro.longitude)];
    }
    
    if (pro.address?.latitude && pro.address?.longitude) {
      return [parseFloat(pro.address.latitude), parseFloat(pro.address.longitude)];
    }
    
    return [30.0444, 31.2357];
  };

  const getFullAddress = (pro) => {
    if (pro.address?.full_address) {
      return pro.address.full_address;
    }
    
    if (pro.address) {
      const addr = pro.address;
      const parts = [addr.street_address, addr.city, addr.state, addr.zip_code].filter(Boolean);
      return parts.join(', ');
    }
    
    return pro.location?.address || pro.location || language === 'ar' ? 'العنوان غير محدد' : 'Address not specified';
  };

  const hasRealLocation = (pro) => {
    return (pro.latitude && pro.longitude) || (pro.address?.latitude && pro.address?.longitude);
  };

  const getRoleInfo = (role) => {
    const roleData = {
      'contractor': {
        name: language === 'ar' ? 'مقاول' : 'Contractor',
        color: 'bg-blue-100 text-blue-800',
        icon: '🏗️'
      },
      'specialist': {
        name: language === 'ar' ? 'متخصص' : 'Specialist',
        color: 'bg-green-100 text-green-800',
        icon: '⚡'
      },
      'crew': {
        name: language === 'ar' ? 'طاقم عمل' : 'Crew Member',
        color: 'bg-purple-100 text-purple-800',
        icon: '👥'
      },
      'professional': {
        name: language === 'ar' ? 'محترف' : 'Professional',
        color: 'bg-gray-100 text-gray-800',
        icon: '⭐'
      }
    };
    
    return roleData[role] || roleData['professional'];
  };

  const getSuccessRate = (pro) => {
    if (!pro.total_jobs || pro.total_jobs === 0) return 0;
    return Math.round((pro.jobs_completed / pro.total_jobs) * 100);
  };

  const tabs = [
    { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview', icon: <FaUserTie /> },
    { id: 'reviews', label: language === 'ar' ? 'التقييمات' : 'Reviews', icon: <FaStar /> },
    { id: 'portfolio', label: language === 'ar' ? 'معرض الأعمال' : 'Portfolio', icon: <FaImages /> },
    { id: 'availability', label: language === 'ar' ? 'المواعيد المتاحة' : 'Availability', icon: <FaCalendarAlt /> }
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">
          {language === 'ar' ? 'جاري تحميل بيانات المحترف...' : 'Loading professional details...'}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {language === 'ar' ? 'يرجى الانتظار قليلاً' : 'Please wait a moment'}
        </p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <FaAward className="text-6xl mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {language === 'ar' ? 'العودة للبحث' : 'Back to Search'}
          </button>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-gray-400 mb-4">
            <FaUserTie className="text-6xl mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {language === 'ar' ? 'المحترف غير موجود' : 'Professional Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'ar' ? 'لم يتم العثور على المحترف المطلوب' : 'The requested professional could not be found'}
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {language === 'ar' ? 'العودة للبحث' : 'Back to Search'}
          </button>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(professional.user?.role || professional.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      <div className="relative h-80 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        {professional.cover_image && (
          <img
            src={professional.cover_image}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-6 left-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <FaArrowLeft className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {language === 'ar' ? 'العودة' : 'Back'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex space-x-3">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-3 rounded-full transition-colors ${
              isBookmarked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <FaHeart />
          </button>
          <button className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
            <FaShare />
          </button>
        </div>

        {/* Professional Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end mb-4 lg:mb-0">
              <img
                src={professional.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.business_name || 'Pro')}&background=0D8ABC&color=fff&size=150`}
                alt={professional.business_name || professional.user?.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mr-6"
              />
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">
                  {professional.business_name || professional.user?.name || professional.name}
                </h1>
                <p className="text-xl opacity-90 mb-3">
                  {professional.profession || professional.service_categories?.[0]?.name || roleInfo.name}
                </p>
                
                {/* Rating and Badges */}
                <div className="flex items-center flex-wrap gap-3">
                  <div className="flex items-center bg-yellow-500 px-3 py-1 rounded-full">
                    {renderStars(professional.average_rating || professional.rating, 'w-4 h-4 text-white')}
                    <span className="ml-2 text-white font-semibold">
                      {formatRating(professional.average_rating || professional.rating)}
                    </span>
                  </div>
                  
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${roleInfo.color}`}>
                    <span className="mr-1">{roleInfo.icon}</span>
                    {roleInfo.name}
                  </span>
                  
                  {professional.is_verified && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-500 text-white">
                      <FaShieldAlt className="mr-1" />
                      {language === 'ar' ? 'موثق' : 'Verified'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Primary Action Button */}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  navigate(`/booking/${professional.id}`);
                } else {
                  navigate(`/login?redirect=/booking/${professional.id}`);
                }
              }}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              {language === 'ar' ? 'احجز الآن' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {professional.years_of_experience || 0}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'سنوات خبرة' : 'Years Exp.'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {professional.jobs_completed || professional.total_jobs || 0}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'مشاريع' : 'Projects'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getSuccessRate(professional)}%
              </div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'نجاح' : 'Success'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(professional.hourly_rate)}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'بالساعة' : 'Per Hour'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {professional.response_time_hours || 24}h
              </div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'استجابة' : 'Response'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      {language === 'ar' ? 'نبذة عن المحترف' : 'About Professional'}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className={`text-gray-700 leading-relaxed ${!showFullDescription ? 'line-clamp-4' : ''}`}>
                        {professional.business_description || professional.bio || professional.description || 
                         (language === 'ar' ? 'لا يوجد وصف متاح للمحترف' : 'No description available for this professional')}
                      </p>
                      {(professional.business_description || professional.bio)?.length > 300 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-3 text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          {showFullDescription ? (
                            <>
                              {language === 'ar' ? 'عرض أقل' : 'Show less'}
                              <FaChevronUp className="ml-1" />
                            </>
                          ) : (
                            <>
                              {language === 'ar' ? 'عرض المزيد' : 'Show more'}
                              <FaChevronDown className="ml-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Services Section */}
                  {professional.service_categories && professional.service_categories.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        {language === 'ar' ? 'الخدمات المقدمة' : 'Services Offered'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {professional.service_categories.map(category => (
                          <div 
                            key={category.id} 
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center">
                              <FaTags className="text-blue-500 mr-3" />
                              <div>
                                <h4 className="font-medium">{category.name}</h4>
                                {category.description && (
                                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications & Licenses */}
                  {(professional.license_number || professional.certifications || professional.insurance_info) && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        {language === 'ar' ? 'الشهادات والتراخيص' : 'Certifications & Licenses'}
                      </h3>
                      <div className="space-y-4">
                        {professional.license_number && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <FaCertificate className="text-green-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-green-800">
                                  {language === 'ar' ? 'رقم الترخيص' : 'License Number'}
                                </h4>
                                <p className="text-green-700">{professional.license_number}</p>
                                {professional.license_type && (
                                  <p className="text-sm text-green-600 mt-1">{professional.license_type}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {professional.insurance_info && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <FaShieldAlt className="text-blue-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-blue-800">
                                  {language === 'ar' ? 'معلومات التأمين' : 'Insurance Information'}
                                </h4>
                                <p className="text-blue-700">{professional.insurance_info}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {professional.certifications && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <FaAward className="text-purple-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-purple-800">
                                  {language === 'ar' ? 'الشهادات' : 'Certifications'}
                                </h4>
                                <p className="text-purple-700">{professional.certifications}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
                    </h3>
                    <div className="space-y-4">
                      {professional.user?.email && (
                        <div className="flex items-center">
                          <FaEnvelope className="text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 break-all">{professional.user.email}</span>
                        </div>
                      )}
                      
                      {professional.user?.phone_number && (
                        <div className="flex items-center">
                          <FaPhone className="text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{professional.user.phone_number}</span>
                        </div>
                      )}
                      
                      {professional.website && (
                        <div className="flex items-center">
                          <FaGlobe className="text-gray-400 mr-3 flex-shrink-0" />
                          <a 
                            href={professional.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location & Service Area */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'ar' ? 'الموقع ومنطقة الخدمة' : 'Location & Service Area'}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700 text-sm">{getFullAddress(professional)}</p>
                          {professional.service_radius && (
                            <p className="text-sm text-gray-500 mt-1">
                              {language === 'ar' ? 'نطاق الخدمة: ' : 'Service radius: '}
                              {professional.service_radius} {language === 'ar' ? 'كم' : 'km'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Mini Map */}
                      {hasRealLocation(professional) && (
                        <div className="h-32 rounded-lg overflow-hidden border">
                          <MapComponent
                            center={getProLocation(professional)}
                            zoom={13}
                            height="100%"
                            markers={[{
                              id: professional.id,
                              position: getProLocation(professional),
                              popupContent: `
                                <div class="font-medium">${professional.business_name || professional.user?.name}</div>
                                <div class="text-sm text-gray-500">${getFullAddress(professional)}</div>
                              `
                            }]}
                            showPopups={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Stats */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'ar' ? 'إحصائيات مهنية' : 'Professional Stats'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {language === 'ar' ? 'معدل الاستجابة:' : 'Response Time:'}
                        </span>
                        <span className="font-medium">
                          {professional.response_time_hours || 24} {language === 'ar' ? 'ساعة' : 'hours'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {language === 'ar' ? 'تاريخ الانضمام:' : 'Member Since:'}
                        </span>
                        <span className="font-medium">
                          {new Date(professional.created_at || professional.user?.date_joined).getFullYear()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {language === 'ar' ? 'معدل النجاح:' : 'Success Rate:'}
                        </span>
                        <span className="font-medium text-green-600">
                          {getSuccessRate(professional)}%
                        </span>
                      </div>
                      
                      {professional.is_verified && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {language === 'ar' ? 'الحالة:' : 'Status:'}
                          </span>
                          <span className="font-medium text-green-600 flex items-center">
                            <FaShieldAlt className="mr-1" />
                            {language === 'ar' ? 'موثق' : 'Verified'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {language === 'ar' ? 'تقييمات العملاء' : 'Customer Reviews'}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {renderStars(professional.average_rating || professional.rating, 'w-5 h-5')}
                      <span className="ml-2 text-lg font-semibold">
                        {formatRating(professional.average_rating || professional.rating)}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      ({reviews.length} {language === 'ar' ? 'تقييم' : 'reviews'})
                    </span>
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, index) => (
                      <motion.div
                        key={review.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <img
                              src={review.client?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.client?.name || 'Client')}&background=random`}
                              alt={review.client?.name}
                              className="w-12 h-12 rounded-full mr-4"
                            />
                            <div>
                              <h4 className="font-medium">{review.client?.name || 'Anonymous Client'}</h4>
                              <div className="flex items-center mt-1">
                                {renderStars(review.rating, 'w-4 h-4')}
                                <span className="ml-2 text-sm text-gray-600">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <FaQuoteLeft className="text-gray-300 text-xl" />
                        </div>
                        
                        {review.title && (
                          <h5 className="font-medium mb-2">{review.title}</h5>
                        )}
                        
                        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                        
                        {review.service_category && (
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {review.service_category.name}
                          </span>
                        )}
                        
                        {review.professional_response && (
                          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <h6 className="font-medium text-blue-800 mb-2">
                              {language === 'ar' ? 'رد المحترف:' : 'Professional Response:'}
                            </h6>
                            <p className="text-blue-700">{review.professional_response}</p>
                            <p className="text-xs text-blue-600 mt-2">
                              {new Date(review.response_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {reviews.length > 3 && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="px-6 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          {showAllReviews ? 
                            (language === 'ar' ? 'عرض أقل' : 'Show Less') : 
                            (language === 'ar' ? `عرض جميع التقييمات (${reviews.length})` : `Show All Reviews (${reviews.length})`)
                          }
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaStar className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {language === 'ar' ? 'لا توجد تقييمات بعد' : 'No Reviews Yet'}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'ar' ? 'كن أول من يقيم هذا المحترف' : 'Be the first to review this professional'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {language === 'ar' ? 'معرض الأعمال' : 'Portfolio'}
                  </h2>
                  <span className="text-gray-600">
                    {portfolio.length} {language === 'ar' ? 'عنصر' : 'items'}
                  </span>
                </div>

                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                        onClick={() => setSelectedPortfolioItem(item)}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.image || 'https://via.placeholder.com/400x300?text=Portfolio+Item'}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <FaEye className="text-white text-2xl" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                          {item.completion_date && (
                            <p className="text-xs text-gray-500 mt-2">
                              {language === 'ar' ? 'مكتمل في: ' : 'Completed: '}
                              {new Date(item.completion_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaImages className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {language === 'ar' ? 'لا توجد أعمال في المعرض' : 'No Portfolio Items'}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'ar' ? 'لم يتم إضافة أعمال بعد' : 'No work samples have been added yet'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {language === 'ar' ? 'المواعيد المتاحة' : 'Availability'}
                </h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <FaClock className="text-yellow-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        {language === 'ar' ? 'معلومات الحجز' : 'Booking Information'}
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        {language === 'ar' 
                          ? 'يرجى التواصل مع المحترف لترتيب موعد مناسب' 
                          : 'Please contact the professional to arrange a suitable appointment'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8">
                  <FaCalendarAlt className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {language === 'ar' ? 'جدولة المواعيد' : 'Schedule Availability'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {language === 'ar' 
                      ? 'تواصل مع المحترف مباشرة لترتيب موعد يناسب احتياجاتك'
                      : 'Contact the professional directly to arrange an appointment that suits your needs'
                    }
                  </p>
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate(`/booking/${professional.id}`);
                      } else {
                        navigate(`/login?redirect=/booking/${professional.id}`);
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === 'ar' ? 'احجز موعد' : 'Book Appointment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Modal */}
      {selectedPortfolioItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{selectedPortfolioItem.title}</h3>
                <button
                  onClick={() => setSelectedPortfolioItem(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <img
                src={selectedPortfolioItem.image}
                alt={selectedPortfolioItem.title}
                className="w-full h-auto rounded-lg mb-4"
              />
              
              <p className="text-gray-700 leading-relaxed mb-4">
                {selectedPortfolioItem.description}
              </p>
              
              {selectedPortfolioItem.completion_date && (
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'تاريخ الإكمال: ' : 'Completion Date: '}
                  {new Date(selectedPortfolioItem.completion_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalDetailPage; 