import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import MapComponent from '../common/MapComponent';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';

const ProsMap = ({ pros = [], onProClick }) => {
  const { language, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPro, setSelectedPro] = useState(null);

  // Helper function to safely format rating
  const formatRating = (rating) => {
    if (rating === null || rating === undefined || rating === '' || isNaN(rating)) {
      return '0.0';
    }
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
  };

  // Helper function to get professional location from address
  const getProLocation = (pro) => {
    if (pro.latitude && pro.longitude) {
      return [parseFloat(pro.latitude), parseFloat(pro.longitude)];
    }
    
    if (pro.address?.latitude && pro.address?.longitude) {
      return [parseFloat(pro.address.latitude), parseFloat(pro.address.longitude)];
    }
    
    // Default to Cairo coordinates if no location data
    return [30.0444, 31.2357];
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

  // تنسيق البيانات لمكون الخريطة
  const mapMarkers = pros.map(pro => {
    const position = getProLocation(pro);
    const fullAddress = getFullAddress(pro);
    const hasLocation = hasRealLocation(pro);
    
    return {
    id: pro.id,
      position: position,
    popupContent: `
        <div class="font-medium">${pro.business_name || pro.user?.name || pro.name}</div>
        <div class="text-sm text-gray-500">${pro.profession || pro.service_categories?.[0]?.name || (language === 'ar' ? 'محترف' : 'Professional')}</div>
        <div class="text-xs mt-1 text-gray-600">${fullAddress}</div>
        ${!hasLocation ? `
          <div class="text-xs mt-1">
            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              ${language === 'ar' ? '⚠️ موقع افتراضي' : '⚠️ Default location'}
            </span>
          </div>
        ` : ''}
        <div class="text-xs mt-1">
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            ${pro.user?.role ? (language === 'ar' ? 
              (pro.user.role === 'contractor' ? 'مقاول' : 
               pro.user.role === 'specialist' ? 'متخصص' : 
               pro.user.role === 'crew' ? 'طاقم عمل' : 'محترف') :
              (pro.user.role === 'contractor' ? 'Contractor' : 
               pro.user.role === 'specialist' ? 'Specialist' : 
               pro.user.role === 'crew' ? 'Crew Member' : 'Professional')) : 
              (language === 'ar' ? 'محترف' : 'Professional')}
          </span>
        </div>
    `,
    };
  });

  // مركز الخريطة - استخدام موقع أول محترف أو القاهرة إذا لم يكن هناك محترفين
  const mapCenter = pros.length > 0 ? getProLocation(pros[0]) : [30.0444, 31.2357];

  // معالجة النقر على المؤشر
  const handleMarkerClick = (proId) => {
    const clickedPro = pros.find(pro => pro.id === proId);
    setSelectedPro(clickedPro);
    if (onProClick) {
      onProClick(clickedPro);
    }
  };

  // إنشاء مكون نجوم التقييم
  const renderStars = (rating) => {
    const safeRating = parseFloat(rating) || 0;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`w-3 h-3 ${i < Math.floor(safeRating) ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs ml-1 font-medium">{formatRating(rating)}</span>
      </div>
    );
  };

  // إنشاء بطاقة المحترف
  const renderProCard = (pro) => (
    <div key={pro.id} className="bg-white rounded-md shadow-md overflow-hidden mb-3 hover:shadow-lg transition-shadow duration-300">
      <div className="flex p-3">
        <img
          src={pro.profile_image || pro.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${pro.id % 10}.jpg`}
          alt={pro.business_name || pro.name}
          className="w-16 h-16 rounded-full object-cover mr-3"
        />
        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h3 className="font-medium">{pro.business_name || pro.name}</h3>
          <p className="text-sm text-gray-600">{pro.profession || pro.service_categories?.[0]?.name || 'محترف'}</p>
          
          <div className="flex items-center mt-1">
            {renderStars(pro.rating || pro.average_rating || 4.5)}
            <span className="text-xs ml-1 text-gray-600">({pro.reviews || pro.review_count || 0} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <FaMapMarkerAlt className="w-3 h-3 mr-1" />
            <p>{getFullAddress(pro)}</p>
            {!hasRealLocation(pro) && (
              <span className="inline-block ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                {language === 'ar' ? 'موقع غير محدد' : 'Location not set'}
              </span>
            )}
          </div>
          
          {/* Role Badge */}
          {pro.user?.role && (
            <div className="mt-1">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                pro.user.role === 'contractor' ? 'bg-blue-100 text-blue-800' :
                pro.user.role === 'specialist' ? 'bg-green-100 text-green-800' :
                pro.user.role === 'crew' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {language === 'ar' ? 
                  (pro.user.role === 'contractor' ? 'مقاول' : 
                   pro.user.role === 'specialist' ? 'متخصص' : 
                   pro.user.role === 'crew' ? 'طاقم عمل' : 'محترف') :
                  (pro.user.role === 'contractor' ? 'Contractor' : 
                   pro.user.role === 'specialist' ? 'Specialist' : 
                   pro.user.role === 'crew' ? 'Crew Member' : 'Professional')
                }
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-2 bg-gray-50 flex justify-between">
        <button
          onClick={() => {
            if (isAuthenticated) {
              navigate(`/pros/${pro.id}`);
            } else {
              navigate(`/login?redirect=/pros/${pro.id}`);
            }
          }}
          className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
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
          className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          {language === 'ar' ? 'احجز الآن' : 'Book Now'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-4 relative rounded-lg overflow-hidden shadow-md">
        <MapComponent
          markers={mapMarkers}
          center={mapCenter}
          zoom={12}
          height="400px"
          onMarkerClick={handleMarkerClick}
          showPopups={true}
          interactive={true}
          className="rounded-lg"
        />
        
        {/* معلومات سريعة عن الخريطة */}
        <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-sm text-xs text-gray-600">
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-blue-600 mr-1" />
            <span>{language === 'ar' ? 'انقر على أي مؤشر لعرض المزيد' : 'Click markers for more info'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
            {pros.length}
          </span>
          {language === 'ar' ? 'محترف تم العثور عليهم' : 'Professionals Found'}
        </h3>

        {selectedPro && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex justify-between">
              <h4 className="font-medium">{selectedPro.business_name || selectedPro.name}</h4>
              <button 
                onClick={() => setSelectedPro(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ×
              </button>
            </div>
            <div className="mt-2 flex gap-3">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate(`/pros/${selectedPro.id}`);
                  } else {
                    navigate(`/login?redirect=/pros/${selectedPro.id}`);
                  }
                }}
                className="flex-1 text-center text-sm bg-white border border-blue-600 text-blue-600 py-1 px-2 rounded hover:bg-blue-50 transition-colors"
              >
                {language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
              </button>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate(`/booking/${selectedPro.id}`);
                  } else {
                    navigate(`/login?redirect=/booking/${selectedPro.id}`);
                  }
                }}
                className="flex-1 text-center text-sm bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 transition-colors"
              >
                {language === 'ar' ? 'احجز الآن' : 'Book Now'}
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {pros.length > 0 ? (
            pros.slice(0, 4).map(pro => renderProCard(pro))
          ) : (
            <p className="text-gray-500 text-center py-4">
              {language === 'ar' ? 'لا يوجد محترفين يطابقون معايير البحث الخاصة بك.' : 'No professionals match your search criteria.'}
            </p>
          )}
        </div>
        
        {pros.length > 4 && (
          <div className="mt-4 text-center">
            <button
              className="text-blue-600 font-medium text-sm hover:underline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              {language === 'ar' 
                ? `عرض جميع المحترفين (${pros.length})` 
                : `View All ${pros.length} Professionals`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProsMap; 