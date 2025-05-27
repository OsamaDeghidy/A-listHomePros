import { useState } from 'react';
import { 
  proService, 
  bookingService, 
  paymentService,
  notificationService
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
  });
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a production app, these would be real API calls
      // For now, we're making individual calls and combining the data
      
      // Get professional's profile
      const profileResponse = await proService.getProfile('me');
      const proId = profileResponse.data.id;
      
      // Get appointments
      const appointmentsResponse = await bookingService.getBookings();
      setAppointments(appointmentsResponse.data.results);
      
      // Get services offered by professional
      const servicesResponse = await proService.getCategories();
      setServices(servicesResponse.data.results);
      
      // Get reviews
      const reviewsResponse = await proService.getReviews(proId);
      setReviews(reviewsResponse.data.results);
      
      // Get notifications/activity
      const notificationsResponse = await notificationService.getNotifications();
      setActivityLog(notificationsResponse.data.results);
      
      // Calculate statistics
      const upcomingAppts = appointmentsResponse.data.results.filter(
        appt => appt.status === 'confirmed' || appt.status === 'pending'
      );
      const completedAppts = appointmentsResponse.data.results.filter(
        appt => appt.status === 'completed'
      );
      
      // Get earnings data
      const earningsResponse = await paymentService.getTransactions();
      const totalEarnings = earningsResponse.data.results.reduce(
        (total, transaction) => total + transaction.amount,
        0
      );
      
      setStats({
        upcomingAppointments: upcomingAppts.length,
        completedAppointments: completedAppts.length,
        totalEarnings,
        averageRating: profileResponse.data.rating,
        reviewsCount: reviewsResponse.data.count,
        viewsThisMonth: profileResponse.data.views_this_month || 0,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Fallback to mock data in case of error (can be removed in production)
      fetchMockData();
      
      setError('Could not connect to server. Showing demo data instead.');
    }
  };
  
  // Fallback mock data function (for development or when API is unavailable)
  const fetchMockData = () => {
    // Mock appointments data
    const mockAppointments = [
      {
        id: 1,
        client: {
          id: 1,
          name: 'Sarah Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
        },
        service: 'Pipe Repair',
        date: '2023-08-15',
        time: '10:00 AM',
        address: '123 Main St, Anytown',
        status: 'confirmed',
        price: 120
      },
      {
        id: 2,
        client: {
          id: 2,
          name: 'Michael Thompson',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        },
        service: 'Drain Cleaning',
        date: '2023-08-20',
        time: '2:00 PM',
        address: '456 Oak Ave, Anytown',
        status: 'pending',
        price: 95
      },
      {
        id: 3,
        client: {
          id: 3,
          name: 'Emily Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        },
        service: 'Fixture Installation',
        date: '2023-08-22',
        time: '11:30 AM',
        address: '789 Pine St, Anytown',
        status: 'confirmed',
        price: 150
      }
    ];
    
    setAppointments(mockAppointments);
    
    // Mock statistics
    setStats({
      upcomingAppointments: 3,
      completedAppointments: 27,
      totalEarnings: 3450,
      averageRating: 4.8,
      reviewsCount: 42,
      viewsThisMonth: 156,
    });
    
    // Mock activity log
    setActivityLog([
      {
        id: 1,
        type: 'appointment_completed',
        content: 'You completed an appointment with David Miller',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        type: 'new_appointment',
        content: 'New appointment scheduled with Sarah Wilson',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        type: 'new_review',
        content: 'You received a 5-star review from Michael Brown',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        type: 'payment_received',
        content: 'Payment of $150 received for Fixture Installation',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]);
    
    setLoading(false);
  };

  // Function to update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      // In a real app, this would call the API
      await bookingService.updateBooking(appointmentId, { status: newStatus });
      
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
          upcomingAppointments: prevStats.upcomingAppointments - 1,
          completedAppointments: prevStats.completedAppointments + 1,
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error updating appointment status:', err);
      
      // Fallback for development: update state even if API fails
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
      
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