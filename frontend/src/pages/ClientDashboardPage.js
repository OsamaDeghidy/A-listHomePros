import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../hooks/useAuth';
import { FaCalendarAlt, FaClipboardList, FaCreditCard, FaUser, FaEnvelope, FaBell, FaMapMarkerAlt } from 'react-icons/fa';

const ClientDashboardPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
    savedPros: 0,
  });

  // Fetch user appointments and stats
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, this would come from your backend API
        // Simulating API call with timeout
        setTimeout(() => {
          // Mock data
          const upcomingAppointmentsList = [
            {
              id: 1,
              pro: {
                id: 1,
                name: 'John Smith',
                profession: 'Plumber',
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                rating: 4.9
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
              pro: {
                id: 2,
                name: 'Robert Johnson',
                profession: 'Electrician',
                avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
                rating: 4.7
              },
              service: 'Electrical Repairs',
              date: '2023-08-20',
              time: '2:00 PM',
              address: '456 Oak Ave, Anytown',
              status: 'pending',
              price: 95
            }
          ];

          setAppointments(upcomingAppointmentsList);
          setStats({
            upcomingAppointments: 2,
            completedAppointments: 5,
            totalSpent: 750,
            savedPros: 3,
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    // In a real app, this would call your API to cancel the appointment
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // await schedulingService.cancelAppointment(appointmentId);
        // Update local state to reflect cancellation
        setAppointments(appointments.filter(appt => appt.id !== appointmentId));
        setStats({
          ...stats,
          upcomingAppointments: stats.upcomingAppointments - 1
        });
        alert('Appointment cancelled successfully!');
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <defs>
              <linearGradient id="half-star-gradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill="url(#half-star-gradient)" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard | A-List Home Pros</title>
        <meta name="description" content="Manage your appointments, view your bookings, and update your profile" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentUser?.first_name || 'User'}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/booking"
                className="inline-block bg-blue-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Book a Professional
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
                        <FaClipboardList className="mr-3" />
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
                        onClick={() => setActiveTab('payments')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'payments' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaCreditCard className="mr-3" />
                        <span>Payment Methods</span>
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
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'notifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaBell className="mr-3" />
                        <span>Notifications</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('saved')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeTab === 'saved' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaMapMarkerAlt className="mr-3" />
                        <span>Saved Locations</span>
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
                          <p className="text-xl font-semibold">{stats.upcomingAppointments}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-50 text-green-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Completed</p>
                          <p className="text-xl font-semibold">{stats.completedAppointments}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                          <FaCreditCard className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Total Spent</p>
                          <p className="text-xl font-semibold">${stats.totalSpent}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Saved Pros</p>
                          <p className="text-xl font-semibold">{stats.savedPros}</p>
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
                      {appointments.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {appointments.slice(0, 3).map(appointment => (
                            <div 
                              key={appointment.id} 
                              className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between"
                            >
                              <div className="flex items-start mb-3 md:mb-0">
                                <img 
                                  src={appointment.pro.avatar} 
                                  alt={appointment.pro.name}
                                  className="w-12 h-12 rounded-full mr-4" 
                                />
                                <div>
                                  <h3 className="font-medium text-gray-900">{appointment.service}</h3>
                                  <p className="text-sm text-gray-600">with {appointment.pro.name}</p>
                                  <div className="flex items-center mt-1">
                                    <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-500">
                                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center md:flex-col md:items-end">
                                <div className="hidden md:flex md:mb-1">
                                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                    appointment.status === 'confirmed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                  </span>
                                </div>
                                <Link 
                                  to={`/appointments/${appointment.id}`}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3 md:mr-0 md:mb-1"
                                >
                                  Details
                                </Link>
                                <button 
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Cancel
                                </button>
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
                          <Link 
                            to="/search"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Book a Service
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="font-semibold text-gray-800">Quick Actions</h2>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link 
                          to="/search"
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-sm text-center">Find a Pro</span>
                        </Link>
                        <Link 
                          to="/messages"
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <FaEnvelope className="w-6 h-6 text-blue-600 mb-2" />
                          <span className="text-sm text-center">Messages</span>
                        </Link>
                        <Link 
                          to={activeTab === 'profile' ? '#' : '#'}
                          onClick={() => setActiveTab('profile')}
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <FaUser className="w-6 h-6 text-blue-600 mb-2" />
                          <span className="text-sm text-center">Edit Profile</span>
                        </Link>
                        <Link 
                          to="/help"
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-center">Help Center</span>
                        </Link>
                      </div>
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
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Upcoming</button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Completed</button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Cancelled</button>
                      </div>
                    </div>

                    {appointments.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {appointments.map(appointment => (
                          <div 
                            key={appointment.id} 
                            className="py-4 first:pt-0 last:pb-0"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start mb-3 sm:mb-0">
                                <img 
                                  src={appointment.pro.avatar} 
                                  alt={appointment.pro.name}
                                  className="w-16 h-16 rounded-full mr-4" 
                                />
                                <div>
                                  <h3 className="font-medium text-lg text-gray-900">{appointment.service}</h3>
                                  <div className="flex items-center mt-1">
                                    <span className="text-sm text-gray-600 mr-2">with {appointment.pro.name}</span>
                                    <div className="flex">{renderStars(appointment.pro.rating)}</div>
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-500">
                                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                    </span>
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-500">{appointment.address}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="mb-2">
                                  <span className="text-lg font-medium text-gray-900">${appointment.price}</span>
                                </div>
                                <div className="mb-2">
                                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                    appointment.status === 'confirmed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <Link 
                                    to={`/appointments/${appointment.id}`}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                  >
                                    Details
                                  </Link>
                                  <button 
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                    className="px-3 py-1 border border-red-600 text-red-600 text-sm rounded-md hover:bg-red-50"
                                  >
                                    Cancel
                                  </button>
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
                        <p className="text-gray-500 mb-3">You don't have any appointments yet</p>
                        <Link 
                          to="/search"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Book a Service
                        </Link>
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

export default ClientDashboardPage; 