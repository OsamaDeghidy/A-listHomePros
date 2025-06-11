import api from './api';

class AddressService {
  // Geocoding using OpenStreetMap Nominatim (free service)
  async geocodeAddress(addressString) {
    try {
      const encodedAddress = encodeURIComponent(addressString);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1&countrycodes=eg,sa,ae,kw,qa,bh,om,jo,lb,sy,iq`,
        {
          headers: {
            'User-Agent': 'AListHomePros/1.0' // Required by Nominatim
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            display_name: result.display_name,
            address_details: result.address
          };
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    return null;
  }

  // Search for address suggestions
  async searchAddresses(query, countryCode = 'eg') {
    try {
      if (query.length < 3) return [];

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=${countryCode}`,
        {
          headers: {
            'User-Agent': 'AListHomePros/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.map(item => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.address,
          type: item.type,
          importance: item.importance
        }));
      }
    } catch (error) {
      console.error('Address search error:', error);
    }
    
    return [];
  }

  // Reverse geocoding (coordinates to address)
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AListHomePros/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          return {
            display_name: data.display_name,
            address: data.address
          };
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    
    return null;
  }

  // Create address with automatic geocoding
  async createAddressWithGeocode(addressData) {
    try {
      // If no coordinates provided, try to geocode
      if (!addressData.latitude || !addressData.longitude) {
        const addressString = [
          addressData.street_address,
          addressData.city,
          addressData.state,
          addressData.country
        ].filter(part => part && part.trim()).join(', ');

        const geocodeResult = await this.geocodeAddress(addressString);
        if (geocodeResult) {
          addressData.latitude = geocodeResult.latitude;
          addressData.longitude = geocodeResult.longitude;
        }
      }

      // Create address via API
      const response = await api.post('/core/addresses/', addressData);
      return response.data;
    } catch (error) {
      console.error('Create address error:', error);
      throw error;
    }
  }

  // Update address with automatic geocoding
  async updateAddressWithGeocode(addressId, addressData) {
    try {
      // If coordinates are missing or invalid, try to geocode
      if (!addressData.latitude || !addressData.longitude || 
          addressData.latitude === 0 || addressData.longitude === 0) {
        const addressString = [
          addressData.street_address,
          addressData.city,
          addressData.state,
          addressData.country
        ].filter(part => part && part.trim()).join(', ');

        const geocodeResult = await this.geocodeAddress(addressString);
        if (geocodeResult) {
          addressData.latitude = geocodeResult.latitude;
          addressData.longitude = geocodeResult.longitude;
        }
      }

      // Update address via API
      const response = await api.put(`/core/addresses/${addressId}/`, addressData);
      return response.data;
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  }

  // Get all addresses for user
  async getUserAddresses() {
    try {
      const response = await api.get('/core/addresses/');
      return response.data;
    } catch (error) {
      console.error('Get addresses error:', error);
      throw error;
    }
  }

  // Get primary address
  async getPrimaryAddress() {
    try {
      const response = await api.get('/core/addresses/primary/');
      return response.data;
    } catch (error) {
      console.error('Get primary address error:', error);
      throw error;
    }
  }

  // Set address as primary
  async setPrimaryAddress(addressId) {
    try {
      const response = await api.post(`/core/addresses/${addressId}/set_primary/`);
      return response.data;
    } catch (error) {
      console.error('Set primary address error:', error);
      throw error;
    }
  }

  // Delete address
  async deleteAddress(addressId) {
    try {
      await api.delete(`/core/addresses/${addressId}/`);
      return true;
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    
    const parts = [
      address.street_address,
      address.city,
      address.state,
      address.zip_code,
      address.country
    ].filter(part => part && part.trim());
    
    return parts.join(', ');
  }

  // Validate Egyptian coordinates
  isEgyptianCoordinates(lat, lng) {
    // Egypt coordinates roughly: 22°N to 31.5°N, 25°E to 35°E
    return lat >= 22 && lat <= 31.5 && lng >= 25 && lng <= 35;
  }

  // Update professional address with automatic geocoding
  async updateProfessionalAddress(addressData) {
    try {
      const response = await api.post('/alistpros-profiles/api/profiles/update_address/', {
        address: addressData
      });
      return response.data;
    } catch (error) {
      console.error('Update professional address error:', error);
      throw error;
    }
  }

  // Get major Egyptian cities for quick selection
  getMajorEgyptianCities() {
    return [
      { name: 'القاهرة', name_en: 'Cairo', lat: 30.0444, lng: 31.2357 },
      { name: 'الإسكندرية', name_en: 'Alexandria', lat: 31.2001, lng: 29.9187 },
      { name: 'الجيزة', name_en: 'Giza', lat: 30.0131, lng: 31.2089 },
      { name: 'شبرا الخيمة', name_en: 'Shubra El Kheima', lat: 30.1287, lng: 31.2444 },
      { name: 'بورسعيد', name_en: 'Port Said', lat: 31.2653, lng: 32.3019 },
      { name: 'السويس', name_en: 'Suez', lat: 29.9668, lng: 32.5498 },
      { name: 'الأقصر', name_en: 'Luxor', lat: 25.6872, lng: 32.6396 },
      { name: 'أسوان', name_en: 'Aswan', lat: 24.0889, lng: 32.8998 },
      { name: 'أسيوط', name_en: 'Asyut', lat: 27.1783, lng: 31.1859 },
      { name: 'طنطا', name_en: 'Tanta', lat: 30.7865, lng: 31.0004 },
      { name: 'المنصورة', name_en: 'Mansoura', lat: 31.0409, lng: 31.3785 },
      { name: 'الزقازيق', name_en: 'Zagazig', lat: 30.5877, lng: 31.5026 }
    ];
  }
}

export default new AddressService(); 