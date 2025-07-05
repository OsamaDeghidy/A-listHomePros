import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDollarSign, 
  FaClock, 
  FaCheck, 
  FaExclamationTriangle,
  FaShieldAlt,
  FaCalendarAlt,
  FaHourglass,
  FaTimesCircle
} from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import paymentService from '../../services/paymentService';

const PaymentMilestones = ({ escrowId, onMilestoneUpdate }) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingMilestone, setPayingMilestone] = useState(null);

  useEffect(() => {
    if (escrowId) {
      fetchMilestones();
    }
  }, [escrowId]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await paymentService.getEscrowMilestones(token, escrowId);
      setMilestones(response.data || []);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError('Failed to load payment milestones');
    } finally {
      setLoading(false);
    }
  };

  const handlePayMilestone = async (milestoneId) => {
    try {
      setPayingMilestone(milestoneId);
      const token = localStorage.getItem('token');
      
      // Call payment API
      const response = await paymentService.payMilestone(token, milestoneId);
      
      if (response.data.stripe_session_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.stripe_session_url;
      } else {
        // Refresh milestones after successful payment
        await fetchMilestones();
        if (onMilestoneUpdate) onMilestoneUpdate();
      }
    } catch (err) {
      console.error('Error paying milestone:', err);
      setError('Failed to process payment');
    } finally {
      setPayingMilestone(null);
    }
  };

  const handleMarkCompleted = async (milestoneId) => {
    try {
      const token = localStorage.getItem('token');
      await paymentService.markMilestoneCompleted(token, milestoneId);
      await fetchMilestones();
      if (onMilestoneUpdate) onMilestoneUpdate();
    } catch (err) {
      console.error('Error marking milestone completed:', err);
      setError('Failed to mark milestone as completed');
    }
  };

  const handleApproveMilestone = async (milestoneId) => {
    try {
      const token = localStorage.getItem('token');
      await paymentService.approveMilestone(token, milestoneId);
      await fetchMilestones();
      if (onMilestoneUpdate) onMilestoneUpdate();
    } catch (err) {
      console.error('Error approving milestone:', err);
      setError('Failed to approve milestone');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-gray-500" />;
      case 'paid':
        return <FaDollarSign className="text-blue-500" />;
      case 'held':
        return <FaShieldAlt className="text-yellow-500" />;
      case 'completed':
        return <FaHourglass className="text-orange-500" />;
      case 'approved':
        return <FaCheck className="text-green-500" />;
      case 'released':
        return <FaCheck className="text-green-600" />;
      default:
        return <FaTimesCircle className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: language === 'ar' ? 'في الانتظار' : 'Pending',
      paid: language === 'ar' ? 'مدفوع' : 'Paid',
      held: language === 'ar' ? 'محجوز (14 يوم)' : 'Held (14 days)',
      completed: language === 'ar' ? 'مكتمل - ينتظر الموافقة' : 'Completed - Awaiting Approval',
      approved: language === 'ar' ? 'تمت الموافقة' : 'Approved',
      released: language === 'ar' ? 'تم الإفراج' : 'Released'
    };
    return statusTexts[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'held':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'released':
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isClient = currentUser?.role === 'client';
  const isProfessional = ['contractor', 'specialist', 'crew'].includes(currentUser?.role);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'ar' ? 'معالم الدفع' : 'Payment Milestones'}
      </h3>
      
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <span className="text-sm font-bold text-blue-600">{index + 1}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {milestone.title || (language === 'ar' ? `معلم ${index + 1}` : `Milestone ${index + 1}`)}
                </h4>
                <p className="text-sm text-gray-600">{milestone.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatAmount(milestone.amount)}
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                {getStatusIcon(milestone.status)}
                <span className="ml-1">{getStatusText(milestone.status)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
            <div>
              <span className="font-medium">{language === 'ar' ? 'المبلغ الإجمالي:' : 'Gross Amount:'}</span>
              <span className="ml-2">{formatAmount(milestone.amount)}</span>
            </div>
            <div>
              <span className="font-medium">{language === 'ar' ? 'عمولة المنصة:' : 'Platform Fee:'}</span>
              <span className="ml-2">{formatAmount(milestone.platform_fee)}</span>
            </div>
            <div>
              <span className="font-medium">{language === 'ar' ? 'صافي المبلغ:' : 'Net Amount:'}</span>
              <span className="ml-2">{formatAmount(milestone.net_amount)}</span>
            </div>
            {milestone.hold_until && (
              <div>
                <span className="font-medium">{language === 'ar' ? 'انتهاء الحجز:' : 'Hold Until:'}</span>
                <span className="ml-2">
                  {new Date(milestone.hold_until).toLocaleDateString(
                    language === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {/* Client Actions */}
            {isClient && milestone.status === 'pending' && (
              <button
                onClick={() => handlePayMilestone(milestone.id)}
                disabled={payingMilestone === milestone.id}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {payingMilestone === milestone.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaDollarSign className="mr-2" />
                )}
                {language === 'ar' ? 'ادفع الآن' : 'Pay Now'}
              </button>
            )}

            {isClient && milestone.status === 'completed' && (
              <button
                onClick={() => handleApproveMilestone(milestone.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <FaCheck className="mr-2" />
                {language === 'ar' ? 'وافق على العمل' : 'Approve Work'}
              </button>
            )}

            {/* Professional Actions */}
            {isProfessional && milestone.status === 'held' && (
              <button
                onClick={() => handleMarkCompleted(milestone.id)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
              >
                <FaCheck className="mr-2" />
                {language === 'ar' ? 'تحديد كمكتمل' : 'Mark Completed'}
              </button>
            )}
          </div>

          {/* Hold Notice */}
          {milestone.status === 'held' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <FaShieldAlt className="text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  {language === 'ar' 
                    ? 'الأموال محجوزة لمدة 14 يوماً لحماية الطرفين. سيتم الإفراج عنها تلقائياً إذا لم يتم الاعتراض.'
                    : 'Funds are held for 14 days to protect both parties. They will be released automatically if no disputes are raised.'
                  }
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {milestones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaExclamationTriangle className="mx-auto mb-2 text-2xl" />
          <p>{language === 'ar' ? 'لا توجد معالم دفع بعد' : 'No payment milestones yet'}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMilestones; 