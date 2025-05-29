import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../hooks/useAuth';
import { useProfessionalDashboard } from '../hooks/useProfessionalDashboard';
import { useLanguage } from '../hooks/useLanguage';
import { proService } from '../services/api';
import { FaCalendarAlt, FaClipboardList, FaCreditCard, FaUser, FaEnvelope, FaBell, FaClock, FaStar, FaCog, FaChartLine, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

const ProDashboardPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { 
    appointments, 
    stats, 
    loading, 
    error: dashboardError, 
    activityLog,
    fetchDashboardData, 
    updateAppointmentStatus 
  } = useProfessionalDashboard();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [proData, setProData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch professional's dashboard data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load dashboard data when component mounts
    fetchDashboardData();

    // Set up auto-refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // Clear interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, navigate, fetchDashboardData]);

  // Handle appointment status change
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      // Refresh dashboard data after status change
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      // You could add a toast notification here
    }
  };

  useEffect(() => {
    // Fetch the professional's data from the backend
    const fetchProData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profile data from API
        const profileResponse = await proService.getProfile('me');
        const userProfile = profileResponse.data;
        
        // Fetch upcoming appointments
        const appointmentsResponse = await proService.getUpcomingAppointments();
        const upcomingApptsCount = appointmentsResponse.data.results.length;
        
        // Fetch completed appointments
        const allAppointmentsResponse = await proService.getAppointments();
        const completedAppts = allAppointmentsResponse.data.results.filter(a => a.status === 'completed');
        
        // Fetch earnings data
        const earningsResponse = await proService.getTransactions();
        const earnings = earningsResponse.data.results || [];
        
        const totalEarnings = earnings.reduce((total, transaction) => {
          return total + (parseFloat(transaction.amount) || 0);
        }, 0);
        
        // Get recent appointments
        const recentJobs = allAppointmentsResponse.data.results
          .slice(0, 3)
          .map(apt => ({
            id: apt.id,
            client: apt.client?.name || 'Client',
            service: apt.service_category?.name || 'Service',
            date: apt.appointment_date,
            amount: parseFloat(apt.estimated_cost) || 0,
            status: apt.status
          }));
        
        // Fetch availability data
        const availabilityResponse = await proService.getAvailabilitySlots();
        const availabilityData = availabilityResponse.data.results || [];
        
        // Format availability data
        const dayMap = {
          0: 'Sunday',
          1: 'Monday',
          2: 'Tuesday',
          3: 'Wednesday',
          4: 'Thursday',
          5: 'Friday',
          6: 'Saturday'
        };
        
        const availability = Object.entries(dayMap).map(([dayNum, dayName]) => {
          const daySlots = availabilityData
            .filter(slot => slot.day_of_week === parseInt(dayNum))
            .map(slot => `${slot.start_time} - ${slot.end_time}`);
          
          return {
            day: dayName,
            slots: daySlots
          };
        });
        
        // Set the profile data
        setProData({
          id: userProfile.id,
          name: userProfile.user?.name || 'Professional',
          profession: userProfile.profession || userProfile.business_name || 'Service Provider',
          avatar: userProfile.profile_image || 'https://randomuser.me/api/portraits/men/32.jpg',
          rating: userProfile.average_rating ? parseFloat(userProfile.average_rating) : 0,
          reviewsCount: userProfile.reviews?.length || 0,
          completedJobs: completedAppts.length,
          upcomingAppointments: upcomingApptsCount,
          earnings: {
            // These are simplified - in a real app you'd calculate these from transaction history
            week: totalEarnings * 0.2, // Example: 20% of total earnings in current week
            month: totalEarnings * 0.8, // Example: 80% of total earnings in current month
            total: totalEarnings
          },
          recentJobs,
          availability,
          // Add appointments directly to proData for easy access
          appointments: allAppointmentsResponse.data.results || []
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching professional data:', err);
        setError('Failed to load professional data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchProData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{dashboardError}</p>
        </div>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  // Function to format relative time for activity feed
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  // Function to get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment_completed':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'new_appointment':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <FaCalendarAlt className="w-4 h-4" />
          </div>
        );
      case 'new_review':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
            <FaStar className="w-4 h-4" />
          </div>
        );
      case 'payment_received':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
            <FaCreditCard className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <FaBell className="w-4 h-4" />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="mt-2">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Only render the rest if we have professional data
  if (!proData) return null;

  return (
    <>
      <Helmet>
        <title>Professional Dashboard | A-List Home Pros</title>
        <meta name="description" content="Manage your professional profile, appointments, and availability" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Professional Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentUser?.first_name || 'Professional'}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link 
                to="/pro-profile/edit"
                className="inline-block bg-white border border-gray-300 text-gray-700 font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition duration-300"
              >
                Edit Profile
              </Link>
              <Link 
                to="/pro-availability"
                className="inline-block bg-blue-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Set Availability
              </Link>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                  <h2 className="font-semibold text-blue-800">Dashboard Menu</h2>
                </div>
                <nav className="p-2">
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaChartLine className="mr-3" />
                        <span>Overview</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'appointments' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaCalendarAlt className="mr-3" />
                        <span>Appointments</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('services')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'services' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaClipboardList className="mr-3" />
                        <span>Services</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('availability')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'availability' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaClock className="mr-3" />
                        <span>Availability</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('earnings')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'earnings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaCreditCard className="mr-3" />
                        <span>Earnings</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'reviews' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaStar className="mr-3" />
                        <span>Reviews</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('messages')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'messages' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaEnvelope className="mr-3" />
                        <span>Messages</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaUser className="mr-3" />
                        <span>Profile</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaCog className="mr-3" />
                        <span>Settings</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                          <FaCalendarAlt className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Upcoming</p>
                          <p className="text-xl font-semibold">{stats?.upcomingAppointments || proData.upcomingAppointments || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-50 text-green-600">
                          <FaCheck className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Completed</p>
                          <p className="text-xl font-semibold">{stats?.completedAppointments || proData.completedJobs || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                          <FaCreditCard className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Earnings</p>
                          <p className="text-xl font-semibold">${stats?.totalEarnings?.toFixed(2) || proData.earnings?.total?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                          <FaStar className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Rating</p>
                          <div className="flex items-center">
                            <p className="text-xl font-semibold mr-2">{stats?.averageRating || proData.rating || '0.0'}</p>
                            <span className="text-sm text-gray-500">({stats?.reviewsCount || proData.reviewsCount || 0})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                          <FaUser className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Profile Views</p>
                          <p className="text-xl font-semibold">{stats?.viewsThisMonth || '0'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Appointments */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
                      <button 
                        onClick={() => setActiveTab('appointments')} 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <div className="p-4">
                      {appointments && appointments.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {appointments.map(appointment => (
                            <div 
                              key={appointment.id} 
                              className="py-4 first:pt-0 last:pb-0"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start mb-3 sm:mb-0">
                                  <img 
                                    src={appointment.client?.profile_image || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                                    alt={appointment.client?.name || 'Client'}
                                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                    }}
                                  />
                                  <div>
                                    <h3 className="font-medium text-gray-900">{appointment.service_category?.name || 'Service'}</h3>
                                    <p className="text-sm text-gray-600">with {appointment.client?.name || 'Client'}</p>
                                    <div className="flex items-center mt-1">
                                      <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-1" />
                                      <span className="text-sm text-gray-500">
                                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.start_time || 'TBD'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mr-3 ${
                                    appointment.status === 'confirmed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : appointment.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : appointment.status === 'completed'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </span>
                                  <div className="flex flex-col space-y-2">
                                    <Link 
                                      to={`/appointments/${appointment.id}`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      Details
                                    </Link>
                                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                      <button 
                                        onClick={() => handleStatusChange(appointment.id, 'completed')}
                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                      >
                                        Complete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 mb-3">No upcoming appointments</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="font-semibold text-gray-800">Recent Activity</h2>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-4">
                        {activityLog.length > 0 ? (
                          activityLog.map(activity => (
                            <li key={activity.id} className="flex">
                              <div className="flex-shrink-0">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-gray-700">{activity.content}</p>
                                <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="text-center py-4">
                            <p className="text-gray-500">No recent activity</p>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-800">My Appointments</h2>
                  </div>
                  <div className="p-4">
                      <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => fetchDashboardData('upcoming')} 
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Upcoming
                        </button>
                        <button 
                          onClick={() => fetchDashboardData('completed')} 
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Completed
                        </button>
                        <button 
                          onClick={() => fetchDashboardData('cancelled')} 
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Cancelled
                        </button>
                        <button 
                          onClick={() => fetchDashboardData('all')} 
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          All Appointments
                        </button>
                      </div>
                    </div>

                    {appointments && appointments.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {appointments.map(appointment => (
                          <div 
                            key={appointment.id} 
                            className="py-4 first:pt-0 last:pb-0"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start mb-3 sm:mb-0">
                                <img 
                                  src={appointment.client?.profile_image || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                                  alt={appointment.client?.name || 'Client'}
                                  className="w-16 h-16 rounded-full mr-4 object-cover" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                  }}
                                />
                                <div>
                                  <h3 className="font-medium text-lg text-gray-900">{appointment.service_category?.name || 'Service'}</h3>
                                  <p className="text-sm text-gray-600">Client: {appointment.client?.name || 'Client'}</p>
                                  <div className="flex items-center mt-1">
                                    <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-500">
                                      {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.start_time || 'TBD'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{appointment.location || 'Location not specified'}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="mb-2">
                                  <span className="text-lg font-medium text-gray-900">${appointment.estimated_cost || '0.00'}</span>
                                </div>
                                <div className="mb-2">
                                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                    appointment.status === 'confirmed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : appointment.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : appointment.status === 'completed'
                                          ? 'bg-blue-100 text-blue-800'
                                          : appointment.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <Link 
                                    to={`/appointments/${appointment.id}`}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                  >
                                    Details
                                  </Link>
                                  {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                    <button 
                                      onClick={() => handleStatusChange(appointment.id, 'completed')}
                                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                    >
                                      Complete
                                    </button>
                                  )}
                                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                    <button 
                                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 mb-3">No upcoming appointments</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other tabs would be rendered here */}
              
              {activeTab !== 'overview' && activeTab !== 'appointments' && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500 mb-3">This feature is coming soon!</p>
                  <p className="text-sm text-gray-400">We're currently working on implementing the {activeTab} feature.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProDashboardPage; 