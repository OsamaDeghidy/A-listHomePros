import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { alistProsService, userService } from '../services/api';
import UserTypeSpecificFields from '../components/profile/UserTypeSpecificFields';
import '../styles/pro-profile.css';
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
  FaLinkedin,
  FaTools,
  FaDollarSign,
  FaAward,
  FaBuilding,
  FaIdCard,
  FaFileAlt,
  FaCertificate,
  FaImage,
  FaStar,
  FaPlus,
  FaMinus,
  FaTrash,
  FaUsers
} from 'react-icons/fa';

const ProProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [activeSection, setActiveSection] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('general'); // general, contractor, specialist, consultant, agency
  
  // Media uploads
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [certificateFiles, setCertificateFiles] = useState([]);

  // Profile data structure adapted to match backend models
  const [profileData, setProfileData] = useState({
    // Basic User Information (from CustomUser model)
    name: '', // matches user.name in backend
    email: '',
    phone_number: '', // matches user.phone_number in backend
    role: 'contractor', // matches user.role (UserRole.CONTRACTOR)
    
    // Professional Profile Information (from AListHomeProProfile model)
    business_name: '',
    business_description: '',
    years_of_experience: 0,
    license_number: '',
    insurance_info: '',
    service_radius: 50,
    profile_image: null,
    is_onboarded: false,
    
    // Service Categories (ManyToMany relation)
    service_categories: [],
    service_category_ids: [], // for API updates
    
    // Portfolio Items (related model)
    portfolio_items: [],
    
    // Reviews (related model - read only)
    reviews: [],
    average_rating: 0,
    
    // Additional fields for different user types
    // These will be stored as JSON or additional fields
    contractor_details: {
      license_state: '',
      license_expiry: '',
      insurance_provider: '',
      insurance_policy: '',
      insurance_expiry: '',
      bonded: false,
      equipment_owned: [],
      project_types: [],
      crew_size: 1,
      availability_schedule: 'full_time'
    },
    
    specialist_details: {
      certifications: [],
      specialization_areas: [],
      consultation_rate: 0,
      remote_consultation: true,
      education_background: '',
      professional_associations: [],
      speaking_languages: [],
      minimum_project_size: 0
    },
    
    consultant_details: {
      consultation_types: [],
      consultation_methods: [],
      report_delivery_time: '',
      follow_up_included: true,
      site_visit_rate: 0,
      expertise_areas: [],
      client_types: [],
      project_duration_preference: ''
    },
    
    agency_details: {
      company_size: '',
      established_year: '',
      business_license: '',
      service_areas: [],
      team_members: [],
      subcontractors: [],
      quality_guarantees: [],
      response_time: '',
      emergency_services: false
    },
    
    // Contact and social (will be stored as additional user fields or separate model)
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    website: '',
    social_links: {
      twitter: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      tiktok: ''
    },
    
    // Privacy settings
    profile_visibility: 'public',
    show_email: false,
    show_phone: true,
    show_address: false,
    show_rates: true,
    allow_reviews: true,
    auto_accept_bookings: false
  });

  // User type mapping to backend UserRole
  const userTypes = [
    {
      id: 'contractor',
      name: isArabic ? 'مقاول' : 'Licensed Contractor',
      description: isArabic ? 'مقاول مرخص ومؤمن' : 'Licensed and insured contractor',
      icon: FaTools,
      color: 'green',
      backendRole: 'contractor' // maps to UserRole.CONTRACTOR
    },
    {
      id: 'specialist',
      name: isArabic ? 'أخصائي' : 'Certified Specialist',
      description: isArabic ? 'خبير متخصص ومعتمد' : 'Certified expert in specific field',
      icon: FaAward,
      color: 'purple',
      backendRole: 'specialist' // maps to UserRole.SPECIALIST
    },
    {
      id: 'crew',
      name: isArabic ? 'طاقم عمل' : 'Crew Member',
      description: isArabic ? 'عضو في طاقم العمل' : 'Team crew member',
      icon: FaUsers,
      color: 'blue',
      backendRole: 'crew' // maps to UserRole.CREW
    },
    {
      id: 'admin',
      name: isArabic ? 'مدير' : 'Administrator',
      description: isArabic ? 'مدير النظام' : 'System administrator',
      icon: FaUserCircle,
      color: 'red',
      backendRole: 'admin' // maps to UserRole.ADMIN
    }
  ];

  // Statistics
  const [profileStats, setProfileStats] = useState({
    profileCompletion: 0,
    totalViews: 0,
    totalBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    joinDate: '',
    lastActive: '',
    responseRate: 0,
    completionRate: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pro-dashboard/profile');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load profile data
  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    }
  }, [isAuthenticated]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Loading professional profile data...');
      
      // Load user profile first
      let userProfile = null;
      let alistProProfile = null;
      
      try {
        // Get current user data
        const userResponse = await userService.getProfile();
        userProfile = userResponse.data;
        console.log('✅ User profile loaded:', userProfile);
      } catch (userError) {
        console.log('❌ Failed to load user profile:', userError);
        setError(isArabic ? 'خطأ في تحميل بيانات المستخدم' : 'Error loading user data');
      }
      
      try {
        // Get A-List Pro profile
        const proResponse = await alistProsService.getProfile('me');
        alistProProfile = proResponse.data;
        console.log('✅ A-List Pro profile loaded:', alistProProfile);
      } catch (proError) {
        console.log('❌ No A-List Pro profile found, user needs to create one');
        // This is normal for new users who haven't created a pro profile yet
      }
      
      // Populate profile data from API
      populateProfileFromAPI(userProfile, alistProProfile);
      
      // Set user type based on backend role
      if (userProfile?.role) {
        const backendRoleToUserType = {
          'contractor': 'contractor',
          'specialist': 'specialist', 
          'crew': 'crew',
          'admin': 'admin'
        };
        setUserType(backendRoleToUserType[userProfile.role] || 'contractor');
      }
      
      // Calculate profile completion
      calculateProfileStats();
      
    } catch (err) {
      console.error('❌ Error loading profile:', err);
      setError(isArabic ? 'خطأ في تحميل البيانات - تم تحميل بيانات تجريبية' : 'Error loading data - Loaded demo data');
      loadMockProfileData();
    } finally {
      setIsLoading(false);
    }
  };

  const populateProfileFromAPI = (userProfile, alistProProfile) => {
    const newProfileData = { ...profileData };
    
    // Populate from user profile
    if (userProfile) {
      newProfileData.name = userProfile.name || userProfile.get_full_name || '';
      newProfileData.email = userProfile.email || '';
      newProfileData.phone_number = userProfile.phone_number || '';
      newProfileData.role = userProfile.role || 'contractor';
    }
    
    // Populate from A-List Pro profile
    if (alistProProfile) {
      newProfileData.business_name = alistProProfile.business_name || '';
      newProfileData.business_description = alistProProfile.business_description || '';
      newProfileData.years_of_experience = alistProProfile.years_of_experience || 0;
      newProfileData.license_number = alistProProfile.license_number || '';
      newProfileData.insurance_info = alistProProfile.insurance_info || '';
      newProfileData.service_radius = alistProProfile.service_radius || 50;
      newProfileData.profile_image = alistProProfile.profile_image || null;
      newProfileData.is_onboarded = alistProProfile.is_onboarded || false;
      newProfileData.service_categories = alistProProfile.service_categories || [];
      newProfileData.portfolio_items = alistProProfile.portfolio_items || [];
      newProfileData.reviews = alistProProfile.reviews || [];
      newProfileData.average_rating = alistProProfile.average_rating || 0;
      
      // Extract service category IDs for updates
      newProfileData.service_category_ids = (alistProProfile.service_categories || []).map(cat => cat.id);
      
      // Set avatar preview
      setAvatarPreview(alistProProfile.profile_image || '');
    }
    
    setProfileData(newProfileData);
  };

  const loadMockProfileData = () => {
    const mockData = {
      // User profile data
      name: 'Ahmed Al-Mahmoud',
      email: 'ahmed.mahmoud@example.com',
      phone_number: '+1-555-0123',
      role: 'contractor',
      
      // Professional profile data
      business_name: 'Al-Mahmoud Home Services',
      business_description: 'Professional contractor with 10+ years of experience in residential and commercial projects.',
      years_of_experience: 12,
      license_number: 'TX-12345-2024',
      insurance_info: 'State Farm Business - Policy POL-789456123',
      service_radius: 75,
      profile_image: null,
      is_onboarded: true,
      
      // Service categories
      service_categories: [
        { id: 1, name: 'Plumbing', description: 'Residential and commercial plumbing services' },
        { id: 2, name: 'Electrical', description: 'Licensed electrical work' },
        { id: 3, name: 'HVAC', description: 'Heating, ventilation, and air conditioning' }
      ],
      service_category_ids: [1, 2, 3],
      
      // Portfolio items
      portfolio_items: [
        { id: 1, title: 'Kitchen Renovation', description: 'Complete kitchen remodel', image: null },
        { id: 2, title: 'Bathroom Installation', description: 'New bathroom installation', image: null }
      ],
      
      // Reviews
      reviews: [
        { id: 1, rating: 5, comment: 'Excellent work!', client: { name: 'John Smith' } },
        { id: 2, rating: 4, comment: 'Very professional', client: { name: 'Mary Johnson' } }
      ],
      average_rating: 4.5,
      
      // Contractor specific details
      contractor_details: {
        license_state: 'Texas',
        license_expiry: '2025-12-31',
        insurance_provider: 'State Farm Business',
        insurance_policy: 'POL-789456123',
        insurance_expiry: '2025-06-30',
        bonded: true,
        equipment_owned: ['Excavator', 'Concrete Mixer', 'Power Tools'],
        project_types: ['Residential', 'Commercial', 'Renovation'],
        crew_size: 5,
        availability_schedule: 'full_time'
      },
      
      // Contact info
      address: '123 Main Street',
      city: 'Houston',
      state: 'TX',
      zip_code: '77001',
      country: 'US',
      
      // Social links
      social_links: {
        website: 'https://al-mahmoud-services.com',
        facebook: 'https://facebook.com/almahmoudservices',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        tiktok: ''
      },
      
      // Privacy settings
      profile_visibility: 'public',
      show_email: false,
      show_phone: true,
      show_address: false,
      show_rates: true,
      allow_reviews: true,
      auto_accept_bookings: false
    };

    setProfileData(prev => ({ ...prev, ...mockData }));
    setUserType('contractor');
    
    // Mock stats
    setProfileStats({
      profileCompletion: 85,
      totalViews: 1250,
      totalBookings: 156,
      averageRating: 4.5,
      totalReviews: 42,
      joinDate: '2022-03-15',
      lastActive: new Date().toISOString(),
      responseRate: 95,
      completionRate: 98
    });
  };

  const calculateProfileStats = () => {
    const completion = calculateCompletionPercentage();
    setProfileStats(prev => ({ ...prev, profileCompletion: completion }));
  };

  const calculateCompletionPercentage = () => {
    const basicFields = ['name', 'phone_number', 'business_name', 'business_description'];
    const professionalFields = ['years_of_experience', 'license_number', 'insurance_info', 'service_radius'];
    const userTypeFields = getUserTypeRequiredFields();
    const allFields = [...basicFields, ...professionalFields, ...userTypeFields];
    
    let completed = 0;
    
    // Check basic fields
    basicFields.forEach(field => {
      if (profileData[field] && profileData[field].toString().trim() !== '') {
        completed++;
      }
    });
    
    // Check professional fields
    professionalFields.forEach(field => {
      if (profileData[field] && profileData[field].toString().trim() !== '') {
        completed++;
      }
    });
    
    // Check user type specific fields
    userTypeFields.forEach(field => {
      const value = getFieldValue(field);
      if (value !== undefined && value !== null && value.toString().trim() !== '') {
        completed++;
      }
    });
    
    return Math.round((completed / allFields.length) * 100);
  };

  const getUserTypeRequiredFields = () => {
    switch (userType) {
      case 'contractor':
        return [
          'contractor_details.license_state',
          'contractor_details.insurance_provider',
          'contractor_details.crew_size'
        ];
      case 'specialist':
        return [
          'specialist_details.certifications',
          'specialist_details.specialization_areas',
          'specialist_details.consultation_rate'
        ];
      case 'consultant':
        return [
          'consultant_details.consultation_types',
          'consultant_details.expertise_areas',
          'consultant_details.report_delivery_time'
        ];
      case 'agency':
        return [
          'agency_details.company_size',
          'agency_details.established_year',
          'agency_details.service_areas'
        ];
      default:
        return [];
    }
  };

  const getFieldValue = (fieldPath) => {
    const keys = fieldPath.split('.');
    let value = profileData;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    return value;
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => {
      const newData = { ...prev };
      
      if (field.includes('.')) {
        // Handle nested fields like 'contractor_details.license_number'
        const [parent, child] = field.split('.');
        newData[parent] = {
          ...newData[parent],
          [child]: value
        };
      } else {
        // Handle direct fields
        newData[field] = value;
      }
      
      return newData;
    });
    
    // Clear any existing messages when user makes changes
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleUserTypeChange = (newType) => {
    setUserType(newType);
    
    // Update the role in profile data to match backend
    setProfileData(prev => ({
      ...prev,
      role: newType
    }));
    
    // Initialize specific data for the new user type if needed
    const detailsKey = `${newType}_details`;
    if (!profileData[detailsKey]) {
      setProfileData(prev => ({
        ...prev,
        [detailsKey]: getDefaultDataForUserType(newType)
      }));
    }
  };

  const getDefaultDataForUserType = (type) => {
    switch (type) {
      case 'contractor':
        return {
          license_state: '',
          license_expiry: '',
          insurance_provider: '',
          insurance_policy: '',
          insurance_expiry: '',
          bonded: false,
          equipment_owned: [],
          project_types: [],
          crew_size: 1,
          availability_schedule: 'full_time'
        };
      case 'specialist':
        return {
          certifications: [],
          specialization_areas: [],
          consultation_rate: 0,
          remote_consultation: true,
          education_background: '',
          professional_associations: [],
          speaking_languages: [],
          minimum_project_size: 0
        };
      case 'consultant':
        return {
          consultation_types: [],
          consultation_methods: [],
          report_delivery_time: '',
          follow_up_included: true,
          site_visit_rate: 0,
          expertise_areas: [],
          client_types: [],
          project_duration_preference: ''
        };
      case 'agency':
        return {
          company_size: '',
          established_year: '',
          business_license: '',
          service_areas: [],
          team_members: [],
          subcontractors: [],
          quality_guarantees: [],
          response_time: '',
          emergency_services: false
        };
      default:
        return {};
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
      console.log('💾 Saving profile data:', profileData);
      
      // Prepare user data for update
      const userData = {
        name: profileData.name,
        phone_number: profileData.phone_number,
        // Note: role updates might need admin approval in production
        ...(profileData.role && { role: profileData.role })
      };
      
      // Prepare A-List Pro profile data
      const proProfileData = {
        business_name: profileData.business_name,
        business_description: profileData.business_description,
        years_of_experience: profileData.years_of_experience,
        license_number: profileData.license_number,
        insurance_info: profileData.insurance_info,
        service_radius: profileData.service_radius,
        service_category_ids: profileData.service_category_ids || []
      };
      
      // Handle profile image upload if new file selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('profile_image', avatarFile);
        Object.keys(proProfileData).forEach(key => {
          if (key === 'service_category_ids' && Array.isArray(proProfileData[key])) {
            proProfileData[key].forEach(id => formData.append('service_category_ids', id));
          } else {
            formData.append(key, proProfileData[key]);
          }
        });
        proProfileData = formData;
      }
      
      let updateResults = [];
      
      try {
        // Update user profile
        console.log('📡 Updating user profile...');
        const userUpdateResult = await userService.updateProfile(userData);
        updateResults.push('user profile');
        console.log('✅ User profile updated successfully');
      } catch (userError) {
        console.log('❌ User profile update failed:', userError);
        // Continue with pro profile update even if user update fails
      }
      
      try {
        // Update/Create A-List Pro profile
        console.log('📡 Updating A-List Pro profile...');
        const proUpdateResult = await alistProsService.updateProfile('me', proProfileData);
        updateResults.push('professional profile');
        console.log('✅ A-List Pro profile updated successfully');
      } catch (proError) {
        console.log('❌ A-List Pro profile update failed, trying to create new profile...');
        
        try {
          // If update fails, try to create new profile
          const proCreateResult = await alistProsService.createProfile(proProfileData);
          updateResults.push('new professional profile created');
          console.log('✅ New A-List Pro profile created successfully');
        } catch (createError) {
          console.log('❌ Failed to create new A-List Pro profile:', createError);
          throw createError;
        }
      }
      
      // Update portfolio items if any changes
      if (portfolioFiles.length > 0) {
        try {
          console.log('📡 Updating portfolio items...');
          for (const portfolioFile of portfolioFiles) {
            const portfolioData = new FormData();
            portfolioData.append('image', portfolioFile.file);
            portfolioData.append('title', portfolioFile.title || 'Portfolio Item');
            portfolioData.append('description', portfolioFile.description || 'Portfolio description');
            
            await alistProsService.createPortfolioItem(portfolioData);
          }
          updateResults.push('portfolio items');
          console.log('✅ Portfolio items updated successfully');
        } catch (portfolioError) {
          console.log('❌ Portfolio update failed:', portfolioError);
          // Don't fail entire save for portfolio errors
        }
      }
      
      if (updateResults.length > 0) {
        setSuccess(isArabic ? 
          `تم حفظ ${updateResults.join(' و ')} بنجاح` : 
          `Successfully updated ${updateResults.join(' and ')}`
        );
        
        // Reload profile data to get latest from server
        setTimeout(() => {
          loadProfileData();
        }, 1000);
        
        // Calculate updated stats
        calculateProfileStats();
        
        // Auto-hide success message
        setTimeout(() => setSuccess(''), 5000);
      } else {
        throw new Error('No updates were successful');
      }
      
    } catch (err) {
      console.error('❌ Error saving profile:', err);
      
      let errorMessage = isArabic ? 'خطأ في حفظ الملف الشخصي' : 'Error saving profile';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = isArabic ? 'يجب تسجيل الدخول مرة أخرى' : 'Please log in again';
        } else if (err.response.status === 403) {
          errorMessage = isArabic ? 'ليس لديك صلاحية لتحديث هذا الملف' : 'You do not have permission to update this profile';
        } else if (err.response.status === 400) {
          const validationErrors = err.response.data;
          errorMessage = isArabic ? 'بيانات غير صحيحة' : 'Invalid data provided';
          
          // Extract specific field errors
          if (validationErrors && typeof validationErrors === 'object') {
            const errorFields = Object.keys(validationErrors).slice(0, 3);
            if (errorFields.length > 0) {
              errorMessage += ': ' + errorFields.join(', ');
            }
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  const removeServiceCategory = (categoryId) => {
    setProfileData(prev => ({
      ...prev,
      service_categories: prev.service_categories.filter(cat => cat.id !== categoryId),
      service_category_ids: prev.service_category_ids.filter(id => id !== categoryId)
    }));
  };

  const addPortfolioFile = (file) => {
    setPortfolioFiles(prev => [...prev, {
      file,
      title: file.name,
      description: '',
      id: Date.now() // temporary ID
    }]);
  };

  // Section configurations
  const sections = [
    {
      id: 'overview',
      name: isArabic ? 'نظرة عامة' : 'Overview',
      icon: FaEye,
      description: isArabic ? 'ملخص الملف الشخصي' : 'Profile summary and stats'
    },
    {
      id: 'personal',
      name: isArabic ? 'المعلومات الشخصية' : 'Personal Info',
      icon: FaUser,
      description: isArabic ? 'الاسم والمعلومات الأساسية' : 'Name and basic information'
    },
    {
      id: 'professional',
      name: isArabic ? 'المعلومات المهنية' : 'Professional Info',
      icon: FaBriefcase,
      description: isArabic ? 'تفاصيل العمل والخدمات' : 'Business and service details'
    },
    {
      id: 'usertype',
      name: isArabic ? 'نوع المزود' : 'Provider Type',
      icon: FaIdCard,
      description: isArabic ? 'نوع مقدم الخدمة' : 'Service provider type'
    },
    {
      id: 'services',
      name: isArabic ? 'الخدمات' : 'Services',
      icon: FaTools,
      description: isArabic ? 'الخدمات المقدمة' : 'Services offered'
    },
    {
      id: 'availability',
      name: isArabic ? 'أوقات العمل' : 'Availability',
      icon: FaClock,
      description: isArabic ? 'جدول العمل والتوفر' : 'Working hours and schedule'
    },
    {
      id: 'media',
      name: isArabic ? 'الوسائط' : 'Media',
      icon: FaImage,
      description: isArabic ? 'الصور ومعرض الأعمال' : 'Photos and portfolio'
    },
    {
      id: 'contact',
      name: isArabic ? 'معلومات الاتصال' : 'Contact Info',
      icon: FaPhone,
      description: isArabic ? 'الهاتف والعنوان' : 'Phone and address details'
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
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل الملف الشخصي...' : 'Loading professional profile...'}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      <Helmet>
        <title>{isArabic ? 'تحرير الملف المهني | A-List Home Pros' : 'Edit Professional Profile | A-List Home Pros'}</title>
        <meta name="description" content={isArabic ? 'تحرير وإدارة ملفك المهني' : 'Edit and manage your professional profile'} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isArabic ? 'تحرير الملف المهني' : 'Edit Professional Profile'}
          </h1>
          <p className="text-gray-600">
            {isArabic ? 'قم بتحديث معلوماتك المهنية وإعدادات حسابك' : 'Update your professional information and account settings'}
          </p>
          
          {/* Messages */}
          <AnimatePresence>
            {(success || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-4 rounded-lg flex items-center justify-between ${
                  success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center">
                  {success ? (
                    <FaCheckCircle className="text-green-500 mr-3" />
                  ) : (
                    <FaExclamationTriangle className="text-red-500 mr-3" />
                  )}
                  <span className={success ? 'text-green-800' : 'text-red-800'}>
                    {success || error}
                  </span>
                </div>
                <button
                  onClick={clearMessages}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0"
          >
            {/* Profile Completion Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isArabic ? 'اكتمال الملف الشخصي' : 'Profile Completion'}
              </h3>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      {profileStats.profileCompletion}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${profileStats.profileCompletion}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                  ></div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profileStats.totalViews}</div>
                  <div className="text-xs text-gray-500">{isArabic ? 'مشاهدات' : 'Views'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{profileStats.totalBookings}</div>
                  <div className="text-xs text-gray-500">{isArabic ? 'حجوزات' : 'Bookings'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                    <FaStar className="mr-1" />
                    {profileStats.averageRating}
                  </div>
                  <div className="text-xs text-gray-500">{isArabic ? 'التقييم' : 'Rating'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profileStats.responseRate}%</div>
                  <div className="text-xs text-gray-500">{isArabic ? 'معدل الرد' : 'Response'}</div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-4 border-b border-gray-100 transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`mr-3 text-lg ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-medium">{section.name}</div>
                        <div className="text-sm text-gray-500">{section.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Content will be added in the next parts */}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {sections.find(s => s.id === activeSection)?.name}
                </h2>
                
                {activeSection === 'overview' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      {isArabic ? 'نظرة عامة على ملفك المهني وإحصائياتك' : 'Overview of your professional profile and statistics'}
                    </p>
                    {/* Overview content will be added */}
                  </div>
                )}
                
                {activeSection === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'الاسم الكامل' : 'Full Name'}
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل الاسم الكامل' : 'Enter full name'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'البريد الإلكتروني' : 'Email'}
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          placeholder={isArabic ? 'البريد الإلكتروني' : 'Email address'}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {isArabic ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone_number}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'نوع المستخدم' : 'User Role'}
                        </label>
                        <select
                          value={profileData.role}
                          onChange={(e) => handleUserTypeChange(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {userTypes.map(type => (
                            <option key={type.id} value={type.backendRole}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {isArabic ? 'تغيير نوع المستخدم قد يتطلب موافقة المدير' : 'Role changes may require admin approval'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'professional' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'اسم العمل' : 'Business Name'}
                        </label>
                        <input
                          type="text"
                          value={profileData.business_name}
                          onChange={(e) => handleInputChange('business_name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل اسم العمل' : 'Enter business name'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'سنوات الخبرة' : 'Years of Experience'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={profileData.years_of_experience}
                          onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'رقم الترخيص' : 'License Number'}
                        </label>
                        <input
                          type="text"
                          value={profileData.license_number}
                          onChange={(e) => handleInputChange('license_number', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل رقم الترخيص' : 'Enter license number'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'نطاق الخدمة (ميل)' : 'Service Radius (miles)'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={profileData.service_radius}
                          onChange={(e) => handleInputChange('service_radius', parseInt(e.target.value) || 50)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'وصف العمل' : 'Business Description'}
                      </label>
                      <textarea
                        value={profileData.business_description}
                        onChange={(e) => handleInputChange('business_description', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                        placeholder={isArabic ? 'صف عملك وخدماتك' : 'Describe your business and services'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'معلومات التأمين' : 'Insurance Information'}
                      </label>
                      <input
                        type="text"
                        value={profileData.insurance_info}
                        onChange={(e) => handleInputChange('insurance_info', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={isArabic ? 'أدخل معلومات التأمين' : 'Enter insurance information'}
                      />
                    </div>
                  </div>
                )}
                
                {activeSection === 'usertype' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      {isArabic ? 'اختر نوع المحترف المناسب لعملك' : 'Choose the professional type that best matches your business'}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userTypes.map((type) => {
                        const Icon = type.icon;
                        const isActive = userType === type.id;
                        
                        return (
                          <motion.div
                            key={type.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`user-type-card ${type.color} ${isActive ? 'active' : ''} cursor-pointer p-6 border-2 rounded-xl transition-all duration-200 ${
                              isActive
                                ? `border-${type.color}-500 bg-${type.color}-50`
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            onClick={() => handleUserTypeChange(type.id)}
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-lg bg-${type.color}-100`}>
                                <Icon className={`text-2xl text-${type.color}-600`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {type.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {type.description}
                                </p>
                                {isActive && (
                                  <div className="mt-3 flex items-center text-sm text-green-600">
                                    <FaCheck className="mr-2" />
                                    {isArabic ? 'محدد حالياً' : 'Currently selected'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* User Type Specific Fields */}
                    <div className="mt-8">
                      <UserTypeSpecificFields
                        userType={userType}
                        profileData={profileData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
                
                {activeSection === 'services' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      {isArabic ? 'إدارة الخدمات وفئات الخدمات التي تقدمها' : 'Manage the services and service categories you offer'}
                    </p>
                    
                    {/* Service Categories */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {isArabic ? 'فئات الخدمات' : 'Service Categories'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(profileData.service_categories || []).map((category, index) => (
                          <div
                            key={category.id || index}
                            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium text-blue-900">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-blue-700">{category.description}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeServiceCategory(category.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {profileData.service_categories?.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FaInfoCircle className="mx-auto text-4xl mb-4 text-gray-400" />
                          <p>{isArabic ? 'لم يتم إضافة فئات خدمات بعد' : 'No service categories added yet'}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Portfolio Preview */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {isArabic ? 'معرض الأعمال' : 'Portfolio'}
                      </h3>
                      
                      <div className="portfolio-grid">
                        {(profileData.portfolio_items || []).map((item, index) => (
                          <div key={item.id || index} className="portfolio-item">
                            {item.image ? (
                              <img src={item.image} alt={item.title} />
                            ) : (
                              <div className="upload-placeholder">
                                <FaImage className="text-2xl mb-2" />
                                <span className="text-sm">{item.title}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="portfolio-item">
                          <div className="upload-placeholder">
                            <FaPlus className="text-2xl mb-2" />
                            <span className="text-sm">
                              {isArabic ? 'إضافة عمل جديد' : 'Add new work'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'availability' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'أوقات العمل' : 'Working Hours'}
                        </label>
                        <textarea
                          value={profileData.availability_schedule}
                          onChange={(e) => handleInputChange('availability_schedule', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل أوقات العمل' : 'Enter working hours'}
                        ></textarea>
                      </div>
                      
                      {userType === 'contractor' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'معلومات التأمين' : 'Insurance Information'}
                          </label>
                          <textarea
                            value={profileData.insurance_info}
                            onChange={(e) => handleInputChange('insurance_info', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={isArabic ? 'أدخل معلومات التأمين' : 'Enter insurance information'}
                          ></textarea>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeSection === 'media' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'الصورة الشخصية' : 'Profile Picture'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {userType === 'contractor' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'صورة التأمين' : 'Insurance Picture'}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleInputChange('insurance_picture', e.target.files[0])}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeSection === 'contact' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'العنوان' : 'Address'}
                        </label>
                        <textarea
                          value={profileData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل العنوان' : 'Enter address'}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'المدينة' : 'City'}
                        </label>
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل الولاية' : 'Enter state'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'رمز البريد' : 'Zip Code'}
                        </label>
                        <input
                          type="text"
                          value={profileData.zip_code}
                          onChange={(e) => handleInputChange('zip_code', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل رمز البريد' : 'Enter zip code'}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'social' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'روابط الموقع الإلكتروني' : 'Website'}
                        </label>
                        <input
                          type="text"
                          value={profileData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل روابط الموقع الإلكتروني' : 'Enter website URL'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'روابط التويتر' : 'Twitter'}
                        </label>
                        <input
                          type="text"
                          value={profileData.social_links.twitter}
                          onChange={(e) => handleInputChange('social_links.twitter', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل روابط التويتر' : 'Enter Twitter URL'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'روابط الفيسبوك' : 'Facebook'}
                        </label>
                        <input
                          type="text"
                          value={profileData.social_links.facebook}
                          onChange={(e) => handleInputChange('social_links.facebook', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل روابط الفيسبوك' : 'Enter Facebook URL'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'روابط الانستغرام' : 'Instagram'}
                        </label>
                        <input
                          type="text"
                          value={profileData.social_links.instagram}
                          onChange={(e) => handleInputChange('social_links.instagram', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'أدخل روابط الانستغرام' : 'Enter Instagram URL'}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'privacy' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'الخصوصية' : 'Privacy'}
                        </label>
                        <select
                          value={profileData.profile_visibility}
                          onChange={(e) => handleInputChange('profile_visibility', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'إظهار البريد الإلكتروني' : 'Show Email'}
                        </label>
                        <select
                          value={profileData.show_email ? 'yes' : 'no'}
                          onChange={(e) => handleInputChange('show_email', e.target.value === 'yes')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'إظهار رقم الهاتف' : 'Show Phone'}
                        </label>
                        <select
                          value={profileData.show_phone ? 'yes' : 'no'}
                          onChange={(e) => handleInputChange('show_phone', e.target.value === 'yes')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'إظهار العنوان' : 'Show Address'}
                        </label>
                        <select
                          value={profileData.show_address ? 'yes' : 'no'}
                          onChange={(e) => handleInputChange('show_address', e.target.value === 'yes')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Save Button */}
              <div className="border-t border-gray-200 px-8 py-4">
                <div className="flex justify-end">
                  <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProProfileEditPage; 