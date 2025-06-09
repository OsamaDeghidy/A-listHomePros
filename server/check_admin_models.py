#!/usr/bin/env python3
"""
فحص جميع النماذج المسجلة في admin panel
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.contrib import admin
from django.apps import apps

def main():
    print("🔍 فحص النماذج المسجلة في Admin Panel")
    print("=" * 60)
    
    # احصائيات عامة
    total_models = 0
    registered_models = 0
    
    # فحص كل تطبيق
    for app_config in apps.get_app_configs():
        app_name = app_config.name
        
        # تجاهل التطبيقات المدمجة في Django
        if app_name.startswith('django.') or app_name.startswith('rest_framework'):
            continue
            
        models = app_config.get_models()
        if not models:
            continue
            
        print(f"\n📱 تطبيق: {app_name}")
        print("-" * 40)
        
        app_total = 0
        app_registered = 0
        
        for model in models:
            total_models += 1
            app_total += 1
            
            # فحص إذا كان النموذج مسجل في admin
            if model in admin.site._registry:
                registered_models += 1
                app_registered += 1
                admin_class = admin.site._registry[model].__class__.__name__
                print(f"   ✅ {model.__name__} - {admin_class}")
            else:
                print(f"   ❌ {model.__name__} - غير مسجل")
        
        print(f"   📊 إجمالي: {app_total} | مسجل: {app_registered} | غير مسجل: {app_total - app_registered}")
    
    # الإحصائيات النهائية
    print(f"\n📊 الإحصائيات الإجمالية:")
    print(f"   🎯 إجمالي النماذج: {total_models}")
    print(f"   ✅ النماذج المسجلة: {registered_models}")
    print(f"   ❌ النماذج غير المسجلة: {total_models - registered_models}")
    print(f"   📈 نسبة التغطية: {(registered_models/total_models)*100:.1f}%")
    
    # قائمة النماذج غير المسجلة
    print(f"\n❌ النماذج غير المسجلة:")
    unregistered_count = 0
    for app_config in apps.get_app_configs():
        app_name = app_config.name
        if app_name.startswith('django.') or app_name.startswith('rest_framework'):
            continue
            
        for model in app_config.get_models():
            if model not in admin.site._registry:
                unregistered_count += 1
                print(f"   {unregistered_count}. {app_name}.{model.__name__}")
    
    print(f"\n🌐 رابط Admin Panel: http://localhost:8000/admin/")
    print(f"👤 استخدم حساب المشرف للدخول")

if __name__ == "__main__":
    main() 