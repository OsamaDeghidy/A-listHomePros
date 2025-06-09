#!/usr/bin/env python3
"""
فحص بسيط لـ admin panel
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.contrib import admin

def main():
    print("🔍 النماذج المسجلة في Admin Panel:")
    print("=" * 50)
    
    count = 0
    for model, admin_class in admin.site._registry.items():
        count += 1
        app_name = model._meta.app_label
        model_name = model.__name__
        admin_class_name = admin_class.__class__.__name__
        print(f"{count:2d}. {app_name}.{model_name} - {admin_class_name}")
    
    print(f"\n📊 إجمالي النماذج المسجلة: {count}")
    print(f"🌐 رابط Admin Panel: http://localhost:8000/admin/")

if __name__ == "__main__":
    main() 