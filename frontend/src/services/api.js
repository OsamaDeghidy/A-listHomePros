import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = response.data;
        localStorage.setItem('token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// خدمات المستخدم
const userService = {
  login: (credentials) => api.post('/users/token/', credentials),
  register: (userData) => api.post('/users/register/', userData),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (profileData) => api.patch('/users/profile/', profileData),
  changePassword: (passwordData) => api.post('/users/change-password/', passwordData),
  forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
  resetPassword: (resetData) => api.post('/users/reset-password/', resetData),
  verifyEmail: (code) => api.post('/users/verify-email/', { code }),
};

// خدمات المحترفين
const proService = {
  getProfiles: (params) => api.get('/alistpros/profiles/', { params }),
  getFeaturedPros: (limit = 4) => api.get('/alistpros/profiles/', { params: { featured: true, limit } }),
  getProfile: (id) => api.get(`/alistpros/profiles/${id}/`),
  getReviews: (id, params) => api.get(`/alistpros/profiles/${id}/reviews/`, { params }),
  submitReview: (id, reviewData) => api.post(`/alistpros/profiles/${id}/reviews/`, reviewData),
  becomeAPro: (proData) => api.post('/alistpros/become-pro/', proData),
  updateProProfile: (profileData) => api.patch('/alistpros/my-profile/', profileData),
};

// إضافة نسخة بديلة من خدمة المحترفين باسم alistProsService (للتوافق)
const alistProsService = {
  ...proService,
  getProfile: (id) => api.get(`/alistpros/profiles/${id}/`),
  getReviews: (id, params) => api.get(`/alistpros/profiles/${id}/reviews/`, { params }),
};

// خدمات الخدمات والفئات
const serviceService = {
  getCategories: (params) => api.get('/alistpros/categories/', { params }),
  getPopularCategories: (limit = 8) => api.get('/alistpros/categories/', { params: { popular: true, limit } }),
  getCategoryDetails: (id) => api.get(`/alistpros/categories/${id}/`),
  getServicesByCategory: (categoryId, params) => api.get(`/alistpros/categories/${categoryId}/services/`, { params }),
  getServicesByPro: (proId, params) => api.get(`/alistpros/profiles/${proId}/services/`, { params }),
};

// خدمات الحجز
const bookingService = {
  createBooking: (bookingData) => api.post('/scheduling/appointments/', bookingData),
  getUserBookings: (params) => api.get('/scheduling/appointments/', { params }),
  getBookingDetails: (id) => api.get(`/scheduling/appointments/${id}/`),
  cancelBooking: (id, reason) => api.post(`/scheduling/appointments/${id}/cancel/`, { reason }),
  rescheduleBooking: (id, newData) => api.post(`/scheduling/appointments/${id}/reschedule/`, newData),
  getAvailableSlots: (proId, date) => api.get(`/scheduling/availability/`, { params: { pro_id: proId, date } }),
};

// إضافة نسخة بديلة من خدمة الحجز باسم schedulingService (للتوافق)
const schedulingService = {
  ...bookingService,
  createAppointment: (bookingData) => api.post('/scheduling/appointments/', bookingData),
  confirmAppointment: (id) => api.post(`/scheduling/appointments/${id}/confirm/`),
  cancelAppointment: (id, reason) => api.post(`/scheduling/appointments/${id}/cancel/`, { reason }),
  getAvailability: (proId) => api.get(`/scheduling/availability/`, { params: { pro_id: proId } }),
};

// خدمات الدفع
const paymentService = {
  getPaymentMethods: () => api.get('/payments/methods/'),
  addPaymentMethod: (paymentData) => api.post('/payments/methods/', paymentData),
  deletePaymentMethod: (id) => api.delete(`/payments/methods/${id}/`),
  setDefaultPaymentMethod: (id) => api.post(`/payments/methods/${id}/default/`),
  getTransactionHistory: (params) => api.get('/payments/transactions/', { params }),
  getTransactionDetails: (id) => api.get(`/payments/transactions/${id}/`),
  createPaymentIntent: (paymentData) => api.post('/payments/create-intent/', paymentData),
};

// إضافة نسخة بديلة من خدمة الدفع باسم paymentsService (للتوافق)
const paymentsService = {
  ...paymentService,
  createPaymentIntent: (paymentData) => api.post('/payments/create-intent/', paymentData),
};

// خدمات الرسائل
const messageService = {
  getConversations: () => api.get('/messaging/conversations/'),
  getConversation: (id) => api.get(`/messaging/conversations/${id}/`),
  getMessages: (conversationId, params) => api.get(`/messaging/conversations/${conversationId}/messages/`, { params }),
  sendMessage: (conversationId, message) => api.post(`/messaging/conversations/${conversationId}/messages/`, message),
  startConversation: (data) => api.post('/messaging/conversations/', data),
  markAsRead: (conversationId) => api.post(`/messaging/conversations/${conversationId}/read/`),
};

// خدمات الإشعارات
const notificationService = {
  getNotifications: (params) => api.get('/notifications/notifications/', { params }),
  markAsRead: (id) => api.put(`/notifications/notifications/${id}/read/`),
  markAllAsRead: () => api.put('/notifications/notifications/read_all/'),
  getSettings: () => api.get('/notifications/settings/my_settings/'),
  updateSettings: (settings) => api.patch('/notifications/settings/update_settings/', settings),
};

// إضافة نسخة بديلة من خدمة الإشعارات باسم notificationsService (للتوافق)
const notificationsService = {
  ...notificationService,
};

// خدمات المدونة
const blogService = {
  getPosts: (params) => api.get('/blog/posts/', { params }),
  getFeaturedPosts: (limit = 3) => api.get('/blog/posts/', { params: { featured: true, limit } }),
  getPost: (id) => api.get(`/blog/posts/${id}/`),
  getCategories: () => api.get('/blog/categories/'),
  getComments: (postId) => api.get(`/blog/posts/${postId}/comments/`),
  addComment: (postId, commentData) => api.post(`/blog/posts/${postId}/comments/`, commentData),
};

// تصدير الخدمات
export {
  api as default,
  userService,
  proService,
  serviceService,
  bookingService,
  paymentService,
  messageService,
  notificationService,
  blogService,
  // تصدير الاسماء البديلة للتوافق مع الكود الحالي
  alistProsService,
  schedulingService,
  paymentsService,
  notificationsService
}; 