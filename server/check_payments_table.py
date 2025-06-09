#!/usr/bin/env python3
"""
فحص بنية جدول payments_payment
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.db import connection

def main():
    print("🔍 فحص بنية جدول payments_payment")
    print("=" * 60)
    
    with connection.cursor() as cursor:
        # فحص الأعمدة في الجدول (PostgreSQL)
        cursor.execute("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'payments_payment'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        
        print("📋 الأعمدة الموجودة في payments_payment:")
        for col in columns:
            print(f"   - {col[0]} ({col[1]}) - {'NULL' if col[2] == 'YES' else 'NOT NULL'}")
        
        # البحث عن الأعمدة المتوقعة
        column_names = [col[0] for col in columns]
        
        print(f"\n🔍 التحقق من الأعمدة المطلوبة:")
        required_columns = ['professional_id', 'contractor_id', 'alistpro_id']
        
        for col in required_columns:
            if col in column_names:
                print(f"   ✅ {col} - موجود")
            else:
                print(f"   ❌ {col} - مفقود")
        
        # فحص الجداول الأخرى ذات الصلة
        print(f"\n🔍 فحص الجداول المرتبطة:")
        
        # فحص إذا كان هناك جدول ProfessionalProfile
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'alistpros_profiles_professionalprofile';
        """)
        pro_table = cursor.fetchone()
        
        if pro_table:
            print("   ✅ alistpros_profiles_professionalprofile - موجود")
            
            # فحص أعمدة الجدول
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_name = 'alistpros_profiles_professionalprofile';
            """)
            pro_count = cursor.fetchone()[0]
            print(f"      عدد الأعمدة: {pro_count}")
        else:
            print("   ❌ alistpros_profiles_professionalprofile - مفقود")

if __name__ == "__main__":
    main() 