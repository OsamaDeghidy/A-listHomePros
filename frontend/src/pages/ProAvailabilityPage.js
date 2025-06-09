import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useAvailabilityManagement } from '../hooks/useAvailabilityManagement';
import {
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaInfo,
  FaCheckCircle,
  FaSyncAlt,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaCopy,
  FaCalendarTimes
} from 'react-icons/fa';

const ProAvailabilityPage = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Use the availability management hook
  const {
    loading,
    error: apiError,
    availabilitySlots,
    unavailableDates,
    slotsByDay,
    stats,
    fetchAvailabilityData,
    createSlot,
    updateSlot,
    deleteSlot,
    createUnavailableDate,
    deleteUnavailableDate,
    clearError
  } = useAvailabilityManagement();

  // Local UI states
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [profileAutoCreated, setProfileAutoCreated] = useState(false);
  
  // Modal states
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  
  // Form states for new/edit slot
  const [slotForm, setSlotForm] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_recurring: true
  });

  // Form state for unavailable dates
  const [unavailableForm, setUnavailableForm] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  // Days of week in Arabic and English (backend: 0=Sunday, 1=Monday, etc.)
  // Display order: Monday to Sunday for better UX
  const daysOfWeek = [
    { value: 1, label: isArabic ? 'الإثنين' : 'Monday', short: isArabic ? 'ن' : 'Mon' },
    { value: 2, label: isArabic ? 'الثلاثاء' : 'Tuesday', short: isArabic ? 'ث' : 'Tue' },
    { value: 3, label: isArabic ? 'الأربعاء' : 'Wednesday', short: isArabic ? 'ر' : 'Wed' },
    { value: 4, label: isArabic ? 'الخميس' : 'Thursday', short: isArabic ? 'خ' : 'Thu' },
    { value: 5, label: isArabic ? 'الجمعة' : 'Friday', short: isArabic ? 'ج' : 'Fri' },
    { value: 6, label: isArabic ? 'السبت' : 'Saturday', short: isArabic ? 'س' : 'Sat' },
    { value: 0, label: isArabic ? 'الأحد' : 'Sunday', short: isArabic ? 'ح' : 'Sun' }
  ];

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailabilityData();
    }
  }, [isAuthenticated, fetchAvailabilityData]);

  // Handle adding new slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createSlot(slotForm);
      
      // Reset form and close modal
      setSlotForm({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        is_recurring: true
      });
      setShowAddSlotModal(false);
      
      setSuccess(isArabic ? 'تم إضافة الوقت المتاح بنجاح' : 'Availability slot added successfully');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      // Error is handled by the hook
    } finally {
      setSaving(false);
    }
  };

  // Handle editing slot
  const handleEditSlot = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateSlot(editingSlot.id, slotForm);
      
      // Close modal and reset
      setShowEditSlotModal(false);
      setEditingSlot(null);
      
      setSuccess(isArabic ? 'تم تحديث الوقت المتاح بنجاح' : 'Availability slot updated successfully');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      // Error is handled by the hook
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الوقت المتاح؟' : 'Are you sure you want to delete this availability slot?')) {
      return;
    }

    setSaving(true);

    try {
      await deleteSlot(slotId);
      
      setSuccess(isArabic ? 'تم حذف الوقت المتاح بنجاح' : 'Availability slot deleted successfully');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      // Error is handled by the hook
    } finally {
      setSaving(false);
    }
  };

  // Handle adding unavailable date
  const handleAddUnavailableDate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createUnavailableDate(unavailableForm);
      
      // Reset form and close modal
      setUnavailableForm({
        start_date: '',
        end_date: '',
        reason: ''
      });
      setShowUnavailableModal(false);
      
      setSuccess(isArabic ? 'تم إضافة التاريخ غير المتاح بنجاح' : 'Unavailable date added successfully');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      // Error is handled by the hook
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting unavailable date
  const handleDeleteUnavailableDate = async (dateId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا التاريخ غير المتاح؟' : 'Are you sure you want to delete this unavailable date?')) {
      return;
    }

    setSaving(true);

    try {
      await deleteUnavailableDate(dateId);
      
      setSuccess(isArabic ? 'تم حذف التاريخ غير المتاح بنجاح' : 'Unavailable date deleted successfully');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      // Error is handled by the hook
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_recurring: slot.is_recurring
    });
    setShowEditSlotModal(true);
  };

  // Handle refresh
  const handleRefresh = async () => {
    clearError();
    await fetchAvailabilityData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isArabic ? 'جاري تحميل البيانات...' : 'Loading availability data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'إدارة الأوقات المتاحة | A-List Home Pros' : 'Availability Management | A-List Home Pros'}</title>
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
                {isArabic ? 'إدارة الأوقات المتاحة' : 'Availability Management'}
              </h1>
              <p className="text-gray-600">
                {isArabic ? 'حدد الأوقات التي تكون فيها متاحاً لاستقبال المواعيد' : 'Set your available times for receiving appointments'}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <FaSyncAlt className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>
              <button
                onClick={() => setShowAddSlotModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                {isArabic ? 'إضافة وقت متاح' : 'Add Time Slot'}
              </button>
              <button
                onClick={() => setShowUnavailableModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaCalendarTimes className="mr-2 h-4 w-4" />
                {isArabic ? 'إضافة عطلة' : 'Add Unavailable Date'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800"
        >
          <div className="flex items-center">
            <FaInfo className="mr-2 h-4 w-4 text-blue-600" />
            <span className="text-sm">
              {isArabic 
                ? 'عملاؤك سيتمكنون من حجز المواعيد فقط في الأوقات المحددة هنا'
                : 'Clients will only be able to book appointments during the times you set here'
              }
            </span>
          </div>
        </motion.div>

        {/* Auto-Created Profile Banner */}
        {profileAutoCreated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800"
          >
            <div className="flex items-start">
              <FaExclamationTriangle className="mr-2 h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isArabic 
                    ? 'تم إنشاء ملف شخصي مهني أساسي لك'
                    : 'A basic professional profile has been created for you'
                  }
                </p>
                <p className="text-xs mt-1">
                  {isArabic 
                    ? 'يرجى إكمال ملفك الشخصي في قسم "الخدمات" لإضافة خدماتك ومعلومات عملك'
                    : 'Please complete your profile in the "Services" section to add your services and business information'
                  }
                </p>
              </div>
              <button
                onClick={() => setProfileAutoCreated(false)}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'إجمالي الأوقات' : 'Total Slots'}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSlots}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaClock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'أيام نشطة' : 'Active Days'}</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeDays}/7</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCalendarAlt className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'عطل قادمة' : 'Upcoming Breaks'}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.upcomingUnavailable}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaCalendarTimes className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{isArabic ? 'إجمالي العطل' : 'Total Unavailable'}</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalUnavailable}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Schedule */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isArabic ? 'الجدول الأسبوعي' : 'Weekly Schedule'}
            </h2>
            <div className="text-sm text-gray-600">
              {isArabic ? 'إجمالي الأوقات:' : 'Total slots:'} {stats.totalSlots}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {daysOfWeek.map(day => (
              <motion.div
                key={day.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-900 mb-3 text-center">
                  {day.label}
                </h3>
                
                <div className="space-y-2">
                  {slotsByDay[day.value] && slotsByDay[day.value].length > 0 ? (
                    slotsByDay[day.value].map(slot => (
                      <div
                        key={slot.id}
                        className="bg-green-50 border border-green-200 rounded-lg p-3 group hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">
                            {slot.start_time} - {slot.end_time}
                          </span>
                          <div className="flex space-x-1 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(slot)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title={isArabic ? 'تعديل' : 'Edit'}
                            >
                              <FaEdit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title={isArabic ? 'حذف' : 'Delete'}
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {slot.is_recurring && (
                          <div className="flex items-center text-xs text-green-600">
                            <FaCalendarAlt className="mr-1 h-3 w-3" />
                            {isArabic ? 'متكرر أسبوعياً' : 'Recurring weekly'}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {isArabic ? 'لا توجد أوقات متاحة' : 'No available times'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Unavailable Dates */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isArabic ? 'التواريخ غير المتاحة' : 'Unavailable Dates'}
            </h2>
            <div className="text-sm text-gray-600">
              {isArabic ? 'العطل والإجازات' : 'Holidays & Breaks'}
            </div>
          </div>

          {unavailableDates.length > 0 ? (
            <div className="space-y-3">
              {unavailableDates.map(date => (
                <motion.div
                  key={date.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg group hover:bg-red-100 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <FaCalendarTimes className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">
                        {new Date(date.start_date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                        {date.end_date && date.end_date !== date.start_date && (
                          <> - {new Date(date.end_date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</>
                        )}
                      </span>
                    </div>
                    {date.reason && (
                      <p className="text-sm text-red-600 mt-1">{date.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteUnavailableDate(date.id)}
                    className="p-2 text-red-600 hover:bg-red-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title={isArabic ? 'حذف' : 'Delete'}
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaCalendarTimes className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isArabic ? 'لا توجد تواريخ غير متاحة' : 'No unavailable dates'}
              </h3>
              <p className="text-gray-600">
                {isArabic ? 'أضف العطل والإجازات لمنع الحجز في هذه التواريخ' : 'Add holidays and breaks to prevent bookings on those dates'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            >
              <div className="flex items-center">
                <FaCheckCircle className="mr-2 h-4 w-4" />
                <span>{success}</span>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            >
              <div className="flex items-center">
                <FaExclamationTriangle className="mr-2 h-4 w-4" />
                <span>{apiError}</span>
                <button
                  onClick={() => clearError()}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Slot Modal */}
        <AnimatePresence>
          {showAddSlotModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddSlotModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleAddSlot}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        {isArabic ? 'إضافة وقت متاح' : 'Add Time Slot'}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowAddSlotModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaTimes className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Day of Week */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'اليوم' : 'Day of Week'}
                        </label>
                        <select
                          value={slotForm.day_of_week}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          {daysOfWeek.map(day => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'وقت البداية' : 'Start Time'}
                        </label>
                        <input
                          type="time"
                          value={slotForm.start_time}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, start_time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'وقت النهاية' : 'End Time'}
                        </label>
                        <input
                          type="time"
                          value={slotForm.end_time}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, end_time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* Recurring */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_recurring"
                          checked={slotForm.is_recurring}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, is_recurring: e.target.checked }))}
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_recurring" className="text-sm text-gray-700">
                          {isArabic ? 'متكرر كل أسبوع' : 'Recurring weekly'}
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAddSlotModal(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2 h-4 w-4" />
                            {isArabic ? 'حفظ' : 'Save'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Slot Modal */}
        <AnimatePresence>
          {showEditSlotModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowEditSlotModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleEditSlot}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        {isArabic ? 'تعديل الوقت المتاح' : 'Edit Time Slot'}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowEditSlotModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaTimes className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Day of Week */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'اليوم' : 'Day of Week'}
                        </label>
                        <select
                          value={slotForm.day_of_week}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          {daysOfWeek.map(day => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'وقت البداية' : 'Start Time'}
                        </label>
                        <input
                          type="time"
                          value={slotForm.start_time}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, start_time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'وقت النهاية' : 'End Time'}
                        </label>
                        <input
                          type="time"
                          value={slotForm.end_time}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, end_time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* Recurring */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit_is_recurring"
                          checked={slotForm.is_recurring}
                          onChange={(e) => setSlotForm(prev => ({ ...prev, is_recurring: e.target.checked }))}
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="edit_is_recurring" className="text-sm text-gray-700">
                          {isArabic ? 'متكرر كل أسبوع' : 'Recurring weekly'}
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                      <button
                        type="button"
                        onClick={() => setShowEditSlotModal(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            {isArabic ? 'جاري التحديث...' : 'Updating...'}
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2 h-4 w-4" />
                            {isArabic ? 'تحديث' : 'Update'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Unavailable Date Modal */}
        <AnimatePresence>
          {showUnavailableModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowUnavailableModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleAddUnavailableDate}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        {isArabic ? 'إضافة تاريخ غير متاح' : 'Add Unavailable Date'}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowUnavailableModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaTimes className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Start Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'تاريخ البداية' : 'Start Date'}
                        </label>
                        <input
                          type="date"
                          value={unavailableForm.start_date}
                          onChange={(e) => setUnavailableForm(prev => ({ ...prev, start_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* End Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'تاريخ النهاية (اختياري)' : 'End Date (Optional)'}
                        </label>
                        <input
                          type="date"
                          value={unavailableForm.end_date}
                          onChange={(e) => setUnavailableForm(prev => ({ ...prev, end_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isArabic ? 'السبب (اختياري)' : 'Reason (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={unavailableForm.reason}
                          onChange={(e) => setUnavailableForm(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder={isArabic ? 'مثال: عطلة، إجازة، مؤتمر' : 'e.g., Holiday, Vacation, Conference'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                      <button
                        type="button"
                        onClick={() => setShowUnavailableModal(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2 h-4 w-4" />
                            {isArabic ? 'حفظ' : 'Save'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProAvailabilityPage; 