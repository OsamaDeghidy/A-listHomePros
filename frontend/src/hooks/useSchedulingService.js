import { useCallback, useState } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

export function useSchedulingService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  /**
   * Get availability for a professional between specific dates
   */
  const getAvailability = useCallback(async (alistproId, startDate, endDate) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/scheduling/availability/${alistproId}/`, {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err.response?.data?.detail || 'Failed to fetch availability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Create a new appointment
   */
  const createAppointment = useCallback(async (appointmentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/scheduling/appointments/', appointmentData);
      return response.data;
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.detail || 'Failed to create appointment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Confirm an appointment
   */
  const confirmAppointment = useCallback(async (appointmentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(`/scheduling/appointments/${appointmentId}/confirm/`);
      return response.data;
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError(err.response?.data?.detail || 'Failed to confirm appointment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Cancel an appointment
   */
  const cancelAppointment = useCallback(async (appointmentId, reason) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(`/scheduling/appointments/${appointmentId}/cancel/`, { reason });
      return response.data;
    } catch (err) {
      console.error('Error canceling appointment:', err);
      setError(err.response?.data?.detail || 'Failed to cancel appointment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Get appointments for the current user (client or professional)
   */
  const getUserAppointments = useCallback(async (status, startDate, endDate) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiClient.get('/scheduling/appointments/', { params });
      return response.data;
    } catch (err) {
      console.error('Error fetching user appointments:', err);
      setError(err.response?.data?.detail || 'Failed to fetch appointments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Get a specific appointment by ID
   */
  const getAppointment = useCallback(async (appointmentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/scheduling/appointments/${appointmentId}/`);
      return response.data;
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setError(err.response?.data?.detail || 'Failed to fetch appointment details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Set or update a professional's available time slots
   */
  const updateAvailability = useCallback(async (availabilityData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/scheduling/set-availability/', availabilityData);
      return response.data;
    } catch (err) {
      console.error('Error updating availability:', err);
      setError(err.response?.data?.detail || 'Failed to update availability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Sync with external calendar (Google, etc.)
   */
  const syncCalendar = useCallback(async (calendarData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/scheduling/sync-calendar/', calendarData);
      return response.data;
    } catch (err) {
      console.error('Error syncing calendar:', err);
      setError(err.response?.data?.detail || 'Failed to sync calendar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  return {
    getAvailability,
    createAppointment,
    confirmAppointment,
    cancelAppointment,
    getUserAppointments,
    getAppointment,
    updateAvailability,
    syncCalendar,
    loading,
    error
  };
}

export default useSchedulingService; 