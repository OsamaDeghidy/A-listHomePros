#!/usr/bin/env python
"""
Script to update messaging and notifications system
تحديث نظام الرسائل والإشعارات
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from django.db import connection
from django.core.management import call_command

def update_messaging_system():
    """Update messaging system with enhanced features"""
    print("🔄 Updating messaging system...")
    
    # Create indexes for better performance
    with connection.cursor() as cursor:
        try:
            # Indexes for conversations
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversation_participants 
                ON messaging_conversation_participants (conversation_id, customuser_id);
            """)
        except Exception as e:
            print(f"⚠️ Index might already exist: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversation_updated 
                ON messaging_conversation (updated_at DESC);
            """)
        except Exception as e:
            print(f"⚠️ Index might already exist: {e}")
        
        try:
            # Indexes for messages
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_message_conversation_created 
                ON messaging_message (conversation_id, created_at DESC);
            """)
        except Exception as e:
            print(f"⚠️ Index might already exist: {e}")
        
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_message_sender 
                ON messaging_message (sender_id, created_at DESC);
            """)
        except Exception as e:
            print(f"⚠️ Index might already exist: {e}")
        
        try:
            # Indexes for notifications
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_notification_user_read 
                ON notifications_notification (user_id, read, created_at DESC);
            """)
        except Exception as e:
            print(f"⚠️ Index might already exist: {e}")
        
        print("✅ Database indexes created/verified")

def create_notification_templates():
    """Create notification templates"""
    from notifications.models import NotificationTemplate
    
    templates = [
        {
            'name': 'new_message',
            'subject': 'رسالة جديدة | New Message',
            'email_body': '''
                <h2>لديك رسالة جديدة من {sender_name}</h2>
                <p>{message_preview}</p>
                <a href="{conversation_url}">عرض المحادثة</a>
                
                <hr>
                
                <h2>You have a new message from {sender_name}</h2>
                <p>{message_preview}</p>
                <a href="{conversation_url}">View Conversation</a>
            ''',
            'sms_body': 'رسالة جديدة من {sender_name}: {message_preview}',
            'push_body': 'رسالة جديدة من {sender_name}'
        },
        {
            'name': 'appointment_reminder',
            'subject': 'تذكير بالموعد | Appointment Reminder',
            'email_body': '''
                <h2>تذكير: لديك موعد غداً</h2>
                <p>الخدمة: {service_name}</p>
                <p>الوقت: {appointment_time}</p>
                <p>العميل: {client_name}</p>
                
                <hr>
                
                <h2>Reminder: You have an appointment tomorrow</h2>
                <p>Service: {service_name}</p>
                <p>Time: {appointment_time}</p>
                <p>Client: {client_name}</p>
            ''',
            'sms_body': 'تذكير: موعد غداً {appointment_time} - {service_name}',
            'push_body': 'تذكير: موعد غداً الساعة {appointment_time}'
        },
        {
            'name': 'payment_received',
            'subject': 'تم استلام الدفعة | Payment Received',
            'email_body': '''
                <h2>تم استلام دفعة جديدة</h2>
                <p>المبلغ: ${amount}</p>
                <p>الخدمة: {service_name}</p>
                <p>العميل: {client_name}</p>
                
                <hr>
                
                <h2>Payment Received</h2>
                <p>Amount: ${amount}</p>
                <p>Service: {service_name}</p>
                <p>Client: {client_name}</p>
            ''',
            'sms_body': 'تم استلام ${amount} من {client_name}',
            'push_body': 'تم استلام دفعة ${amount}'
        },
        {
            'name': 'new_review',
            'subject': 'تقييم جديد | New Review',
            'email_body': '''
                <h2>لديك تقييم جديد</h2>
                <p>التقييم: {rating} نجوم</p>
                <p>من: {reviewer_name}</p>
                <p>التعليق: {review_text}</p>
                
                <hr>
                
                <h2>You have a new review</h2>
                <p>Rating: {rating} stars</p>
                <p>From: {reviewer_name}</p>
                <p>Comment: {review_text}</p>
            ''',
            'sms_body': 'تقييم جديد {rating} نجوم من {reviewer_name}',
            'push_body': 'تقييم جديد: {rating} نجوم'
        }
    ]
    
    for template_data in templates:
        template, created = NotificationTemplate.objects.update_or_create(
            name=template_data['name'],
            defaults=template_data
        )
        if created:
            print(f"✅ Created template: {template.name}")
        else:
            print(f"📝 Updated template: {template.name}")

def create_sample_data():
    """Create sample conversations and notifications for testing"""
    from django.contrib.auth import get_user_model
    from messaging.models import Conversation, Message
    from notifications.models import Notification
    from notifications.utils import create_notification
    
    User = get_user_model()
    
    # Get or create test users
    client, _ = User.objects.get_or_create(
        email='client@example.com',
        defaults={
            'name': 'Test Client',
            'phone_number': '+1234567890',
            'role': 'client'
        }
    )
    
    pro, _ = User.objects.get_or_create(
        email='pro@example.com',
        defaults={
            'name': 'Test Professional',
            'phone_number': '+0987654321',
            'role': 'contractor'
        }
    )
    
    # Create a conversation
    conversation, created = Conversation.objects.get_or_create(
        title='Test Conversation'
    )
    if created:
        conversation.participants.add(client, pro)
        print("✅ Created test conversation")
    
    # Create messages
    if created:
        Message.objects.create(
            conversation=conversation,
            sender=client,
            content='مرحباً، أحتاج خدمة سباكة | Hello, I need plumbing service'
        )
        
        Message.objects.create(
            conversation=conversation,
            sender=pro,
            content='أهلاً، يمكنني المساعدة | Hi, I can help'
        )
        print("✅ Created test messages")
    
    # Create notifications
    create_notification(
        user=pro,
        notification_type='MESSAGE',
        title='رسالة جديدة | New Message',
        message='لديك رسالة جديدة من Test Client',
        related_object_type='conversation',
        related_object_id=conversation.id
    )
    
    create_notification(
        user=pro,
        notification_type='APPOINTMENT',
        title='موعد جديد | New Appointment',
        message='لديك موعد جديد يوم الأحد الساعة 2:00 م'
    )
    
    print("✅ Created test notifications")

def main():
    """Main function"""
    print("🚀 Starting messaging and notifications update...")
    
    try:
        # Run migrations
        print("\n📦 Running migrations...")
        try:
            call_command('makemigrations', 'messaging')
        except Exception as e:
            print(f"⚠️ Messaging migrations: {e}")
        
        try:
            call_command('makemigrations', 'notifications')
        except Exception as e:
            print(f"⚠️ Notifications migrations: {e}")
        
        call_command('migrate')
        
        # Update database
        update_messaging_system()
        
        # Create templates
        print("\n📄 Creating notification templates...")
        create_notification_templates()
        
        # Create sample data
        print("\n🎯 Creating sample data...")
        create_sample_data()
        
        print("\n✅ Update completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main() 