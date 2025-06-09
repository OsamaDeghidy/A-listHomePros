import axios from 'axios';

// تكوين الإعدادات الأساسية للـ API
const API_URL = 'http://127.0.0.1:8000/api';

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
  // Professional Profiles
  getProfiles: (params) => api.get('/alistpros-profiles/professionals/', { params }),
  getProfile: (id) => api.get(`/alistpros-profiles/professionals/${id}/`),
  getMyProfile: () => api.get('/alistpros-profiles/my-profile/'),
  updateMyProfile: (data) => api.put('/alistpros-profiles/my-profile/', data),
  
  // Service Requests
  getServiceRequests: (params) => api.get('/alistpros-profiles/requests/', { params }),
  createServiceRequest: (data) => api.post('/alistpros-profiles/requests/', data),
  updateServiceRequest: (id, data) => api.put(`/alistpros-profiles/requests/${id}/`, data),
  deleteServiceRequest: (id) => api.delete(`/alistpros-profiles/requests/${id}/`),
  
  // Service Quotes
  getServiceQuotes: (params) => api.get('/alistpros-profiles/quotes/', { params }),
  createServiceQuote: (data) => api.post('/alistpros-profiles/quotes/', data),
  updateServiceQuote: (id, data) => api.put(`/alistpros-profiles/quotes/${id}/`, data),
  acceptServiceQuote: (id, data) => api.post(`/alistpros-profiles/quotes/${id}/accept/`, data),
  
  // Job Assignments  
  getJobAssignments: (params) => api.get('/alistpros-profiles/jobs/', { params }),
  updateJobAssignment: (id, data) => api.put(`/alistpros-profiles/jobs/${id}/`, data),
  
  // Availability Management
  getAvailability: (params) => api.get('/alistpros-profiles/availability/', { params }),
  addAvailability: (data) => api.post('/alistpros-profiles/availability/', data),
  updateAvailability: (id, data) => api.put(`/alistpros-profiles/availability/${id}/`, data),
  deleteAvailability: (id) => api.delete(`/alistpros-profiles/availability/${id}/`),
  
  // Time Off Management
  getTimeOff: (params) => api.get('/alistpros-profiles/time-off/', { params }),
  addTimeOff: (data) => api.post('/alistpros-profiles/time-off/', data),
  deleteTimeOff: (id) => api.delete(`/alistpros-profiles/time-off/${id}/`),
  
  // Reviews
  getReviews: (professionalId = null) => {
    const url = professionalId 
      ? `/alistpros-profiles/professionals/${professionalId}/reviews/`
      : '/alistpros-profiles/reviews/';
    return api.get(url);
  },
  createReview: (professionalId, data) => api.post(`/alistpros-profiles/professionals/${professionalId}/reviews/`, data),
  respondToReview: (reviewId, data) => api.post(`/alistpros-profiles/reviews/${reviewId}/respond/`, data),
  
  // Dashboard Data
  getProfessionalDashboard: () => api.get('/alistpros-profiles/dashboard/professional/'),
  getClientDashboard: () => api.get('/alistpros-profiles/dashboard/client/'),
  
  // Categories
  getCategories: () => api.get('/alistpros-profiles/categories/'),
  getPendingProfiles: () => api.get('/alistpros-profiles/admin/pending/'),
  
  // الملفات الشخصية
  getProfile: async (id) => {
    console.log('🔍 Getting profile for:', id);
    
    if (id === 'me') {
      // Try multiple approaches to get current user's profile
      try {
        // First try: get profile list and find current user's profile
        console.log('📡 Trying profiles list...');
        const profilesResponse = await api.get('/alistpros/profiles/');
        const profiles = profilesResponse.data.results || profilesResponse.data;
        console.log('📋 Found profiles:', profiles);
        
        if (profiles && profiles.length > 0) {
          // For now, assume first profile belongs to current user
          // In a real scenario, you'd filter by user ID
          const userProfile = profiles[0];
          console.log('✅ Using profile:', userProfile);
          return { data: userProfile };
        }
        
        // If no profiles found, fall back to user profile endpoint
        console.log('📡 No alistpro profiles found, trying user profile...');
        return await api.get('/users/profile/');
      } catch (err) {
        console.log('❌ Profiles list failed, trying user profile...', err.response?.status);
        // Fallback to user profile endpoint
        try {
          return await api.get('/users/profile/');
        } catch (userErr) {
          console.log('❌ User profile also failed:', userErr.response?.status);
          return { data: {} };
        }
      }
    } else {
      return api.get(`/alistpros/profiles/${id}/`);
    }
  },
  getProfileDetail: (id) => api.get(`/alistpros/profile-detail/${id}/`),
  createProfile: (data) => api.post('/alistpros/profiles/create/', data),
  updateProfile: async (profileId, data) => {
    // Try multiple endpoints to handle different scenarios
    console.log('🔄 Attempting profile update with data:', data);
    
    try {
      // First try: custom update endpoint
      console.log('📡 Trying: /alistpros/profiles/update/');
      return await api.patch('/alistpros/profiles/update/', data);
    } catch (error) {
      console.log('❌ Custom endpoint failed:', error.response?.status);
      
      // Second try: Get profile ID and use ViewSet endpoint
      try {
        console.log('📡 Trying to get profile list first...');
        const profilesResponse = await api.get('/alistpros/profiles/');
        const profiles = profilesResponse.data.results || profilesResponse.data;
        
        if (profiles && profiles.length > 0) {
          const userProfile = profiles[0]; // Assume first profile belongs to current user
          console.log('📡 Found profile, trying ViewSet update:', userProfile.id);
          return await api.patch(`/alistpros/profiles/${userProfile.id}/`, data);
        }
      } catch (listError) {
        console.log('❌ Profile list failed:', listError.response?.status);
      }
      
      // Third try: Create new profile if none exists
      try {
        console.log('📡 Trying to create new profile...');
        const createData = {
          business_name: 'Professional Service Provider',
          business_description: 'Professional service provider',
          ...data
        };
        return await api.post('/alistpros/profiles/create/', createData);
      } catch (createError) {
        console.log('❌ Create profile failed:', createError.response?.status);
        throw error; // Throw original error
      }
    }
  },
  updateProfilePartial: async (profileId, data) => {
    // Same logic as updateProfile
    return alistProsService.updateProfile(profileId, data);
  },
  
  // معرض الأعمال
  getPortfolio: () => api.get('/alistpros/portfolio/'),
  getPortfolioItem: (id) => api.get(`/alistpros/portfolio/${id}/`),
  createPortfolioItem: (data) => api.post('/alistpros/portfolio/', data),
  updatePortfolioItem: (id, data) => api.put(`/alistpros/portfolio/${id}/`, data),
  deletePortfolioItem: (id) => api.delete(`/alistpros/portfolio/${id}/`),
  
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

// خدمات الرسائل والإشعارات
const messagingService = {
  // المحادثات
  getConversations: () => api.get('/messaging/conversations/'),
  getConversation: (id) => api.get(`/messaging/conversations/${id}/`),
  createConversation: (data) => api.post('/messaging/conversations/', data),
  updateConversation: (id, data) => api.put(`/messaging/conversations/${id}/`, data),
  deleteConversation: (id) => api.delete(`/messaging/conversations/${id}/`),
  markConversationAsRead: (id) => api.post(`/messaging/conversations/${id}/mark_read/`),
  
  // الرسائل
  getMessages: (conversationId) => api.get(`/messaging/conversations/${conversationId}/messages/`),
  getMessage: (id) => api.get(`/messaging/messages/${id}/`),
  sendMessage: (conversationId, data) => api.post(`/messaging/conversations/${conversationId}/messages/`, data),
  updateMessage: (conversationId, messageId, data) => api.put(`/messaging/conversations/${conversationId}/messages/${messageId}/`, data),
  deleteMessage: (conversationId, messageId) => api.delete(`/messaging/conversations/${conversationId}/messages/${messageId}/`),
  markMessageAsRead: (conversationId, messageId) => api.post(`/messaging/conversations/${conversationId}/messages/${messageId}/mark_read/`),
  
  // الإشعارات
  getNotifications: () => api.get('/messaging/notifications/'),
  getNotification: (id) => api.get(`/messaging/notifications/${id}/`),
  markAllNotificationsAsRead: () => api.post('/messaging/notifications/mark_all_read/'),
  markNotificationAsRead: (id) => api.post(`/messaging/notifications/${id}/mark_read/`),
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
  // معلومات الملف الشخصي للمحترف
  getProfile: (id) => alistProsService.getProfile(id),
  getProfileDetail: (id) => alistProsService.getProfileDetail(id),
  createProfile: (data) => alistProsService.createProfile(data),
  updateProfile: (data) => alistProsService.updateProfile(data),
  
  // معرض الأعمال
  getPortfolio: () => alistProsService.getPortfolio(),
  createPortfolioItem: (data) => alistProsService.createPortfolioItem(data),
  updatePortfolioItem: (id, data) => alistProsService.updatePortfolioItem(id, data),
  deletePortfolioItem: (id) => alistProsService.deletePortfolioItem(id),
  
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
};