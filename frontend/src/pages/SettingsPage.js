import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FaUser, FaBell, FaShieldAlt, FaGlobe, FaCreditCard, FaEnvelope, FaMobile } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import NotificationSettings from '../components/settings/NotificationSettings';
import { notificationService } from '../services/api';

const SettingsPage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    email: '',
    name: '',
    phone: '',
    language: 'en',
    timezone: 'America/New_York'
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    booking_confirmations: true,
    booking_reminders: true,
    booking_changes: true,
    pro_messages: true,
    promotions: false,
    newsletter: false
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: false,
    login_notifications: true,
    remember_devices: true
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Payment settings
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm_1',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2024
      },
      billing_details: {
        name: 'John Smith'
      },
      isDefault: true
    },
    {
      id: 'pm_2',
      type: 'card',
      card: {
        brand: 'mastercard',
        last4: '5678',
        exp_month: 10,
        exp_year: 2025
      },
      billing_details: {
        name: 'John Smith'
      },
      isDefault: false
    }
  ]);
  
  // Timezones
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (GMT-5)' },
    { value: 'America/Chicago', label: 'Central Time (GMT-6)' },
    { value: 'America/Denver', label: 'Mountain Time (GMT-7)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (GMT-8)' },
    { value: 'America/Anchorage', label: 'Alaska Time (GMT-9)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (GMT-10)' }
  ];
  
  // Languages
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' }
  ];
  
  // Load user settings
  useEffect(() => {
    if (currentUser) {
      setAccountSettings({
        email: currentUser.email || '',
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        language: currentUser.language || 'en',
        timezone: currentUser.timezone || 'America/New_York'
      });
      
      // Load notification settings
      const fetchNotificationSettings = async () => {
        try {
          const response = await notificationService.getSettings();
          setNotificationSettings(response.data);
        } catch (err) {
          console.error('Error fetching notification settings:', err);
          // Use defaults if API fails
        }
      };
      
      fetchNotificationSettings();
    }
  }, [currentUser]);
  
  // Handle input change for account settings
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle toggle change for notification settings
  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle toggle change for security settings
  const handleSecurityToggle = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle password change input
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Set default payment method
  const setDefaultPaymentMethod = (id) => {
    setPaymentMethods(prevMethods => 
      prevMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };
  
  // Delete payment method
  const deletePaymentMethod = (id) => {
    setPaymentMethods(prevMethods => 
      prevMethods.filter(method => method.id !== id)
    );
  };
  
  // Save account settings
  const saveAccountSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update user profile
      await updateUserProfile({
        name: accountSettings.name,
        phone: accountSettings.phone,
        language: accountSettings.language,
        timezone: accountSettings.timezone
      });
      
      setSuccess('Account settings updated successfully');
    } catch (err) {
      console.error('Error updating account settings:', err);
      setError('An error occurred while updating settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Save notification settings
  const saveNotificationSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await notificationService.updateSettings(notificationSettings);
      setSuccess('Notification settings updated successfully');
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError('An error occurred while updating settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const changePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    try {
      // Call API to change password
      // await authService.changePassword(passwordData);
      
      // For demo, we'll just simulate success
      setTimeout(() => {
        setSuccess('Password changed successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('An error occurred while changing password. Please verify your current password.');
      setLoading(false);
    }
  };
  
  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-start mb-6">
      <div className="flex-shrink-0">
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={enabled}
          onClick={onChange}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );
  
  return (
    <>
      <Helmet>
        <title>Account Settings | A-List Home Pros</title>
        <meta name="description" content="Manage your account settings, notifications, security, and payment methods" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-1/4">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-1">
                <button
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'account' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('account')}
                >
                  <FaUser className="mr-3 text-gray-500" />
                  Account
                </button>
                <button
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'notifications' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FaBell className="mr-3 text-gray-500" />
                  Notifications
                </button>
                <button
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'security' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  <FaShieldAlt className="mr-3 text-gray-500" />
                  Security
                </button>
                <button
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'payments' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('payments')}
                >
                  <FaCreditCard className="mr-3 text-gray-500" />
                  Payment Methods
                </button>
              </div>
            </nav>
          </div>
          
          {/* Content Area */}
          <div className="md:w-3/4">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={accountSettings.name}
                      onChange={handleAccountChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                      value={accountSettings.email}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      To change your email address, please contact customer support.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={accountSettings.phone}
                      onChange={handleAccountChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      id="language"
                      name="language"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={accountSettings.language}
                      onChange={handleAccountChange}
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                      Time Zone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={accountSettings.timezone}
                      onChange={handleAccountChange}
                    >
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    onClick={saveAccountSettings}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <NotificationSettings />
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current_password"
                        name="current_password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        onClick={changePassword}
                        disabled={loading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-4">Additional Security Settings</h3>
                  <div className="space-y-4">
                    <ToggleSwitch
                      enabled={securitySettings.two_factor_auth}
                      onChange={() => handleSecurityToggle('two_factor_auth')}
                      label="Two-Factor Authentication"
                      description="Enable two-factor authentication for increased account security"
                    />
                    
                    <ToggleSwitch
                      enabled={securitySettings.login_notifications}
                      onChange={() => handleSecurityToggle('login_notifications')}
                      label="Login Notifications"
                      description="Receive a notification when someone logs in from a new device"
                    />
                    
                    <ToggleSwitch
                      enabled={securitySettings.remember_devices}
                      onChange={() => handleSecurityToggle('remember_devices')}
                      label="Remember Devices"
                      description="Remember devices you've previously logged in from"
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-4">Login Sessions</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You are currently logged in on this device. You can review all active login sessions or log out from all devices.
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Log Out From All Devices
                  </button>
                </div>
              </div>
            )}
            
            {/* Payment Methods */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Payment Methods</h2>
                
                <div className="space-y-4 mb-8">
                  {paymentMethods.map(method => (
                    <div 
                      key={method.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="mr-4">
                          {method.card.brand === 'visa' ? (
                            <FaCreditCard className="text-blue-700 text-2xl" />
                          ) : method.card.brand === 'mastercard' ? (
                            <FaCreditCard className="text-red-600 text-2xl" />
                          ) : (
                            <FaCreditCard className="text-gray-600 text-2xl" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} •••• {method.card.last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {method.card.exp_month}/{method.card.exp_year.toString().slice(-2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {method.isDefault ? (
                          <span className="mr-4 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Default
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="mr-4 text-sm text-blue-600 hover:text-blue-800"
                            onClick={() => setDefaultPaymentMethod(method.id)}
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:text-red-800"
                          onClick={() => deletePaymentMethod(method.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                  >
                    <FaCreditCard className="mr-2" />
                    Add New Payment Method
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-4">Transaction History</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You can view all your past transactions and download receipts.
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => window.location.href = '/dashboard/payments'}
                  >
                    View Transaction History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage; 