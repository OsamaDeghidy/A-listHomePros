import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  // FAQ Categories
  const categories = [
    { id: 'general', name: 'عام' },
    { id: 'account', name: 'الحساب والتسجيل' },
    { id: 'booking', name: 'الحجز' },
    { id: 'payment', name: 'المدفوعات' },
    { id: 'professionals', name: 'المهنيين' },
    { id: 'services', name: 'الخدمات' },
  ];

  // FAQ Items
  const faqItems = {
    general: [
      {
        id: 'g1',
        question: 'ما هي منصة A-List Home Pros؟',
        answer: 'منصة A-List Home Pros هي منصة رقمية تربط بين أصحاب المنازل ومقدمي الخدمات المنزلية المحترفين. نحن نوفر طريقة سهلة للعثور على مهنيين موثوقين وحجز خدماتهم ومتابعة المواعيد، مما يجعل صيانة المنزل وتحسينه أكثر سهولة.'
      },
      {
        id: 'g2',
        question: 'كيف تضمن A-List Home Pros جودة المهنيين؟',
        answer: 'نحن نأخذ الجودة على محمل الجد. يخضع جميع المهنيين لفحص الخلفية والتحقق من الهوية. نراجع أيضًا مؤهلاتهم وخبراتهم. بالإضافة إلى ذلك، لدينا نظام تقييم يساعد العملاء على اختيار أفضل المحترفين بناءً على أداءهم السابق.'
      },
      {
        id: 'g3',
        question: 'في أي مناطق تتوفر خدمات A-List Home Pros؟',
        answer: 'حاليًا، نقدم خدماتنا في القاهرة والإسكندرية والجيزة ومدن أخرى كبرى في مصر. نحن نعمل على التوسع لتغطية المزيد من المناطق. يمكنك التحقق من توفر الخدمة في منطقتك عن طريق إدخال موقعك في صفحة البحث.'
      },
      {
        id: 'g4',
        question: 'كيف يمكنني الاتصال بدعم العملاء؟',
        answer: 'يمكنك الاتصال بفريق دعم العملاء لدينا عن طريق البريد الإلكتروني على support@alisthomepros.com، أو الاتصال بنا على 19123، أو استخدام نموذج الاتصال في صفحة "تواصل معنا". نحن متاحون من السبت إلى الخميس من 9 صباحًا حتى 8 مساءً.'
      }
    ],
    account: [
      {
        id: 'a1',
        question: 'كيف يمكنني إنشاء حساب؟',
        answer: 'يمكنك إنشاء حساب بالنقر على "تسجيل" في الزاوية العلوية اليمنى من الموقع. املأ النموذج بالمعلومات المطلوبة، بما في ذلك اسمك وعنوان بريدك الإلكتروني ورقم هاتفك وكلمة المرور. بعد التسجيل، ستتلقى رسالة تأكيد على بريدك الإلكتروني لتنشيط حسابك.'
      },
      {
        id: 'a2',
        question: 'هل يمكنني تغيير معلومات حسابي؟',
        answer: 'نعم، يمكنك تحديث معلومات حسابك في أي وقت. ببساطة قم بتسجيل الدخول، انتقل إلى "الملف الشخصي" من لوحة القيادة، وانقر على "تعديل الملف الشخصي". يمكنك تغيير اسمك ورقم هاتفك وعنوانك وتفضيلات الإشعارات. لتغيير بريدك الإلكتروني، قد تحتاج إلى التحقق من البريد الإلكتروني الجديد.'
      },
      {
        id: 'a3',
        question: 'نسيت كلمة المرور الخاصة بي. كيف يمكنني إعادة تعيينها؟',
        answer: 'إذا نسيت كلمة المرور الخاصة بك، انقر على "تسجيل الدخول" ثم اختر "نسيت كلمة المرور؟". أدخل عنوان بريدك الإلكتروني المرتبط بحسابك، وسنرسل لك رابطًا لإعادة تعيين كلمة المرور. انقر على الرابط واتبع التعليمات لإنشاء كلمة مرور جديدة.'
      },
      {
        id: 'a4',
        question: 'كيف يمكنني حذف حسابي؟',
        answer: 'لحذف حسابك، يرجى الاتصال بدعم العملاء لدينا. لأسباب أمنية، لا يمكننا حذف الحسابات تلقائيًا. سيتحقق أحد ممثلي الدعم من هويتك ويساعدك في عملية الحذف. يرجى ملاحظة أنه بمجرد حذف حسابك، لا يمكن استعادته وسيتم حذف جميع بياناتك وسجلك.'
      }
    ],
    booking: [
      {
        id: 'b1',
        question: 'كيف يمكنني حجز خدمة؟',
        answer: 'لحجز خدمة، ابحث عن المهني المناسب باستخدام خيارات البحث والتصفية. بمجرد العثور على المهني المناسب، انقر على "حجز الآن" على ملفه الشخصي. حدد الخدمة والتاريخ والوقت المفضل، وأدخل عنوانك وتفاصيل الاتصال، ثم قم بتأكيد الحجز. يمكنك متابعة حالة الحجز من لوحة القيادة الخاصة بك.'
      },
      {
        id: 'b2',
        question: 'هل يمكنني إلغاء موعدي أو إعادة جدولته؟',
        answer: 'نعم، يمكنك إلغاء موعدك أو إعادة جدولته من لوحة القيادة الخاصة بك. انتقل إلى "المواعيد" وابحث عن الموعد الذي ترغب في تغييره. يمكنك إلغاء الموعد مجانًا قبل 24 ساعة على الأقل من الوقت المحدد. بالنسبة للإلغاءات التي تتم بعد ذلك، قد يتم تطبيق رسوم إلغاء، اعتمادًا على سياسة المهني.'
      },
      {
        id: 'b3',
        question: 'ماذا يحدث بعد تأكيد حجزي؟',
        answer: 'بعد تأكيد حجزك، سيتلقى المهني إشعارًا وسيؤكد توفره. ستتلقى تأكيدًا نهائيًا عبر البريد الإلكتروني والرسائل القصيرة مع تفاصيل الموعد. في يوم الموعد، سيتصل بك المهني قبل الوصول. بعد اكتمال الخدمة، يمكنك تقديم تقييم والتعليق على تجربتك.'
      },
      {
        id: 'b4',
        question: 'هل هناك رسوم إلغاء؟',
        answer: 'قد تنطبق رسوم الإلغاء إذا قمت بإلغاء الموعد بعد أقل من 24 ساعة من الوقت المقرر. تختلف رسوم الإلغاء حسب المهني ونوع الخدمة، وعادة ما تكون حوالي 20٪ من إجمالي سعر الخدمة. يتم إعفاء رسوم الإلغاء في حالات معينة، مثل المرض (مع تقديم شهادة طبية) أو الظروف القاهرة.'
      },
      {
        id: 'b5',
        question: 'هل يمكنني حجز خدمات منتظمة؟',
        answer: 'نعم، نقدم خيارات للحجوزات المتكررة للخدمات مثل التنظيف المنزلي أو صيانة المناظر الطبيعية. عند الحجز، اختر "حجز متكرر" وحدد التكرار المفضل (أسبوعيًا، كل أسبوعين، شهريًا). يمكنك تعديل الجدول الزمني المتكرر أو إلغاؤه في أي وقت من لوحة القيادة الخاصة بك.'
      }
    ],
    payment: [
      {
        id: 'p1',
        question: 'ما هي طرق الدفع المقبولة؟',
        answer: 'نقبل بطاقات الائتمان والخصم الرئيسية، بما في ذلك Visa وMasterCard. يمكنك أيضًا الدفع باستخدام محافظ إلكترونية مثل Fawry أو البطاقات المدفوعة مسبقًا. بالنسبة لبعض الخدمات، قد يكون الدفع النقدي عند التسليم متاحًا أيضًا، ولكن يجب تحديد هذا الخيار مسبقًا أثناء الحجز.'
      },
      {
        id: 'p2',
        question: 'متى يتم خصم المدفوعات؟',
        answer: 'تختلف سياسة الدفع حسب نوع الخدمة. بالنسبة لمعظم الخدمات، نخصم مبلغًا مقدمًا (عادةً 20٪) لتأمين الحجز، ويتم دفع الرصيد المتبقي عند إكمال الخدمة. بالنسبة للمشاريع طويلة المدى، قد يتم تطبيق جدول دفع مختلف. في جميع الحالات، ستتلقى إيصالًا مفصلاً عبر البريد الإلكتروني.'
      },
      {
        id: 'p3',
        question: 'هل معلومات الدفع الخاصة بي آمنة؟',
        answer: 'نعم، نأخذ أمن الدفع على محمل الجد. نحن نستخدم تشفير SSL من 256 بت لحماية معلوماتك، ونحن متوافقون مع معايير أمان بيانات صناعة بطاقات الدفع (PCI DSS). لا نخزن أرقام بطاقات الائتمان الكاملة على خوادمنا، وجميع المعاملات تتم من خلال بوابات دفع آمنة.'
      },
      {
        id: 'p4',
        question: 'هل سأحصل على فاتورة؟',
        answer: 'نعم، ستتلقى فاتورة رقمية لكل معاملة عبر البريد الإلكتروني. يمكنك أيضًا الوصول إلى جميع الفواتير والإيصالات السابقة من قسم "المدفوعات" في لوحة القيادة الخاصة بك. إذا كنت بحاجة إلى فاتورة ضريبية رسمية أو نسخة مطبوعة، يمكنك طلب ذلك من خلال دعم العملاء.'
      },
      {
        id: 'p5',
        question: 'كيف يمكنني الحصول على استرداد؟',
        answer: 'إذا واجهت مشكلة في الخدمة أو احتجت إلى استرداد، يمكنك طلب ذلك من خلال قسم "المواعيد" في لوحة القيادة الخاصة بك. انقر على الموعد ذي الصلة واختر "طلب استرداد". سيراجع فريقنا طلبك وفقًا لسياسة الاسترداد لدينا. عادةً ما تتم معالجة عمليات الاسترداد المعتمدة في غضون 5-7 أيام عمل.'
      }
    ],
    professionals: [
      {
        id: 'pr1',
        question: 'كيف يمكنني التسجيل كمهني؟',
        answer: 'للتسجيل كمهني، انقر على "انضم كمهني" في الجزء السفلي من الصفحة الرئيسية. ستحتاج إلى تقديم معلوماتك الشخصية ومؤهلاتك وخبراتك والخدمات التي تقدمها. ستحتاج أيضًا إلى تحميل المستندات المطلوبة مثل الهوية وشهادات التأمين والتراخيص المهنية. بمجرد إرسال الطلب، سيراجعه فريقنا وسيتواصل معك.'
      },
      {
        id: 'pr2',
        question: 'كيف يتم تحديد الأسعار؟',
        answer: 'كمهني، لديك حرية تحديد أسعارك الخاصة. يمكنك تقديم أسعار ثابتة لخدمات محددة أو أسعار بالساعة، اعتمادًا على نوع العمل الذي تقدمه. ننصح بتحديد الأسعار بناءً على خبرتك ومتوسط ​​الأسعار في المنطقة لخدمات مماثلة. ضع في اعتبارك أن A-List Home Pros تأخذ عمولة بنسبة 15٪ من كل معاملة مكتملة.'
      },
      {
        id: 'pr3',
        question: 'كيف يتم الدفع للمهنيين؟',
        answer: 'بعد اكتمال الخدمة وتأكيد العميل، سيتم إصدار الدفع لك. نحن نجري عمليات الدفع مرتين في الشهر (في 1 و15 من كل شهر) عبر التحويل المصرفي أو محافظ الهاتف المحمول مثل Vodafone Cash أو Fawry. يمكنك تتبع أرباحك وأنشطتك المالية من خلال قسم "الأرباح" في لوحة القيادة الخاصة بك.'
      },
      {
        id: 'pr4',
        question: 'هل يمكنني اختيار متى ومكان عملي؟',
        answer: 'نعم، لديك مرونة كاملة في تحديد مواعيد العمل والمنطقة الجغرافية التي ترغب في خدمتها. من خلال لوحة القيادة الخاصة بك، يمكنك تحديد ساعات توفرك والمناطق التي تفضلها. يمكنك أيضًا تحديد الأيام والساعات غير المتاحة. ستظهر فقط العروض التي تناسب جدولك الزمني والتفضيلات الجغرافية.'
      }
    ],
    services: [
      {
        id: 's1',
        question: 'ما أنواع الخدمات المقدمة؟',
        answer: 'نقدم مجموعة واسعة من الخدمات المنزلية، بما في ذلك: السباكة، والكهرباء، وأعمال النجارة، والتنظيف، والتكييف، وصيانة الإنارة، وتصميم وتنفيذ الديكور الداخلي، وأعمال الدهانات، وصيانة الحدائق، وتركيب الأجهزة، وتصليح الأجهزة المنزلية، وخدمات النقل والتعبئة. لكل فئة خدمة، لدينا مهنيون متخصصون ذوو خبرة في مجال معين.'
      },
      {
        id: 's2',
        question: 'هل يمكنني طلب خدمات متعددة؟',
        answer: 'نعم، يمكنك حجز خدمات متعددة سواء في نفس الفئة أو في فئات مختلفة. يمكنك إضافة خدمات متعددة إلى سلة التسوق الخاصة بك وإكمال عملية الحجز في خطوة واحدة. إذا كنت بحاجة إلى خدمات أكثر تعقيدًا أو مشروع تجديد كامل يتطلب مهنيين متعددين، فاتصل بنا للحصول على استشارة مخصصة.'
      },
      {
        id: 's3',
        question: 'كيف يتم تسعير الخدمات؟',
        answer: 'تعتمد أسعار الخدمات على عدة عوامل، بما في ذلك نوع الخدمة وتعقيدها والمواد المطلوبة ومدة العمل والموقع. بعض الخدمات لها أسعار ثابتة (مثل تنظيف منزل قياسي)، بينما البعض الآخر يتطلب تقييمًا مخصصًا (مثل أعمال التجديد الكبيرة). قبل التأكيد، ستتلقى دائمًا تقديرًا واضحًا للتكلفة، مع تفصيل جميع الرسوم والعناصر المضمنة.'
      },
      {
        id: 's4',
        question: 'هل الخدمات مضمونة؟',
        answer: 'نعم، جميع الخدمات المقدمة من خلال A-List Home Pros مضمونة. إذا لم تكن راضيًا عن جودة الخدمة، يرجى إبلاغنا في غضون 72 ساعة، وسنعمل على حل المشكلة. اعتمادًا على الحالة، قد نرسل المهني مرة أخرى لإصلاح المشكلة، أو نرتب لمهني آخر، أو نقدم استردادًا جزئيًا أو كاملاً. تختلف ضمانات خدمات معينة، ويتم تفصيلها في صفحة الخدمة.'
      },
      {
        id: 's5',
        question: 'هل يوفر المهنيون المواد والمعدات؟',
        answer: 'في معظم الحالات، يحضر المهنيون الأدوات والمعدات الخاصة بهم. بالنسبة للمواد، يختلف ذلك حسب نوع الخدمة. بالنسبة لخدمات الإصلاح البسيطة، غالبًا ما يتم تضمين المواد الأساسية. بالنسبة للمشاريع الأكبر، قد تحتاج إلى شراء المواد بشكل منفصل أو يمكن للمهني شراءها نيابة عنك بتكلفة إضافية. يتم تحديد تفاصيل ما هو مشمول في وصف الخدمة وقبل تأكيد الحجز.'
      }
    ]
  };

  // Toggle FAQ item expand/collapse
  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filter FAQs based on search query
  const filterFAQs = () => {
    if (!searchQuery.trim()) {
      return faqItems[activeCategory];
    }

    const allFAQs = Object.values(faqItems).flat();
    return allFAQs.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const displayedFAQs = filterFAQs();

  return (
    <>
      <Helmet>
        <title>الأسئلة المتداولة | A-List Home Pros</title>
        <meta name="description" content="تعرف على إجابات الأسئلة الشائعة حول منصة A-List Home Pros، الحجوزات، المدفوعات، والخدمات" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">الأسئلة المتداولة</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            ابحث عن إجابات لأكثر الأسئلة شيوعًا حول منصتنا، الخدمات، والحجوزات
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                className="w-full py-3 px-5 pr-12 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="ابحث عن سؤال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">الأقسام</h3>
                <ul className="space-y-2">
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          activeCategory === category.id
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setSearchQuery('');
                        }}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-800 mb-2">لم تجد ما تبحث عنه؟</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    فريق دعم العملاء لدينا متاح للإجابة على جميع استفساراتك
                  </p>
                  <Link
                    to="/contact"
                    className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                  >
                    تواصل معنا
                  </Link>
                </div>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="lg:w-3/4">
              {searchQuery && (
                <div className="mb-6 text-gray-600">
                  {displayedFAQs.length === 0 ? (
                    <p>لم يتم العثور على نتائج لـ "{searchQuery}"</p>
                  ) : (
                    <p>نتائج البحث لـ "{searchQuery}" ({displayedFAQs.length} نتيجة)</p>
                  )}
                </div>
              )}

              {displayedFAQs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">لم يتم العثور على نتائج</h3>
                  <p className="text-gray-600 mb-6">
                    جرب مصطلحات بحث مختلفة أو تصفح الأقسام للعثور على الإجابات التي تبحث عنها
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    عرض جميع الأسئلة
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md divide-y">
                  {displayedFAQs.map(item => (
                    <div key={item.id} className="p-6">
                      <button
                        className="w-full flex justify-between items-center text-left"
                        onClick={() => toggleItem(item.id)}
                        aria-expanded={!!expandedItems[item.id]}
                      >
                        <h3 className="text-lg font-medium text-gray-800">{item.question}</h3>
                        {expandedItems[item.id] ? (
                          <FaChevronUp className="text-blue-500 flex-shrink-0" />
                        ) : (
                          <FaChevronDown className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {expandedItems[item.id] && (
                        <div className="mt-4 text-gray-600 prose max-w-none">
                          <p>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {!searchQuery && (
                <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">هل لديك سؤال آخر؟</h3>
                  <p className="text-blue-700 mb-4">
                    لا تتردد في التواصل مع فريق دعم العملاء لدينا للحصول على مساعدة مخصصة.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/contact"
                      className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      تواصل معنا
                    </Link>
                    <a
                      href="mailto:support@alisthomepros.com"
                      className="px-5 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      support@alisthomepros.com
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQPage; 