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
  const [isSubmitting, setIsSubmitting] = useState(false); // إضافة متغير isSubmitting

  // Determine if user is a professional
  const isProfessional = userRole === 'professional';
  
  // Determine if user is an admin
  const isAdmin = userRole === 'admin';

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        // تحقق مما إذا كان المستخدم قد سجل الدخول سابقًا
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // جلب معلومات الملف الشخصي للمستخدم
        const response = await userService.getProfile();
        const userData = response.data;
        
        setCurrentUser(userData);
        
        // Determine role based on user data
        if (userData.is_staff) {
          setUserRole('admin');
        } else if (userData.is_professional) {
          setUserRole('professional');
        } else {
          setUserRole('homeowner');
        }
        
        setAuthState('success');
      } catch (err) {
        console.error('Auth initialization error:', err);
        setAuthState('error');
        // Token might be invalid or expired
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      // أرسل طلب تسجيل الدخول إلى API
      const response = await userService.login({ email, password });
      
      const { access, refresh, user: userData } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      setToken(access);
      setRefreshToken(refresh);
      
      // Set user data
      setCurrentUser(userData);
      
      // Determine role based on user data
      if (userData.is_staff) {
        setUserRole('admin');
      } else if (userData.is_professional) {
        setUserRole('professional');
      } else {
        setUserRole('homeowner');
      }
      
      setAuthState('success');
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setAuthState('error');
      throw err;
    } finally {
      setIsSubmitting(false); // إضافة setIsSubmitting(false) بدلاً من setLoading(false)
      setLoading(false);
    }
  };

  // Register function with role support
  const register = async (userData) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await userService.register(userData);
      setAuthState('success');
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Registration failed.');
      setAuthState('error');
      throw err;
    } finally {
      setIsSubmitting(false); // إضافة setIsSubmitting(false) بدلاً من setLoading(false)
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Clear user data and tokens from state
    setCurrentUser(null);
    setUserRole(null);
    setToken(null);
    setRefreshToken(null);
    setAuthState('idle');
  };

  // Context value
  const value = {
    currentUser,
    userRole,
    token,
    refreshToken,
    isAuthenticated: !!currentUser,
    loading,
    error,
    authState,
    isProfessional,
    isAdmin,
    isSubmitting, // تصدير متغير isSubmitting ضمن القيمة
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