import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaStar, 
  FaClock, 
  FaUser, 
  FaEnvelope, 
  FaPhone,
  FaFilter,
  FaSort,
  FaHeart,
  FaRegHeart,
  FaCertificate,
  FaShieldAlt,
  FaEye,
  FaTools,
  FaHome,
  FaPalette,
  FaPlug,
  FaWrench,
  FaTimes
} from 'react-icons/fa';
import { useLanguage } from '../hooks/useLanguage';
import { professionalService } from '../services/professionalService';

const ProfessionalsSearchPage = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minExperience: '',
    maxDistance: '',
    rating: '',
    priceRange: '',
    availability: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState([]);

  // تصنيفات الخدمات
  const serviceCategories = [
    { 
      id: 'plumbing', 
      name: isArabic ? 'السباكة' : 'Plumbing',
      icon: FaWrench,
      color: 'text-blue-600'
    },
    { 
      id: 'electrical', 
      name: isArabic ? 'الكهرباء' : 'Electrical',
      icon: FaPlug,
      color: 'text-yellow-600'
    },
    { 
      id: 'carpentry', 
      name: isArabic ? 'النجارة' : 'Carpentry',
      icon: FaTools,
      color: 'text-brown-600'
    },
    { 
      id: 'painting', 
      name: isArabic ? 'الطلاء' : 'Painting',
      icon: FaPalette,
      color: 'text-green-600'
    },
    { 
      id: 'cleaning', 
      name: isArabic ? 'التنظيف' : 'Cleaning',
      icon: FaHome,
      color: 'text-purple-600'
    }
  ];

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      
      // تحويل الفلاتر لتتوافق مع API
      const apiFilters = {
        search: searchQuery,
        category: filters.category,
        min_experience: filters.minExperience,
        min_rating: filters.rating,
        city: filters.location?.city,
        is_available: filters.availability === 'available' ? true : undefined,
        is_verified: true, // نعرض المحترفين المؤكدين فقط
        ordering: getOrderingValue(sortBy)
      };

      // معالجة نطاق السعر
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (min && min !== '100+') apiFilters.min_rate = parseInt(min);
        if (max && max !== '100+') apiFilters.max_rate = parseInt(max);
        if (filters.priceRange === '100+') apiFilters.min_rate = 100;
      }

      // معالجة المسافة
      if (filters.maxDistance) {
        apiFilters.radius = filters.maxDistance;
        // يمكن إضافة الإحداثيات من geolocation لاحقاً
      }

      // إزالة القيم الفارغة
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === undefined || apiFilters[key] === null || apiFilters[key] === '') {
          delete apiFilters[key];
        }
      });

      console.log('Fetching professionals with filters:', apiFilters);
      
      const response = await professionalService.advancedSearch(apiFilters);
      setProfessionals(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderingValue = (sortBy) => {
    switch (sortBy) {
      case 'rating': return '-average_rating';
      case 'experience': return '-years_of_experience';
      case 'price_low': return 'hourly_rate';
      case 'price_high': return '-hourly_rate';
      case 'distance': return 'distance'; // يتطلب إحداثيات
      default: return '-average_rating,-total_jobs';
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProfessionals();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minExperience: '',
      maxDistance: '',
      rating: '',
      priceRange: '',
      availability: ''
    });
    setSearchQuery('');
  };

  const toggleFavorite = (professionalId) => {
    setFavorites(prev => 
      prev.includes(professionalId)
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    );
  };

  const handleContactProfessional = (professional) => {
    // التوجه إلى صفحة التواصل أو فتح modal
    console.log('Contact professional:', professional);
  };

  const handleViewProfile = (professional) => {
    // التوجه إلى صفحة البروفايل المفصل
    window.open(`/professionals/${professional.user?.id || professional.id}`, '_blank');
  };

  const ProfessionalCard = ({ professional }) => {
    const isFavorite = favorites.includes(professional.id);
    const category = serviceCategories.find(cat => cat.id === professional.profession);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* صورة المحترف */}
        <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600">
          {professional.profile_image ? (
            <img
              src={professional.profile_image}
              alt={professional.user?.name || professional.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUser className="text-6xl text-white opacity-70" />
            </div>
          )}
          
          {/* زر المفضلة */}
          <button
            onClick={() => toggleFavorite(professional.id)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-white transition-colors"
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>

          {/* شارة التحقق */}
          {professional.is_verified && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <FaShieldAlt className="mr-1" />
              {isArabic ? 'موثق' : 'Verified'}
            </div>
          )}
        </div>

        {/* محتوى البطاقة */}
        <div className="p-6">
          {/* اسم المحترف ونوع الخدمة */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {professional.user?.name || professional.business_name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                {category && (
                  <>
                    <category.icon className={`mr-2 ${category.color}`} />
                    <span>{category.name}</span>
                  </>
                )}
                {!category && professional.profession && (
                  <span>{professional.profession}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-semibold">{professional.average_rating || 4.5}</span>
                <span className="text-gray-500 text-sm ml-1">
                  ({professional.total_jobs || 0})
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {professional.years_of_experience} {isArabic ? 'سنوات خبرة' : 'years exp'}
              </div>
            </div>
          </div>

          {/* الموقع */}
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
            <FaMapMarkerAlt className="mr-2 text-red-500" />
            <span className="text-sm">
              {professional.address ? 
                `${professional.address.city}, ${professional.address.state}` : 
                (isArabic ? 'غير محدد' : 'Location not specified')
              }
            </span>
            <span className="mx-2">•</span>
            <span className="text-sm">{professional.service_radius || 10} {isArabic ? 'كم' : 'km'}</span>
          </div>

          {/* الوصف */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {professional.bio || (isArabic ? 
              'محترف متخصص في تقديم خدمات عالية الجودة مع سنوات من الخبرة في المجال.' :
              'Professional specialist providing high-quality services with years of experience in the field.'
            )}
          </p>

          {/* التخصصات */}
          {professional.service_categories && professional.service_categories.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {professional.service_categories.slice(0, 3).map((spec, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {spec.name}
                  </span>
                ))}
                {professional.service_categories.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{professional.service_categories.length - 3} {isArabic ? 'المزيد' : 'more'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* التوفر والسعر */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaClock className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">
                {professional.is_available ? 
                  (isArabic ? 'متاح الآن' : 'Available now') :
                  (isArabic ? 'مشغول' : 'Busy')
                }
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                ${professional.hourly_rate || 50}/
                <span className="text-sm text-gray-500">
                  {isArabic ? 'ساعة' : 'hour'}
                </span>
              </div>
            </div>
          </div>

          {/* الشهادات والتراخيص */}
          {professional.license_number && (
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FaCertificate className="mr-2 text-yellow-500" />
                <span>{isArabic ? 'مرخص ومعتمد' : 'Licensed & Certified'}</span>
              </div>
            </div>
          )}

          {/* أزرار العمل */}
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => handleViewProfile(professional)}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <FaEye className="mr-2" />
              {isArabic ? 'عرض البروفايل' : 'View Profile'}
            </button>
            <button
              onClick={() => handleContactProfessional(professional)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaEnvelope className="mr-2" />
              {isArabic ? 'تواصل' : 'Contact'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isArabic ? 'البحث عن محترفين' : 'Find Professionals'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isArabic ? 
                  'اعثر على أفضل المحترفين المتخصصين في خدمات المنازل' :
                  'Find the best professionals specialized in home services'
                }
              </p>
            </div>

            {/* شريط البحث */}
            <div className="flex-1 max-w-lg lg:ml-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث عن محترف أو خدمة...' : 'Search for professional or service...'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* شريط الفلترة الجانبي */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isArabic ? 'تصفية النتائج' : 'Filter Results'}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {isArabic ? 'مسح الكل' : 'Clear All'}
                </button>
              </div>

              {/* تصنيف الخدمة */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'نوع الخدمة' : 'Service Category'}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isArabic ? 'جميع الخدمات' : 'All Services'}</option>
                  {serviceCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* سنوات الخبرة */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'سنوات الخبرة (الحد الأدنى)' : 'Experience Years (Min)'}
                </label>
                <select
                  value={filters.minExperience}
                  onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isArabic ? 'أي خبرة' : 'Any Experience'}</option>
                  <option value="1">{isArabic ? 'سنة واحدة+' : '1+ years'}</option>
                  <option value="3">{isArabic ? '3 سنوات+' : '3+ years'}</option>
                  <option value="5">{isArabic ? '5 سنوات+' : '5+ years'}</option>
                  <option value="10">{isArabic ? '10 سنوات+' : '10+ years'}</option>
                </select>
              </div>

              {/* المسافة */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'المسافة القصوى (كم)' : 'Max Distance (km)'}
                </label>
                <select
                  value={filters.maxDistance}
                  onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isArabic ? 'أي مسافة' : 'Any Distance'}</option>
                  <option value="5">5 {isArabic ? 'كم' : 'km'}</option>
                  <option value="10">10 {isArabic ? 'كم' : 'km'}</option>
                  <option value="25">25 {isArabic ? 'كم' : 'km'}</option>
                  <option value="50">50 {isArabic ? 'كم' : 'km'}</option>
                </select>
              </div>

              {/* التقييم */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التقييم الأدنى' : 'Minimum Rating'}
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isArabic ? 'أي تقييم' : 'Any Rating'}</option>
                  <option value="4">4+ ⭐</option>
                  <option value="4.5">4.5+ ⭐</option>
                  <option value="5">5 ⭐</option>
                </select>
              </div>

              {/* نطاق السعر */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'نطاق السعر ($/ساعة)' : 'Price Range ($/hour)'}
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isArabic ? 'أي سعر' : 'Any Price'}</option>
                  <option value="0-30">$0 - $30</option>
                  <option value="30-50">$30 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100+">$100+</option>
                </select>
              </div>

              {/* التوفر */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التوفر' : 'Availability'}
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isArabic ? 'أي وقت' : 'Anytime'}</option>
                  <option value="available">{isArabic ? 'متاح الآن' : 'Available Now'}</option>
                  <option value="today">{isArabic ? 'متاح اليوم' : 'Available Today'}</option>
                  <option value="week">{isArabic ? 'متاح هذا الأسبوع' : 'Available This Week'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* قائمة المحترفين */}
          <div className="flex-1">
            {/* شريط التحكم العلوي */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {loading ? (
                    isArabic ? 'جاري البحث...' : 'Searching...'
                  ) : (
                    `${professionals.length} ${isArabic ? 'محترف وجد' : 'professionals found'}`
                  )}
                </span>
              </div>

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">{isArabic ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
                  <option value="experience">{isArabic ? 'الأكثر خبرة' : 'Most Experienced'}</option>
                  <option value="price_low">{isArabic ? 'السعر: منخفض لمرتفع' : 'Price: Low to High'}</option>
                  <option value="price_high">{isArabic ? 'السعر: مرتفع لمنخفض' : 'Price: High to Low'}</option>
                  <option value="distance">{isArabic ? 'الأقرب' : 'Nearest'}</option>
                </select>
              </div>
            </div>

            {/* شبكة المحترفين */}
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-4"></div>
                      <div className="h-3 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : professionals.length > 0 ? (
              <motion.div
                layout
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {professionals.map((professional) => (
                  <ProfessionalCard key={professional.id} professional={professional} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <FaSearch className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'لم يتم العثور على محترفين' : 'No Professionals Found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 
                    'جرب تعديل معايير البحث أو الفلاتر' :
                    'Try adjusting your search criteria or filters'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalsSearchPage; 