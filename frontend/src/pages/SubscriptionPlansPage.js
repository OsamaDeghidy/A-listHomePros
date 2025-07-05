import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  FaCheck, 
  FaCrown, 
  FaTools, 
  FaHardHat, 
  FaClipboardList,
  FaSpinner,
  FaExclamationTriangle,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import subscriptionService from '../services/subscriptionService';

const SubscriptionPlansPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const plansResponse = await subscriptionService.getPlans();
      setPlans(plansResponse.data.results || plansResponse.data || []);

      if (isAuthenticated) {
        try {
          const subscriptionResponse = await subscriptionService.getCurrentSubscription();
          setCurrentSubscription(subscriptionResponse.data);
        } catch (err) {
          console.log('No current subscription found');
        }
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(isArabic ? 'خطأ في تحميل خطط الاشتراكات' : 'Error loading subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/subscription-plans');
      return;
    }

    if (processingPlan) return;
    setProcessingPlan(plan.id);

    try {
      const successUrl = `${window.location.origin}/subscription-success`;
      const cancelUrl = `${window.location.origin}/subscription-plans`;

      const response = await subscriptionService.createCheckoutSession(
        plan.id,
        successUrl,
        cancelUrl
      );

      window.location.href = response.data.checkout_url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      alert(isArabic ? 'خطأ في إنشاء جلسة الدفع' : 'Error creating checkout session');
      setProcessingPlan(null);
    }
  };

  const getPlanIcon = (planType) => {
    const icons = {
      'home_pro': FaTools,
      'crew': FaHardHat,
      'specialist': FaClipboardList
    };
    return icons[planType] || FaTools;
  };

  const getPlanColors = (planType, tier) => {
    const colors = {
      home_pro: {
        basic: 'from-blue-500 to-blue-600',
        premium: 'from-purple-500 to-purple-600'
      },
      crew: {
        basic: 'from-green-500 to-green-600', 
        premium: 'from-emerald-500 to-emerald-600'
      },
      specialist: {
        basic: 'from-orange-500 to-orange-600'
      }
    };
    return colors[planType]?.[tier] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">
            {isArabic ? 'جاري تحميل خطط الاشتراكات...' : 'Loading subscription plans...'}
          </p>
        </div>
      </div>
    );
  }

  // Mock plans for display until backend is ready
  const mockPlans = [
    {
      id: 1,
      name: isArabic ? 'خطة المحترف' : 'Home Pro Plan',
      plan_type: 'home_pro',
      tier: 'basic',
      price: 149.99,
      features: [
        isArabic ? 'وصول غير محدود لطلبات المشاريع' : 'Unlimited access to project leads',
        isArabic ? 'توظيف وإدارة الفرق' : 'Hire and manage crews',
        isArabic ? 'تقييم ومراجعة العملاء' : 'Rate and review clients',
        isArabic ? 'خيارات تمويل الأعمال' : 'Business funding options',
        isArabic ? 'دعم الموقع والتسويق' : 'Website & marketing support',
        isArabic ? 'مزايدة المشاريع المضمونة' : 'Escrow-backed project bidding'
      ]
    },
    {
      id: 2,
      name: isArabic ? 'خطة المحترف بريميوم' : 'Home Pro Premium',
      plan_type: 'home_pro',
      tier: 'premium',
      price: 275.00,
      features: [
        isArabic ? 'جميع مميزات الخطة الأساسية' : 'All Basic Plan features',
        isArabic ? 'عملاء حصريين' : 'Exclusive Leads',
        isArabic ? 'تحليلات متقدمة' : 'Premium Analytics',
        isArabic ? 'دعم أولوية' : 'Priority Support'
      ]
    },
    {
      id: 3,
      name: isArabic ? 'خطة عضو الفريق' : 'Crew Member Plan',
      plan_type: 'crew',
      tier: 'basic',
      price: 89.99,
      features: [
        isArabic ? 'الوصول لجميع الوظائف المحلية' : 'Access to all local jobs',
        isArabic ? 'مرئي لجميع المحترفين' : 'Visible to all Pros and Specialists',
        isArabic ? 'طلبات توظيف عند الطلب' : 'On-demand hire requests',
        isArabic ? 'أدوات التدريب والتطوير' : 'Training tools & project feedback',
        isArabic ? 'إضافة المحفظة' : 'Add your portfolio'
      ]
    },
    {
      id: 4,
      name: isArabic ? 'خطة المتخصص' : 'Specialist Plan',
      plan_type: 'specialist',
      tier: 'basic',
      price: 59.99,
      features: [
        isArabic ? 'إدارة الوظائف من البداية للنهاية' : 'Manage jobs from start to finish',
        isArabic ? 'الوصول للمحترفين والفرق والعملاء' : 'Access to Home Pros, Crew & Clients',
        isArabic ? 'رفع تقارير التقدم' : 'Upload walkthroughs, progress reports',
        isArabic ? 'تنظيم وتعيين الوظائف' : 'Organize and assign jobs',
        isArabic ? 'عرض نشاط المزايدة' : 'View bidding activity'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'خطط الاشتراكات | A-List Home Pros' : 'Subscription Plans | A-List Home Pros'}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-4"
            >
              {isArabic ? 'اختر خطة A-List الخاصة بك' : 'Choose Your A-List Plan'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl opacity-90 mb-8"
            >
              {isArabic ? 'احصل على وظيفة. احصل على أجر. احصل على حماية.' : 'Get Hired. Get Paid. Get Protected.'}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg opacity-80"
            >
              {isArabic ? 'خطط شهرية بسيطة. بدون رسوم لكل عميل محتمل. النتائج فقط.' : 'Simple monthly plans. No per-lead charges. Just results.'}
            </motion.p>
          </div>
        </div>

        {/* Plans */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {mockPlans.map((plan, index) => {
              const IconComponent = getPlanIcon(plan.plan_type);
              const isProcessing = processingPlan === plan.id;
              const gradientColors = getPlanColors(plan.plan_type, plan.tier);
              const isRecommended = index === 0; // Make first plan recommended

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                    isRecommended ? 'border-yellow-400 scale-105' : 'border-gray-200'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <FaStar className="h-3 w-3 mr-1" />
                        {isArabic ? 'مُوصى به' : 'Recommended'}
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${gradientColors} flex items-center justify-center`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      {plan.tier === 'premium' && (
                        <div className="flex items-center justify-center mb-2">
                          <FaCrown className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-yellow-600 font-medium text-sm">
                            {isArabic ? 'بريميوم' : 'Premium'}
                          </span>
                        </div>
                      )}
                      <div className="text-4xl font-bold text-gray-900">
                        ${plan.price}
                        <span className="text-lg font-normal text-gray-600">/{isArabic ? 'شهر' : 'month'}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <FaCheck className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isProcessing}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                        isProcessing
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : plan.tier === 'premium'
                          ? `bg-gradient-to-r ${gradientColors} text-white hover:shadow-lg transform hover:scale-105`
                          : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                          {isArabic ? 'جاري المعالجة...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          {isArabic ? 'اختر الخطة' : 'Select Plan'}
                          <FaArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isArabic ? 'وظيفة واحدة تدفع مقابل خطتك' : 'One job pays for your plan'}
            </h3>
            <p className="text-gray-600 mb-8">
              {isArabic ? 'اختر مستوى A-List الخاص بك وابدأ في الفوز بالعمل اليوم' : 'Choose your A-List tier and start winning work today'}
            </p>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {isArabic ? 'سجل الآن' : 'Sign Up Now'}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPlansPage; 