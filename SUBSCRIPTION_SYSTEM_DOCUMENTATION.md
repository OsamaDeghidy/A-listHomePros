# A-List Home Pros Subscription System Documentation

## نظرة عامة

تم تطوير نظام اشتراكات شامل لـ A-List Home Pros يدعم ثلاث أنواع من المستخدمين مع خطط متعددة المستويات وتكامل كامل مع Stripe.

## أنواع الاشتراكات

### 1. Home Pro Subscription
- **Basic Plan**: $149.99/month
- **Premium Plan**: $275.00/month

#### المميزات الأساسية:
- وصول غير محدود لطلبات المشاريع
- توظيف وإدارة الفرق
- تقييم ومراجعة العملاء
- خيارات تمويل الأعمال
- دعم الموقع والتسويق
- مزايدة المشاريع المضمونة
- دعم أولوية من متخصصي A-List
- تقرير تحليلات شهري

#### المميزات البريميوم:
- عملاء حصريين (معدل تحويل أعلى)
- تحليلات ورؤى متقدمة
- أدوات تقدير المشاريع بالذكاء الاصطناعي
- وصول مبكر لفرص امتياز A-List
- أصول تسويقية جاهزة
- ترتيب أولوية في نتائج البحث

### 2. Crew Member Subscription
- **Basic Plan**: $89.99/month
- **Premium Plan**: $210.00/month

#### المميزات الأساسية:
- الوصول لجميع الوظائف المحلية
- مرئي لجميع المحترفين والمتخصصين
- طلبات توظيف عند الطلب
- أدوات التدريب وملاحظات المشاريع
- إضافة المحفظة
- تنبيهات نصية للوظائف الجديدة
- خيار الترقية لمحترف بعد استيفاء المؤهلات

#### المميزات البريميوم:
- فرص عمل حصرية
- أولوية في التوظيف
- موارد تدريب متقدمة
- تواصل مباشر مع أفضل المحترفين

### 3. Specialist Subscription
- **Plan**: $59.99/month

#### المميزات:
- إدارة الوظائف من البداية للنهاية
- الوصول للمحترفين والفرق والعملاء
- رفع مقاطع المراجعة وتقارير التقدم
- تنظيم وتعيين الوظائف
- عرض نشاط المزايدة
- نظام رسائل مباشر
- موارد تدريب لتمثيل العملاء

## البنية التقنية

### Models (Django)

#### SubscriptionPlan
```python
class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    tier = models.CharField(max_length=20, choices=PLAN_TIERS)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_price_id = models.CharField(max_length=100, unique=True)
    stripe_product_id = models.CharField(max_length=100)
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
```

#### UserSubscription
```python
class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    stripe_subscription_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
```

#### SubscriptionInvoice
```python
class SubscriptionInvoice(models.Model):
    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE)
    stripe_invoice_id = models.CharField(max_length=100, unique=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
```

#### ProjectCommission
```python
class ProjectCommission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project_value = models.DecimalField(max_digits=10, decimal_places=2)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
```

### API Endpoints

#### Subscription Plans
- `GET /api/payments/subscription-plans/` - قائمة الخطط
- `GET /api/payments/subscription-plans/?plan_type=home_pro` - فلترة حسب النوع

#### User Subscriptions
- `GET /api/payments/subscriptions/current/` - الاشتراك الحالي للمستخدم
- `POST /api/payments/subscriptions/create_checkout_session/` - إنشاء جلسة دفع
- `POST /api/payments/subscriptions/change_plan/` - تغيير الخطة
- `POST /api/payments/subscriptions/cancel_subscription/` - إلغاء الاشتراك

#### Webhooks
- `POST /api/payments/stripe/subscription-webhook/` - معالجة أحداث Stripe

### Frontend Components

#### SubscriptionPlansPage
- عرض جميع خطط الاشتراك
- واجهة مستخدم تفاعلية مع Framer Motion
- دعم اللغة العربية والإنجليزية
- معالجة حالات التحميل والأخطاء

#### SubscriptionSuccessPage
- صفحة تأكيد نجاح الاشتراك
- عرض تفاصيل الخطة المختارة
- إعادة توجيه للوحة التحكم المناسبة

#### SubscriptionService
- خدمة إدارة API calls للاشتراكات
- التحقق من صلاحيات الوصول للمميزات
- إدارة جلسات Stripe Checkout

### Stripe Integration

#### Products & Prices
- كل خطة مرتبطة بـ Product و Price في Stripe
- التسعير بالدولار الأمريكي
- فترة إعادة الفوترة الشهرية

#### Checkout Flow
1. المستخدم يختار خطة
2. إنشاء Stripe Customer (إذا لم يكن موجود)
3. إنشاء Checkout Session
4. إعادة التوجيه لـ Stripe Checkout
5. معالجة webhook بعد الدفع الناجح
6. تفعيل الاشتراك في النظام

#### Webhook Events
- `checkout.session.completed` - إنشاء اشتراك جديد
- `invoice.payment_succeeded` - دفع ناجح
- `invoice.payment_failed` - فشل الدفع
- `customer.subscription.updated` - تحديث الاشتراك
- `customer.subscription.deleted` - حذف الاشتراك

### Feature Access Control

#### hasFeatureAccess Function
```javascript
hasFeatureAccess: (subscription, feature) => {
  if (!subscription || !subscription.is_active) {
    return false;
  }
  
  const planType = subscription.plan.plan_type;
  const tier = subscription.plan.tier;
  
  // Feature access logic based on plan and tier
  return planFeatures.includes(feature);
}
```

#### مميزات Home Pro:
- `view_leads` - عرض العملاء المحتملين
- `hire_crew` - توظيف الفرق
- `rate_clients` - تقييم العملاء
- `exclusive_leads` - عملاء حصريين (Premium only)

#### مميزات Crew:
- `view_jobs` - عرض الوظائف
- `crew_directory` - دليل الفرق
- `exclusive_jobs` - وظائف حصرية (Premium only)

#### مميزات Specialist:
- `manage_jobs` - إدارة الوظائف
- `direct_messaging` - رسائل مباشرة
- `job_documentation` - توثيق الوظائف

### Management Commands

#### create_subscription_plans
```bash
python manage.py create_subscription_plans --create-stripe-products
```

يقوم بـ:
- إنشاء جميع خطط الاشتراك في قاعدة البيانات
- إنشاء Products و Prices في Stripe (اختياري)
- تجنب التكرار للخطط الموجودة

### Admin Interface

#### SubscriptionPlanAdmin
- عرض وإدارة خطط الاشتراك
- معلومات Stripe المدمجة
- إدارة المميزات والأسعار

#### UserSubscriptionAdmin
- متابعة اشتراكات المستخدمين
- عرض حالة الدفع والفترة المتبقية
- ربط مع فواتير Stripe

#### SubscriptionInvoiceAdmin
- إدارة فواتير الاشتراكات
- متابعة المدفوعات والحالات

#### ProjectCommissionAdmin
- إدارة عمولات المشاريع
- نظام رسوم 5-10% على قيمة المشروع

### Security & Validation

#### Webhook Security
- التحقق من توقيع Stripe
- معالجة الأخطاء والاستثناءات
- تسجيل الأحداث للمتابعة

#### User Authentication
- المسارات المحمية للاشتراكات
- التحقق من صلاحيات الوصول
- إعادة التوجيه للتسجيل عند الحاجة

### Testing Strategy

#### Unit Tests
- اختبار models والعلاقات
- اختبار API endpoints
- اختبار feature access logic

#### Integration Tests
- اختبار Stripe webhook handling
- اختبار subscription lifecycle
- اختبار payment processing

#### Frontend Tests
- اختبار subscription components
- اختبار user flows
- اختبار error handling

### Deployment Considerations

#### Environment Variables
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Database Migrations
```bash
python manage.py makemigrations payments
python manage.py migrate
```

#### Initial Data Setup
```bash
python manage.py create_subscription_plans --create-stripe-products
```

### Revenue Tracking

#### Subscription Revenue
- إيرادات شهرية من الاشتراكات
- تتبع معدلات التجديد والإلغاء
- تحليل الأداء حسب نوع الخطة

#### Commission Revenue
- عمولة 5-10% من قيمة المشاريع
- تتبع منفصل عن إيرادات الاشتراكات
- ربط بنظام Escrow

### Future Enhancements

#### Planned Features
- خصومات وعروض ترويجية
- خطط سنوية بخصم
- نظام الإحالة والمكافآت
- تحليلات متقدمة للاشتراكات

#### Scalability
- دعم عملات متعددة
- أسواق جغرافية متعددة
- خطط مخصصة للشركات

### Support & Maintenance

#### Monitoring
- تتبع webhook failures
- مراقبة subscription health
- تنبيهات للمدفوعات الفاشلة

#### Customer Support
- واجهة admin للدعم الفني
- إدارة المبالغ المسترددة
- حل النزاعات

### الخلاصة

تم تطوير نظام اشتراكات شامل يدعم:
- ✅ 3 أنواع مستخدمين مع خطط متعددة
- ✅ تكامل كامل مع Stripe
- ✅ واجهة مستخدم متقدمة
- ✅ نظام صلاحيات للمميزات
- ✅ admin panel متكامل
- ✅ webhook handling آمن
- ✅ دعم ثنائي اللغة
- ✅ تتبع الإيرادات والعمولات

النظام جاهز للإنتاج ويمكن تشغيله بعد إضافة مفاتيح Stripe والتشغيل على الخادم المناسب. 