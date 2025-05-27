import { useState, useEffect } from 'react';
import { alistProsService } from '../services/api';
import { useAuth } from './useAuth';

export function useProfessionalProfile(initialProId = null) {
  const [proId, setProId] = useState(initialProId);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser, userRole, isProfessional } = useAuth();
  
  // وظيفة لجلب ملف المهني
  const fetchProfile = async (id = proId) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // تعيين معرف المهني للاستخدام اللاحق
      setProId(id);
      
      // جلب بيانات الملف
      const response = await alistProsService.getProfile(id);
      const profileData = response.data;
      setProfile(profileData);
      
      // التحقق مما إذا كان هذا ملف المستخدم الحالي
      if (currentUser && isProfessional) {
        setIsMyProfile(currentUser.id === profileData.user_id);
      } else {
        setIsMyProfile(false);
      }
      
      // جلب التقييمات
      fetchReviews(id);
    } catch (err) {
      console.error(`Error fetching professional profile for ID ${id}:`, err);
      setError(err.response?.data?.message || 'فشل في جلب ملف المهني. يرجى المحاولة مرة أخرى.');
      
      // بيانات وهمية للعرض التجريبي
      const mockData = generateMockProfile(id);
      setProfile(mockData);
      setIsMyProfile(false);
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة لجلب تقييمات المهني
  const fetchReviews = async (id = proId) => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      const response = await alistProsService.getReviews(id);
      setReviews(response.data.results || []);
    } catch (err) {
      console.error(`Error fetching reviews for professional ID ${id}:`, err);
      
      // بيانات وهمية للعرض التجريبي
      setReviews(generateMockReviews());
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة لإنشاء/تحديث ملف المهني
  const saveProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (profile && profile.id) {
        // تحديث ملف موجود
        response = await alistProsService.updateProfile(profile.id, profileData);
      } else {
        // إنشاء ملف جديد
        response = await alistProsService.createProfile(profileData);
      }
      
      setProfile(response.data);
      return response.data;
    } catch (err) {
      console.error('Error saving professional profile:', err);
      setError(err.response?.data?.message || 'فشل في حفظ ملف المهني. يرجى المحاولة مرة أخرى.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة لإرسال تقييم جديد
  const submitReview = async (reviewData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await alistProsService.createReview({
        ...reviewData,
        professional: proId
      });
      
      // إضافة التقييم الجديد وإعادة حساب التقييم الإجمالي
      setReviews([response.data, ...reviews]);
      
      // تحديث ملف المهني مع التقييم الجديد
      if (profile) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + response.data.rating;
        const avgRating = totalRating / (reviews.length + 1);
        
        setProfile({
          ...profile,
          rating: avgRating.toFixed(1),
          reviews_count: (profile.reviews_count || 0) + 1
        });
      }
      
      return response.data;
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'فشل في إرسال التقييم. يرجى المحاولة مرة أخرى.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // توليد بيانات وهمية للعرض التجريبي
  const generateMockProfile = (id) => {
    const services = [
      { id: 1, name: 'تصليح تسريبات المياه', price: 120, description: 'إصلاح تسريبات المياه في المطبخ والحمام والمواسير' },
      { id: 2, name: 'تصليح الأحواض', price: 150, description: 'تصليح وتركيب أحواض المطبخ والحمام' },
      { id: 3, name: 'تصليح وتركيب السخانات', price: 200, description: 'تصليح وتركيب السخانات وتسليك المواسير' }
    ];
    
    return {
      id: parseInt(id),
      user_id: parseInt(id) + 100,
      name: `محترف ${id}`,
      profession: 'سباكة',
      years_experience: 10,
      about: 'سباك محترف مع خبرة أكثر من 10 سنوات في مجال السباكة. متخصص في إصلاح التسريبات وتركيب الأحواض والحنفيات والسخانات.',
      phone: '0123456789',
      email: `pro${id}@example.com`,
      address: 'القاهرة، مصر',
      location: {
        coordinates: [30.0444, 31.2357],
        address: 'القاهرة، مصر'
      },
      rating: 4.5,
      reviews_count: 36,
      services: services,
      gallery: [
        'https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1556911220-dabc1f02913a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1573093509207-92057c3cd429?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      ],
      availability: {
        days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        hours: '9:00 صباحًا - 6:00 مساءً'
      },
      certifications: [
        { id: 1, name: 'شهادة محترف سباكة معتمد', issuer: 'نقابة المهندسين', year: 2015 },
        { id: 2, name: 'شهادة السلامة المهنية', issuer: 'وزارة القوى العاملة', year: 2017 }
      ],
      avatar: `https://randomuser.me/api/portraits/men/${id % 100}.jpg`
    };
  };
  
  // توليد تقييمات وهمية للعرض التجريبي
  const generateMockReviews = () => {
    const comments = [
      'خدمة ممتازة وفي الوقت المحدد',
      'محترف ويتقن عمله، أنصح بالتعامل معه',
      'سعر مناسب وجودة عالية',
      'قام بإصلاح المشكلة بسرعة وكفاءة',
      'تجربة إيجابية، سأتعامل معه مرة أخرى'
    ];
    
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      user: {
        id: i + 200,
        name: `مستخدم ${i + 1}`,
        avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 1}.jpg`
      },
      professional: proId,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
      comment: comments[i % comments.length],
      created_at: new Date(Date.now() - i * 86400000).toISOString(), // Last X days
      service_name: 'تصليح تسريبات المياه'
    }));
  };
  
  // جلب البيانات عند تغيير المعرف
  useEffect(() => {
    if (initialProId) {
      fetchProfile(initialProId);
    }
  }, [initialProId]);
  
  return {
    proId,
    profile,
    reviews,
    isMyProfile,
    loading,
    error,
    fetchProfile,
    fetchReviews,
    saveProfile,
    submitReview,
    setProId
  };
}

export default useProfessionalProfile; 