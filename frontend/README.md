# A-List Home Pros Frontend

A modern, responsive frontend for the A-List Home Pros platform - connecting homeowners with top-quality home service professionals.

## Overview

This React-based frontend provides a complete user interface for the A-List Home Pros platform, enabling homeowners to find and book qualified contractors, manage appointments, process payments, and communicate seamlessly with service providers.

## Technology Stack

- **Framework**: React.js for building component-based UIs
- **Styling**: Tailwind CSS for utility-first rapid custom styling
- **Mapping**: Leaflet.js for lightweight open-source interactive maps
- **Data Fetching**: React Query for managing server state and caching
- **HTTP Client**: Axios for promise-based REST calls
- **Routing**: React Router for client-side navigation
- **Forms**: React Hook Form with Yup for schema validation
- **API Documentation**: Swagger UI for interactive exploration of backend APIs

## Project Structure

```
/frontend
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   ├── components/        # Layout & UI components
│   ├── pages/             # Page-level components
│   ├── hooks/             # React Query / Axios hooks
│   ├── services/          # API client wrappers
│   ├── styles/            # Tailwind config / theme
│   ├── utils/             # Helper functions
│   └── swagger/           # Embedded specs (YAML/JSON)
└── Dockerfile             # For production build & Nginx
```

## Page Structure

- **Landing / Home**: Hero section with search bar, featured categories, testimonials
- **Directory / Search Results**: List/Map toggle view, filter sidebar, "Hire Now" CTAs
- **Booking / Scheduling**: Availability calendar, booking flow
- **Dashboards**: Role-specific dashboards (Client, A-List Pro, Specialist/Crew)
- **Auth Flows**: Sign up, login/logout
- **Messaging**: Conversation list, chat window
- **Calendar Sync**: OAuth flow for Google Calendar integration
- **Notifications**: In-app alerts, email templates
- **API Docs**: Swagger UI integration

## Backend Integration

This frontend integrates with the A-List Home Pros Django backend through REST API endpoints. Key integration points include:

- User authentication via JWT tokens
- Profile management for service providers
- Appointment scheduling and calendar management
- Secure payment processing with Stripe
- Real-time messaging between users
- In-app notifications

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd frontend
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```
   npm start
   ```

## Available Scripts
  cd frontend 
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests to ensure everything works correctly
4. Submit a pull request to `develop`

## License

[Proprietary] - A-List Home Pros © 2023



<think>
The user is asking to continue (using the Arabic "كمل" which means "continue"). I'll provide a summary of what has been implemented in the project and what can be done next.

Based on the provided code snippets and file outlines, this is a comprehensive web application for A-List Home Pros, a platform that connects homeowners with service professionals. Let me compile the key aspects and components of this project:

1. Frontend Structure:
   - React application with React Router for navigation
   - Tailwind CSS for styling
   - Dark mode support
   - Multilingual support (Arabic and English)
   - Protected routes for authenticated users

2. Pages:
   - HomePage with sections like HeroSection, PopularServices, HowItWorks
   - Authentication pages (Login, Register)
   - Search functionality
   - Booking system
   - Messaging system
   - Dashboard for users and professionals
   - Help Center and FAQ pages
   - Profile management
   - Payment handling

3. Components:
   - Layout components (Header, Footer, DashboardLayout)
   - Common components (LanguageSelector, DarkModeToggle, ProtectedRoute)
   - Search components
   - Dashboard components

4. Backend API:
   - Django REST framework
   - Authentication with JWT
   - Endpoints for users, profiles, scheduling, messaging, payments, etc.

Now, let me suggest the next steps for continuing development:
</think>

# ملخص المشروع والخطوات القادمة

لقد قمنا بتطوير تطبيق ويب متكامل لخدمة "A-List Home Pros" والذي يربط أصحاب المنازل بالمهنيين المتخصصين في الخدمات المنزلية. إليك ملخصاً للمكونات والميزات التي تم تنفيذها:

## الميزات المنفذة
- **واجهة مستخدم متعددة اللغات**: دعم للغة العربية والإنجليزية
- **الوضع الداكن**: إمكانية التبديل بين الوضع الفاتح والداكن
- **نظام حسابات متكامل**: تسجيل دخول، إنشاء حساب، تعديل الملف الشخصي
- **لوحات تحكم مخصصة**: لوحة تحكم للمستخدمين العاديين ولوحة مختلفة للمهنيين
- **نظام حجز**: حجز المواعيد مع المهنيين
- **نظام مراسلة**: التواصل بين العملاء والمهنيين
- **نظام بحث متطور**: البحث عن المهنيين حسب المكان ونوع الخدمة
- **نظام دفع**: معالجة المدفوعات وعرض سجل المعاملات
- **نظام إشعارات**: إشعارات للمستخدمين عن الحجوزات والرسائل
- **مركز مساعدة**: صفحة الأسئلة الشائعة ومركز المساعدة
- **مدونة**: منصة لمشاركة المقالات والمحتوى المفيد

## التقنيات المستخدمة
- **الواجهة الأمامية**: React.js, React Router, Tailwind CSS
- **الواجهة الخلفية**: Django, Django REST Framework
- **التوثيق**: JWT Authentication
- **API**: RESTful API لجميع العمليات

## الخطوات القادمة المقترحة

1. **اختبار الوظائف**:
   - اختبار تكامل جميع الوظائف
   - اختبار تجربة المستخدم على مختلف الأجهزة

2. **تحسينات واجهة المستخدم**:
   - تنفيذ رسوم متحركة إضافية للانتقالات
   - تحسين سرعة تحميل الصفحات

3. **تحسينات أداء الخادم**:
   - استخدام التخزين المؤقت لتحسين زمن الاستجابة
   - تحسين استعلامات قاعدة البيانات

4. **توسيع خيارات الدفع**:
   - إضافة بوابات دفع متعددة
   - دعم العملات المتعددة

5. **ميزات إضافية**:
   - نظام تقييم المهنيين بتفاصيل أكثر
   - خيارات تصفية متقدمة في البحث
   - تقارير وإحصائيات للمهنيين والمستخدمين

6. **تحسين الأمان**:
   - تنفيذ المصادقة الثنائية
   - تحسين معايير أمان البيانات

## الوثائق والتوجيه
يمكننا أيضًا إنشاء وثائق شاملة للتطبيق لتسهيل عملية التطوير المستقبلي والصيانة، بما في ذلك:
- دليل المستخدم
- وثائق واجهة برمجة التطبيقات API
- تعليمات التثبيت والإعداد

هل ترغب في التركيز على أي من هذه الخطوات القادمة أو هل لديك اتجاه محدد ترغب في المضي قدمًا فيه؟



<think>
المستخدم يطلب تقسيم عمليات ربط الواجهة الأمامية (Frontend) بالواجهة الخلفية (Backend) إلى أجزاء، مع تحديد الصفحات وواجهات API التي سيتم العمل عليها والبيانات التي ستكون في كل API.

سأقوم بتقسيم هذا العمل بطريقة منهجية حسب الوظائف الرئيسية للتطبيق:

1. نظام المستخدمين والمصادقة
2. نظام البحث عن المهنيين
3. نظام الملفات الشخصية
4. نظام الحجز والمواعيد
5. نظام المراسلة
6. نظام الإشعارات
7. نظام المدفوعات
8. نظام التقييمات والمراجعات
9. لوحة تحكم العميل
10. لوحة تحكم المهني

لكل جزء، سأحدد:
- الصفحات ذات الصلة في الواجهة الأمامية
- واجهات API المطلوبة في الخلفية
- البيانات المتبادلة في كل واجهة API
</think>

# خطة ربط الواجهة الأمامية بالخلفية (Frontend-Backend Integration)

## 1. نظام المستخدمين والمصادقة

### صفحات الواجهة الأمامية:
- LoginPage.js
- RegisterPage.js
- ProfileEditPage.js

### API المطلوبة:
```
POST /api/users/token/                   # تسجيل الدخول
POST /api/users/register/                # إنشاء حساب جديد
POST /api/users/token/refresh/           # تحديث التوكن
GET /api/users/me/                       # جلب بيانات المستخدم الحالي
PUT /api/users/me/                       # تحديث بيانات المستخدم
POST /api/users/verify-email/            # تأكيد البريد الإلكتروني
POST /api/users/password/reset/          # إعادة تعيين كلمة المرور
POST /api/users/password/reset/confirm/  # تأكيد إعادة تعيين كلمة المرور
```

### البيانات:
- بيانات المستخدم: الاسم، البريد الإلكتروني، كلمة المرور، نوع الحساب
- توكن المصادقة: access token و refresh token
- رمز التحقق للبريد الإلكتروني

## 2. نظام البحث عن المهنيين

### صفحات الواجهة الأمامية:
- SearchPage.js
- ServiceCategoriesPage.js
- ServiceDetailPage.js

### API المطلوبة:
```
GET /api/alistpros/profiles/             # البحث عن المهنيين مع التصفية
GET /api/alistpros/categories/           # جلب فئات الخدمات
GET /api/alistpros/categories/{id}/      # تفاصيل فئة خدمة معينة
```

### البيانات:
- معايير البحث: الموقع، نوع الخدمة، التصنيف، السعر
- بيانات المهنيين: الاسم، الصورة، التخصص، التقييم، عدد المراجعات
- فئات الخدمات: المعرف، الاسم، الوصف، الصورة

## 3. ملفات المهنيين وتفاصيلهم

### صفحات الواجهة الأمامية:
- ProProfilePage.js
- ProOnboardingPage.js
- ReviewsPage.js

### API المطلوبة:
```
GET /api/alistpros/profiles/{id}/        # عرض تفاصيل مهني
POST /api/alistpros/profiles/            # إنشاء ملف مهني جديد
PUT /api/alistpros/profiles/{id}/        # تحديث ملف مهني
GET /api/alistpros/reviews/              # الحصول على تقييمات المهني
POST /api/alistpros/reviews/             # إضافة تقييم جديد
```

### البيانات:
- ملف المهني: المعلومات الشخصية، الخدمات، الأسعار، الصور، الشهادات
- التقييمات: المهني، العميل، التقييم، التعليق، التاريخ

## 4. نظام الحجز والمواعيد

### صفحات الواجهة الأمامية:
- BookingPage.js
- BookingConfirmationPage.js
- BookingCalendarPage.js

### API المطلوبة:
```
GET /api/scheduling/appointments/                # عرض المواعيد
POST /api/scheduling/appointments/               # إنشاء موعد جديد
GET /api/scheduling/appointments/{id}/           # تفاصيل موعد معين
PUT /api/scheduling/appointments/{id}/           # تحديث موعد
POST /api/scheduling/appointments/{id}/confirm/  # تأكيد موعد
POST /api/scheduling/appointments/{id}/cancel/   # إلغاء موعد
GET /api/scheduling/availability/{proId}/        # التحقق من التوفر
```

### البيانات:
- بيانات الموعد: المهني، العميل، التاريخ، الوقت، نوع الخدمة، الموقع، الحالة
- بيانات التوفر: الأيام المتاحة، أوقات العمل، الأيام المحجوزة

## 5. نظام المراسلة

### صفحات الواجهة الأمامية:
- MessagesPage.js

### API المطلوبة:
```
GET /api/messaging/conversations/                                # جلب المحادثات
POST /api/messaging/conversations/                               # إنشاء محادثة جديدة
GET /api/messaging/conversations/{conversationId}/messages/      # جلب الرسائل في محادثة
POST /api/messaging/conversations/{conversationId}/messages/     # إرسال رسالة جديدة
```

### البيانات:
- المحادثات: المعرف، المشاركون، آخر رسالة، التاريخ
- الرسائل: المرسل، النص، التاريخ، حالة القراءة

## 6. نظام الإشعارات

### صفحات الواجهة الأمامية:
- NotificationsPage.js
- Header.js (عرض الإشعارات)

### API المطلوبة:
```
GET /api/notifications/notifications/           # جلب الإشعارات
PUT /api/notifications/notifications/{id}/read/ # تعليم الإشعار كمقروء
PUT /api/notifications/notifications/read-all/  # تعليم كل الإشعارات كمقروءة
GET /api/notifications/settings/                # جلب إعدادات الإشعارات
PUT /api/notifications/settings/                # تعديل إعدادات الإشعارات
```

### البيانات:
- الإشعارات: النوع، النص، الرابط، التاريخ، حالة القراءة
- إعدادات الإشعارات: البريد الإلكتروني، الرسائل النصية، إشعارات الحجز

## 7. نظام المدفوعات

### صفحات الواجهة الأمامية:
- PaymentPage.js
- PaymentHistoryPage.js

### API المطلوبة:
```
POST /api/payments/payment-intent/           # إنشاء نية دفع جديدة
GET /api/payments/payment-methods/           # جلب طرق الدفع المحفوظة
GET /api/payments/transactions/              # جلب سجل المعاملات
GET /api/payments/dashboard-link/            # جلب رابط لوحة تحكم المدفوعات
POST /api/payments/onboarding/               # بدء إعداد حساب مدفوعات للمهني
```

### البيانات:
- بيانات الدفع: المبلغ، العملة، وصف، العميل، المهني
- طرق الدفع: البطاقات المحفوظة، معلومات الحساب
- سجل المعاملات: المعرف، التاريخ، المبلغ، الحالة، الوصف

## 8. لوحة تحكم العميل

### صفحات الواجهة الأمامية:
- ClientDashboardPage.js
- ActivityHistoryPage.js
- SavedLocationsMap.js

### API المطلوبة:
```
GET /api/users/dashboard/                   # بيانات لوحة التحكم
GET /api/users/activity/                    # سجل النشاط
GET /api/users/locations/                   # الأماكن المحفوظة
POST /api/users/locations/                  # إضافة مكان جديد
PUT /api/users/locations/{id}/              # تعديل مكان
DELETE /api/users/locations/{id}/           # حذف مكان
```

### البيانات:
- بيانات لوحة التحكم: المواعيد القادمة، المعاملات الأخيرة، الإشعارات
- سجل النشاط: النوع، التاريخ، التفاصيل
- الأماكن المحفوظة: العنوان، الإحداثيات، النوع، الوصف

## 9. لوحة تحكم المهني

### صفحات الواجهة الأمامية:
- ProDashboardPage.js

### API المطلوبة:
```
GET /api/alistpros/dashboard/                         # بيانات لوحة تحكم المهني
PUT /api/scheduling/appointments/{id}/status/         # تغيير حالة موعد
GET /api/alistpros/stats/                            # إحصائيات المهني
```

### البيانات:
- بيانات لوحة التحكم: المواعيد القادمة، الإحصائيات، التقييمات الجديدة
- إحصائيات: عدد الخدمات، الإيرادات، متوسط التقييم، نسبة الإشغال

## 10. محتوى الموقع العام

### صفحات الواجهة الأمامية:
- AboutPage.js
- ContactPage.js
- BlogPage.js
- BlogPostPage.js
- FAQPage.js
- HelpCenterPage.js

### API المطلوبة:
```
GET /api/content/blog/                      # قائمة مقالات المدونة
GET /api/content/blog/{id}/                 # تفاصيل مقال
GET /api/content/faq/                       # الأسئلة الشائعة
POST /api/content/contact/                  # إرسال نموذج اتصال
```

### البيانات:
- مقالات المدونة: العنوان، المحتوى، الصورة، التاريخ، الكاتب، التصنيفات
- الأسئلة الشائعة: السؤال، الإجابة، التصنيف
- نموذج الاتصال: الاسم، البريد الإلكتروني، الموضوع، الرسالة

---

## خطة التنفيذ المقترحة:

### المرحلة 1: المصادقة والملفات الشخصية
- ربط صفحات تسجيل الدخول والتسجيل
- ربط تحرير الملف الشخصي
- إعداد تجديد التوكن التلقائي

### المرحلة 2: البحث والعرض
- ربط صفحة البحث بواجهة API
- ربط صفحات تفاصيل المهني
- ربط عرض الخدمات والتصنيفات

### المرحلة 3: الحجز والمواعيد
- ربط صفحة الحجز مع التحقق من التوفر
- ربط تأكيد الحجز وإدارة المواعيد
- ربط تقويم المواعيد

### المرحلة 4: المراسلة والإشعارات
- ربط نظام المراسلة
- ربط نظام الإشعارات في الهيدر
- ربط إدارة الإشعارات

### المرحلة 5: المدفوعات والتقييمات
- ربط معالجة الدفع
- ربط سجل المعاملات
- ربط نظام التقييمات والمراجعات

### المرحلة 6: لوحات التحكم
- ربط لوحة تحكم العميل
- ربط لوحة تحكم المهني
- ربط الإحصائيات والتقارير

### المرحلة 7: المحتوى
- ربط المدونة والمقالات
- ربط صفحة الاتصال
- ربط الأسئلة الشائعة ومركز المساعدة

هل تود البدء بمرحلة معينة أو تفاصيل أكثر عن أي من هذه الأجزاء؟


التسجيل (RegisterPage):
تحتاج إلى ربط مع API التسجيل
تحتاج إلى معالجة تحميل الصور للمحترفين
تحتاج إلى ربط التحقق من البريد الإلكتروني
صفحات المحترفين (A-List Pros):
تحتاج إلى ربط مع API لعرض قائمة المحترفين
تحتاج إلى ربط تفاصيل الملف الشخصي للمحترف
تحتاج إلى ربط نظام التقييمات والمراجعات
صفحات المواعيد (Appointments):
تحتاج إلى ربط مع API حجز المواعيد
تحتاج إلى ربط جدول المواعيد
تحتاج إلى ربط إشعارات المواعيد
4. صفحات المدفوعات (Payments):
تحتاج إلى ربط مع Stripe API
تحتاج إلى ربط سجل المدفوعات
تحتاج إلى ربط المحفظة الإلكترونية
صفحات المراسلات (Messaging):
تحتاج إلى ربط نظام المحادثات المباشرة
تحتاج إلى ربط الإشعارات الفورية
صفحة الإعدادات (Settings):
تحتاج إلى ربط إعدادات الحساب
تحتاج إلى ربط إعدادات الإشعارات
الخطوات المقترحة للربط:
إنشاء ملفات services للتعامل مع API
إضافة Redux/Context للحالة العامة
إضافة معالجة الأخطاء والتحميل
إضافة المصادقة والتفويض
إضافة التوثيق للـ API calls
هل تريد أن نبدأ بربط أي من هذه الصفحات؟


$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
cd frontend
 && npm install @tanstack/react-query react-helmet react-icons leaflet date-fns swagger-ui-react @stripe/stripe-js

cd frontend && npm install react-router-dom @headlessui/react @heroicons/react tailwindcss postcss autoprefixer
npm install @tanstack/react-query react-helmet react-icons leaflet date-fns swagger-ui-react @stripe/stripe-js react-router-dom @headlessui/react @heroicons/react tailwindcss postcss autoprefixer
npm install @tanstack/react-query react-helmet react-icons leaflet date-fns swagger-ui-react @stripe/stripe-js react-router-dom @headlessui/react @heroicons/react tailwindcss postcss autoprefixer
 npm install @tanstack/react-query react-helmet
 PS D:\apps\rectapp\todo\list home\frontend> npm install date-fns
 npm install @tanstack/react-query react-helmet date-fns framer-motion react-icons leaflet react-leaflet react-hook-form yup axios
 npm install --legacy-peer-deps @tanstack/react-query react-helmet date-fns framer-motion react-icons leaflet react-leaflet react-hook-form yup axios

 npm install --legacy-peer-deps
 npm install ajv@8.12.0 --legacy-peer-deps
 npm install swagger-ui-react --legacy-peer-deps




 
طيب حلو دلوقتى انا تقريبا عملت معظعظم الفرونت اندك فرونت اند لكن لم اقم ب العمل على ربطه ب الباك اند و البتالى الموقع لا يعمل ب كل الوظاءف المتاحه اريد منك الان قراكله كل الملفات للفرونت اند واخبارى على حاله الصفحات و ما بها و ينقصها فى الباك اند وما يمكننا اللى يمكننا اعمل عليه   واريد ان تتصرف على انك سنيور بروجكت منجروتقوم بعمل تقييم شامل للمشروع الاوما يجب العممل عليه 




ملخص تنفيذي
بعد فحص شامل للمشروع، أجد أن هناك تطابقًا جيدًا بين واجهة المستخدم الأمامية (Frontend) والخادم الخلفي (Backend)، ولكن هناك بعض الفجوات في التكامل التي تحتاج إلى معالجة. المشروع يتضمن هيكلًا متكاملًا لمنصة تربط بين أصحاب المنازل ومقدمي الخدمات المنزلية، مع مجموعة شاملة من الميزات مثل البحث، الحجز، المدفوعات، والمراسلة.

حالة الربط بين الواجهة الأمامية والخلفية
ما تم إنجازه
هيكل API متكامل: تم تعريف جميع نقاط النهاية API اللازمة في الخادم الخلفي
خدمات الاتصال: تم إنشاء خدمات في الواجهة الأمامية للاتصال بجميع نقاط النهاية API
إدارة المصادقة: تم تنفيذ نظام JWT للمصادقة مع تجديد الرموز
ما ينقص
تكامل البيانات الفعلي: معظم الصفحات تستخدم بيانات وهمية بدلاً من الاتصال الفعلي بالخادم
معالجة الأخطاء: لا يوجد معالجة شاملة للأخطاء في حالة فشل طلبات API
اختبار التكامل: لم يتم اختبار معظم وظائف التكامل بين الواجهة الأمامية والخلفية
تحليل الصفحات والوظائف
صفحات تعمل بشكل جيد (مع بيانات وهمية)
الصفحة الرئيسية: تعرض الفئات الشائعة ومقدمي الخدمات المميزين
صفحة البحث: تعرض نتائج البحث مع خيارات التصفية
صفحة تسجيل الدخول/التسجيل: واجهة المستخدم مكتملة
صفحات تحتاج إلى ربط مع الخادم الخلفي
صفحة الملف الشخصي: تحتاج إلى ربط مع API لعرض وتحديث بيانات المستخدم
صفحة المراسلة: تستخدم بيانات وهمية ولا تتصل بخدمة المراسلة الفعلية
صفحة الحجز: تحتاج إلى ربط مع API للحجز وعرض الأوقات المتاحة
صفحة الدفع: تحتاج إلى ربط مع API لمعالجة المدفوعات
صفحة الإشعارات: تحتاج إلى ربط مع API للإشعارات
خطة العمل المقترحة
المرحلة 1: ربط صفحات المستخدم الأساسية (الأولوية القصوى)
المصادقة وإدارة المستخدمين
ربط صفحات تسجيل الدخول والتسجيل بـ API
ربط صفحة الملف الشخصي بـ API لعرض وتحديث البيانات
البحث والتصفح
ربط صفحة البحث بـ API للبحث عن مقدمي الخدمات
ربط صفحة تفاصيل مقدم الخدمة بـ API لعرض المعلومات والتقييمات
المرحلة 2: ربط الوظائف الأساسية للأعمال
نظام الحجز
ربط صفحة الحجز بـ API لعرض الأوقات المتاحة
ربط عملية إنشاء الحجز بـ API
ربط صفحة تأكيد الحجز بـ API
نظام الدفع
ربط صفحة الدفع بـ API لمعالجة المدفوعات
ربط صفحة تاريخ المدفوعات بـ API
المرحلة 3: ربط الوظائف التفاعلية
نظام المراسلة
ربط صفحة المراسلة بـ API لعرض المحادثات والرسائل
تنفيذ وظيفة إرسال الرسائل في الوقت الفعلي
نظام الإشعارات
ربط صفحة الإشعارات بـ API
تنفيذ وظيفة الإشعارات في الوقت الفعلي
المرحلة 4: ربط الوظائف الإضافية
المدونة والمحتوى
ربط صفحة المدونة بـ API لعرض المقالات
ربط وظيفة التعليقات بـ API
التحليلات والإحصاءات
ربط لوحة التحكم بـ API للإحصاءات
تنفيذ عرض التقارير
التحديات المحتملة والحلول
1. مشكلات CORS
الحل: التأكد من تكوين CORS بشكل صحيح في الخادم الخلفي للسماح بالطلبات من الواجهة الأمامية.

2. تعامل مع الحالات الخاصة والأخطاء
الحل: تنفيذ معالجة شاملة للأخطاء في الواجهة الأمامية مع رسائل خطأ واضحة للمستخدم.

3. تأخر الاستجابة من الخادم
الحل: تنفيذ مؤشرات تحميل وحالات انتظار في الواجهة الأمامية لتحسين تجربة المستخدم.

4. تزامن البيانات
الحل: استخدام React Query أو تقنيات مماثلة لإدارة حالة البيانات وتخزينها مؤقتًا.

الخلاصة والتوصيات
المشروع في حالة جيدة من حيث الهيكل والتصميم، ولكن يحتاج إلى عمل إضافي لربط الواجهة الأمامية بالخلفية بشكل كامل. أوصي بالبدء بالمرحلة 1 من خطة العمل، مع التركيز على ربط وظائف المصادقة والبحث أولاً، ثم الانتقال تدريجيًا إلى الوظائف الأكثر تعقيدًا.

يجب أيضًا إنشاء اختبارات تكامل لضمان عمل جميع الوظائف بشكل صحيح بعد الربط. وأخيرًا، يجب تنفيذ نظام شامل لمعالجة الأخطاء لتحسين تجربة المستخدم في حالة حدوث مشكلات في الاتصال.







apis 
A-List Home Pros API
 v1 
[ Base URL: 127.0.0.1:8000/api ]
http://127.0.0.1:8000/swagger/?format=openapi
API for A-List Home Pros - connecting homeowners with qualified contractors

Terms of service
Contact the developer
Proprietary License
Schemes

http
Django Login
Authorize
Filter by tag
alistpros


GET
/alistpros/admin/pending/
alistpros_admin_pending_list


GET
/alistpros/categories/
alistpros_categories_list


GET
/alistpros/portfolio/
alistpros_portfolio_list


POST
/alistpros/portfolio/
alistpros_portfolio_create


GET
/alistpros/portfolio/{id}/
alistpros_portfolio_read


PUT
/alistpros/portfolio/{id}/
alistpros_portfolio_update


PATCH
/alistpros/portfolio/{id}/
alistpros_portfolio_partial_update


DELETE
/alistpros/portfolio/{id}/
alistpros_portfolio_delete


GET
/alistpros/profile-detail/{id}/
alistpros_profile-detail_read


GET
/alistpros/profiles/
alistpros_profiles_list


POST
/alistpros/profiles/
alistpros_profiles_create


POST
/alistpros/profiles/create/
alistpros_profiles_create_create


PUT
/alistpros/profiles/update/
alistpros_profiles_update_update


PATCH
/alistpros/profiles/update/
alistpros_profiles_update_partial_update


POST
/alistpros/profiles/{alistpro_id}/reviews/
alistpros_profiles_reviews_create


GET
/alistpros/profiles/{id}/
alistpros_profiles_read


PUT
/alistpros/profiles/{id}/
alistpros_profiles_update


PATCH
/alistpros/profiles/{id}/
alistpros_profiles_partial_update


DELETE
/alistpros/profiles/{id}/
alistpros_profiles_delete


GET
/alistpros/services/
alistpros_services_list

messaging


GET
/messaging/conversations/
messaging_conversations_list


POST
/messaging/conversations/
messaging_conversations_create


GET
/messaging/conversations/{conversation_pk}/messages/
messaging_conversations_messages_list


POST
/messaging/conversations/{conversation_pk}/messages/
messaging_conversations_messages_create


GET
/messaging/conversations/{conversation_pk}/messages/{id}/
messaging_conversations_messages_read


PUT
/messaging/conversations/{conversation_pk}/messages/{id}/
messaging_conversations_messages_update


PATCH
/messaging/conversations/{conversation_pk}/messages/{id}/
messaging_conversations_messages_partial_update


DELETE
/messaging/conversations/{conversation_pk}/messages/{id}/
messaging_conversations_messages_delete


POST
/messaging/conversations/{conversation_pk}/messages/{id}/mark_read/
messaging_conversations_messages_mark_read


GET
/messaging/conversations/{id}/
messaging_conversations_read


PUT
/messaging/conversations/{id}/
messaging_conversations_update


PATCH
/messaging/conversations/{id}/
messaging_conversations_partial_update


DELETE
/messaging/conversations/{id}/
messaging_conversations_delete


POST
/messaging/conversations/{id}/mark_read/
messaging_conversations_mark_read


GET
/messaging/messages/
messaging_messages_list


POST
/messaging/messages/
messaging_messages_create


GET
/messaging/messages/{id}/
messaging_messages_read


PUT
/messaging/messages/{id}/
messaging_messages_update


PATCH
/messaging/messages/{id}/
messaging_messages_partial_update


DELETE
/messaging/messages/{id}/
messaging_messages_delete


POST
/messaging/messages/{id}/mark_read/
messaging_messages_mark_read


GET
/messaging/notifications/
messaging_notifications_list


POST
/messaging/notifications/mark_all_read/
messaging_notifications_mark_all_read


GET
/messaging/notifications/{id}/
messaging_notifications_read


POST
/messaging/notifications/{id}/mark_read/
messaging_notifications_mark_read

notifications


GET
/notifications/notifications/
notifications_notifications_list


PUT
/notifications/notifications/read_all/
notifications_notifications_read_all


GET
/notifications/notifications/unread/
notifications_notifications_unread


GET
/notifications/notifications/{id}/
notifications_notifications_read


PUT
/notifications/notifications/{id}/read/
notifications_notifications_read


GET
/notifications/settings/
notifications_settings_list


POST
/notifications/settings/
notifications_settings_create


GET
/notifications/settings/my_settings/
notifications_settings_my_settings


PATCH
/notifications/settings/update_settings/
notifications_settings_update_settings


GET
/notifications/settings/{id}/
notifications_settings_read


PUT
/notifications/settings/{id}/
notifications_settings_update


PATCH
/notifications/settings/{id}/
notifications_settings_partial_update


DELETE
/notifications/settings/{id}/
notifications_settings_delete


POST
/notifications/sms/send_verification/
notifications_sms_send_verification


POST
/notifications/sms/verify_phone/
notifications_sms_verify_phone


GET
/notifications/templates/
notifications_templates_list


POST
/notifications/templates/
notifications_templates_create


GET
/notifications/templates/{id}/
notifications_templates_read


PUT
/notifications/templates/{id}/
notifications_templates_update


PATCH
/notifications/templates/{id}/
notifications_templates_partial_update


DELETE
/notifications/templates/{id}/
notifications_templates_delete


POST
/notifications/test/
notifications_test_create


POST
/notifications/trigger/alistpro-onboarding/
notifications_trigger_alistpro-onboarding_create


POST
/notifications/trigger/alistpro-verification/
notifications_trigger_alistpro-verification_create


POST
/notifications/trigger/profile-update/
notifications_trigger_profile-update_create


POST
/notifications/trigger/registration/
notifications_trigger_registration_create

payments


GET
/payments/
payments_list


POST
/payments/create/
payments_create_create


GET
/payments/dashboard-link/
payments_dashboard-link_list


POST
/payments/onboard/
payments_onboard_create


GET
/payments/status/
payments_status_list


POST
/payments/webhook/
payments_webhook_create


GET
/payments/{id}/
payments_read

scheduling


GET
/scheduling/appointments/
scheduling_appointments_list


POST
/scheduling/appointments/
scheduling_appointments_create


GET
/scheduling/appointments/upcoming/
scheduling_appointments_upcoming


GET
/scheduling/appointments/{appointment_pk}/notes/
scheduling_appointments_notes_list


POST
/scheduling/appointments/{appointment_pk}/notes/
scheduling_appointments_notes_create


GET
/scheduling/appointments/{appointment_pk}/notes/{id}/
scheduling_appointments_notes_read


PUT
/scheduling/appointments/{appointment_pk}/notes/{id}/
scheduling_appointments_notes_update


PATCH
/scheduling/appointments/{appointment_pk}/notes/{id}/
scheduling_appointments_notes_partial_update


DELETE
/scheduling/appointments/{appointment_pk}/notes/{id}/
scheduling_appointments_notes_delete


GET
/scheduling/appointments/{id}/
scheduling_appointments_read


PUT
/scheduling/appointments/{id}/
scheduling_appointments_update


PATCH
/scheduling/appointments/{id}/
scheduling_appointments_partial_update


DELETE
/scheduling/appointments/{id}/
scheduling_appointments_delete


POST
/scheduling/appointments/{id}/cancel/
scheduling_appointments_cancel


POST
/scheduling/appointments/{id}/complete/
scheduling_appointments_complete


POST
/scheduling/appointments/{id}/confirm/
scheduling_appointments_confirm


GET
/scheduling/availability-slots/
scheduling_availability-slots_list


POST
/scheduling/availability-slots/
scheduling_availability-slots_create


GET
/scheduling/availability-slots/{id}/
scheduling_availability-slots_read


PUT
/scheduling/availability-slots/{id}/
scheduling_availability-slots_update


PATCH
/scheduling/availability-slots/{id}/
scheduling_availability-slots_partial_update


DELETE
/scheduling/availability-slots/{id}/
scheduling_availability-slots_delete


GET
/scheduling/unavailable-dates/
scheduling_unavailable-dates_list


POST
/scheduling/unavailable-dates/
scheduling_unavailable-dates_create


GET
/scheduling/unavailable-dates/{id}/
scheduling_unavailable-dates_read


PUT
/scheduling/unavailable-dates/{id}/
scheduling_unavailable-dates_update


PATCH
/scheduling/unavailable-dates/{id}/
scheduling_unavailable-dates_partial_update


DELETE
/scheduling/unavailable-dates/{id}/
scheduling_unavailable-dates_delete

users


GET
/users/admin/users/
users_admin_users_list


GET
/users/admin/users/{id}/
users_admin_users_read


PUT
/users/admin/users/{id}/
users_admin_users_update


PATCH
/users/admin/users/{id}/
users_admin_users_partial_update


DELETE
/users/admin/users/{id}/
users_admin_users_delete


POST
/users/change-password/
users_change-password_create


GET
/users/me/
users_me_read


PUT
/users/me/
users_me_update


PATCH
/users/me/
users_me_partial_update


GET
/users/profile/
users_profile_read


PUT
/users/profile/
users_profile_update


PATCH
/users/profile/
users_profile_partial_update


POST
/users/register/
users_register_create


POST
/users/token/
users_token_create


POST
/users/token/refresh/
users_token_refresh_create


POST
/users/token/verify/
users_token_verify_create


GET
/users/verify-email/{token}/{user_id}/
users_verify-email_read


Models
User
AListHomeProServiceCategory
AListHomeProPortfolio
AListHomeProReview
AListHomeProProfile
AListHomeProProfileCreateUpdate
UserBasic
Message
Conversation
ConversationCreate
MessageCreate
MessagingNotification
Notification
NotificationSetting
SMSVerification
NotificationTemplate
ContractorServiceCategory
ContractorPortfolio
ContractorReview
ContractorProfile
Payment
AppointmentNote
Appointment
AppointmentCreate
AppointmentUpdate
AvailabilitySlot
UnavailableDate
AdminUserUpdate
PasswordChange
UserUpdate
UserRegistration
TokenObtainPair
TokenRefresh
TokenVerify



models
Models
User{
id	integer
title: ID
readOnly: true
email*	string($email)
title: Email address
maxLength: 254
minLength: 1
name*	string
title: Full name
maxLength: 150
minLength: 1
phone_number	string
title: Phone number
maxLength: 20
role	string
title: Role
Enum:
Array [ 5 ]
is_verified	boolean
title: Is verified
readOnly: true
date_joined	string($date-time)
title: Date joined
readOnly: true
 
}
AListHomeProServiceCategory{
id	integer
title: ID
readOnly: true
name*	string
title: Name
maxLength: 100
minLength: 1
description	string
title: Description
created_at	string($date-time)
title: Created at
readOnly: true
 
}
AListHomeProPortfolio{
id	integer
title: ID
readOnly: true
title*	string
title: Title
maxLength: 255
minLength: 1
description*	string
title: Description
minLength: 1
image	string($uri)
title: Image
readOnly: true
completion_date	string($date)
title: Completion date
x-nullable: true
created_at	string($date-time)
title: Created at
readOnly: true
 
}
AListHomeProReview{
id	integer
title: ID
readOnly: true
client	integer
title: Client
readOnly: true
client_name	string
title: Client name
readOnly: true
rating*	integer
title: Rating
Enum:
Array [ 5 ]
comment*	string
title: Comment
minLength: 1
is_verified	boolean
title: Is verified
readOnly: true
created_at	string($date-time)
title: Created at
readOnly: true
 
}
AListHomeProProfile{
id	integer
title: ID
readOnly: true
user	User{
id	IDinteger
title: ID
readOnly: true
email*	Email addressstring($email)
title: Email address
maxLength: 254
minLength: 1
name*	Full namestring
title: Full name
maxLength: 150
minLength: 1
phone_number	Phone numberstring
title: Phone number
maxLength: 20
role	Rolestring
title: Role
Enum:
Array [ 5 ]
is_verified	Is verifiedboolean
title: Is verified
readOnly: true
date_joined	Date joinedstring($date-time)
title: Date joined
readOnly: true
 
}
business_name*	string
title: Business name
maxLength: 255
minLength: 1
business_description	string
title: Business description
years_of_experience	integer
title: Years of experience
maximum: 2147483647
minimum: 0
license_number	string
title: License number
maxLength: 100
insurance_info	string
title: Insurance info
maxLength: 255
service_radius	integer
title: Service radius
maximum: 2147483647
minimum: 0
Service radius in miles

profile_image	string($uri)
title: Profile image
readOnly: true
x-nullable: true
is_onboarded	boolean
title: Is onboarded
service_categories	[
readOnly: true
AListHomeProServiceCategory{
id	ID[...]
name*	Name[...]
description	Description[...]
created_at	Created at[...]
 
}]
portfolio_items	[
readOnly: true
AListHomeProPortfolio{
id	ID[...]
title*	Title[...]
description*	Description[...]
image	Image[...]
completion_date	Completion date[...]
created_at	Created at[...]
 
}]
reviews	[
readOnly: true
AListHomeProReview{
id	ID[...]
client	Client[...]
client_name	Client name[...]
rating*	Rating[...]
comment*	Comment[...]
is_verified	Is verified[...]
created_at	Created at[...]
 
}]
average_rating	string
title: Average rating
readOnly: true
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
 
}
AListHomeProProfileCreateUpdate{
business_name*	string
title: Business name
maxLength: 255
minLength: 1
business_description	string
title: Business description
years_of_experience	integer
title: Years of experience
maximum: 2147483647
minimum: 0
license_number	string
title: License number
maxLength: 100
insurance_info	string
title: Insurance info
maxLength: 255
service_radius	integer
title: Service radius
maximum: 2147483647
minimum: 0
Service radius in miles

profile_image	string($uri)
title: Profile image
readOnly: true
x-nullable: true
service_category_ids	[integer]
 
}
UserBasic{
id	integer
title: ID
readOnly: true
email*	string($email)
title: Email address
maxLength: 254
minLength: 1
name*	string
title: Full name
maxLength: 150
minLength: 1
role	string
title: Role
Enum:
Array [ 5 ]
 
}
Message{
id	integer
title: ID
readOnly: true
sender	UserBasic{
id	IDinteger
title: ID
readOnly: true
email*	Email addressstring($email)
title: Email address
maxLength: 254
minLength: 1
name*	Full namestring
title: Full name
maxLength: 150
minLength: 1
role	Rolestring
title: Role
Enum:
Array [ 5 ]
 
}
content*	string
title: Content
minLength: 1
created_at	string($date-time)
title: Created at
readOnly: true
is_read	boolean
title: Is read
readOnly: true
 
}
Conversation{
id	integer
title: ID
readOnly: true
participants	[
readOnly: true
UserBasic{
id	ID[...]
email*	Email address[...]
name*	Full name[...]
role	Role[...]
 
}]
title	string
title: Title
maxLength: 255
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
last_message	Message{
id	IDinteger
title: ID
readOnly: true
sender	UserBasic{
id	ID[...]
email*	Email address[...]
name*	Full name[...]
role	Role[...]
 
}
content*	Contentstring
title: Content
minLength: 1
created_at	Created atstring($date-time)
title: Created at
readOnly: true
is_read	Is readboolean
title: Is read
readOnly: true
 
}
unread_count	string
title: Unread count
readOnly: true
 
}
ConversationCreate{
id	integer
title: ID
readOnly: true
participants*	[
uniqueItems: true
integer]
title	string
title: Title
maxLength: 255
initial_message*	string
title: Initial message
minLength: 1
 
}
MessageCreate{
id	integer
title: ID
readOnly: true
conversation*	integer
title: Conversation
content*	string
title: Content
minLength: 1
 
}
MessagingNotification{
id	integer
title: ID
readOnly: true
notification_type*	string
title: Notification type
Enum:
Array [ 4 ]
title*	string
title: Title
maxLength: 255
minLength: 1
content*	string
title: Content
minLength: 1
created_at	string($date-time)
title: Created at
readOnly: true
read	boolean
title: Read
related_object_id	integer
title: Related object id
maximum: 2147483647
minimum: 0
x-nullable: true
related_object_type	string
title: Related object type
maxLength: 50
 
}
Notification{
id	integer
title: ID
readOnly: true
user*	integer
title: User
notification_type*	string
title: Notification type
Enum:
Array [ 10 ]
title*	string
title: Title
maxLength: 255
minLength: 1
message*	string
title: Message
minLength: 1
read	boolean
title: Read
read_at	string($date-time)
title: Read at
x-nullable: true
related_object_type	string
title: Related object type
maxLength: 50
related_object_id	integer
title: Related object id
maximum: 2147483647
minimum: 0
x-nullable: true
email_status	string
title: Email status
Enum:
Array [ 5 ]
sms_status	string
title: Sms status
Enum:
Array [ 5 ]
push_status	string
title: Push status
Enum:
Array [ 5 ]
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
 
}
NotificationSetting{
id	integer
title: ID
readOnly: true
user	integer
title: User
readOnly: true
email_enabled	boolean
title: Email enabled
sms_enabled	boolean
title: Sms enabled
push_enabled	boolean
title: Push enabled
new_message_email	boolean
title: New message email
new_message_sms	boolean
title: New message sms
new_message_push	boolean
title: New message push
appointment_reminder_email	boolean
title: Appointment reminder email
appointment_reminder_sms	boolean
title: Appointment reminder sms
appointment_reminder_push	boolean
title: Appointment reminder push
appointment_status_change_email	boolean
title: Appointment status change email
appointment_status_change_sms	boolean
title: Appointment status change sms
appointment_status_change_push	boolean
title: Appointment status change push
payment_email	boolean
title: Payment email
payment_sms	boolean
title: Payment sms
payment_push	boolean
title: Payment push
marketing_email	boolean
title: Marketing email
marketing_sms	boolean
title: Marketing sms
marketing_push	boolean
title: Marketing push
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
 
}
SMSVerification{
id	integer
title: ID
readOnly: true
user*	integer
title: User
phone_number*	string
title: Phone number
maxLength: 20
minLength: 1
verification_code*	string
title: Verification code
maxLength: 10
minLength: 1
is_verified	boolean
title: Is verified
expires_at	string($date-time)
title: Expires at
readOnly: true
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
 
}
NotificationTemplate{
id	integer
title: ID
readOnly: true
name*	string
title: Name
maxLength: 100
minLength: 1
description	string
title: Description
subject*	string
title: Subject
maxLength: 255
minLength: 1
email_body*	string
title: Email body
minLength: 1
sms_body	string
title: Sms body
push_body	string
title: Push body
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
 
}
ContractorServiceCategory{
id	integer
title: ID
readOnly: true
name*	string
title: Name
maxLength: 100
minLength: 1
description	string
title: Description
created_at	string($date-time)
title: Created at
readOnly: true
 
}
ContractorPortfolio{
id	integer
title: ID
readOnly: true
title*	string
title: Title
maxLength: 255
minLength: 1
description*	string
title: Description
minLength: 1
image	string($uri)
title: Image
readOnly: true
completion_date	string($date)
title: Completion date
x-nullable: true
created_at	string($date-time)
title: Created at
readOnly: true
 
}
ContractorReview{
id	integer
title: ID
readOnly: true
client	integer
title: Client
readOnly: true
client_name	string
title: Client name
readOnly: true
rating*	integer
title: Rating
Enum:
Array [ 5 ]
comment*	string
title: Comment
minLength: 1
is_verified	boolean
title: Is verified
readOnly: true
created_at	string($date-time)
title: Created at
readOnly: true
 
}
ContractorProfile{
id	integer
title: ID
readOnly: true
user	User{
id	IDinteger
title: ID
readOnly: true
email*	Email addressstring($email)
title: Email address
maxLength: 254
minLength: 1
name*	Full namestring
title: Full name
maxLength: 150
minLength: 1
phone_number	Phone numberstring
title: Phone number
maxLength: 20
role	Rolestring
title: Role
Enum:
Array [ 5 ]
is_verified	Is verifiedboolean
title: Is verified
readOnly: true
date_joined	Date joinedstring($date-time)
title: Date joined
readOnly: true
 
}
business_name*	string
title: Business name
maxLength: 255
minLength: 1
business_description	string
title: Business description
years_of_experience	integer
title: Years of experience
maximum: 2147483647
minimum: 0
license_number	string
title: License number
maxLength: 100
insurance_info	string
title: Insurance info
maxLength: 255
service_radius	integer
title: Service radius
maximum: 2147483647
minimum: 0
Service radius in miles

profile_image	string($uri)
title: Profile image
readOnly: true
x-nullable: true
is_onboarded	boolean
title: Is onboarded
readOnly: true
service_categories	[
readOnly: true
ContractorServiceCategory{
id	ID[...]
name*	Name[...]
description	Description[...]
created_at	Created at[...]
 
}]
portfolio_items	[
readOnly: true
ContractorPortfolio{
id	ID[...]
title*	Title[...]
description*	Description[...]
image	Image[...]
completion_date	Completion date[...]
created_at	Created at[...]
 
}]
reviews	[
readOnly: true
ContractorReview{
id	ID[...]
client	Client[...]
client_name	Client name[...]
rating*	Rating[...]
comment*	Comment[...]
is_verified	Is verified[...]
created_at	Created at[...]
 
}]
average_rating	string
title: Average rating
readOnly: true
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
 
}
Payment{
id	integer
title: ID
readOnly: true
client	User{
id	IDinteger
title: ID
readOnly: true
email*	Email addressstring($email)
title: Email address
maxLength: 254
minLength: 1
name*	Full namestring
title: Full name
maxLength: 150
minLength: 1
phone_number	Phone numberstring
title: Phone number
maxLength: 20
role	Rolestring
title: Role
Enum:
Array [ 5 ]
is_verified	Is verifiedboolean
title: Is verified
readOnly: true
date_joined	Date joinedstring($date-time)
title: Date joined
readOnly: true
 
}
contractor	ContractorProfile{
id	IDinteger
title: ID
readOnly: true
user	User{
id	ID[...]
email*	Email address[...]
name*	Full name[...]
phone_number	Phone number[...]
role	Role[...]
is_verified	Is verified[...]
date_joined	Date joined[...]
 
}
business_name*	Business namestring
title: Business name
maxLength: 255
minLength: 1
business_description	Business descriptionstring
title: Business description
years_of_experience	Years of experienceinteger
title: Years of experience
maximum: 2147483647
minimum: 0
license_number	License numberstring
title: License number
maxLength: 100
insurance_info	Insurance infostring
title: Insurance info
maxLength: 255
service_radius	Service radiusinteger
title: Service radius
maximum: 2147483647
minimum: 0
Service radius in miles

profile_image	Profile imagestring($uri)
title: Profile image
readOnly: true
x-nullable: true
is_onboarded	Is onboardedboolean
title: Is onboarded
readOnly: true
service_categories	[
readOnly: true
ContractorServiceCategory{...}]
portfolio_items	[
readOnly: true
ContractorPortfolio{...}]
reviews	[
readOnly: true
ContractorReview{...}]
average_rating	Average ratingstring
title: Average rating
readOnly: true
created_at	Created atstring($date-time)
title: Created at
readOnly: true
updated_at	Updated atstring($date-time)
title: Updated at
readOnly: true
 
}
amount*	string($decimal)
title: Amount
description*	string
title: Description
minLength: 1
status	string
title: Status
Enum:
Array [ 5 ]
stripe_payment_intent_id	string
title: Stripe payment intent id
readOnly: true
minLength: 1
x-nullable: true
stripe_transfer_id	string
title: Stripe transfer id
readOnly: true
minLength: 1
x-nullable: true
completed_at	string($date-time)
title: Completed at
readOnly: true
x-nullable: true
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
 
}
AppointmentNote{
id	integer
title: ID
readOnly: true
appointment*	integer
title: Appointment
user	User{
id	IDinteger
title: ID
readOnly: true
email*	Email addressstring($email)
title: Email address
maxLength: 254
minLength: 1
name*	Full namestring
title: Full name
maxLength: 150
minLength: 1
phone_number	Phone numberstring
title: Phone number
maxLength: 20
role	Rolestring
title: Role
Enum:
Array [ 5 ]
is_verified	Is verifiedboolean
title: Is verified
readOnly: true
date_joined	Date joinedstring($date-time)
title: Date joined
readOnly: true
 
}
note*	string
title: Note
minLength: 1
is_private	boolean
title: Is private
created_at	string($date-time)
title: Created at
readOnly: true
 
}
Appointment{
id	integer
title: ID
readOnly: true
client	User{
id	IDinteger
title: ID
readOnly: true
email*	Email addressstring($email)
title: Email address
maxLength: 254
minLength: 1
name*	Full namestring
title: Full name
maxLength: 150
minLength: 1
phone_number	Phone numberstring
title: Phone number
maxLength: 20
role	Rolestring
title: Role
Enum:
Array [ 5 ]
is_verified	Is verifiedboolean
title: Is verified
readOnly: true
date_joined	Date joinedstring($date-time)
title: Date joined
readOnly: true
 
}
contractor	ContractorProfile{
id	IDinteger
title: ID
readOnly: true
user	User{
id	ID[...]
email*	Email address[...]
name*	Full name[...]
phone_number	Phone number[...]
role	Role[...]
is_verified	Is verified[...]
date_joined	Date joined[...]
 
}
business_name*	Business namestring
title: Business name
maxLength: 255
minLength: 1
business_description	Business descriptionstring
title: Business description
years_of_experience	Years of experienceinteger
title: Years of experience
maximum: 2147483647
minimum: 0
license_number	License numberstring
title: License number
maxLength: 100
insurance_info	Insurance infostring
title: Insurance info
maxLength: 255
service_radius	Service radiusinteger
title: Service radius
maximum: 2147483647
minimum: 0
Service radius in miles

profile_image	Profile imagestring($uri)
title: Profile image
readOnly: true
x-nullable: true
is_onboarded	Is onboardedboolean
title: Is onboarded
readOnly: true
service_categories	[
readOnly: true
ContractorServiceCategory{...}]
portfolio_items	[
readOnly: true
ContractorPortfolio{...}]
reviews	[
readOnly: true
ContractorReview{...}]
average_rating	Average ratingstring
title: Average rating
readOnly: true
created_at	Created atstring($date-time)
title: Created at
readOnly: true
updated_at	Updated atstring($date-time)
title: Updated at
readOnly: true
 
}
service_category	ContractorServiceCategory{
id	IDinteger
title: ID
readOnly: true
name*	Namestring
title: Name
maxLength: 100
minLength: 1
description	Descriptionstring
title: Description
created_at	Created atstring($date-time)
title: Created at
readOnly: true
 
}
appointment_date*	string($date)
title: Appointment date
start_time*	string
title: Start time
end_time*	string
title: End time
status	string
title: Status
Enum:
Array [ 5 ]
status_display	string
title: Status display
readOnly: true
minLength: 1
notes	[
readOnly: true
AppointmentNote{
id	ID[...]
appointment*	Appointment[...]
user	User{...}
note*	Note[...]
is_private	Is private[...]
created_at	Created at[...]
 
}]
location*	string
title: Location
maxLength: 255
minLength: 1
estimated_cost	string($decimal)
title: Estimated cost
x-nullable: true
created_at	string($date-time)
title: Created at
readOnly: true
updated_at	string($date-time)
title: Updated at
readOnly: true
 
}
AppointmentCreate{
contractor*	integer
title: Contractor
service_category	integer
title: Service category
x-nullable: true
appointment_date*	string($date)
title: Appointment date
start_time*	string
title: Start time
end_time*	string
title: End time
notes	string
title: Notes
location*	string
title: Location
maxLength: 255
minLength: 1
estimated_cost	string($decimal)
title: Estimated cost
x-nullable: true
 
}
AppointmentUpdate{
status	string
title: Status
Enum:
Array [ 5 ]
appointment_date*	string($date)
title: Appointment date
start_time*	string
title: Start time
end_time*	string
title: End time
notes	string
title: Notes
location*	string
title: Location
maxLength: 255
minLength: 1
estimated_cost	string($decimal)
title: Estimated cost
x-nullable: true
 
}
AvailabilitySlot{
id	integer
title: ID
readOnly: true
contractor*	integer
title: Contractor
day_of_week*	integer
title: Day of week
Enum:
Array [ 7 ]
day_name	string
title: Day name
readOnly: true
start_time*	string
title: Start time
end_time*	string
title: End time
is_recurring	boolean
title: Is recurring
 
}
UnavailableDate{
id	integer
title: ID
readOnly: true
contractor*	integer
title: Contractor
date*	string($date)
title: Date
reason	string
title: Reason
maxLength: 255
 
}
AdminUserUpdate{
name*	string
title: Full name
maxLength: 150
minLength: 1
phone_number	string
title: Phone number
maxLength: 20
role	string
title: Role
Enum:
Array [ 5 ]
is_verified	boolean
title: Is verified
is_active	boolean
title: Active
Designates whether this user should be treated as active. Unselect this instead of deleting accounts.

 
}
PasswordChange{
old_password*	string
title: Old password
minLength: 1
new_password*	string
title: New password
minLength: 1
new_password2*	string
title: New password2
minLength: 1
 
}
UserUpdate{
name*	string
title: Full name
maxLength: 150
minLength: 1
phone_number*	string
title: Phone number
maxLength: 20
 
}
UserRegistration{
email*	string($email)
title: Email address
maxLength: 254
minLength: 1
name*	string
title: Full name
maxLength: 150
minLength: 1
phone_number*	string
title: Phone number
maxLength: 20
role*	string
title: Role
Enum:
Array [ 5 ]
password*	string
title: Password
minLength: 1
password2*	string
title: Password2
minLength: 1
 
}
TokenObtainPair{
email*	string
title: Email
minLength: 1
password*	string
title: Password
minLength: 1
 
}
TokenRefresh{
refresh*	string
title: Refresh
minLength: 1
access	string
title: Access
readOnly: true
minLength: 1
 
}
TokenVerify{
token*	string
title: Token
minLength: 1
 
}



import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { messagingService, alistProsService } from '../services/api';
import { 
  FaInbox, 
  FaUserCircle, 
  FaPaperPlane, 
  FaEllipsisV, 
  FaSearch, 
  FaPaperclip, 
  FaRegSmile,
  FaArrowLeft,
  FaComments,
  FaPhone,
  FaVideo,
  FaBell,
  FaCircle,
  FaCheckCircle,
  FaCheck,
  FaClock,
  FaSyncAlt,
  FaUserTag,
  FaStar,
  FaShieldAlt,
  FaTimes,
  FaFileContract,
  FaDollarSign,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBusinessTime
} from 'react-icons/fa';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const [participantsInfo, setParticipantsInfo] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Refs
  const messageEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Auto-refresh interval (30 seconds)
  const POLLING_INTERVAL = 30000;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/messages');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch conversations on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Handle conversation selection from URL parameter
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === parseInt(conversationId));
      if (conversation && (!activeConversation || activeConversation.id !== conversation.id)) {
        setActiveConversation(conversation);
        fetchMessages(conversation.id);
      }
    } else if (conversations.length > 0 && !activeConversation) {
      const firstConversation = conversations[0];
      setActiveConversation(firstConversation);
      navigate(`/dashboard/messages/${firstConversation.id}`, { replace: true });
      fetchMessages(firstConversation.id);
    }
  }, [conversationId, conversations, activeConversation?.id, navigate]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Setup auto-refresh polling
  useEffect(() => {
    if (isAuthenticated && activeConversation) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isAuthenticated, activeConversation?.id]);

  const startPolling = useCallback(() => {
    stopPolling();
    
    pollingIntervalRef.current = setInterval(() => {
      if (activeConversation && !messagesLoading && !sending) {
        checkForNewMessages();
      }
    }, POLLING_INTERVAL);
  }, [activeConversation?.id, messagesLoading, sending]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const checkForNewMessages = useCallback(async () => {
    if (!activeConversation) return;

    try {
      const response = await messagingService.getMessages(activeConversation.id);
      const newMessagesData = response.data.results || [];
      
      if (newMessagesData.length !== messages.length) {
        setMessages(newMessagesData);
        setLastFetchTime(Date.now());
        
        try {
          await messagingService.markConversationAsRead(activeConversation.id);
          updateConversationReadStatus(activeConversation.id);
        } catch (markReadErr) {
          console.error('Error marking conversation as read:', markReadErr);
        }
      }
      
      await fetchConversationsQuietly();
      
    } catch (err) {
      console.error('Error checking for new messages:', err);
    }
  }, [activeConversation?.id, messages.length]);

  const fetchConversationsQuietly = useCallback(async () => {
    try {
      const response = await messagingService.getConversations();
      const conversationsData = response.data.results || [];
      setConversations(conversationsData);
      
      // Fetch participant info for all conversations
      const participantIds = [];
      conversationsData.forEach(conv => {
        if (conv.participants) {
          conv.participants.forEach(p => {
            if (p.id !== currentUser?.id && !participantIds.includes(p.id)) {
              participantIds.push(p.id);
            }
          });
        }
      });
      
      // Fetch participant details
      participantIds.forEach(participantId => {
        fetchParticipantInfo(participantId);
      });
      
    } catch (err) {
      console.error('Error fetching conversations quietly:', err);
    }
  }, [currentUser?.id]);

  const fetchParticipantInfo = useCallback(async (userId) => {
    if (participantsInfo[userId] || !userId) return;
    
    try {
      // Try to get professional profile first
      const response = await alistProsService.getProfileDetail(userId);
      setParticipantsInfo(prev => ({
        ...prev,
        [userId]: {
          ...response.data,
          type: 'professional',
          name: response.data.business_name || 
                `${response.data.user?.first_name || ''} ${response.data.user?.last_name || ''}`.trim() ||
                response.data.user?.name ||
                response.data.user?.email ||
                'Professional',
          profession: response.data.profession || 'Professional Service Provider',
          avatar: response.data.profile_image || response.data.user?.profile_picture,
          rating: response.data.average_rating,
          isVerified: response.data.is_verified,
          totalJobs: response.data.total_jobs || 0,
          phone: response.data.user?.phone_number,
          email: response.data.user?.email
        }
      }));
    } catch (err) {
      // If not a professional, mark as regular user
      setParticipantsInfo(prev => ({
        ...prev,
        [userId]: {
          type: 'client',
          name: 'Client',
          profession: 'Client',
          avatar: null,
          rating: null,
          isVerified: false,
          totalJobs: 0,
          phone: null,
          email: null
        }
      }));
    }
  }, [participantsInfo]);

  const updateConversationReadStatus = useCallback((conversationId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
  }, []);

  const handleManualRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await fetchConversations();
      if (activeConversation) {
        await fetchMessages(activeConversation.id);
      }
    } catch (err) {
      console.error('Error during manual refresh:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, activeConversation?.id]);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await messagingService.getConversations();
      const conversationsData = response.data.results || [];
      setConversations(conversationsData);
      
      // Fetch participant info for all conversations
      const participantIds = [];
      conversationsData.forEach(conv => {
        if (conv.participants) {
          conv.participants.forEach(p => {
            if (p.id !== currentUser?.id && !participantIds.includes(p.id)) {
              participantIds.push(p.id);
            }
          });
        }
      });
      
      // Fetch participant details in parallel but safely
      for (const participantId of participantIds) {
        try {
          await fetchParticipantInfo(participantId);
        } catch (err) {
          console.warn(`Failed to fetch info for participant ${participantId}:`, err);
        }
      }
      
      if (conversationsData.length === 0) {
        setLoading(false);
        return;
      }

      // If we have a specific conversation ID from URL, load it
      if (conversationId) {
        const targetConversation = conversationsData.find(c => c.id === parseInt(conversationId));
        if (targetConversation) {
          setActiveConversation(targetConversation);
          await fetchMessages(targetConversation.id);
        }
      } else if (conversationsData.length > 0 && !activeConversation) {
        // Otherwise load the first conversation
        const firstConversation = conversationsData[0];
        setActiveConversation(firstConversation);
        navigate(`/dashboard/messages/${firstConversation.id}`, { replace: true });
        await fetchMessages(firstConversation.id);
      }
      
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(isArabic ? 'فشل في تحميل المحادثات' : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    
    setMessagesLoading(true);
    
    try {
      const response = await messagingService.getMessages(conversationId);
      const messagesData = response.data.results || [];
      setMessages(messagesData);
      
      // Mark conversation as read
      try {
        await messagingService.markConversationAsRead(conversationId);
        updateConversationReadStatus(conversationId);
      } catch (markReadErr) {
        console.error('Error marking conversation as read:', markReadErr);
      }
      
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(isArabic ? 'فشل في تحميل الرسائل' : 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    if (activeConversation?.id === conversation.id) return;
    
    setActiveConversation(conversation);
    navigate(`/dashboard/messages/${conversation.id}`, { replace: true });
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await messagingService.sendMessage(activeConversation.id, {
        content: messageContent
      });

      const newMessageObj = response.data;
      setMessages(prev => [...prev, newMessageObj]);

      setConversations(prev => 
        prev.map(conv => 
        conv.id === activeConversation.id 
            ? { 
                ...conv, 
                last_message: { 
                  content: messageContent,
                  created_at: newMessageObj.created_at 
                }
              }
          : conv
        )
      );
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError(isArabic ? 'فشل في إرسال الرسالة' : 'Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleCreateQuote = () => {
    // Navigate to quote creation page with conversation context
    if (activeConversation) {
      const otherParticipant = getOtherParticipant(activeConversation);
      if (otherParticipant) {
        navigate(`/pro-dashboard/quotes/create?client=${otherParticipant.id}&conversation=${activeConversation.id}`);
      }
    }
  };

  const handleRequestQuote = () => {
    // Navigate to service request creation with professional context
    if (activeConversation) {
      const otherParticipant = getOtherParticipant(activeConversation);
      if (otherParticipant) {
        navigate(`/dashboard/service-requests/create?professional=${otherParticipant.id}&conversation=${activeConversation.id}`);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return isArabic ? 'أمس' : 'Yesterday';
    }
    
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation.participants) return null;
    return conversation.participants.find(p => p.id !== currentUser?.id);
  };

  const getParticipantName = (conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return isArabic ? 'محادثة' : 'Conversation';
    
    const participantInfo = participantsInfo[otherParticipant.id];
    if (participantInfo) {
      return participantInfo.name;
    }
    
    return `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() ||
           otherParticipant.name ||
           otherParticipant.email || 
           (isArabic ? 'مستخدم' : 'User');
  };

  const getParticipantDetails = (conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return null;
    
    const participantInfo = participantsInfo[otherParticipant.id];
    if (participantInfo) {
      return participantInfo;
    }
    
    return {
      name: `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() ||
            otherParticipant.name ||
            (isArabic ? 'مستخدم' : 'User'),
      profession: isArabic ? 'مستخدم' : 'User',
      type: 'client',
      rating: null,
      isVerified: false,
      avatar: otherParticipant.profile_picture,
      phone: otherParticipant.phone_number,
      email: otherParticipant.email,
      totalJobs: 0
    };
  };

  const filteredConversations = conversations.filter(conversation => {
    const participantName = getParticipantName(conversation);
    const lastMessageContent = conversation.last_message?.content || '';
    const searchLower = searchTerm.toLowerCase();
    
    return participantName.toLowerCase().includes(searchLower) ||
           lastMessageContent.toLowerCase().includes(searchLower);
  });

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
        <title>{isArabic ? 'الرسائل | A-List Home Pros' : 'Messages | A-List Home Pros'}</title>
      </Helmet>

      <div className="h-screen flex bg-gray-100">
        {/* Conversations Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {isArabic ? 'الرسائل' : 'Messages'}
              </h1>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                  title={isArabic ? 'تحديث الرسائل' : 'Refresh messages'}
                >
                  <FaSyncAlt className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  to="/dashboard"
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
                  title={isArabic ? 'العودة للوحة التحكم' : 'Back to dashboard'}
                >
                  <FaArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-xs text-gray-500">
                <FaCircle className="h-2 w-2 text-green-500 mr-1 animate-pulse" />
                <span>{isArabic ? 'تحديث تلقائي' : 'Auto-refresh'}</span>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(lastFetchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={isArabic ? 'البحث في المحادثات...' : 'Search conversations...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <FaComments className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {isArabic ? 'لا توجد محادثات' : 'No conversations'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map(conversation => {
                  const participantDetails = getParticipantDetails(conversation);
                  
                  return (
                    <motion.div
                      key={conversation.id}
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 cursor-pointer transition-colors ${
                        activeConversation?.id === conversation.id 
                          ? 'bg-blue-50 border-r-2 border-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 relative">
                          {participantDetails?.avatar ? (
                            <img
                              src={participantDetails.avatar}
                              alt={participantDetails.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <FaUserCircle className="h-12 w-12 text-gray-400" />
                          )}
                          {conversation.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unread_count}
                            </span>
                          )}
                          {participantDetails?.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                              <FaShieldAlt className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col flex-1">
                              <div className="flex items-center">
                                <h3 className="text-sm font-medium text-gray-900 truncate mr-2">
                                  {participantDetails?.name || getParticipantName(conversation)}
                                </h3>
                                {participantDetails?.isVerified && (
                                  <FaCheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                )}
                                {participantDetails?.rating && (
                                  <div className="flex items-center ml-2">
                                    <FaStar className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs text-gray-600 ml-1">{participantDetails.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {participantDetails?.profession}
                                {participantDetails?.totalJobs > 0 && (
                                  <span className="ml-2">• {participantDetails.totalJobs} {isArabic ? 'مهمة' : 'jobs'}</span>
                                )}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(conversation.last_message?.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.last_message?.content || (isArabic ? 'لا توجد رسائل' : 'No messages')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
            
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {(() => {
                      const participantDetails = getParticipantDetails(activeConversation);
                      return (
                        <>
                          <div className="relative mr-3">
                            {participantDetails?.avatar ? (
                              <img
                                src={participantDetails.avatar}
                                alt={participantDetails.name}
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <FaUserCircle className="h-12 w-12 text-gray-400" />
                            )}
                            {participantDetails?.isVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                <FaShieldAlt className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h2 className="text-lg font-semibold text-gray-900 mr-2">
                                {participantDetails?.name || getParticipantName(activeConversation)}
                              </h2>
                              {participantDetails?.isVerified && (
                                <FaCheckCircle className="h-4 w-4 text-blue-500" title={isArabic ? 'محقق' : 'Verified'} />
                              )}
                              {participantDetails?.rating && (
                                <div className="flex items-center mr-2">
                                  <FaStar className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-sm text-gray-600">{participantDetails.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FaUserTag className="h-3 w-3 mr-1" />
                              <span>{participantDetails?.profession}</span>
                              {participantDetails?.totalJobs > 0 && (
                                <span className="ml-2">• {participantDetails.totalJobs} {isArabic ? 'مهمة مكتملة' : 'completed jobs'}</span>
                              )}
                              {participantDetails?.phone && (
                                <span className="ml-2">• {participantDetails.phone}</span>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex space-x-2">
                    {/* Action buttons based on user role */}
                    {currentUser?.role === 'contractor' || currentUser?.role === 'specialist' || currentUser?.role === 'crew' ? (
                      // Professional actions
                      <button
                        onClick={handleCreateQuote}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        title={isArabic ? 'إنشاء عرض سعر' : 'Create Quote'}
                      >
                        <FaFileContract className="h-4 w-4 mr-2" />
                        <span>{isArabic ? 'عرض سعر' : 'Quote'}</span>
                      </button>
                    ) : (
                      // Client actions
                      <button
                        onClick={handleRequestQuote}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        title={isArabic ? 'طلب خدمة' : 'Request Service'}
                      >
                        <FaBusinessTime className="h-4 w-4 mr-2" />
                        <span>{isArabic ? 'طلب خدمة' : 'Request Service'}</span>
                      </button>
                    )}
                    
                    {(() => {
                      const participantDetails = getParticipantDetails(activeConversation);
                      return (
                        <>
                          {participantDetails?.phone && (
                            <a
                              href={`tel:${participantDetails.phone}`}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                              title={isArabic ? 'اتصال هاتفي' : 'Phone call'}
                            >
                              <FaPhone className="h-5 w-5" />
                            </a>
                          )}
                        </>
                      );
                    })()}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <FaVideo className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <FaEllipsisV className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
                  
              {/* Messages Area */}
              <div 
                ref={chatWindowRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              >
                {messagesLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComments className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">
                      {isArabic ? 'ابدأ المحادثة بإرسال رسالة' : 'Start the conversation by sending a message'}
                    </p>
                    <div className="flex justify-center space-x-4">
                      {currentUser?.role === 'contractor' || currentUser?.role === 'specialist' || currentUser?.role === 'crew' ? (
                        <button
                          onClick={handleCreateQuote}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FaFileContract className="h-4 w-4 mr-2" />
                          <span>{isArabic ? 'إنشاء عرض سعر' : 'Create Quote'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleRequestQuote}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaBusinessTime className="h-4 w-4 mr-2" />
                          <span>{isArabic ? 'طلب خدمة' : 'Request Service'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isCurrentUserMessage = message.sender?.id === currentUser?.id;
                      const senderInfo = participantsInfo[message.sender?.id];
                      const senderName = senderInfo?.name || 
                                       `${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`.trim() ||
                                       message.sender?.name ||
                                       message.sender?.email ||
                                       (isArabic ? 'مستخدم' : 'User');
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          {!isCurrentUserMessage && (
                            <div className="flex-shrink-0 mr-3">
                              {senderInfo?.avatar ? (
                                <img
                                  src={senderInfo.avatar}
                                  alt={senderName}
                                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <FaUserCircle className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                          )}
                          
                          <div className={`max-w-xs lg:max-w-md ${isCurrentUserMessage ? 'text-right' : 'text-left'}`}>
                            {!isCurrentUserMessage && (
                              <div className="flex items-center mb-1">
                                <span className="text-xs font-medium text-gray-700 mr-2">
                                  {senderName}
                                </span>
                                {senderInfo?.isVerified && (
                                  <FaCheckCircle className="h-3 w-3 text-blue-500" title={isArabic ? 'محقق' : 'Verified'} />
                                )}
                                {senderInfo?.profession && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    • {senderInfo.profession}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className={`px-4 py-3 rounded-2xl shadow-sm border ${
                              isCurrentUserMessage
                                ? 'bg-blue-600 text-white border-blue-600 rounded-br-md'
                                : 'bg-white text-gray-900 border-gray-200 rounded-bl-md'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            
                            <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                              isCurrentUserMessage ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{formatTimestamp(message.created_at)}</span>
                              {isCurrentUserMessage && (
                                <div className="ml-2 flex items-center">
                                  {message.is_read ? (
                                    <FaCheckCircle className="h-3 w-3 text-blue-500" title={isArabic ? 'تم القراءة' : 'Read'} />
                                  ) : (
                                    <FaCheck className="h-3 w-3 text-gray-400" title={isArabic ? 'تم الإرسال' : 'Sent'} />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {isCurrentUserMessage && (
                            <div className="flex-shrink-0 ml-3">
                              {currentUser?.profile_picture ? (
                                <img
                                  src={currentUser.profile_picture}
                                  alt={currentUser.name || currentUser.email}
                                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <FaUserCircle className="h-8 w-8 text-blue-500" />
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={messageEndRef} />
              </div>
                  
              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button 
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <FaPaperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isArabic ? 'اكتب رسالة...' : 'Type a message...'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                      disabled={sending}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaRegSmile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <FaPaperPlane className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FaComments className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isArabic ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
                </h3>
                <p className="text-gray-500">
                  {isArabic 
                    ? 'اختر محادثة من القائمة للبدء في المراسلة'
                    : 'Choose a conversation from the list to start messaging'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Toast */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center">
              <span className="mr-2">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-white hover:text-gray-200"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default MessagesPage; 