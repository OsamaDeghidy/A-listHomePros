import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

const ProsList = ({ pros = [] }) => {
  const { language, isRTL } = useLanguage();
  const [view, setView] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'reviews', or 'name'

  // If no pros are provided, use this sample data
  const samplePros = [
    {
      id: 1,
      business_name: "John Smith",
      profession: "Plumber",
      service_categories: [{ name: "Plumbing" }],
      average_rating: 4.8,
      review_count: 124,
      location: { 
        address: "Cairo, EG",
        coordinates: [30.0444, 31.2357] 
      },
      business_description: "Professional plumber with over 15 years of experience in residential and commercial plumbing services.",
      profile_image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      id: 2,
      business_name: "Sarah Johnson",
      profession: "Electrician",
      service_categories: [{ name: "Electrical" }],
      average_rating: 4.9,
      review_count: 89,
      location: { 
        address: "Alexandria, EG",
        coordinates: [31.2001, 29.9187]
      },
      business_description: "Licensed electrician specializing in electrical repairs, installations, and maintenance for homes and businesses.",
      profile_image: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      id: 3,
      business_name: "Michael Brown",
      profession: "Carpenter",
      service_categories: [{ name: "Carpentry" }],
      average_rating: 4.7,
      review_count: 56,
      location: {
        address: "Giza, EG",
        coordinates: [30.0131, 31.2089]
      },
      business_description: "Custom carpentry, woodworking, and home renovations. Quality craftsmanship for all your projects.",
      profile_image: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    {
      id: 4,
      business_name: "Emily Davis",
      profession: "Painter",
      service_categories: [{ name: "Painting" }],
      average_rating: 4.6,
      review_count: 42,
      location: {
        address: "Luxor, EG",
        coordinates: [25.6872, 32.6396]
      },
      business_description: "Interior and exterior painting services. Attention to detail and customer satisfaction guaranteed.",
      profile_image: "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
      id: 5,
      business_name: "David Wilson",
      profession: "Landscaper",
      service_categories: [{ name: "Landscaping" }],
      average_rating: 4.5,
      review_count: 35,
      location: {
        address: "Aswan, EG",
        coordinates: [24.0889, 32.8998]
      },
      business_description: "Professional landscaping, garden design, and lawn maintenance services for residential and commercial properties.",
      profile_image: "https://randomuser.me/api/portraits/men/5.jpg"
    },
  ];

  const displayPros = pros.length > 0 ? pros : samplePros;

  // Helper function to extract location address from different data structures
  const getLocationAddress = (pro) => {
    if (typeof pro.location === 'string') {
      return pro.location;
    } else if (pro.location?.address) {
      return pro.location.address;
    } else if (pro.address) {
      return pro.address;
    } else {
      return language === 'ar' ? 'موقع غير محدد' : 'Location not specified';
    }
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

  // Generate star rating display
  const renderStars = (rating) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <FaStar 
          key={i} 
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`} 
        />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );

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
                    </div>
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                      {renderStars(getProRating(pro))}
                      <span className="ml-1 text-sm text-gray-600">({getProReviewCount(pro)} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mt-2">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>
                      {pro.location?.address || pro.location || (language === 'ar' ? 'موقع غير محدد' : 'Location not specified')}
                    </span>
                  </div>
                  
                  <p className="mt-3 text-gray-700">
                    {pro.business_description || pro.description || (language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available')}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link 
                      to={`/pros/${pro.id}`} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                    >
                      {language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                    </Link>
                    <Link 
                      to={`/booking/${pro.id}`} 
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition duration-300"
                    >
                      {language === 'ar' ? 'احجز الآن' : 'Book Now'}
                    </Link>
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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{getProName(pro)}</h3>
                    <p className="text-gray-600 text-sm">{getProProfession(pro)}</p>
                  </div>
                  <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                    <FaStar className="text-yellow-500 w-4 h-4" />
                    <span className="ml-1 font-semibold">{getProRating(pro).toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <FaMapMarkerAlt className="mr-1 w-3 h-3" />
                  <p>{getLocationAddress(pro)}</p>
                </div>
                
                <p className="mt-2 text-sm line-clamp-2 text-gray-700">
                  {getProDescription(pro)}
                </p>
                
                <div className="mt-4 flex space-x-2">
                  <Link 
                    to={`/pros/${pro.id}`} 
                    className="flex-1 px-3 py-1.5 text-center text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    {language === 'ar' ? 'عرض الملف' : 'View Profile'}
                  </Link>
                  <Link 
                    to={`/booking/${pro.id}`} 
                    className="flex-1 px-3 py-1.5 text-center text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition duration-300"
                  >
                    {language === 'ar' ? 'احجز الآن' : 'Book Now'}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Show message if no results */}
      {sortedPros.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {language === 'ar' ? 'لم يتم العثور على محترفين' : 'No professionals found'}
          </h3>
          <p className="mt-1 text-gray-500">
            {language === 'ar' 
              ? 'حاول تعديل معايير البحث الخاصة بك للعثور على المحترفين المناسبين.' 
              : 'Try adjusting your search criteria to find suitable professionals.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProsList; 