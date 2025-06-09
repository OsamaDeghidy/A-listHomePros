import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { 
  schedulingService, 
  messagingService, 
  paymentService, 
  alistProsService,
  proService 
} from '../services/api';
// Import mock data
import {
  getMockAppointment,
  getMockProfessional,
  getMockPayment,
  getMockConversation,
  generateMockPaymentForAppointment
} from '../data/mockData';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaComments,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaEdit,
  FaCreditCard,
  FaFileInvoice,
  FaTools,
  FaCheck,
  FaTimes,
  FaBan,
  FaSpinner,
  FaDownload,
  FaShareAlt,
  FaHistory,
  FaChevronRight,
  FaCog,
  FaQuestionCircle,
  FaInfoCircle
} from 'react-icons/fa';

// Status mapping between backend and frontend
const STATUS_MAPPING = {
  // Backend to Frontend mapping
  'REQUESTED': 'pending',
  'CONFIRMED': 'confirmed', 
  'COMPLETED': 'completed',
  'CANCELLED': 'cancelled',
  'RESCHEDULED': 'cancelled',
  
  // Frontend to Backend mapping (reverse)
  'pending': 'REQUESTED',
  'confirmed': 'CONFIRMED',
  'paid': 'CONFIRMED', // We'll handle payment separately
  'completed': 'COMPLETED',
  'cancelled': 'CANCELLED',
  'rejected': 'CANCELLED'
};

// Helper functions for status mapping
const mapBackendStatusToFrontend = (backendStatus) => {
  return STATUS_MAPPING[backendStatus] || backendStatus?.toLowerCase();
};

const mapFrontendStatusToBackend = (frontendStatus) => {
  return STATUS_MAPPING[frontendStatus] || frontendStatus?.toUpperCase();
};

// Helper function to normalize appointment data from backend
const normalizeAppointmentData = (backendData) => {
  return {
    ...backendData,
    status: mapBackendStatusToFrontend(backendData.status),
    // Map alistpro to professional_id for consistency
    professional_id: backendData.alistpro?.id || backendData.alistpro,
    // Ensure service_category is properly formatted
    service_category: backendData.service_category || {
      id: 'general',
      name: 'General Service',
      name_ar: 'خدمة عامة'
    }
  };
};

const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, userRole } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Track if we're using mock data
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/appointments/' + id);
      return;
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch appointment details
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchAppointmentDetails();
    }
  }, [isAuthenticated, id]);

  const fetchAppointmentDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsDemoMode(false); // Reset demo mode

    try {
      console.log('🔄 Fetching appointment details for ID:', id);
      
      let appointmentData = null;
      let professionalData = null;
      let conversationData = null;
      let paymentData = null;
      let usingMockData = false;

      try {
        // Try to fetch from real API first
        console.log('🌐 Attempting to fetch from real backend API...');
        const appointmentRes = await schedulingService.getAppointment(id);
        appointmentData = normalizeAppointmentData(appointmentRes.data);
        console.log('✅ Real API appointment data:', appointmentData);
      } catch (apiError) {
        console.log('⚠️ Real API failed, using mock data for appointment:', apiError.message);
        setIsDemoMode(true); // Enable demo mode only if API fails
        usingMockData = true;
        appointmentData = getMockAppointment(id);
        if (!appointmentData) {
          // If no mock data found for this specific ID, create generic mock data
          console.log('📋 No mock data found, creating generic appointment data');
          appointmentData = {
            id: parseInt(id),
            status: "pending",
            service_category: {
              id: "home_service",
              name: "Home Service",
              name_ar: "خدمة منزلية"
            },
            appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            start_time: "10:00:00",
            end_time: "12:00:00",
            estimated_cost: 150.00,
            location: "Riyadh, Saudi Arabia",
            service_description: isArabic ? "طلب خدمة منزلية عامة" : "General home service request",
            notes: isArabic ? "ملاحظات إضافية" : "Additional notes",
            alistpro: 101,
            professional_id: 101,
            client: {
              id: 999,
              name: isArabic ? "عميل تجريبي" : "Demo Client",
              email: "demo@example.com",
              phone_number: "+966-50-000-0000",
              address: "Riyadh, Saudi Arabia"
            },
            conversation_id: null,
            payment_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        console.log('📋 Using mock appointment data:', appointmentData);
      }

      setAppointment(appointmentData);

      // Fetch professional details
      if (appointmentData.alistpro || appointmentData.professional_id) {
        try {
          const alistproId = typeof appointmentData.alistpro === 'object' 
            ? appointmentData.alistpro.id || appointmentData.alistpro_id
            : appointmentData.alistpro || appointmentData.professional_id;
            
          if (alistproId) {
            if (!usingMockData) {
              try {
                console.log('🌐 Fetching professional data from real API...');
                const proRes = await alistProsService.getProfileDetail(alistproId);
                professionalData = proRes.data;
                console.log('✅ Real API professional data:', professionalData);
              } catch (proApiError) {
                console.log('⚠️ Professional API failed, using mock data:', proApiError.message);
                professionalData = getMockProfessional(alistproId);
                if (!professionalData) {
                  // Create generic professional data as fallback
                  professionalData = {
                    id: alistproId,
                    user: {
                      id: 9999,
                      name: isArabic ? "محترف تجريبي" : "Demo Professional",
                      email: "pro@example.com",
                      phone_number: "+966-50-111-1111",
                      profile_picture: "/default-avatar.png"
                    },
                    business_name: isArabic ? "خدمات منزلية محترفة" : "Professional Home Services",
                    business_description: isArabic ? "مقدم خدمات منزلية محترف" : "Professional home service provider",
                    profession: isArabic ? "مقدم خدمة" : "Service Provider",
                    experience_years: 5,
                    average_rating: 4.5,
                    review_count: 50,
                    service_area: isArabic ? "الرياض والمناطق المحيطة" : "Riyadh and surrounding areas",
                    hourly_rate: 75.00,
                    is_verified: true,
                    is_featured: false,
                    profile_image: "/default-avatar.png",
                    skills: [isArabic ? "خدمات منزلية" : "Home Services"],
                    languages: ["Arabic", "English"]
                  };
                }
                console.log('👨‍💼 Using mock professional data:', professionalData);
              }
            } else {
              // If using mock appointment data, use mock professional data too
              professionalData = getMockProfessional(alistproId);
              if (!professionalData) {
                professionalData = {
                  id: alistproId,
                  user: {
                    id: 9999,
                    name: isArabic ? "محترف تجريبي" : "Demo Professional",
                    email: "pro@example.com",
                    phone_number: "+966-50-111-1111",
                    profile_picture: "/default-avatar.png"
                  },
                  business_name: isArabic ? "خدمات منزلية محترفة" : "Professional Home Services",
                  business_description: isArabic ? "مقدم خدمات منزلية محترف" : "Professional home service provider",
                  profession: isArabic ? "مقدم خدمة" : "Service Provider",
                  experience_years: 5,
                  average_rating: 4.5,
                  review_count: 50,
                  service_area: isArabic ? "الرياض والمناطق المحيطة" : "Riyadh and surrounding areas",
                  hourly_rate: 75.00,
                  is_verified: true,
                  is_featured: false,
                  profile_image: "/default-avatar.png",
                  skills: [isArabic ? "خدمات منزلية" : "Home Services"],
                  languages: ["Arabic", "English"]
                };
              }
            }
            setProfessional(professionalData);
          }
        } catch (proErr) {
          console.error('⚠️ Error fetching professional details:', proErr);
        }
      }

      // Fetch conversation if exists (only for demo mode for now)
      if (appointmentData.conversation_id && usingMockData) {
        try {
          conversationData = getMockConversation(appointmentData.conversation_id);
          console.log('💬 Using mock conversation data:', conversationData);
          setConversation(conversationData);
        } catch (convErr) {
          console.error('⚠️ Error fetching conversation:', convErr);
        }
      }

      // Fetch payment information (only for demo mode for now)
      if ((appointmentData.status === 'paid' || appointmentData.status === 'completed' || appointmentData.payment_id) && usingMockData) {
        try {
          paymentData = getMockPayment(appointmentData.id) || generateMockPaymentForAppointment(appointmentData.id);
          console.log('💳 Using mock payment data:', paymentData);
          if (paymentData) {
            setPayment(paymentData);
          }
        } catch (paymentErr) {
          console.error('⚠️ Error fetching payment:', paymentErr);
        }
      }

      // Generate status history
      const history = generateStatusHistory(appointmentData);
      setStatusHistory(history);

    } catch (err) {
      console.error('❌ Error fetching appointment details:', err);
      setError(err.message || (isArabic ? 'فشل في تحميل تفاصيل الموعد' : 'Failed to load appointment details'));
    } finally {
      setLoading(false);
    }
  }, [id, isArabic]);

  // Generate status history based on appointment data
  const generateStatusHistory = (appointmentData) => {
    const history = [];
    const createdAt = new Date(appointmentData.created_at);
    
    // Always add creation
    history.push({
      status: 'created',
      timestamp: createdAt,
      title: isArabic ? 'تم إنشاء الموعد' : 'Appointment Created',
      description: isArabic ? 'تم إرسال طلب الخدمة' : 'Service request submitted',
      icon: FaCalendarAlt,
      color: 'blue'
    });

    // Map backend status to frontend for consistency
    const currentStatus = mapBackendStatusToFrontend(appointmentData.status)?.toLowerCase();
    
    if (['confirmed', 'paid', 'completed'].includes(currentStatus)) {
      history.push({
        status: 'confirmed',
        timestamp: new Date(appointmentData.updated_at || appointmentData.created_at),
        title: isArabic ? 'تم تأكيد الموعد' : 'Appointment Confirmed',
        description: isArabic ? 'قبل العميل طلب الخدمة' : 'Client accepted the service request',
        icon: FaCheck,
        color: 'green'
      });
    }

    if (['paid', 'completed'].includes(currentStatus)) {
      history.push({
        status: 'paid',
        timestamp: payment?.created_at ? new Date(payment.created_at) : new Date(),
        title: isArabic ? 'تم الدفع' : 'Payment Completed',
        description: isArabic ? 'تم دفع مبلغ الخدمة' : 'Service payment processed',
        icon: FaCreditCard,
        color: 'emerald'
      });
    }

    if (currentStatus === 'completed') {
      history.push({
        status: 'completed',
        timestamp: new Date(appointmentData.updated_at || appointmentData.created_at),
        title: isArabic ? 'تم إكمال الخدمة' : 'Service Completed',
        description: isArabic ? 'تم تقديم الخدمة بنجاح' : 'Service delivered successfully',
        icon: FaCheckCircle,
        color: 'green'
      });
    }

    if (currentStatus === 'cancelled') {
      history.push({
        status: 'cancelled',
        timestamp: new Date(appointmentData.updated_at || appointmentData.created_at),
        title: isArabic ? 'تم إلغاء الموعد' : 'Appointment Cancelled',
        description: isArabic ? 'تم إلغاء الموعد' : 'Appointment was cancelled',
        icon: FaTimes,
        color: 'red'
      });
    }

    if (currentStatus === 'rejected') {
      history.push({
        status: 'rejected',
        timestamp: new Date(appointmentData.updated_at || appointmentData.created_at),
        title: isArabic ? 'تم رفض الطلب' : 'Request Rejected',
        description: isArabic ? 'تم رفض طلب الخدمة' : 'Service request was rejected',
        icon: FaBan,
        color: 'orange'
      });
    }

    return history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Status management functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
      case 'rejected':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusText = (status) => {
    if (!status) return isArabic ? 'غير محدد' : 'Unknown';
    
    // First map backend status to frontend format
    const mappedStatus = mapBackendStatusToFrontend(status);
    
    const statusMap = {
      'pending': isArabic ? 'قيد الانتظار' : 'Pending',
      'confirmed': isArabic ? 'مؤكد' : 'Confirmed',
      'paid': isArabic ? 'مدفوع' : 'Paid',
      'completed': isArabic ? 'مكتمل' : 'Completed',
      'cancelled': isArabic ? 'ملغي' : 'Cancelled',
      'rejected': isArabic ? 'مرفوض' : 'Rejected',
      
      // Handle backend statuses directly too
      'requested': isArabic ? 'قيد الانتظار' : 'Requested',
      'rescheduled': isArabic ? 'معاد جدولته' : 'Rescheduled'
    };
    
    return statusMap[mappedStatus?.toLowerCase()] || statusMap[status?.toLowerCase()] || status;
  };

  const getAvailableActions = (currentStatus) => {
    const status = currentStatus?.toLowerCase();
    const isProfessional = userRole === 'professional';
    
    const actions = {
      'pending': [
        { 
          status: 'confirmed', 
          label: isArabic ? 'تأكيد الموعد' : 'Confirm Appointment', 
          color: 'blue', 
          icon: FaCheck,
          description: isArabic ? 'قبول طلب الخدمة والانتقال للدفع' : 'Accept service request and proceed to payment'
        },
        { 
          status: 'cancelled', 
          label: isArabic ? 'رفض الطلب' : 'Reject Request', 
          color: 'orange', 
          icon: FaBan,
          description: isArabic ? 'رفض طلب الخدمة' : 'Reject the service request'
        }
      ],
      'confirmed': [
        { 
          status: 'completed', 
          label: isArabic ? 'إكمال الخدمة' : 'Complete Service', 
          color: 'green', 
          icon: FaCheckCircle,
          description: isArabic ? 'تأكيد اكتمال تقديم الخدمة' : 'Confirm service delivery completed',
          professionalOnly: true
        },
        { 
          status: 'cancelled', 
          label: isArabic ? 'إلغاء الموعد' : 'Cancel Appointment', 
          color: 'red', 
          icon: FaTimes,
          description: isArabic ? 'إلغاء الموعد' : 'Cancel the appointment'
        }
      ],
      'paid': [
        { 
          status: 'completed', 
          label: isArabic ? 'إكمال الخدمة' : 'Complete Service', 
          color: 'green', 
          icon: FaCheckCircle,
          description: isArabic ? 'تأكيد اكتمال تقديم الخدمة' : 'Confirm service delivery completed',
          professionalOnly: true
        }
      ]
    };
    
    // Handle backend status format (uppercase)
    const mappedStatus = mapBackendStatusToFrontend(currentStatus) || status;
    const statusActions = actions[mappedStatus] || [];
    
    return statusActions.filter(action => !action.professionalOnly || isProfessional);
  };

  // Handle status updates
  const handleStatusUpdate = useCallback(async (newStatus) => {
    setIsUpdatingStatus(true);
    
    try {
      console.log(`🔄 Updating appointment ${id} to status: ${newStatus}`);
      
      // Special handling for payment
      if (newStatus === 'confirmed') {
        setShowPaymentModal(true);
        setIsUpdatingStatus(false);
        return;
      }
      
      const confirmMessage = isArabic 
        ? `هل أنت متأكد من تغيير حالة الموعد إلى "${getStatusText(newStatus)}"؟`
        : `Are you sure you want to change the appointment status to "${getStatusText(newStatus)}"?`;
      
      if (!window.confirm(confirmMessage)) {
        setIsUpdatingStatus(false);
        return;
      }

      if (isDemoMode) {
        // Demo mode: simulate status update locally
        console.log('📋 Demo mode: simulating status update locally');
        setAppointment(prev => ({
          ...prev,
          status: newStatus,
          updated_at: new Date().toISOString()
        }));
        
        // Generate updated status history
        const updatedAppointment = { ...appointment, status: newStatus, updated_at: new Date().toISOString() };
        const history = generateStatusHistory(updatedAppointment);
        setStatusHistory(history);
        
        // Simulate payment generation for paid status
        if (newStatus === 'paid' && !payment) {
          const mockPayment = generateMockPaymentForAppointment(id);
          setPayment(mockPayment);
        }
        
        const successMessage = isArabic 
          ? 'تم تحديث حالة الموعد بنجاح (وضع تجريبي)'
          : 'Appointment status updated successfully (demo mode)';
        
        alert(successMessage);
      } else {
        // Real API mode - use appropriate endpoint based on status
        const backendStatus = mapFrontendStatusToBackend(newStatus);
        console.log(`🌐 Updating status to backend format: ${backendStatus}`);
        
        if (newStatus === 'confirmed') {
          await schedulingService.confirmAppointment(id);
        } else if (newStatus === 'completed') {
          await schedulingService.completeAppointment(id);
        } else if (newStatus === 'cancelled') {
          await schedulingService.cancelAppointment(id);
        } else {
          // For other statuses, use general update
          await schedulingService.updateAppointmentPartial(id, { status: backendStatus });
        }
        
        // Refresh appointment data
        await fetchAppointmentDetails();
        
        const successMessage = isArabic 
          ? 'تم تحديث حالة الموعد بنجاح'
          : 'Appointment status updated successfully';
        
        alert(successMessage);
      }
      
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      const errorMessage = isArabic 
        ? 'فشل في تحديث حالة الموعد'
        : 'Failed to update appointment status';
      alert(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [id, isArabic, isDemoMode, appointment, payment, fetchAppointmentDetails]);

  // Payment handling
  const handlePaymentRedirect = () => {
    setShowPaymentModal(false);
    
    if (isDemoMode) {
      // Demo mode: simulate payment completion
      console.log('📋 Demo mode: simulating payment completion');
      setAppointment(prev => ({
        ...prev,
        status: 'paid',
        updated_at: new Date().toISOString()
      }));
      
      // Generate mock payment
      const mockPayment = generateMockPaymentForAppointment(id);
      setPayment(mockPayment);
      
      // Update status history
      const updatedAppointment = { ...appointment, status: 'paid', updated_at: new Date().toISOString() };
      const history = generateStatusHistory(updatedAppointment);
      setStatusHistory(history);
      
      alert(isArabic ? 'تم إكمال الدفع بنجاح (وضع تجريبي)' : 'Payment completed successfully (demo mode)');
    } else {
      // Real mode: redirect to payment gateway
      window.open(`/payment?appointment=${id}&amount=${appointment.estimated_cost || 100}`, '_blank');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM format
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-200" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300 dark:text-gray-600" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {isArabic ? 'جاري تحميل تفاصيل الموعد...' : 'Loading appointment details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div 
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg max-w-md mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center">
            <FaExclamationTriangle className="w-5 h-5 mr-3" />
            <p>{error || (isArabic ? 'الموعد غير موجود' : 'Appointment not found')}</p>
          </div>
        </motion.div>
        <div className="flex space-x-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            {isArabic ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isArabic ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isArabic 
            ? `تفاصيل الموعد - ${appointment.service_category?.name || 'خدمة'} | A-List Home Pros`
            : `Appointment Details - ${appointment.service_category?.name || 'Service'} | A-List Home Pros`}
        </title>
        <meta name="description" content={isArabic ? 'تفاصيل الموعد وإدارة الحالة' : 'Appointment details and status management'} />
      </Helmet>

      <motion.div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <motion.div className="mb-8" variants={itemVariants}>
            <Link
              to="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 group transition-colors"
            >
              <FaArrowLeft className={`${isArabic ? 'ml-2 rotate-180' : 'mr-2'} h-4 w-4 group-hover:transform group-hover:-translate-x-1 transition-transform`} />
              {isArabic ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'تفاصيل الموعد' : 'Appointment Details'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isArabic ? `موعد رقم #${appointment.id}` : `Appointment #${appointment.id}`}
                </p>
              </div>
              <div className="mt-4 lg:mt-0">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    appointment.status?.toLowerCase() === 'pending' ? 'bg-yellow-500' :
                    appointment.status?.toLowerCase() === 'confirmed' ? 'bg-blue-500' :
                    appointment.status?.toLowerCase() === 'paid' ? 'bg-emerald-500' :
                    appointment.status?.toLowerCase() === 'completed' ? 'bg-green-500' :
                    appointment.status?.toLowerCase() === 'cancelled' ? 'bg-red-500' :
                    appointment.status?.toLowerCase() === 'rejected' ? 'bg-orange-500' : 'bg-gray-500'
                  }`}></div>
                  {getStatusText(appointment.status)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Demo Mode Banner */}
          {isDemoMode && (
            <motion.div 
              className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4"
              variants={itemVariants}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full mr-3 flex-shrink-0">
                  <FaInfoCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                    {isArabic ? 'وضع العرض التوضيحي' : 'Demo Mode'}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {isArabic 
                      ? 'البيانات المعروضة هي بيانات تجريبية نظراً لعدم توفر اتصال بالخادم. جميع الوظائف تعمل بشكل طبيعي للاختبار.'
                      : 'The displayed data is mock/demo data due to server unavailability. All features work normally for testing purposes.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Live Data Banner */}
          {!isDemoMode && appointment && (
            <motion.div 
              className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4"
              variants={itemVariants}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3 flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                    {isArabic ? 'متصل بالخادم' : 'Connected to Server'}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {isArabic 
                      ? 'البيانات المعروضة حقيقية من قاعدة البيانات. جميع التحديثات ستكون دائمة.'
                      : 'Displaying real data from the database. All updates will be permanent.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appointment Overview */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {appointment.service_category?.name || (isArabic ? 'خدمة منزلية' : 'Home Service')}
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">
                        {isArabic ? 'تفاصيل الخدمة المطلوبة' : 'Requested service details'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${appointment.estimated_cost || '100.00'}
                      </p>
                      <p className="text-blue-100 text-sm">
                        {isArabic ? 'التكلفة المقدرة' : 'Estimated cost'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date & Time */}
                    <div className="flex items-start">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-4 flex-shrink-0">
                        <FaCalendarAlt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{formatDate(appointment.appointment_date)}</p>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                          <FaClock className="w-3 h-3 mr-1" />
                          {formatTime(appointment.start_time)} 
                          {appointment.end_time && ` - ${formatTime(appointment.end_time)}`}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mr-4 flex-shrink-0">
                        <FaMapMarkerAlt className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {isArabic ? 'العنوان' : 'Location'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {appointment.location || (isArabic ? 'لم يتم تحديد العنوان بعد' : 'Address not specified yet')}
                        </p>
                        {appointment.client?.address && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {appointment.client.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Description */}
                  {appointment.service_description && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {isArabic ? 'وصف الخدمة' : 'Service Description'}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">{appointment.service_description}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                      <h3 className="font-medium text-amber-900 dark:text-amber-300 mb-2 flex items-center">
                        <FaInfoCircle className="w-4 h-4 mr-2" />
                        {isArabic ? 'ملاحظات إضافية' : 'Additional Notes'}
                      </h3>
                      <p className="text-amber-800 dark:text-amber-200">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Professional Details */}
              {professional && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaUser className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    {isArabic ? 'معلومات مقدم الخدمة' : 'Service Provider Details'}
                  </h2>
                  
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <img
                      src={professional.profile_image || '/default-avatar.png'}
                      alt={professional.business_name}
                      className="h-16 w-16 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {professional.business_name || professional.user?.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {professional.business_description || professional.profession || (isArabic ? 'مقدم خدمة' : 'Service Provider')}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex mr-2">
                          {renderStars(professional.average_rating)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({professional.average_rating?.toFixed(1) || '0.0'}) • {professional.review_count || 0} {isArabic ? 'تقييم' : 'reviews'}
                        </span>
                      </div>

                      {/* Contact Information */}
                      <div className="flex flex-wrap gap-4">
                        {professional.user?.phone_number && (
                          <a
                            href={`tel:${professional.user.phone_number}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <FaPhone className="mr-2 h-4 w-4" />
                            {professional.user.phone_number}
                          </a>
                        )}
                        {professional.user?.email && (
                          <a
                            href={`mailto:${professional.user.email}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <FaEnvelope className="mr-2 h-4 w-4" />
                            {professional.user.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Information */}
              {payment && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaCreditCard className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    {isArabic ? 'معلومات الدفع' : 'Payment Information'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{isArabic ? 'المبلغ المدفوع' : 'Amount Paid'}</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">${payment.amount}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</p>
                      <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {payment.payment_method || (isArabic ? 'بطاقة ائتمان' : 'Credit Card')}
                      </p>
                    </div>
                    {payment.created_at && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{isArabic ? 'تاريخ الدفع' : 'Payment Date'}</p>
                        <p className="text-gray-900 dark:text-white font-semibold">{formatDate(payment.created_at)}</p>
                      </div>
                    )}
                    {payment.transaction_id && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{isArabic ? 'رقم المعاملة' : 'Transaction ID'}</p>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">{payment.transaction_id}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Status Actions */}
              {getAvailableActions(appointment.status).length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaCog className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    {isArabic ? 'إجراءات الموعد' : 'Appointment Actions'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getAvailableActions(appointment.status).map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleStatusUpdate(action.status)}
                        disabled={isUpdatingStatus}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                          action.color === 'blue' 
                            ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 dark:text-blue-300'
                            : action.color === 'emerald'
                            ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-800/30 dark:text-emerald-300'
                            : action.color === 'green'
                            ? 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:hover:bg-green-800/30 dark:text-green-300'
                            : action.color === 'orange'
                            ? 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:hover:bg-orange-800/30 dark:text-orange-300'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-900/20 dark:hover:bg-gray-800/30 dark:text-gray-300'
                        } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                      >
                        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-2">
                          {isUpdatingStatus ? (
                            <FaSpinner className="w-5 h-5 animate-spin" />
                          ) : (
                            <action.icon className="w-5 h-5" />
                          )}
                          <span className="font-semibold">{action.label}</span>
                        </div>
                        <p className="text-sm opacity-80">{action.description}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaTools className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
                </h3>
                
                <div className="space-y-3">
                  {/* Message Professional */}
                  {conversation ? (
                    <Link
                      to={`/messages/${conversation.id}`}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <FaComments className="mr-2 h-4 w-4" />
                      {isArabic ? 'إرسال رسالة' : 'Send Message'}
                    </Link>
                  ) : (
                    <button
                      onClick={() => alert(isArabic ? 'ميزة الرسائل ستكون متاحة قريباً' : 'Messaging feature coming soon')}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <FaComments className="mr-2 h-4 w-4" />
                      {isArabic ? 'بدء محادثة' : 'Start Chat'}
                    </button>
                  )}

                  {/* View Professional Profile */}
                  {professional && (
                    <Link
                      to={`/pros/${professional.id}`}
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FaUser className="mr-2 h-4 w-4" />
                      {isArabic ? 'عرض الملف الشخصي' : 'View Profile'}
                    </Link>
                  )}

                  {/* Download Invoice */}
                  {payment && payment.status === 'completed' && (
                    <button
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => alert(isArabic ? 'ميزة تحميل الفاتورة قيد التطوير' : 'Invoice download feature under development')}
                    >
                      <FaFileInvoice className="mr-2 h-4 w-4" />
                      {isArabic ? 'تحميل الفاتورة' : 'Download Invoice'}
                    </button>
                  )}

                  {/* Share Appointment */}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: isArabic ? 'تفاصيل الموعد' : 'Appointment Details',
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert(isArabic ? 'تم نسخ الرابط' : 'Link copied to clipboard');
                      }
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaShareAlt className="mr-2 h-4 w-4" />
                    {isArabic ? 'مشاركة الموعد' : 'Share Appointment'}
                  </button>
                </div>
              </motion.div>

              {/* Status Timeline */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaHistory className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  {isArabic ? 'مسار حالة الموعد' : 'Status Timeline'}
                </h3>
                
                <div className="space-y-4">
                  {statusHistory.map((historyItem, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        historyItem.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        historyItem.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        historyItem.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        historyItem.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        historyItem.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        <historyItem.icon className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {historyItem.title}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {historyItem.timestamp.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {historyItem.description}
                        </p>
                        {index < statusHistory.length - 1 && (
                          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 ml-5 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Need Help? */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
              >
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                  <FaQuestionCircle className="w-5 h-5 mr-2" />
                  {isArabic ? 'تحتاج مساعدة؟' : 'Need Help?'}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                  {isArabic 
                    ? 'تواصل معنا إذا كانت لديك أي أسئلة حول موعدك أو تحتاج إلى مساعدة'
                    : 'Contact us if you have any questions about your appointment or need assistance'}
                </p>
                <Link
                  to="/support"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  <FaTools className="mr-2 h-4 w-4" />
                  {isArabic ? 'اتصل بالدعم' : 'Contact Support'}
                  <FaChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {isArabic ? 'تأكيد الموعد والدفع' : 'Confirm Appointment & Payment'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {isArabic 
                      ? 'سيتم تأكيد موعدك وتوجيهك لصفحة الدفع لإتمام العملية'
                      : 'Your appointment will be confirmed and you will be redirected to the payment page'}
                  </p>
                  
                  {/* Demo mode notification */}
                  {isDemoMode && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        {isArabic 
                          ? 'وضع تجريبي: سيتم محاكاة عملية الدفع محلياً'
                          : 'Demo mode: Payment will be simulated locally'}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-4 rtl:space-x-reverse">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      onClick={handlePaymentRedirect}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isArabic ? 'متابعة للدفع' : 'Proceed to Payment'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default AppointmentDetailsPage; 