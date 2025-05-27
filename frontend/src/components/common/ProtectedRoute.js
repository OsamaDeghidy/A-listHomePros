import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ 
  children, 
  requireRole = null, 
  allowedRoles = [], 
  requiresPro = false 
}) => {
  const { currentUser, userRole, isAuthenticated, loading, isProfessional, authState } = useAuth();
  const location = useLocation();

  // Variants for animation
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Show an animated loading state while auth state is being determined
  if (loading) {
    return (
      <motion.div 
        className="flex flex-col justify-center items-center h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </motion.div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user is a professional when required
  if (requiresPro && !isProfessional) {
    return <Navigate to="/unauthorized" state={{ 
      message: "You need a professional account to access this area.",
      returnPath: location.pathname
    }} replace />;
  }

  // Check for required role if specified
  if (requireRole && userRole !== requireRole) {
    return <Navigate to="/unauthorized" state={{ 
      message: `Access requires ${requireRole} role.`,
      returnPath: location.pathname
    }} replace />;
  }

  // Check for allowed roles if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" state={{ 
      message: `Access is restricted to specific roles.`,
      returnPath: location.pathname
    }} replace />;
  }

  // Render children with transition effect if all checks pass
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute; 