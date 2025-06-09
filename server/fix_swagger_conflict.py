#!/usr/bin/env python
"""
Script to fix Swagger NotificationSerializer conflict by adding ref_name to both serializers
"""

def fix_swagger_conflict():
    """Fix the NotificationSerializer naming conflict in Swagger"""
    
    # Fix messaging/serializers.py
    try:
        with open('messaging/serializers.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and replace the Meta class for NotificationSerializer
        old_meta = '''    class Meta:
        model = Notification
        fields = ['''
        
        new_meta = '''    class Meta:
        model = Notification
        ref_name = 'MessagingNotification'  # Fix Swagger conflict
        fields = ['''
        
        if old_meta in content and 'ref_name = \'MessagingNotification\'' not in content:
            content = content.replace(old_meta, new_meta)
            
            with open('messaging/serializers.py', 'w', encoding='utf-8') as f:
                f.write(content)
            
            print('✅ Fixed messaging/serializers.py - Added ref_name to NotificationSerializer')
        else:
            print('ℹ️ messaging/serializers.py already fixed or pattern not found')
            
    except Exception as e:
        print(f'❌ Error fixing messaging/serializers.py: {e}')
    
    # Fix notifications/serializers.py
    try:
        with open('notifications/serializers.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and replace the Meta class for NotificationSerializer
        old_meta = '''    class Meta:
        model = Notification
        fields = ['''
        
        new_meta = '''    class Meta:
        model = Notification
        ref_name = 'SystemNotification'  # Fix Swagger conflict
        fields = ['''
        
        if old_meta in content and 'ref_name = \'SystemNotification\'' not in content:
            content = content.replace(old_meta, new_meta)
            
            with open('notifications/serializers.py', 'w', encoding='utf-8') as f:
                f.write(content)
            
            print('✅ Fixed notifications/serializers.py - Added ref_name to NotificationSerializer')
        else:
            print('ℹ️ notifications/serializers.py already fixed or pattern not found')
            
    except Exception as e:
        print(f'❌ Error fixing notifications/serializers.py: {e}')

if __name__ == '__main__':
    print('🔧 Fixing Swagger NotificationSerializer conflict...')
    fix_swagger_conflict()
    print('\n✅ Done! You can now run the server and access Swagger:')
    print('   http://127.0.0.1:8000/swagger/')
    print('   http://127.0.0.1:8000/swagger/?format=openapi') 