import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaComment, FaCog, FaUserCircle, FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const ActivityHistoryPage = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    dateRange: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchActivityHistory();
  }, []);
  
  useEffect(() => {
    filterActivities();
  }, [activities, activeFilters, searchQuery]);
  
  const fetchActivityHistory = async () => {
    setLoading(true);
    try {
      // In a real application, this would be an API call
      // const response = await api.get('/user/activity-history');
      // setActivities(response.data);
      
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setActivities(getMockActivityData());
        setError(null);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching activity history:', err);
      setError('Failed to load activity history. Please try again later.');
      setLoading(false);
    }
  };
  
  const filterActivities = () => {
    let filtered = [...activities];
    
    // Apply type filter
    if (activeFilters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === activeFilters.type);
    }
    
    // Apply date range filter
    const now = new Date();
    let fromDate;
    
    switch (activeFilters.dateRange) {
      case 'today':
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
        break;
      case 'week':
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 7);
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
        break;
      case 'month':
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 1);
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
        break;
      case 'year':
        fromDate = new Date(now);
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
        break;
      default:
        // 'all' - no date filtering
        break;
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(query) || 
        activity.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredActivities(filtered);
  };
  
  const handleTypeFilterChange = (type) => {
    setActiveFilters(prev => ({ ...prev, type }));
  };
  
  const handleDateRangeFilterChange = (dateRange) => {
    setActiveFilters(prev => ({ ...prev, dateRange }));
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  const resetFilters = () => {
    setActiveFilters({
      type: 'all',
      dateRange: 'all',
    });
    setSearchQuery('');
  };
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'payment':
        return <FaMoneyBillWave className="text-green-500" />;
      case 'message':
        return <FaComment className="text-purple-500" />;
      case 'settings':
        return <FaCog className="text-gray-500" />;
      case 'account':
        return <FaUserCircle className="text-yellow-600" />;
      default:
        return <FaUserCircle className="text-gray-500" />;
    }
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  const groupActivitiesByDate = (activities) => {
    const grouped = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dateString = new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      }).format(date);
      
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      
      grouped[dateString].push(activity);
    });
    
    // Sort each group by timestamp (newest first)
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });
    
    return grouped;
  };
  
  const getMockActivityData = () => {
    const now = new Date();
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const lastWeek = new Date(now); lastWeek.setDate(lastWeek.getDate() - 6);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const lastMonth = new Date(now); lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return [
      {
        id: 1,
        type: 'appointment',
        title: 'Appointment Booked',
        description: 'You booked an appointment with John Smith (Plumber) for July 15, 2023 at 2:00 PM.',
        timestamp: now.toISOString(),
        link: '/dashboard/appointments/123'
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment Made',
        description: 'You made a payment of $150.00 for plumbing services.',
        timestamp: yesterday.toISOString(),
        link: '/dashboard/payments/456'
      },
      {
        id: 3,
        type: 'message',
        title: 'Message Sent',
        description: 'You sent a message to Sarah Johnson: "Looking forward to our appointment tomorrow!"',
        timestamp: yesterday.toISOString(),
        link: '/dashboard/messages/789'
      },
      {
        id: 4,
        type: 'settings',
        title: 'Password Changed',
        description: 'You changed your account password.',
        timestamp: twoDaysAgo.toISOString(),
        link: '/dashboard/settings/security'
      },
      {
        id: 5,
        type: 'appointment',
        title: 'Appointment Completed',
        description: 'Your appointment with Michael Davis (Electrician) was marked as completed.',
        timestamp: twoDaysAgo.toISOString(),
        link: '/dashboard/appointments/234'
      },
      {
        id: 6,
        type: 'account',
        title: 'Profile Updated',
        description: 'You updated your profile information.',
        timestamp: lastWeek.toISOString(),
        link: '/dashboard/profile'
      },
      {
        id: 7,
        type: 'payment',
        title: 'Payment Method Added',
        description: 'You added a new payment method: Visa ending in 4242.',
        timestamp: lastWeek.toISOString(),
        link: '/dashboard/settings/payment-methods'
      },
      {
        id: 8,
        type: 'message',
        title: 'Message Received',
        description: 'You received a message from Robert Johnson: "Your appointment has been confirmed for next week."',
        timestamp: twoWeeksAgo.toISOString(),
        link: '/dashboard/messages/567'
      },
      {
        id: 9,
        type: 'appointment',
        title: 'Appointment Rescheduled',
        description: 'You rescheduled your appointment with Emily Wilson from July 5 to July 10.',
        timestamp: twoWeeksAgo.toISOString(),
        link: '/dashboard/appointments/345'
      },
      {
        id: 10,
        type: 'account',
        title: 'Account Created',
        description: 'You created your A-List Home Pros account.',
        timestamp: lastMonth.toISOString(),
        link: '/dashboard/profile'
      }
    ];
  };
  
  const ActivityItem = ({ activity }) => (
    <div className="relative pb-6">
      {/* Timeline line */}
      <div className="absolute top-0 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
      
      <div className="relative flex items-start space-x-3">
        {/* Icon */}
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
            {getActivityIcon(activity.type)}
          </div>
        </div>
        
        {/* Content */}
        <div className="min-w-0 flex-1 py-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
              <time className="text-xs text-gray-500">{formatDate(activity.timestamp)}</time>
            </div>
            <p className="text-sm text-gray-600">{activity.description}</p>
            
            {activity.link && (
              <div className="mt-2">
                <Link 
                  to={activity.link} 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  const groupedActivities = groupActivitiesByDate(filteredActivities);
  
  return (
    <>
      <Helmet>
        <title>Activity History | A-List Home Pros</title>
        <meta name="description" content="View and manage your activity history on A-List Home Pros" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-4 sm:px-6 sm:flex sm:justify-between sm:items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Activity History</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track your recent activities and interactions on the platform
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search activities"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={toggleFilters}
              >
                <FaFilter className="mr-2 text-gray-500" />
                Filter
              </button>
              
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSortAmountDown className="mr-2 text-gray-500" />
                Sort
              </button>
            </div>
          </div>
          
          {/* Filters Panel (collapsible) */}
          {showFilters && (
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={activeFilters.type}
                    onChange={(e) => handleTypeFilterChange(e.target.value)}
                  >
                    <option value="all">All Activities</option>
                    <option value="appointment">Appointments</option>
                    <option value="payment">Payments</option>
                    <option value="message">Messages</option>
                    <option value="settings">Settings</option>
                    <option value="account">Account</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={activeFilters.dateRange}
                    onChange={(e) => handleDateRangeFilterChange(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Activity Timeline */}
          <div className="px-4 sm:px-6 py-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <FaUserCircle className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || activeFilters.type !== 'all' || activeFilters.dateRange !== 'all'
                    ? "No activities match your current filters. Try adjusting your search or filters."
                    : "You don't have any activity history yet."}
                </p>
              </div>
            ) : (
              <div>
                {Object.entries(groupedActivities).map(([date, activities]) => (
                  <div key={date} className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-900 bg-gray-100 px-4 py-2 rounded-md mb-4">
                      {date}
                    </h2>
                    <div className="flow-root pl-2">
                      <ul className="-mb-8">
                        {activities.map((activity) => (
                          <li key={activity.id}>
                            <ActivityItem activity={activity} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {!loading && filteredActivities.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredActivities.length}</span> of{' '}
                    <span className="font-medium">{filteredActivities.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      aria-current="page"
                      className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityHistoryPage; 