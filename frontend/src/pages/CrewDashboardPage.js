import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaDollarSign,
  FaStar,
  FaProjectDiagram,
  FaClipboardList,
  FaPhone,
  FaClock,
  FaBriefcase,
  FaHammer,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaRoute,
  FaTruck,
  FaHardHat,
  FaChevronRight,
  FaBell,
  FaTools,
  FaThumbsUp,
  FaThumbsDown,
  FaEye,
  FaChartLine,
  FaWrench,
  FaLocationArrow,
  FaSpinner,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';

const CrewDashboardPage = () => {
  const { currentUser, isAuthenticated, userRole } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 23,
    completedJobs: 19,
    monthlyEarnings: 8500,
    currentRating: 4.7,
    responseTime: '15 mins',
    acceptanceRate: 85
  });

  // Real-time job invitations from backend
  const [availableJobs, setAvailableJobs] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);

  // Load job invitations from backend
  const fetchJobInvitations = async () => {
    try {
      const response = await fetch('/api/payments/crew/job-invitations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableJobs(data.map(job => ({
          id: job.id,
          title: job.title,
          contractor: job.client_name || job.specialist_name || 'Direct Client',
          location: job.escrow_project?.client?.location || 'Location TBD',
          distance: '2.5 km', // Calculate from user location
          duration: job.estimated_hours ? `${job.estimated_hours} hours` : '4 hours',
          pay: job.assigned_amount,
          urgency: determineUrgency(job.assigned_at),
          type: 'repair', // Map from job.work_type
          requiredSkills: ['general'], // Map from job requirements
          escrowFunded: job.is_escrow_funded,
          description: job.description,
          specialist: job.specialist_name,
          projectTitle: job.escrow_project?.project_title
        })));
      }
    } catch (error) {
      console.error('Error fetching job invitations:', error);
    }
  };

  // Helper function to determine urgency based on assignment time
  const determineUrgency = (assignedAt) => {
    const assigned = new Date(assignedAt);
    const now = new Date();
    const hoursAgo = (now - assigned) / (1000 * 60 * 60);
    
    if (hoursAgo < 2) return 'high';
    if (hoursAgo < 12) return 'medium';
    return 'low';
  };

  // Handle job acceptance
  const handleAcceptJob = async (jobId) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/payments/crew/job-response/${jobId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'accept' })
      });
      
      if (response.ok) {
        // Remove from available jobs and add to current jobs
        const acceptedJob = availableJobs.find(job => job.id === jobId);
        setAvailableJobs(prev => prev.filter(job => job.id !== jobId));
        setCurrentJobs(prev => [...prev, {
          ...acceptedJob,
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
          progress: 0
        }]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalJobs: prev.totalJobs + 1,
          acceptanceRate: Math.min(95, prev.acceptanceRate + 1)
        }));
        
        // Show success notification
        alert(isArabic ? 'تم قبول المهمة بنجاح!' : 'Job accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      alert(isArabic ? 'حدث خطأ في قبول المهمة' : 'Error accepting job');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle job rejection
  const handleRejectJob = async (jobId) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/payments/crew/job-response/${jobId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      });
      
      if (response.ok) {
        setAvailableJobs(prev => prev.filter(job => job.id !== jobId));
        alert(isArabic ? 'تم رفض المهمة' : 'Job declined');
      }
    } catch (error) {
      console.error('Error rejecting job:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh job invitations every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      await fetchJobInvitations();
      setLoading(false);
    };

    loadData();

    // Set up auto-refresh for new job invitations
    const interval = setInterval(fetchJobInvitations, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

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

  // Existing helper functions with enhanced functionality
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case 'high': return isArabic ? 'عاجل' : 'Urgent';
      case 'medium': return isArabic ? 'متوسط' : 'Medium';
      case 'low': return isArabic ? 'عادي' : 'Normal';
      default: return urgency;
    }
  };

  const getJobTypeIcon = (type) => {
    switch (type) {
      case 'installation': return FaTools;
      case 'repair': return FaWrench;
      case 'painting': return FaBriefcase;
      case 'electrical': return FaBell;
      default: return FaHammer;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جارٍ تحميل لوحة طاقم العمل...' : 'Loading Crew Dashboard...'}
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
      <motion.div variants={cardVariants} className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {isArabic 
                ? `مرحباً، ${currentUser?.name || 'عضو الطاقم'}` 
                : `Welcome, ${currentUser?.name || 'Crew Member'}`}
            </h1>
            <p className="text-blue-100">
              {isArabic 
                ? 'لوحة تحكم طاقم العمل المعتمد' 
                : 'A-List Certified Crew Dashboard'}
            </p>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <FaHardHat className="text-yellow-300 text-2xl" />
            <span className="text-blue-100 text-sm">
              {isArabic ? 'طاقم معتمد' : 'Certified Crew'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Jobs */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'إجمالي المهام' : 'Total Jobs'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalJobs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
        </motion.div>

        {/* Completed Jobs */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'المهام المكتملة' : 'Completed Jobs'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedJobs}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
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

        {/* Current Rating */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'التقييم الحالي' : 'Current Rating'}
              </p>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentRating}</p>
                <FaStar className="text-yellow-500 text-lg" />
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <FaStar className="text-yellow-600 dark:text-yellow-400 text-xl" />
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

        {/* Acceptance Rate */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isArabic ? 'معدل القبول' : 'Acceptance Rate'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.acceptanceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
              <FaThumbsUp className="text-teal-600 dark:text-teal-400 text-xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Jobs */}
        <motion.div variants={cardVariants} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'المهام المتاحة' : 'Available Jobs'}
            </h3>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full">
              {availableJobs.length} {isArabic ? 'مهمة جديدة' : 'new jobs'}
            </span>
          </div>

          <div className="space-y-4">
            {availableJobs.map((job) => {
              const TypeIcon = getJobTypeIcon(job.type);
              return (
                <motion.div
                  key={job.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(job.urgency)}`}>
                            {getUrgencyText(job.urgency)}
                          </span>
                          {job.escrowFunded && (
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {isArabic ? 'ضمان الدفع' : 'Escrow Funded'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{job.contractor}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.description}</p>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <FaMapMarkerAlt />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <FaRoute />
                            <span>{job.distance}</span>
                          </div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <FaClock />
                            <span>{job.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${job.pay}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isArabic ? 'إجمالي الأجر' : 'Total Pay'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map((skill, index) => (
                        <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleRejectJob(job.id)}
                        className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <FaTimesCircle />
                        <span>{isArabic ? 'رفض' : 'Decline'}</span>
                      </button>
                      <button
                        onClick={() => handleAcceptJob(job.id)}
                        className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <FaCheckCircle />
                        <span>{isArabic ? 'قبول' : 'Accept'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Current Jobs */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'المهام الحالية' : 'Current Jobs'}
            </h3>
          </div>

          <div className="space-y-4">
            {currentJobs.map((job) => (
              <div key={job.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{job.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{job.contractor}</p>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <FaMapMarkerAlt />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'in_progress' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {job.status === 'in_progress' 
                      ? (isArabic ? 'جاري العمل' : 'In Progress')
                      : (isArabic ? 'مجدولة' : 'Scheduled')
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>{job.date}</span>
                  <span>{job.startTime} - {job.endTime}</span>
                </div>
                
                {job.status === 'in_progress' && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>{isArabic ? 'التقدم' : 'Progress'}</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">${job.pay}</span>
                  <button className="text-blue-600 dark:text-blue-400 text-xs hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    {isArabic ? 'عرض التفاصيل' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {isArabic ? 'تحديث الموقع' : 'Update Location'}
            </span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FaClock className="text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {isArabic ? 'توقيت العمل' : 'Availability'}
            </span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FaEnvelope className="text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {isArabic ? 'الرسائل' : 'Messages'}
            </span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FaChartLine className="text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {isArabic ? 'الإحصائيات' : 'Analytics'}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CrewDashboardPage; 