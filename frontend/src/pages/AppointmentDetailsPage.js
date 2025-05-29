import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { 
  schedulingService, 
  messagingService, 
  paymentService, 
  alistProsService 
} from '../services/api';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaComments,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaEdit,
  FaCreditCard,
  FaFileInvoice,
  FaTools
} from 'react-icons/fa';

const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [payment, setPayment] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/appointments/' + id);
      return;
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch appointment details
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchAppointmentDetails();
    }
  }, [isAuthenticated, id]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch appointment details
      const appointmentRes = await schedulingService.getAppointment(id);
      const appointmentData = appointmentRes.data;
      setAppointment(appointmentData);

      // Fetch professional details
      if (appointmentData.alistpro) {
        try {
          // Extract the correct ID - it could be alistpro.id or alistpro_id
          const alistproId = typeof appointmentData.alistpro === 'object' 
            ? appointmentData.alistpro.id || appointmentData.alistpro_id
            : appointmentData.alistpro;
            
          if (alistproId) {
            const proRes = await alistProsService.getProfileDetail(alistproId);
            setProfessional(proRes.data);
          }
        } catch (proErr) {
          console.error('Error fetching professional details:', proErr);
        }
      }

      // Fetch conversation if exists
      if (appointmentData.conversation_id) {
        try {
          const convRes = await messagingService.getConversation(appointmentData.conversation_id);
          setConversation(convRes.data);
        } catch (convErr) {
          console.error('Error fetching conversation:', convErr);
        }
      }

      // Fetch payment information if appointment is paid
      if (appointmentData.status === 'COMPLETED' || appointmentData.payment_id) {
        try {
          const paymentsRes = await paymentService.getPayments();
          const relatedPayment = paymentsRes.data.results?.find(
            payment => payment.appointment_id === appointmentData.id
          );
          if (relatedPayment) {
            setPayment(relatedPayment);
          }
        } catch (paymentErr) {
          console.error('Error fetching payment:', paymentErr);
        }
      }

    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setError(isArabic ? 'فشل في تحميل تفاصيل الموعد' : 'Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'REQUESTED':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    if (!status) return isArabic ? 'غير محدد' : 'Unknown';
    
    const statusMap = {
      'REQUESTED': isArabic ? 'مطلوب' : 'Requested',
      'PENDING': isArabic ? 'في الانتظار' : 'Pending', 
      'CONFIRMED': isArabic ? 'مؤكد' : 'Confirmed',
      'COMPLETED': isArabic ? 'مكتمل' : 'Completed',
      'CANCELLED': isArabic ? 'ملغي' : 'Cancelled'
    };
    
    return statusMap[status.toUpperCase()] || status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM format
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar key={i} className="text-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStar key={i} className="text-yellow-200" />
        );
      } else {
        stars.push(
          <FaStar key={i} className="text-gray-300" />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error || (isArabic ? 'الموعد غير موجود' : 'Appointment not found')}</p>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isArabic ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isArabic 
            ? `تفاصيل الموعد - ${appointment.service_category?.name || 'خدمة'} | A-List Home Pros`
            : `Appointment Details - ${appointment.service_category?.name || 'Service'} | A-List Home Pros`}
        </title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <FaArrowLeft className={`${isArabic ? 'ml-2' : 'mr-2'} h-4 w-4`} />
              {isArabic ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {isArabic ? 'تفاصيل الموعد' : 'Appointment Details'}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appointment Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {appointment.service_category?.name || (isArabic ? 'خدمة' : 'Service')}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date & Time */}
                    <div className="flex items-start">
                      <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
                        </h3>
                        <p className="text-gray-600">{formatDate(appointment.appointment_date)}</p>
                        <p className="text-gray-600">
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start">
                      <div className="p-3 bg-green-100 rounded-full mr-4">
                        <FaMapMarkerAlt className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {isArabic ? 'العنوان' : 'Location'}
                        </h3>
                        <p className="text-gray-600">
                          {appointment.location || (isArabic ? 'لم يتم تحديد العنوان' : 'Address not specified')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {isArabic ? 'ملاحظات الموعد' : 'Appointment Notes'}
                      </h3>
                      <p className="text-gray-700">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Professional Details */}
              {professional && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {isArabic ? 'معلومات المحترف' : 'Professional Details'}
                  </h2>
                  
                  <div className="flex items-start">
                    <img
                      src={professional.profile_image || '/default-avatar.png'}
                      alt={professional.business_name}
                      className="h-16 w-16 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {professional.business_name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {professional.business_description || professional.profession}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex mr-2">
                          {renderStars(professional.average_rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({professional.average_rating?.toFixed(1) || '0.0'})
                        </span>
                      </div>

                      {/* Contact Information */}
                      <div className="flex flex-wrap gap-4">
                        {professional.user?.phone_number && (
                          <a
                            href={`tel:${professional.user.phone_number}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <FaPhone className="mr-2 h-4 w-4" />
                            {professional.user.phone_number}
                          </a>
                        )}
                        {professional.user?.email && (
                          <a
                            href={`mailto:${professional.user.email}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <FaEnvelope className="mr-2 h-4 w-4" />
                            {professional.user.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Information */}
              {payment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {isArabic ? 'معلومات الدفع' : 'Payment Information'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{isArabic ? 'المبلغ' : 'Amount'}</p>
                      <p className="text-lg font-semibold">${payment.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{isArabic ? 'حالة الدفع' : 'Payment Status'}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                    {payment.created_at && (
                      <div>
                        <p className="text-sm text-gray-600">{isArabic ? 'تاريخ الدفع' : 'Payment Date'}</p>
                        <p className="text-gray-900">{formatDate(payment.created_at)}</p>
                      </div>
                    )}
                    {payment.transaction_id && (
                      <div>
                        <p className="text-sm text-gray-600">{isArabic ? 'رقم المعاملة' : 'Transaction ID'}</p>
                        <p className="text-gray-900 font-mono">{payment.transaction_id}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isArabic ? 'الإجراءات' : 'Actions'}
                </h3>
                
                <div className="space-y-3">
                  {/* Message Professional */}
                  {conversation && (
                    <Link
                      to={`/messages/${conversation.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaComments className="mr-2 h-4 w-4" />
                      {isArabic ? 'إرسال رسالة' : 'Send Message'}
                    </Link>
                  )}

                  {/* View Professional Profile */}
                  {professional && (
                    <Link
                      to={`/pros/${professional.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <FaUser className="mr-2 h-4 w-4" />
                      {isArabic ? 'عرض الملف الشخصي' : 'View Profile'}
                    </Link>
                  )}

                  {/* Payment Actions */}
                  {appointment.status === 'CONFIRMED' && !payment && (
                    <button
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      onClick={() => {/* Handle payment */}}
                    >
                      <FaCreditCard className="mr-2 h-4 w-4" />
                      {isArabic ? 'الدفع الآن' : 'Pay Now'}
                    </button>
                  )}

                  {/* Download Invoice */}
                  {payment && payment.status === 'COMPLETED' && (
                    <button
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => {/* Handle invoice download */}}
                    >
                      <FaFileInvoice className="mr-2 h-4 w-4" />
                      {isArabic ? 'تحميل الفاتورة' : 'Download Invoice'}
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Appointment Status Timeline */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isArabic ? 'حالة الموعد' : 'Appointment Status'}
                </h3>
                
                <div className="space-y-4">
                  {/* Timeline items based on appointment status */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {isArabic ? 'تم إنشاء الموعد' : 'Appointment Created'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(appointment.created_at)}
                      </p>
                    </div>
                  </div>

                  {appointment.status === 'CONFIRMED' && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {isArabic ? 'تم تأكيد الموعد' : 'Appointment Confirmed'}
                        </p>
                      </div>
                    </div>
                  )}

                  {appointment.status === 'COMPLETED' && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {isArabic ? 'تم إكمال الخدمة' : 'Service Completed'}
                        </p>
                      </div>
                    </div>
                  )}

                  {appointment.status === 'CANCELLED' && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <FaExclamationTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {isArabic ? 'تم إلغاء الموعد' : 'Appointment Cancelled'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Need Help? */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  {isArabic ? 'تحتاج مساعدة؟' : 'Need Help?'}
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  {isArabic 
                    ? 'تواصل معنا إذا كانت لديك أي أسئلة حول موعدك'
                    : 'Contact us if you have any questions about your appointment'}
                </p>
                <Link
                  to="/support"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <FaTools className="mr-2 h-4 w-4" />
                  {isArabic ? 'اتصل بالدعم' : 'Contact Support'}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentDetailsPage; 