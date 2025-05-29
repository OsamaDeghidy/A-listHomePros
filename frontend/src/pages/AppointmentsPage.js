import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser,
  FaPhone,
  FaComments,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEdit
} from 'react-icons/fa';
import { schedulingService, messagingService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const AppointmentsPage = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await schedulingService.getAppointments();
      console.log('Appointments data:', response.data);
      setAppointments(response.data.results || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(isArabic ? 'فشل في تحميل المواعيد' : 'Failed to load appointments');
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من إلغاء هذا الموعد؟' : 'Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await schedulingService.cancelAppointment(appointmentId);
      fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(isArabic ? 'فشل في إلغاء الموعد' : 'Failed to cancel appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <FaCheckCircle />;
      case 'requested':
        return <FaClock />;
      case 'completed':
        return <FaCheckCircle />;
      case 'cancelled':
      case 'canceled':
        return <FaTimes />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      ar: {
        'confirmed': 'مؤكد',
        'requested': 'مطلوب',
        'completed': 'مكتمل',
        'cancelled': 'ملغي',
        'canceled': 'ملغي'
      },
      en: {
        'confirmed': 'Confirmed',
        'requested': 'Requested',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'canceled': 'Cancelled'
      }
    };

    return statusTexts[isArabic ? 'ar' : 'en'][status?.toLowerCase()] || status;
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['requested', 'confirmed'].includes(appointment.status?.toLowerCase());
    if (filter === 'completed') return appointment.status?.toLowerCase() === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'canceled'].includes(appointment.status?.toLowerCase());
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar' : 'en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'مواعيدي | A-List Home Pros' : 'My Appointments | A-List Home Pros'}</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isArabic ? 'مواعيدي' : 'My Appointments'}
            </h1>
            <p className="text-gray-600">
              {isArabic 
                ? 'عرض وإدارة جميع مواعيدك مع مقدمي الخدمات'
                : 'View and manage all your appointments with service providers'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: isArabic ? 'الكل' : 'All' },
                  { key: 'upcoming', label: isArabic ? 'القادمة' : 'Upcoming' },
                  { key: 'completed', label: isArabic ? 'مكتملة' : 'Completed' },
                  { key: 'cancelled', label: isArabic ? 'ملغية' : 'Cancelled' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {appointments.filter(apt => {
                        if (tab.key === 'all') return true;
                        if (tab.key === 'upcoming') return ['requested', 'confirmed'].includes(apt.status?.toLowerCase());
                        if (tab.key === 'completed') return apt.status?.toLowerCase() === 'completed';
                        if (tab.key === 'cancelled') return ['cancelled', 'canceled'].includes(apt.status?.toLowerCase());
                        return true;
                      }).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-start">
                <FaExclamationTriangle className="flex-shrink-0 h-5 w-5 mr-3 mt-0.5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isArabic ? 'لا توجد مواعيد' : 'No appointments found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isArabic 
                  ? 'لم تقم بحجز أي مواعيد حتى الآن'
                  : "You haven't booked any appointments yet"}
              </p>
              <Link 
                to="/search"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
              >
                {isArabic ? 'ابحث عن محترفين' : 'Find Professionals'}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Appointment Header */}
                        <div className="flex items-center mb-3">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{getStatusText(appointment.status)}</span>
                          </div>
                          <span className="ml-3 text-sm text-gray-500">
                            {isArabic ? 'موعد #' : 'Appointment #'}{appointment.id}
                          </span>
                        </div>

                        {/* Professional Info */}
                        <div className="flex items-center mb-4">
                          <img 
                            src={appointment.alistpro?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.alistpro?.business_name || 'Pro')}&background=0D8ABC&color=fff`}
                            alt={appointment.alistpro?.business_name}
                            className="w-12 h-12 rounded-full mr-3"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.alistpro?.business_name || (isArabic ? 'محترف خدمات' : 'Service Professional')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {appointment.service_category?.name || (isArabic ? 'خدمة عامة' : 'General Service')}
                            </p>
                          </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <FaCalendarAlt className="mr-2" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaClock className="mr-2" />
                            <span>
                              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                            </span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center text-gray-600 md:col-span-2">
                              <FaMapMarkerAlt className="mr-2" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              {isArabic ? 'ملاحظات:' : 'Notes:'}
                            </h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                              {appointment.notes}
                            </p>
                          </div>
                        )}

                        {/* Estimated Cost */}
                        {appointment.estimated_cost && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-900">
                              {isArabic ? 'التكلفة المقدرة: ' : 'Estimated Cost: '}
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              ${appointment.estimated_cost}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        {/* Message Button */}
                        <button
                          onClick={() => {
                            // Navigate to messages - you'll need to implement this based on your conversation system
                            window.location.href = `/dashboard/messages`;
                          }}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition duration-300"
                        >
                          <FaComments className="mr-1" />
                          {isArabic ? 'رسالة' : 'Message'}
                        </button>

                        {/* Cancel Button (only for upcoming appointments) */}
                        {['requested', 'confirmed'].includes(appointment.status?.toLowerCase()) && (
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition duration-300"
                          >
                            <FaTimes className="mr-1" />
                            {isArabic ? 'إلغاء' : 'Cancel'}
                          </button>
                        )}

                        {/* Reschedule Button */}
                        {['requested', 'confirmed'].includes(appointment.status?.toLowerCase()) && (
                          <Link
                            to={`/booking/${appointment.alistpro?.id}?reschedule=${appointment.id}`}
                            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition duration-300"
                          >
                            <FaEdit className="mr-1" />
                            {isArabic ? 'إعادة جدولة' : 'Reschedule'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentsPage; 