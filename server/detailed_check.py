#!/usr/bin/env python3
"""
سكريپت مفصل للتحقق من حالة النظام
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from users.models import CustomUser
from alistpros_profiles.models import ProfessionalProfile, ServiceCategory

def main():
    print("=" * 50)
    print("📊 تحليل مفصل للنظام")
    print("=" * 50)
    
    # جميع المستخدمين
    print("\n🔍 جميع المستخدمين:")
    all_users = CustomUser.objects.all()
    for i, user in enumerate(all_users, 1):
        print(f"{i}. {user.name} ({user.email}) - {user.role}")
    
    # المحترفين فقط
    print("\n👷 المحترفين فقط:")
    professional_roles = ['contractor', 'specialist', 'crew']
    professionals = CustomUser.objects.filter(role__in=professional_roles)
    for i, pro in enumerate(professionals, 1):
        print(f"{i}. {pro.name} ({pro.email}) - {pro.role}")
    
    # التحقق من الربط أولاً
    print("\n🔗 التحقق من ربط الملفات:")
    for i, pro in enumerate(professionals, 1):
        try:
            profile = pro.professional_profile
            print(f"{i}. ✅ {pro.name} - له ملف مهني: {profile.profession}")
        except ProfessionalProfile.DoesNotExist:
            print(f"{i}. ❌ {pro.name} - بدون ملف مهني")

    # الملفات المهنية بالتفصيل  
    print("\n📋 تفاصيل جميع الملفات المهنية:")
    profiles = ProfessionalProfile.objects.all()
    print(f"العدد الإجمالي للملفات المهنية: {profiles.count()}")
    for i, profile in enumerate(profiles, 1):
        user = profile.user
        print(f"{i}. اسم المستخدم: {user.name}")
        print(f"   البريد الإلكتروني: {user.email}")
        print(f"   الدور: {user.role}")
        print(f"   المهنة: {profile.profession}")
        print(f"   سنوات الخبرة: {profile.years_of_experience}")
        print(f"   تاريخ الإنشاء: {profile.created_at}")
        print("-" * 40)
    
    # الملفات المهنية بالتفصيل
    print("\n📋 تفاصيل جميع الملفات المهنية:")
    profiles = ProfessionalProfile.objects.all()
    print(f"العدد الإجمالي للملفات المهنية: {profiles.count()}")
    for i, profile in enumerate(profiles, 1):
        user = profile.user
        print(f"{i}. اسم المستخدم: {user.name}")
        print(f"   البريد الإلكتروني: {user.email}")
        print(f"   الدور: {user.role}")
        print(f"   المهنة: {profile.profession}")
        print(f"   سنوات الخبرة: {profile.years_of_experience}")
        print(f"   تاريخ الإنشاء: {profile.created_at}")
        print("-" * 40)
    
    # الإحصائيات النهائية
    print("\n📊 الإحصائيات النهائية:")
    print(f"إجمالي المستخدمين: {all_users.count()}")
    print(f"عدد المحترفين: {professionals.count()}")
    print(f"عدد الملفات المهنية: {profiles.count()}")
    print(f"عدد فئات الخدمات: {ServiceCategory.objects.count()}")
    
    # التحقق من التطابق
    if professionals.count() == profiles.count():
        print("✅ العدد متطابق - كل محترف له ملف مهني")
    else:
        print("❌ عدم تطابق - هناك محترفين بدون ملفات مهنية")

if __name__ == "__main__":
    main() 