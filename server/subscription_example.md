# مثال على إدخال خطط الاشتراك في الإدارة

## خطة Home Pro - Basic

### البيانات المطلوبة:
- **Name**: Home Pro Plan - Basic
- **Plan type**: home_pro
- **Tier**: basic  
- **Price**: 149.99
- **Description**: خطة أساسية للمحترفين المنزليين تتضمن عروض أسعار غير محدودة وتقييمات العملاء
- **Features**: 
  ```json
  [
    "Unlimited project leads",
    "Client rating system", 
    "Basic customer support",
    "Profile customization",
    "Basic analytics"
  ]
  ```

### الحقول التي تترك فارغة:
- **Stripe price ID**: يتم ملؤه تلقائياً عند إنشاء المنتج في Stripe
- **Stripe product ID**: يتم ملؤه تلقائياً عند إنشاء المنتج في Stripe

## خطة Home Pro - Premium

### البيانات المطلوبة:
- **Name**: Home Pro Plan - Premium
- **Plan type**: home_pro
- **Tier**: premium
- **Price**: 275.00
- **Description**: خطة مميزة للمحترفين المنزليين مع جميع المميزات المتقدمة
- **Features**:
  ```json
  [
    "Unlimited project leads",
    "Priority lead placement",
    "Advanced client ratings",
    "Premium customer support",
    "Advanced profile customization",
    "Detailed analytics & reports",
    "Marketing tools",
    "Priority customer service"
  ]
  ```

## خطة Crew Member - Basic

### البيانات المطلوبة:
- **Name**: Crew Member Plan - Basic
- **Plan type**: crew
- **Tier**: basic
- **Price**: 89.99
- **Description**: خطة أساسية لأعضاء فرق العمل المعتمدين
- **Features**:
  ```json
  [
    "Job assignment access",
    "Basic crew management",
    "Client communication",
    "Basic support"
  ]
  ```

## خطة Crew Member - Premium

### البيانات المطلوبة:
- **Name**: Crew Member Plan - Premium
- **Plan type**: crew
- **Tier**: premium
- **Price**: 210.00
- **Description**: خطة مميزة لأعضاء فرق العمل مع مميزات متقدمة
- **Features**:
  ```json
  [
    "Priority job assignments",
    "Advanced crew management",
    "Client communication",
    "Premium support",
    "Performance analytics",
    "Training resources"
  ]
  ```

## خطة Specialist

### البيانات المطلوبة:
- **Name**: Specialist Plan
- **Plan type**: specialist
- **Tier**: basic
- **Price**: 59.99
- **Description**: خطة للأخصائيين المعتمدين في مجالات محددة
- **Features**:
  ```json
  [
    "Specialized project access",
    "Expert consultation tools",
    "Client communication",
    "Basic support",
    "Certification display"
  ]
  ```

## ملاحظات مهمة:

1. **لا تملأ حقول Stripe يدوياً** - ستتم تعبئتها تلقائياً عند تشغيل الأمر
2. **Features يجب أن تكون JSON صحيح** - استخدم الصيغة المذكورة أعلاه
3. **الأسعار بالدولار** - لا تضع علامة $
4. **Plan type و Tier يجب أن تكون من القيم المحددة** - انظر للخيارات المتاحة 