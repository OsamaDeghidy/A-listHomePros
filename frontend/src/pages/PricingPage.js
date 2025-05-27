import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaRegQuestionCircle } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { useLanguage } from '../hooks/useLanguage';

const PricingPage = () => {
  const { getCurrentLanguage } = useLanguage();
  const { code: language } = getCurrentLanguage();
  const isArabic = language === 'ar';
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' أو 'annually'
  
  // تجهيز الترجمات
  const translations = {
    title: isArabic ? 'باقات الأسعار' : 'Pricing Plans',
    subtitle: isArabic 
      ? 'اختر الخطة المناسبة لاحتياجاتك' 
      : 'Choose the plan that fits your needs',
    description: isArabic 
      ? 'نقدم مجموعة متنوعة من الباقات المصممة لتناسب المحترفين وأصحاب المنازل على حد سواء. استمتع بخصم 20% عند الاشتراك السنوي.'
      : 'We offer a variety of plans designed to suit both professionals and homeowners. Enjoy a 20% discount with annual billing.',
    compare: isArabic ? 'قارن الخطط' : 'Compare Plans',
    monthly: isArabic ? 'شهري' : 'Monthly',
    annually: isArabic ? 'سنوي' : 'Annually',
    saveText: isArabic ? 'وفر 20%' : 'Save 20%',
    getStarted: isArabic ? 'ابدأ الآن' : 'Get Started',
    currentPlan: isArabic ? 'الخطة الحالية' : 'Current Plan',
    month: isArabic ? '/شهر' : '/month',
    year: isArabic ? '/سنة' : '/year',
    faq: {
      title: isArabic ? 'الأسئلة المتكررة عن التسعير' : 'Pricing FAQs',
      questions: [
        {
          question: isArabic ? 'هل يمكنني تغيير خطتي في أي وقت؟' : 'Can I change my plan at any time?',
          answer: isArabic 
            ? 'نعم، يمكنك الترقية أو التخفيض أو إلغاء خطتك في أي وقت. ستتم محاسبة التغييرات على أساس تناسبي للوقت المتبقي من فترة الفوترة الحالية.'
            : 'Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes will be prorated for the remainder of your current billing period.'
        },
        {
          question: isArabic ? 'ما الذي يحدث عند انتهاء فترة التجربة المجانية؟' : 'What happens when my free trial ends?',
          answer: isArabic 
            ? 'عند انتهاء فترة التجربة المجانية، سيتم ترقية حسابك تلقائيًا إلى الخطة التي اخترتها. يمكنك إلغاء الاشتراك في أي وقت قبل انتهاء فترة التجربة لتجنب الرسوم.'
            : 'When your free trial ends, your account will automatically upgrade to the plan you selected. You can cancel anytime before the trial ends to avoid charges.'
        },
        {
          question: isArabic ? 'هل هناك عقود طويلة الأجل؟' : 'Are there any long-term contracts?',
          answer: isArabic 
            ? 'لا، نحن لا نفرض عقودًا طويلة الأجل. جميع خططنا تعمل على أساس الاشتراك الشهري أو السنوي، ويمكنك الإلغاء في أي وقت.'
            : 'No, we don\'t impose long-term contracts. All our plans work on a monthly or annual subscription basis, and you can cancel anytime.'
        },
        {
          question: isArabic ? 'هل يمكنني الحصول على استرداد إذا قمت بالإلغاء؟' : 'Can I get a refund if I cancel?',
          answer: isArabic 
            ? 'نقدم استردادًا كاملًا إذا قمت بالإلغاء في غضون 14 يومًا من بدء اشتراكك. بعد هذه الفترة، لا نقدم استردادًا للمدفوعات السابقة، ولكن يمكنك الاستمرار في استخدام الخدمة حتى نهاية فترة الفوترة الحالية.'
            : 'We offer a full refund if you cancel within 14 days of starting your subscription. After this period, we don\'t provide refunds for previous payments, but you can continue using the service until the end of your current billing period.'
        }
      ]
    }
  };
  
  // تفاصيل خطط التسعير
  const plans = [
    {
      id: 'free',
      name: isArabic ? 'الأساسية' : 'Basic',
      description: isArabic ? 'للأفراد وأصحاب المنازل' : 'For individuals and homeowners',
      price: {
        monthly: 0,
        annually: 0
      },
      features: [
        { text: isArabic ? 'عمليات بحث غير محدودة' : 'Unlimited searches', included: true },
        { text: isArabic ? 'عرض تقييمات المحترفين' : 'View pro ratings', included: true },
        { text: isArabic ? 'حفظ المحترفين المفضلين (حتى 5)' : 'Save favorite pros (up to 5)', included: true },
        { text: isArabic ? 'دعم عبر البريد الإلكتروني' : 'Email support', included: true },
        { text: isArabic ? 'حجوزات الخدمة الأساسية' : 'Basic service bookings', included: true },
        { text: isArabic ? 'الحساب المميز للعملاء' : 'Premium client profile', included: false },
        { text: isArabic ? 'تنبيهات متقدمة للعروض' : 'Advanced deal alerts', included: false },
        { text: isArabic ? 'دعم مخصص' : 'Dedicated support', included: false }
      ],
      cta: isArabic ? 'البدء مجاناً' : 'Start Free',
      popular: false
    },
    {
      id: 'premium',
      name: isArabic ? 'بريميوم' : 'Premium',
      description: isArabic ? 'للعملاء المنتظمين' : 'For regular customers',
      price: {
        monthly: 9.99,
        annually: 95.88 // $7.99 * 12 = $95.88 (20% off)
      },
      features: [
        { text: isArabic ? 'كل مميزات الخطة الأساسية' : 'All Basic features', included: true },
        { text: isArabic ? 'حفظ المحترفين المفضلين (غير محدود)' : 'Save unlimited favorite pros', included: true },
        { text: isArabic ? 'تنبيهات متقدمة للعروض' : 'Advanced deal alerts', included: true },
        { text: isArabic ? 'أولوية حجز المواعيد' : 'Priority appointment booking', included: true },
        { text: isArabic ? 'حساب عميل مميز' : 'Premium client profile', included: true },
        { text: isArabic ? 'دعم مخصص' : 'Dedicated support', included: true },
        { text: isArabic ? 'مكافآت على الولاء' : 'Loyalty rewards', included: true },
        { text: isArabic ? 'ميزات خاصة للعملاء المميزين' : 'Exclusive member perks', included: false }
      ],
      cta: isArabic ? 'ابدأ التجربة المجانية' : 'Start Free Trial',
      popular: true,
      trial: isArabic ? 'تجربة مجانية لمدة 7 أيام' : '7-day free trial'
    },
    {
      id: 'pro',
      name: isArabic ? 'للمحترفين' : 'For Professionals',
      description: isArabic ? 'لمزودي الخدمات المنزلية' : 'For home service providers',
      price: {
        monthly: 29.99,
        annually: 287.88 // $23.99 * 12 = $287.88 (20% off)
      },
      features: [
        { text: isArabic ? 'ملف تعريفي احترافي مميز' : 'Featured professional profile', included: true },
        { text: isArabic ? 'ظهور مميز في نتائج البحث' : 'Featured in search results', included: true },
        { text: isArabic ? 'طلبات العملاء غير المحدودة' : 'Unlimited client requests', included: true },
        { text: isArabic ? 'أدوات جدولة متقدمة' : 'Advanced scheduling tools', included: true },
        { text: isArabic ? 'تنبيهات فورية للطلبات الجديدة' : 'Instant new request alerts', included: true },
        { text: isArabic ? 'دعم مخصص على مدار الساعة' : '24/7 dedicated support', included: true },
        { text: isArabic ? 'تقارير وتحليلات متقدمة' : 'Advanced reporting & analytics', included: true },
        { text: isArabic ? 'أدوات تسويق متخصصة' : 'Specialized marketing tools', included: true }
      ],
      cta: isArabic ? 'ابدأ كمحترف' : 'Start as Pro',
      popular: false,
      trial: isArabic ? 'تجربة مجانية لمدة 14 يوم' : '14-day free trial'
    }
  ];
  
  // تنسيق عرض السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price % 1 === 0 ? 0 : 2
    }).format(price);
  };
  
  // حساب السعر الشهري عند اختيار الدفع السنوي
  const getMonthlyPriceFromAnnual = (annualPrice) => {
    if (annualPrice === 0) return 0;
    return annualPrice / 12;
  };

  return (
    <>
      <Helmet>
        <title>{translations.title} | A-List Home Pros</title>
        <meta name="description" content={translations.description} />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* الترويسة */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
              {translations.title}
            </h1>
            <p className="mt-5 text-xl text-gray-500 dark:text-gray-300">
              {translations.description}
            </p>
            
            {/* تبديل دورة الفوترة */}
            <div className="mt-8 flex justify-center">
              <div className="relative bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm inline-flex">
                <button
                  type="button"
                  className={`${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-300'
                  } relative py-2 px-6 sm:px-8 border-transparent rounded-md text-sm font-medium focus:outline-none transition-colors`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  {translations.monthly}
                </button>
                <button
                  type="button"
                  className={`${
                    billingCycle === 'annually'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-300'
                  } relative py-2 px-6 sm:px-8 border-transparent rounded-md text-sm font-medium focus:outline-none transition-colors`}
                  onClick={() => setBillingCycle('annually')}
                >
                  {translations.annually}
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {translations.saveText}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* خطط التسعير */}
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:gap-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 border rounded-2xl shadow-lg overflow-hidden ${
                  plan.popular ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-600 dark:ring-blue-500 transform lg:scale-110' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 h-2 bg-blue-600"></div>
                )}
                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {plan.description}
                  </p>
                  <p className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {formatPrice(billingCycle === 'monthly' ? plan.price.monthly : getMonthlyPriceFromAnnual(plan.price.annually))}
                    </span>
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                      {translations.month}
                    </span>
                  </p>
                  {billingCycle === 'annually' && plan.price.annually > 0 && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {isArabic ? `تدفع ${formatPrice(plan.price.annually)} سنويًا` : `Billed as ${formatPrice(plan.price.annually)} annually`}
                    </p>
                  )}
                  
                  {plan.trial && (
                    <p className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {plan.trial}
                    </p>
                  )}
                  
                  <div className="mt-8">
                    <Link
                      to={plan.id === 'pro' ? '/pro-onboarding' : '/register'}
                      className={`block w-full text-center px-6 py-3 border border-transparent rounded-md shadow text-base font-medium ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          : 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
                
                <div className="pt-6 pb-8 px-8 bg-gray-50 dark:bg-gray-900">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    {isArabic ? 'ما تحصل عليه:' : 'What\'s included:'}
                  </h4>
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <div className="flex-shrink-0">
                            <FaCheck className="h-5 w-5 text-green-500" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0">
                            <FaTimes className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                          </div>
                        )}
                        <p className={`${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'} ms-3 text-sm`}>
                          {feature.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          {/* الأسئلة المتكررة */}
          <div className="max-w-3xl mx-auto mt-24">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
              {translations.faq.title}
            </h2>
            
            <div className="space-y-8">
              {translations.faq.questions.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-start">
                    <FaRegQuestionCircle className="h-5 w-5 text-blue-500 mt-1 mr-2 rtl:ml-2 rtl:mr-0" />
                    <span>{item.question}</span>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 ml-7 rtl:mr-7 rtl:ml-0">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Call to Action */}
            <div className="mt-16 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'جاهز للبدء مع A-List Home Pros؟' : 'Ready to get started with A-List Home Pros?'}
              </h3>
              <Link
                to="/register"
                className="inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isArabic ? 'التسجيل مجاناً' : 'Sign up for free'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPage; 