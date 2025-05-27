import axios from 'axios';
import { API_URL } from '../config/constants';

/**
 * ReviewService - خدمة للتعامل مع المراجعات والتقييمات
 */
class ReviewService {
  /**
   * الحصول على جميع المراجعات مع إمكانية البحث والترتيب والتصفية
   * @param {Object} params معلمات البحث والتصفية
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getAllReviews(params = {}) {
    return axios.get(`${API_URL}/api/reviews/`, { params })
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching reviews:', error);
        throw error;
      });
  }

  /**
   * الحصول على تفاصيل مراجعة محددة بواسطة المعرف
   * @param {string} reviewId معرف المراجعة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getReviewDetails(reviewId) {
    return axios.get(`${API_URL}/api/reviews/${reviewId}/`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching review ${reviewId}:`, error);
        throw error;
      });
  }

  /**
   * إنشاء مراجعة جديدة
   * @param {string} token رمز المصادقة 
   * @param {Object} reviewData بيانات المراجعة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  createReview(token, reviewData) {
    return axios.post(`${API_URL}/api/reviews/`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.data)
      .catch(error => {
        console.error('Error creating review:', error);
        throw error;
      });
  }

  /**
   * تحديث مراجعة موجودة
   * @param {string} token رمز المصادقة
   * @param {string} reviewId معرف المراجعة
   * @param {Object} reviewData بيانات المراجعة المحدثة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  updateReview(token, reviewId, reviewData) {
    return axios.put(`${API_URL}/api/reviews/${reviewId}/`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error updating review ${reviewId}:`, error);
        throw error;
      });
  }

  /**
   * حذف مراجعة
   * @param {string} token رمز المصادقة
   * @param {string} reviewId معرف المراجعة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  deleteReview(token, reviewId) {
    return axios.delete(`${API_URL}/api/reviews/${reviewId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error deleting review ${reviewId}:`, error);
        throw error;
      });
  }

  /**
   * الحصول على مراجعات لمهني محدد
   * @param {string} professionalId معرف المهني
   * @param {Object} params معلمات إضافية للتصفية
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getReviewsByProfessional(professionalId, params = {}) {
    return axios.get(`${API_URL}/api/professionals/${professionalId}/reviews/`, { params })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching reviews for professional ${professionalId}:`, error);
        throw error;
      });
  }

  /**
   * الحصول على مراجعات لخدمة محددة
   * @param {string} serviceId معرف الخدمة
   * @param {Object} params معلمات إضافية للتصفية
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getReviewsByService(serviceId, params = {}) {
    return axios.get(`${API_URL}/api/services/${serviceId}/reviews/`, { params })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching reviews for service ${serviceId}:`, error);
        throw error;
      });
  }

  /**
   * الإعجاب بمراجعة
   * @param {string} token رمز المصادقة
   * @param {string} reviewId معرف المراجعة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  likeReview(token, reviewId) {
    return axios.post(`${API_URL}/api/reviews/${reviewId}/like/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error liking review ${reviewId}:`, error);
        throw error;
      });
  }

  /**
   * إلغاء الإعجاب بمراجعة
   * @param {string} token رمز المصادقة
   * @param {string} reviewId معرف المراجعة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  unlikeReview(token, reviewId) {
    return axios.delete(`${API_URL}/api/reviews/${reviewId}/like/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error unliking review ${reviewId}:`, error);
        throw error;
      });
  }

  /**
   * إضافة تعليق على مراجعة
   * @param {string} token رمز المصادقة
   * @param {string} reviewId معرف المراجعة
   * @param {string} comment نص التعليق
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  addComment(token, reviewId, comment) {
    return axios.post(`${API_URL}/api/reviews/${reviewId}/comments/`, { content: comment }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error adding comment to review ${reviewId}:`, error);
        throw error;
      });
  }

  /**
   * رفع صورة لمراجعة
   * @param {string} token رمز المصادقة
   * @param {string} reviewId معرف المراجعة
   * @param {File} imageFile ملف الصورة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  uploadReviewImage(token, reviewId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return axios.post(`${API_URL}/api/reviews/${reviewId}/images/`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error uploading image for review ${reviewId}:`, error);
        throw error;
      });
  }

  /**
   * الإبلاغ عن مراجعة غير مناسبة
   * @param {string} token رمز المصادقة
   * @param {string} reviewId معرف المراجعة
   * @param {string} reason سبب الإبلاغ
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  reportReview(token, reviewId, reason) {
    return axios.post(`${API_URL}/api/reviews/${reviewId}/report/`, { reason }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.data)
      .catch(error => {
        console.error(`Error reporting review ${reviewId}:`, error);
        throw error;
      });
  }

  /**
   * البحث في المراجعات
   * @param {string} query مصطلح البحث
   * @param {Object} filters مرشحات إضافية
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  searchReviews(query, filters = {}) {
    return axios.get(`${API_URL}/api/reviews/search/`, { 
      params: { 
        q: query,
        ...filters
      }
    })
      .then(response => response.data)
      .catch(error => {
        console.error('Error searching reviews:', error);
        throw error;
      });
  }

  /**
   * الحصول على ملخص التقييمات لمهني
   * @param {string} professionalId معرف المهني
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getProfessionalRatingSummary(professionalId) {
    return axios.get(`${API_URL}/api/professionals/${professionalId}/rating-summary/`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching rating summary for professional ${professionalId}:`, error);
        throw error;
      });
  }

  /**
   * الحصول على ملخص التقييمات لخدمة
   * @param {string} serviceId معرف الخدمة
   * @returns {Promise} وعد بالبيانات أو خطأ
   */
  getServiceRatingSummary(serviceId) {
    return axios.get(`${API_URL}/api/services/${serviceId}/rating-summary/`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching rating summary for service ${serviceId}:`, error);
        throw error;
      });
  }
}

export default new ReviewService(); 