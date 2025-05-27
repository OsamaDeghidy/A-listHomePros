import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * خدمة المحترفين للتعامل مع طلبات API المتعلقة بالمهنيين ومقدمي الخدمات
 * Professional service for handling service professionals-related API requests
 */
class ProfessionalService {
  /**
   * البحث عن المحترفين
   * Search for professionals
   * @param {Object} filters - معايير البحث (search criteria)
   * @returns {Promise} وعد يحتوي على نتائج البحث
   */
  searchProfessionals(filters = {}) {
    return axios.get(`${API_URL}/professionals/search/`, {
      params: filters
    });
  }

  /**
   * جلب بيانات محترف محدد
   * Get specific professional details
   * @param {string} proId - معرف المحترف (professional ID)
   * @returns {Promise} وعد يحتوي على بيانات المحترف
   */
  getProfessionalDetails(proId) {
    return axios.get(`${API_URL}/professionals/${proId}/`);
  }

  /**
   * جلب تقييمات محترف
   * Get professional reviews
   * @param {string} proId - معرف المحترف (professional ID)
   * @param {Object} filters - مرشحات للبحث (optional filters)
   * @returns {Promise} وعد يحتوي على تقييمات المحترف
   */
  getProfessionalReviews(proId, filters = {}) {
    return axios.get(`${API_URL}/professionals/${proId}/reviews/`, {
      params: filters
    });
  }

  /**
   * جلب خدمات محترف
   * Get professional services
   * @param {string} proId - معرف المحترف (professional ID)
   * @returns {Promise} وعد يحتوي على خدمات المحترف
   */
  getProfessionalServices(proId) {
    return axios.get(`${API_URL}/professionals/${proId}/services/`);
  }

  /**
   * التسجيل كمحترف
   * Register as a professional
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} proData - بيانات المحترف (professional data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  registerAsProfessional(token, proData) {
    return axios.post(`${API_URL}/professionals/register/`, proData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * تحديث ملف المحترف
   * Update professional profile
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} profileData - بيانات الملف الشخصي (profile data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  updateProfile(token, profileData) {
    return axios.put(`${API_URL}/pro/profile/`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إضافة خدمة جديدة
   * Add a new service
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} serviceData - بيانات الخدمة (service data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  addService(token, serviceData) {
    return axios.post(`${API_URL}/pro/services/`, serviceData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * تحديث خدمة
   * Update a service
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} serviceId - معرف الخدمة (service ID)
   * @param {Object} serviceData - بيانات الخدمة المحدثة (updated service data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  updateService(token, serviceId, serviceData) {
    return axios.put(`${API_URL}/pro/services/${serviceId}/`, serviceData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * حذف خدمة
   * Delete a service
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} serviceId - معرف الخدمة (service ID)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  deleteService(token, serviceId) {
    return axios.delete(`${API_URL}/pro/services/${serviceId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * تحديث ساعات العمل
   * Update working hours
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} workingHours - ساعات العمل (working hours data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  updateWorkingHours(token, workingHours) {
    return axios.put(`${API_URL}/pro/working-hours/`, workingHours, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * جلب الإحصائيات
   * Get professional statistics
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} filters - مرشحات الإحصائيات (stats filters)
   * @returns {Promise} وعد يحتوي على الإحصائيات
   */
  getStatistics(token, filters = {}) {
    return axios.get(`${API_URL}/pro/statistics/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters
    });
  }

  /**
   * جلب العملاء
   * Get professional's clients
   * @param {string} token - رمز المصادقة (authentication token)
   * @returns {Promise} وعد يحتوي على قائمة العملاء
   */
  getClients(token) {
    return axios.get(`${API_URL}/pro/clients/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

export default new ProfessionalService(); 