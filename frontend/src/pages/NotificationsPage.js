import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaBell, FaCalendarAlt, FaComment, FaMoneyBillWave, FaUser, FaSearch, FaCheck, FaTrashAlt, FaCheckDouble } from 'react-icons/fa';
import { notificationsService } from '../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  useEffect(() => {
    filterNotifications();
  }, [notifications, activeFilter, searchQuery]);
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsService.getNotifications();
      
      // For demo, if API fails or isn't set up yet
      if (!response || !response.data) {
        setNotifications(getMockNotifications());
      } else {
        setNotifications(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications(getMockNotifications());
      setError('Could not load notifications. Using sample data instead.');
    } finally {
      setLoading(false);
    }
  };
  
  const filterNotifications = () => {
    let filtered = [...notifications];
    
    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(query) || 
        notification.message.toLowerCase().includes(query)
      );
    }
    
    setFilteredNotifications(filtered);
    
    // Reset selection when filter changes
    setSelectedNotifications([]);
    setSelectAll(false);
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
    setSelectAll(!selectAll);
  };
  
  const markAsRead = async (ids) => {
    try {
      if (ids.length === 1) {
        await notificationsService.markAsRead(ids[0]);
      } else if (ids.length > 1) {
        await notificationsService.markAllAsRead();
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification.id) 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Clear selection
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      // Fall back to local update if API fails
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification.id) 
            ? { ...notification, read: true } 
            : notification
        )
      );
    }
  };
  
  const deleteNotifications = (ids) => {
    // In a real application, you would call an API to delete
    setNotifications(prev => 
      prev.filter(notification => !ids.includes(notification.id))
    );
    
    // Clear selection
    setSelectedNotifications([]);
    setSelectAll(false);
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'message':
        return <FaComment className="text-green-500" />;
      case 'payment':
        return <FaMoneyBillWave className="text-yellow-600" />;
      case 'system':
        return <FaBell className="text-purple-500" />;
      case 'user':
        return <FaUser className="text-red-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notifTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const options = { month: 'short', day: 'numeric' };
    return notifTime.toLocaleDateString(undefined, options);
  };
  
  const getMockNotifications = () => {
    return [
      {
        id: 1,
        type: 'appointment',
        title: 'Appointment Confirmed',
        message: 'Your appointment with John Smith (Plumber) on July 10 at 2:00 PM has been confirmed.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        actionUrl: '/appointments/123'
      },
      {
        id: 2,
        type: 'message',
        title: 'New Message',
        message: 'Sarah Johnson: "I wanted to confirm our appointment tomorrow. Looking forward to it!"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
        actionUrl: '/messages/456'
      },
      {
        id: 3,
        type: 'payment',
        title: 'Payment Successful',
        message: 'Your payment of $120.00 for plumbing services has been processed successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
        actionUrl: '/payments/789'
      },
      {
        id: 4,
        type: 'system',
        title: 'Account Updated',
        message: 'Your account information has been updated successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        read: true,
        actionUrl: '/settings'
      },
      {
        id: 5,
        type: 'appointment',
        title: 'Appointment Reminder',
        message: 'Reminder: You have an appointment with Michael Davis (Electrician) tomorrow at 10:00 AM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        read: false,
        actionUrl: '/appointments/234'
      },
      {
        id: 6,
        type: 'user',
        title: 'Review Request',
        message: 'Please take a moment to review your recent experience with Robert Johnson (Painter).',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        read: true,
        actionUrl: '/reviews/new/345'
      },
      {
        id: 7,
        type: 'system',
        title: 'Password Changed',
        message: 'Your account password was recently changed. If you did not make this change, please contact support.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        read: true,
        actionUrl: '/settings/security'
      },
      {
        id: 8,
        type: 'payment',
        title: 'Invoice Available',
        message: 'A new invoice for your recent service is now available. Please review and process payment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        read: false,
        actionUrl: '/invoices/567'
      },
      {
        id: 9,
        type: 'message',
        title: 'Message from Support',
        message: 'Support Team: "Thank you for reaching out. We have resolved your issue with scheduling."',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        read: true,
        actionUrl: '/messages/678'
      },
      {
        id: 10,
        type: 'appointment',
        title: 'Appointment Rescheduled',
        message: 'Your appointment with Emily Wilson (House Cleaner) has been rescheduled to July 15 at 1:00 PM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        read: false,
        actionUrl: '/appointments/789'
      }
    ];
  };
  
  const NotificationItem = ({ notification, isSelected, onSelect }) => (
    <div 
      className={`
        border-b last:border-b-0 p-4 hover:bg-gray-50 transition-colors
        ${notification.read ? 'bg-white' : 'bg-blue-50'} 
        ${isSelected ? 'bg-blue-100 hover:bg-blue-100' : ''}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1">
          <input 
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(notification.id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex-shrink-0 mr-3 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-grow min-w-0">
          <Link to={notification.actionUrl} className="block">
            <div className="flex justify-between items-start">
              <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
                {notification.title}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {formatTimeAgo(notification.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <Helmet>
        <title>Notifications | A-List Home Pros</title>
        <meta name="description" content="View and manage your notifications from A-List Home Pros" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600 mt-1">
                View and manage all your notifications
              </p>
            </div>
            
            <div className="w-full sm:w-auto relative">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search notifications"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-60 focus:border-blue-500 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Sidebar filters */}
            <div className="md:border-r border-gray-200 bg-gray-50 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Filter by Type
              </h2>
              
              <nav className="space-y-1">
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                    activeFilter === 'all'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleFilterChange('all')}
                >
                  <FaBell className="mr-3 text-gray-500" />
                  <span className="truncate">All Notifications</span>
                  <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2.5 py-0.5 text-xs">
                    {notifications.length}
                  </span>
                </button>
                
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                    activeFilter === 'appointment'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleFilterChange('appointment')}
                >
                  <FaCalendarAlt className="mr-3 text-blue-500" />
                  <span className="truncate">Appointments</span>
                  <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2.5 py-0.5 text-xs">
                    {notifications.filter(n => n.type === 'appointment').length}
                  </span>
                </button>
                
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                    activeFilter === 'message'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleFilterChange('message')}
                >
                  <FaComment className="mr-3 text-green-500" />
                  <span className="truncate">Messages</span>
                  <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2.5 py-0.5 text-xs">
                    {notifications.filter(n => n.type === 'message').length}
                  </span>
                </button>
                
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                    activeFilter === 'payment'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleFilterChange('payment')}
                >
                  <FaMoneyBillWave className="mr-3 text-yellow-600" />
                  <span className="truncate">Payments</span>
                  <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2.5 py-0.5 text-xs">
                    {notifications.filter(n => n.type === 'payment').length}
                  </span>
                </button>
                
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                    activeFilter === 'system'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleFilterChange('system')}
                >
                  <FaBell className="mr-3 text-purple-500" />
                  <span className="truncate">System</span>
                  <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2.5 py-0.5 text-xs">
                    {notifications.filter(n => n.type === 'system').length}
                  </span>
                </button>
                
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                    activeFilter === 'user'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleFilterChange('user')}
                >
                  <FaUser className="mr-3 text-red-500" />
                  <span className="truncate">User</span>
                  <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2.5 py-0.5 text-xs">
                    {notifications.filter(n => n.type === 'user').length}
                  </span>
                </button>
              </nav>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Status
                </h2>
                
                <nav className="space-y-1">
                  <button
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left text-gray-600 hover:bg-gray-100"
                    onClick={() => handleFilterChange('unread')}
                  >
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <span className="truncate">Unread</span>
                    <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2.5 py-0.5 text-xs">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Notifications list */}
            <div className="md:col-span-3">
              {/* Actions */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length > 0 && (
                      <span>{selectedNotifications.length} selected</span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedNotifications.length > 0 && (
                    <>
                      <button
                        onClick={() => markAsRead(selectedNotifications)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaCheck className="mr-1" /> Mark Read
                      </button>
                      <button
                        onClick={() => deleteNotifications(selectedNotifications)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaTrashAlt className="mr-1" /> Delete
                      </button>
                    </>
                  )}
                  
                  {!selectAll && notifications.some(n => !n.read) && (
                    <button
                      onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaCheckDouble className="mr-1" /> Mark All Read
                    </button>
                  )}
                </div>
              </div>
              
              {/* Notifications */}
              <div className="overflow-y-auto max-h-[calc(100vh-260px)]">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FaBell className="text-gray-300 text-4xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications found</h3>
                    <p className="text-sm text-gray-500">
                      {searchQuery 
                        ? "Try adjusting your search or filter to find what you're looking for."
                        : activeFilter !== 'all'
                          ? 'No notifications in this category.'
                          : "You don't have any notifications yet."}
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(notification.id)}
                        onSelect={handleSelectNotification}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage; 