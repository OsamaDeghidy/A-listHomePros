import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaSearch, FaTags, FaDollarSign } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';

const ProsList = ({ pros = [] }) => {
  const { language, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'reviews', or 'name'

  const displayPros = pros;

  // Helper function to get full address text
  const getFullAddress = (pro) => {
    // First check if there's a full_address field from serializer
    if (pro.full_address) {
      return pro.full_address;
    }
    
    // Check if address object exists and has full_address
    if (pro.address?.full_address) {
      return pro.address.full_address;
    }
    
    // Build address from individual fields
    if (pro.address) {
      const addr = pro.address;
      const parts = [
        addr.street_address,
        addr.city,
        addr.state,
        addr.zip_code,
        addr.country
      ].filter(part => part && part.trim() !== ''); // Filter out empty parts
      
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    
    // Check for legacy location field
    if (pro.location) {
    if (typeof pro.location === 'string') {
      return pro.location;
      } else if (pro.location.address) {
      return pro.location.address;
      }
    }
    
    return language === 'ar' ? 'العنوان غير محدد' : 'Address not specified';
  };

  // Helper function to check if pro has real location
  const hasRealLocation = (pro) => {
    // Check if professional has direct coordinates
    if (pro.latitude && pro.longitude && 
        parseFloat(pro.latitude) !== 0 && parseFloat(pro.longitude) !== 0) {
      return true;
    }
    
    // Check if address has coordinates
    if (pro.address?.latitude && pro.address?.longitude &&
        parseFloat(pro.address.latitude) !== 0 && parseFloat(pro.address.longitude) !== 0) {
      return true;
    }
    
    // Check if there's any meaningful address information
    if (pro.address) {
      const addr = pro.address;
      if ((addr.street_address && addr.street_address.trim()) ||
          (addr.city && addr.city.trim()) ||
          (addr.state && addr.state.trim())) {
        return true;
      }
    }
    
    // Check for full_address field
    if (pro.full_address && pro.full_address.trim()) {
      return true;
    }
    
    // Check legacy location
    if (pro.location && pro.location !== 'غير محدد' && pro.location !== 'Location not specified') {
      return true;
    }
    
    return false;
  };

  // Helper function to get the profile image URL
  const getProfileImage = (pro) => {
    return pro.profile_image || 
           pro.avatar || 
           pro.image ||
           `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${pro.id % 10}.jpg`;
  };

  // Helper function to get professional name
  const getProName = (pro) => {
    return pro.business_name || pro.name || (language === 'ar' ? 'محترف' : 'Professional');
  };

  // Helper function to get professional description
  const getProDescription = (pro) => {
    return pro.business_description || 
           pro.description || 
           (language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available');
  };

  // Helper function to get professional profession
  const getProProfession = (pro) => {
    return pro.profession || 
           pro.service_categories?.[0]?.name || 
           pro.category || 
           (language === 'ar' ? 'محترف خدمات' : 'Professional');
  };

  // Helper function to get professional rating
  const getProRating = (pro) => {
    return pro.average_rating || pro.rating || 4.5;
  };

  // Helper function to get professional review count
  const getProReviewCount = (pro) => {
    return pro.review_count || pro.reviews || 0;
  };

  // Helper function to get professional role
  const getProRole = (pro) => {
    const role = pro.user?.role || pro.role;
    const roleNames = {
      'contractor': language === 'ar' ? 'مقاول' : 'Contractor',
      'specialist': language === 'ar' ? 'متخصص' : 'Specialist', 
      'crew': language === 'ar' ? 'طاقم عمل' : 'Crew Member',
      'professional': language === 'ar' ? 'محترف' : 'Professional'
    };
    return roleNames[role] || (language === 'ar' ? 'محترف' : 'Professional');
  };

  // Helper function to get role color
  const getRoleColor = (role) => {
    const colors = {
      'contractor': 'bg-blue-100 text-blue-800',
      'specialist': 'bg-green-100 text-green-800',
      'crew': 'bg-purple-100 text-purple-800',
      'professional': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to safely format rating
  const formatRating = (rating) => {
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    return numericRating.toFixed(1);
  };

  // Helper function to get hourly rate
  const getHourlyRate = (pro) => {
    return pro.hourly_rate || pro.rate || null;
  };

  // Helper function to format hourly rate
  const formatHourlyRate = (rate) => {
    if (!rate) return null;
    const numericRate = typeof rate === 'number' ? rate : parseFloat(rate);
    if (isNaN(numericRate) || numericRate <= 0) return null;
    
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericRate);
  };

  // Helper function to get service categories
  const getServiceCategories = (pro) => {
    if (pro.service_categories && Array.isArray(pro.service_categories)) {
      return pro.service_categories;
    }
    // Check if there's a single category
    if (pro.category) {
      return [{ name: pro.category }];
    }
    if (pro.profession) {
      return [{ name: pro.profession }];
    }
    return [];
  };

  // Generate star rating display
  const renderStars = (rating) => {
    // Ensure rating is a valid number
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`w-4 h-4 ${i < Math.floor(numericRating) ? 'text-yellow-500' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{numericRating.toFixed(1)}</span>
      </div>
    );
  };

  // Sort pros based on selected criteria
  const sortedPros = [...displayPros].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.average_rating || b.rating || 0) - (a.average_rating || a.rating || 0);
    } else if (sortBy === 'reviews') {
      return (b.review_count || b.reviews || 0) - (a.review_count || a.reviews || 0);
    } else {
      // Sort by name
      const nameA = (a.business_name || a.name || '').toLowerCase();
      const nameB = (b.business_name || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    }
  });

  // Animation variants
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="w-full">
      {/* View Toggles and Sort */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded-md ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 transition-colors'}`}
            onClick={() => setView('list')}
          >
            {language === 'ar' ? 'عرض قائمة' : 'List View'}
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 transition-colors'}`}
            onClick={() => setView('grid')}
          >
            {language === 'ar' ? 'عرض شبكي' : 'Grid View'}
          </button>
        </div>
        <select 
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="rating">{language === 'ar' ? 'ترتيب حسب: التقييم' : 'Sort by: Rating'}</option>
          <option value="reviews">{language === 'ar' ? 'ترتيب حسب: عدد التقييمات' : 'Sort by: Reviews'}</option>
          <option value="name">{language === 'ar' ? 'ترتيب حسب: الاسم' : 'Sort by: Name'}</option>
        </select>
      </div>

      {/* List View */}
      {view === 'list' && (
        <motion.div 
          className="space-y-6"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedPros.map(pro => (
            <motion.div 
              key={pro.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              variants={listItemVariants}
            >
              <div className="p-6 flex flex-col md:flex-row">
                <div className="md:w-1/4 mb-4 md:mb-0">
                  <img 
                    src={getProfileImage(pro)} 
                    alt={pro.business_name || pro.name} 
                    className="w-full h-48 md:h-40 object-cover rounded-md"
                  />
                </div>
                <div className="md:w-3/4 md:pl-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{getProName(pro)}</h3>
                      <p className="text-gray-600">{getProProfession(pro)}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleColor(pro.user?.role || pro.role)}`}>
                        {getProRole(pro)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md mb-2">
                      {renderStars(getProRating(pro))}
                      <span className="ml-1 text-sm text-gray-600">({getProReviewCount(pro)} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
                      </div>
                      {/* Hourly Rate Display */}
                      {getHourlyRate(pro) && (
                        <div className="flex items-center justify-end bg-green-50 px-3 py-1 rounded-md">
                          <FaDollarSign className="text-green-600 mr-1" />
                          <span className="text-lg font-bold text-green-700">
                            {formatHourlyRate(getHourlyRate(pro))}
                            <span className="text-sm font-normal text-green-600">
                              /{language === 'ar' ? 'ساعة' : 'hr'}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mt-2">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>
                      {getFullAddress(pro)}
                    </span>
                    {!hasRealLocation(pro) && (
                      <span className="inline-block ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {language === 'ar' ? 'موقع غير محدد' : 'Location not set'}
                      </span>
                    )}
                  </div>

                  {/* Service Categories */}
                  {getServiceCategories(pro).length > 0 && (
                    <div className="flex items-center mt-2">
                      <FaTags className="text-gray-400 mr-2" />
                      <div className="flex flex-wrap gap-1">
                        {getServiceCategories(pro).slice(0, 3).map((category, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                          >
                            {category.name}
                          </span>
                        ))}
                        {getServiceCategories(pro).length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            +{getServiceCategories(pro).length - 3} {language === 'ar' ? 'أكثر' : 'more'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="mt-3 text-gray-700">
                    {pro.business_description || pro.description || (language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available')}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        if (isAuthenticated) {
                          navigate(`/pros/${pro.id}`);
                        } else {
                          navigate(`/login?redirect=/pros/${pro.id}`);
                        }
                      }} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                    >
                      {language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                    </button>
                    <button 
                      onClick={() => {
                        if (isAuthenticated) {
                          navigate(`/booking/${pro.id}`);
                        } else {
                          navigate(`/login?redirect=/booking/${pro.id}`);
                        }
                      }} 
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition duration-300"
                    >
                      {language === 'ar' ? 'احجز الآن' : 'Book Now'}
                    </button>
                    <a 
                      href={`tel:+123456789`} 
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300 flex items-center"
                    >
                      <FaPhone className="mr-2" />
                      {language === 'ar' ? 'اتصل' : 'Call'}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedPros.map(pro => (
            <motion.div 
              key={pro.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              variants={listItemVariants}
            >
              <img 
                src={getProfileImage(pro)} 
                alt={getProName(pro)} 
                className="w-full h-48 object-cover"
              />
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{getProName(pro)}</h3>
                    <p className="text-gray-600 text-sm">{getProProfession(pro)}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleColor(pro.user?.role || pro.role)}`}>
                      {getProRole(pro)}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md mb-1">
                    <FaStar className="text-yellow-500 w-4 h-4" />
                      <span className="ml-1 font-semibold">{formatRating(getProRating(pro))}</span>
                    </div>
                    {/* Hourly Rate Display */}
                    {getHourlyRate(pro) && (
                      <div className="bg-green-50 px-2 py-1 rounded-md">
                        <span className="text-sm font-bold text-green-700">
                          {formatHourlyRate(getHourlyRate(pro))}
                          <span className="text-xs font-normal">/{language === 'ar' ? 'س' : 'hr'}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <FaMapMarkerAlt className="mr-1 w-3 h-3" />
                  <p className="truncate">{getFullAddress(pro)}</p>
                  {!hasRealLocation(pro) && (
                    <span className="inline-block ml-1 px-1 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      ⚠️
                    </span>
                  )}
                </div>

                {/* Service Categories */}
                {getServiceCategories(pro).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getServiceCategories(pro).slice(0, 2).map((category, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                      >
                        {category.name}
                      </span>
                    ))}
                    {getServiceCategories(pro).length > 2 && (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        +{getServiceCategories(pro).length - 2}
                      </span>
                    )}
                  </div>
                )}
                
                <p className="mt-2 text-sm line-clamp-2 text-gray-700">
                  {getProDescription(pro)}
                </p>
                
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate(`/pros/${pro.id}`);
                      } else {
                        navigate(`/login?redirect=/pros/${pro.id}`);
                      }
                    }} 
                    className="flex-1 px-3 py-1.5 text-center text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    {language === 'ar' ? 'عرض الملف' : 'View Profile'}
                  </button>
                  <button 
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate(`/booking/${pro.id}`);
                      } else {
                        navigate(`/login?redirect=/booking/${pro.id}`);
                      }
                    }} 
                    className="flex-1 px-3 py-1.5 text-center text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition duration-300"
                  >
                    {language === 'ar' ? 'احجز' : 'Book'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* No Results */}
      {sortedPros.length === 0 && (
        <div className="text-center py-12">
          <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {language === 'ar' ? 'جرب تغيير معايير البحث' : 'Try adjusting your search criteria'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProsList; 