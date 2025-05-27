import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schedulingService, paymentsService } from '../services/api';

export function useBooking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBooking = async (bookingData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create appointment in backend
      const appointmentResponse = await schedulingService.createAppointment(bookingData);
      const appointmentId = appointmentResponse.data.id;
      
      // If payment is required and payment info is provided
      if (bookingData.paymentMethod && bookingData.price > 0) {
        // Create payment intent
        const paymentData = {
          appointment_id: appointmentId,
          amount: bookingData.price,
          currency: 'usd',
          payment_method: bookingData.paymentMethod
        };
        
        await paymentsService.createPaymentIntent(paymentData);
      }
      
      setLoading(false);
      return appointmentId;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
      setLoading(false);
      throw err;
    }
  };

  const confirmBooking = async (appointmentId) => {
    setLoading(true);
    setError(null);
    
    try {
      await schedulingService.confirmAppointment(appointmentId);
      setLoading(false);
      navigate('/booking-confirmation');
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError(err.response?.data?.message || 'Failed to confirm booking');
      setLoading(false);
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

  return { createBooking, confirmBooking, cancelBooking, loading, error };
}

export default useBooking; 