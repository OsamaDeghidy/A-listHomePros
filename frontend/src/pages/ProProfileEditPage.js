import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { alistProsService, userService, addressService } from '../services/api';
import UserTypeSpecificFields from '../components/profile/UserTypeSpecificFields';
import AddressPicker from '../components/common/AddressPicker';
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
  FaUsers,
  FaCloudUploadAlt,
  FaBusinessTime,
  FaCalendar
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
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('contractor'); // general, contractor, specialist, consultant, agency
  
  // Media uploads
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [certificateFiles, setCertificateFiles] = useState([]);

  // Portfolio editing modal state
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null);
  const [portfolioEditTitle, setPortfolioEditTitle] = useState('');
  const [portfolioEditDescription, setPortfolioEditDescription] = useState('');
  const [portfolioEditCompletionDate, setPortfolioEditCompletionDate] = useState('');

  // Portfolio creation modal state
  const [showPortfolioCreateModal, setShowPortfolioCreateModal] = useState(false);
  const [portfolioCreateTitle, setPortfolioCreateTitle] = useState('');
  const [portfolioCreateDescription, setPortfolioCreateDescription] = useState('');
  const [portfolioCreateCompletionDate, setPortfolioCreateCompletionDate] = useState('');
  const [portfolioCreateFiles, setPortfolioCreateFiles] = useState([]);

  // Profile data structure adapted to match backend models
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone_number: '',
    business_name: '',
    business_description: '',
    profession: '', // from AListHomeProProfile
    bio: '', // from AListHomeProProfile
    service_categories: [],
    service_category_ids: [],
    years_of_experience: 0,
    license_number: '',
    license_type: '', // from AListHomeProProfile
    license_expiry: null, // from AListHomeProProfile
    insurance_info: '',
    certifications: '', // from AListHomeProProfile
    service_radius: 50,
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    profile_image: null,
    cover_image: null, // from AListHomeProProfile
    website: '', // from AListHomeProProfile
    is_onboarded: false,
    role: 'contractor',
    is_verified: false, // from AListHomeProProfile
    is_featured: false, // from AListHomeProProfile
    is_available: true, // from AListHomeProProfile
    date_joined: null,
    average_rating: 0,
    total_jobs: 0,
    jobs_completed: 0, // from AListHomeProProfile
    response_time_hours: 24, // from AListHomeProProfile
    hourly_rate: null, // from AListHomeProProfile
    response_rate: 0,
    completion_rate: 0,
    portfolio_items: [],
    reviews: [],
    // Address fields
    addresses: [],
    primary_address: null,
    street_address: '',
    latitude: null,
    longitude: null
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

  // Statistics with all required properties
  const [profileStats, setProfileStats] = useState({
    profileCompletion: 0,
    totalViews: 0,
    totalBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    joinDate: '',
    lastActive: '',
    responseRate: 0,
    completionRate: 0,
    portfolioItems: 0,
    serviceCategoriesCount: 0
  });

  // Safe getter for profile stats
  const getStatValue = (key, defaultValue = 0) => {
    const value = profileStats?.[key];
    if (value === undefined || value === null) {
      console.log(`⚠️ ProfileStats.${key} is undefined, using default:`, defaultValue);
      return defaultValue;
    }
    return value;
  };

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
      
      // Parallel API calls to load all data including addresses and portfolio
      const [userProfileResp, alistProResp, portfolioResp, reviewsResp, addressesResp] = await Promise.all([
        userService.getProfile().catch(() => ({ data: null })),
        alistProsService.getMyProfile().catch(() => ({ data: null })),
        alistProsService.getPortfolio().catch(() => ({ data: [] })),
        alistProsService.getReviews().catch(() => ({ data: [] })),
        addressService.getAddresses().catch(() => ({ data: [] }))
      ]);
      
      console.log('API Responses:', {
        userProfile: userProfileResp.data,
        alistProProfile: alistProResp.data,
        portfolio: portfolioResp.data,
        reviews: reviewsResp.data,
        addresses: addressesResp.data
      });
      
      // Ensure portfolio data is an array
      let portfolioData = [];
      if (portfolioResp.data) {
        if (Array.isArray(portfolioResp.data)) {
          portfolioData = portfolioResp.data;
        } else if (portfolioResp.data.results && Array.isArray(portfolioResp.data.results)) {
          portfolioData = portfolioResp.data.results;
        } else if (typeof portfolioResp.data === 'object') {
          portfolioData = [portfolioResp.data];
        }
      }
      
      console.log('📸 Portfolio items loaded:', portfolioData);
      
      // Ensure addresses data is an array
      let addressesData = [];
      if (addressesResp.data) {
        if (Array.isArray(addressesResp.data)) {
          addressesData = addressesResp.data;
        } else if (addressesResp.data.results && Array.isArray(addressesResp.data.results)) {
          addressesData = addressesResp.data.results;
        }
      }
      
      console.log('🏠 Addresses loaded:', addressesData);
      
      if (userProfileResp.data && alistProResp.data) {
        // API data available - populate from API
        populateProfileFromAPI(userProfileResp.data, alistProResp.data, portfolioData, reviewsResp.data || [], addressesData);
      } else {
        // Fallback to mock data for development
        console.log('⚠️ API data not available, using mock data for development');
        loadMockProfileData();
      }
      
    } catch (error) {
      console.error('❌ Error loading profile data:', error);
      setError(isArabic ? 'فشل في تحميل بيانات الملف الشخصي' : 'Failed to load profile data');
      // Load mock data as fallback
      loadMockProfileData();
    } finally {
      setIsLoading(false);
    }
  };

  const populateProfileFromAPI = (userProfile, alistProProfile, portfolioItems, reviews, addresses = []) => {
    console.log('📝 Populating profile from API data...');
    
    // Find primary address
    const primaryAddress = addresses.find(addr => addr.is_primary) || addresses[0] || null;
    
    setProfileData({
      // User data
      id: alistProProfile.id || userProfile.id,
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone_number: userProfile.phone_number || '',
      role: userProfile.role || 'contractor',
      date_joined: userProfile.date_joined || null,
      
      // A-List Pro Profile data
      business_name: alistProProfile.business_name || '',
      business_description: alistProProfile.business_description || alistProProfile.bio || '',
      profession: alistProProfile.profession || '',
      bio: alistProProfile.bio || '',
      years_of_experience: alistProProfile.years_of_experience || 0,
      
      // License and certifications
      license_number: alistProProfile.license_number || '',
      license_type: alistProProfile.license_type || '',
      license_expiry: alistProProfile.license_expiry || null,
      insurance_info: alistProProfile.insurance_info || '',
      certifications: alistProProfile.certifications || '',
      
      // Service details
      service_categories: alistProProfile.service_categories || [],
      service_category_ids: (alistProProfile.service_categories || []).map(cat => cat.id),
      hourly_rate: alistProProfile.hourly_rate || null,
      service_radius: alistProProfile.service_radius || 50,
      is_available: alistProProfile.is_available !== undefined ? alistProProfile.is_available : true,
      
      // Location data - use primary address or alistpro address or fallback
      address: primaryAddress?.street_address || alistProProfile.address?.street_address || '',
      city: primaryAddress?.city || alistProProfile.address?.city || '',
      state: primaryAddress?.state || alistProProfile.address?.state || '',
      zip_code: primaryAddress?.zip_code || alistProProfile.address?.zip_code || '',
      country: primaryAddress?.country || alistProProfile.address?.country || 'Egypt',
      latitude: primaryAddress?.latitude || alistProProfile.latitude || null,
      longitude: primaryAddress?.longitude || alistProProfile.longitude || null,
      
      // Profile media
      profile_image: alistProProfile.profile_image || userProfile.profile_image || null,
      cover_image: alistProProfile.cover_image || null,
      website: alistProProfile.website || '',
      
      // Status flags
      is_verified: alistProProfile.is_verified || false,
      is_featured: alistProProfile.is_featured || false,
      is_onboarded: alistProProfile.is_onboarded || false,
      
      // Statistics
      total_jobs: alistProProfile.total_jobs || 0,
      jobs_completed: alistProProfile.jobs_completed || 0,
      average_rating: alistProProfile.average_rating || 0,
      response_time_hours: alistProProfile.response_time_hours || 24,
      
      // Portfolio and reviews
      portfolio_items: Array.isArray(portfolioItems) ? portfolioItems : [],
      reviews: Array.isArray(reviews) ? reviews : [],
      
      // Address management
      addresses: addresses,
      primary_address: primaryAddress,
      
      // User type mapping
      userType: userProfile.role || 'contractor'
    });
    
    // Set user type state
    setUserType(userProfile.role || 'contractor');
      
      // Set avatar preview
    if (alistProProfile.profile_image || userProfile.profile_image) {
      setAvatarPreview(alistProProfile.profile_image || userProfile.profile_image);
    }
    
    // Set cover preview
    if (alistProProfile.cover_image) {
      setCoverPreview(alistProProfile.cover_image);
    }
    
    // Calculate and set statistics
    const stats = calculateProfileStats(userProfile, alistProProfile, portfolioItems, reviews);
    setProfileStats(stats);
    
    console.log('✅ Profile populated successfully');
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
      
    
      
   
      
      
    };

    setProfileData(prev => ({ ...prev, ...mockData }));
    setUserType('contractor');
    
    // Mock stats with all required properties
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

  const calculateProfileStats = (userProfile, alistProProfile, portfolioItems, reviews) => {
    const completion = calculateCompletionPercentage();
    
    // Calculate enhanced stats from API data
    const stats = {
      profileCompletion: completion,
      totalViews: alistProProfile?.profile_views || 0,
      totalBookings: alistProProfile?.total_jobs || 0,
      averageRating: alistProProfile?.average_rating || 0,
      totalReviews: reviews?.length || 0,
      joinDate: userProfile?.date_joined || new Date().toISOString(),
      lastActive: alistProProfile?.last_active || new Date().toISOString(),
      responseRate: alistProProfile?.response_rate || 0,
      completionRate: alistProProfile?.completion_rate || 0,
      portfolioItems: portfolioItems?.length || 0,
      serviceCategoriesCount: alistProProfile?.service_categories?.length || 0
    };
    
    setProfileStats(stats);
  };

  // Calculate profile stats whenever profileData changes
  useEffect(() => {
    if (profileData.name || profileData.business_name) {
      const completion = calculateCompletionPercentage();
      setProfileStats(prev => ({
        ...prev,
        profileCompletion: completion,
        portfolioItems: profileData.portfolio_items?.length || 0,
        serviceCategoriesCount: profileData.service_categories?.length || 0
      }));
    }
  }, [profileData, userType]);

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
    
    // Additional bonuses for portfolio and service categories
    if (profileData.portfolio_items && profileData.portfolio_items.length > 0) {
      completed += 2; // Bonus for having portfolio
    }
    
    if (profileData.service_categories && profileData.service_categories.length > 0) {
      completed += 1; // Bonus for having service categories
    }
    
    // Ensure we don't exceed 100%
    const maxFields = allFields.length + 3; // +3 for bonuses
    return Math.min(Math.round((completed / maxFields) * 100), 100);
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
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      setError(isArabic ? 'نوع الملف غير مدعوم. استخدم JPG, PNG, GIF أو WebP فقط' : 'Unsupported file type. Use JPG, PNG, GIF or WebP only');
      return;
    }
    
    if (file.size > maxSize) {
      setError(isArabic ? 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' : 'File too large. Maximum size is 5MB');
      return;
    }
    
      setAvatarFile(file);
    
    // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    
    // Clear any existing error
    setError('');
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
      
      let updateResults = [];
      
      // Update user profile
      try {
      const userData = {
        name: profileData.name,
        phone_number: profileData.phone_number,
        };
        
        await userService.updateProfile(userData);
        updateResults.push('user profile');
        console.log('✅ User profile updated successfully');
      } catch (userError) {
        console.log('❌ User profile update failed:', userError);
      }
      
      // Update/Create A-List Pro profile
      try {
        let proProfileData = {
        business_name: profileData.business_name,
        business_description: profileData.business_description,
          profession: profileData.profession || '',
          bio: profileData.bio || '',
        years_of_experience: profileData.years_of_experience,
        license_number: profileData.license_number,
          license_type: profileData.license_type || '',
          license_expiry: profileData.license_expiry || null,
        insurance_info: profileData.insurance_info,
          certifications: profileData.certifications || '',
        service_radius: profileData.service_radius,
          hourly_rate: profileData.hourly_rate || null,
          response_time_hours: profileData.response_time_hours || 24,
          is_available: profileData.is_available !== false,
          website: profileData.website || '',
      };
      
        // Add service category IDs if available
        if (profileData.service_category_ids && profileData.service_category_ids.length > 0) {
          proProfileData.service_category_ids = profileData.service_category_ids;
        }
        
        // Handle avatar upload
      if (avatarFile) {
        const formData = new FormData();
        formData.append('profile_image', avatarFile);
          
          // Add other fields to FormData, excluding profile_image since we already added the file
        Object.keys(proProfileData).forEach(key => {
            if (key === 'profile_image') {
              // Skip profile_image since we already added the file
              return;
            }
          if (key === 'service_category_ids' && Array.isArray(proProfileData[key])) {
            proProfileData[key].forEach(id => formData.append('service_category_ids', id));
            } else if (proProfileData[key] !== null && proProfileData[key] !== undefined) {
            formData.append(key, proProfileData[key]);
          }
        });
          
        proProfileData = formData;
        } else {
          // Remove profile_image from data if no new file is uploaded
          delete proProfileData.profile_image;
        }
        
        // Try to update existing profile
        try {
          await alistProsService.updateMyProfile(proProfileData);
        updateResults.push('professional profile');
        console.log('✅ A-List Pro profile updated successfully');
        } catch (updateError) {
          // If update fails, try to create new profile
          console.log('❌ Update failed, trying to create new profile...');
          await alistProsService.createProfile(proProfileData);
          updateResults.push('new professional profile created');
          console.log('✅ New A-List Pro profile created successfully');
        }
        
      } catch (proError) {
        console.log('❌ Professional profile operation failed:', proError);
        throw proError;
      }
      
      if (updateResults.length > 0) {
        setSuccess(isArabic ? 
          `تم حفظ ${updateResults.join(' و ')} بنجاح` : 
          `Successfully updated ${updateResults.join(' and ')}`
        );
        
        // Reload profile data after successful save
        setTimeout(() => {
          loadProfileData();
        }, 1000);
        
        // Auto-hide success message
        setTimeout(() => setSuccess(''), 5000);
      } else {
        throw new Error('No updates were successful');
      }
      
    } catch (err) {
      console.error('❌ Error saving profile:', err);
      
      let errorMessage = isArabic ? 'خطأ في حفظ الملف الشخصي' : 'Error saving profile';
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
          errorMessage = isArabic ? 'يجب تسجيل الدخول مرة أخرى' : 'Please log in again';
            break;
          case 403:
          errorMessage = isArabic ? 'ليس لديك صلاحية لتحديث هذا الملف' : 'You do not have permission to update this profile';
            break;
          case 400:
          const validationErrors = err.response.data;
          errorMessage = isArabic ? 'بيانات غير صحيحة' : 'Invalid data provided';
          
          if (validationErrors && typeof validationErrors === 'object') {
            const errorFields = Object.keys(validationErrors).slice(0, 3);
            if (errorFields.length > 0) {
                const errorDetails = errorFields.map(field => {
                  const fieldError = validationErrors[field];
                  if (Array.isArray(fieldError)) {
                    return `${field}: ${fieldError[0]}`;
                  }
                  return `${field}: ${fieldError}`;
                });
                errorMessage += ': ' + errorDetails.join(', ');
            }
          }
            break;
          case 413:
            errorMessage = isArabic ? 'حجم الملف كبير جداً' : 'File too large';
            break;
          case 415:
            errorMessage = isArabic ? 'نوع الملف غير مدعوم' : 'Unsupported file type';
            break;
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

  // Enhanced portfolio management
  const handlePortfolioUpload = async (files, portfolioData = {}) => {
    if (!files || files.length === 0) return;
    
    // Check if user has a profile first
    if (!profileData.id && !profileData.business_name) {
      setError(isArabic ? 'يجب إنشاء الملف الشخصي أولاً قبل رفع الأعمال' : 'Please create your profile first before uploading portfolio items');
      return;
    }
    
    const newFiles = Array.from(files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    for (const file of newFiles) {
      // Validate file
      if (!allowedTypes.includes(file.type)) {
        setError(isArabic ? 'نوع الملف غير مدعوم. استخدم JPG, PNG, GIF أو WebP فقط' : 'Unsupported file type. Use JPG, PNG, GIF or WebP only');
        continue;
      }
      
      if (file.size > maxSize) {
        setError(isArabic ? 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' : 'File too large. Maximum size is 5MB');
        continue;
      }
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', portfolioData.title || file.name.split('.')[0]);
        formData.append('description', portfolioData.description || (isArabic ? 'عمل من معرض أعمالي' : 'Work from my portfolio'));
        
        // Add completion_date if provided
        if (portfolioData.completion_date) {
          formData.append('completion_date', portfolioData.completion_date);
        }
        
        // Show loading state
        setIsSaving(true);
        
        console.log('📤 Uploading portfolio item:', file.name);
        const response = await alistProsService.createPortfolio(formData);
        console.log('✅ Portfolio item uploaded successfully:', response.data);
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          portfolio_items: [...(prev.portfolio_items || []), response.data]
        }));
        
        setSuccess(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
        
        // Update stats
        setProfileStats(prev => ({
          ...prev,
          portfolioItems: (prev.portfolioItems || 0) + 1
        }));
        
      } catch (err) {
        console.error('❌ Error uploading portfolio item:', err);
        let errorMessage = isArabic ? 'فشل في رفع الصورة' : 'Failed to upload image';
        
        if (err.response?.status === 400) {
          const errorData = err.response.data;
          if (typeof errorData === 'object' && errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'object') {
            // Handle field errors
            const fieldErrors = Object.keys(errorData).map(key => 
              `${key}: ${Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key]}`
            );
            errorMessage = fieldErrors.join(', ');
          }
        } else if (err.response?.status === 403) {
          errorMessage = isArabic ? 'يجب إنشاء الملف الشخصي أولاً' : 'Please create your profile first';
        }
        
        setError(errorMessage);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Delete portfolio item
  const handleDeletePortfolioItem = async (itemId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا العنصر؟' : 'Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('🗑️ Deleting portfolio item:', itemId);
      await alistProsService.deletePortfolio(itemId);
      console.log('✅ Portfolio item deleted successfully');
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        portfolio_items: (prev.portfolio_items || []).filter(item => item.id !== itemId)
      }));
      
      // Update stats
      setProfileStats(prev => ({
        ...prev,
        portfolioItems: Math.max((prev.portfolioItems || 0) - 1, 0)
      }));
      
      setSuccess(isArabic ? 'تم حذف العنصر بنجاح' : 'Item deleted successfully');
      
    } catch (err) {
      console.error('❌ Error deleting portfolio item:', err);
      setError(isArabic ? 'فشل في حذف العنصر' : 'Failed to delete item');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit portfolio item
  const handleEditPortfolioItem = async (itemId, newTitle, newDescription, newCompletionDate) => {
    try {
      setIsSaving(true);
      console.log('✏️ Editing portfolio item:', itemId);
      
      const updateData = {
        title: newTitle,
        description: newDescription
      };
      
      // Add completion_date if provided
      if (newCompletionDate) {
        updateData.completion_date = newCompletionDate;
      }
      
      const response = await alistProsService.updatePortfolio(itemId, updateData);
      
      console.log('✅ Portfolio item updated successfully:', response.data);
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        portfolio_items: (prev.portfolio_items || []).map(item => 
          item.id === itemId ? { ...item, ...response.data } : item
        )
      }));
      
      setSuccess(isArabic ? 'تم تحديث العنصر بنجاح' : 'Item updated successfully');
      
      // Close modal
      setEditingPortfolioItem(null);
      setPortfolioEditTitle('');
      setPortfolioEditDescription('');
      setPortfolioEditCompletionDate('');
      
    } catch (err) {
      console.error('❌ Error updating portfolio item:', err);
      setError(isArabic ? 'فشل في تحديث العنصر' : 'Failed to update item');
    } finally {
      setIsSaving(false);
    }
  };

  // Open edit modal
  const openEditPortfolioModal = (item) => {
    setEditingPortfolioItem(item);
    setPortfolioEditTitle(item.title || '');
    setPortfolioEditDescription(item.description || '');
    setPortfolioEditCompletionDate(item.completion_date || '');
  };

  // Cancel edit modal
  const cancelEditPortfolio = () => {
    setEditingPortfolioItem(null);
    setPortfolioEditTitle('');
    setPortfolioEditDescription('');
    setPortfolioEditCompletionDate('');
  };

  // Save portfolio edit
  const savePortfolioEdit = () => {
    if (editingPortfolioItem) {
      handleEditPortfolioItem(editingPortfolioItem.id, portfolioEditTitle, portfolioEditDescription, portfolioEditCompletionDate);
    }
  };

  // Portfolio creation modal functions
  const openPortfolioCreateModal = () => {
    setShowPortfolioCreateModal(true);
    setPortfolioCreateTitle('');
    setPortfolioCreateDescription('');
    setPortfolioCreateCompletionDate('');
    setPortfolioCreateFiles([]);
  };

  const cancelPortfolioCreate = () => {
    setShowPortfolioCreateModal(false);
    setPortfolioCreateTitle('');
    setPortfolioCreateDescription('');
    setPortfolioCreateCompletionDate('');
    setPortfolioCreateFiles([]);
  };

  const handlePortfolioCreateFiles = (files) => {
    setPortfolioCreateFiles(Array.from(files));
  };

  const savePortfolioCreate = async () => {
    if (!portfolioCreateTitle.trim() || portfolioCreateFiles.length === 0) {
      setError(isArabic ? 'يجب إدخال العنوان واختيار الصور' : 'Title and images are required');
      return;
    }

    const portfolioData = {
      title: portfolioCreateTitle,
      description: portfolioCreateDescription,
      completion_date: portfolioCreateCompletionDate || null
    };

    await handlePortfolioUpload(portfolioCreateFiles, portfolioData);
    
    // Close modal if successful
    if (!error) {
      setShowPortfolioCreateModal(false);
      setPortfolioCreateTitle('');
      setPortfolioCreateDescription('');
      setPortfolioCreateCompletionDate('');
      setPortfolioCreateFiles([]);
    }
  };

  // Address management functions
  const handleAddressCreate = async (addressData) => {
    try {
      setIsSaving(true);
      console.log('🏠 Creating new address:', addressData);
      
      const response = await addressService.createAddressWithGeocoding(addressData);
      console.log('✅ Address created successfully:', response.data);
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        addresses: [...(prev.addresses || []), response.data],
        primary_address: response.data.is_primary ? response.data : prev.primary_address
      }));
      
      setSuccess(isArabic ? 'تم إضافة العنوان بنجاح' : 'Address added successfully');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error creating address:', err);
      let errorMessage = isArabic ? 'فشل في إضافة العنوان' : 'Failed to add address';
      
      if (err.response?.status === 400 && err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const errorFields = Object.keys(errors);
          if (errorFields.length > 0) {
            const fieldError = errors[errorFields[0]];
            if (Array.isArray(fieldError)) {
              errorMessage = fieldError[0];
            } else {
              errorMessage = fieldError;
            }
          }
        }
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressUpdate = async (addressId, addressData) => {
    try {
      setIsSaving(true);
      console.log('🏠 Updating address:', addressId, addressData);
      
      const response = await addressService.updateAddress(addressId, addressData);
      console.log('✅ Address updated successfully:', response.data);
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        addresses: prev.addresses.map(addr => 
          addr.id === addressId ? response.data : addr
        ),
        primary_address: response.data.is_primary ? response.data : prev.primary_address
      }));
      
      setSuccess(isArabic ? 'تم تحديث العنوان بنجاح' : 'Address updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error updating address:', err);
      setError(isArabic ? 'فشل في تحديث العنوان' : 'Failed to update address');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressDelete = async (addressId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('🗑️ Deleting address:', addressId);
      
      await addressService.deleteAddress(addressId);
      console.log('✅ Address deleted successfully');
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        addresses: prev.addresses.filter(addr => addr.id !== addressId),
        primary_address: prev.primary_address?.id === addressId ? null : prev.primary_address
      }));
      
      setSuccess(isArabic ? 'تم حذف العنوان بنجاح' : 'Address deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error deleting address:', err);
      setError(isArabic ? 'فشل في حذف العنوان' : 'Failed to delete address');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPrimaryAddress = async (addressId) => {
    try {
      setIsSaving(true);
      console.log('🏠 Setting primary address:', addressId);
      
      await addressService.setPrimaryAddress(addressId);
      console.log('✅ Primary address set successfully');
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        addresses: prev.addresses.map(addr => ({
          ...addr,
          is_primary: addr.id === addressId
        })),
        primary_address: prev.addresses.find(addr => addr.id === addressId)
      }));
      
      setSuccess(isArabic ? 'تم تحديد العنوان الأساسي بنجاح' : 'Primary address set successfully');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error setting primary address:', err);
      setError(isArabic ? 'فشل في تحديد العنوان الأساسي' : 'Failed to set primary address');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSaving(false);
    }
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
      description: isArabic ? 'تفاصيل العمل والخدمات والنوع' : 'Business details, services and provider type'
    },
    {
      id: 'media',
      name: isArabic ? 'الوسائط' : 'Media',
      icon: FaImage,
      description: isArabic ? 'الصور ومعرض الأعمال' : 'Photos and portfolio'
    },
    {
      id: 'address',
      name: isArabic ? 'العنوان' : 'Address',
      icon: FaMapMarkerAlt,
      description: isArabic ? 'العنوان والموقع الجغرافي' : 'Address and location details'
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

  // Safety check for profileStats
  const safeProfileStats = profileStats || {
    profileCompletion: 0,
    totalViews: 0,
    totalBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    joinDate: '',
    lastActive: '',
    responseRate: 0,
    completionRate: 0,
    portfolioItems: 0,
    serviceCategoriesCount: 0
  };

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
                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white ${
                      safeProfileStats.profileCompletion >= 80 ? 'bg-green-500' :
                      safeProfileStats.profileCompletion >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {safeProfileStats.profileCompletion}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-600">
                      {(safeProfileStats.profileCompletion || 0) >= 80 ? (isArabic ? 'ممتاز' : 'Excellent') :
                       (safeProfileStats.profileCompletion || 0) >= 60 ? (isArabic ? 'جيد' : 'Good') : 
                       (isArabic ? 'يحتاج تحسين' : 'Needs Improvement')}
                    </span>
                </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${safeProfileStats.profileCompletion || 0}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                      (safeProfileStats.profileCompletion || 0) >= 80 ? 'bg-green-500' :
                      (safeProfileStats.profileCompletion || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  ></div>
                </div>
              </div>
              
              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{safeProfileStats.totalViews || 0}</div>
                  <div className="text-xs text-gray-600">{isArabic ? 'مشاهدات الملف' : 'Profile Views'}</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{safeProfileStats.totalBookings || 0}</div>
                  <div className="text-xs text-gray-600">{isArabic ? 'إجمالي المشاريع' : 'Total Projects'}</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                    <FaStar className="mr-1" />
                    {safeProfileStats.averageRating || 0}
                  </div>
                  <div className="text-xs text-gray-600">{isArabic ? 'متوسط التقييم' : 'Average Rating'}</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{safeProfileStats.responseRate || 0}%</div>
                  <div className="text-xs text-gray-600">{isArabic ? 'معدل الاستجابة' : 'Response Rate'}</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isArabic ? 'المراجعات:' : 'Reviews:'}</span>
                    <span className="font-medium">{safeProfileStats.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isArabic ? 'معرض الأعمال:' : 'Portfolio:'}</span>
                    <span className="font-medium">{safeProfileStats.portfolioItems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isArabic ? 'معدل الإنجاز:' : 'Completion:'}</span>
                    <span className="font-medium">{safeProfileStats.completionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isArabic ? 'الخدمات:' : 'Services:'}</span>
                    <span className="font-medium">{safeProfileStats.serviceCategoriesCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="mt-4 text-center text-xs text-gray-500">
                {isArabic ? 'عضو منذ' : 'Member since'} {' '}
                {safeProfileStats.joinDate ? new Date(safeProfileStats.joinDate).toLocaleDateString(
                  isArabic ? 'ar-SA' : 'en-US', 
                  { year: 'numeric', month: 'long' }
                ) : 'N/A'}
              </div>

              {/* Profile Tips */}
              {(safeProfileStats.profileCompletion || 0) < 80 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <FaInfoCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium mb-1">
                        {isArabic ? 'نصائح لتحسين ملفك:' : 'Tips to improve your profile:'}
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {(safeProfileStats.portfolioItems || 0) === 0 && (
                          <li>{isArabic ? 'أضف صور أعمالك السابقة' : 'Add photos of your work'}</li>
                        )}
                        {!profileData.business_description && (
                          <li>{isArabic ? 'اكتب وصف شامل لعملك' : 'Write a comprehensive business description'}</li>
                        )}
                        {(safeProfileStats.serviceCategoriesCount || 0) === 0 && (
                          <li>{isArabic ? 'حدد فئات الخدمات التي تقدمها' : 'Specify your service categories'}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
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
                    {/* Provider Type Selection */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {isArabic ? 'نوع مقدم الخدمة' : 'Service Provider Type'}
                      </h3>
                      <p className="text-gray-600 mb-4">
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
                              className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                                isActive
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                              onClick={() => handleUserTypeChange(type.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                  <Icon className={`text-xl ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{type.name}</h4>
                                  <p className="text-sm text-gray-600">{type.description}</p>
                                  {isActive && (
                                    <div className="mt-2 flex items-center text-sm text-green-600">
                                      <FaCheck className="mr-1" />
                                      {isArabic ? 'محدد حالياً' : 'Currently selected'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Basic Business Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {isArabic ? 'معلومات العمل الأساسية' : 'Basic Business Information'}
                      </h3>
                      
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
                            {isArabic ? 'المهنة/التخصص' : 'Profession/Specialization'}
                        </label>
                        <input
                            type="text"
                            value={profileData.profession || ''}
                            onChange={(e) => handleInputChange('profession', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={isArabic ? 'مثل: مقاول كهرباء، سباك، نجار' : 'e.g: Electrical Contractor, Plumber, Carpenter'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'سنوات الخبرة' : 'Years of Experience'}
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={profileData.years_of_experience}
                            onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
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
                    
                      <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'وصف العمل' : 'Business Description'}
                      </label>
                      <textarea
                        value={profileData.business_description}
                        onChange={(e) => handleInputChange('business_description', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                          placeholder={isArabic ? 'صف عملك وخدماتك بالتفصيل...' : 'Describe your business and services in detail...'}
                      />
                    </div>
                    
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'السيرة المهنية' : 'Professional Bio'}
                        </label>
                        <textarea
                          value={profileData.bio || ''}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                          placeholder={isArabic ? 'اكتب نبذة مختصرة عن خبرتك المهنية...' : 'Write a brief professional biography...'}
                        />
                      </div>
                    </div>

                    {/* Licensing and Certifications */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {isArabic ? 'التراخيص والشهادات' : 'Licensing & Certifications'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {isArabic ? 'نوع الترخيص' : 'License Type'}
                          </label>
                          <input
                            type="text"
                            value={profileData.license_type || ''}
                            onChange={(e) => handleInputChange('license_type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={isArabic ? 'مثل: ترخيص مقاولات عامة' : 'e.g: General Contractor License'}
                          />
                  </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'تاريخ انتهاء الترخيص' : 'License Expiry Date'}
                          </label>
                          <input
                            type="date"
                            value={profileData.license_expiry || ''}
                            onChange={(e) => handleInputChange('license_expiry', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            placeholder={isArabic ? 'شركة التأمين ورقم البوليصة' : 'Insurance company and policy number'}
                          />
                              </div>
                    </div>
                    
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'الشهادات المهنية' : 'Professional Certifications'}
                        </label>
                        <textarea
                          value={profileData.certifications || ''}
                          onChange={(e) => handleInputChange('certifications', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                          placeholder={isArabic ? 'اذكر الشهادات المهنية والدورات التدريبية...' : 'List professional certifications and training courses...'}
                      />
                    </div>
                  </div>
                    
                    {/* Service Categories and Pricing */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {isArabic ? 'الخدمات والأسعار' : 'Services & Pricing'}
                      </h3>
                      
                      {/* Current Service Categories */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {isArabic ? 'فئات الخدمات الحالية' : 'Current Service Categories'}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {(profileData.service_categories || []).length} {isArabic ? 'فئة' : 'categories'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(profileData.service_categories || []).map((category, index) => (
                          <div
                            key={category.id || index}
                              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                              <div className="flex items-center">
                                <FaTools className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="font-medium text-blue-900">{category.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeServiceCategory(category.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title={isArabic ? 'إزالة' : 'Remove'}
                            >
                                <FaTimes className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                        {(profileData.service_categories || []).length === 0 && (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <FaInfoCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-gray-600">
                              {isArabic ? 'لم يتم إضافة فئات خدمات بعد' : 'No service categories added yet'}
                            </p>
                            <button
                              type="button"
                              className="mt-2 inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                              onClick={() => {/* Handle add service category */}}
                            >
                              <FaPlus className="mr-1 h-3 w-3" />
                              {isArabic ? 'إضافة فئة' : 'Add Category'}
                            </button>
                        </div>
                      )}
                    </div>
                    
                      {/* Pricing Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'السعر بالساعة (دولار)' : 'Hourly Rate (USD)'}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaDollarSign className="h-4 w-4 text-gray-400" />
                              </div>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={profileData.hourly_rate || ''}
                              onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || null)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                          </div>
                
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'متوسط وقت الاستجابة (ساعات)' : 'Average Response Time (hours)'}
                        </label>
                          <input
                            type="number"
                            min="1"
                            max="168"
                            value={profileData.response_time_hours || 24}
                            onChange={(e) => handleInputChange('response_time_hours', parseInt(e.target.value) || 24)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="24"
                          />
                        </div>
                      </div>
                      </div>
                      
                    
                   

                    {/* Website and Additional Info */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {isArabic ? 'معلومات إضافية' : 'Additional Information'}
                      </h3>
                      
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'رابط الموقع الإلكتروني' : 'Website URL'}
                          </label>
                        <input
                          type="url"
                          value={profileData.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={isArabic ? 'https://example.com' : 'https://example.com'}
                        />
                        </div>
                    </div>
                  </div>
                )}
                
                {activeSection === 'media' && (
                  <div className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {isArabic ? 'الصورة الشخصية' : 'Profile Picture'}
                      </h3>
                      
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <img
                            src={avatarPreview || profileData.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=0D8ABC&color=fff&size=128`}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                            <FaCamera className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                              className="hidden"
                        />
                          </label>
                      </div>
                      
                        <div className="flex-1">
                          <p className="text-gray-600 mb-2">
                            {isArabic 
                              ? 'اختر صورة شخصية احترافية تمثلك. الصورة الجيدة تزيد من ثقة العملاء.'
                              : 'Choose a professional profile picture that represents you. A good photo increases client trust.'
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {isArabic 
                              ? 'مقاس مُستحسن: 400×400 بكسل، حجم أقصى: 5 ميجابايت'
                              : 'Recommended: 400×400 pixels, Max size: 5MB'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isArabic ? 'معرض الأعمال' : 'Portfolio Gallery'}
                        </h3>
                        <button 
                          onClick={openPortfolioCreateModal}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <FaCloudUploadAlt className="mr-2" />
                          {isArabic ? 'إضافة عمل جديد' : 'Add New Work'}
                        </button>
                      </div>
                      
                      <p className="text-gray-600 mb-6">
                        {isArabic 
                          ? 'أضف صور أعمالك السابقة لتعرض خبرتك ومهاراتك للعملاء المحتملين.'
                          : 'Add photos of your previous work to showcase your expertise and skills to potential clients.'
                        }
                      </p>

                      {/* Portfolio Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.isArray(profileData.portfolio_items) ? profileData.portfolio_items.map((item, index) => (
                          <div key={item.id || index} className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.title}
                                className="w-full h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                <FaImage className="text-gray-400 text-3xl" />
                        </div>
                            )}
                            
                            <div className="p-4">
                              <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                              {item.completion_date && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                  <FaCalendar className="mr-1" />
                                  {new Date(item.completion_date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                                </p>
                      )}
                    </div>
                            
                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleDeletePortfolioItem(item.id)}
                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                title={isArabic ? 'حذف' : 'Delete'}
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openEditPortfolioModal(item)}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                title={isArabic ? 'تعديل' : 'Edit'}
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                  </div>
                          </div>
                        )) : null}
                        
                        {/* Add new item placeholder */}
                        <button
                          onClick={openPortfolioCreateModal} 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <FaPlus className="text-gray-400 text-2xl mb-2" />
                          <span className="text-gray-600 text-center">
                            {isArabic ? 'إضافة عمل جديد' : 'Add New Work'}
                          </span>
                        </button>
                      </div>
                      
                      {!Array.isArray(profileData.portfolio_items) || profileData.portfolio_items.length === 0 ? (
                        <div className="text-center py-12">
                          <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {isArabic ? 'لا توجد أعمال في المعرض' : 'No portfolio items yet'}
                          </h4>
                          <p className="text-gray-600">
                            {isArabic 
                              ? 'ابدأ بإضافة صور أعمالك لجذب المزيد من العملاء'
                              : 'Start adding photos of your work to attract more clients'
                            }
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* Certificate Upload Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {isArabic ? 'الشهادات والتراخيص' : 'Certificates & Licenses'}
                      </h3>
                      
                      <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'صورة الترخيص' : 'License Certificate'}
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleInputChange('license_certificate', e.target.files[0])}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'صورة التأمين' : 'Insurance Certificate'}
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleInputChange('insurance_certificate', e.target.files[0])}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isArabic ? 'شهادات أخرى' : 'Other Certificates'}
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            onChange={(e) => setCertificateFiles(Array.from(e.target.files))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {isArabic 
                              ? 'يمكنك إضافة عدة شهادات (مثل شهادات الكفاءة، التدريب، إلخ)'
                              : 'You can add multiple certificates (competency, training, etc.)'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                
                
                {activeSection === 'address' && (
                  <div className="space-y-6">
                    {/* Address Management Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-blue-600 mr-3 text-xl" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {isArabic ? 'إدارة العناوين' : 'Address Management'}
                          </h3>
                        </div>
                        <span className="text-sm text-gray-500">
                          {profileData.addresses?.length || 0} {isArabic ? 'عنوان' : 'addresses'}
                        </span>
                      </div>

                      {/* Existing Addresses List */}
                      {profileData.addresses && profileData.addresses.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-md font-medium text-gray-800 mb-4">
                            {isArabic ? 'العناوين المحفوظة' : 'Saved Addresses'}
                          </h4>
                          <div className="space-y-3">
                            {profileData.addresses.map((address) => (
                              <div
                                key={address.id}
                                className={`p-4 border rounded-lg transition-colors ${
                                  address.is_primary 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <FaMapMarkerAlt className={`mr-2 ${address.is_primary ? 'text-blue-600' : 'text-gray-500'}`} />
                                      <span className="font-medium text-gray-900">
                                        {address.street_address}
                                      </span>
                                      {address.is_primary && (
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                          {isArabic ? 'أساسي' : 'Primary'}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {[address.city, address.state, address.zip_code, address.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                    </p>
                                    {address.latitude && address.longitude && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {isArabic ? 'الإحداثيات:' : 'Coordinates:'} {' '}
                                        {parseFloat(address.latitude).toFixed(4)}, {parseFloat(address.longitude).toFixed(4)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    {!address.is_primary && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetPrimaryAddress(address.id)}
                                        disabled={isSaving}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                                        title={isArabic ? 'جعل أساسي' : 'Set as primary'}
                                      >
                                        {isArabic ? 'جعل أساسي' : 'Set Primary'}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // TODO: Implement edit functionality
                                        console.log('Edit address:', address.id);
                                      }}
                                      className="text-gray-600 hover:text-gray-800 p-1"
                                      title={isArabic ? 'تعديل' : 'Edit'}
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddressDelete(address.id)}
                                      disabled={isSaving}
                                      className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                                      title={isArabic ? 'حذف' : 'Delete'}
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add New Address Section */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-md font-medium text-gray-800 mb-4">
                          {isArabic ? 'إضافة عنوان جديد' : 'Add New Address'}
                        </h4>
                        <AddressPicker
                          onAddressChange={(addressData) => {
                            // Just store the address data, don't create immediately
                            console.log('📝 Address data updated:', addressData);
                            // You can store in a separate state if needed for preview
                          }}
                          label={isArabic ? 'عنوان العمل الجديد' : 'New Business Address'}
                          required={false}
                          showMap={true}
                          createAddressCallback={async (addressData) => {
                            // This will be called when user clicks "Save Address" in AddressPicker
                            await handleAddressCreate({
                              ...addressData,
                              is_primary: !profileData.addresses || profileData.addresses.length === 0
                            });
                          }}
                        />
                      </div>
                      
                      {/* Address Instructions */}
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <FaMapMarkerAlt className="text-blue-600 mr-3 mt-1" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">
                              {isArabic ? 'نصائح لإدارة العناوين:' : 'Address Management Tips:'}
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                              <li>
                                {isArabic 
                                  ? 'يمكنك إضافة عدة عناوين لأعمالك المختلفة'
                                  : 'You can add multiple addresses for different business locations'
                                }
                              </li>
                              <li>
                                {isArabic 
                                  ? 'العنوان الأساسي سيظهر في ملفك المهني'
                                  : 'Primary address will be displayed on your professional profile'
                                }
                              </li>
                              <li>
                                {isArabic 
                                  ? 'استخدم الخريطة لتحديد موقعك بدقة'
                                  : 'Use the map to pinpoint your exact location'
                                }
                              </li>
                            </ul>
                          </div>
                        </div>
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

      {/* Portfolio Edit Modal */}
      <AnimatePresence>
        {editingPortfolioItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={cancelEditPortfolio}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isArabic ? 'تعديل عنصر المعرض' : 'Edit Portfolio Item'}
              </h3>
              
              {editingPortfolioItem.image && (
                <div className="mb-4">
                  <img 
                    src={editingPortfolioItem.image} 
                    alt={editingPortfolioItem.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'العنوان' : 'Title'}
                        </label>
                        <input
                          type="text"
                    value={portfolioEditTitle}
                    onChange={(e) => setPortfolioEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isArabic ? 'أدخل عنوان العمل' : 'Enter work title'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الوصف' : 'Description'}
                        </label>
                  <textarea
                    value={portfolioEditDescription}
                    onChange={(e) => setPortfolioEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    placeholder={isArabic ? 'اكتب وصف للعمل' : 'Write work description'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'تاريخ إنجاز العمل' : 'Completion Date'}
                        </label>
                        <input
                    type="date"
                    value={portfolioEditCompletionDate}
                    onChange={(e) => setPortfolioEditCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isArabic ? 'اختياري - متى تم إنجاز هذا العمل؟' : 'Optional - When was this work completed?'}
                  </p>
                      </div>
                    </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelEditPortfolio}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={savePortfolioEdit}
                  disabled={isSaving || !portfolioEditTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {isArabic ? 'حفظ' : 'Save'}
                    </>
                  )}
                </button>
                  </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio Create Modal */}
      <AnimatePresence>
        {showPortfolioCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={cancelPortfolioCreate}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isArabic ? 'إضافة عمل جديد للمعرض' : 'Add New Portfolio Item'}
              </h3>
              
              <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'العنوان *' : 'Title *'}
                        </label>
                  <input
                    type="text"
                    value={portfolioCreateTitle}
                    onChange={(e) => setPortfolioCreateTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isArabic ? 'أدخل عنوان العمل' : 'Enter work title'}
                    required
                  />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الوصف' : 'Description'}
                        </label>
                  <textarea
                    value={portfolioCreateDescription}
                    onChange={(e) => setPortfolioCreateDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    placeholder={isArabic ? 'اكتب وصف للعمل' : 'Write work description'}
                  />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'تاريخ إنجاز العمل' : 'Completion Date'}
                        </label>
                  <input
                    type="date"
                    value={portfolioCreateCompletionDate}
                    onChange={(e) => setPortfolioCreateCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isArabic ? 'اختياري - متى تم إنجاز هذا العمل؟' : 'Optional - When was this work completed?'}
                  </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الصور *' : 'Images *'}
                        </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePortfolioCreateFiles(e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isArabic ? 'اختر صور العمل (يمكن اختيار عدة صور)' : 'Select work images (multiple images allowed)'}
                  </p>
                  {portfolioCreateFiles.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {isArabic ? `تم اختيار ${portfolioCreateFiles.length} صورة` : `${portfolioCreateFiles.length} images selected`}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                  <button
                  onClick={cancelPortfolioCreate}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={isSaving}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={savePortfolioCreate}
                  disabled={isSaving || !portfolioCreateTitle.trim() || portfolioCreateFiles.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                      {isArabic ? 'جاري الإضافة...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                      <FaPlus className="mr-2" />
                      {isArabic ? 'إضافة' : 'Add'}
                      </>
                    )}
                  </button>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProProfileEditPage; 