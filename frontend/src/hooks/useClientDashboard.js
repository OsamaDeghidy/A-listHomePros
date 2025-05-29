import { useState, useEffect } from 'react';
import { 
  bookingService, 
  paymentService, 
  alistProsService,
  userService 
} from '../services/api';

export function useClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
    savedPros: 0,
  });
  const [savedProfessionals, setSavedProfessionals] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Fetch client dashboard data
  const fetchDashboardData = async (appointmentFilter = 'upcoming') => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user profile info
      const profileResponse = await userService.getProfile();
      const userId = profileResponse.data.id;
      
      // Get appointments based on filter
      let appointmentsResponse;
      if (appointmentFilter === 'upcoming') {
        appointmentsResponse = await bookingService.getBookings({ status: ['pending', 'confirmed'] });
      } else if (appointmentFilter === 'completed') {
        appointmentsResponse = await bookingService.getBookings({ status: 'completed' });
      } else if (appointmentFilter === 'cancelled') {
        appointmentsResponse = await bookingService.getBookings({ status: 'cancelled' });
      } else {
        // Get all appointments
        appointmentsResponse = await bookingService.getBookings();
      }
      
      // Process appointments and add pro details
      const appointmentsData = appointmentsResponse.data.results || [];
      
      const appointmentsWithDetails = await Promise.all(
        appointmentsData.map(async (appointment) => {
          // If pro details are missing, fetch them
          if (appointment.contractor_id && (!appointment.pro || !appointment.pro.name)) {
            try {
              const proResponse = await alistProsService.getProfile(appointment.contractor_id);
              const proData = proResponse.data;
              
              return {
                ...appointment,
                pro: {
                  id: proData.id,
                  name: proData.user?.name || proData.business_name || 'Professional',
                  profession: proData.profession || 'Service Provider',
                  avatar: proData.profile_image || 'https://randomuser.me/api/portraits/lego/1.jpg',
                  rating: proData.average_rating || 0
                }
              };
            } catch (proError) {
              console.error('Error fetching pro details:', proError);
              return appointment;
            }
          }
          return appointment;
        })
      );
      
      setAppointments(appointmentsWithDetails);
      
      // Fetch saved professionals
      let savedPros = [];
      try {
        const savedProsResponse = await alistProsService.getSavedProfessionals();
        savedPros = savedProsResponse.data.results || [];
        setSavedProfessionals(savedPros);
      } catch (savedProsError) {
        console.error('Error fetching saved professionals:', savedProsError);
        setSavedProfessionals([]);
      }
      
      // Get payment methods
      try {
        const paymentMethodsResponse = await paymentService.getPaymentMethods();
        setPaymentMethods(paymentMethodsResponse.data.results || []);
      } catch (paymentMethodsError) {
        console.error('Error fetching payment methods:', paymentMethodsError);
        setPaymentMethods([]);
      }
      
      // Calculate statistics
      const allAppointmentsResponse = await bookingService.getBookings();
      const allAppointments = allAppointmentsResponse.data.results || [];
      
      const upcomingAppts = allAppointments.filter(
        appt => appt.status === 'confirmed' || appt.status === 'pending'
      );
      
      const completedAppts = allAppointments.filter(
        appt => appt.status === 'completed'
      );
      
      // Calculate total spent
      let totalSpent = 0;
      completedAppts.forEach(appt => {
        totalSpent += parseFloat(appt.total_cost || appt.estimated_cost || 0);
      });
      
      // Update statistics
      setStats({
        upcomingAppointments: upcomingAppts.length,
        completedAppointments: completedAppts.length,
        totalSpent: totalSpent,
        savedPros: savedPros.length || 0,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('فشل في تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى لاحقاً.');
      setLoading(false);
    }
  };

  // Cancel an appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      await bookingService.cancelBooking(appointmentId);
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId ? { ...appt, status: 'cancelled' } : appt
        )
      );
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        upcomingAppointments: Math.max(0, prevStats.upcomingAppointments - 1),
      }));
      
      return true;
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('فشل في إلغاء الموعد. يرجى المحاولة مرة أخرى.');
      return false;
    }
  };

  // Add or remove saved professional
  const toggleSaveProfessional = async (proId, isSaved) => {
    try {
      if (isSaved) {
        await alistProsService.unsaveProfessional(proId);
        setSavedProfessionals(prev => prev.filter(p => p.id !== proId));
      } else {
        await alistProsService.saveProfessional(proId);
        const proResponse = await alistProsService.getProfile(proId);
        setSavedProfessionals(prev => [...prev, proResponse.data]);
      }
      
      // Update saved pros count
      setStats(prevStats => ({
        ...prevStats,
        savedPros: isSaved ? prevStats.savedPros - 1 : prevStats.savedPros + 1,
      }));
      
      return true;
    } catch (err) {
      console.error('Error toggling saved professional:', err);
      setError('فشل في تحديث المهنيين المحفوظين. يرجى المحاولة مرة أخرى.');
      return false;
    }
  };

  // Format appointment data for display
  const formatAppointmentForDisplay = (appointment) => {
    return {
      id: appointment.id,
      pro: appointment.pro || {
        id: appointment.contractor_id,
        name: 'Professional',
        profession: 'Service Provider',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        rating: 0
      },
      service: appointment.service_category?.name || appointment.service || 'Service',
      date: appointment.appointment_date || appointment.date,
      time: appointment.start_time || appointment.time || '00:00',
      address: appointment.location || appointment.address || 'Address not provided',
      status: appointment.status || 'pending',
      price: parseFloat(appointment.total_cost || appointment.estimated_cost || 0).toFixed(2)
    };
  };

  return {
    loading,
    error,
    appointments,
    stats,
    savedProfessionals,
    paymentMethods,
    fetchDashboardData,
    cancelAppointment,
    toggleSaveProfessional,
    formatAppointmentForDisplay
  };
}

export default useClientDashboard;
