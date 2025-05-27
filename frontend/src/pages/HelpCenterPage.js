import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaSearch, FaQuestionCircle, FaPhone, FaEnvelope, FaFileAlt, FaVideo, FaBook, FaHeadset, FaTools, FaLightbulb, FaUserCog, FaCreditCard } from 'react-icons/fa';

const HelpCenterPage = () => {
  // Help categories
  const helpCategories = [
    {
      id: 'general',
      title: 'معلومات عامة',
      icon: <FaQuestionCircle className="text-3xl text-blue-600 mb-4" />,
      description: 'المعلومات الأساسية عن المنصة وكيفية استخدامها',
      links: [
        { title: 'نبذة عن A-List Home Pros', url: '/about' },
        { title: 'كيفية عمل المنصة', url: '/faq#how-it-works' },
        { title: 'سياسة الخصوصية', url: '/privacy' },
        { title: 'الشروط والأحكام', url: '/terms' }
      ]
    },
    {
      id: 'booking',
      title: 'الحجز والمواعيد',
      icon: <FaCalendar className="text-3xl text-blue-600 mb-4" />,
      description: 'كل ما يتعلق بحجز الخدمات وإدارة المواعيد',
      links: [
        { title: 'كيفية حجز خدمة', url: '/faq#booking' },
        { title: 'إلغاء أو تعديل موعد', url: '/faq#cancel-booking' },
        { title: 'متابعة حالة الحجز', url: '/faq#booking-status' },
        { title: 'الحجوزات المتكررة', url: '/faq#recurring-bookings' }
      ]
    },
    {
      id: 'payments',
      title: 'المدفوعات والفواتير',
      icon: <FaCreditCard className="text-3xl text-blue-600 mb-4" />,
      description: 'معلومات عن طرق الدفع والفواتير والاستردادات',
      links: [
        { title: 'طرق الدفع المقبولة', url: '/faq#payment-methods' },
        { title: 'طلب استرداد', url: '/faq#refunds' },
        { title: 'تحميل الفواتير', url: '/dashboard/payments' },
        { title: 'سياسة الإلغاء والاسترداد', url: '/faq#cancellation-policy' }
      ]
    },
    {
      id: 'account',
      title: 'إدارة الحساب',
      icon: <FaUserCog className="text-3xl text-blue-600 mb-4" />,
      description: 'إدارة معلومات حسابك وإعداداته',
      links: [
        { title: 'تعديل الملف الشخصي', url: '/dashboard/profile' },
        { title: 'تغيير كلمة المرور', url: '/dashboard/security' },
        { title: 'إدارة العناوين المحفوظة', url: '/dashboard/addresses' },
        { title: 'إعدادات الإشعارات', url: '/dashboard/notifications' }
      ]
    },
    {
      id: 'professionals',
      title: 'المهنيين والخدمات',
      icon: <FaTools className="text-3xl text-blue-600 mb-4" />,
      description: 'معلومات عن المهنيين والخدمات المقدمة',
      links: [
        { title: 'التسجيل كمهني', url: '/pro-signup' },
        { title: 'اختيار المهني المناسب', url: '/faq#choosing-pro' },
        { title: 'تقييم الخدمة', url: '/faq#rating-service' },
        { title: 'أنواع الخدمات المتاحة', url: '/services' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'حل المشكلات',
      icon: <FaLightbulb className="text-3xl text-blue-600 mb-4" />,
      description: 'مساعدة في حل المشكلات الشائعة',
      links: [
        { title: 'مشاكل التسجيل وتسجيل الدخول', url: '/faq#login-issues' },
        { title: 'مشاكل في عملية الدفع', url: '/faq#payment-issues' },
        { title: 'مشاكل في التطبيق أو الموقع', url: '/faq#app-issues' },
        { title: 'الإبلاغ عن مشكلة', url: '/contact' }
      ]
    }
  ];

  // Resources
  const resources = [
    {
      id: 'faq',
      title: 'الأسئلة الشائعة',
      icon: <FaQuestionCircle className="h-6 w-6 text-blue-600" />,
      description: 'الإجابات على الأسئلة الأكثر شيوعًا',
      url: '/faq'
    },
    {
      id: 'guides',
      title: 'أدلة الاستخدام',
      icon: <FaBook className="h-6 w-6 text-blue-600" />,
      description: 'أدلة توضيحية حول استخدام المنصة',
      url: '/guides'
    },
    {
      id: 'videos',
      title: 'فيديوهات تعليمية',
      icon: <FaVideo className="h-6 w-6 text-blue-600" />,
      description: 'فيديوهات توضح كيفية استخدام خدماتنا',
      url: '/video-tutorials'
    },
    {
      id: 'contact',
      title: 'تواصل معنا',
      icon: <FaHeadset className="h-6 w-6 text-blue-600" />,
      description: 'احصل على مساعدة مخصصة من فريق الدعم',
      url: '/contact'
    }
  ];

  return (
    <>
      <Helmet>
        <title>مركز المساعدة | A-List Home Pros</title>
        <meta name="description" content="الحصول على المساعدة والدعم لاستخدام منصة A-List Home Pros، استكشاف الأخطاء وإصلاحها، والعثور على إجابات لأسئلتك." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">كيف يمكننا مساعدتك؟</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            ابحث عن إجابات للأسئلة الشائعة أو تصفح مواردنا للحصول على المساعدة
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                className="w-full py-4 px-5 pr-12 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
                placeholder="ابحث في مركز المساعدة..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <FaSearch className="text-gray-400 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">استكشف موضوعات المساعدة</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map(category => (
              <div key={category.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="text-center">
                  {category.icon}
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-600 mb-6">{category.description}</p>
                </div>
                <ul className="space-y-2">
                  {category.links.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.url} 
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        <span className="mr-2">•</span>
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">موارد مفيدة</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map(resource => (
              <Link 
                key={resource.id} 
                to={resource.url}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors p-6 flex flex-col items-center text-center"
              >
                <div className="mb-4">
                  {resource.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm">{resource.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">لم تجد ما تبحث عنه؟</h2>
            <p className="text-center text-gray-600 mb-10">
              فريق دعم العملاء لدينا متاح للإجابة على جميع أسئلتك ومساعدتك في حل أي مشكلة قد تواجهها.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FaPhone className="mx-auto text-blue-600 text-2xl mb-4" />
                <h3 className="text-lg font-medium mb-2">اتصل بنا</h3>
                <p className="text-gray-600 mb-3">متاح من 9 صباحًا - 8 مساءً</p>
                <p className="text-blue-600 font-medium">19123</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FaEnvelope className="mx-auto text-blue-600 text-2xl mb-4" />
                <h3 className="text-lg font-medium mb-2">البريد الإلكتروني</h3>
                <p className="text-gray-600 mb-3">نرد خلال 24 ساعة</p>
                <a href="mailto:support@alisthomepros.com" className="text-blue-600 font-medium">
                  support@alisthomepros.com
                </a>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FaFileAlt className="mx-auto text-blue-600 text-2xl mb-4" />
                <h3 className="text-lg font-medium mb-2">نموذج الاتصال</h3>
                <p className="text-gray-600 mb-3">أرسل استفسارك عبر النموذج</p>
                <Link to="/contact" className="text-blue-600 font-medium">
                  انتقل إلى نموذج الاتصال
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// Define FaCalendar component since it's not imported
const FaCalendar = (props) => {
  return (
    <svg 
      stroke="currentColor" 
      fill="currentColor" 
      strokeWidth="0" 
      viewBox="0 0 448 512" 
      height="1em" 
      width="1em" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm436-44v-36c0-26.5-21.5-48-48-48h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v36c0 6.6 5.4 12 12 12h424c6.6 0 12-5.4 12-12z"></path>
    </svg>
  );
};

export default HelpCenterPage; 