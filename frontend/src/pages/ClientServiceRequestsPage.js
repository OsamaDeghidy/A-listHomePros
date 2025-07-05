import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTools, 
  FaMapMarkerAlt, 
  FaClock, 
  FaDollarSign, 
  FaInfoCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaEye,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaSort,
  FaPlus,
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { alistProsService } from '../services/api';

const ClientServiceRequestsPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    urgency: 'medium',
    budget_max: '',
    preferred_start_date: '',
    location: ''
  });
  const [updating, setUpdating] = useState(false);
  const [previousQuotesCount, setPreviousQuotesCount] = useState({});

  // Appointment booking state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    date: '', 
    time: '', 
    description: '', 
    address: '',
    selectedSlot: null
  });
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/service-requests');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch service requests
  useEffect(() => {
    if (isAuthenticated) {
      fetchServiceRequests();
    }
  }, [isAuthenticated, statusFilter, urgencyFilter, sortBy, sortOrder]);

  // Check for new quotes and show notification
  const hasNewQuotes = (request) => {
    return request.quotes_count > 0 && request.status === 'quoted';
  };

  // Check for new quotes notification
  const newQuotesCount = serviceRequests.filter(request => hasNewQuotes(request)).length;

  // Check for new quotes and show notification
  useEffect(() => {
    if (serviceRequests.length > 0) {
      const currentQuotesCount = {};
      let hasNewQuotesReceived = false;

      serviceRequests.forEach(request => {
        currentQuotesCount[request.id] = request.quotes_count;
        if (previousQuotesCount[request.id] && request.quotes_count > previousQuotesCount[request.id]) {
          hasNewQuotesReceived = true;
        }
      });

      if (hasNewQuotesReceived && Object.keys(previousQuotesCount).length > 0) {
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(
            isArabic ? 'عرض سعر جديد!' : 'New Quote Received!',
            {
              body: isArabic ? 'تم استلام عرض سعر جديد لأحد طلباتك' : 'You received a new price quote for one of your requests',
              icon: '/favicon.ico'
            }
          );
        }
      }

      setPreviousQuotesCount(currentQuotesCount);
    }
  }, [serviceRequests, isArabic, previousQuotesCount]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const params = {
        client: currentUser?.id,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
        search: searchTerm || undefined
      };

      const response = await alistProsService.getServiceRequests(params);
      const requests = response.data.results || response.data || [];
      console.log('📋 Service Requests fetched:', requests);
      console.log('📋 Requests with accepted status:', requests.filter(r => r.status === 'accepted'));
      setServiceRequests(requests);
    } catch (err) {
      console.error('Error fetching service requests:', err);
      setError(isArabic ? 'خطأ في تحميل طلبات الخدمة' : 'Error loading service requests');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchServiceRequests();
  };

  // Fetch quotes for a request
  const fetchQuotes = async (requestId) => {
    try {
      setLoadingQuotes(true);
      const response = await alistProsService.getServiceQuotes({ service_request: requestId });
      setQuotes(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setQuotes([]);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // Accept a quote
  const handleAcceptQuote = async (quoteId) => {
    try {
      const confirmMessage = isArabic 
        ? 'هل أنت متأكد من قبول هذا العرض؟ سيتم تغيير حالة الطلب إلى "مقبول".'
        : 'Are you sure you want to accept this quote? The request status will be changed to "Accepted".';
      
      if (!window.confirm(confirmMessage)) return;
      
      await alistProsService.acceptServiceQuote(quoteId);
      alert(isArabic ? 'تم قبول العرض بنجاح!' : 'Quote accepted successfully!');
      
      // Refresh data
      fetchServiceRequests();
      if (selectedRequest) {
        fetchQuotes(selectedRequest.id);
      }
    } catch (err) {
      console.error('Error accepting quote:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message;
      alert(isArabic ? `فشل في قبول العرض: ${errorMessage}` : `Failed to accept quote: ${errorMessage}`);
    }
  };

  // Reject a quote
  const handleRejectQuote = async (quoteId) => {
    try {
      const confirmMessage = isArabic 
        ? 'هل أنت متأكد من رفض هذا العرض؟'
        : 'Are you sure you want to reject this quote?';
      
      if (!window.confirm(confirmMessage)) return;
      
      await alistProsService.rejectServiceQuote(quoteId);
      alert(isArabic ? 'تم رفض العرض' : 'Quote rejected');
      
      // Refresh quotes
      if (selectedRequest) {
        fetchQuotes(selectedRequest.id);
      }
    } catch (err) {
      console.error('Error rejecting quote:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message;
      alert(isArabic ? `فشل في رفض العرض: ${errorMessage}` : `Failed to reject quote: ${errorMessage}`);
    }
  };

  // Get quote status info
  const getQuoteStatusInfo = (status) => {
    const statusMap = {
      'pending': { 
        label: isArabic ? 'قيد الانتظار' : 'Pending', 
        color: 'bg-yellow-100 text-yellow-800' 
      },
      'accepted': { 
        label: isArabic ? 'مقبول' : 'Accepted', 
        color: 'bg-green-100 text-green-800' 
      },
      'rejected': { 
        label: isArabic ? 'مرفوض' : 'Rejected', 
        color: 'bg-red-100 text-red-800' 
      },
      'expired': { 
        label: isArabic ? 'منتهي الصلاحية' : 'Expired', 
        color: 'bg-gray-100 text-gray-800' 
      }
    };
    return statusMap[status] || statusMap['pending'];
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return isArabic ? 'غير محدد' : 'Not specified';
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return isArabic ? 'غير محدد' : 'Not specified';
    return new Date(dateString).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');
  };

  // Open edit modal
  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    setEditFormData({
      title: request.title || '',
      description: request.description || '',
      urgency: request.urgency || 'medium',
      budget_max: request.budget_max || '',
      preferred_start_date: request.preferred_start_date ? request.preferred_start_date.split('T')[0] : '',
      location: request.location || ''
    });
    setShowEditModal(true);
  };

  // Update service request
  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title.trim() || !editFormData.description.trim()) {
      alert(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      
      const updateData = {
        ...editFormData,
        budget_max: editFormData.budget_max ? parseFloat(editFormData.budget_max) : null,
        preferred_start_date: editFormData.preferred_start_date || null
      };

      await alistProsService.updateServiceRequest(selectedRequest.id, updateData);
      
      alert(isArabic ? 'تم تحديث الطلب بنجاح!' : 'Request updated successfully!');
      setShowEditModal(false);
      fetchServiceRequests(); // Refresh the list
      
    } catch (err) {
      console.error('Error updating service request:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message;
      alert(isArabic ? `فشل في تحديث الطلب: ${errorMessage}` : `Failed to update request: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  // Delete service request
  const handleDeleteRequest = async (requestId, requestTitle) => {
    const confirmMessage = isArabic 
      ? `هل أنت متأكد من حذف طلب "${requestTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`
      : `Are you sure you want to delete "${requestTitle}"? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await alistProsService.deleteServiceRequest(requestId);
        alert(isArabic ? 'تم حذف الطلب بنجاح!' : 'Request deleted successfully!');
        fetchServiceRequests(); // Refresh the list
      } catch (err) {
        console.error('Error deleting service request:', err);
        const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message;
        alert(isArabic ? `فشل في حذف الطلب: ${errorMessage}` : `Failed to delete request: ${errorMessage}`);
      }
    }
  };

  // Format urgency
  const formatUrgency = (urgency) => {
    const urgencyMap = {
      low: isArabic ? 'منخفضة' : 'Low',
      medium: isArabic ? 'متوسطة' : 'Medium', 
      high: isArabic ? 'عالية' : 'High',
      emergency: isArabic ? 'طارئة' : 'Emergency'
    };
    return urgencyMap[urgency] || urgency;
  };

  // Format status
  const formatStatus = (status) => {
    const statusMap = {
      draft: isArabic ? 'مسودة' : 'Draft',
      pending: isArabic ? 'في الانتظار' : 'Pending',
      quoted: isArabic ? 'تم تقديم عروض' : 'Quoted',
      accepted: isArabic ? 'تم القبول' : 'Accepted',
      in_progress: isArabic ? 'قيد التنفيذ' : 'In Progress',
      completed: isArabic ? 'مكتمل' : 'Completed',
      cancelled: isArabic ? 'ملغي' : 'Cancelled'
    };
    return statusMap[status] || status;
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    const colorMap = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800'
    };
    return colorMap[urgency] || 'bg-gray-100 text-gray-800';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colorMap = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
      quoted: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Handle appointment booking
  const handleBookAppointment = async (quote) => {
    console.log('📅 Starting appointment booking for quote:', quote);
    setSelectedQuote(quote);
    setShowAppointmentModal(true);
    
    // Fetch availability for the professional
    if (quote.professional?.id) {
      await fetchAvailabilitySlots(quote.professional.id);
    }
  };

  // Fetch availability slots for professional
  const fetchAvailabilitySlots = async (professionalId) => {
    console.log('📅 Fetching availability for professional:', professionalId);
    setLoadingAvailability(true);
    
    try {
      const token = localStorage.getItem('token');
      let url = `http://127.0.0.1:8000/api/scheduling/availability-slots/for_professional/?alistpro=${professionalId}`;
      console.log('📡 Fetching availability from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📅 Availability slots fetched:', data);
        
        if (data.results && data.results.length > 0) {
          console.log('✅ Found availability slots:', data.results);
          setAvailabilitySlots(data.results);
        } else {
          console.log('⚠️ No availability slots found');
          setAvailabilitySlots([]);
        }
      } else {
        console.error('❌ Failed to fetch availability slots. Status:', response.status);
        setAvailabilitySlots([]);
      }
    } catch (error) {
      console.error('❌ Error fetching availability slots:', error);
      setAvailabilitySlots([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Get available dates
  const getAvailableDates = () => {
    if (availabilitySlots.length === 0) return [];
    
    const dates = [];
    const today = new Date();
    
    // Generate next 30 days and check availability
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      
      // Check if professional is available on this day
      const hasAvailability = availabilitySlots.some(slot => slot.day_of_week === dayOfWeek);
      
      if (hasAvailability) {
        dates.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString(isArabic ? 'ar' : 'en', { weekday: 'short' }),
          day: date.getDate(),
          month: date.toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'short' })
        });
      }
    }
    
    return dates.slice(0, 14); // Limit to 14 available dates
  };

  // Get available times for selected date
  const getAvailableTimesForDate = (selectedDate) => {
    if (!selectedDate || availabilitySlots.length === 0) return [];
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Find available slots for this day of week
    const daySlots = availabilitySlots.filter(slot => slot.day_of_week === dayOfWeek);
    
    // Convert to time options
    const times = [];
    daySlots.forEach(slot => {
      const startTime = slot.start_time;
      const endTime = slot.end_time;
      
      // Generate hourly slots between start and end time
      let current = startTime;
      while (current < endTime) {
        times.push({
          value: current.substring(0, 5), // HH:MM format
          label: current.substring(0, 5)
        });
        
        // Add 1 hour
        const [hours, minutes] = current.split(':');
        const nextHour = (parseInt(hours) + 1).toString().padStart(2, '0');
        current = `${nextHour}:${minutes}`;
        
        if (current >= endTime) break;
      }
    });
    
    return times;
  };

  // Helper function to add one hour to time
  const addHourToTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const nextHour = (parseInt(hours) + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:${minutes}`;
  };

  // Submit appointment booking
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (creatingAppointment) return;

    console.log('🗓️ Creating appointment...');
    
    if (!selectedQuote || !selectedQuote.professional?.id) {
      alert(isArabic ? 'خطأ في البيانات - لا يمكن تحديد مقدم الخدمة' : 'Error in data - cannot identify professional');
      return;
    }

    setCreatingAppointment(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      const appointmentPayload = {
        alistpro: selectedQuote.professional.id,
        appointment_date: appointmentData.date,
        start_time: appointmentData.time + ':00',
        end_time: addHourToTime(appointmentData.time) + ':00',
        notes: appointmentData.description || selectedQuote.description || '',
        location: appointmentData.address || selectedRequest?.location || 'سيتم تحديده'
      };

      console.log('📋 Appointment payload being sent:', appointmentPayload);

      const response = await fetch('http://127.0.0.1:8000/api/scheduling/appointments/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Appointment booked successfully:', result);

        // Close modal and reset form
        setShowAppointmentModal(false);
        setAppointmentData({ date: '', time: '', description: '', address: '', selectedSlot: null });
        setSelectedQuote(null);

        alert(isArabic ? `تم حجز الموعد بنجاح!` : `Appointment booked successfully!`);

        // Refresh service requests
        fetchServiceRequests();

      } else {
        const errorData = await response.json();
        console.log('❌ Error response status:', response.status);
        console.log('❌ Error response data:', errorData);
        
        // Extract the actual error message
        let errorMessage = 'Failed to book appointment';
        if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      alert(isArabic ? `فشل في حجز الموعد: ${errorMessage}` : `Failed to book appointment: ${errorMessage}`);
    } finally {
      setCreatingAppointment(false);
    }
  };

  // Handle appointment input changes
  const handleAppointmentInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'طلبات الخدمة | A-List Home Pros' : 'My Service Requests | A-List Home Pros'}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isArabic ? 'طلبات الخدمة' : 'My Service Requests'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isArabic ? 'متابعة وإدارة طلبات الخدمة الخاصة بك' : 'Track and manage your service requests'}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/new-request')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                {isArabic ? 'طلب جديد' : 'New Request'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* New Quotes Notification */}
          {newQuotesCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaFileInvoiceDollar className="h-6 w-6 text-green-600 animate-bounce" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">
                    {isArabic ? 'عروض أسعار جديدة!' : 'New Price Quotes!'}
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    {isArabic 
                      ? `لديك ${newQuotesCount} عرض سعر جديد في انتظار المراجعة`
                      : `You have ${newQuotesCount} new price quote${newQuotesCount > 1 ? 's' : ''} waiting for review`
                    }
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => {
                      const firstRequestWithQuotes = serviceRequests.find(request => hasNewQuotes(request));
                      if (firstRequestWithQuotes) {
                        setSelectedRequest(firstRequestWithQuotes);
                        fetchQuotes(firstRequestWithQuotes.id);
                        setShowQuotesModal(true);
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    {isArabic ? 'مراجعة العروض' : 'Review Quotes'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={isArabic ? 'البحث في الطلبات...' : 'Search requests...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="pending">{isArabic ? 'في الانتظار' : 'Pending'}</option>
                <option value="quoted">{isArabic ? 'تم تقديم عروض' : 'Quoted'}</option>
                <option value="accepted">{isArabic ? 'تم القبول' : 'Accepted'}</option>
                <option value="in_progress">{isArabic ? 'قيد التنفيذ' : 'In Progress'}</option>
                <option value="completed">{isArabic ? 'مكتمل' : 'Completed'}</option>
              </select>

              {/* Urgency Filter */}
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{isArabic ? 'جميع الأولويات' : 'All Urgencies'}</option>
                <option value="emergency">{isArabic ? 'طارئة' : 'Emergency'}</option>
                <option value="high">{isArabic ? 'عالية' : 'High'}</option>
                <option value="medium">{isArabic ? 'متوسطة' : 'Medium'}</option>
                <option value="low">{isArabic ? 'منخفضة' : 'Low'}</option>
              </select>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at-desc">{isArabic ? 'الأحدث أولاً' : 'Newest First'}</option>
                <option value="created_at-asc">{isArabic ? 'الأقدم أولاً' : 'Oldest First'}</option>
                <option value="urgency-desc">{isArabic ? 'الأولوية العالية أولاً' : 'High Priority First'}</option>
                <option value="budget_max-desc">{isArabic ? 'أعلى ميزانية أولاً' : 'Highest Budget First'}</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
              <span className="ml-3 text-gray-600">
                {isArabic ? 'جاري التحميل...' : 'Loading...'}
              </span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <FaExclamationTriangle className="inline mr-2" />
              {error}
            </div>
          ) : serviceRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaTools className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isArabic ? 'لا توجد طلبات خدمة' : 'No Service Requests'}
              </h3>
              <p className="text-gray-500 mb-4">
                {isArabic ? 'لم تقم بإنشاء أي طلبات خدمة بعد' : 'You haven\'t created any service requests yet'}
              </p>
              <button
                onClick={() => navigate('/dashboard/new-request')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                {isArabic ? 'إنشاء طلب جديد' : 'Create New Request'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {formatStatus(request.status)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                            {formatUrgency(request.urgency)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {request.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                          {request.budget_max && (
                            <div className="flex items-center">
                              <FaDollarSign className="h-4 w-4 mr-2" />
                              {formatCurrency(request.budget_max)}
                            </div>
                          )}
                          <div className="flex items-center">
                            <FaClock className="h-4 w-4 mr-2" />
                            {formatDate(request.created_at)}
                          </div>
                          {request.quotes_count > 0 && (
                            <div className="flex items-center">
                              <FaFileInvoiceDollar className="h-4 w-4 mr-2" />
                              {request.quotes_count} {isArabic ? 'عروض سعر' : 'quotes'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title={isArabic ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <FaEye className="h-4 w-4 mr-2" />
                          {isArabic ? 'تفاصيل' : 'Details'}
                        </button>
                        
                        {request.quotes_count > 0 && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              fetchQuotes(request.id);
                              setShowQuotesModal(true);
                            }}
                            className={`relative flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                              hasNewQuotes(request) 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 animate-pulse' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            <FaFileInvoiceDollar className="h-4 w-4 mr-2" />
                            {isArabic ? 'العروض' : 'Quotes'} ({request.quotes_count})
                            {hasNewQuotes(request) && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
                            )}
                            {hasNewQuotes(request) && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                            )}
                          </button>
                        )}
                        
                        {/* Edit button - only show for pending/draft requests */}
                        {(request.status === 'pending' || request.status === 'draft') && (
                          <button
                            onClick={() => handleEditRequest(request)}
                            className="flex items-center px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                            title={isArabic ? 'تعديل الطلب' : 'Edit Request'}
                          >
                            <FaEdit className="h-4 w-4 mr-2" />
                            {isArabic ? 'تعديل' : 'Edit'}
                          </button>
                        )}
                        
                        {/* Delete button - only show for pending/draft requests */}
                        {(request.status === 'pending' || request.status === 'draft') && (
                          <button
                            onClick={() => handleDeleteRequest(request.id, request.title)}
                            className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title={isArabic ? 'حذف الطلب' : 'Delete Request'}
                          >
                            <FaTrash className="h-4 w-4 mr-2" />
                            {isArabic ? 'حذف' : 'Delete'}
                          </button>
                        )}

                        {/* Test button to change status (temporary) */}
                        {request.status !== 'accepted' && (
                          <button
                            onClick={() => {
                              // Temporarily change status for testing
                              const updatedRequests = serviceRequests.map(r => 
                                r.id === request.id ? { ...r, status: 'accepted' } : r
                              );
                              setServiceRequests(updatedRequests);
                              console.log('🔧 TEST: Changed request status to accepted');
                            }}
                            className="flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Test: Change to Accepted"
                          >
                            🧪 Test Accept
                          </button>
                        )}

                        {/* Book Appointment button - only show for accepted requests */}
                        {request.status === 'accepted' && (
                          <button
                            onClick={async () => {
                              console.log('📅 Book Appointment clicked for request:', request);
                              
                              // First fetch quotes to get the accepted quote
                              try {
                                const response = await alistProsService.getServiceQuotes({ service_request: request.id });
                                const requestQuotes = response.data.results || response.data || [];
                                console.log('📋 Fetched quotes for request:', requestQuotes);
                                const acceptedQuote = requestQuotes.find(quote => quote.status === 'accepted');
                                
                                if (acceptedQuote) {
                                  console.log('✅ Found accepted quote:', acceptedQuote);
                                  handleBookAppointment(acceptedQuote);
                                } else {
                                  console.log('❌ No accepted quote found, will create mock quote');
                                  // Create a mock quote for testing
                                  const mockQuote = {
                                    id: 'mock-' + request.id,
                                    title: request.title,
                                    description: request.description,
                                    total_price: request.budget_max || 100,
                                    status: 'accepted',
                                    professional: {
                                      id: 1, // Default professional ID for testing
                                      name: 'Test Professional',
                                      business_name: 'Test Business'
                                    }
                                  };
                                  console.log('🔧 Using mock quote for testing:', mockQuote);
                                  handleBookAppointment(mockQuote);
                                }
                              } catch (error) {
                                console.error('Error fetching quotes:', error);
                                alert(isArabic ? 'خطأ في جلب تفاصيل العرض' : 'Error fetching quote details');
                              }
                            }}
                            className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title={isArabic ? 'حجز موعد للخدمة' : 'Book Appointment for Service'}
                          >
                            <FaCalendarAlt className="h-4 w-4 mr-2" />
                            {isArabic ? 'حجز موعد' : 'Book Appointment'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isArabic ? 'تفاصيل طلب الخدمة' : 'Service Request Details'}
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimesCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{isArabic ? 'العنوان' : 'Title'}</h4>
                    <p className="text-gray-700">{selectedRequest.title}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{isArabic ? 'الوصف' : 'Description'}</h4>
                    <p className="text-gray-700">{selectedRequest.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{isArabic ? 'الحالة' : 'Status'}</h4>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {formatStatus(selectedRequest.status)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{isArabic ? 'الأولوية' : 'Urgency'}</h4>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(selectedRequest.urgency)}`}>
                        {formatUrgency(selectedRequest.urgency)}
                      </span>
                    </div>
                  </div>

                  {selectedRequest.budget_max && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{isArabic ? 'الميزانية القصوى' : 'Maximum Budget'}</h4>
                      <p className="text-gray-700">{formatCurrency(selectedRequest.budget_max)}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{isArabic ? 'تاريخ الإنشاء' : 'Created Date'}</h4>
                    <p className="text-gray-700">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quotes Modal */}
        <AnimatePresence>
          {showQuotesModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isArabic ? 'عروض الأسعار' : 'Price Quotes'}
                  </h3>
                  <button
                    onClick={() => setShowQuotesModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimesCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  {loadingQuotes ? (
                    <div className="flex justify-center items-center py-8">
                      <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
                      <span className="ml-3 text-gray-600">
                        {isArabic ? 'جاري تحميل العروض...' : 'Loading quotes...'}
                      </span>
                    </div>
                  ) : quotes.length === 0 ? (
                    <div className="text-center py-8">
                      <FaFileInvoiceDollar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        {isArabic ? 'لا توجد عروض أسعار بعد' : 'No quotes available yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((quote) => {
                        const statusInfo = getQuoteStatusInfo(quote.status);
                        return (
                          <motion.div 
                            key={quote.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">{quote.title}</h4>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-3">{quote.description}</p>
                                <div className="text-xs text-gray-500">
                                  {isArabic ? 'مقدم من:' : 'Submitted by:'} {quote.professional?.name || quote.professional?.email}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-green-600">
                                  {formatCurrency(quote.total_price)}
                                </div>
                                <div className="text-sm text-gray-500">{quote.estimated_duration}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-400" />
                                <div>
                                  <div className="font-medium">{isArabic ? 'تاريخ البدء:' : 'Start Date:'}</div>
                                  <div>{formatDate(quote.start_date)}</div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-400" />
                                <div>
                                  <div className="font-medium">{isArabic ? 'تاريخ الانتهاء:' : 'Completion Date:'}</div>
                                  <div>{formatDate(quote.completion_date)}</div>
                                </div>
                              </div>
                              {quote.warranty_period && (
                                <div className="flex items-center">
                                  <FaInfoCircle className="h-4 w-4 mr-2 text-gray-400" />
                                  <div>
                                    <div className="font-medium">{isArabic ? 'فترة الضمان:' : 'Warranty:'}</div>
                                    <div>{quote.warranty_period}</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center">
                                <FaTools className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {quote.materials_included 
                                    ? (isArabic ? 'المواد مشمولة' : 'Materials included')
                                    : (isArabic ? 'المواد غير مشمولة' : 'Materials not included')
                                  }
                                </span>
                              </div>
                              {quote.expires_at && (
                                <div className="flex items-center">
                                  <FaClock className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {isArabic ? 'ينتهي في:' : 'Expires on:'} {formatDate(quote.expires_at)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {quote.terms_and_conditions && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <h5 className="font-medium text-gray-900 mb-2">
                                  {isArabic ? 'الشروط والأحكام:' : 'Terms & Conditions:'}
                                </h5>
                                <p className="text-sm text-gray-600">{quote.terms_and_conditions}</p>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                              <div className="text-xs text-gray-500">
                                {isArabic ? 'تم الإرسال:' : 'Submitted:'} {formatDate(quote.created_at)}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {quote.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleRejectQuote(quote.id)}
                                      className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                      <FaTimesCircle className="h-4 w-4 mr-2" />
                                      {isArabic ? 'رفض' : 'Reject'}
                                    </button>
                                    <button
                                      onClick={() => handleAcceptQuote(quote.id)}
                                      className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      <FaCheckCircle className="h-4 w-4 mr-2" />
                                      {isArabic ? 'قبول العرض' : 'Accept Quote'}
                                    </button>
                                  </>
                                )}
                                {quote.status === 'accepted' && (
                                  <>
                                    <span className="flex items-center text-green-600 font-medium mr-3">
                                    <FaCheckCircle className="h-4 w-4 mr-2" />
                                    {isArabic ? 'تم القبول' : 'Accepted'}
                                  </span>
                                    <button
                                      onClick={() => handleBookAppointment(quote)}
                                      className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      <FaCalendarAlt className="h-4 w-4 mr-2" />
                                      {isArabic ? 'حجز موعد' : 'Book Appointment'}
                                    </button>
                                  </>
                                )}
                                {quote.status === 'rejected' && (
                                  <span className="flex items-center text-red-600 font-medium">
                                    <FaTimesCircle className="h-4 w-4 mr-2" />
                                    {isArabic ? 'تم الرفض' : 'Rejected'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isArabic ? 'تعديل طلب الخدمة' : 'Edit Service Request'}
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimesCircle className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateRequest} className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'عنوان الطلب *' : 'Request Title *'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isArabic ? 'أدخل عنوان الطلب' : 'Enter request title'}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'وصف المشكلة *' : 'Problem Description *'}
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isArabic ? 'اوصف المشكلة بالتفصيل' : 'Describe the problem in detail'}
                      required
                    />
                  </div>

                  {/* Urgency and Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'مستوى الأولوية' : 'Urgency Level'}
                      </label>
                      <select
                        value={editFormData.urgency}
                        onChange={(e) => setEditFormData({...editFormData, urgency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">{isArabic ? 'منخفضة' : 'Low'}</option>
                        <option value="medium">{isArabic ? 'متوسطة' : 'Medium'}</option>
                        <option value="high">{isArabic ? 'عالية' : 'High'}</option>
                        <option value="emergency">{isArabic ? 'طارئة' : 'Emergency'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الميزانية القصوى ($)' : 'Maximum Budget ($)'}
                      </label>
                      <input
                        type="number"
                        value={editFormData.budget_max}
                        onChange={(e) => setEditFormData({...editFormData, budget_max: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={isArabic ? 'أدخل الميزانية' : 'Enter budget'}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Preferred Start Date and Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'تاريخ البدء المفضل' : 'Preferred Start Date'}
                      </label>
                      <input
                        type="date"
                        value={editFormData.preferred_start_date}
                        onChange={(e) => setEditFormData({...editFormData, preferred_start_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الموقع' : 'Location'}
                      </label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={isArabic ? 'أدخل الموقع' : 'Enter location'}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updating && <FaSpinner className="animate-spin mr-2 h-4 w-4" />}
                      {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Appointment Booking Modal */}
        <AnimatePresence>
          {showAppointmentModal && selectedQuote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isArabic ? 'حجز موعد' : 'Book Appointment'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAppointmentModal(false);
                      setSelectedQuote(null);
                      setAppointmentData({ date: '', time: '', description: '', address: '', selectedSlot: null });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimesCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Professional Info */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {isArabic ? 'المحترف المختار:' : 'Selected Professional:'}
                    </h4>
                    <p className="text-blue-700 font-medium">
                      {selectedQuote.professional?.business_name || selectedQuote.professional?.name || 'Professional'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedQuote.title} - {formatCurrency(selectedQuote.total_price)}
                    </p>
                  </div>

                  {/* Loading availability */}
                  {loadingAvailability && (
                    <div className="text-center py-8">
                      <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {isArabic ? 'جاري تحميل المواعيد المتاحة...' : 'Loading available times...'}
                      </p>
                    </div>
                  )}

                  {/* No availability */}
                  {!loadingAvailability && availabilitySlots.length === 0 && (
                    <div className="text-center py-8">
                      <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        {isArabic ? 'لا توجد مواعيد متاحة حالياً' : 'No available appointments at the moment'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isArabic ? 'يرجى التواصل مع المحترف مباشرة' : 'Please contact the professional directly'}
                      </p>
                    </div>
                  )}

                  {/* Available dates */}
                  {!loadingAvailability && availabilitySlots.length > 0 && (
                    <form onSubmit={handleSubmitAppointment} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {isArabic ? 'اختر التاريخ المناسب:' : 'Select a date:'}
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {getAvailableDates().map((dateOption) => (
                            <button
                              key={dateOption.date}
                              type="button"
                              onClick={() => setAppointmentData(prev => ({ ...prev, date: dateOption.date, time: '' }))}
                              className={`p-3 text-center rounded-lg border transition-colors ${
                                appointmentData.date === dateOption.date
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                              }`}
                            >
                              <div className="text-xs text-gray-500">{dateOption.dayName}</div>
                              <div className="font-medium">{dateOption.day}</div>
                              <div className="text-xs">{dateOption.month}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Available times */}
                      {appointmentData.date && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            {isArabic ? 'اختر الوقت المناسب:' : 'Select a time:'}
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {getAvailableTimesForDate(appointmentData.date).map((timeOption) => (
                              <button
                                key={timeOption.value}
                                type="button"
                                onClick={() => setAppointmentData(prev => ({ ...prev, time: timeOption.value }))}
                                className={`p-3 text-center rounded-lg border transition-colors ${
                                  appointmentData.time === timeOption.value
                                    ? 'bg-green-500 text-white border-green-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                                }`}
                              >
                                {timeOption.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional details */}
                      {appointmentData.date && appointmentData.time && (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-green-800 mb-1">
                              {isArabic ? 'الموعد المختار:' : 'Selected appointment:'}
                            </h5>
                            <p className="text-green-700">
                              {new Date(appointmentData.date).toLocaleDateString(isArabic ? 'ar' : 'en', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} {isArabic ? 'في' : 'at'} {appointmentData.time}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {isArabic ? 'ملاحظات إضافية (اختيارية):' : 'Additional notes (optional):'}
                            </label>
                            <textarea
                              name="description"
                              value={appointmentData.description}
                              onChange={handleAppointmentInputChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={isArabic ? 'أي ملاحظات خاصة بالموعد...' : 'Any specific notes about the appointment...'}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {isArabic ? 'العنوان:' : 'Address:'}
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={appointmentData.address}
                              onChange={handleAppointmentInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={isArabic ? 'عنوان المكان للخدمة...' : 'Service location address...'}
                            />
                          </div>

                          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAppointmentModal(false);
                                setSelectedQuote(null);
                                setAppointmentData({ date: '', time: '', description: '', address: '', selectedSlot: null });
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              {isArabic ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                              type="submit"
                              disabled={creatingAppointment}
                              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {creatingAppointment && <FaSpinner className="animate-spin mr-2 h-4 w-4" />}
                              {isArabic ? 'حجز الموعد' : 'Book Appointment'}
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ClientServiceRequestsPage; 