import api from './api';

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register/', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Registration failed' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/token/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Login failed' };
  }
};

export const verifyEmail = async (token, userId) => {
  try {
    const response = await api.get(`/users/verify-email/?token=${token}&user_id=${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Email verification failed' };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/me/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch user profile' };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/me/', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to update profile' };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/users/change-password/', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to change password' };
  }
}; 