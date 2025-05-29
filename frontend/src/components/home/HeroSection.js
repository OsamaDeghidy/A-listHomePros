import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import './HeroSection.css'; // We'll add this CSS file for animations

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [serviceOptions, setServiceOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // جلب فئات الخدمات عند تحميل المكون
  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await serviceService.getCategories({ limit: 20 });
        
        console.log('Service Categories API Response:', response.data);
        
        if (response.data?.results && response.data.results.length > 0) {
          // تحديث أسماء الخدمات لتتوافق مع اللغة المختارة
          const updatedServices = response.data.results.map(service => ({
            ...service,
            name: isArabic ? getArabicServiceName(service.name || service.id) : service.name
          }));
          setServiceOptions(updatedServices);
        } else if (response.data && Array.isArray(response.data)) {
          const updatedServices = response.data.map(service => ({
            ...service,
            name: isArabic ? getArabicServiceName(service.name || service.id) : service.name
          }));
          setServiceOptions(updatedServices);
        } else {
          // استخدام البيانات الاحتياطية
          setServiceOptions(getFallbackServices());
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching service categories:', err);
        setError(isArabic ? 'خطأ في تحميل الخدمات' : 'Error loading services');
        setServiceOptions(getFallbackServices());
        setLoading(false);
      }
    };

    fetchServiceCategories();
  }, [isArabic]);

  // دالة للحصول على الاسم العربي للخدمة
  const getArabicServiceName = (englishName) => {
    const translations = {
      'plumbing': 'سباكة',
      'electrical': 'كهرباء',
      'carpentry': 'نجارة',
      'painting': 'طلاء',
      'cleaning': 'تنظيف',
      'furniture_moving': 'نقل أثاث',
      'air_conditioning': 'تكييف',
      'metalwork': 'أعمال معدنية',
      'landscaping': 'تنسيق حدائق',
      'flooring': 'أرضيات',
      'roofing': 'أعمال أسطح',
      'handyman': 'أعمال صيانة عامة'
    };
    return translations[englishName.toLowerCase()] || englishName;
  };

  // البيانات الاحتياطية
  const getFallbackServices = () => [
    { id: 'plumbing', name: isArabic ? 'سباكة' : 'Plumbing' },
    { id: 'electrical', name: isArabic ? 'كهرباء' : 'Electrical' },
    { id: 'carpentry', name: isArabic ? 'نجارة' : 'Carpentry' },
    { id: 'painting', name: isArabic ? 'طلاء' : 'Painting' },
    { id: 'cleaning', name: isArabic ? 'تنظيف' : 'Cleaning' },
    { id: 'furniture_moving', name: isArabic ? 'نقل أثاث' : 'Furniture Moving' },
    { id: 'air_conditioning', name: isArabic ? 'تكييف' : 'Air Conditioning' },
    { id: 'metalwork', name: isArabic ? 'أعمال معدنية' : 'Metalwork' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!service) {
      // Show validation error for service
      setError(isArabic ? 'الرجاء اختيار خدمة' : 'Please select a service');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Find the selected service name from options
    const selectedService = serviceOptions.find(option => option.id === service);
    const serviceName = selectedService ? selectedService.name : '';
    
    // Navigate to search results page with the selected service, service name, and location
    const params = new URLSearchParams();
    if (service) {
      params.append('service', service);
      params.append('name', serviceName);
    }
    if (location) params.append('location', location);
    
    navigate(`/search?${params.toString()}`);
  };

  // الخدمات الشائعة للعرض في المكون كاقتراحات
  const popularServices = serviceOptions.slice(0, 4);

  return (
    <section className="relative bg-gradient-to-r from-blue-700 to-blue-500 pt-16 pb-24 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 800 800">
          <path fill="#FFF" d="M400,100 C500,100 600,150 600,250 C600,350 550,400 500,450 C450,500 400,550 400,650 C400,750 450,800 400,800 C350,800 300,750 300,650 C300,550 250,500 200,450 C150,400 100,350 100,250 C100,150 200,100 300,100 L400,100 Z" />
        </svg>
      </div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-blue-300 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-float-delay"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-blue-100 rounded-full opacity-20 animate-float-slow"></div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center text-white mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {isArabic ? 'اعثر على محترفين موثوقين لمنزلك' : 'Find Trusted Professionals For Your Home'}
          </h1>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            {isArabic 
              ? 'تواصل مع مقدمي الخدمات ذوي التقييمات العالية لجميع احتياجات الصيانة والتحسين المنزلية'
              : 'Connect with top-rated service providers for all your home maintenance and improvement needs'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 max-w-4xl mx-auto transform hover:shadow-2xl transition-all duration-300">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div className="md:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الموقع' : 'Location'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="location"
                    placeholder={isArabic ? 'أدخل مدينتك أو الرمز البريدي' : 'Enter your city or postal code'}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الخدمة' : 'Service'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    id="service"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="">
                      {isArabic ? 'اختر خدمة' : 'Select a service'}
                    </option>
                    {serviceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="invisible block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'بحث' : 'Search'}
                </label>
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:translate-y-[-2px]"
                >
                  <svg className="w-5 h-5 mr-1 rtl:ml-1 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">
                    {isArabic ? 'بحث' : 'Search'}
                  </span>
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              {isArabic ? 'شائع:' : 'Popular:'}
            </span>
            {popularServices.map((item) => (
              <button
                key={item.id}
                className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition duration-200 border border-blue-100 shadow-sm hover:shadow"
                onClick={() => {
                  // Set the service in the dropdown
                  setService(item.id);
                  
                  // Option 1: Focus on the service dropdown
                  // document.getElementById('service').focus();
                  
                  // Option 2: Directly navigate to search page with this service
                  const params = new URLSearchParams();
                  params.append('service', item.id);
                  params.append('name', item.name);
                  if (location) params.append('location', location);
                  navigate(`/search?${params.toString()}`);
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <div className="bg-blue-800 bg-opacity-30 text-white text-sm rounded-lg px-6 py-3 flex items-center shadow-lg">
            <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">
              {isArabic 
                ? 'تم التحقق من جميع المحترفين والتأكد من جودة الخدمة'
                : 'All professionals are background-checked and verified for quality service'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 