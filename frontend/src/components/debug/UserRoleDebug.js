import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

const UserRoleDebug = () => {
  const { 
    currentUser, 
    userRole, 
    isProfessional, 
    isAdmin, 
    isClient, 
    isAuthenticated, 
    loading,
    authState,
    getDashboardRoute
  } = useAuth();
  const { language } = useLanguage();

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs z-50 max-w-xs font-mono">
      <h4 className="font-bold mb-2 text-yellow-400">🔍 User Debug Info</h4>
      <div className="space-y-1">
        <div className="border-b border-gray-600 pb-1 mb-2">
          <strong className="text-blue-300">Auth State:</strong>
        </div>
        <div><span className="text-gray-400">Loading:</span> <span className={loading ? 'text-red-400' : 'text-green-400'}>{loading ? 'Yes' : 'No'}</span></div>
        <div><span className="text-gray-400">Auth State:</span> <span className="text-yellow-300">{authState}</span></div>
        <div><span className="text-gray-400">Authenticated:</span> <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'Yes' : 'No'}</span></div>
        
        {currentUser && (
          <>
            <div className="border-b border-gray-600 pb-1 mb-2 mt-3">
              <strong className="text-blue-300">User Data:</strong>
            </div>
            <div><span className="text-gray-400">ID:</span> <span className="text-white">{currentUser.id}</span></div>
            <div><span className="text-gray-400">Email:</span> <span className="text-white break-all">{currentUser.email}</span></div>
            <div><span className="text-gray-400">Name:</span> <span className="text-white">{currentUser.name || 'N/A'}</span></div>
            
            <div className="border-b border-gray-600 pb-1 mb-2 mt-3">
              <strong className="text-blue-300">User Flags:</strong>
            </div>
            <div><span className="text-gray-400">is_professional:</span> <span className={currentUser.is_professional ? 'text-green-400' : 'text-red-400'}>{currentUser.is_professional ? 'Yes' : 'No'}</span></div>
            <div><span className="text-gray-400">is_staff:</span> <span className={currentUser.is_staff ? 'text-green-400' : 'text-red-400'}>{currentUser.is_staff ? 'Yes' : 'No'}</span></div>
            <div><span className="text-gray-400">is_superuser:</span> <span className={currentUser.is_superuser ? 'text-green-400' : 'text-red-400'}>{currentUser.is_superuser ? 'Yes' : 'No'}</span></div>
            <div><span className="text-gray-400">role field:</span> <span className="text-yellow-300">{currentUser.role || 'null'}</span></div>
          </>
        )}
        
        <div className="border-b border-gray-600 pb-1 mb-2 mt-3">
          <strong className="text-blue-300">Computed Roles:</strong>
        </div>
        <div><span className="text-gray-400">userRole:</span> <span className="text-yellow-300">{userRole || 'null'}</span></div>
        <div><span className="text-gray-400">isProfessional:</span> <span className={isProfessional ? 'text-green-400' : 'text-red-400'}>{isProfessional ? 'Yes' : 'No'}</span></div>
        <div><span className="text-gray-400">isAdmin:</span> <span className={isAdmin ? 'text-green-400' : 'text-red-400'}>{isAdmin ? 'Yes' : 'No'}</span></div>
        <div><span className="text-gray-400">isClient:</span> <span className={isClient ? 'text-green-400' : 'text-red-400'}>{isClient ? 'Yes' : 'No'}</span></div>
        
        {userRole && (
          <>
            <div className="border-b border-gray-600 pb-1 mb-2 mt-3">
              <strong className="text-blue-300">Navigation:</strong>
            </div>
            <div><span className="text-gray-400">Dashboard Route:</span> <span className="text-green-300">{getDashboardRoute()}</span></div>
          </>
        )}
        
        <div className="border-b border-gray-600 pb-1 mb-2 mt-3">
          <strong className="text-blue-300">App Settings:</strong>
        </div>
        <div><span className="text-gray-400">Language:</span> <span className="text-white">{language}</span></div>
        <div><span className="text-gray-400">Environment:</span> <span className="text-white">{process.env.NODE_ENV}</span></div>
      </div>
    </div>
  );
};

export default UserRoleDebug; 