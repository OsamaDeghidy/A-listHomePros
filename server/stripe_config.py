# Stripe Configuration للحساب: Jwest@alisthp.com
# تعليمات الحصول على مفاتيح Stripe API:

"""
1. اذهب إلى: https://dashboard.stripe.com/login
2. ادخل بهذه البيانات:
   - Email: Jwest@alisthp.com
   - Password: J1983we$t2025

3. بعد تسجيل الدخول:
   - اذهب إلى Developers > API keys
   - انسخ Secret key (يبدأ بـ sk_test_...)
   - انسخ Publishable key (يبدأ بـ pk_test_...)

4. لإعداد Webhooks:
   - اذهب إلى Developers > Webhooks
   - انقر على "Add endpoint"
   - استخدم URL: http://localhost:8000/api/payments/webhook/
   - انسخ Webhook secret (يبدأ بـ whsec_...)

5. ضع هذه المفاتيح في settings.py أو ملف .env:
"""

# مفاتيح Test Mode (للتطوير)
STRIPE_TEST_SECRET_KEY = "sk_test_YOUR_SECRET_KEY_HERE"
STRIPE_TEST_PUBLISHABLE_KEY = "pk_test_YOUR_PUBLISHABLE_KEY_HERE"
STRIPE_TEST_WEBHOOK_SECRET = "whsec_YOUR_WEBHOOK_SECRET_HERE"

# مفاتيح Live Mode (للإنتاج - استخدمها فقط عند الاستعداد)
STRIPE_LIVE_SECRET_KEY = "sk_live_YOUR_LIVE_SECRET_KEY_HERE"
STRIPE_LIVE_PUBLISHABLE_KEY = "pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE"
STRIPE_LIVE_WEBHOOK_SECRET = "whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE"

# إعدادات إضافية للمنصة
PLATFORM_FEE_PERCENTAGE = 0.05  # 5% رسوم المنصة
ESCROW_MINIMUM_AMOUNT = 50      # أقل مبلغ للحساب المضمون 