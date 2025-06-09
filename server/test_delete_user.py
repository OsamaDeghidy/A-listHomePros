#!/usr/bin/env python3
"""
اختبار حذف المستخدم من قاعدة البيانات
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from users.models import CustomUser
from alistpros_profiles.models import ProfessionalProfile

def main():
    print("🧪 اختبار حذف المستخدم...")
    print("=" * 50)
    
    # إنشاء مستخدم تجريبي
    print("1️⃣ إنشاء مستخدم تجريبي...")
    test_user = CustomUser.objects.create_user(
        email='test_user@example.com',
        name='مستخدم تجريبي',
        phone_number='1234567890',
        password='testpass123',
        role='contractor'
    )
    print(f"✅ تم إنشاء المستخدم: {test_user.email}")
    
    # إنشاء ملف مهني
    print("2️⃣ إنشاء ملف مهني...")
    profile = ProfessionalProfile.objects.create(
        user=test_user,
        profession='مقاول تجريبي',
        bio='ملف مهني تجريبي',
        years_of_experience=5,
        is_verified=False,
        is_available=False
    )
    print(f"✅ تم إنشاء الملف المهني: {profile.profession}")
    
    # اختبار حذف المستخدم
    print("3️⃣ اختبار حذف المستخدم...")
    try:
        user_id = test_user.id
        test_user.delete()
        print(f"✅ تم حذف المستخدم {user_id} بنجاح!")
        
        # التحقق من حذف الملف المهني
        profile_exists = ProfessionalProfile.objects.filter(user_id=user_id).exists()
        if not profile_exists:
            print("✅ تم حذف الملف المهني أيضاً (cascade)")
        else:
            print("❌ الملف المهني لم يُحذف!")
            
    except Exception as e:
        print(f"❌ خطأ في حذف المستخدم: {e}")
        # حذف المستخدم التجريبي في حالة الفشل
        try:
            test_user.delete()
        except:
            pass

if __name__ == "__main__":
    main() 