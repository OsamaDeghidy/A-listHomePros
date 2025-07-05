# مثال على كيفية عمل نظام فحص المميزات

# 1. في Frontend (React/JavaScript):
"""
// في subscriptionService.js
hasFeatureAccess: (subscription, feature) => {
  if (!subscription || !subscription.is_active) {
    return false;
  }

  const planType = subscription.plan.plan_type;
  const tier = subscription.plan.tier;

  // قائمة المميزات حسب نوع الخطة والمستوى
  const accessRules = {
    // مميزات Home Pro
    home_pro: {
      basic: [
        'view_leads',           // عرض العملاء المحتملين
        'hire_crew',            // توظيف الفرق
        'rate_clients',         // تقييم العملاء
        'business_funding',     // تمويل الأعمال
        'website_support',      // دعم الموقع
        'escrow_bidding',       // مزايدة مضمونة
        'priority_support'      // دعم أولوية
      ],
      premium: [
        'view_leads', 'hire_crew', 'rate_clients', 'business_funding',
        'website_support', 'escrow_bidding', 'priority_support',
        'exclusive_leads',      // عملاء حصريين
        'premium_analytics',    // تحليلات متقدمة
        'ai_estimator',         // مقدر بالذكاء الاصطناعي
        'priority_placement'    // ترتيب أولوية
      ]
    },
    // مميزات Crew
    crew: {
      basic: [
        'view_jobs',            // عرض الوظائف
        'crew_directory',       // دليل الفرق
        'client_reviews',       // مراجعات العملاء
        'training_resources',   // موارد التدريب
        'portfolio_upload',     // رفع المحفظة
        'job_alerts'            // تنبيهات الوظائف
      ],
      premium: [
        'view_jobs', 'crew_directory', 'client_reviews', 
        'training_resources', 'portfolio_upload', 'job_alerts',
        'exclusive_jobs',       // وظائف حصرية
        'priority_hire',        // توظيف أولوية
        'advanced_training'     // تدريب متقدم
      ]
    },
    // مميزات Specialist
    specialist: {
      basic: [
        'manage_jobs',          // إدارة الوظائف
        'direct_messaging',     // رسائل مباشرة
        'job_documentation',    // توثيق الوظائف
        'bidding_visibility',   // رؤية المزايدات
        'walkthrough_upload',   // رفع الجولات
        'conflict_resolution'   // حل النزاعات
      ]
    }
  };

  const planFeatures = accessRules[planType]?.[tier] || [];
  return planFeatures.includes(feature);
}
"""

# 2. استخدام الفحص في المكونات:
"""
// في أي مكون React
import { useAuth } from '../hooks/useAuth';
import subscriptionService from '../services/subscriptionService';

const MyComponent = () => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);

  // فحص إذا كان المستخدم يستطيع رؤية العملاء المحتملين
  const canViewLeads = subscriptionService.hasFeatureAccess(subscription, 'view_leads');
  
  // فحص إذا كان يستطيع توظيف فرق
  const canHireCrew = subscriptionService.hasFeatureAccess(subscription, 'hire_crew');
  
  // فحص إذا كان لديه وصول للعملاء الحصريين
  const hasExclusiveLeads = subscriptionService.hasFeatureAccess(subscription, 'exclusive_leads');

  return (
    <div>
      {canViewLeads && (
        <div>
          <h3>العملاء المحتملين</h3>
          <LeadsList />
        </div>
      )}
      
      {canHireCrew && (
        <button>توظيف فريق</button>
      )}
      
      {hasExclusiveLeads && (
        <div className="premium-section">
          <h3>عملاء حصريين 👑</h3>
          <ExclusiveLeadsList />
        </div>
      )}
      
      {!canViewLeads && (
        <div className="upgrade-prompt">
          <p>اشترك للوصول لهذه الميزة</p>
          <button>ترقية الاشتراك</button>
        </div>
      )}
    </div>
  );
};
"""

# 3. في Backend (Django/Python):
"""
# في views.py أو decorators.py
from functools import wraps
from django.http import JsonResponse
from payments.models import UserSubscription

def requires_feature(feature_name):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            try:
                subscription = UserSubscription.objects.get(user=request.user)
                if not subscription.is_active:
                    return JsonResponse({'error': 'No active subscription'}, status=403)
                
                # فحص المميزات
                plan_features = subscription.plan.features
                if feature_name not in plan_features:
                    return JsonResponse({'error': 'Feature not available in your plan'}, status=403)
                
                return view_func(request, *args, **kwargs)
            except UserSubscription.DoesNotExist:
                return JsonResponse({'error': 'No subscription found'}, status=403)
        return wrapper
    return decorator

# استخدام الديكوريتر
@requires_feature('view_leads')
def get_leads(request):
    # هذا الـ view يحتاج ميزة view_leads
    leads = Lead.objects.filter(assigned_to=request.user)
    return JsonResponse({'leads': list(leads.values())})

@requires_feature('hire_crew')
def hire_crew_member(request):
    # هذا الـ view يحتاج ميزة hire_crew
    # كود توظيف الفريق
    pass
"""

# 4. مثال على فحص المميزات في API:
"""
# في serializers.py
class LeadSerializer(serializers.ModelSerializer):
    can_contact = serializers.SerializerMethodField()
    is_exclusive = serializers.SerializerMethodField()
    
    def get_can_contact(self, obj):
        request = self.context.get('request')
        if request and request.user:
            try:
                subscription = UserSubscription.objects.get(user=request.user)
                return 'direct_messaging' in subscription.plan.features
            except UserSubscription.DoesNotExist:
                return False
        return False
    
    def get_is_exclusive(self, obj):
        request = self.context.get('request')
        if request and request.user:
            try:
                subscription = UserSubscription.objects.get(user=request.user)
                return subscription.plan.tier == 'premium'
            except UserSubscription.DoesNotExist:
                return False
        return False
"""

# 5. أمثلة على الاستخدام العملي:

# في صفحة Dashboard:
"""
if (hasFeatureAccess(subscription, 'view_leads')) {
  // عرض قسم العملاء المحتملين
  showLeadsSection();
}

if (hasFeatureAccess(subscription, 'exclusive_leads')) {
  // عرض العملاء الحصريين مع تاج Premium
  showExclusiveLeads();
}

if (!hasFeatureAccess(subscription, 'hire_crew')) {
  // إخفاء زر توظيف الفريق أو عرض رسالة ترقية
  showUpgradePrompt('hire_crew');
}
"""

# في API endpoints:
"""
@api_view(['GET'])
@requires_feature('premium_analytics')
def get_advanced_analytics(request):
    # هذا الـ endpoint متاح فقط للمستخدمين بخطة Premium
    analytics = calculate_advanced_analytics(request.user)
    return Response(analytics)
"""

# الفكرة الأساسية:
# 1. كل خطة لها قائمة مميزات محددة
# 2. النظام يفحص إذا كان المستخدم مشترك وخطته تحتوي على الميزة المطلوبة
# 3. إذا لم يكن لديه الميزة، يتم منعه من الوصول أو عرض رسالة ترقية
# 4. المميزات تتحكم في كل شيء: UI elements, API access, features visibility 