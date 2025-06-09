#!/usr/bin/env python3
"""
إصلاح مشاكل تطبيق contractors المحذوف
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.db import connection
from django.core.management import call_command

def main():
    print("🔧 إصلاح مشاكل تطبيق contractors المحذوف")
    print("=" * 60)
    
    # 1. إنشاء migration جديد لـ payments
    print("📝 إنشاء migration لإزالة مراجع contractors...")
    try:
        call_command('makemigrations', 'payments', '--name', 'remove_contractor_references')
        print("✅ تم إنشاء migration للدفعات")
    except Exception as e:
        print(f"⚠️ خطأ في إنشاء migration: {e}")
    
    # 2. تطبيق migrations
    print("\n🔄 تطبيق migrations...")
    try:
        call_command('migrate', '--fake-initial')
        print("✅ تم تطبيق migrations")
    except Exception as e:
        print(f"⚠️ خطأ في تطبيق migrations: {e}")
    
    # 3. فحص حالة قاعدة البيانات
    print("\n🔍 فحص حالة قاعدة البيانات...")
    with connection.cursor() as cursor:
        # فحص الجداول الموجودة
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"📊 عدد الجداول: {len(tables)}")
        
        # البحث عن جداول contractors
        contractor_tables = [t for t in tables if 'contractor' in t.lower()]
        if contractor_tables:
            print(f"⚠️ جداول contractors موجودة: {contractor_tables}")
        else:
            print("✅ لا توجد جداول contractors")
    
    print("\n✅ انتهى إصلاح مشاكل contractors!")

if __name__ == "__main__":
    main() 