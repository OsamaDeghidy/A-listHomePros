import { useState, useEffect } from 'react';
import { 
  proService, 
  schedulingService,
  paymentService,
  notificationService
} from '../services/api';

export function useProfessionalDashboard() {
  // Auto-fetch dashboard data on first load
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalEarnings: 0,
    averageRating: 0,
    reviewsCount: 0,
    viewsThisMonth: 0,
  });
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const fetchDashboardData = async (appointmentFilter = 'upcoming') => {
    setLoading(true);
    setError(null);
    
    try {
      // Get professional's profile
      const profileResponse = await proService.getProfile('me');
      const proId = profileResponse.data.id;
      const profileData = profileResponse.data;
      
      // Get appointments based on filter
      let appointmentsResponse;
      if (appointmentFilter === 'upcoming') {
        appointmentsResponse = await proService.getUpcomingAppointments();
      } else if (appointmentFilter === 'completed') {
        appointmentsResponse = await schedulingService.getAppointments({ status: 'completed' });
      } else if (appointmentFilter === 'cancelled') {
        appointmentsResponse = await schedulingService.getAppointments({ status: 'cancelled' });
      } else {
        // Get all appointments
        appointmentsResponse = await schedulingService.getAppointments();
      }
      
      // Set appointments with data validation
      const appointmentsData = appointmentsResponse.data.results || [];
      setAppointments(appointmentsData);
      
      // Get services offered by professional
      try {
        const servicesResponse = await proService.getCategories();
        setServices(servicesResponse.data.results || []);
      } catch (serviceError) {
        console.error('Error fetching services:', serviceError);
        setServices([]);
      }
      
      // Get reviews with error handling
      try {
        const reviewsResponse = await proService.getReviews(proId);
        setReviews(reviewsResponse.data.results || []);
      } catch (reviewError) {
        console.error('Error fetching reviews:', reviewError);
        setReviews([]);
      }
      
      // Get notifications/activity with error handling
      try {
        const notificationsResponse = await notificationService.getNotifications();
        const notificationsData = notificationsResponse.data.results || [];
        
        // Map notifications to activity log format
        const formattedActivity = notificationsData.map(notification => ({
          id: notification.id,
          type: notification.notification_type || 'general',
          content: notification.message || notification.content || 'New notification',
          timestamp: notification.created_at || new Date().toISOString(),
        }));
        
        setActivityLog(formattedActivity);
      } catch (notificationError) {
        console.error('Error fetching notifications:', notificationError);
        setActivityLog([]);
      }
      
      // Calculate statistics
      // Get all appointments for statistics
      const allAppointmentsResponse = await schedulingService.getAppointments();
      const allAppointments = allAppointmentsResponse.data.results || [];
      
      const upcomingAppts = allAppointments.filter(
        appt => appt.status === 'confirmed' || appt.status === 'pending'
      );
      
      const completedAppts = allAppointments.filter(
        appt => appt.status === 'completed'
      );
      
      // Get earnings data with error handling
      let totalEarnings = 0;
      try {
        const earningsResponse = await paymentService.getTransactions();
        const transactions = earningsResponse.data.results || [];
        
        totalEarnings = transactions.reduce(
          (total, transaction) => total + (parseFloat(transaction.amount) || 0),
          0
        );
      } catch (earningsError) {
        console.error('Error fetching earnings:', earningsError);
      }
      
      // Update statistics with validated data
      setStats({
        upcomingAppointments: upcomingAppts.length,
        completedAppointments: completedAppts.length,
        totalEarnings,
        averageRating: parseFloat(profileData.average_rating) || 0,
        reviewsCount: profileData.reviews?.length || 0,
        viewsThisMonth: profileData.views_this_month || 0,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('فشل في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.');
      setLoading(false);
    }
  };
  
  // Helper function to convert date formats and handle errors
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      return dateString || 'Date unavailable';
    }
  };

  // Function to update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      // Call the API to update the appointment status
      await proService.updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
      
      // Update stats
      if (newStatus === 'completed') {
        setStats(prevStats => ({
          ...prevStats,
          upcomingAppointments: Math.max(0, prevStats.upcomingAppointments - 1),
          completedAppointments: prevStats.completedAppointments + 1,
        }));
      } else if (newStatus === 'cancelled' && appointments.find(a => a.id === appointmentId)?.status !== 'completed') {
        setStats(prevStats => ({
          ...prevStats,
          upcomingAppointments: Math.max(0, prevStats.upcomingAppointments - 1),
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('فشل في تحديث حالة الموعد. يرجى المحاولة مرة أخرى.');
      return false;
    }
  };

  return { 
    appointments, 
    stats, 
    loading, 
    error, 
    services, 
    reviews, 
    activityLog,
    fetchDashboardData, 
    updateAppointmentStatus 
  };
}

export default useProfessionalDashboard; 