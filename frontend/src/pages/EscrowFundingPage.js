import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt,
  FaCreditCard,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaEye,
  FaPlus,
  FaUserShield,
  FaProjectDiagram,
  FaDollarSign,
  FaArrowRight,
  FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';

const EscrowFundingPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  
  // State management
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [stats, setStats] = useState({
    totalEscrowFunded: 8500,
    activeEscrows: 3,
    completedProjects: 8,
    pendingApprovals: 1
  });

  // Escrow accounts data
  const [escrowAccounts, setEscrowAccounts] = useState([
    {
      id: 1,
      projectTitle: isArabic ? 'تجديد المطبخ' : 'Kitchen Renovation',
      specialist: isArabic ? 'أحمد الخبير' : 'Ahmed Expert',
      totalAmount: 2500,
      platformFee: 125,
      netAmount: 2375,
      status: 'funded',
      fundedAt: '2024-01-10',
      description: isArabic ? 'تجديد كامل للمطبخ مع أجهزة جديدة' : 'Complete kitchen renovation with new appliances',
      milestones: [
        { title: 'Planning & Design', amount: 500, status: 'completed' },
        { title: 'Demolition', amount: 750, status: 'in_progress' },
        { title: 'Installation', amount: 1250, status: 'pending' }
      ]
    },
    {
      id: 2,
      projectTitle: isArabic ? 'إصلاح السباكة' : 'Plumbing Repair',
      specialist: isArabic ? 'سارة المتخصصة' : 'Sarah Specialist',
      totalAmount: 800,
      platformFee: 40,
      netAmount: 760,
      status: 'in_progress',
      fundedAt: '2024-01-12',
      description: isArabic ? 'إصلاح تسريبات المياه والأنابيب' : 'Fix water leaks and pipe repairs',
      workOrders: [
        { assignedTo: 'Mike Crew', type: 'crew', amount: 400, status: 'accepted' },
        { assignedTo: 'John Plumber', type: 'contractor', amount: 360, status: 'pending' }
      ]
    },
    {
      id: 3,
      projectTitle: isArabic ? 'تركيب نظام كهربائي' : 'Electrical Installation',
      specialist: null,
      totalAmount: 1200,
      platformFee: 60,
      netAmount: 1140,
      status: 'pending',
      fundedAt: null,
      description: isArabic ? 'تركيب نظام كهربائي جديد للمنزل' : 'Install new electrical system for home'
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
  const getEscrowStatusColor = (status) => {
    switch (status) {
      case 'funded': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending_approval': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'released': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'disputed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEscrowStatusText = (status) => {
    switch (status) {
      case 'funded': return isArabic ? 'ممول' : 'Funded';
      case 'in_progress': return isArabic ? 'قيد التنفيذ' : 'In Progress';
      case 'pending': return isArabic ? 'في الانتظار' : 'Pending Funding';
      case 'pending_approval': return isArabic ? 'يحتاج موافقة' : 'Pending Approval';
      case 'released': return isArabic ? 'تم الإنجاز' : 'Released';
      case 'disputed': return isArabic ? 'متنازع عليه' : 'Disputed';
      default: return status;
    }
  };

  const handleFundEscrow = (escrowId) => {
    // Simulate funding process
    setEscrowAccounts(prev => 
      prev.map(escrow => 
        escrow.id === escrowId 
          ? { ...escrow, status: 'funded', fundedAt: new Date().toISOString().split('T')[0] }
          : escrow
      )
    );
  };

  const handleApproveWork = (escrowId) => {
    // Simulate work approval
    setEscrowAccounts(prev => 
      prev.map(escrow => 
        escrow.id === escrowId 
          ? { ...escrow, status: 'released' }
          : escrow
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جارٍ تحميل الحسابات المضمونة...' : 'Loading Escrow Accounts...'}
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
      {/* Header */}
      <motion.div variants={cardVariants}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'الحساب المضمون' : 'Escrow Funding'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isArabic 
                ? 'إدارة الدفعات المضمونة والمشاريع الآمنة' 
                : 'Manage secure payments and protected projects'}
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="mt-4 md:mt-0 flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <FaPlus />
            <span>{isArabic ? 'إنشاء حساب مضمون' : 'Create Escrow'}</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          variants={cardVariants}
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
          variants={cardVariants}
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
          variants={cardVariants}
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

        <motion.div 
          variants={cardVariants}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                {isArabic ? 'في انتظار الموافقة' : 'Pending Approvals'}
              </p>
              <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
            </div>
            <FaClock className="text-3xl text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Escrow Accounts List */}
      <motion.div variants={cardVariants}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'حساباتي المضمونة' : 'My Escrow Accounts'}
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {escrowAccounts.map((escrow) => (
                <motion.div
                  key={escrow.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                        {escrow.projectTitle}
                      </h3>
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

                  {/* Amount Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
                        <p className="font-semibold text-gray-900 dark:text-white">${escrow.totalAmount.toLocaleString()}</p>
                      </div>
                      {escrow.platformFee && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{isArabic ? 'رسوم المنصة' : 'Platform Fee'}</span>
                          <p className="font-semibold text-gray-900 dark:text-white">${escrow.platformFee}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress or Work Orders */}
                  {escrow.milestones && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isArabic ? 'المعالم' : 'Milestones'}
                      </h4>
                      <div className="space-y-2">
                        {escrow.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{milestone.title}</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <span className="font-medium">${milestone.amount}</span>
                              <div className={`w-3 h-3 rounded-full ${
                                milestone.status === 'completed' ? 'bg-green-500' :
                                milestone.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {escrow.workOrders && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isArabic ? 'أوامر العمل' : 'Work Orders'}
                      </h4>
                      <div className="space-y-2">
                        {escrow.workOrders.map((order, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{order.assignedTo} ({order.type})</span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <span className="font-medium">${order.amount}</span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                order.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status === 'accepted' ? (isArabic ? 'مقبول' : 'Accepted') : (isArabic ? 'في الانتظار' : 'Pending')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 rtl:space-x-reverse">
                    <button 
                      onClick={() => setSelectedEscrow(escrow)}
                      className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <FaEye />
                      <span>{isArabic ? 'عرض التفاصيل' : 'View Details'}</span>
                    </button>
                    
                    {escrow.status === 'pending' && (
                      <button 
                        onClick={() => handleFundEscrow(escrow.id)}
                        className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaCreditCard />
                        <span>{isArabic ? 'تمويل الآن' : 'Fund Now'}</span>
                      </button>
                    )}
                    
                    {escrow.status === 'pending_approval' && (
                      <button 
                        onClick={() => handleApproveWork(escrow.id)}
                        className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <FaCheckCircle />
                        <span>{isArabic ? 'موافقة وإطلاق' : 'Approve & Release'}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Escrow Information */}
      <motion.div 
        variants={cardVariants}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start space-x-4 rtl:space-x-reverse">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <FaLock className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {isArabic ? 'حماية الدفع المضمون' : 'Escrow Payment Protection'}
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
              {isArabic 
                ? 'نحمي أموالك في حساب مضمون حتى إكمال العمل وموافقتك عليه. يتم الإشراف على المشروع من قبل أخصائي معتمد لضمان جودة الخدمة.'
                : 'Your money is protected in escrow until work is completed and approved. Projects are supervised by certified A-List Specialists to ensure quality service delivery.'
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <FaDollarSign className="text-green-600" />
                <span className="text-blue-800 dark:text-blue-200">
                  {isArabic ? 'إطلاق آمن للأموال' : 'Secure Fund Release'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EscrowFundingPage; 