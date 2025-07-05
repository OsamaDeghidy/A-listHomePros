import axios from 'axios';

// تكوين الإعدادات الأساسية للـ API
const API_URL = 'http://127.0.0.1:8000/api';
//const API_URL = 'https://alisthomepros.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// معترض الطلبات: إضافة رمز التوثيق إذا كان موجودًا
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData by removing Content-Type header
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// معترض الاستجابة: التعامل مع أخطاء انتهاء صلاحية التوكن
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // إذا كان الخطأ 401 (غير مصرح) وليس محاولة تحديث التوكن
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('token/refresh')) {
      originalRequest._retry = true;
      
      try {
        // محاولة تحديث التوكن
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // إذا لم يكن هناك refresh token، تسجيل الخروج
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refreshToken
        });
        
        if (response.data.access) {
          localStorage.setItem('token', response.data.access);
          // إعادة تكوين الطلب الأصلي بالتوكن الجديد
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // فشل تحديث التوكن، تسجيل الخروج
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// خدمات المستخدم وإدارة الحسابات
const authService = {
  login: (credentials) => api.post('/users/token/', credentials),
  register: (userData) => api.post('/users/register/', userData),
  refreshToken: (refreshToken) => api.post('/users/token/refresh/', { refresh: refreshToken }),
  verifyToken: (token) => api.post('/users/token/verify/', { token }),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.patch('/users/me/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
  verifyEmail: (token, userId) => api.get(`/users/verify-email/${token}/${userId}/`),
};

// خدمات المحترفين والخدمات الجديدة
const alistProsService = {
  getAllProfiles: (params) => api.get('/alistpros/profiles/', { params }),
  getProfile: (id) => api.get(`/alistpros/profiles/${id}/`),
  getMyProfile: () => api.get('/alistpros/profiles/me/'),
  updateMyProfile: async (data) => {
    try {
      // First, try to get current user's profile using the 'me' endpoint
      const profileResponse = await api.get('/alistpros/profiles/me/');
      const currentProfile = profileResponse.data;
      
      if (currentProfile && currentProfile.id) {
        // Update the existing profile
        // Check if data is FormData to remove Content-Type header (let browser set it)
        const config = {};
        if (data instanceof FormData) {
          config.headers = {};
          // Don't set Content-Type for FormData - let browser handle it
        }
        return await api.patch(`/alistpros/profiles/${currentProfile.id}/`, data, config);
      } else {
        // This shouldn't happen if 'me' endpoint works, but fallback to create
        const config = {};
        if (data instanceof FormData) {
          config.headers = {};
          // Don't set Content-Type for FormData - let browser handle it
        }
        return await api.post('/alistpros/profiles/', data, config);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Profile doesn't exist, create new one
        const config = {};
        if (data instanceof FormData) {
          config.headers = {};
          // Don't set Content-Type for FormData - let browser handle it
        }
        return await api.post('/alistpros/profiles/', data, config);
      }
      throw error;
    }
  },
  createProfile: (data) => api.post('/alistpros/profiles/', data),
  deleteProfile: (id) => api.delete(`/alistpros/profiles/${id}/`),
  updateAddress: (data) => api.post('/alistpros/profiles/update_address/', data),
  
  // Service Categories
  getServiceCategories: () => api.get('/alistpros/service-categories/'),
  
  // Portfolio
  getPortfolio: (params) => api.get('/alistpros/portfolio/', { params }),
  createPortfolio: (data) => {
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    return api.post('/alistpros/portfolio/', data, config);
  },
  updatePortfolio: (id, data) => {
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    return api.put(`/alistpros/portfolio/${id}/`, data, config);
  },
  deletePortfolio: (id) => api.delete(`/alistpros/portfolio/${id}/`),
  getPortfolioItem: (id) => api.get(`/alistpros/portfolio/${id}/`),
  
  // Reviews
  getReviews: (params) => api.get('/alistpros/reviews/', { params }),
  createReview: (data) => api.post('/alistpros/reviews/', data),
  replyToReview: (id, data) => api.post(`/alistpros/reviews/${id}/reply_to_review/`, data),
  
  // Service requests
  getServiceRequests: (params) => api.get('/alistpros/requests/', { params }),
  createServiceRequest: (data) => api.post('/alistpros/requests/', data),
  updateServiceRequest: (id, data) => api.patch(`/alistpros/requests/${id}/`, data),
  deleteServiceRequest: (id) => api.delete(`/alistpros/requests/${id}/`),
  
  // Service quotes  
  getServiceQuotes: (params) => api.get('/alistpros/quotes/', { params }),
  createServiceQuote: (data) => api.post('/alistpros/quotes/', data),
  updateServiceQuote: (id, data) => api.patch(`/alistpros/quotes/${id}/`, data),
  deleteServiceQuote: (id) => api.delete(`/alistpros/quotes/${id}/`),
  acceptQuote: (id) => api.post(`/alistpros/quotes/${id}/accept/`),
  acceptServiceQuote: (id) => api.post(`/alistpros/quotes/${id}/accept/`),
  rejectServiceQuote: (id) => api.post(`/alistpros/quotes/${id}/reject/`),
  
  // Job assignments
  getJobAssignments: (params) => api.get('/alistpros/jobs/', { params }),
  updateJobAssignment: (id, data) => api.patch(`/alistpros/jobs/${id}/`, data),
  
  // Dashboard
  getClientDashboard: () => api.get('/alistpros/client-dashboard/'),
  
  // Categories
  getCategories: () => api.get('/alistpros/categories/'),
  getPendingProfiles: () => api.get('/alistpros/admin/pending/'),
  
  // الملفات الشخصية
  getProfileDetail: (id) => api.get(`/alistpros/profile-detail/${id}/`),
  updateProfile: async (profileId, data) => {
    // Use the correct endpoint with profile ID
    try {
      if (profileId) {
        return await api.patch(`/alistpros/profiles/${profileId}/`, data);
      } else {
        // If no profile ID, get current user's profile first
        const response = await api.get('/alistpros/profiles/');
        const profiles = response.data.results || response.data;
        const currentProfile = Array.isArray(profiles) ? profiles[0] : profiles;
        if (currentProfile && currentProfile.id) {
          return await api.patch(`/alistpros/profiles/${currentProfile.id}/`, data);
        } else {
          return await api.post('/alistpros/profiles/', data);
        }
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      throw err;
    }
  },
  updateProfilePartial: async (profileId, data) => {
    // Same logic as updateProfile
    return alistProsService.updateProfile(profileId, data);
  },
  
  // البحث والقوائم
  getProfiles: (params) => api.get('/alistpros/profiles/', { params }),
  
  // المراجعات
  getReviews: (alistproId) => {
    // استخدام نقطة النهاية المخصصة للحصول على مراجعات مقدم خدمة محدد
    return api.get(`/alistpros/reviews/for_professional/?alistpro=${alistproId}`);
  },
  createReview: (proId, data) => api.post(`/alistpros/profiles/${proId}/reviews/`, data),
  replyToReview: (reviewId, data) => api.post(`/alistpros/reviews/${reviewId}/reply_to_review/`, data),
  
  // الخدمات
  getServices: () => api.get('/alistpros/services/'),
};

// خدمات الرسائل والإشعارات المحدثة
const messagingService = {
  // المحادثات - Conversations
  getConversations: () => api.get('/messaging/conversations/'),
  getConversation: (id) => api.get(`/messaging/conversations/${id}/`),
  createConversation: (data) => api.post('/messaging/conversations/', data),
  updateConversation: (id, data) => api.put(`/messaging/conversations/${id}/`, data),
  deleteConversation: (id) => api.delete(`/messaging/conversations/${id}/`),
  markConversationAsRead: (id) => api.post(`/messaging/conversations/${id}/mark_read/`),
  archiveConversation: (id) => api.post(`/messaging/conversations/${id}/archive/`),
  searchConversations: (query) => api.get('/messaging/conversations/search/', { params: { q: query } }),
  
  // إدارة المشاركين - Participants Management
  addParticipant: (conversationId, userId) => api.post(`/messaging/conversations/${conversationId}/add_participant/`, { user_id: userId }),
  removeParticipant: (conversationId, userId) => api.post(`/messaging/conversations/${conversationId}/remove_participant/`, { user_id: userId }),
  
  // الرسائل - Messages
  getMessages: (conversationId, params) => api.get(`/messaging/conversations/${conversationId}/messages/`, { params }),
  getMessage: (conversationId, messageId) => api.get(`/messaging/conversations/${conversationId}/messages/${messageId}/`),
  sendMessage: (conversationId, data) => {
    // Support for different message types (text, image, file, location)
    const config = {};
    if (data instanceof FormData) {
      // Let browser set Content-Type for FormData
      config.headers = {};
    }
    return api.post(`/messaging/conversations/${conversationId}/messages/`, data, config);
  },
  editMessage: (conversationId, messageId, content) => api.patch(`/messaging/conversations/${conversationId}/messages/${messageId}/edit/`, { content }),
  deleteMessage: (conversationId, messageId) => api.delete(`/messaging/conversations/${conversationId}/messages/${messageId}/soft_delete/`),
  markMessageAsRead: (conversationId, messageId) => api.post(`/messaging/conversations/${conversationId}/messages/${messageId}/mark_read/`),
  
  // التفاعلات - Reactions
  addReaction: (conversationId, messageId, reactionType) => api.post(`/messaging/conversations/${conversationId}/messages/${messageId}/react/`, { reaction_type: reactionType }),
  removeReaction: (conversationId, messageId) => api.delete(`/messaging/conversations/${conversationId}/messages/${messageId}/remove_reaction/`),
  
  // الإشعارات - Notifications
  getNotifications: () => api.get('/messaging/notifications/'),
  getUnreadCount: () => api.get('/messaging/notifications/unread_count/'),
  markAllNotificationsAsRead: () => api.post('/messaging/notifications/mark_all_read/'),
  markNotificationAsRead: (id) => api.patch(`/messaging/notifications/${id}/`, { read: true }),
  deleteNotification: (id) => api.delete(`/messaging/notifications/${id}/`),
  
  // البحث عن المستخدمين - User Search
  searchUsers: (query) => api.get('/messaging/users/search/', { params: { q: query } }),
  
  // إنشاء رسالة مع مرفقات - Create message with attachments
  sendMessageWithAttachment: (conversationId, data) => {
    const formData = new FormData();
    formData.append('content', data.content || '');
    formData.append('message_type', data.messageType || 'TEXT');
    
    if (data.file) {
      formData.append('file', data.file);
      formData.append('file_name', data.file.name);
    }
    
    if (data.image) {
      formData.append('image', data.image);
      formData.append('message_type', 'IMAGE');
    }
    
    if (data.location) {
      formData.append('latitude', data.location.lat);
      formData.append('longitude', data.location.lng);
      formData.append('location_name', data.location.name || '');
      formData.append('message_type', 'LOCATION');
    }
    
    if (data.replyTo) {
      formData.append('reply_to', data.replyTo);
    }
    
    return api.post(`/messaging/conversations/${conversationId}/messages/`, formData);
  },
  
  // دعم WebSocket للرسائل الفورية
  getWebSocketUrl: () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_API_URL?.replace(/^https?:\/\//, '') || window.location.host;
    return `${protocol}//${host}/ws/messaging/`;
  },
};

// خدمات إدارة المواعيد والحجوزات
const schedulingService = {
  // المواعيد
  getAppointments: () => api.get('/scheduling/appointments/'),
  getUpcomingAppointments: () => api.get('/scheduling/appointments/upcoming/'),
  getAppointment: (id) => api.get(`/scheduling/appointments/${id}/`),
  createAppointment: (data) => api.post('/scheduling/appointments/', data),
  updateAppointment: (id, data) => api.put(`/scheduling/appointments/${id}/`, data),
  updateAppointmentPartial: (id, data) => api.patch(`/scheduling/appointments/${id}/`, data),
  deleteAppointment: (id) => api.delete(`/scheduling/appointments/${id}/`),
  cancelAppointment: (id) => api.post(`/scheduling/appointments/${id}/cancel/`),
  completeAppointment: (id) => api.post(`/scheduling/appointments/${id}/complete/`),
  confirmAppointment: (id) => api.post(`/scheduling/appointments/${id}/confirm/`),
  
  // ملاحظات المواعيد
  getAppointmentNotes: (appointmentId) => api.get(`/scheduling/appointments/${appointmentId}/notes/`),
  getAppointmentNote: (appointmentId, noteId) => api.get(`/scheduling/appointments/${appointmentId}/notes/${noteId}/`),
  createAppointmentNote: (appointmentId, data) => api.post(`/scheduling/appointments/${appointmentId}/notes/`, data),
  updateAppointmentNote: (appointmentId, noteId, data) => api.put(`/scheduling/appointments/${appointmentId}/notes/${noteId}/`, data),
  deleteAppointmentNote: (appointmentId, noteId) => api.delete(`/scheduling/appointments/${appointmentId}/notes/${noteId}/`),
  
  // أوقات التوفر
  getAvailabilitySlots: (params) => {
    // If we're requesting availability for a specific professional
    if (params && params.alistpro && params.alistpro !== 'me') {
      // Use the dedicated endpoint for getting a pro's availability
      return api.get('/scheduling/availability-slots/for_professional/', { params });
    }
    // If requesting 'me' (current user's availability) or no specific pro
    else {
      // For current user's slots, don't pass alistpro parameter to get their own slots
      const cleanParams = params ? { ...params } : {};
      delete cleanParams.alistpro; // Remove alistpro to get current user's slots
      return api.get('/scheduling/availability-slots/', { params: cleanParams });
    }
  },
  getAvailabilitySlot: (id) => api.get(`/scheduling/availability-slots/${id}/`),
  createAvailabilitySlot: (data) => api.post('/scheduling/availability-slots/create_slot/', data),
  updateAvailabilitySlot: (id, data) => api.put(`/scheduling/availability-slots/${id}/`, data),
  updateAvailabilitySlotPartial: (id, data) => api.patch(`/scheduling/availability-slots/${id}/`, data),
  deleteAvailabilitySlot: (id) => api.delete(`/scheduling/availability-slots/${id}/`),
  
  // الأيام غير المتاحة
  getUnavailableDates: (params) => api.get('/scheduling/unavailable-dates/', { params }),
  getUnavailableDate: (id) => api.get(`/scheduling/unavailable-dates/${id}/`),
  createUnavailableDate: (data) => api.post('/scheduling/unavailable-dates/', data),
  updateUnavailableDate: (id, data) => api.put(`/scheduling/unavailable-dates/${id}/`, data),
  updateUnavailableDatePartial: (id, data) => api.patch(`/scheduling/unavailable-dates/${id}/`, data),
  deleteUnavailableDate: (id) => api.delete(`/scheduling/unavailable-dates/${id}/`),
};

// خدمات المدفوعات
const paymentService = {
  getPayments: () => api.get('/payments/'),
  getPayment: (id) => api.get(`/payments/${id}/`),
  createPayment: (data) => api.post('/payments/create/', data),
  createPaymentSession: (data) => api.post('/payments/create-session/', data),
  createPaymentIntent: (data) => api.post('/payments/create-intent/', data),
  getDashboardLink: () => api.get('/payments/dashboard-link/'),
  onboardProvider: (data) => api.post('/payments/onboard/', data),
  getPaymentStatus: () => api.get('/payments/status/'),
  getTransactions: () => api.get('/payments/'), // قائمة المعاملات المالية (نفس getPayments)
};

// خدمات الإشعارات
const notificationService = {
  // الإشعارات
  getNotifications: () => api.get('/notifications/notifications/'),
  getUnreadNotifications: () => api.get('/notifications/notifications/unread/'),
  getNotification: (id) => api.get(`/notifications/notifications/${id}/`),
  markAllAsRead: () => api.put('/notifications/notifications/read_all/'),
  markAsRead: (id) => api.put(`/notifications/notifications/${id}/read/`),
  
  // إعدادات الإشعارات
  getSettings: () => api.get('/notifications/settings/my_settings/'),
  createSettings: (data) => api.post('/notifications/settings/', data),
  updateSettings: (data) => api.patch('/notifications/settings/update_settings/', data),
  
  // قوالب الإشعارات
  getTemplates: () => api.get('/notifications/templates/'),
  getTemplate: (id) => api.get(`/notifications/templates/${id}/`),
  
  // التحقق من رقم الهاتف
  sendVerification: (data) => api.post('/notifications/sms/send_verification/', data),
  verifyPhone: (data) => api.post('/notifications/sms/verify_phone/', data),
  
  // إطلاق إشعارات محددة
  triggerRegistration: (data) => api.post('/notifications/trigger/registration/', data),
  triggerProfileUpdate: (data) => api.post('/notifications/trigger/profile-update/', data),
  triggerAlistProVerification: (data) => api.post('/notifications/trigger/alistpro-verification/', data),
  triggerAlistProOnboarding: (data) => api.post('/notifications/trigger/alistpro-onboarding/', data),
};

// إضافة كائن proService لسهولة الاستخدام في الواجهة
const proService = {
  // الحصول على المحترفين المميزين للصفحة الرئيسية
  getFeaturedPros: (limit = 4) => api.get('/alistpros/profiles/', { params: { limit, is_featured: true } }),
  
  // الحصول على المحترفين الأعلى تقييماً
  getTopRatedPros: (limit = 4) => api.get('/alistpros/profiles/', { params: { limit, ordering: '-rating' } }),
  
  // البحث عن المحترفين
  searchPros: (params) => api.get('/alistpros/profiles/', { params }),
  getProfiles: (params) => api.get('/alistpros/profiles/', { params }),
  // معلومات الملف الشخصي للمحترف
  getProfile: (id) => alistProsService.getProfile(id),
  getProfileDetail: (id) => alistProsService.getProfileDetail(id),
  createProfile: (data) => alistProsService.createProfile(data),
  updateProfile: (data) => alistProsService.updateProfile(data),
  
  // معرض الأعمال
  getPortfolio: () => alistProsService.getPortfolio(),
  createPortfolioItem: (data) => alistProsService.createPortfolio(data),
  updatePortfolioItem: (id, data) => alistProsService.updatePortfolio(id, data),
  deletePortfolioItem: (id) => alistProsService.deletePortfolio(id),
  getPortfolioItem: (id) => alistProsService.getPortfolioItem(id),
  
  // الفئات والخدمات
  getCategories: () => alistProsService.getCategories(),
  getServices: () => alistProsService.getServices(),
  
  // التقييمات
  getReviews: (proId) => alistProsService.getReviews(proId),
  
  // المواعيد
  getAppointments: () => schedulingService.getAppointments(),
  getUpcomingAppointments: () => schedulingService.getUpcomingAppointments(),
  updateAppointmentStatus: (id, status) => {
    if (status === 'completed') {
      return schedulingService.completeAppointment(id);
    } else if (status === 'confirmed') {
      return schedulingService.confirmAppointment(id);
    } else if (status === 'cancelled') {
      return schedulingService.cancelAppointment(id);
    } else {
      return schedulingService.updateAppointmentPartial(id, { status });
    }
  },
  
  // جدول التوفر
  getAvailabilitySlots: () => schedulingService.getAvailabilitySlots(),
  createAvailabilitySlot: (data) => schedulingService.createAvailabilitySlot(data),
  updateAvailabilitySlot: (id, data) => schedulingService.updateAvailabilitySlot(id, data),
  deleteAvailabilitySlot: (id) => schedulingService.deleteAvailabilitySlot(id),
  
  // الأيام غير المتاحة
  getUnavailableDates: () => schedulingService.getUnavailableDates(),
  createUnavailableDate: (data) => schedulingService.createUnavailableDate(data),
  deleteUnavailableDate: (id) => schedulingService.deleteUnavailableDate(id),
  
  // المدفوعات
  getTransactions: () => paymentService.getTransactions(),
  getDashboardLink: () => paymentService.getDashboardLink(),
  onboardPayment: (data) => paymentService.onboardProvider(data),
  
  // الإشعارات
  getNotifications: () => notificationService.getNotifications(),
  getUnreadNotifications: () => notificationService.getUnreadNotifications(),
};

// خدمات الحجوزات (من منظور العميل)
const bookingService = {
  getBookings: () => schedulingService.getAppointments(),
  getBooking: (id) => schedulingService.getAppointment(id),
  createBooking: (data) => schedulingService.createAppointment(data),
  updateBooking: (id, data) => schedulingService.updateAppointmentPartial(id, data),
  cancelBooking: (id) => schedulingService.cancelAppointment(id),
  getProviderAvailability: (proId) => {
    if (!proId) return Promise.reject(new Error('Professional ID is required'));
    return schedulingService.getAvailabilitySlots({ alistpro: proId });
  },
  getProviderUnavailableDates: (proId) => schedulingService.getUnavailableDates({ alistpro: proId }),
};

// خدمة المدونة
const blogService = {
  getBlogs: () => api.get('/blogs/'),
  getBlog: (id) => api.get(`/blogs/${id}/`),
  getFeaturedPosts: (limit = 3) => api.get('/blogs/', { params: { featured: true, limit } }),
  createBlog: (data) => api.post('/blogs/', data),
  updateBlog: (id, data) => api.put(`/blogs/${id}/`, data),
  deleteBlog: (id) => api.delete(`/blogs/${id}/`),
  getCategories: () => api.get('/blogs/categories/'),
};

// خدمة الخدمات
const serviceService = {
  getServices: () => api.get('/services/'),
  getService: (id) => api.get(`/services/${id}/`),
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/alistpros/categories/', { params });
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // إرجاع بيانات احتياطية
      return {
        data: {
          results: [
            { id: 'plumbing', name: 'Plumbing' },
            { id: 'electrical', name: 'Electrical' },
            { id: 'carpentry', name: 'Carpentry' },
            { id: 'painting', name: 'Painting' },
            { id: 'cleaning', name: 'Cleaning' },
            { id: 'furniture_moving', name: 'Furniture Moving' },
            { id: 'air_conditioning', name: 'Air Conditioning' },
            { id: 'metalwork', name: 'Metalwork' },
            { id: 'landscaping', name: 'Landscaping' },
            { id: 'flooring', name: 'Flooring' },
          ]
        }
      };
    }
  },
  searchServices: (params) => api.get('/services/search/', { params }),
  getFeaturedServices: () => api.get('/services/featured/'),
  getPopularServices: async () => {
    try {
      const response = await api.get('/alistpros/categories/', { params: { popular: true, limit: 8 } });
      return response;
    } catch (error) {
      console.error('Error fetching popular services:', error);
      return {
        data: {
          results: [
            { id: 'plumbing', name: 'Plumbing' },
            { id: 'electrical', name: 'Electrical' },
            { id: 'carpentry', name: 'Carpentry' },
            { id: 'painting', name: 'Painting' },
          ]
        }
      };
    }
  },
  getServiceById: (id) => api.get(`/services/categories/${id}/`),
};

// خدمة المستخدم
const userService = {
  getUser: (id) => api.get(`/users/${id}/`),
  updateUser: (id, data) => api.put(`/users/${id}/`, data),
  updateUserPartial: (id, data) => api.patch(`/users/${id}/`, data),
  forgotPassword: (email) => api.post('/users/password-reset/', { email }),
  resetPassword: (data) => api.post('/users/password-reset/confirm/', data),
  ...authService, // تضمين خدمات المصادقة
};

// إعادة تسمية paymentService لتتوافق مع الاستدعاءات الحالية
const paymentsService = paymentService;

// إعادة تسمية notificationService لتتوافق مع الاستدعاءات الحالية
const notificationsService = notificationService;

// خدمات العناوين (المطلوبة للماب)
const addressService = {
  // Get all addresses for authenticated user
  getAddresses: (params) => api.get('/core/addresses/', { params }),
  
  // Get primary address
  getPrimaryAddress: () => api.get('/core/addresses/primary/'),
  
  // Create new address
  createAddress: (data) => api.post('/core/addresses/', data),
  
  // Create address with geocoding
  createAddressWithGeocoding: (data) => api.post('/core/addresses/create_with_geocoding/', data),
  
  // Update address
  updateAddress: (id, data) => api.put(`/core/addresses/${id}/`, data),
  
  // Delete address
  deleteAddress: (id) => api.delete(`/core/addresses/${id}/`),
  
  // Set address as primary
  setPrimaryAddress: (id) => api.post(`/core/addresses/${id}/set_primary/`),
  
  // Geocoding services
  geocodeAddress: (address) => api.post('/core/addresses/geocode/', { address }),
  reverseGeocode: (lat, lng) => api.post('/core/addresses/reverse_geocode/', { latitude: lat, longitude: lng }),
  
  // Get nearby addresses for map
  getNearbyAddresses: (lat, lng, radius = 10) => api.get('/core/addresses/nearby/', {
    params: { lat, lng, radius }
  }),
};

// تصدير الواجهة الافتراضية لدعم الكود القديم
export default api;

// تصدير جميع الخدمات
export {
  api,
  authService,
  alistProsService,
  messagingService,
  schedulingService,
  paymentService,
  paymentsService,
  notificationService,
  notificationsService,
  proService,
  bookingService,
  blogService,
  serviceService,
  userService,
  addressService,
};