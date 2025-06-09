import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaUser, 
  FaHammer, 
  FaUsers, 
  FaCertificate, 
  FaArrowRight,
  FaChevronRight,
  FaHome,
  FaConciergeBell,
  FaUserTie,
  FaHardHat
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';

const CreateServiceModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    location: '',
    requirements: '',
    images: []
  });

  // Add role selection state
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleSelector, setShowRoleSelector] = useState(true);
  const [loading, setLoading] = useState(false);

  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // Define service creation roles
  const serviceRoles = [
    {
      id: 'client',
      label: isArabic ? 'عميل' : 'Client',
      description: isArabic ? 'أحتاج خدمة منزلية' : 'I need home service',
      icon: '👤',
      color: 'blue'
    },
    {
      id: 'home_pro',
      label: isArabic ? 'مقاول منزلي' : 'Home Pro',
      description: isArabic ? 'أقدم خدمات منزلية' : 'I provide home services',
      icon: '🏠',
      color: 'green'
    },
    {
      id: 'crew',
      label: isArabic ? 'طاقم عمل' : 'A-List Crew',
      description: isArabic ? 'متاح للعمل في المشاريع' : 'Available for project work',
      icon: '👷',
      color: 'orange'
    },
    {
      id: 'specialist',
      label: isArabic ? 'أخصائي معتمد' : 'A-List Specialist',
      description: isArabic ? 'أقدم استشارات وإشراف' : 'I provide consultation & supervision',
      icon: '🎯',
      color: 'purple'
    }
  ];

  const handleRoleSelection = (roleId) => {
    setSelectedRole(roleId);
    setShowRoleSelector(false);
    // Configure form based on role
    configureFormForRole(roleId);
  };

  const configureFormForRole = (roleId) => {
    switch (roleId) {
      case 'client':
        // Configure for service request
        setFormData(prev => ({
          ...prev,
          serviceType: 'request'
        }));
        break;
      case 'home_pro':
        // Configure for service offering
        setFormData(prev => ({
          ...prev,
          serviceType: 'offering'
        }));
        break;
      case 'crew':
        // Configure for crew availability
        setFormData(prev => ({
          ...prev,
          serviceType: 'crew_availability',
          skills: [],
          availability: ''
        }));
        break;
      case 'specialist':
        // Configure for consultation services
        setFormData(prev => ({
          ...prev,
          serviceType: 'consultation',
          consultationType: '',
          expertiseArea: ''
        }));
        break;
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      location: '',
      requirements: '',
      images: []
    });
    setSelectedRole('');
    setShowRoleSelector(true);
  };

  const handleProceed = () => {
    if (!selectedRole) return;
    
    setLoading(true);
    
    // Close modal and navigate to appropriate service creation page
    setTimeout(() => {
      onClose();
      
      // Navigate based on role selection
      switch (selectedRole) {
        case 'client':
          navigate('/dashboard/new-request');
          break;
        case 'home_pro':
          navigate('/pro-dashboard/services/create');
          break;
        case 'crew':
          navigate('/crew-dashboard/availability');
          break;
        case 'specialist':
          navigate('/specialist-dashboard/services/create');
          break;
        default:
          navigate('/dashboard');
      }
      
      setLoading(false);
      setSelectedRole('');
    }, 500);
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isArabic ? 'إنشاء خدمة جديدة' : 'Create New Service'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isArabic 
                  ? 'اختر نوع الحساب لإنشاء الخدمة المناسبة' 
                  : 'Choose your account type to create the appropriate service'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          </div>

          {/* Role Selection */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'ما نوع حسابك؟' : 'What type of account do you have?'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceRoles.map((role) => {
                const isSelected = selectedRole === role.id;
                
                return (
                  <motion.div
                    key={role.id}
                    className={`
                      relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? `border-${role.color}-200 bg-${role.color}-50 shadow-lg`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                      ${isSelected ? '' : 'hover:shadow-md'}
                    `}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={!isSelected ? "hover" : {}}
                    whileTap="tap"
                    onClick={() => handleRoleSelection(role.id)}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`w-3 h-3 rounded-full bg-${role.color}-500`} />
                      </motion.div>
                    )}
                    
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center mb-4
                      ${isSelected ? 'bg-white' : 'bg-gray-100 dark:bg-gray-700'}
                    `}>
                      <span className={`text-2xl`}>{role.icon}</span>
                    </div>
                    
                    {/* Content */}
                    <h4 className={`
                      font-semibold text-lg mb-2
                      ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}
                    `}>
                      {role.label}
                    </h4>
                    <p className={`
                      text-sm leading-relaxed
                      ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}
                    `}>
                      {role.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            
            <button
              onClick={handleProceed}
              disabled={!selectedRole || loading}
              className={`
                px-6 py-3 rounded-lg font-medium flex items-center space-x-2 rtl:space-x-reverse transition-all duration-200
                ${selectedRole && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
                </>
              ) : (
                <>
                  <span>{isArabic ? 'متابعة' : 'Continue'}</span>
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </div>

          {/* Helper text */}
          {selectedRole && (
            <motion.div
              className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {isArabic 
                  ? `ستتم توجيهك إلى نموذج إنشاء الخدمة المناسب لحسابك`
                  : `You will be directed to the appropriate service creation form for your account`}
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateServiceModal;