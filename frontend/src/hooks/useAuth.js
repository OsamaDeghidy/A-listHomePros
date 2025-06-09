import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '../services/api';

// Create Auth Context
const AuthContext = createContext(null);

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authState, setAuthState] = useState('idle'); // For animations: 'idle', 'loading', 'success', 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced user role determination with better logic
  const determineUserRole = (userData) => {
    if (!userData) return null;
    
    console.log('🔍 Determining user role from data:', {
      role: userData.role,
      is_staff: userData.is_staff,
      is_superuser: userData.is_superuser,
      is_professional: userData.is_professional
    });
    
    // Admin has highest priority
    if (userData.is_staff || userData.is_superuser || userData.role === 'admin') {
      return 'admin';
    }
    
    // Check specific role field first
    if (userData.role) {
      switch (userData.role) {
        case 'specialist':
          return 'specialist';
        case 'crew':
          return 'crew';
        case 'contractor':
          return 'contractor'; // Home Pro
        case 'client':
          return 'client';
        default:
          break;
      }
    }
    
    // Legacy support: if is_professional is true, assume contractor
    if (userData.is_professional) {
      return 'contractor';
    }
    
    // Default to client
    return 'client';
  };

  // Get dashboard route based on role
  const getDashboardRoute = (role = userRole) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'specialist':
        return '/specialist-dashboard';
      case 'crew':
        return '/crew-dashboard';
      case 'contractor':
        return '/pro-dashboard'; // Home Pro uses pro dashboard
      case 'client':
      default:
        return '/dashboard';
    }
  };

  // Determine user roles based on currentUser data with improved logic
  const isProfessional = userRole === 'contractor' || 
                         userRole === 'specialist' || 
                         userRole === 'crew' ||
                         currentUser?.is_professional; // Legacy support
  
  const isAdmin = userRole === 'admin' ||
                  currentUser?.is_staff || 
                  currentUser?.is_superuser;
  
  const isClient = userRole === 'client';
  const isSpecialist = userRole === 'specialist';
  const isCrew = userRole === 'crew';
  const isContractor = userRole === 'contractor'; // Home Pro

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setAuthState('loading');
        
        // Check if user was previously logged in
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setLoading(false);
          setAuthState('idle');
          return;
        }

        console.log('🔍 Initializing auth with stored token...');

        // Fetch user profile
        const response = await userService.getProfile();
        const userData = response.data;
        
        console.log('📊 Raw user data from API:', userData);
        
        setCurrentUser(userData);
        
        // Determine and set role
        const determinedRole = determineUserRole(userData);
        setUserRole(determinedRole);
        
        console.log('✅ Auth initialized successfully:', {
          userId: userData.id,
          email: userData.email,
          name: userData.name,
          is_professional: userData.is_professional,
          is_staff: userData.is_staff,
          role_field: userData.role,
          determined_role: determinedRole,
          dashboard_route: getDashboardRoute(determinedRole)
        });
        
        setAuthState('success');
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        setAuthState('error');
        setError('Session expired. Please login again.');
        
        // Clear invalid token
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  // Enhanced login function with better role handling
  const login = async (email, password) => {
    setError(null);
    setIsSubmitting(true);
    setAuthState('loading');
    
    try {
      console.log('🔐 Attempting login for:', email);
      
      // Send login request to API
      const response = await userService.login({ email, password });
      const { access, refresh, user: userData } = response.data;
      
      console.log('📊 Login response user data:', userData);
      
      // Store tokens
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      setToken(access);
      setRefreshToken(refresh);
      setCurrentUser(userData);
      
      // Determine and set role
      const determinedRole = determineUserRole(userData);
      setUserRole(determinedRole);
      
      console.log('✅ Login successful:', {
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        is_professional: userData.is_professional,
        is_staff: userData.is_staff,
        role_field: userData.role,
        determined_role: determinedRole,
        dashboard_route: getDashboardRoute(determinedRole),
        redirect_to: getDashboardRoute(determinedRole)
      });
      
      setAuthState('success');
      return {
        user: userData,
        role: determinedRole,
        dashboardRoute: getDashboardRoute(determinedRole)
      };
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
      setAuthState('error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced register function with role support
  const register = async (userData) => {
    setError(null);
    setIsSubmitting(true);
    setAuthState('loading');
    
    try {
      console.log('📝 Attempting registration with data:', {
        ...userData,
        password: '[HIDDEN]',
        password2: '[HIDDEN]'
      });
      
      const response = await userService.register(userData);
      
      console.log('✅ Registration successful:', response.data);
      
      setAuthState('success');
      return response.data;
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Registration failed.';
      setError(errorMessage);
      setAuthState('error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced logout function
  const logout = () => {
    console.log('🚪 Logging out user...');
    
    // Remove tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Clear user data and tokens from state
    setCurrentUser(null);
    setUserRole(null);
    setToken(null);
    setRefreshToken(null);
    setAuthState('idle');
    setError(null);
    
    console.log('✅ Logout completed');
  };

  // Context value
  const value = {
    // User data
    currentUser,
    userRole,
    token,
    refreshToken,
    
    // Auth states
    isAuthenticated: !!currentUser,
    loading,
    error,
    authState,
    isSubmitting,
    
    // User type checks
    isProfessional,
    isAdmin,
    isClient,
    isSpecialist,
    isCrew,
    isContractor,
    
    // Helper functions
    getDashboardRoute: () => getDashboardRoute(userRole),
    
    // Auth actions
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 