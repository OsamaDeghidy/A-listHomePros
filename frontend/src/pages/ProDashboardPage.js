import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useProfessionalDashboard } from '../hooks/useProfessionalDashboard';
import { useLanguage } from '../hooks/useLanguage';
import { proService } from '../services/api';
import { 
  FaCalendarAlt, 
  FaClipboardList, 
  FaCreditCard, 
  FaUser, 
  FaEnvelope, 
  FaBell, 
  FaClock, 
  FaStar, 
  FaCog, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaCheck,
  FaPlus,
  FaEdit,
  FaEye,
  FaTrendingUp,
  FaUsers,
  FaTools,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaGlobe,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaSearch,
  FaDownload,
  FaShareAlt,
  FaTimes,
  FaBan,
  FaLock,
  FaHardHat
} from 'react-icons/fa';

const ProDashboardPage = () => {
  const { currentUser, isAuthenticated, userRole } = useAuth();
  const { 
    appointments, 
    stats, 
    loading: dashboardLoading, 
    error: dashboardError, 
    activityLog,
    fetchDashboardData, 
    updateAppointmentStatus,
    profileData
  } = useProfessionalDashboard();
  
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [proData, setProData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Enhanced state for Home Pro features
  const [specialistMessages, setSpecialistMessages] = useState([
    {
      id: 1,
      specialist: isArabic ? 'أحمد الخبير' : 'Ahmed Expert',
      project: isArabic ? 'تجديد المطبخ' : 'Kitchen Renovation',
      message: isArabic ? 'نحتاج لمراجعة المواصفات مع العميل' : 'Need to review specifications with client',
      timestamp: '2024-01-15 10:30',
      priority: 'medium',
      read: false
    },
    {
      id: 2,
      specialist: isArabic ? 'سارة المتخصصة' : 'Sarah Specialist',
      project: isArabic ? 'إصلاح السباكة' : 'Plumbing Repair',
      message: isArabic ? 'العمل جاهز للبدء، الطاقم متاح غداً' : 'Work ready to start, crew available tomorrow',
      timestamp: '2024-01-14 15:45',
      priority: 'high',
      read: true
    }
  ]);

  const [availableSpecialists, setAvailableSpecialists] = useState([
    {
      id: 1,
      name: isArabic ? 'أحمد الخبير' : 'Ahmed Expert',
      specialization: isArabic ? 'تجديد المطابخ' : 'Kitchen Renovation',
      rating: 4.8,
      projects: 45,
      rate: 150,
      available: true
    },
    {
      id: 2,
      name: isArabic ? 'سارة المتخصصة' : 'Sarah Specialist',
      specialization: isArabic ? 'السباكة والكهرباء' : 'Plumbing & Electrical',
      rating: 4.9,
      projects: 62,
      rate: 180,
      available: false
    }
  ]);

  const [crewMembers, setCrewMembers] = useState([
    {
      id: 1,
      name: isArabic ? 'محمد العامل' : 'Mohammed Worker',
      skills: [isArabic ? 'نجارة' : 'Carpentry', isArabic ? 'دهان' : 'Painting'],
      status: 'available',
      currentProject: null,
      rating: 4.6,
      location: isArabic ? 'الرياض' : 'Riyadh'
    },
    {
      id: 2,
      name: isArabic ? 'أحمد الفني' : 'Ahmed Technician',
      skills: [isArabic ? 'كهرباء' : 'Electrical', isArabic ? 'تركيبات' : 'Installation'],
      status: 'busy',
      currentProject: isArabic ? 'مشروع فيلا الرياض' : 'Riyadh Villa Project',
      rating: 4.8,
      location: isArabic ? 'جدة' : 'Jeddah'
    }
  ]);

  const [projectSettings, setProjectSettings] = useState([
    {
      id: 1,
      project: isArabic ? 'تجديد المطبخ' : 'Kitchen Renovation',
      client: isArabic ? 'عبدالله السعد' : 'Abdullah Al-Saad',
      useEscrow: true,
      escrowAmount: 2500,
      assignedSpecialist: isArabic ? 'أحمد الخبير' : 'Ahmed Expert',
      assignedCrew: [isArabic ? 'محمد العامل' : 'Mohammed Worker'],
      status: 'in_progress'
    },
    {
      id: 2,
      project: isArabic ? 'إصلاح السباكة' : 'Plumbing Repair',
      client: isArabic ? 'فاطمة النور' : 'Fatma Al-Noor',
      useEscrow: false,
      escrowAmount: 0,
      assignedSpecialist: null,
      assignedCrew: [isArabic ? 'أحمد الفني' : 'Ahmed Technician'],
      status: 'pending'
    }
  ]);

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

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Fetch professional's dashboard data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Initial load with mounted check
    let mounted = true;
    
    const loadInitialData = async () => {
      if (mounted && !isFetching) {
        await fetchDashboardData();
      }
    };
    
    loadInitialData();

    // Set up auto-refresh interval (every 5 minutes)
    // Only if there are no errors
    const refreshInterval = setInterval(async () => {
      if (mounted && !dashboardError && !error && !isFetching) {
        console.log('🔄 Auto-refreshing dashboard data...');
        await fetchDashboardData();
      }
    }, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated, navigate, fetchDashboardData, dashboardError, error, isFetching]);

  // Helper function to generate availability data (should be replaced with real backend data)
  const generateAvailabilityData = (isArabic) => {
    const dayNames = {
      0: isArabic ? 'الأحد' : 'Sunday',
      1: isArabic ? 'الإثنين' : 'Monday',
      2: isArabic ? 'الثلاثاء' : 'Tuesday',
      3: isArabic ? 'الأربعاء' : 'Wednesday',
      4: isArabic ? 'الخميس' : 'Thursday',
      5: isArabic ? 'الجمعة' : 'Friday',
      6: isArabic ? 'السبت' : 'Saturday'
    };
    
    return Object.entries(dayNames).map(([dayNum, dayName]) => ({
      day: dayName,
      dayNum: parseInt(dayNum),
      slots: ['09:00 - 17:00'], // Placeholder - should come from backend
      isAvailable: parseInt(dayNum) >= 1 && parseInt(dayNum) <= 5 // Mon-Fri available
    }));
  };

  // Fetch availability data from backend
  const fetchAvailabilityData = useCallback(async (isArabic) => {
    try {
        const availabilityResponse = await proService.getAvailabilitySlots();
        const availabilityData = availabilityResponse.data.results || [];
        
      const dayNames = {
        0: isArabic ? 'الأحد' : 'Sunday',
        1: isArabic ? 'الإثنين' : 'Monday',
        2: isArabic ? 'الثلاثاء' : 'Tuesday',
        3: isArabic ? 'الأربعاء' : 'Wednesday',
        4: isArabic ? 'الخميس' : 'Thursday',
        5: isArabic ? 'الجمعة' : 'Friday',
        6: isArabic ? 'السبت' : 'Saturday'
      };
      
      return Object.entries(dayNames).map(([dayNum, dayName]) => {
          const daySlots = availabilityData
            .filter(slot => slot.day_of_week === parseInt(dayNum))
            .map(slot => `${slot.start_time} - ${slot.end_time}`);
          
          return {
            day: dayName,
          dayNum: parseInt(dayNum),
          slots: daySlots,
          isAvailable: daySlots.length > 0
          };
        });
    } catch (error) {
      console.warn('⚠️ Could not fetch availability data, using fallback:', error);
      return generateAvailabilityData(isArabic);
    }
  }, []);

  // Enhanced data fetching with availability
  useEffect(() => {
    if (!isAuthenticated || !stats || dashboardLoading) return;
    
    const processProfileData = async () => {
      if (profileData) {
        // Fetch real availability data
        const availabilityData = await fetchAvailabilityData(isArabic);
        
        const processedData = {
          id: profileData.id,
          name: profileData.user?.name || profileData.business_name || (isArabic ? 'مقدم خدمة' : 'Professional'),
          businessName: profileData.business_name || (isArabic ? 'أعمالي' : 'My Business'),
          profession: profileData.profession || (isArabic ? 'مقدم خدمة' : 'Service Provider'),
          avatar: profileData.profile_image || 'https://randomuser.me/api/portraits/men/32.jpg',
          rating: stats.averageRating || 0,
          reviewsCount: stats.reviewsCount || 0,
          completedJobs: stats.completedAppointments || 0,
          upcomingAppointments: stats.upcomingAppointments || 0,
          totalClients: stats.totalClients || 0,
          earnings: {
            week: stats.weeklyEarnings || 0,
            month: stats.monthlyEarnings || 0,
            total: stats.totalEarnings || 0
          },
          // Transform appointments data for display
          recentJobs: appointments.slice(0, 5).map(apt => ({
            id: apt.id,
            client: apt.client?.name || apt.client?.user?.name || 'عميل',
            service: apt.service_category?.name || apt.service || 'خدمة',
            date: apt.appointment_date,
            time: apt.appointment_time || apt.start_time || '00:00',
            amount: parseFloat(apt.estimated_cost) || 0,
            status: apt.status || 'pending'
          })),
          // Use real availability data
          availability: availabilityData,
          appointments: appointments,
          location: profileData.location || profileData.address || (isArabic ? 'الموقع غير محدد' : 'Location not set'),
          phone: profileData.phone || profileData.contact_phone || '',
          email: profileData.user?.email || currentUser?.email || '',
          joinDate: profileData.created_at || profileData.user?.date_joined || new Date().toISOString(),
          isVerified: profileData.is_verified || false,
          description: profileData.description || profileData.bio || '',
          services: profileData.services || [],
          socialLinks: profileData.social_links || {}
        };
        
        setProData(processedData);
        setIsLoading(false);
        setIsFetching(false);
      }
    };
    
    processProfileData();
  }, [profileData, stats, appointments, isAuthenticated, dashboardLoading, isArabic, currentUser, fetchAvailabilityData]);

  // Handle appointment status change with proper workflow
  const handleStatusChange = useCallback(async (appointmentId, newStatus) => {
    try {
      console.log(`🔄 Updating appointment ${appointmentId} to ${newStatus}`);
      
      // Get current appointment data
      const currentAppointment = proData.recentJobs.find(job => job.id === appointmentId);
      if (!currentAppointment) {
        console.error('❌ Appointment not found');
        return;
      }

      // Validate status workflow
      const isValidTransition = validateStatusTransition(currentAppointment.status, newStatus);
      if (!isValidTransition) {
        alert(isArabic 
          ? 'لا يمكن تغيير الحالة بهذا الشكل. يرجى اتباع التسلسل الصحيح.' 
          : 'Invalid status transition. Please follow the correct workflow.'
        );
        return;
      }

      // Handle confirmed status - redirect to payment
      if (newStatus === 'confirmed') {
        const confirmPayment = window.confirm(
          isArabic 
            ? 'سيتم تأكيد الموعد وتوجيهك لصفحة الدفع. هل تريد المتابعة؟'
            : 'The appointment will be confirmed and you will be redirected to payment. Continue?'
        );
        
        if (!confirmPayment) return;
        
        // Update status first
        await updateAppointmentStatus(appointmentId, newStatus);
        
        // Redirect to payment page
        window.open(`/payment?appointment=${appointmentId}`, '_blank');
        
        // Refresh data
        await fetchDashboardData();
        return;
      }

      // Handle other status changes
      const confirmChange = window.confirm(
        isArabic 
          ? `هل أنت متأكد من تغيير حالة الموعد إلى "${getStatusText(newStatus)}"؟`
          : `Are you sure you want to change the appointment status to "${newStatus}"?`
      );
      
      if (!confirmChange) return;

      // Show optimistic update
      const updatedAppointments = proData.recentJobs.map(job =>
        job.id === appointmentId ? { ...job, status: newStatus } : job
      );
      
      setProData(prev => ({
        ...prev,
        recentJobs: updatedAppointments
      }));
      
      // Call the backend through the hook
      const success = await updateAppointmentStatus(appointmentId, newStatus);
      
      if (success) {
        console.log('✅ Appointment status updated successfully');
        
        // Show success message based on status
        const successMessage = getStatusSuccessMessage(newStatus, isArabic);
        if (successMessage) {
          // You can replace this with a toast notification
          setTimeout(() => alert(successMessage), 500);
        }
        
        // Refresh the dashboard data to get latest stats
        await fetchDashboardData();
      } else {
        // Revert optimistic update on failure
        setProData(prev => ({
          ...prev,
          recentJobs: proData.recentJobs
        }));
      }
    } catch (err) {
      console.error('❌ Error updating appointment status:', err);
      // Revert optimistic update
      setProData(prev => ({
        ...prev,
        recentJobs: proData.recentJobs
      }));
    }
  }, [updateAppointmentStatus, fetchDashboardData, proData, isArabic]);

  // Manual refresh function for users
  const handleRefresh = useCallback(async () => {
    try {
      setIsFetching(true);
      console.log('🔄 Manual refresh triggered by user');
      await fetchDashboardData();
      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    } finally {
      setIsFetching(false);
    }
  }, [fetchDashboardData]);

  // Handle service request approval (for client-side)
  const handleServiceApproval = useCallback(async (appointmentId, action) => {
    try {
      const confirmAction = window.confirm(
        isArabic 
          ? `هل أنت متأكد من ${action === 'approve' ? 'قبول' : 'رفض'} طلب الخدمة؟`
          : `Are you sure you want to ${action} this service request?`
      );
      
      if (!confirmAction) return;

      // This would be a separate API endpoint for approvals
      const response = await proService.updateAppointmentStatus(
        appointmentId, 
        action === 'approve' ? 'confirmed' : 'rejected'
      );
      
      if (response) {
        const message = action === 'approve' 
          ? (isArabic ? 'تم قبول طلب الخدمة وتأكيد الموعد' : 'Service request approved and appointment confirmed')
          : (isArabic ? 'تم رفض طلب الخدمة' : 'Service request rejected');
        
        alert(message);
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('❌ Error handling service approval:', error);
      alert(isArabic ? 'حدث خطأ في معالجة الطلب' : 'Error processing request');
    }
  }, [fetchDashboardData, isArabic]);

  // Check if appointment needs client approval
  const needsClientApproval = (appointment) => {
    return appointment.status === 'pending' && appointment.created_by_professional;
  };

  // Get workflow status description
  const getWorkflowDescription = (status) => {
    const descriptions = {
      'pending': isArabic 
        ? 'في انتظار موافقة العميل على الخدمة' 
        : 'Waiting for client approval',
      'confirmed': isArabic 
        ? 'تم تأكيد الموعد - في انتظار الدفع' 
        : 'Appointment confirmed - Payment pending',
      'paid': isArabic 
        ? 'تم الدفع - جاهز لتقديم الخدمة' 
        : 'Payment completed - Ready for service',
      'completed': isArabic 
        ? 'تم إكمال الخدمة بنجاح' 
        : 'Service completed successfully',
      'cancelled': isArabic 
        ? 'تم إلغاء الموعد' 
        : 'Appointment cancelled',
      'rejected': isArabic 
        ? 'تم رفض طلب الخدمة' 
        : 'Service request rejected'
    };
    
    return descriptions[status] || status;
  };

  // Enhanced filter options with workflow states
  const getFilterOptions = () => [
    { value: 'all', label: isArabic ? 'كل الحالات' : 'All Status' },
    { value: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending Approval' },
    { value: 'confirmed', label: isArabic ? 'مؤكد (بحاجة دفع)' : 'Confirmed (Payment Needed)' },
    { value: 'paid', label: isArabic ? 'مدفوع (جاهز للخدمة)' : 'Paid (Ready for Service)' },
    { value: 'completed', label: isArabic ? 'مكتمل' : 'Completed' },
    { value: 'cancelled', label: isArabic ? 'ملغي' : 'Cancelled' },
    { value: 'rejected', label: isArabic ? 'مرفوض' : 'Rejected' }
  ];

  // Performance Analytics data - using real stats
  const getPerformanceMetrics = () => {
    if (!stats) return { completionRate: 0, responseRate: 0, newClients: 0, avgRating: 0 };
    
    // Calculate completion rate
    const totalAppointments = stats.upcomingAppointments + stats.completedAppointments;
    const completionRate = totalAppointments > 0 ? Math.round((stats.completedAppointments / totalAppointments) * 100) : 0;
    
    return {
      completionRate,
      responseRate: 98, // This should come from backend
      newClients: Math.max(0, stats.totalClients - 10), // Simplified calculation
      avgRating: stats.averageRating
    };
  };

  // Get trending data
  const getTrendingData = () => {
    if (!proData) return { earnings: 0, appointments: 0, rating: 0 };
    
    // Simplified trending calculation - in real app, compare with previous period
    return {
      earnings: 12.5, // +12.5% example
      appointments: 8.3, // +8.3% example
      rating: proData.rating > 4.5 ? 2.1 : -1.2 // example trending
    };
  };

  // Filter appointments based on search and status
  const filterAppointments = (appointments) => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => {
      const matchesSearch = !searchQuery || 
        appointment.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.service?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Get status text
  const getStatusText = (status) => {
    if (!isArabic) return status;
    
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'قيد الانتظار';
      case 'cancelled': return 'ملغي';
      case 'paid': return 'مدفوع';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  // Get status color including paid status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'confirmed': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      case 'paid': return 'text-emerald-600 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30';
      case 'rejected': return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  // Get status dot color for appointment cards
  const getStatusDotColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'confirmed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'paid': return 'bg-emerald-500';
      case 'rejected': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Validate status transition according to workflow
  const validateStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
      'pending': ['confirmed', 'cancelled', 'rejected'], // Professional can request, client can approve/reject
      'confirmed': ['paid', 'cancelled'], // After confirmation, payment needed
      'paid': ['completed', 'cancelled'], // After payment, service can be completed
      'completed': [], // Final state
      'cancelled': [], // Final state
      'rejected': [] // Final state - service request was rejected
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  // Get success message for status change
  const getStatusSuccessMessage = (status, isArabic) => {
    const messages = {
      'confirmed': isArabic ? 'تم تأكيد الموعد بنجاح! سيتم توجيهك للدفع.' : 'Appointment confirmed! Redirecting to payment.',
      'paid': isArabic ? 'تم تسجيل الدفع بنجاح!' : 'Payment recorded successfully!',
      'completed': isArabic ? 'تم إكمال الخدمة بنجاح!' : 'Service completed successfully!',
      'cancelled': isArabic ? 'تم إلغاء الموعد.' : 'Appointment cancelled.',
      'rejected': isArabic ? 'تم رفض طلب الخدمة' : 'Service request rejected'
    };
    
    return messages[status] || null;
  };

  // Get available actions for each appointment based on current status
  const getAvailableActions = (currentStatus) => {
    const actions = {
      'pending': [
        { status: 'confirmed', label: isArabic ? 'تأكيد وتوجيه للدفع' : 'Confirm & Pay', color: 'blue', icon: 'confirm' },
        { status: 'cancelled', label: isArabic ? 'إلغاء' : 'Cancel', color: 'red', icon: 'cancel' },
        { status: 'rejected', label: isArabic ? 'رفض' : 'Reject', color: 'orange', icon: 'reject' }
      ],
      'confirmed': [
        { status: 'paid', label: isArabic ? 'تسجيل الدفع' : 'Mark as Paid', color: 'green', icon: 'paid' },
        { status: 'cancelled', label: isArabic ? 'إلغاء' : 'Cancel', color: 'red', icon: 'cancel' }
      ],
      'paid': [
        { status: 'completed', label: isArabic ? 'إكمال الخدمة' : 'Complete Service', color: 'green', icon: 'complete' },
        { status: 'cancelled', label: isArabic ? 'إلغاء' : 'Cancel', color: 'red', icon: 'cancel' }
      ],
      'completed': [],
      'cancelled': [],
      'rejected': []
    };
    
    return actions[currentStatus] || [];
  };

  // Enhanced Home Pro specific functions
  const handleAssignSpecialist = async (projectId, specialistId) => {
    try {
      const confirmAssign = window.confirm(
        isArabic 
          ? 'هل تريد تعيين هذا الأخصائي كممثل للمشروع؟'
          : 'Do you want to assign this specialist as project representative?'
      );
      
      if (!confirmAssign) return;

      // Update project settings
      setProjectSettings(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                assignedSpecialist: availableSpecialists.find(s => s.id === specialistId)?.name 
              }
            : project
        )
      );

      // Here would be the API call
      // await proService.assignSpecialistToProject(projectId, specialistId);
      
      alert(isArabic ? 'تم تعيين الأخصائي بنجاح' : 'Specialist assigned successfully');
    } catch (error) {
      console.error('Error assigning specialist:', error);
      alert(isArabic ? 'حدث خطأ في تعيين الأخصائي' : 'Error assigning specialist');
    }
  };

  const handleToggleEscrow = async (projectId, useEscrow) => {
    try {
      const action = useEscrow ? 'enable' : 'disable';
      const confirmToggle = window.confirm(
        isArabic 
          ? `هل تريد ${useEscrow ? 'تفعيل' : 'إلغاء'} نظام الدفع المضمون لهذا المشروع؟`
          : `Do you want to ${action} escrow for this project?`
      );
      
      if (!confirmToggle) return;

      setProjectSettings(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, useEscrow }
            : project
        )
      );

      // Here would be the API call
      // await proService.toggleProjectEscrow(projectId, useEscrow);
      
      alert(isArabic 
        ? `تم ${useEscrow ? 'تفعيل' : 'إلغاء'} نظام الدفع المضمون`
        : `Escrow ${useEscrow ? 'enabled' : 'disabled'} for project`
      );
    } catch (error) {
      console.error('Error toggling escrow:', error);
    }
  };

  const handleAssignCrew = async (projectId, crewMemberId) => {
    try {
      const crew = crewMembers.find(c => c.id === crewMemberId);
      if (crew.status === 'busy') {
        alert(isArabic ? 'هذا العضو مشغول حالياً' : 'This crew member is currently busy');
        return;
      }

      const confirmAssign = window.confirm(
        isArabic 
          ? `هل تريد تعيين ${crew.name} لهذا المشروع؟`
          : `Do you want to assign ${crew.name} to this project?`
      );
      
      if (!confirmAssign) return;

      // Update project and crew status
      setProjectSettings(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                assignedCrew: [...(project.assignedCrew || []), crew.name]
              }
            : project
        )
      );

      setCrewMembers(prev => 
        prev.map(member => 
          member.id === crewMemberId 
            ? { ...member, status: 'busy', currentProject: projectSettings.find(p => p.id === projectId)?.project }
            : member
        )
      );

      alert(isArabic ? 'تم تعيين العضو بنجاح' : 'Crew member assigned successfully');
    } catch (error) {
      console.error('Error assigning crew:', error);
    }
  };

  const handleMarkMessageRead = (messageId) => {
    setSpecialistMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCrewStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'busy': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Loading state
  if (dashboardLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جارٍ تحميل لوحة التحكم...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (dashboardError || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg max-w-md">
          <div className="flex items-center">
            <FaExclamationTriangle className="w-5 h-5 mr-3" />
            <p>{dashboardError || error}</p>
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
        <button 
          onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
            {isArabic ? 'إعادة المحاولة' : 'Try Again'}
        </button>
          <Link 
            to="/" 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isArabic ? 'العودة للرئيسية' : 'Return to Home'}
          </Link>
        </div>
      </div>
    );
  }
  
  // Only render if we have professional data
  if (!proData) return null;

  const trendingData = getTrendingData();

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'لوحة تحكم المحترف | A-List Home Pros' : 'Professional Dashboard | A-List Home Pros'}</title>
        <meta name="description" content={isArabic ? 'إدارة ملفك المهني والمواعيد والخدمات' : 'Manage your professional profile, appointments, and services'} />
      </Helmet>

      <motion.div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="relative">
                    <img
                      src={proData.avatar}
                      alt={proData.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900"
                    />
                    {proData.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1">
                        <FaCheck className="w-3 h-3" />
                      </div>
                    )}
                  </div>
            <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {isArabic ? 'مرحباً بك، ' : 'Welcome back, '}{proData.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{proData.profession}</p>
                    <div className="flex items-center mt-2 space-x-4 rtl:space-x-reverse">
                      <div className="flex items-center">
                        <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{proData.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({proData.reviewsCount} {isArabic ? 'تقييم' : 'reviews'})
                        </span>
            </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                        <span>{proData.location}</span>
            </div>
          </div>
                </div>
                </div>
                
                <div className="mt-6 lg:mt-0 flex flex-wrap gap-3">
                      <button
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
                      </button>
                      <button
                    onClick={handleRefresh}
                    disabled={isFetching || dashboardLoading}
                    className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${
                      isFetching || dashboardLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title={isArabic ? 'تحديث البيانات' : 'Refresh Data'}
                  >
                    <FaDownload className={`w-4 h-4 mr-2 ${isFetching || dashboardLoading ? 'animate-spin' : ''}`} />
                    {isArabic ? 'تحديث' : 'Refresh'}
                      </button>
                  <Link
                    to="/pro-dashboard/profile"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaEdit className="w-4 h-4 mr-2" />
                    {isArabic ? 'تحرير الملف' : 'Edit Profile'}
                  </Link>
                  <Link
                    to="/pro-dashboard/availability"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaClock className="w-4 h-4 mr-2" />
                    {isArabic ? 'إدارة الأوقات' : 'Manage Schedule'}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Connection Status Indicator */}
            {(dashboardError || error) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                  <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      {isArabic ? 'مشكلة في الاتصال' : 'Connection Issue'}
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {dashboardError || error}
                    </p>
                  </div>
                      <button
                    onClick={handleRefresh}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    {isArabic ? 'إعادة المحاولة' : 'Retry'}
                      </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Actions Dropdown */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link
                    to="/pro-dashboard/services"
                    className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaTools className="w-5 h-5 mr-3 text-blue-500" />
                    <span className="text-sm font-medium">{isArabic ? 'إدارة الخدمات' : 'Manage Services'}</span>
                  </Link>
                  <Link
                    to="/pro-dashboard/calendar"
                    className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaCalendarAlt className="w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm font-medium">{isArabic ? 'جدولة موعد' : 'Schedule Appointment'}</span>
                  </Link>
                  <Link
                    to="/pro-dashboard/messages"
                    className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaEnvelope className="w-5 h-5 mr-3 text-purple-500" />
                    <span className="text-sm font-medium">{isArabic ? 'الرسائل' : 'Messages'}</span>
                  </Link>
                  <Link
                    to="/pro-dashboard/payment-history"
                    className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaCreditCard className="w-5 h-5 mr-3 text-emerald-500" />
                    <span className="text-sm font-medium">{isArabic ? 'المدفوعات' : 'Payments'}</span>
                  </Link>
              </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={itemVariants}
          >
            {/* Upcoming Appointments */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isArabic ? 'المواعيد القادمة' : 'Upcoming'}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.upcomingAppointments || proData.upcomingAppointments || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{trendingData.appointments}%</span>
                        </div>
                        </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FaCalendarAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
            </motion.div>

            {/* Completed Jobs */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isArabic ? 'الأعمال المكتملة' : 'Completed'}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.completedAppointments || proData.completedJobs || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <FaCheck className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-gray-600">{isArabic ? 'هذا الشهر' : 'This month'}</span>
                        </div>
                        </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FaCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
            </motion.div>

            {/* Total Earnings */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isArabic ? 'الأرباح الشهرية' : 'Monthly Earnings'}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    ${(stats?.totalEarnings || proData.earnings?.month || 0).toFixed(0)}
                  </p>
                  <div className="flex items-center mt-2">
                    <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{trendingData.earnings}%</span>
                        </div>
                        </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <FaCreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
            </motion.div>

            {/* Rating */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isArabic ? 'التقييم' : 'Rating'}</p>
                  <div className="flex items-center mt-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {(stats?.averageRating || proData.rating || 0).toFixed(1)}
                    </p>
                    <FaStar className="w-5 h-5 text-yellow-400 ml-2" />
                        </div>
                  <div className="flex items-center mt-2">
                    {trendingData.rating > 0 ? (
                      <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <FaArrowDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${trendingData.rating > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(trendingData.rating)}%
                    </span>
                          </div>
                        </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <FaStar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Appointments */}
            <motion.div 
              className="lg:col-span-2 space-y-6"
              variants={itemVariants}
            >
              {/* Recent Appointments Card */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <FaCalendarAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                                  <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {isArabic ? 'المواعيد الأخيرة' : 'Recent Appointments'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isArabic ? 'آخر المواعيد والحجوزات' : 'Latest appointments and bookings'}
                        </p>
                                    </div>
                                  </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <Link 
                        to="/pro-dashboard/calendar"
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    >
                        <FaEye className="w-4 h-4 mr-1.5" />
                        {isArabic ? 'عرض الكل' : 'View All'}
                                    </Link>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <FaSearch className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={isArabic ? 'البحث في المواعيد...' : 'Search appointments...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                      />
                      {searchQuery && (
                                      <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      >
                          ×
                                      </button>
                                    )}
                                  </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <FaFilter className="w-4 h-4 text-gray-400" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-w-[140px] transition-all duration-200"
                      >
                        {getFilterOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                                </div>
                              </div>
                            </div>
                
                <div className="p-6">
                  {proData.recentJobs && proData.recentJobs.length > 0 ? (
                    <div className="space-y-4">
                      {filterAppointments(proData.recentJobs).length > 0 ? (
                        filterAppointments(proData.recentJobs).map((job, index) => (
                          <motion.div
                            key={job.id}
                            className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                  {job.client?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusDotColor(job.status)}`}></div>
                        </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {job.client}
                                  </p>
                                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                    {getStatusText(job.status)}
                                  </span>
                    </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                                  {job.service}
                                </p>
                                <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                    <FaCalendarAlt className="w-3 h-3" />
                                    <span>{new Date(job.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</span>
                  </div>
                                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                    <FaClock className="w-3 h-3" />
                                    <span>{job.time}</span>
                    </div>
                              </div>
                                {/* Workflow Description */}
                                <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">{isArabic ? 'الحالة:' : 'Status:'}</span> {getWorkflowDescription(job.status)}
                              </div>
                              </div>
                            </div>
                            <div className="text-right rtl:text-left">
                              <p className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                ${job.amount.toFixed(2)}
                              </p>
                              <div className="flex items-center justify-end rtl:justify-start space-x-2 rtl:space-x-reverse mt-2">
                                {getAvailableActions(job.status).length > 0 ? (
                                  getAvailableActions(job.status).map((action, actionIndex) => (
                                    <button
                                      key={actionIndex}
                                      onClick={() => handleStatusChange(job.id, action.status)}
                                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                                        action.color === 'blue' 
                                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50'
                                          : action.color === 'green'
                                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/50'
                                          : action.color === 'red'
                                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50'
                                          : action.color === 'orange'
                                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/50'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:hover:bg-gray-800/50'
                                      }`}
                                      title={action.label}
                                    >
                                      {action.icon === 'confirm' && <FaCheck className="w-3 h-3 mr-1" />}
                                      {action.icon === 'paid' && <FaCreditCard className="w-3 h-3 mr-1" />}
                                      {action.icon === 'complete' && <FaCheck className="w-3 h-3 mr-1" />}
                                      {action.icon === 'cancel' && <FaTimes className="w-3 h-3 mr-1" />}
                                      {action.icon === 'reject' && <FaBan className="w-3 h-3 mr-1" />}
                                      <span className="hidden sm:inline">{action.label}</span>
                                    </button>
                          ))
                        ) : (
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                      <FaEye className="w-3 h-3" />
                                    </button>
                                    <button className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                      <FaShareAlt className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                    </div>
                  </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div 
                          className="text-center py-12"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaSearch className="w-8 h-8 text-gray-400" />
                </div>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {isArabic ? 'لا توجد نتائج للبحث' : 'No results found'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {isArabic ? 'جرب كلمات بحث مختلفة' : 'Try different search terms'}
                          </p>
                        </motion.div>
                      )}
                  </div>
                  ) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCalendarAlt className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isArabic ? 'لا توجد مواعيد حتى الآن' : 'No appointments yet'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        {isArabic ? 'عندما يحجز العملاء مواعيد معك، ستظهر هنا' : 'When clients book appointments with you, they will appear here'}
                      </p>
                      <Link
                        to="/pro-dashboard/calendar"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                      >
                        <FaPlus className="w-4 h-4 mr-2" />
                        {isArabic ? 'إضافة موعد جديد' : 'Add New Appointment'}
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Performance Analytics Card */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                        <FaChartLine className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {isArabic ? 'تحليل الأداء' : 'Performance Analytics'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isArabic ? 'نظرة عامة على أدائك هذا الشهر' : 'Overview of your performance this month'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button 
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className={`p-2 rounded-lg transition-colors ${
                          isFetching 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                        }`}
                        title={isArabic ? 'تحديث البيانات' : 'Refresh Data'}
                      >
                        <FaDownload className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                      <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="week">{isArabic ? 'هذا الأسبوع' : 'This Week'}</option>
                        <option value="month">{isArabic ? 'هذا الشهر' : 'This Month'}</option>
                        <option value="quarter">{isArabic ? 'هذا الربع' : 'This Quarter'}</option>
                      </select>
                      </div>
                    </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                            {isArabic ? 'معدل الإنجاز' : 'Completion Rate'}
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {getPerformanceMetrics().completionRate}%
                          </p>
                        </div>
                        <FaCheck className="w-6 h-6 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            {isArabic ? 'معدل الاستجابة' : 'Response Rate'}
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {getPerformanceMetrics().responseRate}%
                          </p>
                        </div>
                        <FaClock className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                            {isArabic ? 'عملاء جدد' : 'New Clients'}
                          </p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {getPerformanceMetrics().newClients}
                          </p>
                        </div>
                        <FaUsers className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                            {isArabic ? 'متوسط التقييم' : 'Avg. Rating'}
                          </p>
                          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {getPerformanceMetrics().avgRating.toFixed(1)}
                          </p>
                        </div>
                        <FaStar className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Enhanced Sidebar */}
            <motion.div 
              className="space-y-6"
              variants={itemVariants}
            >
              {/* Profile Summary Card */}
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 p-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <img
                      src={proData.avatar}
                      alt={proData.name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{proData.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">{proData.profession}</p>
                  <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse mb-4">
                    <FaStar className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{proData.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({proData.reviewsCount})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{proData.completedJobs}</p>
                      <p className="text-xs text-gray-500">{isArabic ? 'مكتمل' : 'Completed'}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{proData.totalClients}</p>
                      <p className="text-xs text-gray-500">{isArabic ? 'عملاء' : 'Clients'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats Enhanced */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isArabic ? 'إحصائيات سريعة' : 'Quick Stats'}
                  </h3>
                  <div className="p-2 bg-gradient-to-r from-green-400 to-green-500 rounded-lg">
                    <FaChartLine className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <FaUsers className="w-4 h-4 text-white" />
                      </div>
                                <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{isArabic ? 'إجمالي العملاء' : 'Total Clients'}</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{proData.totalClients}</p>
                                  </div>
                                </div>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <FaArrowUp className="w-3 h-3 mr-1" />
                      <span className="text-sm font-semibold">+5</span>
                              </div>
                                </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FaCreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{isArabic ? 'الأرباح الأسبوعية' : 'Weekly Earnings'}</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">${proData.earnings.week.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600 dark:text-blue-400">
                      <FaArrowUp className="w-3 h-3 mr-1" />
                      <span className="text-sm font-semibold">12%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <FaClock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{isArabic ? 'معدل الاستجابة' : 'Response Rate'}</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">98%</p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <FaArrowUp className="w-3 h-3 mr-1" />
                      <span className="text-sm font-semibold">2%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Availability Status Enhanced */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isArabic ? 'حالة التوفر' : 'Availability Status'}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {isArabic ? 'متاح الآن' : 'Available Now'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {proData.availability.slice(0, 4).map((day, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`w-3 h-3 rounded-full ${day.isAvailable ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500'}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">{day.day}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                        day.isAvailable 
                          ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' 
                          : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
                      }`}>
                        {day.isAvailable ? 
                          (isArabic ? 'متاح' : 'Available') : 
                          (isArabic ? 'غير متاح' : 'Unavailable')
                        }
                                  </span>
                    </motion.div>
                  ))}
                                </div>
                                  <Link 
                  to="/pro-dashboard/availability"
                  className="block mt-4 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                                  >
                  {isArabic ? 'إدارة الأوقات المتاحة' : 'Manage Availability'}
                                  </Link>
              </motion.div>

              {/* Recent Activity Enhanced */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isArabic ? 'النشاط الأخير' : 'Recent Activity'}
                  </h3>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">{isArabic ? 'مباشر' : 'Live'}</span>
                                </div>
                              </div>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {activityLog && activityLog.length > 0 ? (
                    activityLog.slice(0, 5).map((activity, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <FaBell className="w-3 h-3 text-white" />
                            </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium leading-relaxed">
                            {activity.content}
                          </p>
                          <div className="flex items-center mt-1 space-x-2 rtl:space-x-reverse">
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                            </p>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                      </div>
                      </motion.div>
                    ))
                    ) : (
                      <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaBell className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        {isArabic ? 'لا توجد أنشطة حديثة' : 'No recent activity'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isArabic ? 'ستظهر التحديثات هنا' : 'Updates will appear here'}
                      </p>
                      </div>
                    )}
                  </div>
                {activityLog && activityLog.length > 5 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/pro-dashboard/activity"
                      className="block text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      {isArabic ? 'عرض جميع الأنشطة' : 'View All Activities'}
                    </Link>
                </div>
              )}
              </motion.div>

              {/* Quick Actions Panel */}
              <motion.div 
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-700 p-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/pro-dashboard/calendar"
                    className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700 group"
                  >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors mb-2">
                      <FaCalendarAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                      {isArabic ? 'التقويم' : 'Calendar'}
                    </span>
                  </Link>

                  <Link
                    to="/pro-dashboard/messages"
                    className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700 group"
                  >
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors mb-2">
                      <FaEnvelope className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                      {isArabic ? 'الرسائل' : 'Messages'}
                    </span>
                  </Link>

                  <Link
                    to="/pro-dashboard/services"
                    className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700 group"
                  >
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors mb-2">
                      <FaTools className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                      {isArabic ? 'الخدمات' : 'Services'}
                    </span>
                  </Link>

                  <Link
                    to="/pro-dashboard/profile"
                    className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-700 group"
                  >
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors mb-2">
                      <FaUser className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                      {isArabic ? 'الملف' : 'Profile'}
                    </span>
                  </Link>
        </div>
              </motion.div>

              {/* Enhanced Home Pro Features */}
              
              {/* Specialist Messages Section */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                        <FaEnvelope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {isArabic ? 'رسائل الأخصائيين' : 'Specialist Messages'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isArabic ? 'رسائل وتحديثات من الأخصائيين المعينين' : 'Messages and updates from assigned specialists'}
                        </p>
                      </div>
                    </div>
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded-full">
                      {specialistMessages.filter(msg => !msg.read).length} {isArabic ? 'جديد' : 'new'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {specialistMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          !message.read 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        }`}
                        onClick={() => handleMarkMessageRead(message.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <FaUser className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{message.specialist}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{message.project}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(message.priority)}`}>
                              {message.priority === 'high' ? (isArabic ? 'عاجل' : 'High') : 
                               message.priority === 'medium' ? (isArabic ? 'متوسط' : 'Medium') : 
                               (isArabic ? 'عادي' : 'Low')}
                            </span>
                            {!message.read && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{message.message}</p>
                        <p className="text-xs text-gray-500">{message.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Project Management Section */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                        <FaUsers className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {isArabic ? 'إدارة المشاريع' : 'Project Management'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isArabic ? 'تعيين الأخصائيين والطاقم وإعداد الدفع المضمون' : 'Assign specialists, crew, and configure escrow settings'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {projectSettings.map((project) => (
                      <div key={project.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{project.project}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {isArabic ? 'العميل:' : 'Client:'} {project.client}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {project.status === 'in_progress' ? (isArabic ? 'قيد التنفيذ' : 'In Progress') : (isArabic ? 'في الانتظار' : 'Pending')}
                          </span>
                        </div>

                        {/* Escrow Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <FaLock className="text-purple-500" />
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {isArabic ? 'الدفع المضمون' : 'Escrow Payment'}
                              </span>
                              {project.useEscrow && (
                                <p className="text-xs text-gray-500">
                                  {isArabic ? 'المبلغ:' : 'Amount:'} ${project.escrowAmount}
                                </p>
                              )}
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={project.useEscrow}
                              onChange={(e) => handleToggleEscrow(project.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {/* Specialist Assignment */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {isArabic ? 'الأخصائي المعين' : 'Assigned Specialist'}
                            </span>
                            {!project.assignedSpecialist && (
                              <button 
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                onClick={() => setShowQuickActions(!showQuickActions)}
                              >
                                {isArabic ? 'تعيين أخصائي' : 'Assign Specialist'}
                              </button>
                            )}
                          </div>
                          
                          {project.assignedSpecialist ? (
                            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <FaUser className="text-green-600 dark:text-green-400" />
                              <span className="text-sm text-gray-900 dark:text-white">{project.assignedSpecialist}</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {availableSpecialists.filter(s => s.available).map((specialist) => (
                                <button
                                  key={specialist.id}
                                  onClick={() => handleAssignSpecialist(project.id, specialist.id)}
                                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <FaUser className="text-blue-600 dark:text-blue-400" />
                                    <div className="text-left rtl:text-right">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">{specialist.name}</span>
                                      <p className="text-xs text-gray-500">{specialist.specialization}</p>
                                    </div>
                                  </div>
                                  <div className="text-right rtl:text-left">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">${specialist.rate}/hr</span>
                                    <div className="flex items-center">
                                      <FaStar className="text-yellow-400 w-3 h-3 mr-1" />
                                      <span className="text-xs text-gray-500">{specialist.rating}</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Crew Assignment */}
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                            {isArabic ? 'طاقم العمل المعين' : 'Assigned Crew'}
                          </span>
                          
                          {project.assignedCrew && project.assignedCrew.length > 0 ? (
                            <div className="space-y-2 mb-3">
                              {project.assignedCrew.map((crew, index) => (
                                <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <FaHardHat className="text-blue-600 dark:text-blue-400" />
                                  <span className="text-sm text-gray-900 dark:text-white">{crew}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mb-3">{isArabic ? 'لم يتم تعيين طاقم عمل بعد' : 'No crew assigned yet'}</p>
                          )}
                          
                          <div className="grid grid-cols-1 gap-2">
                            {crewMembers.filter(c => c.status === 'available').map((crew) => (
                              <button
                                key={crew.id}
                                onClick={() => handleAssignCrew(project.id, crew.id)}
                                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              >
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                  <FaHardHat className="text-green-600 dark:text-green-400" />
                                  <div className="text-left rtl:text-right">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{crew.name}</span>
                                    <p className="text-xs text-gray-500">{crew.skills.join(', ')}</p>
                                  </div>
                                </div>
                                <div className="text-right rtl:text-left">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCrewStatusColor(crew.status)}`}>
                                    {crew.status === 'available' ? (isArabic ? 'متاح' : 'Available') : (isArabic ? 'مشغول' : 'Busy')}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Performance Analytics Card */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                        <FaChartLine className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {isArabic ? 'تحليل الأداء' : 'Performance Analytics'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isArabic ? 'نظرة عامة على أدائك هذا الشهر' : 'Overview of your performance this month'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button 
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className={`p-2 rounded-lg transition-colors ${
                          isFetching 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                        }`}
                        title={isArabic ? 'تحديث البيانات' : 'Refresh Data'}
                      >
                        <FaDownload className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                      <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="week">{isArabic ? 'هذا الأسبوع' : 'This Week'}</option>
                        <option value="month">{isArabic ? 'هذا الشهر' : 'This Month'}</option>
                        <option value="quarter">{isArabic ? 'هذا الربع' : 'This Quarter'}</option>
                      </select>
                      </div>
                    </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                            {isArabic ? 'معدل الإنجاز' : 'Completion Rate'}
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {getPerformanceMetrics().completionRate}%
                          </p>
                        </div>
                        <FaCheck className="w-6 h-6 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            {isArabic ? 'معدل الاستجابة' : 'Response Rate'}
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {getPerformanceMetrics().responseRate}%
                          </p>
                        </div>
                        <FaClock className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                            {isArabic ? 'عملاء جدد' : 'New Clients'}
                          </p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {getPerformanceMetrics().newClients}
                          </p>
                        </div>
                        <FaUsers className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                            {isArabic ? 'متوسط التقييم' : 'Avg. Rating'}
                          </p>
                          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {getPerformanceMetrics().avgRating.toFixed(1)}
                          </p>
                        </div>
                        <FaStar className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
      </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProDashboardPage; 