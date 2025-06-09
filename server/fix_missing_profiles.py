#!/usr/bin/env python
"""
إصلاح الملفات المهنية المفقودة وإنشاء فئات الخدمات
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.contrib.auth import get_user_model
from alistpros_profiles.models import ProfessionalProfile, ServiceCategory

User = get_user_model()

def create_service_categories():
    """إنشاء فئات خدمات أساسية"""
    print("🏷️ إنشاء فئات الخدمات...")
    
    categories = [
        {'name': 'سباكة', 'description': 'خدمات السباكة وإصلاح الأنابيب', 'icon': 'fa-wrench'},
        {'name': 'كهرباء', 'description': 'خدمات الكهرباء والتمديدات', 'icon': 'fa-bolt'},
        {'name': 'نجارة', 'description': 'أعمال النجارة والأثاث', 'icon': 'fa-hammer'},
        {'name': 'دهانات', 'description': 'أعمال الدهان والديكور', 'icon': 'fa-paint-brush'},
        {'name': 'تنظيف', 'description': 'خدمات التنظيف المنزلي', 'icon': 'fa-broom'},
        {'name': 'تكييف', 'description': 'صيانة وإصلاح أجهزة التكييف', 'icon': 'fa-snowflake'},
        {'name': 'بناء', 'description': 'أعمال البناء والتشييد', 'icon': 'fa-building'},
        {'name': 'حدائق', 'description': 'تنسيق وصيانة الحدائق', 'icon': 'fa-leaf'}
    ]
    
    created_count = 0
    for cat_data in categories:
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
    
    print(f"🎯 تم إنشاء {created_count} فئة جديدة")
    return ServiceCategory.objects.all()

def fix_missing_profiles():
    """إنشاء ملفات مهنية للمحترفين المفقودة"""
    print("\n🔧 إصلاح الملفات المهنية المفقودة...")
    
    # العثور على المحترفين بدون ملفات مهنية
    professionals = User.objects.filter(role__in=['contractor', 'specialist', 'crew'])
    
    professions_map = {
        'contractor': 'مقاول عام',
        'specialist': 'أخصائي متقدم', 
        'crew': 'عضو فريق عمل'
    }
    
    fixed_count = 0
    for user in professionals:
        try:
            # التحقق من وجود ملف مهني
            profile = user.professional_profile
            print(f"✅ {user.email} - ملف موجود: {profile.profession}")
        except ProfessionalProfile.DoesNotExist:
            # إنشاء ملف مهني جديد
            profession = professions_map.get(user.role, 'محترف')
            
            profile = ProfessionalProfile.objects.create(
                user=user,
                profession=profession,
                bio=f"محترف في مجال {profession} مع خبرة متميزة",
                years_of_experience=3,  # خبرة افتراضية
                is_onboarded=False,  # يحتاج لإكمال البيانات
                is_available=True,
                hourly_rate=100.00  # سعر افتراضي
            )
            
            print(f"✅ تم إنشاء ملف مهني لـ {user.email} - {profession}")
            fixed_count += 1
    
    print(f"🎯 تم إصلاح {fixed_count} ملف مهني")

def assign_random_categories():
    """تعيين فئات خدمات عشوائية للمحترفين"""
    print("\n🎲 تعيين فئات خدمات للمحترفين...")
    
    categories = list(ServiceCategory.objects.all())
    if not categories:
        print("❌ لا توجد فئات خدمات")
        return
    
    profiles = ProfessionalProfile.objects.all()
    
    for profile in profiles:
        if profile.service_categories.count() == 0:
            # تعيين 1-3 فئات عشوائياً
            import random
            num_categories = random.randint(1, min(3, len(categories)))
            selected_categories = random.sample(categories, num_categories)
            
            profile.service_categories.set(selected_categories)
            category_names = [cat.name for cat in selected_categories]
            
            print(f"✅ {profile.user.email} - تم تعيين: {', '.join(category_names)}")
        else:
            existing = profile.service_categories.all()
            category_names = [cat.name for cat in existing]
            print(f"📋 {profile.user.email} - فئات موجودة: {', '.join(category_names)}")

def test_final_state():
    """فحص النتيجة النهائية"""
    print("\n" + "=" * 50)
    print("📊 الحالة النهائية للنظام")
    print("=" * 50)
    
    # إحصائيات
    total_users = User.objects.count()
    professionals = User.objects.filter(role__in=['contractor', 'specialist', 'crew'])
    profiles = ProfessionalProfile.objects.count()
    categories = ServiceCategory.objects.count()
    
    print(f"👥 إجمالي المستخدمين: {total_users}")
    print(f"👷 عدد المحترفين: {professionals.count()}")
    print(f"📋 عدد الملفات المهنية: {profiles}")
    print(f"🏷️ عدد فئات الخدمات: {categories}")
    
    # التحقق من اكتمال الملفات
    missing_profiles = 0
    for user in professionals:
        try:
            profile = user.professional_profile
            categories_count = profile.service_categories.count()
            print(f"✅ {user.email} - {profile.profession} - {categories_count} فئات")
        except ProfessionalProfile.DoesNotExist:
            print(f"❌ {user.email} - لا يوجد ملف مهني")
            missing_profiles += 1
    
    if missing_profiles == 0:
        print("\n🎉 تم إصلاح جميع المشاكل!")
        print("✅ كل محترف لديه ملف مهني")
        print("✅ تم تعيين فئات الخدمات")
    else:
        print(f"\n⚠️ يوجد {missing_profiles} ملف مهني مفقود")

def main():
    print("🚀 بدء عملية الإصلاح...")
    
    # الخطوات
    categories = create_service_categories()
    fix_missing_profiles()
    assign_random_categories()
    test_final_state()
    
    print("\n✨ انتهت عملية الإصلاح!")

if __name__ == "__main__":
    main() 