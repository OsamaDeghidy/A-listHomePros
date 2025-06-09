#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.contrib.auth import get_user_model
from alistpros_profiles.models import ProfessionalProfile, ServiceCategory

User = get_user_model()

def main():
    print("🔍 فحص النظام الحالي")
    print("=" * 30)
    
    # إجمالي المستخدمين
    total_users = User.objects.count()
    print(f"📊 إجمالي المستخدمين: {total_users}")
    
    # المحترفين
    professionals = User.objects.filter(role__in=['contractor', 'specialist', 'crew'])
    print(f"👷 عدد المحترفين: {professionals.count()}")
    
    # الملفات المهنية
    profiles_count = ProfessionalProfile.objects.count()
    print(f"📋 عدد الملفات المهنية: {profiles_count}")
    
    # فئات الخدمات
    categories = ServiceCategory.objects.count()
    print(f"🏷️ عدد فئات الخدمات: {categories}")
    
    # تفاصيل المحترفين
    print("\n📝 تفاصيل المحترفين:")
    for user in professionals[:5]:
        try:
            profile = user.professional_profile
            print(f"✅ {user.email} - {profile.profession}")
        except:
            print(f"❌ {user.email} - لا يوجد ملف مهني")

if __name__ == "__main__":
    main() 