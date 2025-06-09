import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * Component that redirects users to the appropriate dashboard based on their role
 * Used by the main /dashboard route to handle role-based routing
 */
const DashboardRedirector = () => {
  const { 
    userRole, 
    isProfessional, 
    isAdmin, 
    isAuthenticated, 
    loading, 
    currentUser,
    getDashboardRoute 
  } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  
  useEffect(() => {
    if (!loading && isAuthenticated && currentUser && userRole) {
      console.log('🔄 DashboardRedirector: Determining redirect...', {
        userRole,
        isProfessional,
        isAdmin,
        userId: currentUser.id,
        email: currentUser.email
      });
      
      const dashboardRoute = getDashboardRoute();
      console.log('📍 DashboardRedirector: Redirecting to:', dashboardRoute);
      
      // Use replace to prevent back button issues
      navigate(dashboardRoute, { replace: true });
    }
  }, [userRole, isProfessional, isAdmin, isAuthenticated, loading, currentUser, navigate, getDashboardRoute]);
  
  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جارٍ التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🚫 DashboardRedirector: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: { pathname: '/dashboard' } }} replace />;
  }

  // If user data is not loaded yet, wait
  if (!currentUser || !userRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جارٍ تحديد نوع الحساب...' : 'Determining account type...'}
          </p>
        </div>
      </div>
    );
  }

  // Show a quick redirect message while redirecting
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {isAdmin 
            ? (isArabic ? 'توجيه إلى لوحة الإدارة...' : 'Redirecting to Admin Dashboard...')
            : isProfessional 
            ? (isArabic ? 'توجيه إلى لوحة المحترف...' : 'Redirecting to Professional Dashboard...') 
            : (isArabic ? 'توجيه إلى لوحة التحكم...' : 'Redirecting to Dashboard...')
          }
        </p>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div>Role: {userRole}</div>
            <div>isProfessional: {isProfessional ? 'Yes' : 'No'}</div>
            <div>isAdmin: {isAdmin ? 'Yes' : 'No'}</div>
            <div>Target: {getDashboardRoute()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRedirector;
