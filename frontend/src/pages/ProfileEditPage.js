import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { userService } from '../services/api';
import { 
  FaUser, 
  FaCamera, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaSave, 
  FaTimes,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEdit,
  FaEye,
  FaUserCircle,
  FaCalendarAlt,
  FaGlobe,
  FaHeart,
  FaCheckCircle,
  FaCog,
  FaShieldAlt,
  FaLock,
  FaInfoCircle,
  FaHome,
  FaBirthdayCake,
  FaVenusMars,
  FaLanguage,
  FaClock,
  FaBriefcase,
  FaGraduationCap,
  FaLink,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';

const ProfileEditPage = ({ isPro = false }) => {
  const navigate = useNavigate();
  const { user, updateProfile, isAuthenticated, currentUser } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [activeSection, setActiveSection] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  // Profile data
  const [profileData, setProfileData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    language: language || 'en',
    timezone: 'America/New_York',
    
    // Contact Information
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    
    // About
    bio: '',
    title: '',
    company: '',
    website: '',
    
    // Social Media
    social_links: {
      twitter: '',
      facebook: '',
      instagram: '',
      linkedin: ''
    },
    
    // Privacy Settings
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    show_address: false,
    
    // Professional Info (if isPro)
    ...(isPro && {
      business_name: '',
      business_description: '',
      years_of_experience: 0,
      license_number: '',
      insurance_info: '',
      service_radius: 50,
      hourly_rate: 0,
      specializations: []
    })
  });

  // Statistics
  const [profileStats, setProfileStats] = useState({
    profileCompletion: 0,
    totalViews: 0,
    totalConnections: 0,
    joinDate: '',
    lastActive: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + (isPro ? '/pro-dashboard/profile' : '/dashboard/profile'));
      return;
    }
  }, [isAuthenticated, navigate, isPro]);

  // Load user data
  useEffect(() => {
    if (isAuthenticated && (currentUser || user)) {
      loadUserData();
      calculateProfileCompletion();
    }
  }, [isAuthenticated, currentUser, user]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = currentUser || user;
      if (userData) {
        setProfileData({
          first_name: userData.first_name || userData.firstName || '',
          last_name: userData.last_name || userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          date_of_birth: userData.date_of_birth || '',
          gender: userData.gender || '',
          language: userData.language || language || 'en',
          timezone: userData.timezone || 'America/New_York',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zip_code: userData.zip_code || userData.zip || '',
          country: userData.country || 'US',
          bio: userData.bio || '',
          title: userData.title || '',
          company: userData.company || '',
          website: userData.website || '',
          social_links: {
            twitter: userData.social_links?.twitter || userData.twitter || '',
            facebook: userData.social_links?.facebook || userData.facebook || '',
            instagram: userData.social_links?.instagram || userData.instagram || '',
            linkedin: userData.social_links?.linkedin || userData.linkedin || ''
          },
          profile_visibility: userData.profile_visibility || 'public',
          show_email: userData.show_email || false,
          show_phone: userData.show_phone || false,
          show_address: userData.show_address || false,
          ...(isPro && {
            business_name: userData.business_name || '',
            business_description: userData.business_description || '',
            years_of_experience: userData.years_of_experience || 0,
            license_number: userData.license_number || '',
            insurance_info: userData.insurance_info || '',
            service_radius: userData.service_radius || 50,
            hourly_rate: userData.hourly_rate || 0,
            specializations: userData.specializations || []
          })
        });

        setAvatarPreview(userData.avatar || userData.profile_picture || '');
        setCoverPreview(userData.cover_photo || '');

        // Load stats
        setProfileStats({
          profileCompletion: calculateCompletionPercentage(userData),
          totalViews: userData.profile_views || 0,
          totalConnections: userData.connections_count || 0,
          joinDate: userData.date_joined || userData.created_at || '',
          lastActive: userData.last_login || userData.last_active || ''
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(isArabic ? 'خطأ في تحميل بيانات المستخدم' : 'Error loading user data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletionPercentage = (userData) => {
    const fields = [
      'first_name', 'last_name', 'phone', 'bio', 'address', 'city'
    ];
    const completed = fields.filter(field => userData[field] && userData[field].trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const calculateProfileCompletion = () => {
    const completion = calculateCompletionPercentage(profileData);
    setProfileStats(prev => ({ ...prev, profileCompletion: completion }));
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      let updatedData = { ...profileData };

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarResponse = await userService.uploadAvatar(formData);
        updatedData.avatar = avatarResponse.data.avatar_url;
      }

      // Upload cover photo if changed
      if (coverFile) {
        const formData = new FormData();
        formData.append('cover_photo', coverFile);
        const coverResponse = await userService.uploadCoverPhoto(formData);
        updatedData.cover_photo = coverResponse.data.cover_url;
      }

      // Update profile
      await updateProfile(updatedData);

      setSuccess(isArabic ? 'تم حفظ الملف الشخصي بنجاح' : 'Profile saved successfully');
      setAvatarFile(null);
      setCoverFile(null);
      calculateProfileCompletion();
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(isArabic ? 'خطأ في حفظ الملف الشخصي' : 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  // Section configurations
  const sections = [
    {
      id: 'personal',
      name: isArabic ? 'المعلومات الشخصية' : 'Personal Info',
      icon: FaUser,
      description: isArabic ? 'الاسم والمعلومات الأساسية' : 'Name and basic information'
    },
    {
      id: 'contact',
      name: isArabic ? 'معلومات الاتصال' : 'Contact Info',
      icon: FaPhone,
      description: isArabic ? 'الهاتف والعنوان' : 'Phone and address details'
    },
    {
      id: 'about',
      name: isArabic ? 'نبذة عني' : 'About Me',
      icon: FaInfoCircle,
      description: isArabic ? 'النبذة الشخصية والمهنة' : 'Bio and professional details'
    },
    {
      id: 'social',
      name: isArabic ? 'وسائل التواصل' : 'Social Links',
      icon: FaLink,
      description: isArabic ? 'روابط الشبكات الاجتماعية' : 'Social media profiles'
    },
    {
      id: 'privacy',
      name: isArabic ? 'الخصوصية' : 'Privacy',
      icon: FaShieldAlt,
      description: isArabic ? 'إعدادات الخصوصية' : 'Privacy settings'
    },
    ...(isPro ? [{
      id: 'professional',
      name: isArabic ? 'المعلومات المهنية' : 'Professional',
      icon: FaBriefcase,
      description: isArabic ? 'معلومات العمل والخدمات' : 'Business and service details'
    }] : [])
  ];

  // Languages
  const languages = [
    { value: 'en', label: isArabic ? 'الإنجليزية' : 'English' },
    { value: 'ar', label: isArabic ? 'العربية' : 'Arabic' }
  ];

  // Timezones
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (GMT-5)' },
    { value: 'America/Chicago', label: 'Central Time (GMT-6)' },
    { value: 'America/Denver', label: 'Mountain Time (GMT-7)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (GMT-8)' },
    { value: 'Europe/London', label: 'London Time (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris Time (GMT+1)' },
    { value: 'Asia/Dubai', label: 'Dubai Time (GMT+4)' },
    { value: 'Asia/Riyadh', label: 'Riyadh Time (GMT+3)' }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل الملف الشخصي...' : 'Loading profile...'}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      <Helmet>
        <title>{isArabic ? (isPro ? 'تحرير الملف المهني - قائمة المنزل للمحترفين' : 'تحرير الملف الشخصي - قائمة المنزل للمحترفين') : (isPro ? 'Edit Professional Profile - A List Home Pros' : 'Edit Profile - A List Home Pros')}</title>
        <meta name="description" content={isArabic ? 'تحرير وإدارة ملفك الشخصي' : 'Edit and manage your profile'} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isArabic ? (isPro ? 'تحرير الملف المهني' : 'تحرير الملف الشخصي') : (isPro ? 'Edit Professional Profile' : 'Edit Profile')}
          </h1>
          <p className="text-gray-600">
            {isArabic ? 'قم بتحديث معلوماتك الشخصية وإعدادات حسابك' : 'Update your personal information and account settings'}
          </p>
        </motion.div>

        {/* Cover Photo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl overflow-hidden mb-8 h-48"
        >
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
        )}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          {/* Avatar and Basic Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FaUser className="text-gray-400 text-2xl" />
                  </div>
                )}
                </div>
                <button
                  onClick={() => document.getElementById('avatar-upload').click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <FaCamera className="text-sm" />
                </button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              <div className="ml-6 text-white">
                <h2 className="text-xl font-semibold">
                  {profileData.first_name || profileData.last_name 
                    ? `${profileData.first_name} ${profileData.last_name}`.trim()
                    : (isArabic ? 'مستخدم' : 'User')
                  }
                </h2>
                <p className="text-blue-100">{profileData.email}</p>
                {profileData.title && <p className="text-blue-200">{profileData.title}</p>}
              </div>
              
              <div className="ml-auto">
                <button
                  onClick={() => document.getElementById('cover-upload').click()}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center"
                >
                  <FaCamera className="mr-2" />
                  {isArabic ? 'تغيير الخلفية' : 'Change Cover'}
                </button>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? 'اكتمال الملف' : 'Profile Complete'}
                </h3>
                <p className="text-3xl font-bold">{profileStats.profileCompletion}%</p>
              </div>
              <FaCheckCircle className="text-3xl opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? 'مشاهدات الملف' : 'Profile Views'}
                </h3>
                <p className="text-3xl font-bold">{profileStats.totalViews}</p>
              </div>
              <FaEye className="text-3xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? 'الاتصالات' : 'Connections'}
                </h3>
                <p className="text-3xl font-bold">{profileStats.totalConnections}</p>
              </div>
              <FaHeart className="text-3xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? 'عضو منذ' : 'Member Since'}
                </h3>
                <p className="text-lg font-bold">
                  {profileStats.joinDate ? new Date(profileStats.joinDate).getFullYear() : '2024'}
                </p>
              </div>
              <FaCalendarAlt className="text-3xl opacity-80" />
            </div>
          </div>
        </motion.div>

        {/* Alert Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center"
            >
              <FaCheckCircle className="mr-3 text-green-600" />
              <span>{success}</span>
              <button 
                onClick={clearMessages}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <FaTimesCircle />
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center"
            >
              <FaExclamationTriangle className="mr-3 text-red-600" />
              <span>{error}</span>
              <button 
                onClick={clearMessages}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <FaTimesCircle />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <nav className="p-4">
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <Icon className={`text-lg ${isArabic ? 'ml-3' : 'mr-3'}`} />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{section.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {/* Personal Information Section */}
              {activeSection === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                    </h2>
                    <FaUser className="text-gray-400 text-xl" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الاسم الأول' : 'First Name'} *
                      </label>
                      <input
                        type="text"
                        value={profileData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'أدخل الاسم الأول' : 'Enter first name'}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الاسم الأخير' : 'Last Name'} *
                      </label>
                      <input
                        type="text"
                        value={profileData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'أدخل الاسم الأخير' : 'Enter last name'}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                          value={profileData.email}
                  disabled
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {isArabic ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                      </p>
            </div>
            
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={isArabic ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'تاريخ الميلاد' : 'Date of Birth'}
                      </label>
                      <div className="relative">
                        <FaBirthdayCake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={profileData.date_of_birth}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الجنس' : 'Gender'}
                      </label>
                      <div className="relative">
                        <FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          value={profileData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">{isArabic ? 'اختر الجنس' : 'Select Gender'}</option>
                          <option value="male">{isArabic ? 'ذكر' : 'Male'}</option>
                          <option value="female">{isArabic ? 'أنثى' : 'Female'}</option>
                          <option value="other">{isArabic ? 'آخر' : 'Other'}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'اللغة المفضلة' : 'Preferred Language'}
                      </label>
                      <div className="relative">
                        <FaLanguage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          value={profileData.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          {languages.map(lang => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'المنطقة الزمنية' : 'Timezone'}
                      </label>
                      <div className="relative">
                        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          value={profileData.timezone}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          {timezones.map(tz => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Contact Information Section */}
              {activeSection === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                    </h2>
                    <FaPhone className="text-gray-400 text-xl" />
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'العنوان' : 'Street Address'}
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                          value={profileData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={isArabic ? 'أدخل العنوان' : 'Enter street address'}
                />
              </div>
            </div>
            
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'المدينة' : 'City'}
                      </label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'أدخل المدينة' : 'Enter city'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الولاية' : 'State'}
                      </label>
                      <input
                        type="text"
                        value={profileData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'أدخل الولاية' : 'Enter state'}
                      />
                    </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الرمز البريدي' : 'ZIP Code'}
                      </label>
                <input
                  type="text"
                        value={profileData.zip_code}
                        onChange={(e) => handleInputChange('zip_code', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'أدخل الرمز البريدي' : 'Enter ZIP code'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'البلد' : 'Country'}
                      </label>
                      <select
                        value={profileData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="US">{isArabic ? 'الولايات المتحدة' : 'United States'}</option>
                        <option value="CA">{isArabic ? 'كندا' : 'Canada'}</option>
                        <option value="SA">{isArabic ? 'السعودية' : 'Saudi Arabia'}</option>
                        <option value="AE">{isArabic ? 'الإمارات' : 'UAE'}</option>
                        <option value="EG">{isArabic ? 'مصر' : 'Egypt'}</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* About Me Section */}
              {activeSection === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isArabic ? 'نبذة عني' : 'About Me'}
                    </h2>
                    <FaInfoCircle className="text-gray-400 text-xl" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'النبذة الشخصية' : 'Bio'}
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={isArabic ? 'اكتب نبذة عن نفسك...' : 'Tell us about yourself...'}
                />
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'المسمى الوظيفي' : 'Job Title'}
                        </label>
                        <div className="relative">
                          <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                            value={profileData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={isArabic ? 'أدخل المسمى الوظيفي' : 'Enter job title'}
                />
              </div>
                      </div>

              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'الشركة' : 'Company'}
                        </label>
                        <div className="relative">
                          <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                            value={profileData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={isArabic ? 'أدخل اسم الشركة' : 'Enter company name'}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'الموقع الإلكتروني' : 'Website'}
                        </label>
                        <div className="relative">
                          <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={profileData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={isArabic ? 'أدخل رابط الموقع' : 'Enter website URL'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Social Links Section */}
              {activeSection === 'social' && (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isArabic ? 'وسائل التواصل الاجتماعي' : 'Social Media Links'}
                    </h2>
                    <FaLink className="text-gray-400 text-xl" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'تويتر' : 'Twitter'}
                      </label>
                      <div className="relative">
                        <FaTwitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                        <input
                          type="url"
                          value={profileData.social_links.twitter}
                          onChange={(e) => handleInputChange('social_links.twitter', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={isArabic ? 'رابط تويتر' : 'Twitter profile URL'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'فيسبوك' : 'Facebook'}
                      </label>
                      <div className="relative">
                        <FaFacebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                        <input
                          type="url"
                          value={profileData.social_links.facebook}
                          onChange={(e) => handleInputChange('social_links.facebook', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={isArabic ? 'رابط فيسبوك' : 'Facebook profile URL'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'إنستغرام' : 'Instagram'}
                      </label>
                      <div className="relative">
                        <FaInstagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" />
                        <input
                          type="url"
                          value={profileData.social_links.instagram}
                          onChange={(e) => handleInputChange('social_links.instagram', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={isArabic ? 'رابط إنستغرام' : 'Instagram profile URL'}
                />
              </div>
            </div>
            
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'لينكد إن' : 'LinkedIn'}
                      </label>
                      <div className="relative">
                        <FaLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700" />
                        <input
                          type="url"
                          value={profileData.social_links.linkedin}
                          onChange={(e) => handleInputChange('social_links.linkedin', e.target.value)}
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={isArabic ? 'رابط لينكد إن' : 'LinkedIn profile URL'}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Privacy Settings Section */}
              {activeSection === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isArabic ? 'إعدادات الخصوصية' : 'Privacy Settings'}
                    </h2>
                    <FaShieldAlt className="text-gray-400 text-xl" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'مستوى الخصوصية' : 'Profile Visibility'}
                      </label>
                      <select
                        value={profileData.profile_visibility}
                        onChange={(e) => handleInputChange('profile_visibility', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="public">{isArabic ? 'عام - يمكن للجميع رؤيته' : 'Public - Everyone can see'}</option>
                        <option value="private">{isArabic ? 'خاص - المسجلين فقط' : 'Private - Registered users only'}</option>
                        <option value="hidden">{isArabic ? 'مخفي - غير مرئي' : 'Hidden - Not visible'}</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isArabic ? 'إظهار المعلومات التالية' : 'Show the following information'}
                      </h3>

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileData.show_email}
                            onChange={(e) => handleInputChange('show_email', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {isArabic ? 'إظهار البريد الإلكتروني' : 'Show email address'}
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileData.show_phone}
                            onChange={(e) => handleInputChange('show_phone', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {isArabic ? 'إظهار رقم الهاتف' : 'Show phone number'}
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileData.show_address}
                            onChange={(e) => handleInputChange('show_address', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {isArabic ? 'إظهار العنوان' : 'Show address'}
                          </span>
                        </label>
            </div>
          </div>
          
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <FaInfoCircle className="text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">
                            {isArabic ? 'ملاحظة مهمة' : 'Important Note'}
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            {isArabic 
                              ? 'تغيير إعدادات الخصوصية قد يؤثر على قدرة العملاء على العثور عليك والتواصل معك.'
                              : 'Changing privacy settings may affect customers\' ability to find and contact you.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-end"
        >
            <button
            onClick={saveProfile}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {isArabic ? 'جاري الحفظ...' : 'Saving...'}
              </>
              ) : (
                <>
                <FaSave className={`${isArabic ? 'ml-2' : 'mr-2'}`} />
                {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                </>
              )}
            </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileEditPage; 