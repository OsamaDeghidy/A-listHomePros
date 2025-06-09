import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { paymentService, schedulingService, alistProsService } from '../services/api';
import { 
  FaSearch, 
  FaFileDownload, 
  FaFilter, 
  FaCreditCard, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaSpinner,
  FaExclamationCircle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDollarSign,
  FaReceipt,
  FaEye,
  FaChartLine,
  FaCalendarAlt,
  FaTimesCircle,
  FaUniversity,
  FaWallet,
  FaMobileAlt,
  FaShieldAlt,
  FaUndo
} from 'react-icons/fa';

const PaymentHistoryPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [isSavingPaymentMethod, setIsSavingPaymentMethod] = useState(false);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalTransactions: 0,
    pendingAmount: 0,
    successfulTransactions: 0
  });

  // Credit card form state
  const [cardForm, setCardForm] = useState({
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvc: '',
    cardholder_name: '',
    is_default: false
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/payment-history');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
      fetchPaymentMethods();
    }
  }, [isAuthenticated]);

  // Filter transactions
  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter, dateFilter]);

    const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getPayments();
      const paymentsData = response.data.results || response.data || [];
      
      // Enhance payments with service details
      const enhancedPayments = await Promise.all(
        paymentsData.map(async (payment) => {
          try {
            // Get appointment details if available
            if (payment.appointment_id) {
              const appointmentRes = await schedulingService.getAppointment(payment.appointment_id);
              const appointment = appointmentRes.data;
              
              // Get professional details
              if (appointment.alistpro) {
                const alistproId = typeof appointment.alistpro === 'object' 
                  ? appointment.alistpro.id 
                  : appointment.alistpro;
                
                const proRes = await alistProsService.getProfileDetail(alistproId);
                
                return {
                  ...payment,
                  appointment,
                  professional: proRes.data
                };
              }
            }
            
            return payment;
          } catch (err) {
            console.error('Error enhancing payment:', err);
            return payment;
          }
        })
      );

      setTransactions(enhancedPayments);
      calculateStats(enhancedPayments);
    } catch (err) {
      console.error('Error fetching payments:', err);
      
      // If API fails, use mock data for demo purposes
      const mockTransactions = [
        {
          id: 'TXN-001',
          amount: 125.50,
              status: 'completed',
              type: 'payment',
          created_at: '2023-12-15T10:30:00Z',
          payment_method: 'Visa ****4832',
          description: 'Plumbing Service',
          appointment: {
            id: 'APT-001',
            service_type: 'Plumbing Repair'
          },
          professional: {
            business_name: 'ABC Plumbing Services'
          }
        },
        {
          id: 'TXN-002',
          amount: 89.99,
              status: 'pending',
              type: 'payment',
          created_at: '2023-12-14T14:15:00Z',
          payment_method: 'Mastercard ****1234',
          description: 'Electrical Work',
          appointment: {
            id: 'APT-002',
            service_type: 'Electrical Installation'
          },
          professional: {
            business_name: 'ElectricPro Solutions'
          }
        },
        {
          id: 'TXN-003',
          amount: 45.00,
          status: 'refunded',
          type: 'refund',
          created_at: '2023-12-13T09:20:00Z',
          payment_method: 'Visa ****4832',
          description: 'Service Cancellation Refund'
        }
      ];
      
      setTransactions(mockTransactions);
      calculateStats(mockTransactions);
      
      // Set error message but don't fail completely
      setError(isArabic ? 'تم تحميل بيانات تجريبية (فشل الاتصال بالخادم)' : 'Loaded demo data (server connection failed)');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      // Try to fetch from API first
      // const response = await paymentService.getPaymentMethods();
      // setPaymentMethods(response.data.results || response.data || []);
      
      // For now, use mock data with user-specific information
      const mockPaymentMethods = [
        {
          id: 1,
          type: 'credit_card',
          last_four: '4832',
          brand: 'visa',
          exp_month: 5,
          exp_year: 2025,
          cardholder_name: 'John Doe',
          is_default: true,
          created_at: '2023-10-15T10:30:00Z'
        },
        {
          id: 2,
          type: 'bank_account',
          last_four: '6789',
          bank_name: 'Bank of America',
          account_type: 'checking',
          is_default: false,
          created_at: '2023-09-20T14:20:00Z'
        }
      ];
      
      setPaymentMethods(mockPaymentMethods);
      } catch (err) {
      console.error('Error fetching payment methods:', err);
      // Keep empty array if API fails
      setPaymentMethods([]);
    }
  };

  const calculateStats = (payments) => {
    const stats = {
      totalSpent: 0,
      totalTransactions: payments.length,
      pendingAmount: 0,
      successfulTransactions: 0
    };

    payments.forEach(payment => {
      if (payment.status === 'completed' || payment.status === 'succeeded') {
        stats.totalSpent += parseFloat(payment.amount || 0);
        stats.successfulTransactions++;
      } else if (payment.status === 'pending') {
        stats.pendingAmount += parseFloat(payment.amount || 0);
      }
    });

    setStats(stats);
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trx => trx.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(trx => trx.type === typeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === 'last7days') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'last30days') {
        filterDate.setDate(now.getDate() - 30);
      } else if (dateFilter === 'last90days') {
        filterDate.setDate(now.getDate() - 90);
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(trx => new Date(trx.created_at) >= filterDate);
      }
    }
    
    // Apply search term
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(trx => 
        (trx.id && trx.id.toString().toLowerCase().includes(query)) ||
        (trx.description && trx.description.toLowerCase().includes(query)) ||
        (trx.professional?.business_name && trx.professional.business_name.toLowerCase().includes(query)) ||
        (trx.appointment?.service_type && trx.appointment.service_type.toLowerCase().includes(query))
      );
    }

    setFilteredTransactions(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { icon: FaCheck, text: isArabic ? 'مكتمل' : 'Completed', color: 'green' },
      succeeded: { icon: FaCheck, text: isArabic ? 'نجح' : 'Succeeded', color: 'green' },
      pending: { icon: FaClock, text: isArabic ? 'معلق' : 'Pending', color: 'yellow' },
      failed: { icon: FaTimes, text: isArabic ? 'فشل' : 'Failed', color: 'red' },
      canceled: { icon: FaTimes, text: isArabic ? 'ملغي' : 'Canceled', color: 'gray' },
      refunded: { icon: FaUndo, text: isArabic ? 'مرتد' : 'Refunded', color: 'blue' }
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

        return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="mr-1" size={10} />
        {config.text}
          </span>
        );
  };

  const getTransactionTypeIndicator = (type, amount, status) => {
    const isRefund = type === 'refund' || status === 'refunded';
    const color = isRefund ? 'text-green-600' : 'text-red-600';
    const sign = isRefund ? '+' : '-';
    
        return (
      <span className={`font-medium ${color}`}>
        {sign}{formatCurrency(amount)}
          </span>
        );
  };

  const handleAddPaymentMethod = () => {
    setShowAddPaymentMethod(true);
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف وسيلة الدفع هذه؟' : 'Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      // API call to delete payment method
      // await paymentService.deletePaymentMethod(methodId);
      
      // For now, remove from local state
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      alert(isArabic ? 'تم حذف وسيلة الدفع بنجاح' : 'Payment method deleted successfully');
    } catch (err) {
      console.error('Error deleting payment method:', err);
      alert(isArabic ? 'فشل في حذف وسيلة الدفع' : 'Failed to delete payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId) => {
    try {
      // API call to set default payment method
      // await paymentService.setDefaultPaymentMethod(methodId);
      
      // For now, update local state
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          is_default: method.id === methodId
        }))
      );
      
      alert(isArabic ? 'تم تحديث وسيلة الدفع الافتراضية' : 'Default payment method updated');
    } catch (err) {
      console.error('Error setting default payment method:', err);
      alert(isArabic ? 'فشل في تحديث وسيلة الدفع الافتراضية' : 'Failed to update default payment method');
    }
  };

  // Card number formatting
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Detect card brand
  const detectCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) {
      return 'visa';
    } else if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
      return 'mastercard';
    } else if (/^3[47]/.test(number)) {
      return 'amex';
    } else if (/^6/.test(number)) {
      return 'discover';
    } else {
      return 'unknown';
    }
  };

  // Get card brand display name
  const getCardBrandName = (brand) => {
    const brands = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      unknown: isArabic ? 'غير معروف' : 'Unknown'
    };
    return brands[brand] || brands.unknown;
  };

  // Card validation
  const validateCardForm = () => {
    const errors = {};
    
    // Card number validation
    const cardNumber = cardForm.card_number.replace(/\s/g, '');
    if (!cardNumber) {
      errors.card_number = isArabic ? 'رقم البطاقة مطلوب' : 'Card number is required';
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      errors.card_number = isArabic ? 'رقم البطاقة غير صحيح' : 'Invalid card number';
    }

    // Expiry validation
    if (!cardForm.expiry_month) {
      errors.expiry_month = isArabic ? 'شهر الانتهاء مطلوب' : 'Expiry month is required';
    }
    if (!cardForm.expiry_year) {
      errors.expiry_year = isArabic ? 'سنة الانتهاء مطلوبة' : 'Expiry year is required';
    }

    // CVC validation
    if (!cardForm.cvc) {
      errors.cvc = isArabic ? 'رمز الأمان مطلوب' : 'Security code is required';
    } else if (cardForm.cvc.length < 3 || cardForm.cvc.length > 4) {
      errors.cvc = isArabic ? 'رمز الأمان غير صحيح' : 'Invalid security code';
    }

    // Cardholder name validation
    if (!cardForm.cardholder_name.trim()) {
      errors.cardholder_name = isArabic ? 'اسم حامل البطاقة مطلوب' : 'Cardholder name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleCardFormChange = (field, value) => {
    if (field === 'card_number') {
      value = formatCardNumber(value);
    } else if (field === 'cvc') {
      value = value.replace(/[^0-9]/g, '').slice(0, 4);
    } else if (field === 'cardholder_name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setCardForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Save payment method
  const handleSavePaymentMethod = async () => {
    if (!validateCardForm()) {
      return;
    }

    setIsSavingPaymentMethod(true);

    try {
      // Prepare data for API
      const paymentData = {
        type: 'credit_card',
        card_number: cardForm.card_number.replace(/\s/g, ''),
        expiry_month: parseInt(cardForm.expiry_month),
        expiry_year: parseInt(cardForm.expiry_year),
        cvc: cardForm.cvc,
        cardholder_name: cardForm.cardholder_name,
        is_default: cardForm.is_default
      };

      // API call to save payment method
      // const response = await paymentService.addPaymentMethod(paymentData);
      
      // For now, add to local state with mock response
      const newMethod = {
        id: Date.now(),
        type: 'credit_card',
        last_four: cardForm.card_number.slice(-4),
        brand: detectCardBrand(cardForm.card_number),
        exp_month: cardForm.expiry_month,
        exp_year: cardForm.expiry_year,
        cardholder_name: cardForm.cardholder_name,
        is_default: cardForm.is_default
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      
      // Reset form
      setCardForm({
        card_number: '',
        expiry_month: '',
        expiry_year: '',
        cvc: '',
        cardholder_name: '',
        is_default: false
      });
      setFormErrors({});
      setSelectedPaymentType('');
      setShowAddPaymentMethod(false);

      alert(isArabic ? 'تم إضافة وسيلة الدفع بنجاح' : 'Payment method added successfully');

    } catch (err) {
      console.error('Error saving payment method:', err);
      alert(isArabic ? 'فشل في إضافة وسيلة الدفع' : 'Failed to add payment method');
    } finally {
      setIsSavingPaymentMethod(false);
    }
  };

  const resetPaymentMethodForm = () => {
    setCardForm({
      card_number: '',
      expiry_month: '',
      expiry_year: '',
      cvc: '',
      cardholder_name: '',
      is_default: false
    });
    setFormErrors({});
    setSelectedPaymentType('');
    setShowAddPaymentMethod(false);
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Transaction ID', 'Date', 'Description', 'Amount', 'Status', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(trx => [
        trx.id,
        formatDate(trx.created_at),
        `"${trx.description || (trx.professional?.business_name + ' - ' + trx.appointment?.service_type) || 'Payment'}"`,
        trx.amount,
        trx.status,
        `"${trx.payment_method || 'N/A'}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل المدفوعات...' : 'Loading payments...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaExclamationCircle className="text-red-600 text-4xl mb-4" />
        <p className="text-gray-800 font-medium mb-2">
          {isArabic ? 'خطأ في تحميل المدفوعات' : 'Error Loading Payments'}
        </p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isArabic ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'تاريخ المدفوعات | A-List Home Pros' : 'Payment History | A-List Home Pros'}</title>
        <meta name="description" content={isArabic ? 'عرض وإدارة تاريخ المدفوعات والإيصالات' : 'View and manage your payment history, transactions, and receipts.'} />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isArabic ? 'تاريخ المدفوعات' : 'Payment History'}
            </h1>
            <p className="text-gray-600">
              {isArabic ? 'عرض وإدارة المعاملات المالية السابقة والإيصالات' : 'View and manage your past transactions and payment receipts'}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
            </button>
            <button
              onClick={exportTransactions}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaFileDownload className="mr-2 h-4 w-4" />
              {isArabic ? 'تصدير' : 'Export'}
            </button>
            <button
              onClick={handleAddPaymentMethod}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              {isArabic ? 'إضافة وسيلة دفع' : 'Add Payment Method'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">{isArabic ? 'إجمالي المدفوع' : 'Total Spent'}</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <FaDollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">{isArabic ? 'المعاملات الناجحة' : 'Successful Transactions'}</p>
                <p className="text-3xl font-bold">{stats.successfulTransactions}</p>
              </div>
              <FaCheck className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">{isArabic ? 'مبلغ معلق' : 'Pending Amount'}</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.pendingAmount)}</p>
              </div>
              <FaClock className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">{isArabic ? 'إجمالي المعاملات' : 'Total Transactions'}</p>
                <p className="text-3xl font-bold">{stats.totalTransactions}</p>
              </div>
              <FaChartLine className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          </div>
          
          {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="relative w-full md:w-1/2">
                <input
                  type="text"
                placeholder={isArabic ? 'البحث في المعاملات...' : 'Search transactions...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle />
                </button>
              )}
              </div>
            </div>
            
          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'الحالة' : 'Status'}
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
                      <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
                      <option value="succeeded">{isArabic ? 'نجح' : 'Succeeded'}</option>
                      <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
                      <option value="failed">{isArabic ? 'فشل' : 'Failed'}</option>
                      <option value="refunded">{isArabic ? 'مرتد' : 'Refunded'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'النوع' : 'Type'}
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'جميع الأنواع' : 'All Types'}</option>
                      <option value="payment">{isArabic ? 'دفعة' : 'Payment'}</option>
                      <option value="refund">{isArabic ? 'استرداد' : 'Refund'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'فترة التاريخ' : 'Date Range'}
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">{isArabic ? 'كل الأوقات' : 'All Time'}</option>
                      <option value="last7days">{isArabic ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                      <option value="last30days">{isArabic ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
                      <option value="last90days">{isArabic ? 'آخر 90 يوم' : 'Last 90 Days'}</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {isArabic ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
          
          {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <FaCreditCard className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {isArabic ? 'لا توجد معاملات' : 'No transactions found'}
              </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                  ? (isArabic ? 'جرب تعديل الفلاتر لرؤية المزيد من النتائج' : 'Try adjusting your filters to see more results')
                  : (isArabic ? 'لم تقم بأي عمليات دفع بعد' : "You haven't made any payments yet")
                }
                </p>
                {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:underline font-medium"
                  >
                  {isArabic ? 'مسح جميع الفلاتر' : 'Clear all filters'}
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isArabic ? 'معرف المعاملة' : 'Transaction ID'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isArabic ? 'التاريخ' : 'Date'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isArabic ? 'الوصف' : 'Description'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isArabic ? 'المبلغ' : 'Amount'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isArabic ? 'الحالة' : 'Status'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isArabic ? 'وسيلة الدفع' : 'Payment Method'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isArabic ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                    <motion.tr 
                      key={transaction.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div>
                          {transaction.description || (
                            transaction.professional?.business_name 
                              ? `${transaction.professional.business_name} - ${transaction.appointment?.service_type || 'Service'}`
                              : 'Payment'
                          )}
                          {transaction.professional && (
                            <div className="text-xs text-gray-500">
                              {transaction.professional.business_name}
                            </div>
                          )}
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {getTransactionTypeIndicator(transaction.type, transaction.amount, transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.payment_method || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                            <FaEye />
                          </button>
                          {transaction.appointment && (
                            <Link
                              to={`/dashboard/appointments/${transaction.appointment.id}`}
                              className="text-green-600 hover:text-green-800"
                            >
                              {isArabic ? 'الموعد' : 'Appointment'}
                            </Link>
                          )}
                          {(transaction.status === 'completed' || transaction.status === 'succeeded') && (
                              <a
                              href={transaction.receipt_url || '#'}
                                className="text-gray-600 hover:text-gray-800"
                              target="_blank"
                              rel="noopener noreferrer"
                              >
                              <FaReceipt />
                              </a>
                            )}
                          </div>
                        </td>
                    </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Payment Methods Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isArabic ? 'وسائل الدفع' : 'Payment Methods'}
            </h2>
            <button
              onClick={handleAddPaymentMethod}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              {isArabic ? 'إضافة' : 'Add Method'}
            </button>
            </div>
            
          {/* Warning if no default payment method */}
          {paymentMethods.length > 0 && !paymentMethods.some(method => method.is_default) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FaExclamationCircle className="text-yellow-600 mt-1 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">
                    {isArabic ? 'لا توجد وسيلة دفع افتراضية' : 'No Default Payment Method'}
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {isArabic 
                      ? 'يُنصح بتعيين وسيلة دفع افتراضية لتسريع عمليات الدفع المستقبلية'
                      : 'We recommend setting a default payment method to speed up future payments'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <FaWallet className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {isArabic ? 'لا توجد وسائل دفع' : 'No Payment Methods'}
              </h3>
              <p className="text-gray-500 mb-4">
                {isArabic ? 'أضف وسيلة دفع لتسهيل عمليات الدفع' : 'Add a payment method to make payments easier'}
              </p>
              <button
                onClick={handleAddPaymentMethod}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                {isArabic ? 'إضافة وسيلة دفع' : 'Add Payment Method'}
              </button>
            </div>
          ) : (
              <div className="space-y-4">
              {paymentMethods.map((method) => (
                <motion.div 
                  key={method.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-3 rounded-lg mr-4">
                      {method.type === 'credit_card' ? (
                      <FaCreditCard className="text-blue-600" size={24} />
                      ) : method.type === 'bank_account' ? (
                        <FaUniversity className="text-blue-600" size={24} />
                      ) : (
                        <FaMobileAlt className="text-blue-600" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {method.type === 'credit_card' 
                          ? `${getCardBrandName(method.brand)} ${isArabic ? 'تنتهي بـ' : 'ending in'} ${method.last_four}`
                          : method.type === 'bank_account'
                          ? `${method.bank_name} ****${method.last_four}`
                          : `${isArabic ? 'محفظة رقمية' : 'Digital Wallet'} ****${method.last_four}`
                        }
                      </h3>
                      <p className="text-sm text-gray-500">
                        {method.type === 'credit_card' 
                          ? `${isArabic ? 'تنتهي في' : 'Expires'} ${method.exp_month}/${method.exp_year}`
                          : method.type === 'bank_account'
                          ? isArabic ? 'حساب بنكي' : 'Bank Account'
                          : isArabic ? 'محفظة رقمية' : 'Digital Wallet'
                        }
                      </p>
                      {method.cardholder_name && (
                        <p className="text-xs text-gray-400">{method.cardholder_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.is_default ? (
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {isArabic ? 'افتراضي' : 'Default'}
                  </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefaultPaymentMethod(method.id)}
                        className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200"
                      >
                        {isArabic ? 'جعل افتراضي' : 'Make Default'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-800"
                      title={isArabic ? 'حذف' : 'Delete'}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
                </div>
                
      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                {isArabic ? 'تفاصيل المعاملة' : 'Transaction Details'}
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="h-5 w-5" />
              </button>
                    </div>

            <div className="space-y-4">
                    <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'معرف المعاملة' : 'Transaction ID'}
                </label>
                <p className="text-gray-900 mt-1">{selectedTransaction.id}</p>
                    </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'المبلغ' : 'Amount'}
                </label>
                <p className="text-gray-900 mt-1 text-lg font-semibold">
                  {formatCurrency(selectedTransaction.amount)}
                </p>
                  </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'الحالة' : 'Status'}
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'التاريخ' : 'Date'}
                </label>
                <p className="text-gray-900 mt-1">{formatDate(selectedTransaction.created_at)}</p>
            </div>

              {selectedTransaction.professional && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {isArabic ? 'مقدم الخدمة' : 'Service Provider'}
                  </label>
                  <p className="text-gray-900 mt-1">{selectedTransaction.professional.business_name}</p>
          </div>
              )}

              {selectedTransaction.payment_method && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {isArabic ? 'وسيلة الدفع' : 'Payment Method'}
                  </label>
                  <p className="text-gray-900 mt-1">{selectedTransaction.payment_method}</p>
        </div>
              )}
      </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 bg-gray-600 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
              
              {(selectedTransaction.status === 'completed' || selectedTransaction.status === 'succeeded') && (
                <a
                  href={selectedTransaction.receipt_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaReceipt className="inline mr-2" />
                  {isArabic ? 'الإيصال' : 'Receipt'}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                {isArabic ? 'إضافة وسيلة دفع' : 'Add Payment Method'}
              </h3>
              <button
                onClick={resetPaymentMethodForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {!selectedPaymentType ? (
                /* Payment Method Selection */
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    {isArabic ? 'اختر نوع وسيلة الدفع' : 'Choose Payment Method Type'}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => setSelectedPaymentType('credit_card')}
                    >
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <FaCreditCard className="text-blue-600" size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">
                          {isArabic ? 'بطاقة ائتمان/خصم' : 'Credit/Debit Card'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isArabic ? 'Visa, Mastercard, American Express' : 'Visa, Mastercard, American Express'}
                        </p>
                      </div>
                    </button>

                    <button
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => alert(isArabic ? 'ميزة ربط الحساب البنكي قريباً' : 'Bank account integration coming soon')}
                    >
                      <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <FaUniversity className="text-green-600" size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">
                          {isArabic ? 'حساب بنكي' : 'Bank Account'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isArabic ? 'ربط مباشر مع حسابك البنكي' : 'Direct bank account linking'}
                        </p>
                      </div>
                    </button>

                    <button
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => alert(isArabic ? 'ميزة المحافظ الرقمية قريباً' : 'Digital wallet integration coming soon')}
                    >
                      <div className="bg-purple-100 p-3 rounded-lg mr-4">
                        <FaMobileAlt className="text-purple-600" size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">
                          {isArabic ? 'محفظة رقمية' : 'Digital Wallet'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isArabic ? 'Apple Pay, Google Pay, PayPal' : 'Apple Pay, Google Pay, PayPal'}
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Security Note */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <FaShieldAlt className="text-green-600 mt-1 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {isArabic ? 'مدفوعات آمنة' : 'Secure Payments'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {isArabic 
                            ? 'جميع المدفوعات مؤمنة بتشفير SSL ومتوافقة مع معايير PCI DSS للأمان المالي'
                            : 'All payments are secured with SSL encryption and PCI DSS compliant for financial security'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedPaymentType === 'credit_card' ? (
                /* Credit Card Form */
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <button
                      onClick={() => setSelectedPaymentType('')}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      ←
                    </button>
                    <h4 className="text-lg font-medium">
                      {isArabic ? 'إضافة بطاقة ائتمان' : 'Add Credit Card'}
                    </h4>
                  </div>

                  {/* Card Preview */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl mb-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <div className="text-lg font-bold">
                        {getCardBrandName(detectCardBrand(cardForm.card_number))}
                      </div>
                    </div>
                    <div className="mt-8">
                      <div className="text-2xl font-mono tracking-wider mb-4">
                        {cardForm.card_number || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs opacity-75 mb-1">
                            {isArabic ? 'اسم حامل البطاقة' : 'CARDHOLDER NAME'}
                          </div>
                          <div className="text-sm font-medium">
                            {cardForm.cardholder_name || (isArabic ? 'اسم حامل البطاقة' : 'CARDHOLDER NAME')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs opacity-75 mb-1">
                            {isArabic ? 'تاريخ الانتهاء' : 'EXPIRES'}
                          </div>
                          <div className="text-sm font-medium">
                            {cardForm.expiry_month && cardForm.expiry_year 
                              ? `${cardForm.expiry_month}/${cardForm.expiry_year.toString().slice(-2)}`
                              : 'MM/YY'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'اسم حامل البطاقة' : 'Cardholder Name'}
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.cardholder_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={isArabic ? 'الاسم كما هو مكتوب على البطاقة' : 'Name as it appears on card'}
                      value={cardForm.cardholder_name}
                      onChange={(e) => handleCardFormChange('cardholder_name', e.target.value)}
                    />
                    {formErrors.cardholder_name && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.cardholder_name}</p>
                    )}
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'رقم البطاقة' : 'Card Number'}
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.card_number ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      value={cardForm.card_number}
                      onChange={(e) => handleCardFormChange('card_number', e.target.value)}
                      maxLength="19"
                    />
                    {formErrors.card_number && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.card_number}</p>
                    )}
                  </div>

                  {/* Expiry and CVC */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'الشهر' : 'Month'}
                      </label>
                      <select
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.expiry_month ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={cardForm.expiry_month}
                        onChange={(e) => handleCardFormChange('expiry_month', e.target.value)}
                      >
                        <option value="">{isArabic ? 'الشهر' : 'Month'}</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      {formErrors.expiry_month && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.expiry_month}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'السنة' : 'Year'}
                      </label>
                      <select
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.expiry_year ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={cardForm.expiry_year}
                        onChange={(e) => handleCardFormChange('expiry_year', e.target.value)}
                      >
                        <option value="">{isArabic ? 'السنة' : 'Year'}</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                      {formErrors.expiry_year && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.expiry_year}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'رمز الأمان' : 'CVC'}
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.cvc ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="123"
                        value={cardForm.cvc}
                        onChange={(e) => handleCardFormChange('cvc', e.target.value)}
                        maxLength="4"
                      />
                      {formErrors.cvc && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.cvc}</p>
                      )}
                    </div>
                  </div>

                  {/* Default Payment Method */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_default"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={cardForm.is_default}
                      onChange={(e) => handleCardFormChange('is_default', e.target.checked)}
                    />
                    <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                      {isArabic ? 'جعل هذه وسيلة الدفع الافتراضية' : 'Make this the default payment method'}
                    </label>
                  </div>

                  {/* Security Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <FaShieldAlt className="text-blue-600 mt-1 mr-2" size={16} />
                      <p className="text-sm text-blue-800">
                        {isArabic 
                          ? 'بياناتك آمنة. نحن لا نحفظ بيانات البطاقة على خوادمنا ونستخدم تشفير متقدم.'
                          : 'Your data is secure. We don\'t store card details on our servers and use advanced encryption.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={resetPaymentMethodForm}
                className="flex-1 bg-gray-600 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                disabled={isSavingPaymentMethod}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              
              {selectedPaymentType === 'credit_card' && (
                <button
                  onClick={handleSavePaymentMethod}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isSavingPaymentMethod}
                >
                  {isSavingPaymentMethod ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <FaPlus className="inline mr-2" />
                      {isArabic ? 'إضافة البطاقة' : 'Add Card'}
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default PaymentHistoryPage; 