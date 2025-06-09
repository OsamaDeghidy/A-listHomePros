#!/usr/bin/env python
"""
Script to migrate data from ProfessionalProfile to AListHomeProProfile
نقل البيانات من ProfessionalProfile إلى AListHomeProProfile
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from alistpros_profiles.models import ProfessionalProfile, AListHomeProProfile


def migrate_professional_profiles():
    """نقل البيانات من ProfessionalProfile إلى AListHomeProProfile"""
    
    print("🔄 بدء عملية نقل البيانات من ProfessionalProfile إلى AListHomeProProfile...")
    
    # احصائيات أولية
    professional_count = ProfessionalProfile.objects.count()
    alistpro_count = AListHomeProProfile.objects.count()
    
    print(f"📊 الإحصائيات الأولية:")
    print(f"   - ProfessionalProfile: {professional_count}")
    print(f"   - AListHomeProProfile: {alistpro_count}")
    
    if professional_count == 0:
        print("❌ لا توجد بيانات في ProfessionalProfile للنقل")
        return
    
    migrated_count = 0
    updated_count = 0
    error_count = 0
    
    for prof_profile in ProfessionalProfile.objects.all():
        try:
            user = prof_profile.user
            
            # التحقق من وجود AListHomeProProfile للمستخدم
            alistpro, created = AListHomeProProfile.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': prof_profile.business_name or '',
                    'profession': prof_profile.profession or '',
                    'bio': prof_profile.bio or '',
                    'business_description': prof_profile.bio or '',
                    'years_of_experience': prof_profile.years_of_experience,
                    'service_radius': prof_profile.service_radius,
                    'latitude': prof_profile.latitude,
                    'longitude': prof_profile.longitude,
                    'license_number': prof_profile.license_number or '',
                    'license_type': prof_profile.license_type or '',
                    'license_expiry': prof_profile.license_expiry,
                    'insurance_info': prof_profile.insurance_info or '',
                    'certifications': prof_profile.certifications or '',
                    'hourly_rate': prof_profile.hourly_rate,
                    'is_available': prof_profile.is_available,
                    'profile_image': prof_profile.profile_image,
                    'cover_image': prof_profile.cover_image,
                    'website': prof_profile.website or '',
                    'is_verified': prof_profile.is_verified,
                    'is_featured': prof_profile.is_featured,
                    'is_onboarded': prof_profile.is_onboarded,
                    'total_jobs': prof_profile.total_jobs,
                    'jobs_completed': prof_profile.jobs_completed,
                    'average_rating': prof_profile.average_rating,
                    'response_time_hours': prof_profile.response_time_hours,
                }
            )
            
            if created:
                print(f"✅ تم إنشاء AListHomeProProfile جديد للمستخدم: {user.email}")
                migrated_count += 1
            
            # نسخ categories
            if prof_profile.service_categories.exists():
                current_categories = set(alistpro.service_categories.values_list('id', flat=True))
                new_categories = set(prof_profile.service_categories.values_list('id', flat=True))
                
                if new_categories - current_categories:  # إذا كان هناك categories جديدة
                    all_categories = current_categories | new_categories
                    alistpro.service_categories.set(all_categories)
                    print(f"📂 تم تحديث service_categories للمستخدم: {user.email}")
            
            # نسخ العنوان إذا كان موجوداً
            if prof_profile.address and not alistpro.address:
                alistpro.address = prof_profile.address
                alistpro.save()
                print(f"🏠 تم نسخ العنوان للمستخدم: {user.email}")
                
        except Exception as e:
            print(f"❌ خطأ في نقل بيانات المستخدم {prof_profile.user.email}: {e}")
            error_count += 1
    
    print(f"\n📊 ملخص عملية النقل:")
    print(f"   ✅ تم إنشاء: {migrated_count}")
    print(f"   🔄 تم تحديث: {updated_count}")
    print(f"   ❌ أخطاء: {error_count}")
    print(f"   📈 إجمالي AListHomeProProfile بعد النقل: {AListHomeProProfile.objects.count()}")


if __name__ == "__main__":
    migrate_professional_profiles() 