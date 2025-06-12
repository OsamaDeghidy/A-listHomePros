import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaTools, FaBolt, FaBroom, FaPaintRoller, FaHammer, FaWrench, FaSnowflake, FaShower, FaTree, FaCouch } from 'react-icons/fa';
import { serviceService } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';

const PopularServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  
  // Helper function to get an icon based on service name
  const getServiceIcon = (name) => {
    const normalizedName = name?.toLowerCase() || '';
    
    if (normalizedName.includes('plumb')) return <FaWrench />;
    if (normalizedName.includes('electric')) return <FaBolt />;
    if (normalizedName.includes('clean')) return <FaBroom />;
    if (normalizedName.includes('paint')) return <FaPaintRoller />;
    if (normalizedName.includes('carpent')) return <FaHammer />;
    if (normalizedName.includes('repair')) return <FaTools />;
    if (normalizedName.includes('air') || normalizedName.includes('ac')) return <FaSnowflake />;
    if (normalizedName.includes('bath') || normalizedName.includes('plumb')) return <FaShower />;
    if (normalizedName.includes('garden') || normalizedName.includes('landscap')) return <FaTree />;
    if (normalizedName.includes('furniture') || normalizedName.includes('moving')) return <FaCouch />;
    
    // Default icon
    return <FaTools />;
  };

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // استخدام getPopularServices بدلاً من getCategories
        const response = await serviceService.getPopularServices();
        
        console.log('Popular Services API Response:', response.data);
        
        if (response.data?.results && response.data.results.length > 0) {
          // تحديث أسماء الخدمات لتتوافق مع اللغة المختارة
          const updatedServices = response.data.results.map(service => ({
            ...service,
            name: isArabic ? getArabicServiceName(service.name || service.id) : service.name
          }));
          setServices(updatedServices);
        } else if (response.data && Array.isArray(response.data)) {
          const updatedServices = response.data.map(service => ({
            ...service,
            name: isArabic ? getArabicServiceName(service.name || service.id) : service.name
          }));
          setServices(updatedServices);
        } else {
          // استخدام البيانات الاحتياطية
          setServices(getFallbackServices());
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching popular services:', err);
        setError(isArabic ? 'فشل في تحميل الخدمات الشائعة' : 'Failed to load popular services');
        setServices(getFallbackServices());
        setLoading(false);
      }
    };

    fetchPopularServices();
  }, [isArabic]);

  // دالة للحصول على الاسم العربي للخدمة
  const getArabicServiceName = (englishName) => {
    const translations = {
      'plumbing': 'سباكة',
      'electrical': 'كهرباء',
      'carpentry': 'نجارة',
      'painting': 'طلاء',
      'cleaning': 'تنظيف',
      'house_cleaning': 'تنظيف منازل',
      'furniture_moving': 'نقل أثاث',
      'air_conditioning': 'تكييف',
      'metalwork': 'أعمال معدنية',
      'landscaping': 'تنسيق حدائق',
      'gardening': 'أعمال حدائق',
      'flooring': 'أرضيات',
      'roofing': 'أعمال أسطح',
      'handyman': 'أعمال صيانة عامة',
      'appliance_repair': 'إصلاح أجهزة',
      'moving_services': 'خدمات نقل'
    };
    return translations[englishName.toLowerCase()] || englishName;
  };

  // البيانات الاحتياطية
  const getFallbackServices = () => [
          {
      id: 'plumbing',
      name: isArabic ? 'سباكة' : 'Plumbing',
            icon: '🔧',
      description: isArabic ? 'خدمات سباكة احترافية لمنزلك' : 'Professional plumbing services for your home',
            service_count: 24
          },
          {
      id: 'electrical',
      name: isArabic ? 'كهرباء' : 'Electrical',
            icon: '⚡',
      description: isArabic ? 'إصلاح وتركيب كهربائي متخصص' : 'Expert electrical repair and installation',
            service_count: 19
          },
          {
      id: 'cleaning',
      name: isArabic ? 'تنظيف منازل' : 'House Cleaning',
            icon: '🧹',
      description: isArabic ? 'اجعل مساحتك نظيفة مع خدمات التنظيف لدينا' : 'Keep your space spotless with our cleaning services',
            service_count: 31
          },
          {
      id: 'carpentry',
      name: isArabic ? 'نجارة' : 'Carpentry',
            icon: '🔨',
      description: isArabic ? 'حلول نجارة وأثاث مخصصة' : 'Custom woodworking and furniture solutions',
            service_count: 15
          },
          {
      id: 'painting',
      name: isArabic ? 'طلاء' : 'Painting',
            icon: '🖌️',
      description: isArabic ? 'خدمات طلاء احترافية لأي سطح' : 'Professional painting services for any surface',
            service_count: 22
          },
          {
      id: 'appliance_repair',
      name: isArabic ? 'إصلاح أجهزة' : 'Appliance Repair',
            icon: '🔌',
      description: isArabic ? 'إصلاح أجهزة المنزل بسرعة وكفاءة' : 'Fix your home appliances quickly and efficiently',
            service_count: 17
          },
          {
      id: 'landscaping',
      name: isArabic ? 'تنسيق حدائق' : 'Gardening',
            icon: '🌱',
      description: isArabic ? 'خدمات تنسيق وصيانة الحدائق' : 'Landscaping and garden maintenance services',
            service_count: 13
          },
          {
      id: 'moving_services',
      name: isArabic ? 'خدمات نقل' : 'Moving Services',
            icon: '📦',
      description: isArabic ? 'مساعدة احترافية لاحتياجات النقل' : 'Professional help for your moving needs',
            service_count: 11
          }
  ];

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 text-sm">{isArabic ? 'جاري تحميل الخدمات الشائعة...' : 'Loading popular services...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && services.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 relative inline-block">
            {isArabic ? 'الخدمات الشائعة' : 'Popular Services'}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-full"></span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm">
            {isArabic 
              ? 'اكتشف خدماتنا الأكثر طلبًا من المحترفين الحاصلين على أعلى التقييمات'
              : 'Discover our most requested services from top-rated professionals'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {services.map((service) => (
            <div 
              key={service.id} 
              onClick={() => navigate(`/search?service=${service.id}&name=${encodeURIComponent(service.name)}`)} 
              className="cursor-pointer"
            >
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300 transform hover:-translate-y-1 text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                    {service.icon ? (
                      <span>{service.icon}</span>
                    ) : (
                      getServiceIcon(service.name)
                    )}
                  </div>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{service.name}</h3>
                
                <p className="text-xs text-gray-500 mb-2">
                  {service.alistpro_count > 0 || service.service_count > 0 
                    ? isArabic 
                      ? `${service.alistpro_count || service.service_count}+ محترف` 
                      : `${service.alistpro_count || service.service_count}+ Pros`
                    : isArabic ? 'متاح' : 'Available'}
                </p>
                
                <div className="flex justify-center">
                  <span className="text-blue-600 text-xs font-medium flex items-center">
                    {isArabic ? 'عرض' : 'View'}
                    <FaArrowRight className={`ml-1 text-xs ${isArabic ? 'rotate-180' : ''}`} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            to="/services" 
            className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 shadow-sm hover:shadow-md text-sm"
          >
            {isArabic ? 'استكشاف جميع الخدمات' : 'Explore All Services'}
            <FaArrowRight className={`${isArabic ? 'mr-2 rotate-180' : 'ml-2'} text-xs`} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularServices; 