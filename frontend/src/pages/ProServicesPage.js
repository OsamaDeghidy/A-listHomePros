import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { 
  alistProsService, 
  userService,
  schedulingService 
} from '../services/api';
import { 
  FaTags, 
  FaCheck, 
  FaTimes, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaStar, 
  FaDollarSign, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaCalendarAlt, 
  FaChartLine, 
  FaSave, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaDownload,
  FaListUl,
  FaThLarge,
  FaCog,
  FaPlus,
  FaEdit,
  FaEye,
  FaBuilding,
  FaIndustry,
  FaStore
} from 'react-icons/fa';

const ProServicesPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [professionalProfile, setProfessionalProfile] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'connected', 'demo', 'checking'
  const [savingCategoryId, setSavingCategoryId] = useState(null); // Track which category is being saved
  const [profileStatus, setProfileStatus] = useState('unknown'); // 'found', 'not_found', 'created', 'unknown'
  const [updateTrigger, setUpdateTrigger] = useState(0); // Force UI update trigger

  // Stats
  const [profileStats, setProfileStats] = useState({
    totalCategories: 0,
    selectedCategories: 0,
    totalBookings: 0,
    averageRating: 0,
    totalRevenue: 0,
    profileViews: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pro-dashboard/services');
      return;
    }
    fetchInitialData();
  }, [isAuthenticated, navigate]);

  // Debug: Monitor selectedCategories changes
  useEffect(() => {
    console.log('🎯 Selected categories changed:', selectedCategories);
  }, [selectedCategories]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all required data in parallel
      const [categoriesRes, profileRes, appointmentsRes] = await Promise.all([
        fetchServiceCategories(),
        fetchProfessionalProfile(),
        schedulingService.getAppointments().catch(() => ({ data: { results: [] } }))
      ]);

      // Calculate profile statistics
      const appointments = appointmentsRes.data.results || [];
      calculateProfileStats(appointments);

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(isArabic ? 'فشل في تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      // Use the correct backend API endpoint
      const response = await alistProsService.getCategories();
      const categories = response.data.results || response.data;
      
      // Set connection status to connected since API worked
      setConnectionStatus('connected');
      
      // Transform backend data to match frontend expectations
      const transformedCategories = categories.map(category => ({
        id: category.id,
        name: category.name,
        name_ar: category.name_ar || category.name,
        name_en: category.name_en || category.name,
        description: category.description,
        icon: getCategoryIcon(category.name),
        is_active: true,
        professionals_count: category.professionals_count || 0,
        average_price: category.average_price || 0
      }));

      setServiceCategories(transformedCategories);
      return { data: { results: transformedCategories } };
      
    } catch (err) {
      console.warn('Using fallback categories data:', err);
      
      // Set connection status to demo mode
      setConnectionStatus('demo');
      
      // Fallback categories data - this should match your backend structure
      const categories = [
        {
          id: 1,
          name: isArabic ? 'سباكة' : 'Plumbing',
          name_ar: 'سباكة',
          name_en: 'Plumbing',
          description: isArabic ? 'خدمات السباكة وإصلاح الأنابيب وتركيب الحنفيات' : 'Plumbing services, pipe repairs, and faucet installations',
          icon: '🔧',
          is_active: true,
          professionals_count: 145,
          average_price: 75
        },
        {
          id: 2,
          name: isArabic ? 'كهرباء' : 'Electrical',
          name_ar: 'كهرباء',
          name_en: 'Electrical',
          description: isArabic ? 'خدمات الكهرباء والتوصيلات وإصلاح الأعطال' : 'Electrical services, installations, and repairs',
          icon: '⚡',
          is_active: true,
          professionals_count: 98,
          average_price: 85
        },
        {
          id: 3,
          name: isArabic ? 'تنظيف' : 'Cleaning',
          name_ar: 'تنظيف',
          name_en: 'Cleaning',
          description: isArabic ? 'خدمات التنظيف المنزلي والتجاري والعميق' : 'Home, commercial, and deep cleaning services',
          icon: '🧹',
          is_active: true,
          professionals_count: 210,
          average_price: 45
        },
        {
          id: 4,
          name: isArabic ? 'نجارة' : 'Carpentry',
          name_ar: 'نجارة',
          name_en: 'Carpentry',
          description: isArabic ? 'أعمال النجارة والأثاث وإصلاح الخشب' : 'Carpentry work, furniture making, and wood repairs',
          icon: '🔨',
          is_active: true,
          professionals_count: 67,
          average_price: 90
        },
        {
          id: 5,
          name: isArabic ? 'تكييف' : 'HVAC',
          name_ar: 'تكييف',
          name_en: 'HVAC',
          description: isArabic ? 'تركيب وصيانة أنظمة التكييف والتبريد' : 'HVAC installation, maintenance, and repair',
          icon: '❄️',
          is_active: true,
          professionals_count: 89,
          average_price: 120
        },
        {
          id: 6,
          name: isArabic ? 'دهانات' : 'Painting',
          name_ar: 'دهانات',
          name_en: 'Painting',
          description: isArabic ? 'أعمال الدهانات والديكور وتجديد المنازل' : 'Painting, decoration, and home renovation work',
          icon: '🎨',
          is_active: true,
          professionals_count: 134,
          average_price: 65
        },
        {
          id: 7,
          name: isArabic ? 'بلاط وسيراميك' : 'Tiling',
          name_ar: 'بلاط وسيراميك',
          name_en: 'Tiling',
          description: isArabic ? 'تركيب البلاط والسيراميك والرخام' : 'Tile, ceramic, and marble installation',
          icon: '🏠',
          is_active: true,
          professionals_count: 78,
          average_price: 95
        },
        {
          id: 8,
          name: isArabic ? 'حدائق' : 'Landscaping',
          name_ar: 'حدائق',
          name_en: 'Landscaping',
          description: isArabic ? 'تنسيق الحدائق والزراعة وقص الأشجار' : 'Landscaping, gardening, and tree trimming services',
          icon: '🌱',
          is_active: true,
          professionals_count: 92,
          average_price: 80
        },
        {
          id: 9,
          name: isArabic ? 'مكافحة حشرات' : 'Pest Control',
          name_ar: 'مكافحة حشرات',
          name_en: 'Pest Control',
          description: isArabic ? 'مكافحة الحشرات والقوارض والتطهير' : 'Pest control, rodent removal, and sanitization',
          icon: '🐛',
          is_active: true,
          professionals_count: 45,
          average_price: 110
        },
        {
          id: 10,
          name: isArabic ? 'أمن وحراسة' : 'Security',
          name_ar: 'أمن وحراسة',
          name_en: 'Security',
          description: isArabic ? 'خدمات الأمن والحراسة وأنظمة المراقبة' : 'Security services, guard services, and surveillance systems',
          icon: '🛡️',
          is_active: true,
          professionals_count: 56,
          average_price: 150
        }
      ];

      setServiceCategories(categories);
      return { data: { results: categories } };
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Plumbing': '🔧',
      'سباكة': '🔧',
      'Electrical': '⚡',
      'كهرباء': '⚡',
      'Cleaning': '🧹',
      'تنظيف': '🧹',
      'Carpentry': '🔨',
      'نجارة': '🔨',
      'HVAC': '❄️',
      'تكييف': '❄️',
      'Painting': '🎨',
      'دهانات': '🎨',
      'Tiling': '🏠',
      'بلاط وسيراميك': '🏠',
      'Landscaping': '🌱',
      'حدائق': '🌱',
      'Pest Control': '🐛',
      'مكافحة حشرات': '🐛',
      'Security': '🛡️',
      'أمن وحراسة': '🛡️'
    };
    return iconMap[categoryName] || '🔧';
  };

  const fetchProfessionalProfile = async () => {
    try {
      // Use the correct API endpoint for getting current user's profile
      const response = await alistProsService.getProfile('me');
      const profile = response.data;
      console.log('🔍 Profile data received:', profile);
      
      if (profile && profile.id) {
        setProfessionalProfile(profile);
        setProfileStatus('found');
        
        // Set selected categories from profile
        if (profile.service_categories && Array.isArray(profile.service_categories)) {
          const categoryIds = profile.service_categories.map(cat => 
            typeof cat === 'object' ? cat.id : cat
          );
          console.log('📋 Selected category IDs from profile:', categoryIds);
          setSelectedCategories(categoryIds);
        } else {
          console.log('⚠️ No service_categories found in profile:', profile);
          setSelectedCategories([]);
        }
      } else {
        console.log('⚠️ No valid profile found');
        setProfileStatus('not_found');
        setSelectedCategories([]);
      }

      return response;
    } catch (err) {
      console.error('❌ Error fetching professional profile:', err);
      setProfileStatus('not_found');
      setSelectedCategories([]);
      return { data: {} };
    }
  };

  const calculateProfileStats = (appointments) => {
    const stats = {
      totalCategories: serviceCategories.length,
      selectedCategories: selectedCategories.length,
      totalBookings: appointments.length,
      averageRating: 0,
      totalRevenue: 0,
      profileViews: Math.floor(Math.random() * 500) + 100 // Mock data
    };

    // Calculate revenue and ratings from appointments
    appointments.forEach(appointment => {
      if (appointment.status === 'completed') {
        stats.totalRevenue += parseFloat(appointment.total_cost || appointment.estimated_cost || 0);
      }
      if (appointment.rating) {
        stats.averageRating += appointment.rating;
      }
    });

    if (appointments.length > 0) {
      stats.averageRating = stats.averageRating / appointments.length;
    }

    setProfileStats(stats);
  };

  const handleCategoryToggle = async (categoryId) => {
    // Prevent multiple simultaneous saves
    if (savingCategoryId) return;

    setSavingCategoryId(categoryId);
    setError(null);

    // Update local state immediately for responsive UI
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newSelectedCategories);

    try {
      // Save changes immediately to backend
      const updateData = {
        service_category_ids: newSelectedCategories
      };

      console.log('💾 Saving categories to backend:', updateData);
      console.log('👤 Current professional profile:', professionalProfile);

      let response;
      try {
        response = await alistProsService.updateProfile(null, updateData);
        console.log('✅ Update successful:', response.data);
      } catch (err) {
        console.log('⚠️ First update failed, trying partial update:', err.response?.status);
        // Try partial update as fallback
        response = await alistProsService.updateProfilePartial(null, updateData);
        console.log('✅ Partial update successful:', response.data);
      }

      // Show success feedback
      const categoryName = serviceCategories.find(cat => cat.id === categoryId)?.name || '';
      const isAdding = newSelectedCategories.includes(categoryId);
      
      // Check if this was a profile creation (when profile was not found before)
      if (profileStatus === 'not_found') {
        setProfileStatus('created');
        setTimeout(() => setProfileStatus('found'), 5000); // Switch to 'found' after 5 seconds
      }
      
      // Update the professional profile with the response data (don't fetch again)
      if (response.data) {
        console.log('🔄 Updating profile state with response data:', response.data);
        setProfessionalProfile(response.data);
        
        // Make sure selectedCategories stays as we set it
        console.log('✅ Keeping selected categories as:', newSelectedCategories);
        // Don't call setSelectedCategories again - it's already set above
      }
      
      setSuccess(
        isAdding 
          ? (isArabic ? `تمت إضافة ${categoryName} بنجاح` : `${categoryName} added successfully`)
          : (isArabic ? `تم حذف ${categoryName} بنجاح` : `${categoryName} removed successfully`)
      );

      // Don't call fetchProfessionalProfile() here as it will override our selectedCategories
      // Update profile data is already handled above with response.data
      
      // Update stats
      setProfileStats(prev => ({
        ...prev,
        selectedCategories: newSelectedCategories.length
      }));

      // Force UI update to ensure categories are visually updated
      setUpdateTrigger(prev => prev + 1);

      // Auto-hide success message
      setTimeout(() => setSuccess(null), 2000);

    } catch (err) {
      console.error('Error saving category:', err);
      
      // Revert local state on error
      setSelectedCategories(selectedCategories);
      
      // Show error message based on status code
      let errorMessage = isArabic ? 'فشل في حفظ التغييرات' : 'Failed to save changes';
      
      if (err.response?.status === 401) {
        errorMessage = isArabic ? 'جلسة العمل منتهية، يرجى تسجيل الدخول مرة أخرى' : 'Session expired, please login again';
      } else if (err.response?.status === 403) {
        errorMessage = isArabic ? 'ليس لديك صلاحية كمحترف لتعديل البروفايل' : 'You need A-List Pro permissions to update profile';
      } else if (err.response?.status === 404) {
        errorMessage = isArabic ? 'لم يتم العثور على البروفايل، يرجى إنشاء بروفايل أولاً' : 'Profile not found, please create a profile first';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (connectionStatus === 'demo') {
        errorMessage = isArabic ? 'وضع التجريب - تأكد من تشغيل الخادم الخلفي' : 'Demo mode - make sure backend server is running';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 6000);
    } finally {
      setSavingCategoryId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter categories
  const filteredCategories = serviceCategories.filter(category => {
    const matchesSearch = !searchTerm || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'selected' && selectedCategories.includes(category.id)) ||
      (filterType === 'available' && !selectedCategories.includes(category.id));
    
    return matchesSearch && matchesFilter;
  });

  if (loading && !serviceCategories.length) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isArabic ? 'جاري التحميل...' : 'Loading...'}
            </h3>
            <p className="text-gray-600">
              {connectionStatus === 'checking' 
                ? (isArabic ? 'جاري الاتصال بالخادم...' : 'Connecting to server...')
                : (isArabic ? 'جاري تحميل البيانات...' : 'Loading data...')
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'إدارة الفئات | A-List Home Pros' : 'Category Management | A-List Home Pros'}</title>
      </Helmet>

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isArabic ? 'إدارة فئات الخدمات' : 'Service Category Management'}
              </h1>
              <p className="text-gray-600">
                {isArabic ? 'اختر الفئات التي تريد أن يظهر بروفايلك فيها' : 'Choose categories where you want your profile to appear'}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => fetchInitialData()}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaSyncAlt className="mr-2 h-4 w-4" />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaTags className="mr-2 h-4 w-4" />
                {isArabic ? 'إدارة الفئات' : 'Manage Categories'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Connection Status Banner */}
        <AnimatePresence>
          {connectionStatus !== 'checking' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-3 rounded-lg border ${
                connectionStatus === 'connected'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {connectionStatus === 'connected'
                      ? (isArabic ? 'متصل بالخادم' : 'Connected to Server')
                      : (isArabic ? 'وضع التجريب - بيانات وهمية' : 'Demo Mode - Sample Data')
                    }
                  </span>
                </div>
                {connectionStatus === 'demo' && (
                  <span className="text-xs">
                    {isArabic ? 'تأكد من تشغيل الخادم الخلفي' : 'Make sure backend server is running'}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-Save Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800"
        >
          <div className="flex items-center">
            <FaInfoCircle className="mr-2 h-4 w-4 text-blue-600" />
            <span className="text-sm">
              {isArabic 
                ? 'التغييرات تُحفظ تلقائياً فور اختيار أو إلغاء اختيار أي فئة'
                : 'Changes are saved automatically when you select or deselect categories'
              }
            </span>
          </div>
        </motion.div>

        {/* Profile Status Banner */}
        <AnimatePresence>
          {profileStatus === 'not_found' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-lg border bg-orange-50 border-orange-200 text-orange-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2 h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">
                      {isArabic ? 'لم يتم العثور على بروفايل محترف' : 'Professional Profile Not Found'}
                    </div>
                    <div className="text-sm">
                      {isArabic 
                        ? 'سيتم إنشاء بروفايل جديد عند اختيار أول فئة'
                        : 'A new profile will be created when you select your first category'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {profileStatus === 'created' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-lg border bg-green-50 border-green-200 text-green-800"
            >
              <div className="flex items-center">
                <FaCheckCircle className="mr-2 h-5 w-5 text-green-600" />
                <div className="font-medium">
                  {isArabic ? 'تم إنشاء البروفايل المهني بنجاح!' : 'Professional profile created successfully!'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'إجمالي الفئات' : 'Total Categories'}</p>
                <p className="text-2xl font-bold text-gray-900">{profileStats.totalCategories}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaTags className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'فئات مختارة' : 'Selected Categories'}</p>
                <p className="text-2xl font-bold text-green-600">{profileStats.selectedCategories}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'مشاهدات البروفايل' : 'Profile Views'}</p>
                <p className="text-2xl font-bold text-purple-600">{profileStats.profileViews}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaEye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'متوسط التقييم' : 'Avg Rating'}</p>
                <p className="text-2xl font-bold text-yellow-600">{profileStats.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaStar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(profileStats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <FaDollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={isArabic ? 'البحث في الفئات...' : 'Search categories...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="selected">{isArabic ? 'مختارة' : 'Selected'}</option>
                <option value="available">{isArabic ? 'متاحة' : 'Available'}</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isArabic ? 'فئات الخدمات المتاحة' : 'Available Service Categories'}
            </h2>
            <div className="text-sm text-gray-600">
              {isArabic ? 'تم اختيار' : 'Selected'}: {selectedCategories.length} {isArabic ? 'من' : 'of'} {serviceCategories.length}
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <FaTags className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isArabic ? 'لا توجد فئات' : 'No categories found'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? (isArabic ? 'لا توجد نتائج مطابقة للبحث' : 'No categories match your search')
                  : (isArabic ? 'لا توجد فئات متاحة' : 'No categories available')
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => {
                const isSelected = selectedCategories.includes(category.id);
                const isSaving = savingCategoryId === category.id;
                
                console.log(`🔍 Category ${category.name} (ID: ${category.id}):`, {
                  isSelected,
                  selectedCategories,
                  isSaving
                });
                
                return (
                  <motion.div
                    key={`${category.id}-${updateTrigger}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-md relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isSaving ? 'opacity-75 pointer-events-none' : ''}`}
                  >
                    {/* Loading indicator for individual category */}
                    {savingCategoryId === category.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-xl">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                          <span className="text-sm text-blue-600 font-medium">
                            {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{category.icon}</div>
                      {isSelected ? (
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <FaCheckCircle className="h-6 w-6 text-blue-500" />
                          <span className="text-xs text-blue-600 font-medium">
                            {isArabic ? 'مختارة' : 'Selected'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                          <span className="text-xs text-gray-500">
                            {isArabic ? 'انقر للاختيار' : 'Click to select'}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {category.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        <FaUsers className="inline h-3 w-3 mr-1" />
                        {category.professionals_count} {isArabic ? 'محترف' : 'professionals'}
                      </span>
                      <span>
                        <FaDollarSign className="inline h-3 w-3 mr-1" />
                        {isArabic ? 'متوسط' : 'Avg'} ${category.average_price}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center">
              <FaCheckCircle className="mr-2 h-4 w-4" />
              <span>{success}</span>
              <button
                onClick={() => setSuccess(null)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 h-4 w-4" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Category Selection Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isArabic ? 'اختيار فئات الخدمات' : 'Select Service Categories'}
                  </h2>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  {isArabic 
                    ? 'اختر الفئات التي تريد أن يظهر بروفايلك فيها. هذا سيساعد العملاء في العثور عليك.'
                    : 'Select the categories where you want your profile to appear. This will help clients find you.'
                  }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {serviceCategories.map(category => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${
                        selectedCategories.includes(category.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${savingCategoryId === category.id ? 'opacity-75 pointer-events-none' : ''}`}
                    >
                      {/* Loading indicator */}
                      {savingCategoryId === category.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="text-2xl">{category.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{category.professionals_count} {isArabic ? 'محترف' : 'professionals'}</span>
                            <span>{isArabic ? 'متوسط السعر' : 'Avg price'}: ${category.average_price}</span>
                          </div>
                        </div>
                        {selectedCategories.includes(category.id) ? (
                          <FaCheckCircle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {isArabic ? 'تم اختيار' : 'Selected'}: {selectedCategories.length} {isArabic ? 'فئات' : 'categories'}
                    <div className="text-xs text-gray-500 mt-1">
                      {isArabic ? 'التغييرات تُحفظ تلقائياً' : 'Changes are saved automatically'}
                    </div>
                  </div>
                  <div className="flex space-x-3 rtl:space-x-reverse">
                    <button
                      onClick={() => setShowCategoryModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isArabic ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProServicesPage; 