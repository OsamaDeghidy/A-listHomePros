import { useState, useEffect } from 'react';
import api from '../services/api';

export function useServiceDetails(serviceId) {
  const [service, setService] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      try {
        // Get service details
        const serviceResponse = await api.get(`/alistpros/categories/${serviceId}/`);
        setService(serviceResponse.data);

        // Get professionals for this service
        const prosResponse = await api.get('/alistpros/profiles/', {
          params: { service: serviceId }
        });
        setProfessionals(prosResponse.data.results);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError(err.response?.data?.message || 'Failed to load service details');
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  return { service, professionals, loading, error };
}

export default useServiceDetails; 