import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaComments,
  FaDollarSign,
  FaTools
} from 'react-icons/fa';
import { schedulingService, alistProsService, messagingService, serviceService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const BookingPage = () => {
  // Router hooks
  const { proId: rawId } = useParams();
  const id = parseInt(rawId, 10);
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service');
  const navigate = useNavigate();
  
  // Auth and language
  const { isAuthenticated, currentUser } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Loading states
  const [loading, setLoading] = useState(false);
  const [proLoading, setProfessionalLoading] = useState(true);
  const [error, setError] = useState(null);

  // Professional data
  const [professional, setProfessional] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  
  // Form state
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(initialServiceId || '');
  const [problemDescription, setProblemDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceAddress, setServiceAddress] = useState(currentUser?.address || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone_number || '');
  
  // Booking result
  const [appointmentId, setAppointmentId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !proLoading) {
      navigate(`/login?redirect=/booking/${id}${initialServiceId ? `?service=${initialServiceId}` : ''}`);
    }
  }, [isAuthenticated, proLoading, navigate, id, initialServiceId]);

  // Debug authentication state
  useEffect(() => {
    console.log('Authentication State:', {
      isAuthenticated,
      currentUser,
      userToken: localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    });
  }, [isAuthenticated, currentUser]);
  
  // Fetch professional data
  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (!id) return;
      
      try {
        setProfessionalLoading(true);
        setError(null);

        // Fetch professional profile
        const proResponse = await alistProsService.getProfileDetail(id);
        console.log('Professional data:', proResponse.data);
        setProfessional(proResponse.data);

        // Fetch availability slots for this professional
        const availabilityResponse = await schedulingService.getAvailabilitySlots({ alistpro: id });
        console.log('Availability slots:', availabilityResponse.data);
        setAvailabilitySlots(availabilityResponse.data.results || []);

        // Fetch service categories
        const categoriesResponse = await serviceService.getCategories();
        console.log('Service categories:', categoriesResponse.data);
        setServiceCategories(categoriesResponse.data.results || []);

        setProfessionalLoading(false);
      } catch (err) {
        console.error('Error fetching professional data:', err);
        setError(isArabic ? 'خطأ في تحميل بيانات المحترف' : 'Error loading professional data');
        setProfessionalLoading(false);
      }
    };

    fetchProfessionalData();
  }, [id, isArabic]);

  // Helper functions
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Generate next 30 days and check availability
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday=0 format
      
      // Check if professional is available on this day
      const hasAvailability = availabilitySlots.some(slot => slot.day_of_week === dayOfWeek);
      
      if (hasAvailability) {
        dates.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString(isArabic ? 'ar' : 'en', { weekday: 'short' }),
          day: date.getDate(),
          month: date.toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'short' })
        });
      }
    }
    
    return dates.slice(0, 12); // Limit to 12 available dates
  };

  const getAvailableTimesForDate = (selectedDate) => {
    if (!selectedDate) return [];
    
    const date = new Date(selectedDate);
    const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday=0 format
    
    // Find available slots for this day of week
    const daySlots = availabilitySlots.filter(slot => slot.day_of_week === dayOfWeek);
    
    // Convert to time options
    const times = [];
    daySlots.forEach(slot => {
      const startTime = slot.start_time;
      const endTime = slot.end_time;
      
      // Generate hourly slots between start and end time
      let current = startTime;
      while (current < endTime) {
        times.push({
          value: current,
          label: current.substring(0, 5) // HH:MM format
        });
        
        // Add 1 hour
        const [hours, minutes] = current.split(':');
        const nextHour = (parseInt(hours) + 1).toString().padStart(2, '0');
        current = `${nextHour}:${minutes}`;
        
        if (current >= endTime) break;
      }
    });
    
    return times;
  };

  const getSelectedServiceDetails = () => {
    return serviceCategories.find(cat => cat.id === parseInt(selectedService));
  };

  // Form submission handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final step: Create appointment
    try {
      setLoading(true);
      setError(null);

      // Validate required data before sending
      if (!selectedService || !selectedDate || !selectedTime || !serviceAddress || !contactPhone) {
        throw new Error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      }

      if (!professional?.user?.id) {
        throw new Error(isArabic ? 'لم يتم العثور على معلومات المحترف' : 'Professional information not found');
      }

      // Validate that the selected service category exists
      const selectedServiceDetails = getSelectedServiceDetails();
      if (!selectedServiceDetails) {
        throw new Error(isArabic ? 'فئة الخدمة المختارة غير صحيحة' : 'Selected service category is invalid');
      }

      // Validate date is not in the past
      const selectedDateObj = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDateObj < today) {
        throw new Error(isArabic ? 'لا يمكن حجز موعد في تاريخ سابق' : 'Cannot book appointment in the past');
      }

      // Validate that professional has availability on the selected date
      const availableTimesForDate = getAvailableTimesForDate(selectedDate);
      if (availableTimesForDate.length === 0) {
        throw new Error(isArabic ? 'المحترف غير متاح في هذا التاريخ' : 'Professional is not available on this date');
      }

      // Validate that selected time is available
      const isTimeAvailable = availableTimesForDate.some(time => time.value === selectedTime);
      if (!isTimeAvailable) {
        throw new Error(isArabic ? 'الوقت المختار غير متاح' : 'Selected time is not available');
      }

      // Create appointment with initial status 'REQUESTED'
      // Make sure all field names match the backend model exactly
      const appointmentData = {
        alistpro: id,
        service_category: parseInt(selectedService),
        appointment_date: selectedDate,
        start_time: selectedTime,
        end_time: calculateEndTime(selectedTime),
        notes: problemDescription,
        location: serviceAddress
      };

      // Validate appointment data before sending
      console.log('=== APPOINTMENT DATA VALIDATION ===');
      console.log('alistpro (professional ID):', id, 'Type:', typeof id);
      console.log('service_category:', parseInt(selectedService), 'Type:', typeof parseInt(selectedService));
      console.log('appointment_date:', selectedDate, 'Type:', typeof selectedDate);
      console.log('start_time:', selectedTime, 'Type:', typeof selectedTime);
      console.log('end_time:', calculateEndTime(selectedTime), 'Type:', typeof calculateEndTime(selectedTime));
      console.log('notes:', problemDescription);
      console.log('location:', serviceAddress);
      console.log('Full appointment data:', appointmentData);
      console.log('Professional data:', professional);
      console.log('Current user:', currentUser);
      console.log('Selected service details:', getSelectedServiceDetails());
      console.log('Available slots for selected date:', getAvailableTimesForDate(selectedDate));

      const appointmentResponse = await schedulingService.createAppointment(appointmentData);
      const newAppointmentId = appointmentResponse.data.id;
      setAppointmentId(newAppointmentId);

      console.log('Appointment created successfully:', appointmentResponse.data);

      // Create conversation between client and professional
      // Use the ConversationCreateSerializer format with participants and initial_message
      const initialMessage = isArabic 
        ? `مرحباً! لقد قمت بحجز موعد لـ${getSelectedServiceDetails()?.name || 'خدمة'} في ${selectedDate} الساعة ${selectedTime}.

وصف المشكلة: ${problemDescription}

العنوان: ${serviceAddress}
رقم الهاتف: ${contactPhone}
مستوى الأولوية: ${urgencyLevel === 'urgent' ? 'عاجل' : 'عادي'}

يرجى مناقشة تفاصيل الخدمة والسعر المقترح.`
        : `Hello! I've booked an appointment for ${getSelectedServiceDetails()?.name || 'service'} on ${selectedDate} at ${selectedTime}.

Problem Description: ${problemDescription}

Address: ${serviceAddress}
Phone: ${contactPhone}
Urgency Level: ${urgencyLevel}

Please discuss the service details and your proposed pricing.`;

      const conversationData = {
        participants: [currentUser.id, professional.user.id],
        title: isArabic 
          ? `طلب خدمة ${getSelectedServiceDetails()?.name || ''}`
          : `Service Request - ${getSelectedServiceDetails()?.name || ''}`,
        initial_message: initialMessage
      };

      console.log('Creating conversation with data:', conversationData);
      const conversationResponse = await messagingService.createConversation(conversationData);
      const newConversationId = conversationResponse.data.id;
      setConversationId(newConversationId);

      console.log('Conversation created successfully:', conversationResponse.data);

      // No need to send separate message since initial_message handles it

      setBookingComplete(true);
      setLoading(false);

        } catch (err) {
      console.error('Error creating booking:', err);
      console.error('Error details:', err.response?.data);
      console.error('Full error response:', err.response);
      
      // Parse error messages from different possible formats
      let errorMessage = isArabic ? 'فشل في إنشاء الحجز' : 'Failed to create booking';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('Detailed error data:', errorData);
        
        // Handle different error response formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          console.log('Non-field errors:', errorData.non_field_errors);
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        } else {
          // Handle field-specific errors
          const fieldErrors = [];
          for (const [field, errors] of Object.entries(errorData)) {
            console.log(`Field error - ${field}:`, errors);
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              fieldErrors.push(`${field}: ${errors}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log('Final error message:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':');
    const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    return `${endHour}:${minutes}`;
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Loading state
  if (proLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  // Error state
  if (error && !professional) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <FaExclamationTriangle className="flex-shrink-0 h-5 w-5 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium">{isArabic ? 'حدث خطأ' : 'Error'}</h3>
            <p className="mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md transition duration-200"
            >
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (bookingComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-lg">
            <FaCheckCircle className="mx-auto h-16 w-16 mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? 'تم إنشاء الحجز بنجاح!' : 'Booking Created Successfully!'}
            </h2>
            <p className="mb-6">
              {isArabic 
                ? 'تم إنشاء موعدك ومحادثة مع المحترف. سيتواصل معك لمناقشة التفاصيل والأسعار.'
                : 'Your appointment has been created and a conversation started with the professional. They will contact you to discuss details and pricing.'}
            </p>
            
            <div className="space-y-3">
              {conversationId && (
                <Link 
                  to={`/messages/${conversationId}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 mr-3"
                >
                  <FaComments className="mr-2" />
                  {isArabic ? 'فتح المحادثة' : 'Open Conversation'}
                </Link>
              )}
              
              <Link 
                to="/appointments"
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
              >
                <FaCalendarAlt className="mr-2" />
                {isArabic ? 'عرض مواعيدي' : 'View My Appointments'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isArabic 
            ? `حجز موعد مع ${professional?.business_name || 'محترف'} | A-List Home Pros`
            : `Book ${professional?.business_name || 'Professional'} | A-List Home Pros`}
        </title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6">
            <Link to={`/pros/${id}`} className="text-blue-600 hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {isArabic ? 'العودة للملف الشخصي' : 'Back to Profile'}
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with professional info */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
              <div className="flex items-center">
                <img 
                  src={professional?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional?.business_name || 'Pro')}&background=0D8ABC&color=fff`}
                  alt={professional?.business_name}
                  className="w-16 h-16 rounded-full border-2 border-white mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold">
                    {isArabic ? 'حجز موعد مع' : 'Book Appointment with'} {professional?.business_name}
                  </h1>
                  <p className="mt-1">
                    {professional?.business_description || (isArabic ? 'محترف خدمات منزلية' : 'Home Service Professional')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="px-6 pt-6">
              <div className="flex mb-8">
                <div className="flex-1">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    <FaTools />
                  </div>
                  <p className="text-center mt-2 text-sm">{isArabic ? 'وصف المشكلة' : 'Describe Problem'}</p>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300">
                    <div className={`h-1 bg-blue-600 ${step >= 2 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
                  </div>
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    <FaCalendarAlt />
                  </div>
                  <p className="text-center mt-2 text-sm">{isArabic ? 'الموعد' : 'Schedule'}</p>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300">
                    <div className={`h-1 bg-blue-600 ${step >= 3 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
                  </div>
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    <FaCheckCircle />
                  </div>
                  <p className="text-center mt-2 text-sm">{isArabic ? 'التأكيد' : 'Confirm'}</p>
                </div>
              </div>
            </div>
            
            {/* Error Messages */}
            {error && (
              <div className="mx-6 mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                <FaExclamationTriangle className="flex-shrink-0 h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Step 1: Describe Problem */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">
                    {isArabic ? 'اوصف مشكلتك أو احتياجك للخدمة' : 'Describe Your Problem or Service Need'}
                  </h2>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">
                      {isArabic ? 'نوع الخدمة' : 'Service Type'} <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                    >
                      <option value="">{isArabic ? 'اختر نوع الخدمة' : 'Select Service Type'}</option>
                      {serviceCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">
                      {isArabic ? 'وصف تفصيلي للمشكلة' : 'Detailed Problem Description'} <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      rows="5" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isArabic 
                        ? 'اشرح المشكلة بالتفصيل... مثل: ما هي المشكلة، متى بدأت، هل جربت حلول، إلخ'
                        : 'Describe the problem in detail... such as: what is the issue, when did it start, have you tried any solutions, etc.'}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">
                      {isArabic ? 'مستوى الأولوية' : 'Urgency Level'}
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="urgency" 
                          value="normal"
                          className="h-4 w-4 text-blue-600"
                          checked={urgencyLevel === 'normal'}
                          onChange={(e) => setUrgencyLevel(e.target.value)}
                        />
                        <span className="ml-2">{isArabic ? 'عادي - يمكن الانتظار بضعة أيام' : 'Normal - Can wait a few days'}</span>
                      </label>
                      <label className="flex items-center">
                      <input 
                          type="radio" 
                          name="urgency" 
                          value="urgent"
                          className="h-4 w-4 text-blue-600"
                          checked={urgencyLevel === 'urgent'}
                          onChange={(e) => setUrgencyLevel(e.target.value)}
                        />
                        <span className="ml-2">{isArabic ? 'عاجل - يحتاج حل سريع (قد تنطبق رسوم إضافية)' : 'Urgent - Needs quick solution (additional fees may apply)'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Schedule */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">
                    {isArabic ? 'اختر موعد الاستشارة' : 'Choose Consultation Time'}
                  </h2>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-3 font-medium">
                      {isArabic ? 'التاريخ المفضل' : 'Preferred Date'} <span className="text-red-500">*</span>
                    </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {getAvailableDates().map((date) => (
                            <div 
                          key={date.date} 
                              onClick={() => {
                            setSelectedDate(date.date);
                                setSelectedTime('');
                              }}
                          className={`cursor-pointer p-4 text-center rounded-lg border-2 transition-all duration-200 ${selectedDate === date.date 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                        >
                          <div className="text-sm font-medium mb-1">{date.dayName}</div>
                              <div className="text-2xl font-bold">{date.day}</div>
                          <div className="text-sm text-gray-500">{date.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedDate && (
                  <div className="mb-6">
                      <label className="block text-gray-700 mb-3 font-medium">
                        {isArabic ? 'الوقت المفضل' : 'Preferred Time'} <span className="text-red-500">*</span>
                    </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {getAvailableTimesForDate(selectedDate).map((time) => (
                          <div 
                            key={time.value}
                            onClick={() => setSelectedTime(time.value)}
                            className={`cursor-pointer p-3 text-center rounded-lg border-2 transition-all duration-200 ${selectedTime === time.value 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                          >
                            <FaClock className="mx-auto mb-2" />
                            <div className="font-medium">{time.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 3: Confirm Details */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">
                    {isArabic ? 'تأكيد التفاصيل' : 'Confirm Details'}
                  </h2>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">
                      {isArabic ? 'عنوان الخدمة' : 'Service Address'} <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      rows="3" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isArabic ? 'أدخل العنوان الكامل حيث ستتم الخدمة' : 'Enter the complete address where service will be performed'}
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">
                      {isArabic ? 'رقم الهاتف للتواصل' : 'Contact Phone Number'} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Booking Summary */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="font-semibold text-lg mb-4">{isArabic ? 'ملخص الحجز' : 'Booking Summary'}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isArabic ? 'الخدمة:' : 'Service:'}</span>
                        <span className="font-medium">{getSelectedServiceDetails()?.name || (isArabic ? 'غير محدد' : 'Not selected')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isArabic ? 'التاريخ:' : 'Date:'}</span>
                        <span className="font-medium">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString(isArabic ? 'ar' : 'en', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : (isArabic ? 'غير محدد' : 'Not selected')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isArabic ? 'الوقت:' : 'Time:'}</span>
                        <span className="font-medium">{selectedTime || (isArabic ? 'غير محدد' : 'Not selected')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{isArabic ? 'الأولوية:' : 'Priority:'}</span>
                        <span className="font-medium">
                          {urgencyLevel === 'urgent' ? (isArabic ? 'عاجل' : 'Urgent') : (isArabic ? 'عادي' : 'Normal')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <FaInfoCircle className="inline mr-2" />
                        {isArabic 
                          ? 'ملاحظة: سيتم تحديد السعر النهائي بعد مناقشة التفاصيل مع المحترف من خلال المحادثة.'
                          : 'Note: Final pricing will be determined after discussing details with the professional through chat.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                {step > 1 ? (
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300"
                    disabled={loading}
                  >
                    {isArabic ? 'رجوع' : 'Back'}
                  </button>
                ) : (
                  <div></div>
                )}
                
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
                  disabled={loading || (step === 1 && (!selectedService || !problemDescription)) || 
                           (step === 2 && (!selectedDate || !selectedTime)) ||
                           (step === 3 && (!serviceAddress || !contactPhone))}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      {isArabic ? 'جاري المعالجة...' : 'Processing...'}
                    </>
                  ) : (
                    step === 3 ? (isArabic ? 'تأكيد الحجز' : 'Confirm Booking') : (isArabic ? 'التالي' : 'Continue')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
