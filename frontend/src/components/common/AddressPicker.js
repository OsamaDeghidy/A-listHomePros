import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../../hooks/useLanguage';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker component that handles map clicks
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      onLocationSelect(newPosition);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : <Marker position={position} />;
};

const AddressPicker = ({ 
  onLocationSelect, 
  initialPosition = null,
  height = '300px',
  showSearchInput = true 
}) => {
  const { isArabic } = useLanguage();
  const [position, setPosition] = useState(initialPosition || [24.7136, 46.6753]); // Default to Riyadh
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle search for addresses
  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Using Nominatim (OpenStreetMap) for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchValue)}&format=json&limit=1&countrycodes=sa`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newPosition = [parseFloat(result.lat), parseFloat(result.lon)];
        setPosition(newPosition);
        onLocationSelect(newPosition, result.display_name);
      } else {
        setError(isArabic ? 'لم يتم العثور على العنوان' : 'Address not found');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError(isArabic ? 'خطأ في البحث' : 'Search error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = async (newPosition) => {
    setPosition(newPosition);
    
    try {
      // Reverse geocoding to get address name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${newPosition[0]}&lon=${newPosition[1]}&format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        onLocationSelect(newPosition, data.display_name);
      } else {
        onLocationSelect(newPosition);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      onLocationSelect(newPosition);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = [position.coords.latitude, position.coords.longitude];
          setPosition(newPosition);
          handleLocationSelect(newPosition);
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError(isArabic ? 'لا يمكن الحصول على الموقع الحالي' : 'Cannot get current location');
          setIsLoading(false);
        }
      );
    } else {
      setError(isArabic ? 'المتصفح لا يدعم تحديد الموقع' : 'Geolocation not supported');
    }
  };

  return (
    <div className="w-full">
      {showSearchInput && (
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isArabic ? 'ابحث عن عنوان...' : 'Search for an address...'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir={isArabic ? 'rtl' : 'ltr'}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? '...' : (isArabic ? 'بحث' : 'Search')}
            </button>
            <button
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              title={isArabic ? 'الموقع الحالي' : 'Current Location'}
            >
              📍
            </button>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
      
      <div 
        className="w-full border border-gray-300 rounded-md overflow-hidden"
        style={{ height }}
      >
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationSelect={handleLocationSelect}
          />
        </MapContainer>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        {isArabic 
          ? 'انقر على الخريطة لاختيار الموقع' 
          : 'Click on the map to select location'
        }
      </div>
    </div>
  );
};

export default AddressPicker; 