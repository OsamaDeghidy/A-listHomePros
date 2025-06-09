#!/usr/bin/env python3
"""
إصلاح جدول payments وإضافة حقل professional_id
"""
import os
import sys
import django

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.db import connection, transaction

def main():
    print("🔧 إصلاح جدول payments_payment")
    print("=" * 60)
    
    with connection.cursor() as cursor:
        try:
            with transaction.atomic():
                print("1️⃣ إضافة حقل professional_id...")
                
                # إضافة حقل professional_id
                cursor.execute("""
                    ALTER TABLE payments_payment 
                    ADD COLUMN professional_id bigint;
                """)
                
                print("2️⃣ إنشاء constraint للحقل الجديد...")
                
                # إضافة foreign key constraint
                cursor.execute("""
                    ALTER TABLE payments_payment 
                    ADD CONSTRAINT payments_payment_professional_id_fkey 
                    FOREIGN KEY (professional_id) 
                    REFERENCES alistpros_profiles_professionalprofile(id) 
                    DEFERRABLE INITIALLY DEFERRED;
                """)
                
                print("3️⃣ نقل البيانات من alistpro_id إلى professional_id...")
                
                # نقل البيانات من alistpro_id إلى professional_id
                cursor.execute("""
                    UPDATE payments_payment 
                    SET professional_id = alistpro_id 
                    WHERE alistpro_id IS NOT NULL;
                """)
                
                print("4️⃣ إنشاء index للأداء...")
                
                # إنشاء index
                cursor.execute("""
                    CREATE INDEX payments_payment_professional_id_idx 
                    ON payments_payment(professional_id);
                """)
                
                print("✅ تم إصلاح الجدول بنجاح!")
                
        except Exception as e:
            print(f"❌ خطأ في الإصلاح: {e}")
            # إذا كان الحقل موجود بالفعل، فقط انقل البيانات
            if "already exists" in str(e):
                print("📝 الحقل موجود بالفعل، سنقوم بنقل البيانات فقط...")
                try:
                    cursor.execute("""
                        UPDATE payments_payment 
                        SET professional_id = alistpro_id 
                        WHERE alistpro_id IS NOT NULL AND professional_id IS NULL;
                    """)
                    print("✅ تم نقل البيانات!")
                except Exception as e2:
                    print(f"❌ خطأ في نقل البيانات: {e2}")

if __name__ == "__main__":
    main() 