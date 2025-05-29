import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import paymentService from '../services/paymentService';

// بيانات تجريبية لطرق الدفع في حالة عدم توفر API
// Demo payment methods data when API is not available
const demoPaymentMethods = [
  {
    id: 'pm_1',
    type: 'card',
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2025,
      name: 'محمد أحمد'
    },
    is_default: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() // قبل 30 يوم
  },
  {
    id: 'pm_2',
    type: 'card',
    card: {
      brand: 'mastercard',
      last4: '8765',
      exp_month: 8,
      exp_year: 2024,
      name: 'محمد أحمد'
    },
    is_default: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() // قبل 15 يوم
  }
];

// بيانات تجريبية للمعاملات في حالة عدم توفر API
// Demo transactions data when API is not available
const demoTransactions = [
  {
    id: 'txn_1',
    amount: 150.00,
    currency: 'SAR',
    status: 'completed',
    payment_method: {
      id: 'pm_1',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242'
      }
    },
    description: 'خدمة سباكة',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // قبل يومين
    service_provider: {
      id: 'sp_1',
      name: 'أحمد السباك',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  },
  {
    id: 'txn_2',
    amount: 200.00,
    currency: 'SAR',
    status: 'completed',
    payment_method: {
      id: 'pm_2',
      type: 'card',
      card: {
        brand: 'mastercard',
        last4: '8765'
      }
    },
    description: 'خدمة كهرباء',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // قبل أسبوع
    service_provider: {
      id: 'sp_2',
      name: 'محمد الكهربائي',
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg'
    }
  },
  {
    id: 'txn_3',
    amount: 350.00,
    currency: 'SAR',
    status: 'completed',
    payment_method: {
      id: 'pm_1',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242'
      }
    },
    description: 'تصميم ديكور',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // قبل أسبوعين
    service_provider: {
      id: 'sp_3',
      name: 'سارة المصممة',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
    }
  }
];

/**
 * هوك مخصص للتعامل مع المدفوعات وطرق الدفع
 * Custom hook for handling payments and payment methods
 */
export const usePayments = () => {
  const { token, isAuthenticated } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // إضافة وضع تجريبي في حالة عدم توفر API
  // Add demo mode when API is not available
  const isDemoMode = !token || process.env.REACT_APP_USE_DEMO_DATA === 'true';

  /**
   * جلب طرق الدفع المحفوظة للمستخدم
   * Fetch user's saved payment methods
   */
  const fetchPaymentMethods = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isDemoMode) {
        // استخدام البيانات التجريبية في حالة عدم توفر API
        // Use demo data when API is not available
        await new Promise(resolve => setTimeout(resolve, 500)); // تأخير اصطناعي لمحاكاة الشبكة
        setPaymentMethods(demoPaymentMethods);
      } else {
        // استخدام API الحقيقي
        // Use real API
        const response = await paymentService.getPaymentMethods(token);
        setPaymentMethods(response.data);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('فشل في جلب طرق الدفع. يرجى المحاولة مرة أخرى.');
      
      // في حالة الخطأ، استخدم البيانات التجريبية
      // In case of error, use demo data
      setPaymentMethods(demoPaymentMethods);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, isDemoMode]);

  /**
   * إضافة طريقة دفع جديدة
   * Add a new payment method
   * @param {Object} paymentData - بيانات طريقة الدفع
   * @returns {Promise} وعد بنتيجة العملية
   */
  const addPaymentMethod = useCallback(async (paymentData) => {
    if (!isAuthenticated || !token) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await paymentService.addPaymentMethod(token, paymentData);
      await fetchPaymentMethods(); // تحديث قائمة طرق الدفع
      return response.data;
    } catch (err) {
      console.error('Error adding payment method:', err);
      setError('فشل في إضافة طريقة الدفع. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchPaymentMethods]);

  /**
   * حذف طريقة دفع
   * Delete a payment method
   * @param {string} paymentMethodId - معرف طريقة الدفع
   * @returns {Promise} وعد بنتيجة العملية
   */
  const deletePaymentMethod = useCallback(async (paymentMethodId) => {
    if (!isAuthenticated || !token) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await paymentService.deletePaymentMethod(token, paymentMethodId);
      await fetchPaymentMethods(); // تحديث قائمة طرق الدفع
      return true;
    } catch (err) {
      console.error(`Error deleting payment method ${paymentMethodId}:`, err);
      setError('فشل في حذف طريقة الدفع. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchPaymentMethods]);

  /**
   * تعيين طريقة دفع افتراضية
   * Set default payment method
   * @param {string} paymentMethodId - معرف طريقة الدفع
   * @returns {Promise} وعد بنتيجة العملية
   */
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId) => {
    if (!isAuthenticated || !token) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await paymentService.setDefaultPaymentMethod(token, paymentMethodId);
      await fetchPaymentMethods(); // تحديث قائمة طرق الدفع
      return true;
    } catch (err) {
      console.error(`Error setting default payment method ${paymentMethodId}:`, err);
      setError('فشل في تعيين طريقة الدفع الافتراضية. يرجى المحاولة مرة أخرى.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchPaymentMethods]);

  /**
   * جلب سجل المعاملات للمستخدم
   * Fetch user's transaction history
   */
  const fetchTransactionHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isDemoMode) {
        // استخدام البيانات التجريبية في حالة عدم توفر API
        // Use demo data when API is not available
        await new Promise(resolve => setTimeout(resolve, 500)); // تأخير اصطناعي لمحاكاة الشبكة
        setTransactions(demoTransactions);
      } else {
        // استخدام API الحقيقي
        // Use real API
        const response = await paymentService.getTransactionHistory(token);
        setTransactions(response.data);
      }
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError('فشل في جلب سجل المعاملات. يرجى المحاولة مرة أخرى.');
      
      // في حالة الخطأ، استخدم البيانات التجريبية
      // In case of error, use demo data
      setTransactions(demoTransactions);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, isDemoMode]);

  /**
   * جلب تفاصيل معاملة محددة
   * Get details of a specific transaction
   * @param {string} transactionId - معرف المعاملة
   * @returns {Promise} وعد بتفاصيل المعاملة
   */
  const getTransactionDetails = useCallback(async (transactionId) => {
    if (!isAuthenticated || !token) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await paymentService.getTransactionDetails(token, transactionId);
      return response.data;
    } catch (err) {
      console.error(`Error fetching transaction details for ${transactionId}:`, err);
      setError('فشل في جلب تفاصيل المعاملة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  /**
   * معالجة دفعة لحجز
   * Process payment for a booking
   * @param {string} bookingId - معرف الحجز
   * @param {Object} paymentDetails - تفاصيل الدفع
   * @returns {Promise} وعد بنتيجة العملية
   */
  const processPayment = useCallback(async (bookingId, paymentDetails) => {
    if (!isAuthenticated || !token) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await paymentService.processPayment(token, bookingId, paymentDetails);
      await fetchTransactionHistory(); // تحديث سجل المعاملات
      return response.data;
    } catch (err) {
      console.error(`Error processing payment for booking ${bookingId}:`, err);
      setError('فشل في معالجة الدفع. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchTransactionHistory]);

  /**
   * إصدار استرداد لمعاملة
   * Issue a refund for a transaction
   * @param {string} transactionId - معرف المعاملة
   * @param {Object} refundDetails - تفاصيل الاسترداد
   * @returns {Promise} وعد بنتيجة العملية
   */
  const issueRefund = useCallback(async (transactionId, refundDetails) => {
    if (!isAuthenticated || !token) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await paymentService.issueRefund(token, transactionId, refundDetails);
      await fetchTransactionHistory(); // تحديث سجل المعاملات
      return response.data;
    } catch (err) {
      console.error(`Error issuing refund for transaction ${transactionId}:`, err);
      setError('فشل في إصدار الاسترداد. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchTransactionHistory]);

  // تحميل طرق الدفع وسجل المعاملات عند تهيئة الهوك
  // Load payment methods and transaction history when the hook is initialized
  useEffect(() => {
    if (isAuthenticated) {
      fetchPaymentMethods();
      fetchTransactionHistory();
    }
  }, [isAuthenticated, fetchPaymentMethods, fetchTransactionHistory]);

  return {
    paymentMethods,
    transactions,
    loading,
    error,
    fetchPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    fetchTransactionHistory,
    getTransactionDetails,
    processPayment,
    issueRefund
  };
};
