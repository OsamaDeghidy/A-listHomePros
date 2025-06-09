import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { 
  schedulingService, 
  messagingService, 
  alistProsService, 
  userService 
} from '../services/api';
import { 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaEye, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaStar, 
  FaMapMarkerAlt, 
  FaChartLine, 
  FaUserPlus, 
  FaDownload, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaHeart,
  FaDollarSign,
  FaHistory,
  FaUserTag,
  FaFileExport,
  FaPrint,
  FaSyncAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlus,
  FaInfo,
  FaCalendarCheck
} from 'react-icons/fa';

const ProClientsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    newThisMonth: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalAppointments: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Redirect if not authenticated or not professional
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pro-dashboard/clients');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch clients data
  useEffect(() => {
    if (isAuthenticated) {
      fetchClientsData();
    }
  }, [isAuthenticated]);

  // Filter and sort clients
  useEffect(() => {
    let filtered = [...clients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => client.status === filterStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'appointments':
          aValue = a.totalAppointments || 0;
          bValue = b.totalAppointments || 0;
          break;
        case 'revenue':
          aValue = a.totalSpent || 0;
          bValue = b.totalSpent || 0;
          break;
        case 'lastContact':
          aValue = new Date(a.lastAppointment || 0);
          bValue = new Date(b.lastAppointment || 0);
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, filterStatus, sortBy, sortOrder]);

  const fetchClientsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get professional's appointments to extract clients
      const appointmentsResponse = await schedulingService.getAppointments();
      const appointments = appointmentsResponse.data.results || [];

      // Get unique clients from appointments
      const clientsMap = new Map();
      
      for (const appointment of appointments) {
        if (appointment.client) {
          const clientId = appointment.client.id || appointment.client_id;
          
          if (!clientsMap.has(clientId)) {
            // Initialize client data
            clientsMap.set(clientId, {
              id: clientId,
              name: appointment.client.name || 
                    `${appointment.client.first_name || ''} ${appointment.client.last_name || ''}`.trim() ||
                    appointment.client.email ||
                    (isArabic ? 'عميل' : 'Client'),
              email: appointment.client.email,
              phone: appointment.client.phone_number || appointment.client.phone,
              avatar: appointment.client.profile_picture || null,
              appointments: [],
              status: 'active',
              joinDate: appointment.client.date_joined || appointment.created_at,
              lastAppointment: null,
              totalAppointments: 0,
              completedAppointments: 0,
              cancelledAppointments: 0,
              totalSpent: 0,
              rating: 0,
              location: appointment.client.address || (isArabic ? 'غير محدد' : 'Not specified')
            });
          }

          // Add appointment to client
          const client = clientsMap.get(clientId);
          client.appointments.push(appointment);
          client.totalAppointments++;

          // Update appointment statistics
          if (appointment.status === 'completed') {
            client.completedAppointments++;
            client.totalSpent += parseFloat(appointment.total_cost || appointment.estimated_cost || 0);
          } else if (appointment.status === 'cancelled') {
            client.cancelledAppointments++;
          }

          // Update last appointment date
          const appointmentDate = new Date(appointment.appointment_date || appointment.created_at);
          if (!client.lastAppointment || appointmentDate > new Date(client.lastAppointment)) {
            client.lastAppointment = appointmentDate.toISOString();
          }
        }
      }

      // Convert map to array and calculate additional metrics
      const clientsArray = Array.from(clientsMap.values()).map(client => ({
        ...client,
        status: determineClientStatus(client),
        rating: calculateClientSatisfaction(client)
      }));

      setClients(clientsArray);
      calculateClientStats(clientsArray);

    } catch (err) {
      console.error('Error fetching clients data:', err);
      setError(isArabic ? 'فشل في تحميل بيانات العملاء' : 'Failed to load clients data');
    } finally {
      setLoading(false);
    }
  };

  const determineClientStatus = (client) => {
    const lastAppointment = client.lastAppointment ? new Date(client.lastAppointment) : null;
    const daysSinceLastAppointment = lastAppointment 
      ? Math.floor((Date.now() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (!lastAppointment) return 'new';
    if (daysSinceLastAppointment <= 30) return 'active';
    if (daysSinceLastAppointment <= 90) return 'inactive';
    return 'dormant';
  };

  const calculateClientSatisfaction = (client) => {
    // This would normally come from reviews/ratings
    // For now, calculate based on completion rate
    if (client.totalAppointments === 0) return 0;
    
    const completionRate = client.completedAppointments / client.totalAppointments;
    const cancellationRate = client.cancelledAppointments / client.totalAppointments;
    
    // Simple satisfaction calculation
    return Math.max(0, Math.min(5, (completionRate * 5) - (cancellationRate * 2)));
  };

  const calculateClientStats = (clientsArray) => {
    const stats = clientsArray.reduce((acc, client) => {
      acc.totalClients++;
      if (client.status === 'active') acc.activeClients++;
      
      // Check if client joined this month
      const joinDate = new Date(client.joinDate);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      if (joinDate >= thisMonth) acc.newThisMonth++;
      
      acc.totalRevenue += client.totalSpent;
      acc.totalAppointments += client.totalAppointments;
      acc.avgRating += client.rating;
      
      return acc;
    }, {
      totalClients: 0,
      activeClients: 0,
      newThisMonth: 0,
      totalRevenue: 0,
      avgRating: 0,
      totalAppointments: 0
    });

    // Calculate average rating
    stats.avgRating = stats.totalClients > 0 ? stats.avgRating / stats.totalClients : 0;

    setClientStats(stats);
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleSendMessage = (client) => {
    navigate(`/pro-dashboard/messages?client=${client.id}`);
  };

  const handleScheduleAppointment = (client) => {
    navigate(`/pro-dashboard/calendar?client=${client.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dormant': return 'bg-red-100 text-red-800 border-red-200';
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return isArabic ? 'نشط' : 'Active';
      case 'inactive': return isArabic ? 'غير نشط' : 'Inactive';
      case 'dormant': return isArabic ? 'خامل' : 'Dormant';
      case 'new': return isArabic ? 'جديد' : 'New';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return isArabic ? 'غير محدد' : 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

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
        <title>{isArabic ? 'إدارة العملاء | A-List Home Pros' : 'Client Management | A-List Home Pros'}</title>
      </Helmet>

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isArabic ? 'إدارة العملاء' : 'Client Management'}
              </h1>
              <p className="text-gray-600">
                {isArabic ? 'إدارة وتتبع عملائك وعلاقاتهم' : 'Manage and track your clients and relationships'}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={fetchClientsData}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaSyncAlt className="mr-2 h-4 w-4" />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>
              <button
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2 h-4 w-4" />
                {isArabic ? 'تصدير' : 'Export'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'إجمالي العملاء' : 'Total Clients'}</p>
                <p className="text-2xl font-bold text-gray-900">{clientStats.totalClients}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'عملاء نشطون' : 'Active Clients'}</p>
                <p className="text-2xl font-bold text-green-600">{clientStats.activeClients}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'عملاء جدد (هذا الشهر)' : 'New This Month'}</p>
                <p className="text-2xl font-bold text-purple-600">{clientStats.newThisMonth}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUserPlus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(clientStats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <FaDollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={isArabic ? 'البحث في العملاء...' : 'Search clients...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
                <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
                <option value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
                <option value="dormant">{isArabic ? 'خامل' : 'Dormant'}</option>
                <option value="new">{isArabic ? 'جديد' : 'New'}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">{isArabic ? 'الاسم' : 'Name'}</option>
                <option value="appointments">{isArabic ? 'المواعيد' : 'Appointments'}</option>
                <option value="revenue">{isArabic ? 'الإيرادات' : 'Revenue'}</option>
                <option value="lastContact">{isArabic ? 'آخر تواصل' : 'Last Contact'}</option>
                <option value="rating">{isArabic ? 'التقييم' : 'Rating'}</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <FaArrowUp className="h-4 w-4" /> : <FaArrowDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Clients Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
        >
          {currentClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleClientClick(client)}
            >
              {/* Client Header */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                <div className="relative">
                  {client.avatar ? (
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    client.status === 'active' ? 'bg-green-500' : 
                    client.status === 'inactive' ? 'bg-yellow-500' : 
                    client.status === 'new' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{client.name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                    {getStatusText(client.status)}
                  </span>
                </div>
              </div>

              {/* Client Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{client.totalAppointments}</p>
                  <p className="text-xs text-gray-500">{isArabic ? 'مواعيد' : 'Appointments'}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(client.totalSpent)}</p>
                  <p className="text-xs text-gray-500">{isArabic ? 'إجمالي' : 'Total'}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FaEnvelope className="h-3 w-3 mr-2" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="h-3 w-3 mr-2" />
                    <span>{client.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <FaClock className="h-3 w-3 mr-2" />
                  <span>{isArabic ? 'آخر موعد: ' : 'Last: '}{formatDate(client.lastAppointment)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendMessage(client);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <FaEnvelope className="h-3 w-3 mr-1" />
                  {isArabic ? 'رسالة' : 'Message'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScheduleAppointment(client);
                  }}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <FaCalendarAlt className="h-3 w-3 mr-1" />
                  {isArabic ? 'موعد' : 'Book'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredClients.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FaUsers className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isArabic ? 'لا توجد عملاء' : 'No clients found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? (isArabic ? 'لا توجد نتائج مطابقة للبحث' : 'No clients match your search criteria')
                : (isArabic ? 'ابدأ في الحصول على عملاء لرؤيتهم هنا' : 'Start getting clients to see them here')
              }
            </p>
            {searchTerm || filterStatus !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isArabic ? 'مسح المرشحات' : 'Clear Filters'}
              </button>
            ) : null}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isArabic ? 'السابق' : 'Previous'}
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isArabic ? 'التالي' : 'Next'}
            </button>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 h-4 w-4" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Client Detail Modal - to be implemented */}
      <AnimatePresence>
        {showClientModal && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClientModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal content will be implemented in a separate component */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isArabic ? 'تفاصيل العميل' : 'Client Details'}
                  </h2>
                  <button
                    onClick={() => setShowClientModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Simplified client details for now */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    {selectedClient.avatar ? (
                      <img
                        src={selectedClient.avatar}
                        alt={selectedClient.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {selectedClient.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedClient.name}</h3>
                      <p className="text-gray-600">{selectedClient.email}</p>
                      {selectedClient.phone && <p className="text-gray-600">{selectedClient.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">{isArabic ? 'إجمالي المواعيد' : 'Total Appointments'}</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedClient.totalAppointments}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">{isArabic ? 'إجمالي الإنفاق' : 'Total Spent'}</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedClient.totalSpent)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">{isArabic ? 'آخر موعد' : 'Last Appointment'}</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(selectedClient.lastAppointment)}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4 rtl:space-x-reverse">
                    <button
                      onClick={() => {
                        setShowClientModal(false);
                        handleSendMessage(selectedClient);
                      }}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaEnvelope className="mr-2 h-4 w-4" />
                      {isArabic ? 'إرسال رسالة' : 'Send Message'}
                    </button>
                    <button
                      onClick={() => {
                        setShowClientModal(false);
                        handleScheduleAppointment(selectedClient);
                      }}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaCalendarAlt className="mr-2 h-4 w-4" />
                      {isArabic ? 'حجز موعد' : 'Schedule Appointment'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProClientsPage; 