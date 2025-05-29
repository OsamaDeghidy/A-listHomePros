import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Component that redirects users to the appropriate dashboard based on their role
 * Used by the main /dashboard route to handle role-based routing
 */
const DashboardRedirector = () => {
  const { userRole, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (userRole === 'professional') {
        navigate('/pro-dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'homeowner') {
        navigate('/dashboard/');
      } else {
        // If role is not recognized but user is authenticated, go to client dashboard
        navigate('/dashboard/');
      }
      console.log(`DashboardRedirector: Redirecting user with role ${userRole}`);
    }
  }, [userRole, isAuthenticated, loading, navigate]);
  
  // If still loading, show nothing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // This should not be visible as the useEffect should redirect
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default DashboardRedirector;
