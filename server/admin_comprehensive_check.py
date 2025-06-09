#!/usr/bin/env python3
"""
فحص شامل لجميع البيانات في لوحة الإدارة
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from users.models import CustomUser, EmailVerification
from alistpros_profiles.models import (
    ProfessionalProfile, ServiceCategory, ServiceRequest, 
    ServiceQuote, JobAssignment, Review
)
try:
    from core.models import Address
except ImportError:
    Address = None

def print_section(title):
    print("\n" + "=" * 70)
    print(f"🔍 {title}")
    print("=" * 70)

def main():
    print("🏢 A-List Home Pros - فحص شامل لوحة الإدارة")
    
    # 1. فحص المستخدمين
    print_section("المستخدمين (Users)")
    users = CustomUser.objects.all()
    print(f"📊 إجمالي المستخدمين: {users.count()}")
    
    for role in ['admin', 'client', 'contractor', 'specialist', 'crew']:
        count = users.filter(role=role).count()
        print(f"   👤 {role}: {count}")
    
    print(f"📧 المستخدمين المحققين: {users.filter(email_verified=True).count()}")
    print(f"✅ المستخدمين المفعلين: {users.filter(is_active=True).count()}")
    
    # 2. فحص التحقق من البريد
    print_section("التحقق من البريد الإلكتروني")
    verifications = EmailVerification.objects.all()
    print(f"📧 رموز التحقق: {verifications.count()}")
    
    # 3. فحص الملفات المهنية
    print_section("الملفات المهنية (Professional Profiles)")
    profiles = ProfessionalProfile.objects.all()
    print(f"👷 إجمالي الملفات المهنية: {profiles.count()}")
    print(f"✅ ملفات مكتملة الإعداد: {profiles.filter(is_onboarded=True).count()}")
    print(f"🔍 ملفات محققة: {profiles.filter(is_verified=True).count()}")
    print(f"⭐ ملفات مميزة: {profiles.filter(is_featured=True).count()}")
    print(f"💼 ملفات متاحة للعمل: {profiles.filter(is_available=True).count()}")
    
    print("\n📋 قائمة الملفات المهنية:")
    for i, profile in enumerate(profiles, 1):
        print(f"   {i}. {profile.user.name} - {profile.profession}")
        print(f"      📧 {profile.user.email}")
        print(f"      📊 خبرة: {profile.years_of_experience} سنوات")
        print(f"      💰 السعر: ${profile.hourly_rate}/ساعة")
        print(f"      ⭐ التقييم: {profile.average_rating}")
        print(f"      📍 الموقع: {profile.address.city if profile.address else 'غير محدد'}")
    
    # 4. فحص فئات الخدمات
    print_section("فئات الخدمات (Service Categories)")
    categories = ServiceCategory.objects.all()
    print(f"🏷️ إجمالي فئات الخدمات: {categories.count()}")
    
    print("\n📋 قائمة فئات الخدمات:")
    for i, category in enumerate(categories, 1):
        professionals_count = ProfessionalProfile.objects.filter(
            service_categories=category
        ).count()
        print(f"   {i}. {category.name} ({category.icon}) - {professionals_count} محترف")
    
    # 5. فحص طلبات الخدمة
    print_section("طلبات الخدمة (Service Requests)")
    requests = ServiceRequest.objects.all()
    print(f"📝 إجمالي طلبات الخدمة: {requests.count()}")
    
    for status in ['draft', 'pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled']:
        count = requests.filter(status=status).count()
        print(f"   📊 {status}: {count}")
    
    # 6. فحص عروض الأسعار
    print_section("عروض الأسعار (Service Quotes)")
    quotes = ServiceQuote.objects.all()
    print(f"💰 إجمالي عروض الأسعار: {quotes.count()}")
    
    # 7. فحص مهام العمل
    print_section("مهام العمل (Job Assignments)")
    assignments = JobAssignment.objects.all()
    print(f"⚒️ إجمالي مهام العمل: {assignments.count()}")
    
    # 8. فحص التقييمات
    print_section("التقييمات (Reviews)")
    reviews = Review.objects.all()
    print(f"⭐ إجمالي التقييمات: {reviews.count()}")
    print(f"✅ تقييمات محققة: {reviews.filter(is_verified=True).count()}")
    
    if reviews.exists():
        from django.db.models import Avg
        avg_rating = reviews.aggregate(avg=Avg('overall_rating'))['avg']
        if avg_rating:
            print(f"📊 متوسط التقييمات: {avg_rating:.2f}/5")
    
    # 9. فحص العناوين
    print_section("العناوين (Addresses)")
    if Address:
        addresses = Address.objects.all()
        print(f"📍 إجمالي العناوين: {addresses.count()}")
    else:
        print("📍 نموذج العناوين غير متاح")
    
    # 10. ملخص الحالة العامة
    print_section("ملخص الحالة العامة")
    
    print("✅ النظام جاهز للاستخدام!" if (
        users.filter(is_superuser=True).exists() and
        profiles.count() > 0 and
        categories.count() > 0
    ) else "⚠️ النظام يحتاج لإعداد إضافي")
    
    print(f"\n🔗 لوحة الإدارة: http://localhost:8000/admin/")
    print(f"👤 استخدم أحد هذه الحسابات للدخول:")
    
    superusers = users.filter(is_superuser=True)
    for admin in superusers:
        print(f"   📧 {admin.email} (كلمة المرور: admin123456)")

if __name__ == "__main__":
    main() 