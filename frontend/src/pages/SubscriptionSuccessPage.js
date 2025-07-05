import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import subscriptionService from '../services/subscriptionService';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current subscription after successful payment
    const fetchSubscription = async () => {
      try {
        const response = await subscriptionService.getCurrentSubscription();
        setSubscription(response.data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to allow Stripe webhook to process
    setTimeout(fetchSubscription, 2000);
  }, []);

  const handleContinue = () => {
    // Redirect based on user role
    if (currentUser?.role === 'alistpro') {
      navigate('/dashboard');
    } else if (currentUser?.role === 'crew') {
      navigate('/crew-dashboard');
    } else if (currentUser?.role === 'specialist') {
      navigate('/specialist-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {loading ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isArabic ? 'جاري معالجة اشتراكك...' : 'Processing your subscription...'}
              </h2>
              <p className="text-gray-600">
                {isArabic ? 'يرجى الانتظار بينما نقوم بتفعيل حسابك' : 'Please wait while we activate your account'}
              </p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              >
                <FaCheck className="h-8 w-8 text-green-600" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-900 mb-4"
              >
                {isArabic ? 'تم تفعيل اشتراكك بنجاح!' : 'Subscription Activated Successfully!'}
              </motion.h2>

              {subscription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gray-50 rounded-lg p-4 mb-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {subscription.plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    ${subscription.plan.price}/{isArabic ? 'شهر' : 'month'}
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    {isArabic ? 'نشط حتى' : 'Active until'}: {' '}
                    {new Date(subscription.current_period_end).toLocaleDateString(
                      isArabic ? 'ar-SA' : 'en-US'
                    )}
                  </p>
                </motion.div>
              )}

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-gray-600 mb-8"
              >
                {isArabic 
                  ? 'مرحباً بك في A-List Home Pros! يمكنك الآن الوصول لجميع مميزات خطتك.'
                  : 'Welcome to A-List Home Pros! You now have access to all your plan features.'
                }
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isArabic ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-gray-500 text-sm mt-4"
              >
                {isArabic 
                  ? 'ستصلك فاتورة التأكيد على بريدك الإلكتروني'
                  : 'A confirmation receipt has been sent to your email'
                }
              </motion.p>
            </>
          )}
        </motion.div>

        {/* Additional Info */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-8 text-center"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isArabic ? 'ماذا الآن؟' : 'What\'s Next?'}
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>
                {isArabic 
                  ? '• ابدأ في استكشاف المشاريع المتاحة'
                  : '• Start exploring available projects'
                }
              </p>
              <p>
                {isArabic 
                  ? '• أكمل ملفك الشخصي لزيادة فرصك'
                  : '• Complete your profile to boost your chances'
                }
              </p>
              <p>
                {isArabic 
                  ? '• تواصل مع العملاء وابدأ العمل'
                  : '• Connect with clients and start working'
                }
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage; 