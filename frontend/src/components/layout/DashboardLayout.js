import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaEnvelope, FaStar, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaTachometerAlt, FaCalendarAlt, FaUsers, FaCreditCard, FaHistory, FaBriefcase, FaClock, FaChartLine, FaBell, FaQuestionCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import Header from './Header';
import Footer from './Footer';

const DashboardLayout = ({ isPro = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout, isProfessional } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProMode = isPro || isProfessional;

  const clientNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Appointments', path: '/dashboard/calendar', icon: <FaCalendarAlt /> },
    { name: 'Messages', path: '/dashboard/messages', icon: <FaEnvelope /> },
    { name: 'My Reviews', path: '/dashboard/reviews', icon: <FaStar /> },
    { name: 'Payment History', path: '/dashboard/payment-history', icon: <FaCreditCard /> },
    { name: 'Activity Log', path: '/dashboard/activity', icon: <FaHistory /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <FaBell /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <FaUser /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <FaCog /> },
  ];

  const proNavItems = [
    { name: 'Pro Dashboard', path: '/pro-dashboard', icon: <FaChartLine /> },
    { name: 'Appointments', path: '/pro-dashboard/calendar', icon: <FaCalendarAlt /> },
    { name: 'Clients', path: '/pro-dashboard/clients', icon: <FaUsers /> },
    { name: 'Messages', path: '/pro-dashboard/messages', icon: <FaEnvelope /> },
    { name: 'My Services', path: '/pro-dashboard/services', icon: <FaBriefcase /> },
    { name: 'Availability', path: '/pro-dashboard/availability', icon: <FaClock /> },
    { name: 'Reviews', path: '/pro-dashboard/reviews', icon: <FaStar /> },
    { name: 'Payments', path: '/pro-dashboard/payment-history', icon: <FaCreditCard /> },
    { name: 'Notifications', path: '/pro-dashboard/notifications', icon: <FaBell /> },
    { name: 'Profile', path: '/pro-dashboard/profile', icon: <FaUser /> },
    { name: 'Settings', path: '/pro-dashboard/settings', icon: <FaCog /> },
  ];

  // Select nav items based on current mode
  const navItems = isProMode ? proNavItems : clientNavItems;

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside 
          className={`bg-gray-800 dark:bg-gray-950 text-white ${
            sidebarOpen ? 'w-64' : 'w-20'
          } transition-all duration-300 ease-in-out flex flex-col fixed h-full z-10 overflow-y-auto`}
        >
          {/* Toggle Button */}
          <button
            className="p-4 self-end text-gray-400 hover:text-white"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          
          {/* User Profile */}
          <div className={`flex items-center ${sidebarOpen ? 'p-4' : 'p-2 justify-center'} border-b border-gray-700`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="w-full h-full p-2 text-gray-300" />
              )}
            </div>
            {sidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.email || 'user@example.com'}</p>
                {isProMode && (
                  <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full mt-1 inline-block">Pro</span>
                )}
              </div>
            )}
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center ${
                      sidebarOpen ? 'px-4' : 'justify-center'
                    } py-2 text-sm rounded-md ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {sidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
              
              {/* Help Section */}
              <li className="pt-5">
                {sidebarOpen && <p className="px-4 text-xs text-gray-500 uppercase">Help & Support</p>}
                <Link
                  to="/help"
                  className={`flex items-center ${
                    sidebarOpen ? 'px-4' : 'justify-center'
                  } py-2 mt-1 text-sm rounded-md text-gray-300 hover:bg-gray-700 hover:text-white`}
                >
                  <FaQuestionCircle className="text-lg" />
                  {sidebarOpen && <span className="ml-3">Help Center</span>}
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Logout Button */}
          <div className={`p-4 border-t border-gray-700 ${!sidebarOpen && 'flex justify-center'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center ${
                sidebarOpen ? 'w-full' : ''
              } px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700 hover:text-white`}
            >
              <FaSignOutAlt />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-6`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <Outlet />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout; 