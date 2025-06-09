import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaUserTie, 
  FaToolbox, 
  FaUsers, 
  FaCertificate, 
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaHeart,
  FaEye
} from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

const ProfessionalProfileCard = ({ 
  professional, 
  onViewProfile, 
  onContactProfessional, 
  onAddToFavorites,
  showContactButton = true,
  showDetailsButton = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const { language, isRTL } = useLanguage();

  if (!professional) return null;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'specialist':
        return FaUserTie;
      case 'contractor':
        return FaToolbox;
      case 'crew':
        return FaUsers;
      default:
        return FaUserTie;
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      specialist: language === 'ar' ? 'متخصص A-List' : 'A-List Specialist',
      contractor: language === 'ar' ? 'مقدم خدمة Home Pro' : 'Home Pro',
      crew: language === 'ar' ? 'عضو طاقم' : 'Crew Member'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      specialist: 'bg-purple-100 text-purple-800',
      contractor: 'bg-blue-100 text-blue-800',
      crew: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FaStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <FaStar className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <FaStar className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <FaStar key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  const cardSizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const imageSize = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24'
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden ${cardSizeClasses[size]}`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Role Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Profile Image */}
          <div className={`${imageSize[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
            {professional.profile_image ? (
              <img
                src={professional.profile_image}
                alt={professional.business_name || professional.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {(professional.business_name || professional.full_name || 'P').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {professional.business_name || professional.full_name || 'Professional'}
            </h3>
            
            {/* Role Badge */}
            <div className="flex items-center space-x-2 mt-1">
              {React.createElement(getRoleIcon(professional.role), {
                className: 'w-4 h-4 text-gray-600'
              })}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(professional.role)}`}>
                {getRoleLabel(professional.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Verification & Featured Badges */}
        <div className="flex flex-col items-end space-y-1">
          {professional.is_verified && (
            <div className="flex items-center">
              <FaCheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 ml-1">
                {language === 'ar' ? 'موثق' : 'Verified'}
              </span>
            </div>
          )}
          {professional.is_featured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⭐ {language === 'ar' ? 'مميز' : 'Featured'}
            </span>
          )}
        </div>
      </div>

      {/* Rating and Experience */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {renderStars(professional.average_rating || 0)}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {(professional.average_rating || 0).toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({professional.total_reviews || 0} {language === 'ar' ? 'تقييم' : 'reviews'})
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <FaClock className="w-4 h-4 mr-1" />
          <span>
            {professional.years_experience || 0} {language === 'ar' ? 'سنة خبرة' : 'years exp'}
          </span>
        </div>
      </div>

      {/* Location */}
      {(professional.city || professional.state) && (
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
          <span>
            {[professional.city, professional.state].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      {/* Services/Categories */}
      {professional.categories && professional.categories.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {professional.categories.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {category.name || category}
              </span>
            ))}
            {professional.categories.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{professional.categories.length - 3} {language === 'ar' ? 'المزيد' : 'more'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Pricing */}
      {professional.hourly_rate && (
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <FaDollarSign className="w-4 h-4 mr-1 text-green-500" />
          <span className="font-medium">
            ${professional.hourly_rate}/{language === 'ar' ? 'ساعة' : 'hr'}
          </span>
          {professional.hourly_rate_max && professional.hourly_rate_max !== professional.hourly_rate && (
            <span className="text-gray-500">
              - ${professional.hourly_rate_max}/{language === 'ar' ? 'ساعة' : 'hr'}
            </span>
          )}
        </div>
      )}

      {/* License Info */}
      {professional.license_number && (
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <FaCertificate className="w-4 h-4 mr-2 text-blue-500" />
          <span>
            {language === 'ar' ? 'مرخص' : 'Licensed'} #{professional.license_number}
          </span>
        </div>
      )}

      {/* Description Preview */}
      {professional.business_description && size !== 'small' && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {professional.business_description}
        </p>
      )}

      {/* Stats Row */}
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4 bg-gray-50 rounded-md p-3">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{professional.total_jobs || 0}</div>
          <div>{language === 'ar' ? 'مشاريع' : 'Projects'}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {professional.success_rate || 0}%
          </div>
          <div>{language === 'ar' ? 'نجاح' : 'Success'}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {professional.response_time_hours || 24}h
          </div>
          <div>{language === 'ar' ? 'استجابة' : 'Response'}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {showDetailsButton && (
          <Link
            to={`/professionals/${professional.user_id || professional.id}`}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium text-center hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <FaEye className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </Link>
        )}

        {showContactButton && (
          <button
            onClick={() => onContactProfessional && onContactProfessional(professional)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
          >
            <FaEnvelope className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تواصل' : 'Contact'}
          </button>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => onAddToFavorites && onAddToFavorites(professional)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          title={language === 'ar' ? 'إضافة للمفضلة' : 'Add to Favorites'}
        >
          <FaHeart className="w-5 h-5" />
        </button>
      </div>

      {/* Availability Indicator */}
      {professional.is_available && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfessionalProfileCard; 