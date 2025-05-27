import { useState, useEffect } from 'react';
import { alistProsService } from '../services/api';

export function useSearchProfessionals() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // تخزين معايير البحث والتصفية
  const [searchParams, setSearchParams] = useState({
    location: '',        // الموقع (المدينة أو الرمز البريدي)
    service: '',         // نوع الخدمة
    rating: 0,           // الحد الأدنى للتقييم (0-5)
    minPrice: null,      // الحد الأدنى للسعر
    maxPrice: null,      // الحد الأقصى للسعر
    availability: null,  // التاريخ المطلوب للتوفر
    limit: 10,           // عدد النتائج في الصفحة الواحدة
    page: 1              // رقم الصفحة
  });

  // وظيفة تنفيذ البحث
  const searchProfessionals = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // دمج معايير البحث الحالية مع المعايير الجديدة
      const newParams = { ...searchParams, ...params, page: params.page || currentPage };
      setSearchParams(newParams);
      
      // بعض أعمال التنظيف قبل الإرسال للـ API
      const apiParams = { ...newParams };
      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === null || apiParams[key] === '') {
          delete apiParams[key];
        }
      });
      
      // استدعاء واجهة API
      const response = await alistProsService.getProfiles(apiParams);
      
      // تحديث البيانات
      setProfessionals(response.data.results);
      setTotalResults(response.data.count);
      setTotalPages(Math.ceil(response.data.count / newParams.limit));
      setCurrentPage(newParams.page);
    } catch (err) {
      console.error('Error searching for professionals:', err);
      setError(err.response?.data?.message || 'فشل في البحث عن المهنيين. يرجى المحاولة مرة أخرى.');
      
      // بيانات وهمية للعرض التجريبي إذا فشل الاتصال بالواجهة الخلفية
      const mockData = generateMockProfessionals(10);
      setProfessionals(mockData);
      setTotalResults(mockData.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // تغيير الصفحة
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchProfessionals({ page: newPage });
    }
  };

  // إعادة تعيين معايير البحث
  const resetFilters = () => {
    setSearchParams({
      location: '',
      service: '',
      rating: 0,
      minPrice: null,
      maxPrice: null,
      availability: null,
      limit: 10,
      page: 1
    });
    searchProfessionals({
      location: '',
      service: '',
      rating: 0,
      minPrice: null,
      maxPrice: null,
      availability: null,
      limit: 10,
      page: 1
    });
  };

  // توليد بيانات وهمية للعرض التجريبي
  const generateMockProfessionals = (count) => {
    const services = ['سباكة', 'كهرباء', 'نجارة', 'دهان', 'تنظيف', 'نقل أثاث'];
    const cities = ['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'طنطا'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `محترف ${i + 1}`,
      profession: services[Math.floor(Math.random() * services.length)],
      rating: (Math.random() * 4 + 1).toFixed(1),
      reviews: Math.floor(Math.random() * 100),
      hourlyRate: Math.floor(Math.random() * 200) + 50,
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.7 ? 'women' : 'men'}/${i + 1}.jpg`,
      location: {
        address: cities[Math.floor(Math.random() * cities.length)],
        coordinates: [30.0444 + (Math.random() - 0.5), 31.2357 + (Math.random() - 0.5)]
      },
      availability: Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          slots: Math.random() > 0.3 ? ['09:00', '12:00', '15:00', '18:00'].filter(() => Math.random() > 0.5) : []
        };
      })
    }));
  };

  return {
    professionals,
    loading,
    error,
    totalResults,
    currentPage,
    totalPages,
    searchParams,
    searchProfessionals,
    handlePageChange,
    resetFilters
  };
}

export default useSearchProfessionals; 