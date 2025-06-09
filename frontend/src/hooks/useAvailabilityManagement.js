import { useState, useCallback } from 'react';
import { schedulingService } from '../services/api';

export const useAvailabilityManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);

  // Fetch all availability data
  const fetchAvailabilityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [slotsResponse, unavailableResponse] = await Promise.all([
        schedulingService.getAvailabilitySlots(),
        schedulingService.getUnavailableDates().catch(() => ({ data: { results: [] } }))
      ]);

      console.log('📅 Fetched availability slots:', slotsResponse.data);
      console.log('🚫 Fetched unavailable dates:', unavailableResponse.data);

      setAvailabilitySlots(slotsResponse.data.results || slotsResponse.data || []);
      setUnavailableDates(unavailableResponse.data.results || unavailableResponse.data || []);

      return {
        slots: slotsResponse.data.results || slotsResponse.data || [],
        unavailable: unavailableResponse.data.results || unavailableResponse.data || []
      };

    } catch (err) {
      console.error('❌ Error fetching availability data:', err);
      const errorMessage = err.response?.status === 403 
        ? 'You do not have permission to view this data'
        : 'Failed to load availability data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new availability slot
  const createSlot = useCallback(async (slotData) => {
    setError(null);

    try {
      console.log('➕ Creating availability slot:', slotData);
      const response = await schedulingService.createAvailabilitySlot(slotData);
      console.log('✅ Slot created:', response.data);

      // Add to local state
      setAvailabilitySlots(prev => [...prev, response.data]);
      
      return response.data;

    } catch (err) {
      console.error('❌ Error creating slot:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error details:', {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data,
        headers: err.config?.headers
      });
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          err.response?.data?.message ||
                          (typeof err.response?.data === 'object' ? JSON.stringify(err.response?.data) : err.response?.data) ||
                          'Failed to create availability slot';
      
      // Check if this is an Arabic interface and translate error message
      const isArabic = localStorage.getItem('language') === 'ar';
      let displayMessage = errorMessage;
      
      if (errorMessage.includes('profile not found') || errorMessage.includes('profile setup')) {
        displayMessage = isArabic 
          ? 'لم يتم العثور على الملف الشخصي المهني. يتم إنشاؤه تلقائياً...'
          : 'Professional profile not found. Creating automatically...';
      } else if (errorMessage.includes('Could not create professional profile')) {
        displayMessage = isArabic
          ? 'لا يمكن إنشاء الملف الشخصي المهني. يرجى إكمال إعداد الملف الشخصي أولاً.'
          : 'Could not create professional profile. Please complete profile setup first.';
      }
      
      setError(displayMessage);
      throw err;
    }
  }, []);

  // Update existing availability slot
  const updateSlot = useCallback(async (slotId, slotData) => {
    setError(null);

    try {
      console.log('✏️ Updating availability slot:', slotId, slotData);
      const response = await schedulingService.updateAvailabilitySlot(slotId, slotData);
      console.log('✅ Slot updated:', response.data);

      // Update local state
      setAvailabilitySlots(prev => 
        prev.map(slot => slot.id === slotId ? response.data : slot)
      );
      
      return response.data;

    } catch (err) {
      console.error('❌ Error updating slot:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Failed to update availability slot';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Delete availability slot
  const deleteSlot = useCallback(async (slotId) => {
    setError(null);

    try {
      console.log('🗑️ Deleting availability slot:', slotId);
      await schedulingService.deleteAvailabilitySlot(slotId);
      console.log('✅ Slot deleted');

      // Remove from local state
      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== slotId));
      
      return true;

    } catch (err) {
      console.error('❌ Error deleting slot:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Failed to delete availability slot';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Create unavailable date
  const createUnavailableDate = useCallback(async (dateData) => {
    setError(null);

    try {
      console.log('🚫 Creating unavailable date:', dateData);
      const response = await schedulingService.createUnavailableDate(dateData);
      console.log('✅ Unavailable date created:', response.data);

      // Add to local state
      setUnavailableDates(prev => [...prev, response.data]);
      
      return response.data;

    } catch (err) {
      console.error('❌ Error creating unavailable date:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Failed to create unavailable date';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Delete unavailable date
  const deleteUnavailableDate = useCallback(async (dateId) => {
    setError(null);

    try {
      console.log('🗑️ Deleting unavailable date:', dateId);
      await schedulingService.deleteUnavailableDate(dateId);
      console.log('✅ Unavailable date deleted');

      // Remove from local state
      setUnavailableDates(prev => prev.filter(date => date.id !== dateId));
      
      return true;

    } catch (err) {
      console.error('❌ Error deleting unavailable date:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Failed to delete unavailable date';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Group slots by day of week
  const getSlotsByDay = useCallback(() => {
    return availabilitySlots.reduce((acc, slot) => {
      const dayKey = slot.day_of_week;
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(slot);
      return acc;
    }, {});
  }, [availabilitySlots]);

  // Get availability statistics
  const getStats = useCallback(() => {
    const totalSlots = availabilitySlots.length;
    const activeDays = new Set(availabilitySlots.map(slot => slot.day_of_week)).size;
    const upcomingUnavailable = unavailableDates.filter(date => 
      new Date(date.start_date) >= new Date()
    ).length;

    return {
      totalSlots,
      activeDays,
      upcomingUnavailable,
      totalUnavailable: unavailableDates.length
    };
  }, [availabilitySlots, unavailableDates]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    availabilitySlots,
    unavailableDates,
    
    // Computed values
    slotsByDay: getSlotsByDay(),
    stats: getStats(),
    
    // Actions
    fetchAvailabilityData,
    createSlot,
    updateSlot,
    deleteSlot,
    createUnavailableDate,
    deleteUnavailableDate,
    clearError
  };
}; 