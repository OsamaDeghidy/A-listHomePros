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
            name: isArabic ? getArabicServiceName(service.name || service.id) : service.name,
            // التأكد من وجود صورة صحيحة
            image_url: service.image_url || getServiceImage(service.name || service.id)
          }));
          setServices(updatedServices);
        } else if (response.data && Array.isArray(response.data)) {
          const updatedServices = response.data.map(service => ({
            ...service,
            name: isArabic ? getArabicServiceName(service.name || service.id) : service.name,
            image_url: service.image_url || getServiceImage(service.name || service.id)
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

  // دالة للحصول على صورة مناسبة للخدمة
  const getServiceImage = (serviceName) => {
    const imageMap = {
      'plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400305e979?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'house_cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'carpentry': 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'painting': 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'appliance_repair': 'https://images.unsplash.com/photo-1581092921461-39b9884e8331?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'landscaping': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'gardening': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'moving_services': 'https://images.unsplash.com/photo-1600518464441-7212cda107e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'furniture_moving': 'https://images.unsplash.com/photo-1600518464441-7212cda107e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    };
    return imageMap[serviceName.toLowerCase()] || 'https://images.unsplash.com/photo-1558618047-fd90bf9e5ee1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
  };

  // البيانات الاحتياطية
  const getFallbackServices = () => [
    {
      id: 'plumbing',
      name: isArabic ? 'سباكة' : 'Plumbing',
      icon: '🔧',
      description: isArabic ? 'خدمات سباكة احترافية لمنزلك' : 'Professional plumbing services for your home',
      image_url: getServiceImage('plumbing'),
      service_count: 24
    },
    {
      id: 'electrical',
      name: isArabic ? 'كهرباء' : 'Electrical',
      icon: '⚡',
      description: isArabic ? 'إصلاح وتركيب كهربائي متخصص' : 'Expert electrical repair and installation',
      image_url: getServiceImage('electrical'),
      service_count: 19
    },
    {
      id: 'cleaning',
      name: isArabic ? 'تنظيف منازل' : 'House Cleaning',
      icon: '🧹',
      description: isArabic ? 'اجعل مساحتك نظيفة مع خدمات التنظيف لدينا' : 'Keep your space spotless with our cleaning services',
      image_url: getServiceImage('cleaning'),
      service_count: 31
    },
    {
      id: 'carpentry',
      name: isArabic ? 'نجارة' : 'Carpentry',
      icon: '🔨',
      description: isArabic ? 'حلول نجارة وأثاث مخصصة' : 'Custom woodworking and furniture solutions',
      image_url: getServiceImage('carpentry'),
      service_count: 15
    },
    {
      id: 'painting',
      name: isArabic ? 'طلاء' : 'Painting',
      icon: '🖌️',
      description: isArabic ? 'خدمات طلاء احترافية لأي سطح' : 'Professional painting services for any surface',
      image_url: getServiceImage('painting'),
      service_count: 22
    },
    {
      id: 'appliance_repair',
      name: isArabic ? 'إصلاح أجهزة' : 'Appliance Repair',
      icon: '🔌',
      description: isArabic ? 'إصلاح أجهزة المنزل بسرعة وكفاءة' : 'Fix your home appliances quickly and efficiently',
      image_url: getServiceImage('appliance_repair'),
      service_count: 17
    },
    {
      id: 'landscaping',
      name: isArabic ? 'تنسيق حدائق' : 'Gardening',
      icon: '🌱',
      description: isArabic ? 'خدمات تنسيق وصيانة الحدائق' : 'Landscaping and garden maintenance services',
      image_url: getServiceImage('landscaping'),
      service_count: 13
    },
    {
      id: 'moving_services',
      name: isArabic ? 'خدمات نقل' : 'Moving Services',
      icon: '📦',
      description: isArabic ? 'مساعدة احترافية لاحتياجات النقل' : 'Professional help for your moving needs',
      image_url: getServiceImage('moving_services'),
      service_count: 11
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center items-center h-72">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{isArabic ? 'جاري تحميل الخدمات الشائعة...' : 'Loading popular services...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && services.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 relative inline-block">
            {isArabic ? 'الخدمات الشائعة' : 'Popular Services'}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-full"></span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {isArabic 
              ? 'اكتشف خدماتنا الأكثر طلبًا من المحترفين الحاصلين على أعلى التقييمات'
              : 'Discover our most requested services from top-rated professionals'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              onClick={() => navigate(`/service/${service.id}`)} 
              className="cursor-pointer"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:scale-102">
                <div className="h-40 relative overflow-hidden">
                  <img 
                    src={service.image_url || `https://via.placeholder.com/400x250?text=${service.name}`} 
                    alt={service.name} 
                    className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-2xl mr-2">
                      {service.icon || getServiceIcon(service.name)}
                    </span>
                    <span className="font-medium">
                      {service.alistpro_count > 0 || service.service_count > 0 
                        ? isArabic 
                          ? `${service.alistpro_count || service.service_count}+ محترف` 
                          : `${service.alistpro_count || service.service_count}+ Pros`
                        : isArabic ? 'متاح' : 'Available'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description || (isArabic ? 'استكشف خدمات ' + service.name : 'Explore ' + service.name + ' services')}</p>
                  
                  <div 
                    className="flex justify-between items-center pt-2 border-t border-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent click event
                      navigate(`/search?service=${service.id}&name=${encodeURIComponent(service.name)}`);
                    }}
                  >
                    <span className="text-blue-600 font-medium">
                      {isArabic ? '\u0639\u0631\u0636 \u0627\u0644\u062e\u062f\u0645\u0627\u062a' : 'View Services'}
                    </span>
                    <FaArrowRight className={`text-blue-600 ${isArabic ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/services" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
          >
            {isArabic ? 'استكشاف جميع الخدمات' : 'Explore All Services'}
            <FaArrowRight className={`${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularServices; 