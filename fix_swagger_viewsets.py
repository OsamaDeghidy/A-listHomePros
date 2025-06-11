#!/usr/bin/env python3
"""
Fix script for Swagger schema generation issues with AnonymousUser
This script adds swagger_fake_view protection to all problematic ViewSets
"""

import os
import re

def fix_file(filepath, fixes):
    """Apply fixes to a specific file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for old_pattern, new_pattern in fixes:
            content = re.sub(old_pattern, new_pattern, content, flags=re.MULTILINE | re.DOTALL)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
            return True
        else:
            print(f"⚠️  No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {str(e)}")
        return False

def main():
    print("🔧 Fixing Swagger ViewSet issues...")
    print("=" * 50)
    
    # Fix messaging/views.py
    messaging_fixes = [
        # ConversationViewSet get_queryset
        (
            r'(def get_queryset\(self\):\s*"""Get conversations for current user[^"]*"""\s*)(return Conversation\.objects\.filter\(\s*participants=self\.request\.user\s*\))',
            r'\1# Handle Swagger schema generation\n        if getattr(self, \'swagger_fake_view\', False):\n            return Conversation.objects.none()\n        \n        \2'
        ),
        # MessageViewSet get_queryset  
        (
            r'(def get_queryset\(self\):\s*"""Get messages for conversations user is part of"""\s*conversation_id = self\.kwargs\.get\(\'conversation_pk\'\)\s*if conversation_id:)(.*?)(return Message\.objects\.filter\(\s*conversation__participants=self\.request\.user\s*\))',
            r'\1\n            # Handle Swagger schema generation\n            if getattr(self, \'swagger_fake_view\', False):\n                return Message.objects.none()\n\2\3'
        )
    ]
    
    # Fix alistpros_profiles/views.py
    alistpros_fixes = [
        # ServiceRequestDetailView get_queryset
        (
            r'(def get_queryset\(self\):\s*user = self\.request\.user\s*)(if user\.role == \'client\':)',
            r'\1# Handle Swagger schema generation\n        if getattr(self, \'swagger_fake_view\', False):\n            return ServiceRequest.objects.none()\n        \n        \2'
        ),
        # ServiceQuoteDetailView get_queryset
        (
            r'(def get_queryset\(self\):\s*user = self\.request\.user\s*)(return ServiceQuote\.objects\.filter\()',
            r'\1# Handle Swagger schema generation\n        if getattr(self, \'swagger_fake_view\', False):\n            return ServiceQuote.objects.none()\n        \n        \2'
        ),
        # ServiceRequestListCreateView get_queryset
        (
            r'(def get_queryset\(self\):\s*user = self\.request\.user\s*)(if user\.role == \'client\':)',
            r'\1# Handle Swagger schema generation\n        if getattr(self, \'swagger_fake_view\', False):\n            return ServiceRequest.objects.none()\n        \n        \2'
        ),
        # ServiceQuoteListCreateView get_queryset
        (
            r'(def get_queryset\(self\):\s*user = self\.request\.user\s*\s*)(if user\.role == \'client\':)',
            r'\1# Handle Swagger schema generation\n        if getattr(self, \'swagger_fake_view\', False):\n            return ServiceQuote.objects.none()\n        \n        \2'
        )
    ]
    
    # Apply fixes
    files_to_fix = [
        ('server/messaging/views.py', messaging_fixes),
        ('server/alistpros_profiles/views.py', alistpros_fixes)
    ]
    
    fixed_count = 0
    for filepath, fixes in files_to_fix:
        if os.path.exists(filepath):
            if fix_file(filepath, fixes):
                fixed_count += 1
        else:
            print(f"❌ File not found: {filepath}")
    
    print("\n" + "=" * 50)
    print(f"🎉 Fixed {fixed_count} files")
    print("\n💡 Explanation of fixes:")
    print("- Added swagger_fake_view protection to ViewSet get_queryset methods")
    print("- This prevents AnonymousUser errors during Swagger schema generation")
    print("- Views will return empty querysets during documentation generation")
    print("- Normal operation remains unaffected")
    
    print("\n✅ Next steps:")
    print("1. Test Django server: python manage.py runserver")
    print("2. Check Swagger docs: http://localhost:8000/swagger/")
    print("3. Verify API functionality with real users")

if __name__ == "__main__":
    main() 