import { useState, useEffect, useCallback } from 'react';
import { 
  proService, 
  schedulingService,
  paymentService,
  notificationService,
  alistProsService
} from '../services/api';

export function useProfessionalDashboard() {
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
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalClients: 0,
  });
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [profileData, setProfileData] = useState(null);

  const fetchDashboardData = useCallback(async (appointmentFilter = 'upcoming') => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching dashboard data...');
      
      // Get professional's profile first
      const profileResponse = await proService.getProfile('me');
      const profile = profileResponse.data;
      
      console.log('✅ Profile data:', profile);
      setProfileData(profile);
      
      let proId = profile.id;
      
      // If profile doesn't have AlistPro data, try to get it separately
      if (!profile.alistpro && profile.user?.id) {
        try {
          const alistProResponse = await alistProsService.getProfiles({ user: profile.user.id });
          if (alistProResponse.data.results && alistProResponse.data.results.length > 0) {
            proId = alistProResponse.data.results[0].id;
            console.log('✅ Found AlistPro ID:', proId);
          }
        } catch (alistProError) {
          console.warn('⚠️ Could not fetch AlistPro profile:', alistProError);
        }
      }
      
      // Fetch all appointments
      const allAppointmentsResponse = await schedulingService.getAppointments();
      const allAppointments = allAppointmentsResponse.data.results || [];
      console.log('✅ All appointments:', allAppointments.length);
      
      // Fetch upcoming appointments
      let upcomingAppointments = [];
      try {
        const upcomingResponse = await schedulingService.getUpcomingAppointments();
        upcomingAppointments = upcomingResponse.data.results || [];
        console.log('✅ Upcoming appointments:', upcomingAppointments.length);
      } catch (upcomingError) {
        console.warn('⚠️ Could not fetch upcoming appointments:', upcomingError);
        // Filter from all appointments as fallback
        upcomingAppointments = allAppointments.filter(
          appt => appt.status === 'confirmed' || appt.status === 'pending'
        );
      }
      
      // Filter appointments based on the requested filter
      let filteredAppointments = allAppointments;
      if (appointmentFilter === 'upcoming') {
        filteredAppointments = upcomingAppointments;
      } else if (appointmentFilter === 'completed') {
        filteredAppointments = allAppointments.filter(appt => appt.status === 'completed');
      } else if (appointmentFilter === 'cancelled') {
        filteredAppointments = allAppointments.filter(appt => appt.status === 'cancelled');
      }
      
      setAppointments(filteredAppointments);
      
      // Fetch services/categories
      try {
        const servicesResponse = await proService.getCategories();
        setServices(servicesResponse.data.results || []);
        console.log('✅ Services fetched:', servicesResponse.data.results?.length || 0);
      } catch (serviceError) {
        console.warn('⚠️ Could not fetch services:', serviceError);
        setServices([]);
      }
      
      // Fetch reviews - try with the professional ID
      try {
        const reviewsResponse = await proService.getReviews(proId);
        setReviews(reviewsResponse.data.results || []);
        console.log('✅ Reviews fetched:', reviewsResponse.data.results?.length || 0);
      } catch (reviewError) {
        console.warn('⚠️ Could not fetch reviews:', reviewError);
        setReviews([]);
      }
      
      // Fetch notifications/activity
      try {
        const notificationsResponse = await notificationService.getNotifications();
        const notificationsData = notificationsResponse.data.results || [];
        
        // Transform notifications to activity log format
        const formattedActivity = notificationsData.map(notification => ({
          id: notification.id,
          type: notification.notification_type || 'general',
          content: notification.message || notification.content || 'New notification',
          timestamp: notification.created_at || new Date().toISOString(),
        }));
        
        setActivityLog(formattedActivity);
        console.log('✅ Activity log fetched:', formattedActivity.length);
      } catch (notificationError) {
        console.warn('⚠️ Could not fetch notifications:', notificationError);
        setActivityLog([]);
      }
      
      // Fetch earnings/transactions
      let totalEarnings = 0;
      let weeklyEarnings = 0;
      let monthlyEarnings = 0;
      
      try {
        const earningsResponse = await paymentService.getTransactions();
        const transactions = earningsResponse.data.results || [];
        
        console.log('✅ Transactions fetched:', transactions.length);
        
        // Calculate earnings
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        totalEarnings = transactions.reduce(
          (total, transaction) => {
            const amount = parseFloat(transaction.amount) || 0;
            return total + (amount > 0 ? amount : 0); // Only count positive amounts
          },
          0
        );
        
        weeklyEarnings = transactions
          .filter(t => new Date(t.created_at) >= weekAgo)
          .reduce((total, transaction) => {
            const amount = parseFloat(transaction.amount) || 0;
            return total + (amount > 0 ? amount : 0);
          }, 0);
          
        monthlyEarnings = transactions
          .filter(t => new Date(t.created_at) >= monthAgo)
          .reduce((total, transaction) => {
            const amount = parseFloat(transaction.amount) || 0;
            return total + (amount > 0 ? amount : 0);
          }, 0);
          
        console.log('💰 Earnings calculated:', { total: totalEarnings, weekly: weeklyEarnings, monthly: monthlyEarnings });
      } catch (earningsError) {
        console.warn('⚠️ Could not fetch earnings:', earningsError);
      }
      
      // Calculate statistics
      const completedAppts = allAppointments.filter(appt => appt.status === 'completed');
      const upcomingAppts = allAppointments.filter(
        appt => appt.status === 'confirmed' || appt.status === 'pending'
      );
      
      // Calculate unique clients
      const uniqueClients = new Set(
        allAppointments
          .map(appt => appt.client?.id || appt.client?.user?.id)
          .filter(Boolean)
      ).size;
      
      // Get profile rating and review data
      const averageRating = parseFloat(profile.average_rating || profile.rating) || 0;
      const reviewsCount = parseInt(profile.review_count || profile.reviews?.length) || 0;
      const viewsThisMonth = parseInt(profile.views_this_month || profile.views) || 0;
      
      const calculatedStats = {
        upcomingAppointments: upcomingAppts.length,
        completedAppointments: completedAppts.length,
        totalEarnings,
        weeklyEarnings,
        monthlyEarnings,
        averageRating,
        reviewsCount,
        viewsThisMonth,
        totalClients: uniqueClients,
      };
      
      setStats(calculatedStats);
      console.log('📊 Stats calculated:', calculatedStats);
      
      setLoading(false);
      console.log('✅ Dashboard data fetch completed successfully');
      
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError('فشل في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.');
      setLoading(false);
    }
  }, []);
  
  // Helper function to convert date formats and handle errors
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      return dateString || 'Date unavailable';
    }
  };

  // Function to update appointment status
  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      console.log(`🔄 Updating appointment ${appointmentId} to status: ${newStatus}`);
      
      // Call the API to update the appointment status
      await proService.updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state immediately for better UX
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
      
      // Update stats based on the new status
      setStats(prevStats => {
        const newStats = { ...prevStats };
        
        if (newStatus === 'completed') {
          newStats.upcomingAppointments = Math.max(0, prevStats.upcomingAppointments - 1);
          newStats.completedAppointments = prevStats.completedAppointments + 1;
        } else if (newStatus === 'cancelled') {
          const currentAppt = appointments.find(a => a.id === appointmentId);
          if (currentAppt?.status !== 'completed') {
            newStats.upcomingAppointments = Math.max(0, prevStats.upcomingAppointments - 1);
          }
        } else if (newStatus === 'confirmed' || newStatus === 'pending') {
          const currentAppt = appointments.find(a => a.id === appointmentId);
          if (currentAppt?.status === 'completed') {
            newStats.completedAppointments = Math.max(0, prevStats.completedAppointments - 1);
            newStats.upcomingAppointments = prevStats.upcomingAppointments + 1;
          }
        }
        
        return newStats;
      });
      
      console.log('✅ Appointment status updated successfully');
      return true;
    } catch (err) {
      console.error('❌ Error updating appointment status:', err);
      setError('فشل في تحديث حالة الموعد. يرجى المحاولة مرة أخرى.');
      return false;
    }
  }, [appointments]);

  // Function to refresh a specific data section
  const refreshData = useCallback(async (section = 'all') => {
    try {
      setError(null);
      
      if (section === 'appointments' || section === 'all') {
        const appointmentsResponse = await schedulingService.getAppointments();
        setAppointments(appointmentsResponse.data.results || []);
      }
      
      if (section === 'notifications' || section === 'all') {
        const notificationsResponse = await notificationService.getNotifications();
        const notificationsData = notificationsResponse.data.results || [];
        const formattedActivity = notificationsData.map(notification => ({
          id: notification.id,
          type: notification.notification_type || 'general',
          content: notification.message || notification.content || 'New notification',
          timestamp: notification.created_at || new Date().toISOString(),
        }));
        setActivityLog(formattedActivity);
      }
      
      if (section === 'earnings' || section === 'all') {
        const earningsResponse = await paymentService.getTransactions();
        const transactions = earningsResponse.data.results || [];
        
        // Recalculate earnings
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const totalEarnings = transactions.reduce((total, transaction) => {
          const amount = parseFloat(transaction.amount) || 0;
          return total + (amount > 0 ? amount : 0);
        }, 0);
        
        const weeklyEarnings = transactions
          .filter(t => new Date(t.created_at) >= weekAgo)
          .reduce((total, transaction) => {
            const amount = parseFloat(transaction.amount) || 0;
            return total + (amount > 0 ? amount : 0);
          }, 0);
          
        const monthlyEarnings = transactions
          .filter(t => new Date(t.created_at) >= monthAgo)
          .reduce((total, transaction) => {
            const amount = parseFloat(transaction.amount) || 0;
            return total + (amount > 0 ? amount : 0);
          }, 0);
        
        setStats(prevStats => ({
          ...prevStats,
          totalEarnings,
          weeklyEarnings,
          monthlyEarnings,
        }));
      }
      
      console.log(`✅ Refreshed ${section} data successfully`);
    } catch (err) {
      console.error(`❌ Error refreshing ${section} data:`, err);
    }
  }, []);

  return { 
    appointments, 
    stats, 
    loading, 
    error, 
    services, 
    reviews, 
    activityLog,
    profileData,
    fetchDashboardData, 
    updateAppointmentStatus,
    refreshData,
    formatDate
  };
}

export default useProfessionalDashboard; 