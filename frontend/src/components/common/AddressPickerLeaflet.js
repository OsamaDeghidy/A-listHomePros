import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useLanguage } from '../../hooks/useLanguage';
import { addressService } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  FaMapMarkerAlt,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaMap,
  FaList,
  FaSave
} from 'react-icons/fa';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker component that handles map clicks
const LocationMarker = ({ position, setPosition, onLocationChange }) => {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const AddressPickerLeaflet = ({ 
  onAddressChange, 
  initialAddress = null, 
  label = null, 
  required = false,
  showMap = true,
  createAddressCallback = null
}) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'map'
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [geocodingError, setGeocodingError] = useState('');
  const [geocodingSuccess, setGeocodingSuccess] = useState('');
  
  // Address form fields
  const [addressData, setAddressData] = useState({
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Egypt',
    latitude: null,
    longitude: null,
    is_primary: false
  });

  // Map state
  const [mapCenter, setMapCenter] = useState([30.0444, 31.2357]); // Cairo default
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');

  // Initialize with existing address
  useEffect(() => {
    if (initialAddress) {
      setAddressData({
        street_address: initialAddress.street_address || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        zip_code: initialAddress.zip_code || '',
        country: initialAddress.country || 'Egypt',
        latitude: initialAddress.latitude || null,
        longitude: initialAddress.longitude || null,
        is_primary: initialAddress.is_primary || false
      });
      
      if (initialAddress.latitude && initialAddress.longitude) {
        const position = [parseFloat(initialAddress.latitude), parseFloat(initialAddress.longitude)];
        setMapCenter(position);
        setMarkerPosition(position);
      }
    }
  }, [initialAddress]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    const updatedData = {
      ...addressData,
      [field]: value
    };
    setAddressData(updatedData);
    
    // Notify parent of changes
    if (onAddressChange) {
      onAddressChange(updatedData);
    }
  };

  // Handle map click
  const handleMapLocationChange = async (lat, lng) => {
    setIsGeocoding(true);
    setGeocodingError('');

    try {
      console.log('🗺️ Reverse geocoding coordinates:', lat, lng);
      const response = await addressService.reverseGeocode(lat, lng);
      
      if (response.data && response.data.address_details) {
        const details = response.data.address_details;
        
        const updatedData = {
          ...addressData,
          street_address: details.road || details.house_number ? 
            `${details.house_number || ''} ${details.road || ''}`.trim() : 
            addressData.street_address,
          city: details.city || details.town || details.village || addressData.city,
          state: details.state || details.governorate || addressData.state,
          zip_code: details.postcode || addressData.zip_code,
          country: details.country || addressData.country,
          latitude: lat,
          longitude: lng
        };
        
        setAddressData(updatedData);
        if (onAddressChange) {
          onAddressChange(updatedData);
        }
        setGeocodingSuccess(isArabic ? 'تم تحديد العنوان بنجاح' : 'Address located successfully');
        
        setTimeout(() => setGeocodingSuccess(''), 3000);
      }
    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
      // Still update coordinates even if reverse geocoding fails
      const updatedData = {
        ...addressData,
        latitude: lat,
        longitude: lng
      };
      setAddressData(updatedData);
      if (onAddressChange) {
        onAddressChange(updatedData);
      }
      setGeocodingError(isArabic ? 'تعذر الحصول على تفاصيل العنوان' : 'Could not get address details');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Search for address on map
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return;

    setIsGeocoding(true);
    setGeocodingError('');

    try {
      console.log('🔍 Geocoding address:', searchAddress);
      const response = await addressService.geocodeAddress(searchAddress);
      
      if (response.data) {
        const { latitude, longitude } = response.data;
        const position = [latitude, longitude];
        
        setMapCenter(position);
        setMarkerPosition(position);
        
        const updatedData = {
          ...addressData,
          latitude,
          longitude
        };
        setAddressData(updatedData);
        if (onAddressChange) {
          onAddressChange(updatedData);
        }
        
        setGeocodingSuccess(isArabic ? 'تم العثور على العنوان' : 'Address found');
        setTimeout(() => setGeocodingSuccess(''), 3000);
      }
    } catch (error) {
      console.error('❌ Geocoding failed:', error);
      setGeocodingError(isArabic ? 'لم يتم العثور على العنوان' : 'Address not found');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Geocode current form address
  const geocodeFormAddress = async () => {
    const { street_address, city, state, country } = addressData;
    const fullAddress = [street_address, city, state, country].filter(Boolean).join(', ');
    
    if (!fullAddress.trim()) {
      setGeocodingError(isArabic ? 'يرجى إدخال العنوان أولاً' : 'Please enter address first');
      return;
    }

    setIsGeocoding(true);
    setGeocodingError('');

    try {
      console.log('📍 Geocoding form address:', fullAddress);
      const response = await addressService.geocodeAddress(fullAddress);
      
      if (response.data) {
        const { latitude, longitude } = response.data;
        const updatedData = {
          ...addressData,
          latitude,
          longitude
        };
        setAddressData(updatedData);
        if (onAddressChange) {
          onAddressChange(updatedData);
        }
        
        // Update map if in map view
        if (viewMode === 'map') {
          const position = [latitude, longitude];
          setMapCenter(position);
          setMarkerPosition(position);
        }
        
        setGeocodingSuccess(isArabic ? 'تم تحديد الإحداثيات' : 'Coordinates found');
        setTimeout(() => setGeocodingSuccess(''), 3000);
      }
    } catch (error) {
      console.error('❌ Form geocoding failed:', error);
      setGeocodingError(isArabic ? 'تعذر تحديد الإحداثيات' : 'Could not find coordinates');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle save address
  const handleSaveAddress = async () => {
    if (!addressData.street_address || !addressData.city) {
      setGeocodingError(isArabic ? 'يرجى إدخال العنوان والمدينة على الأقل' : 'Please enter at least street address and city');
      return;
    }

    if (createAddressCallback) {
      setIsSaving(true);
      try {
        await createAddressCallback(addressData);
        setGeocodingSuccess(isArabic ? 'تم حفظ العنوان بنجاح' : 'Address saved successfully');
        
        // Reset form after successful save
        setTimeout(() => {
          setAddressData({
            street_address: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'Egypt',
            latitude: null,
            longitude: null,
            is_primary: false
          });
          setMarkerPosition(null);
          setGeocodingSuccess('');
        }, 2000);
      } catch (error) {
        setGeocodingError(isArabic ? 'فشل في حفظ العنوان' : 'Failed to save address');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* View Mode Toggle */}
      {showMap && (
        <div className="flex rounded-lg border border-gray-300 overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setViewMode('form')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'form'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaList className="inline mr-2" />
            {isArabic ? 'نموذج العنوان' : 'Address Form'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaMap className="inline mr-2" />
            {isArabic ? 'الخريطة' : 'Map View'}
          </button>
        </div>
      )}

      {/* Messages */}
      {(geocodingSuccess || geocodingError) && (
        <div className={`p-3 rounded-lg flex items-center ${
          geocodingSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {geocodingSuccess ? (
            <FaCheckCircle className="text-green-500 mr-2" />
          ) : (
            <FaExclamationTriangle className="text-red-500 mr-2" />
          )}
          <span className={geocodingSuccess ? 'text-green-800' : 'text-red-800'}>
            {geocodingSuccess || geocodingError}
          </span>
          <button
            type="button"
            onClick={() => {
              setGeocodingSuccess('');
              setGeocodingError('');
            }}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Form View */}
      {viewMode === 'form' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'عنوان الشارع' : 'Street Address'}
              </label>
              <input
                type="text"
                value={addressData.street_address}
                onChange={(e) => handleInputChange('street_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isArabic ? 'أدخل عنوان الشارع' : 'Enter street address'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'المدينة' : 'City'}
              </label>
              <input
                type="text"
                value={addressData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isArabic ? 'أدخل المدينة' : 'Enter city'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'المحافظة/الولاية' : 'State/Governorate'}
              </label>
              <input
                type="text"
                value={addressData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isArabic ? 'أدخل المحافظة' : 'Enter state'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'الرمز البريدي' : 'Zip Code'}
              </label>
              <input
                type="text"
                value={addressData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isArabic ? 'أدخل الرمز البريدي' : 'Enter zip code'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'الدولة' : 'Country'}
              </label>
              <select
                value={addressData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Egypt">{isArabic ? 'مصر' : 'Egypt'}</option>
                <option value="Saudi Arabia">{isArabic ? 'السعودية' : 'Saudi Arabia'}</option>
                <option value="UAE">{isArabic ? 'الإمارات' : 'UAE'}</option>
                <option value="Kuwait">{isArabic ? 'الكويت' : 'Kuwait'}</option>
                <option value="Qatar">{isArabic ? 'قطر' : 'Qatar'}</option>
                <option value="Bahrain">{isArabic ? 'البحرين' : 'Bahrain'}</option>
                <option value="Oman">{isArabic ? 'عمان' : 'Oman'}</option>
                <option value="Jordan">{isArabic ? 'الأردن' : 'Jordan'}</option>
                <option value="Lebanon">{isArabic ? 'لبنان' : 'Lebanon'}</option>
              </select>
            </div>
          </div>

          {/* Geocode Button */}
          <button
            type="button"
            onClick={geocodeFormAddress}
            disabled={isGeocoding}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGeocoding ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {isArabic ? 'جاري تحديد الموقع...' : 'Locating...'}
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="mr-2" />
                {isArabic ? 'تحديد الموقع على الخريطة' : 'Locate on Map'}
              </>
            )}
          </button>

          {/* Coordinates Display */}
          {addressData.latitude && addressData.longitude && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                <span>
                  {isArabic ? 'الإحداثيات:' : 'Coordinates:'} {' '}
                  {parseFloat(addressData.latitude).toFixed(6)}, {parseFloat(addressData.longitude).toFixed(6)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && showMap && (
        <div className="space-y-4">
          {/* Address Search */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={isArabic ? 'ابحث عن عنوان...' : 'Search for an address...'}
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={isGeocoding}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isGeocoding ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            </button>
          </div>

          {/* Map Container with Leaflet */}
          <div className="h-96 w-full border border-gray-300 rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker
                position={markerPosition}
                setPosition={setMarkerPosition}
                onLocationChange={handleMapLocationChange}
              />
            </MapContainer>
          </div>

          <p className="text-sm text-gray-600 text-center">
            {isArabic 
              ? 'انقر على الخريطة لتحديد موقعك بدقة'
              : 'Click on the map to pinpoint your exact location'
            }
          </p>
        </div>
      )}

      {/* Primary Address Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_primary"
          checked={addressData.is_primary}
          onChange={(e) => handleInputChange('is_primary', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
          {isArabic ? 'جعل هذا العنوان الأساسي' : 'Set as primary address'}
        </label>
      </div>

      {/* Save Address Button */}
      {createAddressCallback && (
        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSaveAddress}
            disabled={!addressData.street_address || !addressData.city || isSaving}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {isArabic ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                {isArabic ? 'حفظ العنوان' : 'Save Address'}
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {isArabic 
              ? 'تأكد من صحة البيانات قبل الحفظ'
              : 'Make sure the data is correct before saving'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressPickerLeaflet; 