import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, 
  isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { schedulingService, alistProsService } from '../services/api';
import { 
  FaCalendarAlt, 
  FaChevronLeft, 
  FaChevronRight, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaSpinner, 
  FaExclamationCircle, 
  FaFilter, 
  FaSearch, 
  FaTimesCircle, 
  FaEye,
  FaComments,
  FaCalendarCheck,
  FaPlus,
  FaStar
} from 'react-icons/fa';

const BookingCalendarPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('month');
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    serviceType: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/calendar');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch appointments from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  // Filter appointments when filters change
  useEffect(() => {
    filterAppointments();
  }, [appointments, activeFilters, searchQuery]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);

    console.log('📅 Calendar: Current user:', currentUser);
    console.log('📅 Calendar: User role/type:', currentUser?.role);

    try {
      // Fetch appointments from the API
      console.log('📅 Calendar: About to fetch appointments using schedulingService.getAppointments()');
      const response = await schedulingService.getAppointments();
      console.log('📅 Calendar: Raw API response:', response);
      const appointmentsData = response.data.results || [];

      console.log('📅 Calendar: Fetched appointments from API:', appointmentsData);
      console.log('📅 Calendar: Number of appointments:', appointmentsData.length);
      console.log('📅 Calendar: First appointment:', appointmentsData[0]);

      // Enhance appointments with professional details
      const enhancedAppointments = await Promise.all(
        appointmentsData.map(async (appointment) => {
          if (appointment.alistpro) {
            try {
              const alistproId = typeof appointment.alistpro === 'object' 
                ? appointment.alistpro.id || appointment.alistpro_id
                : appointment.alistpro;
                
              if (alistproId) {
                const proRes = await alistProsService.getProfileDetail(alistproId);
                return {
                  ...appointment,
                  professional: proRes.data
                };
              }
            } catch (err) {
              console.error('Error fetching professional details:', err);
              return appointment;
            }
          }
          return appointment;
        })
      );

      console.log('📅 Calendar: Enhanced appointments:', enhancedAppointments);
      setAppointments(enhancedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(isArabic ? 'فشل في تحميل المواعيد' : 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (activeFilters.status !== 'all') {
      const statusMap = {
        'upcoming': ['REQUESTED', 'CONFIRMED'],
        'completed': ['COMPLETED'],
        'cancelled': ['CANCELLED']
      };
      
      if (statusMap[activeFilters.status]) {
        filtered = filtered.filter(appt => statusMap[activeFilters.status].includes(appt.status));
      }
    }

    // Filter by service type
    if (activeFilters.serviceType !== 'all') {
      filtered = filtered.filter(appt => 
        appt.service_category?.name === activeFilters.serviceType
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appt => 
        (appt.professional?.business_name || '').toLowerCase().includes(query) ||
        (appt.service_category?.name || '').toLowerCase().includes(query) ||
        (appt.location || '').toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      serviceType: 'all'
    });
    setSearchQuery('');
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const onDateClick = (day) => {
    setCurrentDate(day);
    if (selectedView === 'month') {
      setSelectedView('day');
    }
  };

  const getDayAppointments = (day) => {
    return filteredAppointments.filter(appointment => 
      isSameDay(parseISO(appointment.appointment_date), day)
    );
  };

  // Get status color for appointments
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'REQUESTED':
        return 'bg-yellow-500';
      case 'PENDING':
        return 'bg-yellow-600';
      case 'CONFIRMED':
        return 'bg-blue-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM format
  };

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isArabic ? 'الشهر السابق' : 'Previous month'}
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold mx-4 min-w-[200px] text-center">
            {format(currentDate, dateFormat)}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isArabic ? 'الشهر التالي' : 'Next month'}
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedView('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isArabic ? 'شهري' : 'Month'}
          </button>
          <button
            onClick={() => setSelectedView('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isArabic ? 'أسبوعي' : 'Week'}
          </button>
          <button
            onClick={() => setSelectedView('day')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'day' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isArabic ? 'يومي' : 'Day'}
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEE";
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div className="text-center text-sm font-medium text-gray-700 py-3 border-b" key={i}>
          {format(day, dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 bg-gray-50">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayAppointments = getDayAppointments(day);
        
        days.push(
          <div
            className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400 bg-gray-50"
                : isToday(day)
                ? "bg-blue-50 border-blue-200"
                : "bg-white hover:bg-gray-50"
            }`}
            key={day}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-medium ${
                isToday(day) ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {formattedDate}
              </span>
              {dayAppointments.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {dayAppointments.length}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-xs p-1 rounded text-white truncate cursor-pointer ${getStatusColor(appointment.status)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAppointment(appointment);
                  }}
                  title={`${formatTime(appointment.start_time)} - ${appointment.service_category?.name || 'Service'}`}
                >
                  {formatTime(appointment.start_time)} {appointment.service_category?.name || 'Service'}
                </motion.div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-gray-600 text-center">
                  +{dayAppointments.length - 3} {isArabic ? 'المزيد' : 'more'}
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderDayView = () => {
    const dayAppointments = getDayAppointments(currentDate).sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );

    return (
      <div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        {dayAppointments.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">
              {isArabic ? 'لا توجد مواعيد في هذا اليوم' : 'No appointments for this day'}
            </p>
            <Link
              to="/search"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              {isArabic ? 'حجز خدمة' : 'Book Service'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {dayAppointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
                onClick={() => setSelectedAppointment(appointment)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayAppointments = getDayAppointments(day);
      
      weekDays.push(
        <div key={i} className="border-r last:border-r-0 min-h-[300px] p-2">
          <div className={`text-center font-medium mb-2 pb-2 border-b ${
            isToday(day) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
          }`}>
            <div className="text-sm">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
          <div className="space-y-1">
            {dayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`text-xs p-2 rounded text-white cursor-pointer ${getStatusColor(appointment.status)}`}
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="font-medium">{formatTime(appointment.start_time)}</div>
                <div className="truncate">{appointment.service_category?.name || 'Service'}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold">
            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </h3>
        </div>
        <div className="grid grid-cols-7 border">
          {weekDays}
        </div>
      </div>
    );
  };

  // Appointment Card Component
  const AppointmentCard = ({ appointment, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(appointment.status)}`}></div>
            <h4 className="font-semibold text-gray-900">
              {appointment.service_category?.name || 'Service'}
            </h4>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <FaClock className="mr-2 h-3 w-3" />
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </div>
            
            {appointment.professional && (
              <div className="flex items-center">
                <FaUser className="mr-2 h-3 w-3" />
                {appointment.professional.business_name}
              </div>
            )}
            
            {appointment.location && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 h-3 w-3" />
                <span className="truncate">{appointment.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>
      </div>
    </motion.div>
  );

  // Appointment Details Modal
  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">
              {isArabic ? 'تفاصيل الموعد' : 'Appointment Details'}
            </h3>
            <button
              onClick={() => setSelectedAppointment(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimesCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {isArabic ? 'الخدمة' : 'Service'}
              </label>
              <p className="text-gray-900">{selectedAppointment.service_category?.name || 'Service'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
              </label>
              <p className="text-gray-900">
                {format(parseISO(selectedAppointment.appointment_date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-gray-900">
                {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
              </p>
            </div>

            {selectedAppointment.professional && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'المحترف' : 'Professional'}
                </label>
                <div className="flex items-center mt-1">
                  <img
                    src={selectedAppointment.professional.profile_image || '/default-avatar.png'}
                    alt={selectedAppointment.professional.business_name}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedAppointment.professional.business_name}
                    </p>
                    {selectedAppointment.professional.average_rating && (
                      <div className="flex items-center">
                        <FaStar className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          {selectedAppointment.professional.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedAppointment.location && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'العنوان' : 'Location'}
                </label>
                <p className="text-gray-900">{selectedAppointment.location}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                {isArabic ? 'الحالة' : 'Status'}
              </label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedAppointment.status)}`}>
                {getStatusText(selectedAppointment.status)}
              </span>
            </div>

            {selectedAppointment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {isArabic ? 'الملاحظات' : 'Notes'}
                </label>
                <p className="text-gray-900">{selectedAppointment.notes}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <Link
              to={`/appointments/${selectedAppointment.id}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setSelectedAppointment(null)}
            >
              <FaEye className="inline mr-2" />
              {isArabic ? 'عرض التفاصيل' : 'View Details'}
            </Link>
            
            {selectedAppointment.conversation_id && (
              <Link
                to={`/dashboard/messages/${selectedAppointment.conversation_id}`}
                className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => setSelectedAppointment(null)}
              >
                <FaComments className="inline mr-2" />
                {isArabic ? 'المحادثة' : 'Message'}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // Get unique service types for filter
  const getServiceTypes = () => {
    const types = appointments.map(apt => apt.service_category?.name).filter(Boolean);
    return [...new Set(types)];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{isArabic ? 'جاري تحميل المواعيد...' : 'Loading appointments...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaExclamationCircle className="text-red-600 text-4xl mb-4" />
        <p className="text-gray-800 font-medium mb-2">
          {isArabic ? 'خطأ في تحميل المواعيد' : 'Error Loading Appointments'}
        </p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAppointments}
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
        <title>{isArabic ? 'تقويم المواعيد | A-List Home Pros' : 'Appointments Calendar | A-List Home Pros'}</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {isArabic ? 'تقويم المواعيد' : 'Appointments Calendar'}
          </h1>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`p-2 rounded-lg transition-colors ${
                isFilterVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={isArabic ? 'فلترة المواعيد' : 'Filter appointments'}
            >
              <FaFilter />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder={isArabic ? 'البحث في المواعيد...' : 'Search appointments...'}
                className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle />
                </button>
              )}
            </div>
            <Link
              to="/search"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              {isArabic ? 'حجز جديد' : 'New Booking'}
            </Link>
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {isArabic ? 'دليل الألوان' : 'Status Legend'}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>{isArabic ? 'مطلوب' : 'Requested'}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>{isArabic ? 'مؤكد' : 'Confirmed'}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>{isArabic ? 'مكتمل' : 'Completed'}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>{isArabic ? 'ملغي' : 'Cancelled'}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        {isFilterVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-4 border rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{isArabic ? 'فلترة المواعيد' : 'Filter Appointments'}</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isArabic ? 'إعادة تعيين' : 'Reset Filters'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الحالة' : 'Status'}
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={activeFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="upcoming">{isArabic ? 'القادمة' : 'Upcoming'}</option>
                  <option value="completed">{isArabic ? 'مكتملة' : 'Completed'}</option>
                  <option value="cancelled">{isArabic ? 'ملغية' : 'Cancelled'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'نوع الخدمة' : 'Service Type'}
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={activeFilters.serviceType}
                  onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                >
                  <option value="all">{isArabic ? 'جميع الخدمات' : 'All Services'}</option>
                  {getServiceTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Calendar */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {renderHeader()}
          
          {selectedView === 'month' && (
            <>
              {renderDays()}
              {renderCells()}
            </>
          )}
          
          {selectedView === 'week' && renderWeekView()}
          
          {selectedView === 'day' && renderDayView()}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaCalendarCheck className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'المجموع' : 'Total'}</p>
                <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaClock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'في الانتظار' : 'Pending'}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(apt => apt.status === 'REQUESTED').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaCalendarCheck className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'مكتملة' : 'Completed'}</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaTimesCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'ملغية' : 'Cancelled'}</p>
                <p className="text-2xl font-bold text-red-600">
                  {appointments.filter(apt => apt.status === 'CANCELLED').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {renderAppointmentDetails()}
    </>
  );
};

export default BookingCalendarPage; 