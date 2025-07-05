import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://alisthomepros.com/api';

/**
 * خدمة المدفوعات للتعامل مع طلبات API المتعلقة بالدفع
 * Payment service for handling payment-related API requests
 */
class PaymentService {
  /**
   * جلب طرق الدفع المحفوظة للمستخدم
   * Get user's saved payment methods
   * @param {string} token - رمز المصادقة (authentication token)
   * @returns {Promise} وعد يحتوي على بيانات طرق الدفع
   */
  getPaymentMethods(token) {
    return axios.get(`${API_URL}/payments/methods/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إضافة طريقة دفع جديدة
   * Add a new payment method
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} paymentData - بيانات طريقة الدفع (payment method data)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  addPaymentMethod(token, paymentData) {
    return axios.post(`${API_URL}/payments/methods/`, paymentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * حذف طريقة دفع
   * Delete a payment method
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} paymentMethodId - معرف طريقة الدفع (payment method ID)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  deletePaymentMethod(token, paymentMethodId) {
    return axios.delete(`${API_URL}/payments/methods/${paymentMethodId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * تعيين طريقة دفع افتراضية
   * Set default payment method
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} paymentMethodId - معرف طريقة الدفع (payment method ID)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  setDefaultPaymentMethod(token, paymentMethodId) {
    return axios.put(`${API_URL}/payments/methods/${paymentMethodId}/default/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * معالجة دفعة لحجز
   * Process payment for a booking
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} bookingId - معرف الحجز (booking ID)
   * @param {Object} paymentDetails - تفاصيل الدفع (payment details)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  processPayment(token, bookingId, paymentDetails) {
    return axios.post(`${API_URL}/payments/process/${bookingId}/`, paymentDetails, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * جلب سجل المعاملات للمستخدم
   * Get user's transaction history
   * @param {string} token - رمز المصادقة (authentication token)
   * @returns {Promise} وعد يحتوي على بيانات المعاملات
   */
  getTransactionHistory(token) {
    return axios.get(`${API_URL}/payments/transactions/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * جلب تفاصيل معاملة محددة
   * Get details of a specific transaction
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} transactionId - معرف المعاملة (transaction ID)
   * @returns {Promise} وعد يحتوي على بيانات المعاملة
   */
  getTransactionDetails(token, transactionId) {
    return axios.get(`${API_URL}/payments/transactions/${transactionId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إصدار استرداد لمعاملة
   * Issue a refund for a transaction
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} transactionId - معرف المعاملة (transaction ID)
   * @param {Object} refundDetails - تفاصيل الاسترداد (refund details)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  issueRefund(token, transactionId, refundDetails) {
    return axios.post(`${API_URL}/payments/transactions/${transactionId}/refund/`, refundDetails, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ========== NEW MILESTONE PAYMENT METHODS ==========

  /**
   * دفع milestone محدد
   * Pay specific milestone
   * @param {string} token - رمز المصادقة
   * @param {number} milestoneId - معرف الـ milestone
   * @param {Object} paymentData - بيانات الدفع
   * @returns {Promise}
   */
  payMilestone(token, milestoneId, paymentData = {}) {
    return axios.post(`${API_URL}/payments/milestones/${milestoneId}/pay/`, paymentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * تأكيد دفع milestone
   * Confirm milestone payment
   * @param {string} token - رمز المصادقة
   * @param {number} milestoneId - معرف الـ milestone
   * @param {Object} confirmationData - بيانات التأكيد
   * @returns {Promise}
   */
  confirmMilestonePayment(token, milestoneId, confirmationData = {}) {
    return axios.post(`${API_URL}/payments/milestones/${milestoneId}/confirm-payment/`, confirmationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * تحديد milestone كمكتمل
   * Mark milestone as completed
   * @param {string} token - رمز المصادقة
   * @param {number} milestoneId - معرف الـ milestone
   * @param {Object} completionData - بيانات الإكمال
   * @returns {Promise}
   */
  markMilestoneCompleted(token, milestoneId, completionData = {}) {
    return axios.post(`${API_URL}/payments/milestones/${milestoneId}/mark-completed/`, completionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * موافقة العميل على milestone
   * Client approval for milestone
   * @param {string} token - رمز المصادقة
   * @param {number} milestoneId - معرف الـ milestone
   * @param {Object} approvalData - بيانات الموافقة
   * @returns {Promise}
   */
  approveMilestone(token, milestoneId, approvalData = {}) {
    return axios.post(`${API_URL}/payments/milestones/${milestoneId}/approve/`, approvalData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * الحصول على milestones لـ escrow معين
   * Get milestones for specific escrow
   * @param {string} token - رمز المصادقة
   * @param {number} escrowId - معرف الـ escrow
   * @returns {Promise}
   */
  getEscrowMilestones(token, escrowId) {
    return axios.get(`${API_URL}/payments/escrow/${escrowId}/milestones/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * الحصول على ملخص الدفع لـ quote
   * Get payment summary for quote
   * @param {string} token - رمز المصادقة
   * @param {number} quoteId - معرف الـ quote
   * @returns {Promise}
   */
  getPaymentSummary(token, quoteId) {
    return axios.get(`${API_URL}/payments/quotes/${quoteId}/payment-summary/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إنشاء escrow account من quote
   * Create escrow account from quote
   * @param {string} token - رمز المصادقة
   * @param {number} quoteId - معرف الـ quote
   * @param {Object} escrowData - بيانات الـ escrow
   * @returns {Promise}
   */
  createEscrowFromQuote(token, quoteId, escrowData = {}) {
    return axios.post(`${API_URL}/alistpros_profiles/quotes/${quoteId}/create-escrow/`, escrowData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

export default new PaymentService(); 