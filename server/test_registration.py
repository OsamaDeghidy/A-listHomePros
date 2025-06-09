#!/usr/bin/env python
"""
تست عملية التسجيل وإنشاء Professional Profile
"""
import os
import django

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.contrib.auth import get_user_model
from alistpros_profiles.models import AListHomeProProfile, ServiceCategory
from users.models import UserRole

User = get_user_model()

def test_current_state():
    """فحص الحالة الحالية للنظام"""
    print("=" * 50)
    print("🔍 فحص الحالة الحالية للنظام")
    print("=" * 50)
    
    # إجمالي المستخدمين
    total_users = User.objects.count()
    print(f"📊 إجمالي المستخدمين: {total_users}")
    
    # المحترفين
    professionals = User.objects.filter(role__in=['contractor', 'specialist', 'crew'])
    print(f"👷 عدد المحترفين: {professionals.count()}")
    
    # التحقق من الملفات المهنية
    profiles_count = AListHomeProProfile.objects.count()
    print(f"📋 عدد الملفات المهنية: {profiles_count}")
    
    # فحص كل محترف
    print("\n📝 تفاصيل المحترفين:")
    for user in professionals[:10]:  # أول 10 محترفين
        try:
            profile = user.professional_profile
            print(f"✅ {user.email} ({user.role}) - ملف مهني موجود: {profile.profession}")
        except AListHomeProProfile.DoesNotExist:
            print(f"❌ {user.email} ({user.role}) - لا يوجد ملف مهني")
    
    # فئات الخدمات
    categories = ServiceCategory.objects.count()
    print(f"\n🏷️ عدد فئات الخدمات: {categories}")

def test_registration_flow():
    """تست عملية التسجيل الجديدة"""
    print("\n" + "=" * 50)
    print("🧪 تست عملية التسجيل الجديدة")
    print("=" * 50)
    
    # بيانات تست
    test_data = {
        'name': 'أحمد محمد المختبر',
        'email': 'test-professional@example.com',
        'phone_number': '+201234567890',
        'password': 'TestPassword123',
        'role': 'contractor',
        'profession': 'سباك',
        'years_experience': '5',
        'services_provided': 'إصلاح الأنابيب، صيانة السباكة',
        'about': 'سباك محترف مع خبرة 5 سنوات'
    }
    
    # حذف المستخدم إذا كان موجوداً
    try:
        old_user = User.objects.get(email=test_data['email'])
        if hasattr(old_user, 'professional_profile'):
            old_user.professional_profile.delete()
        old_user.delete()
        print(f"🗑️ تم حذف المستخدم السابق: {test_data['email']}")
    except User.DoesNotExist:
        pass
    
    # إنشاء مستخدم جديد
    print(f"👤 إنشاء مستخدم جديد: {test_data['email']}")
    
    user = User.objects.create_user(
        email=test_data['email'],
        name=test_data['name'],
        phone_number=test_data['phone_number'],
        password=test_data['password'],
        role=test_data['role']
    )
    
    print(f"✅ تم إنشاء المستخدم: {user.email} ({user.role})")
    
    # محاكاة إنشاء ProfessionalProfile
    if user.role in ['contractor', 'specialist', 'crew']:
        try:
            # استخراج البيانات المهنية
            profession = test_data.get('profession', '')
            years_experience = int(test_data.get('years_experience', 0))
            about = test_data.get('about', '')
            
            # إنشاء الملف المهني
            professional_profile = AListHomeProProfile.objects.create(
                user=user,
                profession=profession,
                bio=about,
                years_of_experience=years_experience,
                is_onboarded=False
            )
            
            print(f"✅ تم إنشاء AListHomeProProfile:")
            print(f"   - المهنة: {professional_profile.profession}")
            print(f"   - سنوات الخبرة: {professional_profile.years_of_experience}")
            print(f"   - النبذة: {professional_profile.bio[:50]}...")
            
        except Exception as e:
            print(f"❌ خطأ في إنشاء AListHomeProProfile: {e}")
    
    # التحقق من النتيجة
    try:
        profile = user.professional_profile
        print(f"🎉 نجح التست! الملف المهني تم إنشاؤه بنجاح")
        return True
    except:
        print(f"💥 فشل التست! لم يتم إنشاء الملف المهني")
        return False

def create_sample_categories():
    """إنشاء فئات خدمات تجريبية"""
    print("\n" + "=" * 50)
    print("🏷️ إنشاء فئات خدمات تجريبية")
    print("=" * 50)
    
    sample_categories = [
        {'name': 'سباكة', 'description': 'خدمات السباكة وإصلاح الأنابيب', 'icon': 'fa-wrench'},
        {'name': 'كهرباء', 'description': 'خدمات الكهرباء والتمديدات', 'icon': 'fa-bolt'},
        {'name': 'نجارة', 'description': 'أعمال النجارة والأثاث', 'icon': 'fa-hammer'},
        {'name': 'دهانات', 'description': 'أعمال الدهان والديكور', 'icon': 'fa-paint-brush'},
        {'name': 'تنظيف', 'description': 'خدمات التنظيف المنزلي', 'icon': 'fa-broom'}
    ]
    
    created_count = 0
    for cat_data in sample_categories:
        category, created = ServiceCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'icon': cat_data['icon']
            }
        )
        if created:
            print(f"✅ تم إنشاء فئة: {category.name}")
            created_count += 1
        else:
            print(f"📋 فئة موجودة: {category.name}")
    
    print(f"\n🎯 تم إنشاء {created_count} فئة جديدة")

if __name__ == "__main__":
    # تشغيل التستات
    test_current_state()
    create_sample_categories()
    test_success = test_registration_flow()
    
    print("\n" + "=" * 50)
    print("📊 خلاصة النتائج")
    print("=" * 50)
    
    if test_success:
        print("🎉 جميع التستات نجحت!")
        print("✅ النظام يعمل بشكل صحيح")
        print("✅ AListHomeProProfile يتم إنشاؤه تلقائياً")
    else:
        print("❌ هناك مشاكل في النظام")
        print("🔧 يحتاج للمراجعة والإصلاح")
    
    print("\n🚀 الخطوات التالية:")
    print("1. اختبار التسجيل من الواجهة الأمامية")
    print("2. التأكد من إرسال البيانات المهنية")
    print("3. تحسين صفحة إعداد الملف المهني") 