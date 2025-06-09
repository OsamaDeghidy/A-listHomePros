#!/usr/bin/env python3
"""
فحص المستخدمين الإداريين
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from users.models import CustomUser

def main():
    print("=" * 60)
    print("🔍 فحص المستخدمين الإداريين")
    print("=" * 60)
    
    # جميع المستخدمين الإداريين
    admin_users = CustomUser.objects.filter(role='admin')
    print(f"📊 عدد المشرفين: {admin_users.count()}")
    
    if admin_users.count() == 0:
        print("❌ لا يوجد مستخدمين إداريين!")
        print("💡 سنقوم بإنشاء superuser...")
        
        # إنشاء superuser
        try:
            superuser = CustomUser.objects.create_superuser(
                email='admin@alistpros.com',
                name='Super Admin',
                password='admin123456',
                role='admin'
            )
            print(f"✅ تم إنشاء superuser: {superuser.email}")
        except Exception as e:
            print(f"❌ خطأ في إنشاء superuser: {e}")
    else:
        print("\n🔍 قائمة المشرفين:")
        for i, admin in enumerate(admin_users, 1):
            print(f"{i}. الاسم: {admin.name}")
            print(f"   البريد: {admin.email}")
            print(f"   Staff: {'✅' if admin.is_staff else '❌'}")
            print(f"   Superuser: {'✅' if admin.is_superuser else '❌'}")
            print(f"   مفعل: {'✅' if admin.is_active else '❌'}")
            print(f"   محقق البريد: {'✅' if admin.email_verified else '❌'}")
            print("-" * 40)
        
        # التأكد من وجود superuser واحد على الأقل
        superusers = admin_users.filter(is_superuser=True)
        if superusers.count() == 0:
            print("⚠️  لا يوجد superuser! سنقوم بتحديث أول مشرف ليكون superuser")
            first_admin = admin_users.first()
            first_admin.is_superuser = True
            first_admin.is_staff = True
            first_admin.save()
            print(f"✅ تم تحديث {first_admin.name} ليكون superuser")

if __name__ == "__main__":
    main() 