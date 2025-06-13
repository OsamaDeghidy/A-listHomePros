import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://alisthomepros.com/api';

/**
 * خدمة الحجوزات للتعامل مع طلبات API المتعلقة بالحجوزات والمواعيد
 * Booking service for handling booking-related API requests
 */
class BookingService {
  /**
   * إنشاء حجز جديد
   * Create a new booking
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} bookingData - بيانات الحجز (booking data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  createBooking(token, bookingData) {
    return axios.post(`${API_URL}/bookings/`, bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * جلب قائمة الحجوزات للمستخدم
   * Get user's bookings
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} filters - مرشحات للبحث (filters)
   * @returns {Promise} وعد يحتوي على بيانات الحجوزات
   */
  getUserBookings(token, filters = {}) {
    return axios.get(`${API_URL}/bookings/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters
    });
  }

  /**
   * جلب قائمة الحجوزات للمحترف
   * Get professional's bookings
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} filters - مرشحات للبحث (filters)
   * @returns {Promise} وعد يحتوي على بيانات الحجوزات
   */
  getProBookings(token, filters = {}) {
    return axios.get(`${API_URL}/pro/bookings/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters
    });
  }

  /**
   * جلب تفاصيل حجز معين
   * Get specific booking details
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} bookingId - معرف الحجز (booking ID)
   * @returns {Promise} وعد يحتوي على بيانات الحجز
   */
  getBookingDetails(token, bookingId) {
    return axios.get(`${API_URL}/bookings/${bookingId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * تحديث حالة الحجز
   * Update booking status
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} bookingId - معرف الحجز (booking ID)
   * @param {string} status - الحالة الجديدة (new status)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  updateBookingStatus(token, bookingId, status) {
    return axios.patch(`${API_URL}/bookings/${bookingId}/status/`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إلغاء حجز
   * Cancel booking
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} bookingId - معرف الحجز (booking ID)
   * @param {Object} cancellationData - بيانات الإلغاء (cancellation data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  cancelBooking(token, bookingId, cancellationData = {}) {
    return axios.post(`${API_URL}/bookings/${bookingId}/cancel/`, cancellationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إعادة جدولة حجز
   * Reschedule booking
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} bookingId - معرف الحجز (booking ID)
   * @param {Object} rescheduleData - بيانات إعادة الجدولة (reschedule data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  rescheduleBooking(token, bookingId, rescheduleData) {
    return axios.post(`${API_URL}/bookings/${bookingId}/reschedule/`, rescheduleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إضافة تقييم لحجز
   * Add review for a booking
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} bookingId - معرف الحجز (booking ID)
   * @param {Object} reviewData - بيانات التقييم (review data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  addBookingReview(token, bookingId, reviewData) {
    return axios.post(`${API_URL}/bookings/${bookingId}/review/`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * جلب الأوقات المتاحة لمحترف معين
   * Get available time slots for a professional
   * @param {string} proId - معرف المحترف (professional ID)
   * @param {string} date - التاريخ (date)
   * @returns {Promise} وعد يحتوي على بيانات الأوقات المتاحة
   */
  getAvailableTimeSlots(proId, date) {
    return axios.get(`${API_URL}/professionals/${proId}/availability/`, {
      params: { date }
    });
  }
}

export default new BookingService(); 