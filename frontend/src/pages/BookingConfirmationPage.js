import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { schedulingService } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const BookingConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  
  // Get payment status and appointment ID from URL parameters
  const paymentStatus = searchParams.get('status');
  const appointmentId = searchParams.get('appointment_id');
  
  useEffect(() => {
    // If no appointment ID is provided, redirect to home
    if (!appointmentId) {
      navigate('/');
      return;
    }
    
    // Fetch booking details
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await schedulingService.getAppointment(appointmentId);
        setBookingDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError(err.response?.data?.message || 'Failed to fetch booking details');
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [appointmentId, navigate]);

  // Determine the header content based on payment status
  const getHeaderContent = () => {
    if (loading) {
      return {
        bgColor: 'bg-blue-600',
        icon: <FaSpinner className="mx-auto text-5xl mb-4 animate-spin" />,
        title: 'Loading Booking Details...',
        message: 'Please wait while we retrieve your booking information'
      };
    }
    
    if (error) {
      return {
        bgColor: 'bg-red-600',
        icon: <FaExclamationTriangle className="mx-auto text-5xl mb-4" />,
        title: 'Error Loading Booking',
        message: error
      };
    }
    
    if (paymentStatus === 'cancelled') {
      return {
        bgColor: 'bg-yellow-600',
        icon: <FaExclamationTriangle className="mx-auto text-5xl mb-4" />,
        title: 'Payment Cancelled',
        message: 'Your booking is confirmed but payment was not completed'
      };
    }
    
    return {
      bgColor: 'bg-green-600',
      icon: <FaCheckCircle className="mx-auto text-5xl mb-4" />,
      title: 'Booking Confirmed!',
      message: paymentStatus === 'success' 
        ? 'Your appointment has been scheduled and payment was successful' 
        : 'Your appointment has been successfully scheduled'
    };
  };
  
  const headerContent = getHeaderContent();
  
  return (
    <>
      <Helmet>
        <title>Booking Confirmation | A-List Home Pros</title>
        <meta name="description" content="Your service booking has been confirmed." />
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className={`${headerContent.bgColor} p-6 text-white text-center`}>
              {headerContent.icon}
              <h1 className="text-2xl font-bold">{headerContent.title}</h1>
              <p className="mt-2">{headerContent.message}</p>
            </div>
            
            {/* Content */}
            {loading ? (
              <div className="p-12 text-center">
                <FaSpinner className="mx-auto text-4xl text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading your booking details...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Link to="/" className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
                  Return to Home
                </Link>
              </div>
            ) : bookingDetails ? (
              <div className="p-6">
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
                  <p className="text-gray-500 mb-2">Booking ID: <span className="text-gray-700 font-medium">{bookingDetails.id}</span></p>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    {/* Professional Info */}
                    <div className="flex items-start mb-4">
                      <FaUser className="text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="font-medium">{language === 'ar' ? 'المهني' : 'Professional'}</p>
                        <div className="flex items-center mt-1">
                          <div>
                            <p className="font-medium">{bookingDetails.alistpro_name || 'Professional'}</p>
                            <p className="text-sm text-gray-600">{bookingDetails.service_name || 'Service Provider'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-start mb-4">
                      <FaCalendarAlt className="text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="font-medium">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                        <p>
                          {new Date(bookingDetails.appointment_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-start mb-4">
                      <FaClock className="text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="font-medium">{language === 'ar' ? 'الوقت' : 'Time'}</p>
                        <p>{bookingDetails.start_time ? bookingDetails.start_time.substring(0, 5) : 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-start mb-4">
                      <FaMapMarkerAlt className="text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="font-medium">{language === 'ar' ? 'الموقع' : 'Location'}</p>
                        <p>{bookingDetails.location || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    {/* Service and Price */}
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{language === 'ar' ? 'الخدمة' : 'Service'}</p>
                        <p>{bookingDetails.service_name || 'Service'}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="font-medium">{language === 'ar' ? 'السعر الإجمالي' : 'Total Price'}</p>
                        <p className="text-lg font-bold">${(bookingDetails.estimated_cost || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Status */}
                {paymentStatus && (
                  <div className={`mb-6 p-4 rounded-lg ${paymentStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                    <h3 className="font-bold mb-2">{language === 'ar' ? 'حالة الدفع' : 'Payment Status'}</h3>
                    <p>
                      {paymentStatus === 'success' 
                        ? (language === 'ar' ? 'تم الدفع بنجاح' : 'Payment was successful') 
                        : (language === 'ar' ? 'تم إلغاء الدفع' : 'Payment was cancelled')}
                    </p>
                  </div>
                )}
                
                {/* Next Steps */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">{language === 'ar' ? 'الخطوات التالية' : 'Next Steps'}</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{language === 'ar' ? 'ستتلقى رسالة بريد إلكتروني للتأكيد تحتوي على تفاصيل الحجز قريبًا.' : 'You\'ll receive a confirmation email with booking details shortly.'}</li>
                    <li>{language === 'ar' ? 'سيتصل بك المهني قبل الموعد للتأكيد.' : 'The professional will contact you before the appointment to confirm.'}</li>
                    <li>{language === 'ar' ? 'يمكنك إعادة جدولة هذا الحجز أو إلغاؤه قبل 24 ساعة من الوقت المحدد.' : 'You can reschedule or cancel this booking up to 24 hours before the scheduled time.'}</li>
                    {paymentStatus !== 'success' && (
                      <li>{language === 'ar' ? 'سيتم تحصيل الدفع بعد اكتمال الخدمة.' : 'Payment will be collected after the service is completed.'}</li>
                    )}
                  </ul>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Link 
                    to="/user-dashboard/bookings" 
                    className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {language === 'ar' ? 'عرض حجوزاتي' : 'View My Bookings'}
                  </Link>
                  <Link 
                    to="/" 
                    className="flex-1 bg-gray-200 text-gray-800 text-center py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Return to Home'}
                  </Link>
                </div>
                
                {/* Contact Support */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600">
                    {language === 'ar' ? 'هل تحتاج إلى مساعدة في الحجز؟' : 'Need help with your booking?'} <Link to="/contact" className="text-blue-600 hover:underline">{language === 'ar' ? 'اتصل بالدعم' : 'Contact Support'}</Link>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingConfirmationPage; 