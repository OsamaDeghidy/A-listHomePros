import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schedulingService, paymentsService, proService } from '../services/api';

export function useBooking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Function to fetch availability slots for a professional
  const fetchAvailability = async (proId) => {
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    
    try {
      if (!proId) {
        throw new Error('Professional ID is required to fetch availability');
      }
      
      console.log(`Fetching availability for professional ID: ${proId}`);
      
      // Get availability slots from the backend
      const response = await proService.getProviderAvailability(proId);
      
      // Process the availability data into a more usable format
      const availabilitySlots = response.data.results || [];
      console.log(`Received ${availabilitySlots.length} availability slots:`, availabilitySlots);
      
      // Transform the data into a format that's easier to use in the UI
      // Group by date and extract available times
      const processedData = processAvailabilityData(availabilitySlots);
      console.log('Processed availability data:', processedData);
      
      setAvailabilityData(processedData);
      setAvailabilityLoading(false);
      return processedData;
    } catch (err) {
      console.error('Error fetching availability:', err);
      setAvailabilityError(err.response?.data?.message || err.message || 'Failed to fetch availability');
      setAvailabilityLoading(false);
      throw err;
    }
  };
  
  // Helper function to process availability data
  const processAvailabilityData = (slots) => {
    // Get current date for filtering past dates
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Create a map to store available dates and times
    const availableDates = [];
    
    console.log('Processing slots:', slots);
    
    // Process each slot
    slots.forEach(slot => {
      // Get the day of week (0-6, where 0 is Monday)
      const dayOfWeek = slot.dayOfWeek || slot.day_of_week;
      const dayName = slot.dayName || slot.day_name;
      
      if (!dayOfWeek && dayOfWeek !== 0) {
        console.error('Missing dayOfWeek in slot:', slot);
        return; // Skip this slot
      }
      
      // Calculate the next few occurrences of this day
      for (let i = 0; i < 4; i++) { // Look ahead 4 weeks
        const date = getNextDayOccurrence(dayOfWeek, i);
        
        // Skip dates in the past
        if (date < currentDate) continue;
        
        // Format the date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Find if this date already exists in our array
        let dateEntry = availableDates.find(d => d.date === formattedDate);
        
        // If not, create a new entry
        if (!dateEntry) {
          dateEntry = {
            date: formattedDate,
            dayName: dayName,
            times: []
          };
          availableDates.push(dateEntry);
        }
        
        // Add the time slot if it's not already included
        const timeString = slot.startTime || slot.start_time;
        if (timeString && !dateEntry.times.includes(timeString.substring(0, 5))) {
          dateEntry.times.push(timeString.substring(0, 5)); // Extract HH:MM
        }
      }
    });
    
    // Sort dates chronologically
    availableDates.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Sort times within each date
    availableDates.forEach(date => {
      date.times.sort();
    });
    
    // Log the result for debugging
    console.log('Final processed availableDates:', availableDates);
    
    return availableDates;
  };
  
  // Helper function to get the next occurrence of a specific day of the week
  const getNextDayOccurrence = (dayOfWeek, weeksAhead = 0) => {
    const today = new Date();
    const todayDayOfWeek = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    
    // Calculate days until the next occurrence of the specified day
    let daysUntilNext = (dayOfWeek - todayDayOfWeek + 7) % 7;
    if (daysUntilNext === 0) daysUntilNext = 7; // If today, get next week
    
    // Add weeks ahead
    daysUntilNext += weeksAhead * 7;
    
    // Create the date for the next occurrence
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    nextDate.setHours(0, 0, 0, 0);
    
    return nextDate;
  };
  
  // Function to check if a specific date and time slot is available
  const checkSlotAvailability = async (proId, date, time) => {
    try {
      setLoading(true);
      
      if (!proId) {
        console.error('Professional ID is required to check slot availability');
        return false;
      }
      
      if (!date || !time) {
        console.error('Date and time are required to check slot availability');
        return false;
      }
      
      console.log(`Checking availability for pro ${proId} on ${date} at ${time}`);
      
      // التأكد من تحويل معرف المهني إلى نص (string) لضمان توافقه مع API
      const formattedProId = String(proId);
      
      // الحصول على بيانات التوفر إذا لم تكن متوفرة
      if (availabilityData.length === 0) {
        await fetchAvailability(formattedProId);
      }
      
      // البحث عن التاريخ في البيانات
      const dateEntry = availabilityData.find(d => d.date === date);
      
      if (!dateEntry) {
        console.log(`No availability found for date: ${date}`);
        return false;
      }
      
      // التحقق من وجود الفترة الزمنية لهذا التاريخ
      if (dateEntry.times.includes(time)) {
        console.log(`Time slot ${time} exists in availability data`);
        
        // التحقق من الحجوزات الموجودة
        const params = {
          alistpro: formattedProId,
          appointment_date: date,
          // تضمين جميع الحجوزات التي لم يتم إلغاؤها
          status: ['REQUESTED', 'CONFIRMED', 'IN_PROGRESS']
        };
        
        console.log('Checking for existing appointments with params:', params);
        const response = await schedulingService.getAppointments(params);
        const existingAppointments = response.data.results || [];
        console.log(`Found ${existingAppointments.length} existing appointments for this date`);
        
        // التحقق من وجود تعارض مع الفترة المطلوبة
        const conflictingAppointment = existingAppointments.find(appointment => {
          // استخراج بيانات الوقت من الحجز
          const appointmentStartTime = appointment.start_time ? appointment.start_time.substring(0, 5) : null;
          
          if (!appointmentStartTime) return false;
          
          // التحقق من التعارض
          const conflicts = appointmentStartTime === time;
          
          if (conflicts) {
            console.log(`Conflict found: Appointment #${appointment.id} at ${appointmentStartTime}`);
          }
          
          return conflicts;
        });
        
        return !conflictingAppointment; // متاح إذا لم يكن هناك تعارض
      }
      
      console.log(`Time slot ${time} not found in availability data for date ${date}`);
      return false; // الفترة غير موجودة في جدول التوفر
      
    } catch (err) {
      console.error('Error checking slot availability:', err);
      return false; // إرجاع false لضمان السلامة
    } finally {
      setLoading(false);
    }
  };
  
  // Function to create a booking
  const createBooking = async (bookingData) => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if the slot is available
      const isAvailable = await checkSlotAvailability(
        bookingData.professional_id,
        bookingData.date,
        bookingData.time
      );
      
      if (!isAvailable) {
        throw new Error('This time slot is no longer available. Please select another time.');
      }
      
      // Format the data for the API
      const appointmentData = {
        alistpro: bookingData.professional_id,
        service_category: bookingData.service_id,
        appointment_date: bookingData.date,
        start_time: bookingData.time,
        end_time: calculateEndTime(bookingData.time, 1), // Assuming 1 hour duration
        notes: bookingData.description,
        location: bookingData.address,
        estimated_cost: bookingData.price
      };
      
      // Create appointment in backend
      const appointmentResponse = await schedulingService.createAppointment(appointmentData);
      const appointmentId = appointmentResponse.data.id;
      
      setLoading(false);
      return appointmentId;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
      setLoading(false);
      throw err;
    }
  };
  
  // Helper function to calculate end time
  const calculateEndTime = (startTime, durationHours) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes, 0, 0);
    endDate.setTime(endDate.getTime() + (durationHours * 60 * 60 * 1000));
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  // Function to confirm a booking and proceed to payment
  const confirmBooking = async (appointmentId, bookingDetails) => {
    setLoading(true);
    setError(null);
    setPaymentLoading(true);
    
    try {
      // First confirm the appointment
      await schedulingService.confirmAppointment(appointmentId);
      
      // Then create a payment session
      try {
        // Get the appointment details to get the price and professional ID
        const appointmentResponse = await schedulingService.getAppointment(appointmentId);
        const appointment = appointmentResponse.data;
        
        // Create the payment session with all required parameters
        const paymentResponse = await paymentsService.createPaymentSession({
          alistpro_id: appointment.alistpro,
          amount: appointment.estimated_cost || bookingDetails?.price || 0,
          appointment_id: appointmentId,
          success_url: `${window.location.origin}/booking-confirmation?status=success&appointment_id=${appointmentId}`,
          cancel_url: `${window.location.origin}/booking-confirmation?status=cancelled&appointment_id=${appointmentId}`
        });
        
        // Get the checkout URL from the response
        const checkoutUrl = paymentResponse.data.checkout_url;
        setPaymentUrl(checkoutUrl);
        
        // Redirect to payment page if URL is available
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setPaymentLoading(false);
          navigate('/booking-confirmation');
        }
      } catch (paymentErr) {
        console.error('Error creating payment session:', paymentErr);
        setPaymentError(paymentErr.response?.data?.message || 'Failed to create payment session');
        setPaymentLoading(false);
        
        // Still navigate to confirmation even if payment fails
        navigate('/booking-confirmation');
      }
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError(err.response?.data?.message || 'Failed to confirm booking');
      setLoading(false);
      setPaymentLoading(false);
    }
  };

  const cancelBooking = async (appointmentId) => {
    setLoading(true);
    setError(null);
    
    try {
      await schedulingService.cancelAppointment(appointmentId);
      setLoading(false);
    } catch (err) {
      console.error('Error canceling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking');
      setLoading(false);
    }
  };

  return { 
    createBooking, 
    confirmBooking, 
    cancelBooking, 
    fetchAvailability,
    processAvailabilityData,
    checkSlotAvailability,
    loading, 
    error,
    availabilityData,
    availabilityLoading,
    availabilityError,
    paymentUrl,
    paymentLoading,
    paymentError
  };
}

export default useBooking; 