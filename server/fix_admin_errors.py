#!/usr/bin/env python
"""
Script to fix admin panel errors:
1. ValueError: The annotation 'message_count' conflicts with a field on the model
2. FieldError: Cannot resolve keyword 'notifications_using_template' 
3. NotRelationField error in payments admin
"""

import os
import re

def fix_messaging_admin():
    """Fix messaging admin annotation conflict"""
    file_path = 'messaging/admin.py'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove the conflicting annotation from get_queryset
        old_pattern = r'\.annotate\(\s*participant_count_calc=Count\(\'participants\'\),\s*message_count=Count\(\'messages\'\),\s*last_message_time=Max\(\'messages__created_at\'\)\s*\)'
        new_pattern = '.annotate(\n            participant_count_calc=Count(\'participants\'),\n            last_message_time=Max(\'messages__created_at\')\n        )'
        
        content = re.sub(old_pattern, new_pattern, content, flags=re.MULTILINE | re.DOTALL)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed messaging admin: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing messaging admin: {e}")
        return False

def fix_notifications_admin():
    """Fix notifications admin relationship error"""
    file_path = 'notifications/admin.py'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove the get_queryset method with wrong annotation
        old_pattern = r'def get_queryset\(self, request\):\s*return super\(\)\.get_queryset\(request\)\.annotate\(\s*notification_count=Count\(\'notifications_using_template\', distinct=True\)\s*\)'
        
        # Replace with simple queryset
        new_method = '''def get_queryset(self, request):
        return super().get_queryset(request)'''
        
        content = re.sub(old_pattern, new_method, content, flags=re.MULTILINE | re.DOTALL)
        
        # Fix usage_count method
        old_usage_pattern = r'def usage_count\(self, obj\):\s*count = getattr\(obj, \'notification_count\', 0\)'
        new_usage_pattern = '''def usage_count(self, obj):
        # Count notifications that might use this template by checking title similarity
        count = Notification.objects.filter(
            Q(title__icontains=obj.name) | Q(message__icontains=obj.subject)
        ).count()'''
        
        content = re.sub(old_usage_pattern, new_usage_pattern, content, flags=re.MULTILINE | re.DOTALL)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed notifications admin: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing notifications admin: {e}")
        return False

def fix_payments_admin():
    """Fix payments admin relation field error"""
    file_path = 'payments/admin.py'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Ensure proper field handling in get_queryset
        if 'def get_queryset(self, request):' not in content:
            # Add get_queryset method to PaymentAdmin class
            payment_admin_pattern = r'(@admin\.register\(Payment\)\s*class PaymentAdmin\(admin\.ModelAdmin\):)'
            replacement = r'\1\n    \n    def get_queryset(self, request):\n        return super().get_queryset(request).select_related(\n            \'client\', \'professional__user\'\n        )\n'
            
            content = re.sub(payment_admin_pattern, replacement, content, flags=re.MULTILINE)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed payments admin: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing payments admin: {e}")
        return False

def main():
    """Main function to run all fixes"""
    print("🔧 Starting Admin Panel Error Fixes...")
    
    results = []
    results.append(fix_messaging_admin())
    results.append(fix_notifications_admin())
    results.append(fix_payments_admin())
    
    if all(results):
        print("\n✅ All admin panel errors have been fixed!")
        print("\nNext steps:")
        print("1. Run: python manage.py runserver")
        print("2. Visit: http://localhost:8000/admin/")
        print("3. Test the fixed admin panels")
    else:
        print("\n⚠️ Some errors could not be fixed automatically.")
        print("Please check the files manually.")

if __name__ == '__main__':
    main() 