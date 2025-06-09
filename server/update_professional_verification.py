#!/usr/bin/env python3
"""
تحديث حالة التحقق للمحترفين الحاليين
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from alistpros_profiles.models import ProfessionalProfile
from notifications.utils import create_notification

def main():
    print("🔄 تحديث حالة التحقق للمحترفين الحاليين...")
    print("=" * 60)
    
    # جلب جميع المحترفين المحققين حالياً
    verified_professionals = ProfessionalProfile.objects.filter(is_verified=True)
    
    print(f"📊 المحترفين المحققين حالياً: {verified_professionals.count()}")
    
    choice = input("\n🤔 هل تريد إزالة التحقق من جميع المحترفين الحاليين؟ (y/n): ")
    
    if choice.lower() == 'y':
        print("\n🔄 جاري إزالة التحقق من جميع المحترفين الحاليين...")
        
        updated_count = 0
        for profile in verified_professionals:
            profile.is_verified = False
            profile.is_available = False  # جعلهم غير متاحين حتى يتم التحقق مرة أخرى
            profile.save()
            
            # إرسال إشعار
            try:
                create_notification(
                    user=profile.user,
                    notification_type='VERIFICATION_UPDATE',
                    title='تحديث نظام التحقق 📋',
                    message='تم تحديث نظام التحقق. يرجى انتظار مراجعة المشرف لتحقق ملفك المهني مرة أخرى.',
                    data={'profile_id': profile.id}
                )
                print(f"✅ تم تحديث {profile.user.name} وإرسال إشعار")
            except Exception as e:
                print(f"⚠️ تم تحديث {profile.user.name} لكن فشل إرسال الإشعار: {e}")
            
            updated_count += 1
        
        print(f"\n✅ تم تحديث {updated_count} محترف بنجاح!")
        print("📧 تم إرسال إشعارات لجميع المحترفين المتأثرين")
        
        # إحصائيات جديدة
        pending_professionals = ProfessionalProfile.objects.filter(is_verified=False)
        print(f"\n📊 الإحصائيات الجديدة:")
        print(f"   - المحترفين في انتظار التحقق: {pending_professionals.count()}")
        print(f"   - المحترفين المحققين: {ProfessionalProfile.objects.filter(is_verified=True).count()}")
        
    else:
        print("\n❌ تم إلغاء العملية")
        
        # إحصائيات حالية
        pending_professionals = ProfessionalProfile.objects.filter(is_verified=False)
        print(f"\n📊 الإحصائيات الحالية:")
        print(f"   - المحترفين في انتظار التحقق: {pending_professionals.count()}")
        print(f"   - المحترفين المحققين: {verified_professionals.count()}")

if __name__ == "__main__":
    main() 