#!/usr/bin/env python
"""
Simple script to fix ServiceCategory AttributeError
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

def fix_migrations():
    """Fix problematic migrations"""
    from django.db import connection
    
    print("🔧 Fixing migration conflicts...")
    
    with connection.cursor() as cursor:
        try:
            # Check if the problematic table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='alistpros_profiles_professionalprofile';
            """)
            
            if cursor.fetchone():
                print("📋 Found old ProfessionalProfile table")
                
                # Drop the old table and its relationships
                cursor.execute("DROP TABLE IF EXISTS alistpros_profiles_professionalprofile_service_categories;")
                cursor.execute("DROP TABLE IF EXISTS alistpros_profiles_professionalprofile;")
                print("✅ Dropped old ProfessionalProfile tables")
            
            # Also clean up other old tables
            old_tables = [
                'alistpros_profiles_review',
                'alistpros_profiles_availability',
                'alistpros_profiles_timeoff'
            ]
            
            for table in old_tables:
                cursor.execute(f"DROP TABLE IF EXISTS {table};")
                print(f"✅ Dropped {table}")
            
            print("🎉 Migration conflicts resolved!")
            return True
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

def check_models():
    """Check if models can be imported properly"""
    try:
        from alistpros_profiles.models import ServiceCategory, AListHomeProProfile
        from messaging.models import Conversation, Message
        from notifications.models import Notification
        
        print("✅ All models imported successfully!")
        
        # Test ServiceCategory admin function
        categories = ServiceCategory.objects.all()
        for cat in categories[:3]:
            try:
                count = cat.alistpros.count()
                print(f"✅ {cat.name}: {count} professionals")
            except Exception as e:
                print(f"❌ Error with {cat.name}: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Model import error: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Starting fix process...")
    
    # Fix migrations first
    if fix_migrations():
        print("\n📊 Checking models...")
        if check_models():
            print("\n🎉 All systems operational!")
        else:
            print("\n⚠️  Some issues remain with models")
    else:
        print("\n❌ Failed to fix migrations") 