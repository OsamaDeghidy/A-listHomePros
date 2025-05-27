import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [serviceOptions, setServiceOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // جلب فئات الخدمات عند تحميل المكون
  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getCategories({ limit: 20 });
        setServiceOptions(response.data.results || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching service categories:', err);
        setLoading(false);
        
        // بيانات احتياطية في حالة فشل API
        setServiceOptions([
          { id: 'plumbing', name: isArabic ? 'سباكة' : 'Plumbing' },
          { id: 'electrical', name: isArabic ? 'كهرباء' : 'Electrical' },
          { id: 'carpentry', name: isArabic ? 'نجارة' : 'Carpentry' },
          { id: 'painting', name: isArabic ? 'طلاء' : 'Painting' },
          { id: 'cleaning', name: isArabic ? 'تنظيف' : 'Cleaning' },
          { id: 'furniture_moving', name: isArabic ? 'نقل أثاث' : 'Furniture Moving' },
          { id: 'air_conditioning', name: isArabic ? 'تكييف' : 'Air Conditioning' },
          { id: 'metalwork', name: isArabic ? 'أعمال معدنية' : 'Metalwork' }
        ]);
      }
    };

    fetchServiceCategories();
  }, [isArabic]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (service) params.append('service', service);
    navigate(`/search?${params.toString()}`);
  };

  // الخدمات الشائعة للعرض في المكون كاقتراحات
  const popularServices = serviceOptions.slice(0, 4);

  return (
    <section className="relative bg-gradient-to-r from-blue-700 to-blue-400 pt-16 pb-24 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 800 800">
          <path fill="#FFF" d="M400,100 C500,100 600,150 600,250 C600,350 550,400 500,450 C450,500 400,550 400,650 C400,750 450,800 400,800 C350,800 300,750 300,650 C300,550 250,500 200,450 C150,400 100,350 100,250 C100,150 200,100 300,100 L400,100 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center text-white mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {isArabic ? 'اعثر على محترفين موثوقين لمنزلك' : 'Find Trusted Professionals For Your Home'}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            {isArabic 
              ? 'تواصل مع مقدمي الخدمات ذوي التقييمات العالية لجميع احتياجات الصيانة والتحسين المنزلية'
              : 'Connect with top-rated service providers for all your home maintenance and improvement needs'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div className="md:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الموقع' : 'Location'}
                </label>
                <input
                  type="text"
                  id="location"
                  placeholder={isArabic ? 'أدخل مدينتك أو الرمز البريدي' : 'Enter your city or postal code'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الخدمة' : 'Service'}
                </label>
                <select
                  id="service"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              </div>
              <div className="md:col-span-1">
                <label className="invisible block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'بحث' : 'Search'}
                </label>
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-400 text-white font-medium rounded-lg hover:bg-blue-500 transition duration-300 flex items-center justify-center"
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
            <span className="text-sm text-gray-600">
              {isArabic ? 'شائع:' : 'Popular:'}
            </span>
            {popularServices.map((item) => (
              <button
                key={item.id}
                className="text-sm text-blue-400 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition duration-200"
                onClick={() => {
                  setService(item.id);
                  document.getElementById('service').focus();
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <div className="bg-blue-800 bg-opacity-30 text-white text-sm rounded-lg px-4 py-2 flex items-center">
            <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {isArabic 
              ? 'تم التحقق من جميع المحترفين والتأكد من جودة الخدمة'
              : 'All professionals are background-checked and verified for quality service'}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 