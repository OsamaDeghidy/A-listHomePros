import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { 
  schedulingService, 
  messagingService, 
  paymentService, 
  alistProsService 
} from '../services/api';
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock,
  FaComments,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaPlus,
  FaChartLine,
  FaMapMarkerAlt,
  FaUser,
  FaStar,
  FaExclamationCircle,
  FaEye,
  FaArrowRight,
  FaEnvelope,
  FaDollarSign,
  FaProjectDiagram,
  FaClipboardList,
  FaUsers,
  FaShieldAlt,
  FaCreditCard,
  FaLock,
  FaExclamationTriangle,
  FaUserShield
} from 'react-icons/fa';

const ClientDashboardPage = () => {
  const { currentUser, isAuthenticated, userRole } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  
  // Data states
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
    unreadMessages: 0,
    upcomingThisWeek: 0,
    totalBookings: 12,
    completedProjects: 8,
    averageRating: 4.7,
    activeEscrows: 3,
    totalEscrowFunded: 8500
  });

  // Escrow accounts data
  const [escrowAccounts, setEscrowAccounts] = useState([
    {
      id: 1,
      projectTitle: isArabic ? 'تجديد المطبخ' : 'Kitchen Renovation',
      specialist: isArabic ? 'أحمد الخبير' : 'Ahmed Expert',
      totalAmount: 2500,
      status: 'funded',
      fundedAt: '2024-01-10',
      description: isArabic ? 'تجديد كامل للمطبخ مع أجهزة جديدة' : 'Complete kitchen renovation with new appliances'
    },
    {
      id: 2,
      projectTitle: isArabic ? 'إصلاح السباكة' : 'Plumbing Repair',
      specialist: isArabic ? 'سارة المتخصصة' : 'Sarah Specialist',
      totalAmount: 800,
      status: 'in_progress',
      fundedAt: '2024-01-12',
      description: isArabic ? 'إصلاح تسريبات المياه والأنابيب' : 'Fix water leaks and pipe repairs'
    },
    {
      id: 3,
      projectTitle: isArabic ? 'تركيب نظام كهربائي' : 'Electrical Installation',
      specialist: null,
      totalAmount: 1200,
      status: 'pending',
      fundedAt: null,
      description: isArabic ? 'تركيب نظام كهربائي جديد للمنزل' : 'Install new electrical system for home'
    }
  ]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [
        appointmentsRes,
        conversationsRes,
        paymentsRes
      ] = await Promise.all([
        schedulingService.getAppointments().catch(err => ({ data: { results: [] } })),
        messagingService.getConversations().catch(err => ({ data: { results: [] } })),
        paymentService.getPayments().catch(err => ({ data: { results: [] } }))
      ]);

      const appointmentsData = appointmentsRes.data.results || [];
      const conversationsData = conversationsRes.data.results || [];
      const paymentsData = paymentsRes.data.results || [];

      // Enhance recent appointments with professional details (limit to 5)
      const enhancedAppointments = await Promise.all(
        appointmentsData.slice(0, 5).map(async (appointment) => {
          if (appointment.alistpro) {
            try {
              // Extract the correct ID - it could be alistpro.id or alistpro_id
              const alistproId = typeof appointment.alistpro === 'object' 
                ? appointment.alistpro.id || appointment.alistpro_id
                : appointment.alistpro;
                
              if (alistproId) {
                const proRes = await alistProsService.getProfileDetail(alistproId);
                return {
                  ...appointment,
                  professional: proRes.data
                };
              }
            } catch (err) {
              console.error('Error fetching professional details:', err);
              return appointment;
            }
          }
          return appointment;
        })
      );

      setRecentAppointments(enhancedAppointments);
      setRecentConversations(conversationsData.slice(0, 5)); // Limit to 5 recent conversations

      // Calculate statistics
      calculateStats(appointmentsData, conversationsData, paymentsData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(isArabic ? 'فشل في تحميل بيانات لوحة التحكم' : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments, conversations, payments) => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(apt => apt.status === 'REQUESTED' || apt.status === 'PENDING').length;
    const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED').length;
    
    const upcomingThisWeek = appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= now && aptDate <= oneWeekFromNow && 
             (apt.status === 'CONFIRMED' || apt.status === 'REQUESTED');
    }).length;

    const totalSpent = payments
      .filter(payment => payment.status === 'COMPLETED' || payment.status === 'PAID')
      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

    const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

    setStats({
      totalAppointments,
      pendingAppointments, 
      completedAppointments,
      totalSpent,
      unreadMessages,
      upcomingThisWeek,
      totalBookings: 12,
      completedProjects: 8,
      averageRating: 4.7,
      activeEscrows: 3,
      totalEscrowFunded: 8500
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'REQUESTED':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    if (!status) return isArabic ? 'غير محدد' : 'Unknown';
    
    const statusMap = {
      'REQUESTED': isArabic ? 'مطلوب' : 'Requested',
      'PENDING': isArabic ? 'في الانتظار' : 'Pending', 
      'CONFIRMED': isArabic ? 'مؤكد' : 'Confirmed',
      'COMPLETED': isArabic ? 'مكتمل' : 'Completed',
      'CANCELLED': isArabic ? 'ملغي' : 'Cancelled'
    };
    
    return statusMap[status.toUpperCase()] || status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM format
  };

  const getParticipantName = (conversation) => {
    if (!conversation.participants) return isArabic ? 'محادثة' : 'Conversation';
    
    // Find the other participant (not current user)
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUser?.id
    );
    
    return otherParticipant?.first_name + ' ' + otherParticipant?.last_name || 
           otherParticipant?.email || 
           (isArabic ? 'مستخدم' : 'User');
  };

  // Tab navigation items including new Escrow tab
  const tabItems = [
    {
      id: 'overview',
      label: isArabic ? 'نظرة عامة' : 'Overview',
      icon: FaProjectDiagram
    },
    {
      id: 'bookings',
      label: isArabic ? 'الحجوزات' : 'Bookings', 
      icon: FaCalendarAlt
    },
    {
      id: 'escrow',
      label: isArabic ? 'الحساب المضمون' : 'Escrow Funding',
      icon: FaShieldAlt
    },
    {
      id: 'messages',
      label: isArabic ? 'الرسائل' : 'Messages',
      icon: FaEnvelope
    }
  ];

  // Helper functions for escrow
  const getEscrowStatusColor = (status) => {
    switch (status) {
      case 'funded': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'released': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'disputed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEscrowStatusText = (status) => {
    switch (status) {
      case 'funded': return isArabic ? 'ممول' : 'Funded';
      case 'in_progress': return isArabic ? 'قيد التنفيذ' : 'In Progress';
      case 'pending': return isArabic ? 'في الانتظار' : 'Pending';
      case 'released': return isArabic ? 'تم الإنجاز' : 'Released';
      case 'disputed': return isArabic ? 'متنازع عليه' : 'Disputed';
      default: return status;
    }
  };

  const renderEscrowTab = () => (
    <div className="space-y-6">
      {/* Escrow Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                {isArabic ? 'إجمالي المبلغ المضمون' : 'Total Escrow Funded'}
              </p>
              <p className="text-2xl font-bold">${stats.totalEscrowFunded.toLocaleString()}</p>
      </div>
            <FaShieldAlt className="text-3xl text-green-200" />
        </div>
        </motion.div>

          <motion.div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                {isArabic ? 'الحسابات النشطة' : 'Active Escrows'}
              </p>
              <p className="text-2xl font-bold">{stats.activeEscrows}</p>
            </div>
            <FaProjectDiagram className="text-3xl text-blue-200" />
            </div>
          </motion.div>

              <motion.div 
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                {isArabic ? 'المشاريع المكتملة' : 'Completed Projects'}
              </p>
              <p className="text-2xl font-bold">{stats.completedProjects}</p>
                </div>
            <FaCheckCircle className="text-3xl text-purple-200" />
                        </div>
        </motion.div>
      </div>

      {/* Create New Escrow Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isArabic ? 'حساباتي المضمونة' : 'My Escrow Accounts'}
        </h3>
        <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FaPlus />
          <span>{isArabic ? 'إنشاء حساب مضمون' : 'Create Escrow'}</span>
        </button>
      </div>

      {/* Escrow Accounts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {escrowAccounts.map((escrow) => (
                          <motion.div 
            key={escrow.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {escrow.projectTitle}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {escrow.description}
                </p>
                {escrow.specialist && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <FaUserShield className="text-purple-500" />
                    <span>{isArabic ? 'الأخصائي:' : 'Specialist:'} {escrow.specialist}</span>
                        </div>
                )}
                        </div>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getEscrowStatusColor(escrow.status)}`}>
                {getEscrowStatusText(escrow.status)}
                        </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${escrow.totalAmount.toLocaleString()}
              </div>
              {escrow.fundedAt && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isArabic ? 'ممول في' : 'Funded on'}: {escrow.fundedAt}
                </div>
              )}
                        </div>

            <div className="flex space-x-3 rtl:space-x-reverse">
              <button className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <FaEye />
                <span>{isArabic ? 'عرض التفاصيل' : 'View Details'}</span>
              </button>
              
              {escrow.status === 'pending' && (
                <button className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                  <FaCreditCard />
                  <span>{isArabic ? 'تمويل الآن' : 'Fund Now'}</span>
                </button>
              )}
              
              {escrow.status === 'in_progress' && (
                <button className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                  <FaCheckCircle />
                  <span>{isArabic ? 'مراجعة العمل' : 'Review Work'}</span>
                </button>
              )}
                        </div>
          </motion.div>
        ))}
      </div>

      {/* Escrow Information Card */}
                          <motion.div 
        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start space-x-4 rtl:space-x-reverse">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <FaLock className="text-blue-600 dark:text-blue-400 text-xl" />
                        </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {isArabic ? 'حماية الدفع المضمون' : 'Escrow Payment Protection'}
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
              {isArabic 
                ? 'نحمي أموالك في حساب مضمون حتى إكمال العمل وموافقتك عليه. يتم الإشراف على المشروع من قبل أخصائي معتمد.'
                : 'Your money is protected in escrow until work is completed and approved. Projects are supervised by certified A-List Specialists.'
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <FaShieldAlt className="text-green-600" />
                <span className="text-blue-800 dark:text-blue-200">
                  {isArabic ? 'حماية كاملة للأموال' : 'Full Payment Protection'}
                        </span>
                        </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <FaUserShield className="text-purple-600" />
                <span className="text-blue-800 dark:text-blue-200">
                  {isArabic ? 'إشراف الأخصائيين' : 'Specialist Supervision'}
                        </span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <FaCheckCircle className="text-blue-600" />
                <span className="text-blue-800 dark:text-blue-200">
                  {isArabic ? 'ضمان جودة العمل' : 'Quality Assurance'}
                </span>
              </div>
            </div>
          </div>
        </div>
              </motion.div>
            </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isArabic ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'لوحة التحكم | A-List Home Pros' : 'Dashboard | A-List Home Pros'}</title>
      </Helmet>

                <div className="space-y-6">
        {/* Welcome Header */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between ${isArabic ? 'text-right' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isArabic 
                ? `مرحباً بعودتك، ${currentUser?.first_name || 'المستخدم'}` 
                : `Welcome back, ${currentUser?.first_name || 'User'}`}
            </h1>
            <p className="mt-2 text-gray-600">
              {isArabic ? 'إليك ملخص نشاطك الأخير' : 'Here\'s a summary of your recent activity'}
            </p>
          </div>
          <Link
            to="/search"
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <FaPlus className={`${isArabic ? 'ml-2' : 'mr-2'} h-5 w-5`} />
            {isArabic ? 'حجز خدمة جديدة' : 'Book New Service'}
          </Link>
        </div>

                  {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white"
          >
            <div className="flex items-center justify-between">
            <div>
                <p className="text-blue-100 text-sm">{isArabic ? 'هذا الأسبوع' : 'This Week'}</p>
                <p className="text-3xl font-bold">{stats.upcomingThisWeek}</p>
                <p className="text-blue-100 text-sm">{isArabic ? 'موعد قادم' : 'Upcoming'}</p>
                          </div>
              <FaCalendarCheck className="h-12 w-12 text-blue-200" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">{isArabic ? 'في الانتظار' : 'Pending'}</p>
                <p className="text-3xl font-bold">{stats.pendingAppointments}</p>
                <p className="text-yellow-100 text-sm">{isArabic ? 'موعد' : 'Appointments'}</p>
                          </div>
              <FaClock className="h-12 w-12 text-yellow-200" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">{isArabic ? 'مكتملة' : 'Completed'}</p>
                <p className="text-3xl font-bold">{stats.completedAppointments}</p>
                <p className="text-green-100 text-sm">{isArabic ? 'خدمة' : 'Services'}</p>
                          </div>
              <FaCheckCircle className="h-12 w-12 text-green-200" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">{isArabic ? 'إجمالي المصروفات' : 'Total Spent'}</p>
                <p className="text-3xl font-bold">${stats.totalSpent.toFixed(2)}</p>
                <p className="text-purple-100 text-sm">
                  <FaChartLine className="inline mr-1" />
                  {isArabic ? 'هذا الشهر' : 'This month'}
                </p>
                          </div>
              <FaMoneyBillWave className="h-12 w-12 text-purple-200" />
                      </div>
                    </motion.div>
                  </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Appointments */}
                  <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden"
                  >
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{isArabic ? 'المواعيد الأخيرة' : 'Recent Appointments'}</h3>
              <Link
                to="/dashboard/calendar" 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                {isArabic ? 'عرض الكل' : 'View All'}
                <FaArrowRight className={`${isArabic ? 'mr-1' : 'ml-1'} h-3 w-3`} />
              </Link>
                    </div>
            <div className="p-6">
              {recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {recentAppointments.map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                                  <img 
                          src={appointment.professional?.profile_image || '/default-avatar.png'}
                          alt={appointment.professional?.business_name}
                          className="h-12 w-12 rounded-full object-cover mr-4"
                                  />
                                  <div>
                          <h4 className="font-medium text-gray-900">{appointment.service_category?.name || 'Service'}</h4>
                                    <p className="text-sm text-gray-600">
                            {isArabic ? 'مع' : 'with'} {appointment.professional?.business_name || 'Professional'}
                                    </p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <FaCalendarAlt className="mr-1" />
                            {formatDate(appointment.appointment_date)} - {formatTime(appointment.start_time)}
                                    </div>
                                    </div>
                                  </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                                    </span>
                                    <Link 
                          to={`/appointments/${appointment.id}`}
                          className="block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                    >
                          <FaEye className="inline mr-1" />
                          {isArabic ? 'عرض' : 'View'}
                                    </Link>
                                </div>
                                </div>
                  ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                  <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">{isArabic ? 'لا توجد مواعيد حتى الآن' : 'No appointments yet'}</p>
                              <Link 
                                to="/search"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                    <FaPlus className="mr-2 h-4 w-4" />
                    {isArabic ? 'احجز الآن' : 'Book Now'}
                              </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>

          {/* Quick Actions & Messages */}
                  <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{isArabic ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
              <div className="space-y-3">
                          <Link 
                            to="/search"
                  className="flex items-center w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                  <FaPlus className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium">{isArabic ? 'حجز خدمة جديدة' : 'Book New Service'}</span>
                          </Link>
                          <Link 
                            to="/dashboard/messages"
                  className="flex items-center w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                          >
                  <FaComments className="h-5 w-5 text-green-600 mr-3" />
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium">{isArabic ? 'الرسائل' : 'Messages'}</span>
                    {stats.unreadMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {stats.unreadMessages}
                            </span>
                    )}
                            </div>
                          </Link>
                          <Link 
                  to="/dashboard/calendar"
                  className="flex items-center w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                          >
                  <FaCalendarAlt className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium">{isArabic ? 'التقويم' : 'Calendar'}</span>
                          </Link>
                      </div>
                    </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{isArabic ? 'الرسائل الأخيرة' : 'Recent Messages'}</h3>
                <Link
                  to="/dashboard/messages" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                  {isArabic ? 'عرض الكل' : 'View All'}
                </Link>
                    </div>
              <div className="p-6">
                {recentConversations.length > 0 ? (
                  <div className="space-y-3">
                    {recentConversations.slice(0, 3).map(conversation => (
                      <Link 
                        key={conversation.id}
                        to={`/dashboard/messages/${conversation.id}`}
                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {getParticipantName(conversation)}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {conversation.last_message?.content || (isArabic ? 'لا توجد رسائل' : 'No messages')}
                            </p>
                                    </div>
                          {conversation.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                              {conversation.unread_count}
                                    </span>
                                    )}
                                  </div>
                                      </Link>
                    ))}
                      </div>
                    ) : (
                  <div className="text-center py-6">
                    <FaComments className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{isArabic ? 'لا توجد رسائل' : 'No messages yet'}</p>
                  </div>
              )}
                    </div>
                  </div>
                </motion.div>
        </div>
      </div>
    </>
  );
};

export default ClientDashboardPage; 