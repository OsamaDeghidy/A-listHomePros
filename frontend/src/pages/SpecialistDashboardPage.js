import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, 
  FaUsers, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaDollarSign,
  FaStar,
  FaProjectDiagram,
  FaClipboardList,
  FaPhone,
  FaVideo,
  FaClock,
  FaBriefcase,
  FaAward,
  FaGraduationCap,
  FaChevronRight,
  FaEye,
  FaDownload,
  FaUpload,
  FaFileAlt,
  FaComments,
  FaBell
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';

const SpecialistDashboardPage = () => {
  const { currentUser, isAuthenticated, userRole } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalConsultations: 45,
    activeProjects: 8,
    monthlyEarnings: 15750,
    clientSatisfaction: 4.8,
    responseTime: '2.5 hrs',
    completionRate: 98
  });

  const [consultations, setConsultations] = useState([
    {
      id: 1,
      clientName: isArabic ? 'أحمد محمد' : 'Ahmed Mohamed',
      projectType: isArabic ? 'تجديد منزل' : 'Home Renovation',
      status: 'scheduled',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'video',
      fee: 250
    },
    {
      id: 2,
      clientName: isArabic ? 'سارة أحمد' : 'Sarah Ahmed',
      projectType: isArabic ? 'تصميم مطبخ' : 'Kitchen Design',
      status: 'completed',
      date: '2024-01-12',
      time: '2:00 PM',
      type: 'site_visit',
      fee: 400
    },
    {
      id: 3,
      clientName: isArabic ? 'محمد علي' : 'Mohamed Ali',
      projectType: isArabic ? 'استشارة سباكة' : 'Plumbing Consultation',
      status: 'pending',
      date: '2024-01-18',
      time: '11:00 AM',
      type: 'phone',
      fee: 150
    }
  ]);

  // Escrow projects managed by specialist
  const [escrowProjects, setEscrowProjects] = useState([
    {
      id: 1,
      projectTitle: isArabic ? 'تجديد شقة الرياض' : 'Riyadh Apartment Renovation',
      clientName: isArabic ? 'عبدالله السعد' : 'Abdullah Al-Saad',
      totalAmount: 12000,
      platformFee: 600,
      status: 'funded',
      fundedAt: '2024-01-10',
      workOrders: [
        { id: 1, assignedTo: 'Mike Crew', type: 'crew', title: 'Demolition Work', amount: 2000, status: 'accepted' },
        { id: 2, assignedTo: 'Ahmed Contractor', type: 'contractor', title: 'Electrical Installation', amount: 3500, status: 'pending' }
      ],
      milestones: [
        { title: 'Planning & Assessment', amount: 1000, status: 'completed', dueDate: '2024-01-15' },
        { title: 'Demolition', amount: 2000, status: 'in_progress', dueDate: '2024-01-20' },
        { title: 'Construction', amount: 7000, status: 'pending', dueDate: '2024-02-15' },
        { title: 'Finishing', amount: 2000, status: 'pending', dueDate: '2024-03-01' }
      ]
    },
    {
      id: 2,
      projectTitle: isArabic ? 'تصميم مطبخ جدة' : 'Jeddah Kitchen Design',
      clientName: isArabic ? 'فاطمة النور' : 'Fatma Al-Noor',
      totalAmount: 8500,
      platformFee: 425,
      status: 'in_progress',
      fundedAt: '2024-01-12',
      workOrders: [
        { id: 3, assignedTo: 'Sara Designer', type: 'contractor', title: 'Kitchen Design', amount: 3000, status: 'accepted' },
        { id: 4, assignedTo: 'Installation Crew', type: 'crew', title: 'Cabinet Installation', amount: 4500, status: 'pending' }
      ],
      milestones: [
        { title: 'Design Phase', amount: 3000, status: 'completed', dueDate: '2024-01-20' },
        { title: 'Installation', amount: 5500, status: 'pending', dueDate: '2024-02-10' }
      ]
    }
  ]);

  // Client requests needing specialist assessment
  const [clientRequests, setClientRequests] = useState([
    {
      id: 1,
      clientName: isArabic ? 'محمد عبدالرحمن' : 'Mohamed Abdulrahman',
      projectType: isArabic ? 'تجديد حمام' : 'Bathroom Renovation',
      budget: 5000,
      urgency: 'medium',
      description: isArabic ? 'تجديد حمام كامل مع تحديث السباكة' : 'Complete bathroom renovation with plumbing updates',
      requestDate: '2024-01-14',
      status: 'pending_assessment'
    },
    {
      id: 2,
      clientName: isArabic ? 'نورا أحمد' : 'Nora Ahmed',
      projectType: isArabic ? 'تركيب مطبخ' : 'Kitchen Installation',
      budget: 15000,
      urgency: 'high',
      description: isArabic ? 'تركيب مطبخ جديد في شقة حديثة' : 'New kitchen installation in modern apartment',
      requestDate: '2024-01-13',
      status: 'pending_assessment'
    }
  ]);

  const [reports, setReports] = useState([
    {
      id: 1,
      projectName: isArabic ? 'مشروع فيلا الرياض' : 'Riyadh Villa Project',
      clientName: isArabic ? 'عبدالله السعد' : 'Abdullah Al-Saad',
      type: 'assessment',
      status: 'delivered',
      date: '2024-01-10',
      downloadCount: 3
    },
    {
      id: 2,
      projectName: isArabic ? 'تطوير شقة جدة' : 'Jeddah Apartment Development',
      clientName: isArabic ? 'فاطمة النور' : 'Fatma Al-Noor',
      type: 'recommendation',
      status: 'in_progress',
      date: '2024-01-14',
      downloadCount: 0
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

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return isArabic ? 'مجدولة' : 'Scheduled';
      case 'completed': return isArabic ? 'مكتملة' : 'Completed';
      case 'pending': return isArabic ? 'في الانتظار' : 'Pending';
      case 'cancelled': return isArabic ? 'ملغاة' : 'Cancelled';
      default: return status;
    }
  };

  const getConsultationTypeIcon = (type) => {
    switch (type) {
      case 'video': return FaVideo;
      case 'phone': return FaPhone;
      case 'site_visit': return FaBriefcase;
      default: return FaComments;
    }
  };

  const getConsultationTypeText = (type) => {
    switch (type) {
      case 'video': return isArabic ? 'مرئي' : 'Video Call';
      case 'phone': return isArabic ? 'هاتفي' : 'Phone Call';
      case 'site_visit': return isArabic ? 'زيارة موقع' : 'Site Visit';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جارٍ تحميل لوحة الأخصائي...' : 'Loading Specialist Dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={cardVariants} className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {isArabic 
                ? `مرحباً، ${currentUser?.name || 'أخصائي'}` 
                : `Welcome, ${currentUser?.name || 'Specialist'}`}
            </h1>
            <p className="text-purple-100">
              {isArabic 
                ? 'لوحة تحكم الأخصائي المعتمد' 
                : 'A-List Certified Specialist Dashboard'}
            </p>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <FaAward className="text-yellow-300 text-2xl" />
            <span className="text-purple-100 text-sm">
              {isArabic ? 'أخصائي معتمد' : 'Certified Specialist'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Consultations */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'إجمالي الاستشارات' : 'Total Consultations'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConsultations}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-purple-600 dark:text-purple-400 text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Active Projects */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'المشاريع النشطة' : 'Active Projects'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FaProjectDiagram className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Monthly Earnings */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'الأرباح الشهرية' : 'Monthly Earnings'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.monthlyEarnings.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-green-600 dark:text-green-400 text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Client Satisfaction */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'رضا العملاء' : 'Client Satisfaction'}
              </p>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.clientSatisfaction}</p>
                <FaStar className="text-yellow-500 text-lg" />
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <FaUsers className="text-yellow-600 dark:text-yellow-400 text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Response Time */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'وقت الاستجابة' : 'Response Time'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.responseTime}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <FaClock className="text-indigo-600 dark:text-indigo-400 text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Completion Rate */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'معدل الإنجاز' : 'Completion Rate'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-teal-600 dark:text-teal-400 text-xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Escrow Projects Management */}
        <motion.div variants={cardVariants} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'إدارة المشاريع المضمونة' : 'Escrow Project Management'}
            </h3>
            <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              {isArabic ? 'عرض الكل' : 'View All'}
            </button>
          </div>

          <div className="space-y-4">
            {escrowProjects.slice(0, 2).map((project) => (
              <div key={project.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{project.projectTitle}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{isArabic ? 'العميل:' : 'Client:'} {project.clientName}</p>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{isArabic ? 'المبلغ:' : 'Amount:'} ${project.totalAmount.toLocaleString()}</span>
                      <span>{isArabic ? 'ممول في:' : 'Funded:'} {project.fundedAt}</span>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'funded' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {project.status === 'funded' 
                      ? (isArabic ? 'ممول' : 'Funded')
                      : (isArabic ? 'قيد التنفيذ' : 'In Progress')
                    }
                  </span>
                </div>

                {/* Work Orders Summary */}
                <div className="mb-3">
                  <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {isArabic ? 'أوامر العمل' : 'Work Orders'}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {project.workOrders.map((order) => (
                      <span key={order.id} className={`px-2 py-1 text-xs rounded ${
                        order.status === 'accepted' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {order.assignedTo} - ${order.amount}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Milestones Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{isArabic ? 'تقدم المشروع' : 'Project Progress'}</span>
                    <span>{Math.round((project.milestones.filter(m => m.status === 'completed').length / project.milestones.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(project.milestones.filter(m => m.status === 'completed').length / project.milestones.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse">
                  <button className="flex-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    {isArabic ? 'عرض التفاصيل' : 'View Details'}
                  </button>
                  <button className="flex-1 text-xs font-medium text-white bg-purple-600 px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    {isArabic ? 'إنشاء أمر عمل' : 'Create Work Order'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Client Requests & Quick Actions */}
        <motion.div variants={cardVariants} className="space-y-6">
          {/* Pending Client Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'طلبات العملاء' : 'Client Requests'}
              </h3>
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium px-2 py-1 rounded-full">
                {clientRequests.length} {isArabic ? 'طلب جديد' : 'new'}
              </span>
            </div>

            <div className="space-y-3">
              {clientRequests.map((request) => (
                <div key={request.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{request.projectType}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{request.clientName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{isArabic ? 'الميزانية:' : 'Budget:'} ${request.budget.toLocaleString()}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      request.urgency === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {request.urgency === 'high' ? (isArabic ? 'عاجل' : 'Urgent') :
                       request.urgency === 'medium' ? (isArabic ? 'متوسط' : 'Medium') :
                       (isArabic ? 'عادي' : 'Normal')
                      }
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{request.description}</p>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <button className="flex-1 text-xs font-medium text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                      {isArabic ? 'قبول' : 'Accept'}
                    </button>
                    <button className="flex-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      {isArabic ? 'تقييم' : 'Assess'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist Tools */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'أدوات الأخصائي' : 'Specialist Tools'}
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FaCalendarAlt className="text-purple-600 dark:text-purple-400" />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{isArabic ? 'جدولة استشارة' : 'Schedule Consultation'}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isArabic ? 'ترتيب موعد مع العميل' : 'Arrange client meeting'}</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FaClipboardList className="text-blue-600 dark:text-blue-400" />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{isArabic ? 'إنشاء تقرير' : 'Create Assessment'}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isArabic ? 'تقرير تقييم المشروع' : 'Project evaluation report'}</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FaUsers className="text-green-600 dark:text-green-400" />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{isArabic ? 'إدارة الفريق' : 'Manage Team'}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isArabic ? 'تنسيق المقاولين والطاقم' : 'Coordinate contractors & crew'}</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FaProjectDiagram className="text-orange-600 dark:text-orange-400" />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{isArabic ? 'مراقبة المشاريع' : 'Project Monitoring'}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isArabic ? 'تتبع تقدم جميع المشاريع' : 'Track all project progress'}</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Consultations Section */}
      <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isArabic ? 'الاستشارات القادمة' : 'Upcoming Consultations'}
          </h3>
          <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            {isArabic ? 'عرض الكل' : 'View All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consultations.slice(0, 3).map((consultation) => {
            const TypeIcon = getConsultationTypeIcon(consultation.type);
            return (
              <div key={consultation.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <TypeIcon className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{consultation.clientName}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{consultation.projectType}</p>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(consultation.status)}`}>
                    {getStatusText(consultation.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>{consultation.date}</span>
                  <span>{consultation.time}</span>
                  <span>{getConsultationTypeText(consultation.type)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">${consultation.fee}</span>
                  <button className="text-purple-600 dark:text-purple-400 text-xs hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    {isArabic ? 'عرض التفاصيل' : 'View Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SpecialistDashboardPage; 