import { useState, useEffect } from 'react';
import { proService, messagingService } from '../services/api';

// دالة مساعدة لتحويل رقم اليوم إلى اسم اليوم
const getDayName = (dayNumber) => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return dayNames[dayNumber] || '';
};

export function useProfessionalDetails(proId) {
  const [professional, setProfessional] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState(null);

  useEffect(() => {
    const fetchProfessionalDetails = async () => {
      // إعادة تعيين الحالة
      setLoading(true);
      setError(null);
      
      // التحقق من وجود معرف محترف صالح
      if (!proId) {
        setError('Professional ID is missing');
        setLoading(false);
        return;
      }

      try {
        // التأكد من أن المعرف بالصيغة الصحيحة
        // التعامل مع المعرف كنص لضمان توافقه مع API
        const formattedId = String(proId);
        console.log(`Fetching professional with ID: ${formattedId} (Original: ${proId}, Type: ${typeof proId})`);
        
        // جلب بيانات ملف المحترف
        const profileResponse = await proService.getProfile(formattedId);
        console.log('Profile response:', profileResponse);
        const professionalData = profileResponse.data;
        console.log('Professional data extracted:', professionalData);
        setProfessional(professionalData);

        try {
          // جلب تقييمات المحترف
          const reviewsResponse = await proService.getReviews(proId);
          setReviews(reviewsResponse.data.results || []);
        } catch (reviewsErr) {
          console.error('Error fetching reviews:', reviewsErr);
          // لا نظهر هذا الخطأ للمستخدم، فقط نترك المراجعات فارغة
          setReviews([]);
        }

        try {
          // جلب أوقات توفر المحترف
          const availabilityResponse = await proService.getAvailabilitySlots({ alistpro: proId });
          const availabilityData = availabilityResponse.data.results || [];
          
          // معالجة بيانات التوفر لتحويلها إلى تنسيق أبسط يمكن استخدامه في الواجهة
          const processedAvailability = availabilityData.map(slot => ({
            id: slot.id,
            dayOfWeek: slot.day_of_week,
            dayName: slot.day_name || getDayName(slot.day_of_week),
            startTime: slot.start_time,
            endTime: slot.end_time,
            isRecurring: slot.is_recurring
          }));
          
          console.log('Processed availability data:', processedAvailability);
          setAvailability(processedAvailability);
        } catch (availabilityErr) {
          console.error('Error fetching availability:', availabilityErr);
          // لا نظهر هذا الخطأ للمستخدم، فقط نترك الأوقات المتاحة فارغة
          setAvailability([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching professional details:', err);
        // استخراج رسالة الخطأ من الاستجابة إذا كانت موجودة
        let errorMessage = 'Failed to load professional details';
        if (err.response) {
          errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
          console.log('API error response:', err.response.data);
        }
        setError(errorMessage);
        setLoading(false);
        
        // في بيئة التطوير، يمكننا استخدام بيانات وهمية
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data for development');
          setProfessional({
            id: proId,
            name: 'Demo Professional',
            business_name: 'Demo Pro Service',
            profession: 'Home Service Professional',
            average_rating: 4.8,
            review_count: 24,
            location: { address: 'Cairo, Egypt' },
            profile_image: 'https://randomuser.me/api/portraits/men/22.jpg'
          });
        }
      }
    };

    if (proId) {
      fetchProfessionalDetails();
    }
  }, [proId]);

  // وظيفة لبدء محادثة مع المحترف
  const startConversation = async (message) => {
    if (!professional) return;
    
    setMessageLoading(true);
    setMessageError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to send messages');
      }
      
      // إنشاء محادثة جديدة مع هذا المحترف
      const conversationData = {
        recipient_id: professional.user_id || professional.user?.id,
        message: message
      };
      
      const response = await messagingService.createConversation(conversationData);
      setMessageLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error starting conversation:', err);
      setMessageError(err.response?.data?.message || 'Failed to start conversation');
      setMessageLoading(false);
      throw err;
    }
  };

  return { 
    professional, 
    reviews, 
    availability, 
    loading, 
    error,
    startConversation,
    messageLoading,
    messageError
  };
}

export default useProfessionalDetails; 