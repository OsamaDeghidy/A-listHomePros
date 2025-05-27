# قائمة شاملة بنقاط نهاية API في مشروع A-List Home Pros

## ملاحظات التوافق مع الواجهة الأمامية

لضمان التوافق مع الكود الموجود في الواجهة الأمامية، تم إنشاء عدة أسماء بديلة للخدمات:

| الاسم الأصلي | الاسم البديل للتوافق | الغرض |
|--------------|---------------------|--------|
| `proService` | `alistProsService` | خدمات مقدمي الخدمات والملفات الشخصية |
| `bookingService` | `schedulingService` | خدمات الحجز والمواعيد |
| `paymentService` | `paymentsService` | خدمات المدفوعات والمعاملات المالية |
| `notificationService` | `notificationsService` | خدمات الإشعارات |

هذه الأسماء البديلة تمثل نفس الخدمات الأصلية مع بعض التخصيصات لضمان التوافق مع الكود الموجود.

## 1. نظام المصادقة وإدارة المستخدمين (Users API)

### 1.1 مصادقة المستخدمين (Authentication)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر |
|-------|----------|--------------|--------------|----------------|------|--------|
| تسجيل الدخول والحصول على رمز JWT | POST | `/api/users/token/` | `email`, `password` | - | عام | `users.views.CustomTokenObtainPairView` |
| تحديث رمز JWT | POST | `/api/users/token/refresh/` | `refresh` | - | عام | `rest_framework_simplejwt.views.TokenRefreshView` |
| التحقق من صحة رمز JWT | POST | `/api/users/token/verify/` | `token` | - | عام | `rest_framework_simplejwt.views.TokenVerifyView` |
| تسجيل حساب جديد | POST | `/api/users/register/` | `email`, `password`, `name`, `phone_number` | `role` | عام | `users.views.RegisterView` |

### 1.2 إدارة الملف الشخصي للمستخدم (User Profile)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر |
|-------|----------|--------------|--------------|----------------|------|--------|
| الحصول على بيانات الملف الشخصي | GET | `/api/users/profile/` | - | - | مصادقة | `users.views.UserProfileView` |
| تحديث بيانات الملف الشخصي | PUT | `/api/users/profile/` | - | `name`, `phone_number`, `address`, `avatar` | مصادقة | `users.views.UserProfileView` |
| تحديث بيانات الملف الشخصي (جزئي) | PATCH | `/api/users/profile/` | - | `name`, `phone_number`, `address`, `avatar` | مصادقة | `users.views.UserProfileView` |
| تغيير كلمة المرور | POST | `/api/users/change-password/` | `old_password`, `new_password` | - | مصادقة | `users.urls` |
| إعادة تعيين كلمة المرور | POST | `/api/users/reset-password/` | `email` | - | عام | `users.urls` |
| التحقق من رمز إعادة تعيين كلمة المرور | POST | `/api/users/verify-reset-token/` | `token` | - | عام | `users.urls` |
| تعيين كلمة مرور جديدة | POST | `/api/users/set-new-password/` | `token`, `password` | - | عام | `users.urls` |
| التحقق من البريد الإلكتروني | POST | `/api/users/verify-email/` | `token` | - | مصادقة | `users.urls` |

## 2. الخدمات ومقدمي الخدمات (A-List Home Pros API)

### 2.1 فئات الخدمات (Service Categories)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر |
|-------|----------|--------------|--------------|----------------|------|--------|
| قائمة فئات الخدمات | GET | `/api/alistpros/categories/` | - | `popular`, `limit` | عام | `alistpros_profiles.views.ServiceCategoryListView` |
| تفاصيل فئة خدمة معينة | GET | `/api/alistpros/categories/{id}/` | `id` | - | عام | `alistpros_profiles.urls` |
| الخدمات في فئة معينة | GET | `/api/alistpros/categories/{id}/services/` | `id` | - | عام | `alistpros_profiles.urls` |

### 2.2 مقدمي الخدمات (Professionals Profiles)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| البحث عن مقدمي الخدمات | GET | `/api/alistpros/profiles/` | - | `service`, `location`, `rating`, `price_range`, `is_verified`, `featured`, `limit` | عام | `alistpros_profiles.views.AListHomeProProfileViewSet` | `proService.getProfiles` أو `alistProsService.getProfiles` |
| مقدمي الخدمات المميزين | GET | `/api/alistpros/profiles/` | - | `featured=true`, `limit` | عام | `alistpros_profiles.views.AListHomeProProfileViewSet` | `proService.getFeaturedPros` |
| تفاصيل مقدم خدمة محدد | GET | `/api/alistpros/profiles/{id}/` | `id` | - | عام | `alistpros_profiles.views.AListHomeProProfileViewSet` | `proService.getProfile` أو `alistProsService.getProfile` |
| تقييمات مقدم الخدمة | GET | `/api/alistpros/profiles/{id}/reviews/` | `id` | - | عام | `alistpros_profiles.urls` | `proService.getReviews` أو `alistProsService.getReviews` |
| إضافة تقييم لمقدم خدمة | POST | `/api/alistpros/profiles/{id}/reviews/` | `id`, `rating`, `comment` | `is_anonymous` | مصادقة | `alistpros_profiles.urls` | `proService.submitReview` |
| خدمات مقدم الخدمة | GET | `/api/alistpros/profiles/{id}/services/` | `id` | - | عام | `alistpros_profiles.urls` | `serviceService.getServicesByPro` |
| تحديث بيانات مقدم الخدمة | PUT | `/api/alistpros/profiles/{id}/` | `id` | `business_name`, `description`, `service_categories`, `years_in_business`, `service_area` | مصادقة (صاحب الملف) | `alistpros_profiles.views.AListHomeProProfileViewSet` | - |
| تحديث الملف الشخصي الخاص بي | PATCH | `/api/alistpros/my-profile/` | - | `business_name`, `description`, `service_categories`, `years_in_business`, `service_area` | مصادقة | `alistpros_profiles.urls` | `proService.updateProProfile` |
| التسجيل كمقدم خدمة | POST | `/api/alistpros/become-pro/` | `business_name`, `description`, `services` | `service_categories` | مصادقة | `alistpros_profiles.urls` | `proService.becomeAPro` |

## 3. الحجوزات والمواعيد (Scheduling API)

### 3.1 إدارة المواعيد (Appointments)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| قائمة المواعيد | GET | `/api/scheduling/appointments/` | - | `contractor`, `client`, `appointment_date`, `status` | مصادقة | `scheduling.views.AppointmentViewSet` | `bookingService.getUserBookings` أو `schedulingService.getUserBookings` |
| تفاصيل موعد محدد | GET | `/api/scheduling/appointments/{id}/` | `id` | - | مصادقة | `scheduling.views.AppointmentViewSet` | `bookingService.getBookingDetails` |
| إنشاء موعد جديد | POST | `/api/scheduling/appointments/` | `contractor_profile`, `date_time`, `service_description` | `duration_minutes`, `notes`, `location` | مصادقة | `scheduling.views.AppointmentViewSet` | `bookingService.createBooking` أو `schedulingService.createAppointment` |
| تحديث موعد | PUT | `/api/scheduling/appointments/{id}/` | `id` | `date_time`, `service_description`, `duration_minutes`, `notes`, `location` | مصادقة (صاحب الموعد) | `scheduling.views.AppointmentViewSet` | - |
| إلغاء موعد | POST | `/api/scheduling/appointments/{id}/cancel/` | `id` | `reason` | مصادقة (صاحب الموعد) | `scheduling.views.AppointmentViewSet` | `bookingService.cancelBooking` أو `schedulingService.cancelAppointment` |
| تأكيد موعد | POST | `/api/scheduling/appointments/{id}/confirm/` | `id` | - | مصادقة (صاحب الموعد) | `scheduling.views.AppointmentViewSet` | `schedulingService.confirmAppointment` |
| إكمال موعد | POST | `/api/scheduling/appointments/{id}/complete/` | `id` | - | مصادقة (صاحب الموعد) | `scheduling.views.AppointmentViewSet` | - |
| المواعيد القادمة | GET | `/api/scheduling/appointments/upcoming/` | - | - | مصادقة | `scheduling.views.AppointmentViewSet` | - |
| إعادة جدولة موعد | POST | `/api/scheduling/appointments/{id}/reschedule/` | `id`, `date_time` | `reason` | مصادقة (صاحب الموعد) | `scheduling.views.AppointmentViewSet` | `bookingService.rescheduleBooking` |

### 3.2 إدارة الأوقات المتاحة (Availability)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| الحصول على الأوقات المتاحة لمقدم الخدمة | GET | `/api/scheduling/availability/` | `pro_id` | `date` | عام | `scheduling.urls` | `bookingService.getAvailableSlots` أو `schedulingService.getAvailability` |
| أوقات عمل مقدم الخدمة | GET | `/api/scheduling/availability-slots/` | `contractor` | `day_of_week`, `is_recurring` | مصادقة | `scheduling.views.AvailabilitySlotViewSet` | - |
| إضافة أوقات عمل جديدة | POST | `/api/scheduling/availability-slots/` | `contractor`, `day_of_week`, `start_time`, `end_time` | `is_recurring` | مصادقة (صاحب الملف) | `scheduling.views.AvailabilitySlotViewSet` | - |
| الأوقات غير المتاحة | GET | `/api/scheduling/unavailable-dates/` | `contractor` | `date` | مصادقة | `scheduling.views.UnavailableDateViewSet` | - |
| إضافة وقت غير متاح | POST | `/api/scheduling/unavailable-dates/` | `contractor`, `date` | `reason` | مصادقة (صاحب الملف) | `scheduling.views.UnavailableDateViewSet` | - |

## 4. المدفوعات (Payments API)

### 4.1 وسائل الدفع (Payment Methods)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| قائمة وسائل الدفع | GET | `/api/payments/methods/` | - | - | مصادقة | `payments.urls` | `paymentService.getPaymentMethods` أو `paymentsService.getPaymentMethods` |
| إضافة وسيلة دفع جديدة | POST | `/api/payments/methods/` | `card_number`, `expiry_month`, `expiry_year`, `cvc` | `name_on_card` | مصادقة | `payments.urls` | `paymentService.addPaymentMethod` |
| تعيين وسيلة دفع افتراضية | POST | `/api/payments/methods/{id}/default/` | `id` | - | مصادقة | `payments.urls` | `paymentService.setDefaultPaymentMethod` |
| حذف وسيلة دفع | DELETE | `/api/payments/methods/{id}/` | `id` | - | مصادقة | `payments.urls` | `paymentService.deletePaymentMethod` |

### 4.2 المعاملات المالية (Transactions)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| قائمة المعاملات المالية | GET | `/api/payments/transactions/` | - | `status`, `type`, `date` | مصادقة | `payments.urls` | `paymentService.getTransactionHistory` |
| إنشاء قصد دفع | POST | `/api/payments/create-intent/` | `appointment_id`, `amount`, `currency`, `payment_method` | - | مصادقة | `payments.urls` | `paymentService.createPaymentIntent` أو `paymentsService.createPaymentIntent` |
| تفاصيل معاملة مالية | GET | `/api/payments/transactions/{id}/` | `id` | - | مصادقة | `payments.urls` | `paymentService.getTransactionDetails` |
| استرداد المبلغ | POST | `/api/payments/transactions/{id}/refund/` | `id` | `amount`, `reason` | مصادقة (مدير) | `payments.urls` | - |

## 5. الرسائل (Messaging API)

### 5.1 المحادثات (Conversations)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| قائمة المحادثات | GET | `/api/messaging/conversations/` | - | - | مصادقة | `messaging.views.ConversationViewSet` | `messageService.getConversations` |
| تفاصيل محادثة | GET | `/api/messaging/conversations/{id}/` | `id` | - | مصادقة | `messaging.views.ConversationViewSet` | `messageService.getConversation` |
| إنشاء محادثة جديدة | POST | `/api/messaging/conversations/` | `recipient_id` | `subject` | مصادقة | `messaging.views.ConversationViewSet` | `messageService.startConversation` |
| وضع علامة كمقروءة على محادثة | POST | `/api/messaging/conversations/{id}/read/` | `id` | - | مصادقة | `messaging.urls` | `messageService.markAsRead` |

### 5.2 الرسائل (Messages)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| الحصول على رسائل محادثة | GET | `/api/messaging/conversations/{id}/messages/` | `conversation_id` | `page`, `page_size` | مصادقة | `messaging.views.MessageViewSet` | `messageService.getMessages` |
| إرسال رسالة | POST | `/api/messaging/conversations/{id}/messages/` | `conversation_id`, `content` | `attachment` | مصادقة | `messaging.views.MessageViewSet` | `messageService.sendMessage` |
| وضع علامة كمقروءة على رسالة | PUT | `/api/messaging/messages/{id}/read/` | `id` | - | مصادقة | `messaging.views.MessageViewSet` | `messageService.markMessageAsRead` |
| حذف رسالة | DELETE | `/api/messaging/messages/{id}/` | `id` | - | مصادقة (صاحب الرسالة) | `messaging.views.MessageViewSet` | `messageService.deleteMessage` |
| عدد الرسائل غير المقروءة | GET | `/api/messaging/messages/unread-count/` | - | - | مصادقة | `messaging.urls` | `messageService.getUnreadMessagesCount` |

## 6. الإشعارات (Notifications API)

### 6.1 إدارة الإشعارات (Notifications)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| قائمة الإشعارات | GET | `/api/notifications/notifications/` | - | `is_read`, `type`, `page`, `page_size` | مصادقة | `notifications.views.NotificationViewSet` | `notificationService.getNotifications` أو `notificationsService.getNotifications` |
| وضع علامة كمقروءة على إشعار | PUT | `/api/notifications/notifications/{id}/read/` | `id` | - | مصادقة | `notifications.views.NotificationViewSet` | `notificationService.markAsRead` أو `notificationsService.markAsRead` |
| وضع علامة كمقروءة على جميع الإشعارات | PUT | `/api/notifications/notifications/read_all/` | - | - | مصادقة | `notifications.views.NotificationViewSet` | `notificationService.markAllAsRead` أو `notificationsService.markAllAsRead` |
| عدد الإشعارات غير المقروءة | GET | `/api/notifications/notifications/unread/` | - | - | مصادقة | `notifications.views.NotificationViewSet` | - |

### 6.2 إعدادات الإشعارات (Notification Settings)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| الحصول على إعدادات الإشعارات | GET | `/api/notifications/settings/my_settings/` | - | - | مصادقة | `notifications.views.NotificationSettingViewSet` | `notificationService.getSettings` أو `notificationsService.getSettings` |
| تحديث إعدادات الإشعارات | PATCH | `/api/notifications/settings/update_settings/` | - | `email_notifications`, `sms_notifications`, `push_notifications`, `appointment_reminders`, `messages_notifications`, `marketing_notifications` | مصادقة | `notifications.views.NotificationSettingViewSet` | `notificationService.updateSettings` أو `notificationsService.updateSettings` |

### 6.3 التحقق عبر الرسائل القصيرة (SMS Verification)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر |
|-------|----------|--------------|--------------|----------------|------|--------|
| إرسال رمز التحقق | POST | `/api/notifications/sms-verification/send-verification/` | `phone_number` | - | مصادقة | `notifications.views.SMSVerificationViewSet` |
| التحقق من رقم الهاتف | POST | `/api/notifications/sms-verification/verify-phone/` | `phone_number`, `code` | - | مصادقة | `notifications.views.SMSVerificationViewSet` |

## 7. المدونة (Blog API)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر | الخدمة في الواجهة |
|-------|----------|--------------|--------------|----------------|------|--------|---------------|
| قائمة المقالات | GET | `/api/blog/posts/` | - | `category`, `search`, `featured`, `limit` | عام | `blog.views` | `blogService.getPosts` |
| المقالات المميزة | GET | `/api/blog/posts/` | - | `featured=true`, `limit` | عام | `blog.views` | `blogService.getFeaturedPosts` |
| تفاصيل مقالة | GET | `/api/blog/posts/{id}/` | `id` | - | عام | `blog.views` | `blogService.getPost` |
| فئات المدونة | GET | `/api/blog/categories/` | - | - | عام | `blog.views` | `blogService.getCategories` |
| تعليقات المقالة | GET | `/api/blog/posts/{id}/comments/` | `post_id` | - | عام | `blog.views` | `blogService.getComments` |
| إضافة تعليق | POST | `/api/blog/posts/{id}/comments/` | `post_id`, `content` | `parent_id` | مصادقة | `blog.views` | `blogService.addComment` |

## 8. التحليلات والإحصاءات (Analytics API)

| الوصف | الطريقة | نقطة النهاية | المعلمات المطلوبة | المعلمات الاختيارية | النوع | المصدر |
|-------|----------|--------------|--------------|----------------|------|--------|
| إحصاءات لوحة التحكم | GET | `/api/analytics/dashboard-stats/` | - | `period` | مصادقة | `analytics.urls` |
| إحصاءات المواعيد | GET | `/api/analytics/appointment-stats/` | - | `start_date`, `end_date` | مصادقة | `analytics.urls` |
| إحصاءات المبيعات والإيرادات | GET | `/api/analytics/revenue-stats/` | - | `start_date`, `end_date` | مصادقة | `analytics.urls` |
| تقارير العملاء | GET | `/api/analytics/client-reports/` | - | `start_date`, `end_date` | مصادقة | `analytics.urls` |
| تقارير الخدمات | GET | `/api/analytics/service-reports/` | - | `start_date`, `end_date` | مصادقة | `analytics.urls` | 