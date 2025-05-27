import React, { useState, useEffect } from 'react';
import { FaGoogle, FaCalendarAlt, FaCheck, FaExclamationTriangle, FaSync, FaUnlink } from 'react-icons/fa';
import { useSchedulingService } from '../../hooks/useSchedulingService';

const CalendarSyncWidget = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
  const [error, setError] = useState(null);
  const { syncCalendar, loading } = useSchedulingService();

  // Check if the user has already connected their Google Calendar
  useEffect(() => {
    const checkCalendarConnection = async () => {
      try {
        // In a real implementation, this would be an API call
        // For demo purposes, we'll simulate the response
        const connected = localStorage.getItem('calendarConnected') === 'true';
        const lastSync = localStorage.getItem('lastCalendarSync');
        
        setIsConnected(connected);
        if (lastSync) {
          setLastSyncTime(new Date(lastSync));
        }
      } catch (err) {
        console.error('Error checking calendar connection:', err);
        setError('Failed to check calendar connection status');
      }
    };
    
    checkCalendarConnection();
  }, []);

  // Format the last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    // If synced within the last 24 hours, show 'Today at HH:MM AM/PM'
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    if (lastSyncTime > yesterday) {
      return `Today at ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show the date
    return lastSyncTime.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initiate Google Calendar OAuth flow
  const handleConnectCalendar = () => {
    // In a real app, we would redirect to Google OAuth
    // For demo, we'll simulate the process
    
    // 1. Get the OAuth URL from our backend
    // const authUrl = 'https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=https://www.googleapis.com/auth/calendar&response_type=code';
    
    // 2. Open the OAuth URL in a new window
    // window.open(authUrl, '_blank', 'width=800,height=600');
    
    // For demo purposes, we'll simulate a successful connection
    setTimeout(() => {
      setIsConnected(true);
      setLastSyncTime(new Date());
      setSyncStatus('success');
      
      // Save to localStorage for persistence in demo
      localStorage.setItem('calendarConnected', 'true');
      localStorage.setItem('lastCalendarSync', new Date().toISOString());
      
      // After a few seconds, reset the status
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
  };

  // Disconnect Google Calendar
  const handleDisconnectCalendar = async () => {
    try {
      // In a real app, we would make an API call
      setSyncStatus('syncing');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsConnected(false);
      setLastSyncTime(null);
      setSyncStatus('idle');
      
      // Remove from localStorage
      localStorage.removeItem('calendarConnected');
      localStorage.removeItem('lastCalendarSync');
    } catch (err) {
      console.error('Error disconnecting calendar:', err);
      setError('Failed to disconnect calendar');
      setSyncStatus('error');
    }
  };

  // Manually trigger a calendar sync
  const handleSyncCalendar = async () => {
    if (!isConnected) return;
    
    setSyncStatus('syncing');
    setError(null);
    
    try {
      // In a real app, we would call our API service
      // const result = await syncCalendar();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLastSyncTime(new Date());
      setSyncStatus('success');
      
      // Update localStorage for demo
      localStorage.setItem('lastCalendarSync', new Date().toISOString());
      
      // After a few seconds, reset the status
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error('Error syncing calendar:', err);
      setError('Failed to sync calendar');
      setSyncStatus('error');
      
      // After a few seconds, reset the status
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-500" />
          <span>Calendar Sync</span>
        </h3>
        
        {syncStatus === 'success' && (
          <span className="text-green-500 flex items-center text-sm">
            <FaCheck className="mr-1" /> Synced Successfully
          </span>
        )}
        
        {syncStatus === 'error' && (
          <span className="text-red-500 flex items-center text-sm">
            <FaExclamationTriangle className="mr-1" /> Sync Failed
          </span>
        )}
      </div>
      
      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        {!isConnected ? (
          <div>
            <p className="text-gray-600 mb-4">
              Sync your Google Calendar to automatically add all appointments and avoid double bookings.
            </p>
            
            <button
              onClick={handleConnectCalendar}
              disabled={syncStatus === 'syncing'}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center justify-center w-full"
            >
              {syncStatus === 'syncing' ? (
                <FaSync className="animate-spin mr-2" />
              ) : (
                <FaGoogle className="text-[#4285F4] mr-2" />
              )}
              <span>Connect Google Calendar</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center text-gray-700">
                <FaGoogle className="text-[#4285F4] mr-2" />
                <span>Google Calendar</span>
              </div>
              <span className="text-green-500 flex items-center text-sm">
                <FaCheck className="mr-1" /> Connected
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Last synced: {formatLastSync()}
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSyncCalendar}
                disabled={syncStatus === 'syncing'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center flex-1"
              >
                {syncStatus === 'syncing' ? (
                  <FaSync className="animate-spin mr-2" />
                ) : (
                  <FaSync className="mr-2" />
                )}
                <span>Sync Now</span>
              </button>
              
              <button
                onClick={handleDisconnectCalendar}
                disabled={syncStatus === 'syncing'}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center justify-center"
              >
                <FaUnlink className="mr-2" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSyncWidget; 