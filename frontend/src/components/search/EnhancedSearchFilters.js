import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaStar, FaMapMarkerAlt, FaUser, FaCog, FaUserTie, FaUsers, FaToolbox } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';
import { serviceService } from '../../services/api';

const EnhancedSearchFilters = ({ 
  onFilterChange, 
  initialFilters = {},
  showRoleFilter = true,
  showAdvancedFilters = true
}) => {
  const { language, isRTL } = useLanguage();
  
  const [filters, setFilters] = useState({
    // Basic filters
    location: initialFilters.location || '',
    searchTerm: initialFilters.searchTerm || '',
    categories: initialFilters.categories || [],
    
    // Role filter
    role: initialFilters.role || '', // specialist, contractor, crew
    
    // Experience & Quality filters
    minExperience: initialFilters.minExperience || 0,
    maxExperience: initialFilters.maxExperience || 20,
    minRating: initialFilters.minRating || 0,
    isVerified: initialFilters.isVerified || false,
    hasLicense: initialFilters.hasLicense || false,
    isFeatured: initialFilters.isFeatured || false,
    
    // Price filters
    minRate: initialFilters.minRate || 0,
    maxRate: initialFilters.maxRate || 500,
    
    // Location filters
    city: initialFilters.city || '',
    state: initialFilters.state || '',
    zipCode: initialFilters.zipCode || '',
    radius: initialFilters.radius || 25,
    
    // Availability filters
    isAvailable: initialFilters.isAvailable || false,
    
    // Pagination & Sorting
    page: initialFilters.page || 1,
    pageSize: initialFilters.pageSize || 12,
    ordering: initialFilters.ordering || '-average_rating,-total_jobs'
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await serviceService.getCategories();
      if (response?.data?.results) {
        setCategories(response.data.results);
      } else if (response?.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { id: 'plumbing', name: language === 'ar' ? 'السباكة' : 'Plumbing' },
        { id: 'electrical', name: language === 'ar' ? 'الكهرباء' : 'Electrical' },
        { id: 'carpentry', name: language === 'ar' ? 'النجارة' : 'Carpentry' },
        { id: 'painting', name: language === 'ar' ? 'الدهان' : 'Painting' },
        { id: 'cleaning', name: language === 'ar' ? 'التنظيف' : 'Cleaning' },
        { id: 'landscaping', name: language === 'ar' ? 'تنسيق الحدائق' : 'Landscaping' },
        { id: 'hvac', name: language === 'ar' ? 'التكييف والتدفئة' : 'HVAC' },
        { id: 'flooring', name: language === 'ar' ? 'الأرضيات' : 'Flooring' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (name, value, isSelected) => {
    setFilters(prev => {
      const currentArray = prev[name] || [];
      if (isSelected) {
        return {
          ...prev,
          [name]: currentArray.includes(value) 
            ? currentArray 
            : [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [name]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  const handleApplyFilters = () => {
    onFilterChange && onFilterChange(filters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      location: '',
      searchTerm: '',
      categories: [],
      role: '',
      minExperience: 0,
      maxExperience: 20,
      minRating: 0,
      isVerified: false,
      hasLicense: false,
      isFeatured: false,
      minRate: 0,
      maxRate: 500,
      city: '',
      state: '',
      zipCode: '',
      radius: 25,
      isAvailable: false,
      page: 1,
      pageSize: 12,
      ordering: '-average_rating,-total_jobs'
    };
    
    setFilters(resetFilters);
    onFilterChange && onFilterChange(resetFilters);
  };

  const roleOptions = [
    {
      value: '',
      label: language === 'ar' ? 'جميع الأدوار' : 'All Roles',
      icon: FaUsers,
      description: language === 'ar' ? 'عرض جميع المحترفين' : 'Show all professionals'
    },
    {
      value: 'specialist',
      label: language === 'ar' ? 'متخصص A-List' : 'A-List Specialist',
      icon: FaUserTie,
      description: language === 'ar' ? 'مستشار ومدير مشاريع' : 'Consultant & Project Manager'
    },
    {
      value: 'contractor',
      label: language === 'ar' ? 'مقدم خدمة Home Pro' : 'Home Pro',
      icon: FaToolbox,
      description: language === 'ar' ? 'مقدم خدمات منزلية' : 'Home service provider'
    },
    {
      value: 'crew',
      label: language === 'ar' ? 'عضو طاقم' : 'Crew Member',
      icon: FaUser,
      description: language === 'ar' ? 'عامل ماهر' : 'Skilled worker'
    }
  ];

  const ratingOptions = [
    { value: 0, label: language === 'ar' ? 'أي تقييم' : 'Any Rating' },
    { value: 3, label: language === 'ar' ? '3 نجوم فأكثر' : '3+ Stars' },
    { value: 4, label: language === 'ar' ? '4 نجوم فأكثر' : '4+ Stars' },
    { value: 4.5, label: language === 'ar' ? '4.5 نجوم فأكثر' : '4.5+ Stars' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaFilter className="mr-2 text-blue-600" />
            {language === 'ar' ? 'فلاتر البحث' : 'Search Filters'}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(isExpanded || window.innerWidth >= 768) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Tab Navigation */}
              <div className="flex border-b mb-6">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {language === 'ar' ? 'البحث الأساسي' : 'Basic Search'}
                </button>
                {showAdvancedFilters && (
                  <button
                    onClick={() => setActiveTab('advanced')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'advanced'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {language === 'ar' ? 'البحث المتقدم' : 'Advanced'}
                  </button>
                )}
              </div>

              {/* Basic Search Tab */}
              {activeTab === 'basic' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Search Term */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'البحث عن' : 'Search for'}
                    </label>
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleInputChange('searchTerm', e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب ما تبحث عنه...' : 'Type what you\'re looking for...'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-500" />
                      {language === 'ar' ? 'الموقع' : 'Location'}
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder={language === 'ar' ? 'المدينة أو الرمز البريدي' : 'City or ZIP code'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Role Filter */}
                  {showRoleFilter && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {language === 'ar' ? 'نوع المحترف' : 'Professional Type'}
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {roleOptions.map((role) => {
                          const IconComponent = role.icon;
                          return (
                            <label
                              key={role.value}
                              className={`flex items-center p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                                filters.role === role.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <input
                                type="radio"
                                value={role.value}
                                checked={filters.role === role.value}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                className="sr-only"
                              />
                              <IconComponent 
                                className={`w-5 h-5 mr-3 ${
                                  filters.role === role.value ? 'text-blue-600' : 'text-gray-500'
                                }`} 
                              />
                              <div>
                                <div className={`font-medium ${
                                  filters.role === role.value ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                  {role.label}
                                </div>
                                <div className={`text-sm ${
                                  filters.role === role.value ? 'text-blue-700' : 'text-gray-600'
                                }`}>
                                  {role.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Service Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {language === 'ar' ? 'فئات الخدمة' : 'Service Categories'}
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category.id)}
                            onChange={(e) => 
                              handleMultiSelectChange('categories', category.id, e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {language === 'ar' ? 'التقييم' : 'Rating'}
                    </label>
                    <div className="space-y-2">
                      {ratingOptions.map((rating) => (
                        <label
                          key={rating.value}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            value={rating.value}
                            checked={filters.minRating === rating.value}
                            onChange={(e) => handleInputChange('minRating', parseFloat(e.target.value))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="flex items-center space-x-1">
                            {rating.value > 0 && (
                              <div className="flex">
                                {Array.from({ length: Math.floor(rating.value) }).map((_, i) => (
                                  <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                                ))}
                                {rating.value % 1 !== 0 && (
                                  <FaStar className="w-4 h-4 text-yellow-400 opacity-50" />
                                )}
                              </div>
                            )}
                            <span className="text-sm text-gray-700">{rating.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Advanced Search Tab */}
              {activeTab === 'advanced' && showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Experience Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {language === 'ar' ? 'الحد الأدنى' : 'Minimum'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={filters.minExperience}
                          onChange={(e) => handleInputChange('minExperience', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {language === 'ar' ? 'الحد الأقصى' : 'Maximum'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={filters.maxExperience}
                          onChange={(e) => handleInputChange('maxExperience', parseInt(e.target.value) || 50)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {language === 'ar' ? 'نطاق السعر (بالساعة)' : 'Price Range (per hour)'}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {language === 'ar' ? 'الحد الأدنى ($)' : 'Minimum ($)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={filters.minRate}
                          onChange={(e) => handleInputChange('minRate', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {language === 'ar' ? 'الحد الأقصى ($)' : 'Maximum ($)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={filters.maxRate}
                          onChange={(e) => handleInputChange('maxRate', parseInt(e.target.value) || 500)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search Radius */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {language === 'ar' ? 'نطاق البحث (ميل)' : 'Search Radius (miles)'}
                    </label>
                    <select
                      value={filters.radius}
                      onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 {language === 'ar' ? 'أميال' : 'miles'}</option>
                      <option value={10}>10 {language === 'ar' ? 'أميال' : 'miles'}</option>
                      <option value={25}>25 {language === 'ar' ? 'ميل' : 'miles'}</option>
                      <option value={50}>50 {language === 'ar' ? 'ميل' : 'miles'}</option>
                      <option value={100}>100 {language === 'ar' ? 'ميل' : 'miles'}</option>
                    </select>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {language === 'ar' ? 'خيارات متقدمة' : 'Advanced Options'}
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.isVerified}
                          onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {language === 'ar' ? 'محترفين موثقين فقط' : 'Verified professionals only'}
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.hasLicense}
                          onChange={(e) => handleInputChange('hasLicense', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {language === 'ar' ? 'لديهم رخصة مهنية' : 'Licensed professionals'}
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.isFeatured}
                          onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {language === 'ar' ? 'محترفين مميزين' : 'Featured professionals'}
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.isAvailable}
                          onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {language === 'ar' ? 'متاحين حالياً' : 'Currently available'}
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 font-medium"
                >
                  {language === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                </button>
                <button
                  onClick={handleResetFilters}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 font-medium"
                >
                  {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearchFilters; 