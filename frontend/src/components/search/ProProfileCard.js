import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaCheck, FaHammer, FaCertificate, FaCalendarAlt } from 'react-icons/fa';

const ProProfileCard = ({ pro, onHireClick, showHireButton = true, className = '' }) => {
  // Calculate stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-500" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-yellow-500" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };

  // Format verification badges
  const renderVerificationBadges = (verifications) => {
    if (!verifications || !verifications.length) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {verifications.map((verification, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
          >
            <FaCheck className="mr-1 text-green-700" size="0.75em" />
            {verification}
          </span>
        ))}
      </div>
    );
  };

  // Format skills/specialties
  const renderSkills = (skills) => {
    if (!skills || !skills.length) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {skills.slice(0, 4).map((skill, index) => (
          <span 
            key={index}
            className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
          >
            {skill}
          </span>
        ))}
        {skills.length > 4 && (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            +{skills.length - 4}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="p-4">
        <div className="flex items-center">
          {/* Avatar & Status */}
          <div className="relative">
            <img 
              src={pro.avatar || 'https://via.placeholder.com/60'} 
              alt={pro.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            {pro.available && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" title="Available now"></span>
            )}
          </div>
          
          {/* Basic Info */}
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold">
              <Link to={`/pro/${pro.id}`} className="text-blue-700 hover:text-blue-900 hover:underline">
                {pro.name}
              </Link>
              {pro.verified && (
                <FaCheck className="inline-block ml-1 text-blue-500" size="0.75em" title="Verified" />
              )}
            </h3>
            <p className="text-gray-600">{pro.profession}</p>
            
            {/* Rating */}
            <div className="flex items-center mt-1">
              <div className="flex mr-1">
                {renderStars(pro.rating)}
              </div>
              <span className="text-sm text-gray-600">
                ({pro.reviewCount} {pro.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
          
          {/* Price Info (optional) */}
          {pro.hourlyRate && (
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                {pro.hourlyRate} <span className="text-sm text-gray-600">/hr</span>
              </div>
              {pro.discountedRate && (
                <div className="text-sm line-through text-gray-500">
                  {pro.discountedRate} /hr
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Location */}
        <div className="flex items-center mt-3">
          <FaMapMarkerAlt className="text-gray-500 mr-1" />
          <span className="text-sm text-gray-600">{pro.location.address}</span>
        </div>
        
        {/* Skills */}
        {renderSkills(pro.skills)}
        
        {/* Verification Badges */}
        {renderVerificationBadges(pro.verifications)}
        
        {/* Stats or Featured Info */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex items-center">
            <FaHammer className="text-blue-500 mr-2" />
            <div>
              <div className="text-sm font-medium">{pro.jobsCompleted}+</div>
              <div className="text-xs text-gray-500">Jobs completed</div>
            </div>
          </div>
          <div className="flex items-center">
            <FaCertificate className="text-blue-500 mr-2" />
            <div>
              <div className="text-sm font-medium">{pro.yearsOfExperience}+</div>
              <div className="text-xs text-gray-500">Years experience</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      {showHireButton && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center">
            <FaCalendarAlt className="mr-1" />
            {pro.availability ? (
              <span className="text-green-600">Available {pro.availability}</span>
            ) : (
              <span>Check availability</span>
            )}
          </div>
          <button
            onClick={() => onHireClick(pro)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ProProfileCard; 