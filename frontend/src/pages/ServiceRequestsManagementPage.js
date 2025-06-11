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
  FaFileInvoiceDollar,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaSort,
  FaHandshake,
  FaComments,
  FaPlay,
  FaPause,
  FaCheckCircle,
  FaBan,
  FaEdit,
  FaSyncAlt
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { alistProsService, messageService } from '../services/api';

const ServiceRequestsManagementPage = () => {
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
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [requestQuotes, setRequestQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [quoteData, setQuoteData] = useState({
    title: '',
    description: '',
    total_price: '',
    estimated_duration: '',
    start_date: '',
    completion_date: '',
    materials_included: true,
    warranty_period: '',
    terms_and_conditions: ''
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Check if user is professional
  const isProfessional = currentUser?.role === 'contractor' || currentUser?.role === 'specialist' || currentUser?.role === 'crew';

  // Status options for professionals
  const statusOptions = [
    { value: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending', color: 'text-yellow-600 bg-yellow-100', icon: FaClock },
    { value: 'quoted', label: isArabic ? 'تم تقديم عرض' : 'Quoted', color: 'text-blue-600 bg-blue-100', icon: FaFileInvoiceDollar },
    { value: 'accepted', label: isArabic ? 'مقبول' : 'Accepted', color: 'text-green-600 bg-green-100', icon: FaCheck },
    { value: 'in_progress', label: isArabic ? 'قيد التنفيذ' : 'In Progress', color: 'text-orange-600 bg-orange-100', icon: FaPlay },
    { value: 'completed', label: isArabic ? 'مكتمل' : 'Completed', color: 'text-green-600 bg-green-200', icon: FaCheckCircle },
    { value: 'cancelled', label: isArabic ? 'ملغي' : 'Cancelled', color: 'text-red-600 bg-red-100', icon: FaBan }
  ];

  const urgencyOptions = [
    { value: 'low', label: isArabic ? 'منخفضة' : 'Low', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: isArabic ? 'متوسطة' : 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'high', label: isArabic ? 'عالية' : 'High', color: 'text-orange-600 bg-orange-100' },
    { value: 'emergency', label: isArabic ? 'طارئ' : 'Emergency', color: 'text-red-600 bg-red-100' }
  ];

  // Redirect if not authenticated or not professional
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pro-dashboard/service-requests');
      return;
    }
    if (!isProfessional) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, isProfessional, navigate]);

  // Fetch service requests
  useEffect(() => {
    if (isAuthenticated && isProfessional) {
      fetchServiceRequests();
    }
  }, [isAuthenticated, isProfessional]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await alistProsService.getServiceRequests();
      console.log('📥 Service requests response:', response.data);
      
      const requests = response.data.results || response.data || [];
      setServiceRequests(requests);
    } catch (error) {
      console.error('❌ Error fetching service requests:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  // Update service request status
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      setUpdatingStatus(requestId);
      
      const response = await alistProsService.updateServiceRequest(requestId, {
        status: newStatus
      });
      
      console.log('✅ Status updated:', response.data);
      
      // Update local state
      setServiceRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
      
      // Show success message
      const statusLabel = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
      alert(isArabic ? 
        `تم تحديث حالة الطلب إلى "${statusLabel}" بنجاح` : 
        `Request status updated to "${statusLabel}" successfully`
      );
    } catch (error) {
      console.error('❌ Error updating status:', error);
      const errorMessage = error.response?.data?.detail || error.message;
      alert(isArabic ? 
        `فشل في تحديث الحالة: ${errorMessage}` : 
        `Failed to update status: ${errorMessage}`
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Fetch quotes for a specific service request
  const fetchRequestQuotes = async (requestId) => {
    try {
      setLoadingQuotes(true);
      const response = await alistProsService.getServiceQuotes({ service_request: requestId });
      console.log('📥 Request quotes:', response.data);
      
      const quotes = response.data.results || response.data || [];
      setRequestQuotes(quotes);
    } catch (error) {
      console.error('❌ Error fetching quotes:', error);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // Handle quote editing
  const handleEditQuote = (quote) => {
    setEditingQuote(quote);
    setQuoteData({
      title: quote.title,
      description: quote.description,
      total_price: quote.total_price,
      estimated_duration: quote.estimated_duration,
      start_date: quote.start_date ? quote.start_date.split('T')[0] : '',
      completion_date: quote.completion_date ? quote.completion_date.split('T')[0] : '',
      materials_included: quote.materials_included,
      warranty_period: quote.warranty_period,
      terms_and_conditions: quote.terms_and_conditions
    });
    setShowQuoteModal(true);
  };

  // Handle viewing quotes for a request
  const handleViewQuotes = async (request) => {
    setSelectedRequest(request);
    setShowQuotesModal(true);
    await fetchRequestQuotes(request.id);
  };

  // Update existing quote
  const handleUpdateQuote = async (e) => {
    e.preventDefault();
    if (submittingQuote || !editingQuote) return;
    
    setSubmittingQuote(true);
    try {
      const updateData = {
        title: quoteData.title,
        description: quoteData.description,
        total_price: parseFloat(quoteData.total_price),
        estimated_duration: quoteData.estimated_duration,
        start_date: quoteData.start_date,
        completion_date: quoteData.completion_date,
        materials_included: quoteData.materials_included,
        warranty_period: quoteData.warranty_period,
        terms_and_conditions: quoteData.terms_and_conditions
      };

      const response = await alistProsService.updateServiceQuote(editingQuote.id, updateData);
      console.log('✅ Quote updated:', response.data);
      
      // Reset form and close modal
      setQuoteData({
        title: '',
        description: '',
        total_price: '',
        estimated_duration: '',
        start_date: '',
        completion_date: '',
        materials_included: true,
        warranty_period: '',
        terms_and_conditions: ''
      });
      setShowQuoteModal(false);
      setEditingQuote(null);
      
      // Refresh quotes if modal is open
      if (showQuotesModal && selectedRequest) {
        await fetchRequestQuotes(selectedRequest.id);
      }
      
      alert(isArabic ? 'تم تحديث العرض بنجاح!' : 'Quote updated successfully!');
    } catch (error) {
      console.error('❌ Error updating quote:', error);
      const errorMessage = error.response?.data?.detail || error.message;
      alert(isArabic ? `فشل في تحديث العرض: ${errorMessage}` : `Failed to update quote: ${errorMessage}`);
    } finally {
      setSubmittingQuote(false);
    }
  };

  // Handle quote submission (create or update)
  const handleQuoteSubmit = (e) => {
    if (editingQuote) {
      return handleUpdateQuote(e);
    } else {
      return handleSubmitQuote(e);
    }
  };

  // Handle quote submission
  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (submittingQuote || !selectedRequest) return;
    
    setSubmittingQuote(true);
    try {
      const quoteDataForSubmission = {
        service_request_id: selectedRequest.id,
        title: quoteData.title,
        description: quoteData.description,
        total_price: parseFloat(quoteData.total_price),
        estimated_duration: quoteData.estimated_duration,
        start_date: quoteData.start_date,
        completion_date: quoteData.completion_date,
        materials_included: quoteData.materials_included,
        warranty_period: quoteData.warranty_period,
        terms_and_conditions: quoteData.terms_and_conditions
      };

      const response = await alistProsService.createServiceQuote(quoteDataForSubmission);
      console.log('✅ Quote submitted:', response.data);
      
      // Update request status to quoted
      await updateRequestStatus(selectedRequest.id, 'quoted');
      
      // Reset form and close modal
      setQuoteData({
        title: '',
        description: '',
        total_price: '',
        estimated_duration: '',
        start_date: '',
        completion_date: '',
        materials_included: true,
        warranty_period: '',
        terms_and_conditions: ''
      });
      setShowQuoteModal(false);
      setSelectedRequest(null);
      
      alert(isArabic ? 'تم إرسال العرض بنجاح!' : 'Quote submitted successfully!');
    } catch (error) {
      console.error('❌ Error submitting quote:', error);
      const errorMessage = error.response?.data?.detail || error.message;
      alert(isArabic ? `فشل في إرسال العرض: ${errorMessage}` : `Failed to submit quote: ${errorMessage}`);
    } finally {
      setSubmittingQuote(false);
    }
  };

  // Handle contact client
  const handleContactClient = async (request) => {
    try {
      const clientId = request.client?.id;
      if (!clientId) {
        alert(isArabic ? 'معرف العميل غير موجود' : 'Client ID not found');
        return;
      }

      // Navigate to messages with the client
      navigate('/pro-dashboard/messages', {
        state: { contactUserId: clientId }
      });
    } catch (error) {
      console.error('❌ Error contacting client:', error);
      alert(isArabic ? 'فشل في فتح المحادثة' : 'Failed to open conversation');
    }
  };

  // Filter requests based on search and filters
  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

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

  // Get status info
  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  // Get urgency info
  const getUrgencyInfo = (urgency) => {
    return urgencyOptions.find(u => u.value === urgency) || urgencyOptions[1];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'إدارة طلبات الخدمة | A-List Home Pros' : 'Service Requests Management | A-List Home Pros'}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isArabic ? 'طلبات الخدمة' : 'Service Requests'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isArabic ? 'إدارة ومتابعة طلبات الخدمة المخصصة لك' : 'Manage and track your assigned service requests'}
                </p>
              </div>
              <button
                onClick={fetchServiceRequests}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FaSyncAlt className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={isArabic ? 'البحث في الطلبات...' : 'Search requests...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              {/* Urgency Filter */}
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{isArabic ? 'جميع الأولويات' : 'All Priorities'}</option>
                {urgencyOptions.map(urgency => (
                  <option key={urgency.value} value={urgency.value}>{urgency.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at-desc">{isArabic ? 'الأحدث أولاً' : 'Newest First'}</option>
                <option value="created_at-asc">{isArabic ? 'الأقدم أولاً' : 'Oldest First'}</option>
                <option value="budget_max-desc">{isArabic ? 'أعلى ميزانية' : 'Highest Budget'}</option>
                <option value="budget_max-asc">{isArabic ? 'أقل ميزانية' : 'Lowest Budget'}</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FaTimes className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchServiceRequests}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  {isArabic ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-gray-600">
              {isArabic ? 
                `إجمالي ${sortedRequests.length} طلب من أصل ${serviceRequests.length}` :
                `Showing ${sortedRequests.length} of ${serviceRequests.length} requests`
              }
            </p>
          </div>

          {/* Service Requests List */}
          {sortedRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaHandshake className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isArabic ? 'لا توجد طلبات خدمة' : 'No Service Requests'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all' ? 
                  (isArabic ? 'لا توجد طلبات تطابق معايير البحث' : 'No requests match your search criteria') :
                  (isArabic ? 'لم يتم العثور على طلبات خدmة مخصصة لك بعد' : 'No service requests assigned to you yet')
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRequests.map((request) => {
                const statusInfo = getStatusInfo(request.status);
                const urgencyInfo = getUrgencyInfo(request.urgency);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyInfo.color}`}>
                              <FaExclamationTriangle className="h-3 w-3 mr-1" />
                              {urgencyInfo.label}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {request.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {request.client && (
                              <div className="flex items-center">
                                <FaUser className="h-4 w-4 mr-1" />
                                {request.client.name || request.client.email}
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <FaDollarSign className="h-4 w-4 mr-1" />
                              {formatCurrency(request.budget_max)}
                            </div>
                            
                            <div className="flex items-center">
                              <FaCalendarAlt className="h-4 w-4 mr-1" />
                              {formatDate(request.created_at)}
                            </div>
                            
                            {request.service_address && (
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="h-4 w-4 mr-1" />
                                {request.service_address.city}, {request.service_address.state}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {/* Status Change Dropdown */}
                          <select
                            value={request.status}
                            onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                            disabled={updatingStatus === request.id}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                          >
                            {statusOptions.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          
                          {updatingStatus === request.id && (
                            <FaSpinner className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailsModal(true);
                            }}
                            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <FaEye className="h-4 w-4 mr-1" />
                            {isArabic ? 'التفاصيل' : 'Details'}
                          </button>

                          <button
                            onClick={() => handleViewQuotes(request)}
                            className="flex items-center px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <FaFileInvoiceDollar className="h-4 w-4 mr-1" />
                            {isArabic ? 'العروض' : 'Quotes'} 
                            {request.quotes_count > 0 && (
                              <span className="ml-1 bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded-full">
                                {request.quotes_count}
                              </span>
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setEditingQuote(null);
                              setQuoteData({
                                title: `Quote for ${request.title}`,
                                description: `Quote for service request: ${request.title}`,
                                total_price: '',
                                estimated_duration: '',
                                start_date: '',
                                completion_date: '',
                                materials_included: true,
                                warranty_period: '',
                                terms_and_conditions: ''
                              });
                              setShowQuoteModal(true);
                            }}
                            className="flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                          >
                            <FaFileInvoiceDollar className="h-4 w-4 mr-1" />
                            {isArabic ? 'عرض جديد' : 'New Quote'}
                          </button>
                          
                          <button
                            onClick={() => handleContactClient(request)}
                            className="flex items-center px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <FaComments className="h-4 w-4 mr-1" />
                            {isArabic ? 'تواصل' : 'Contact'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quote Modal */}
        <AnimatePresence>
          {showQuoteModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowQuoteModal(false);
                  setSelectedRequest(null);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingQuote ? 
                        (isArabic ? 'تعديل عرض السعر' : 'Edit Quote') : 
                        (isArabic ? 'إرسال عرض سعر' : 'Send Quote')
                      }
                    </h3>
                    <button
                      onClick={() => {
                        setShowQuoteModal(false);
                        setSelectedRequest(null);
                        setEditingQuote(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleQuoteSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'عنوان العرض' : 'Quote Title'}
                    </label>
                    <input
                      type="text"
                      value={quoteData.title}
                      onChange={(e) => setQuoteData({...quoteData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'وصف العرض' : 'Quote Description'}
                    </label>
                    <textarea
                      value={quoteData.description}
                      onChange={(e) => setQuoteData({...quoteData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'السعر الإجمالي' : 'Total Price'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={quoteData.total_price}
                        onChange={(e) => setQuoteData({...quoteData, total_price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'المدة المقدرة' : 'Estimated Duration'}
                      </label>
                      <input
                        type="text"
                        value={quoteData.estimated_duration}
                        onChange={(e) => setQuoteData({...quoteData, estimated_duration: e.target.value})}
                        placeholder={isArabic ? 'مثال: 3 أيام' : 'e.g., 3 days'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'تاريخ البدء' : 'Start Date'}
                      </label>
                      <input
                        type="date"
                        value={quoteData.start_date}
                        onChange={(e) => setQuoteData({...quoteData, start_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'تاريخ الانتهاء' : 'Completion Date'}
                      </label>
                      <input
                        type="date"
                        value={quoteData.completion_date}
                        onChange={(e) => setQuoteData({...quoteData, completion_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quoteData.materials_included}
                        onChange={(e) => setQuoteData({...quoteData, materials_included: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {isArabic ? 'المواد مشمولة في السعر' : 'Materials included in price'}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'فترة الضمان' : 'Warranty Period'}
                    </label>
                    <input
                      type="text"
                      value={quoteData.warranty_period}
                      onChange={(e) => setQuoteData({...quoteData, warranty_period: e.target.value})}
                      placeholder={isArabic ? 'مثال: سنة واحدة' : 'e.g., 1 year'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'الشروط والأحكام' : 'Terms and Conditions'}
                    </label>
                    <textarea
                      value={quoteData.terms_and_conditions}
                      onChange={(e) => setQuoteData({...quoteData, terms_and_conditions: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuoteModal(false);
                        setSelectedRequest(null);
                        setEditingQuote(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingQuote}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submittingQuote ? (
                        <>
                          <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                          {editingQuote ? 
                            (isArabic ? 'جاري التحديث...' : 'Updating...') :
                            (isArabic ? 'جاري الإرسال...' : 'Sending...')
                          }
                        </>
                      ) : (
                        <>
                          <FaCheck className="h-4 w-4 mr-2" />
                          {editingQuote ? 
                            (isArabic ? 'تحديث العرض' : 'Update Quote') :
                            (isArabic ? 'إرسال العرض' : 'Send Quote')
                          }
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isArabic ? 'تفاصيل طلب الخدمة' : 'Service Request Details'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedRequest(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedRequest.title}</h4>
                    <p className="text-gray-600">{selectedRequest.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        {isArabic ? 'معلومات العميل' : 'Client Information'}
                      </h5>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaUser className="h-4 w-4 mr-2" />
                          {selectedRequest.client?.name || selectedRequest.client?.email}
                        </div>
                        {selectedRequest.client?.email && (
                          <div className="flex items-center">
                            <FaEnvelope className="h-4 w-4 mr-2" />
                            {selectedRequest.client.email}
                          </div>
                        )}
                        {selectedRequest.client?.phone && (
                          <div className="flex items-center">
                            <FaPhone className="h-4 w-4 mr-2" />
                            {selectedRequest.client.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        {isArabic ? 'تفاصيل الطلب' : 'Request Details'}
                      </h5>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaDollarSign className="h-4 w-4 mr-2" />
                          {isArabic ? 'الميزانية القصوى:' : 'Max Budget:'} {formatCurrency(selectedRequest.budget_max)}
                        </div>
                        <div className="flex items-center">
                          <FaExclamationTriangle className="h-4 w-4 mr-2" />
                          {isArabic ? 'الأولوية:' : 'Priority:'} {getUrgencyInfo(selectedRequest.urgency).label}
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="h-4 w-4 mr-2" />
                          {isArabic ? 'تاريخ الإنشاء:' : 'Created:'} {formatDate(selectedRequest.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.service_address && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        {isArabic ? 'عنوان الخدمة' : 'Service Address'}
                      </h5>
                      <div className="flex items-start text-sm text-gray-600">
                        <FaMapMarkerAlt className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                          {selectedRequest.service_address.street_address}<br />
                          {selectedRequest.service_address.city}, {selectedRequest.service_address.state} {selectedRequest.service_address.zip_code}<br />
                          {selectedRequest.service_address.country}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => handleContactClient(selectedRequest)}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FaComments className="h-4 w-4 mr-2" />
                      {isArabic ? 'تواصل مع العميل' : 'Contact Client'}
                    </button>
                    {selectedRequest.status === 'pending' && (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          setQuoteData({
                            ...quoteData,
                            title: `Quote for ${selectedRequest.title}`,
                            description: `Quote for service request: ${selectedRequest.title}`
                          });
                          setShowQuoteModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaFileInvoiceDollar className="h-4 w-4 mr-2" />
                        {isArabic ? 'إرسال عرض' : 'Send Quote'}
                      </button>
                    )}
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
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowQuotesModal(false);
                  setSelectedRequest(null);
                  setRequestQuotes([]);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isArabic ? `عروض الأسعار - ${selectedRequest.title}` : `Quotes - ${selectedRequest.title}`}
                    </h3>
                    <button
                      onClick={() => {
                        setShowQuotesModal(false);
                        setSelectedRequest(null);
                        setRequestQuotes([]);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {loadingQuotes ? (
                    <div className="flex justify-center items-center py-8">
                      <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                      <span className="ml-3">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
                    </div>
                  ) : requestQuotes.length === 0 ? (
                    <div className="text-center py-8">
                      <FaFileInvoiceDollar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {isArabic ? 'لا توجد عروض أسعار' : 'No Quotes Yet'}
                      </h4>
                      <p className="text-gray-500 mb-4">
                        {isArabic ? 'لم يتم إرسال أي عروض أسعار لهذا الطلب بعد' : 'No quotes have been sent for this request yet'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingQuote(null);
                          setQuoteData({
                            title: `Quote for ${selectedRequest.title}`,
                            description: `Quote for service request: ${selectedRequest.title}`,
                            total_price: '',
                            estimated_duration: '',
                            start_date: '',
                            completion_date: '',
                            materials_included: true,
                            warranty_period: '',
                            terms_and_conditions: ''
                          });
                          setShowQuoteModal(true);
                          setShowQuotesModal(false);
                        }}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                      >
                        <FaFileInvoiceDollar className="h-4 w-4 mr-2" />
                        {isArabic ? 'إنشاء عرض سعر' : 'Create Quote'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">
                          {isArabic ? `إجمالي ${requestQuotes.length} عرض` : `${requestQuotes.length} Quote(s)`}
                        </h4>
                        <button
                          onClick={() => {
                            setEditingQuote(null);
                            setQuoteData({
                              title: `Quote for ${selectedRequest.title}`,
                              description: `Quote for service request: ${selectedRequest.title}`,
                              total_price: '',
                              estimated_duration: '',
                              start_date: '',
                              completion_date: '',
                              materials_included: true,
                              warranty_period: '',
                              terms_and_conditions: ''
                            });
                            setShowQuoteModal(true);
                            setShowQuotesModal(false);
                          }}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <FaFileInvoiceDollar className="h-4 w-4 mr-2" />
                          {isArabic ? 'عرض جديد' : 'New Quote'}
                        </button>
                      </div>

                      {requestQuotes.map((quote) => (
                        <div key={quote.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">{quote.title}</h5>
                              <p className="text-gray-600 text-sm mb-2">{quote.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">
                                    {isArabic ? 'السعر:' : 'Price:'}
                                  </span>
                                  <span className="ml-2 text-green-600 font-semibold">
                                    ${parseFloat(quote.total_price || 0).toLocaleString()}
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-700">
                                    {isArabic ? 'المدة:' : 'Duration:'}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    {quote.estimated_duration || (isArabic ? 'غير محدد' : 'Not specified')}
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-700">
                                    {isArabic ? 'الحالة:' : 'Status:'}
                                  </span>
                                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {quote.status === 'pending' ? (isArabic ? 'قيد الانتظار' : 'Pending') :
                                     quote.status === 'accepted' ? (isArabic ? 'مقبول' : 'Accepted') :
                                     quote.status === 'rejected' ? (isArabic ? 'مرفوض' : 'Rejected') :
                                     quote.status}
                                  </span>
                                </div>
                              </div>
                              
                              {quote.start_date && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">
                                    {isArabic ? 'فترة التنفيذ:' : 'Execution Period:'}
                                  </span>
                                  <span className="ml-2">
                                    {formatDate(quote.start_date)} - {formatDate(quote.completion_date)}
                                  </span>
                                </div>
                              )}
                              
                              {quote.warranty_period && (
                                <div className="mt-1 text-sm text-gray-600">
                                  <span className="font-medium">
                                    {isArabic ? 'فترة الضمان:' : 'Warranty:'}
                                  </span>
                                  <span className="ml-2">{quote.warranty_period}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleEditQuote(quote)}
                                className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <FaEdit className="h-4 w-4 mr-1" />
                                {isArabic ? 'تعديل' : 'Edit'}
                              </button>
                            </div>
                          </div>
                          
                          {quote.materials_included && (
                            <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded inline-block">
                              <FaCheck className="h-3 w-3 mr-1 inline text-green-600" />
                              {isArabic ? 'المواد مشمولة' : 'Materials included'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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

export default ServiceRequestsManagementPage; 