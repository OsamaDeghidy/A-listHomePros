"""
Enhanced notification utilities for A-List Home Pro platform
Handles various notification types and delivery methods with improved performance
"""

import uuid
from typing import List, Dict, Optional, Any
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
import logging
from celery import shared_task
from django.core.cache import cache
import json

from .models import (
    Notification, 
    NotificationTemplate, 
    NotificationSetting,
    SMSVerification
)

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationManager:
    """Enhanced notification manager with multiple delivery channels"""
    
    @staticmethod
    def create_notification(
        user, 
        notification_type, 
        title, 
        message, 
        related_object=None,
        template_name=None,
        context=None,
        send_email=True,
        send_sms=False,
        send_push=True
    ):
        """
        Create and send a notification with multiple delivery options
        """
        try:
            # Create the notification record
            notification = Notification.objects.create(
                user=user,
                notification_type=notification_type,
                title=title,
                message=message,
                related_object_type=ContentType.objects.get_for_model(related_object).model if related_object else '',
                related_object_id=related_object.id if related_object else None
            )
            
            # Get user notification preferences
            settings_obj, _ = NotificationSetting.objects.get_or_create(user=user)
            
            # Prepare context for templates
            if context is None:
                context = {}
            context.update({
                'user': user,
                'notification': notification,
                'title': title,
                'message': message,
                'site_name': getattr(settings, 'SITE_NAME', 'A-List Home Pros'),
                'site_url': getattr(settings, 'SITE_URL', 'https://alistpros.com'),
            })
            
            # Send via different channels based on user preferences
            delivery_results = {
                'email': False,
                'sms': False,
                'push': False
            }
            
            # Email notification
            if send_email and settings_obj.email_enabled and NotificationManager._should_send_email(notification_type, settings_obj):
                delivery_results['email'] = NotificationManager._send_email_notification(
                    user, title, message, template_name, context, notification
                )
                notification.email_status = 'SENT' if delivery_results['email'] else 'FAILED'
            
            # SMS notification
            if send_sms and settings_obj.sms_enabled and NotificationManager._should_send_sms(notification_type, settings_obj):
                delivery_results['sms'] = NotificationManager._send_sms_notification(
                    user, title, message, context, notification
                )
                notification.sms_status = 'SENT' if delivery_results['sms'] else 'FAILED'
            
            # Push notification
            if send_push and settings_obj.push_enabled and NotificationManager._should_send_push(notification_type, settings_obj):
                delivery_results['push'] = NotificationManager._send_push_notification(
                    user, title, message, context, notification
                )
                notification.push_status = 'SENT' if delivery_results['push'] else 'FAILED'
            
            notification.save()
            
            logger.info(f"Notification created for {user.email}: {title}")
            return notification, delivery_results
            
        except Exception as e:
            logger.error(f"Failed to create notification for {user.email}: {str(e)}")
            return None, {'email': False, 'sms': False, 'push': False}
    
    @staticmethod
    def _should_send_email(notification_type, settings_obj):
        """Check if email should be sent based on user preferences"""
        type_mapping = {
            'MESSAGE': settings_obj.new_message_email,
            'APPOINTMENT': settings_obj.appointment_status_change_email,
            'PAYMENT': settings_obj.payment_email,
            'MARKETING': settings_obj.marketing_email,
        }
        return type_mapping.get(notification_type, True)
    
    @staticmethod
    def _should_send_sms(notification_type, settings_obj):
        """Check if SMS should be sent based on user preferences"""
        type_mapping = {
            'MESSAGE': settings_obj.new_message_sms,
            'APPOINTMENT': settings_obj.appointment_status_change_sms,
            'PAYMENT': settings_obj.payment_sms,
            'MARKETING': settings_obj.marketing_sms,
        }
        return type_mapping.get(notification_type, False)
    
    @staticmethod
    def _should_send_push(notification_type, settings_obj):
        """Check if push notification should be sent based on user preferences"""
        type_mapping = {
            'MESSAGE': settings_obj.new_message_push,
            'APPOINTMENT': settings_obj.appointment_status_change_push,
            'PAYMENT': settings_obj.payment_push,
            'MARKETING': settings_obj.marketing_push,
        }
        return type_mapping.get(notification_type, True)
    
    @staticmethod
    def _send_email_notification(user, title, message, template_name, context, notification):
        """Send email notification"""
        try:
            if template_name:
                # Use custom template
                try:
                    template = NotificationTemplate.objects.get(name=template_name)
                    subject = template.subject.format(**context)
                    html_message = template.email_body.format(**context)
                except NotificationTemplate.DoesNotExist:
                    # Fallback to default template
                    subject = title
                    html_message = render_to_string('notifications/email_base.html', context)
            else:
                # Use default template
                subject = title
                context['message'] = message
                html_message = render_to_string('notifications/email_base.html', context)
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False
            )
            
            logger.info(f"Email sent to {user.email}: {title}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def _send_sms_notification(user, title, message, context, notification):
        """Send SMS notification (placeholder for SMS service integration)"""
        try:
            # This is a placeholder - integrate with your SMS service (Twilio, etc.)
            if not user.phone_number:
                logger.warning(f"No phone number for user {user.email}")
                return False
            
            # SMS content should be shorter
            sms_content = f"{title}: {message[:100]}{'...' if len(message) > 100 else ''}"
            
            # TODO: Integrate with SMS service
            # twilio_client.messages.create(
            #     body=sms_content,
            #     from_=settings.TWILIO_PHONE_NUMBER,
            #     to=user.phone_number
            # )
            
            logger.info(f"SMS would be sent to {user.phone_number}: {title}")
            return True  # Return True for now (placeholder)
            
        except Exception as e:
            logger.error(f"Failed to send SMS to {user.phone_number}: {str(e)}")
            return False
    
    @staticmethod
    def _send_push_notification(user, title, message, context, notification):
        """Send push notification (placeholder for push service integration)"""
        try:
            # This is a placeholder - integrate with your push service (Firebase, etc.)
            push_data = {
                'title': title,
                'body': message[:200],  # Limit push notification body
                'user_id': user.id,
                'notification_id': notification.id,
                'type': notification.notification_type,
                'timestamp': notification.created_at.isoformat()
            }
            
            # TODO: Integrate with push notification service
            # firebase_admin.messaging.send(
            #     firebase_admin.messaging.Message(
            #         notification=firebase_admin.messaging.Notification(
            #             title=title,
            #             body=message[:200]
            #         ),
            #         data=push_data,
            #         token=user.device_token  # Assuming you store device tokens
            #     )
            # )
            
            logger.info(f"Push notification would be sent to {user.email}: {title}")
            return True  # Return True for now (placeholder)
            
        except Exception as e:
            logger.error(f"Failed to send push notification to {user.email}: {str(e)}")
            return False


class QuickNotifications:
    """Quick notification helpers for common scenarios"""
    
    @staticmethod
    def new_message(recipient, sender, conversation, message):
        """Notify user about new message"""
        title = f"New message from {sender.name or sender.email.split('@')[0]}"
        content = f"{message.content[:100]}{'...' if len(message.content) > 100 else ''}"
        
        return NotificationManager.create_notification(
            user=recipient,
            notification_type='MESSAGE',
            title=title,
            message=content,
            related_object=conversation,
            template_name='new_message',
            context={
                'sender': sender,
                'conversation': conversation,
                'message': message
            }
        )
    
    @staticmethod
    def appointment_reminder(user, appointment):
        """Send appointment reminder"""
        title = f"Appointment Reminder"
        content = f"You have an appointment tomorrow at {appointment.start_time}"
        
        return NotificationManager.create_notification(
            user=user,
            notification_type='APPOINTMENT',
            title=title,
            message=content,
            related_object=appointment,
            template_name='appointment_reminder',
            context={'appointment': appointment}
        )
    
    @staticmethod
    def payment_received(user, payment):
        """Notify about payment received"""
        title = f"Payment Received"
        content = f"You received a payment of ${payment.amount}"
        
        return NotificationManager.create_notification(
            user=user,
            notification_type='PAYMENT',
            title=title,
            message=content,
            related_object=payment,
            template_name='payment_received',
            context={'payment': payment}
        )
    
    @staticmethod
    def new_review(professional, review):
        """Notify professional about new review"""
        title = f"New Review Received"
        content = f"You received a {review.rating}-star review"
        
        return NotificationManager.create_notification(
            user=professional,
            notification_type='REVIEW',
            title=title,
            message=content,
            related_object=review,
            template_name='new_review',
            context={'review': review}
        )
    
    @staticmethod
    def alistpro_verification_approved(user, profile):
        """Notify about A-List Pro verification approval"""
        title = f"Congratulations! Your A-List Pro profile has been approved"
        content = f"You can now start receiving service requests and grow your business with us."
        
        return NotificationManager.create_notification(
            user=user,
            notification_type='ALISTPRO_VERIFICATION',
            title=title,
            message=content,
            related_object=profile,
            template_name='alistpro_approved',
            context={'profile': profile}
        )


def bulk_notify(users, notification_type, title, message, **kwargs):
    """Send bulk notifications to multiple users"""
    results = []
    for user in users:
        notification, delivery = NotificationManager.create_notification(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            **kwargs
        )
        results.append((user, notification, delivery))
    return results


def mark_notifications_read(user, notification_ids=None):
    """Mark notifications as read for a user"""
    queryset = user.system_notifications.filter(read=False)
    if notification_ids:
        queryset = queryset.filter(id__in=notification_ids)
    
    updated = queryset.update(read=True, read_at=timezone.now())
    return updated


def get_unread_count(user):
    """Get unread notification count for a user"""
    return user.system_notifications.filter(read=False).count()


def cleanup_old_notifications(days=30):
    """Clean up old read notifications"""
    cutoff_date = timezone.now() - timezone.timedelta(days=days)
    deleted_count = Notification.objects.filter(
        read=True,
        created_at__lt=cutoff_date
    ).delete()[0]
    
    logger.info(f"Cleaned up {deleted_count} old notifications")
    return deleted_count


def create_notification(user, notification_type, title, message, related_object_type=None, related_object_id=None, priority='medium'):
    """
    Create a new notification for a user with enhanced features
    
    Args:
        user: User object to send notification to
        notification_type: Type of notification (MESSAGE, APPOINTMENT, etc.)
        title: Notification title
        message: Notification message
        related_object_type: Type of related object (optional)
        related_object_id: ID of related object (optional)
        priority: Notification priority (low, medium, high)
    
    Returns:
        Notification object
    """
    try:
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            related_object_type=related_object_type or '',
            related_object_id=related_object_id
        )
        
        # Queue notification delivery
        queue_notification_delivery.delay(notification.id)
        
        # Send real-time notification via WebSocket
        send_realtime_notification.delay(user.id, {
            'id': notification.id,
            'type': notification_type,
            'title': title,
            'message': message,
            'created_at': notification.created_at.isoformat(),
            'priority': priority
        })
        
        # Update user's unread count cache
        cache_key = f"user_{user.id}_unread_notifications"
        cache.delete(cache_key)
        
        logger.info(f"Notification created for {user.email}: {title}")
        return notification
        
    except Exception as e:
        logger.error(f"Failed to create notification for {user.email}: {str(e)}")
        return None


@shared_task
def queue_notification_delivery(notification_id):
    """Queue notification for delivery via different channels"""
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.user
        
        # Get user's notification settings
        try:
            settings_obj = NotificationSetting.objects.get(user=user)
        except NotificationSetting.DoesNotExist:
            # Create default settings
            settings_obj = NotificationSetting.objects.create(user=user)
        
        # Send email if enabled
        if should_send_email_for_type(notification.notification_type, settings_obj):
            send_email_notification.delay(notification_id)
        
        # Send SMS if enabled
        if should_send_sms_for_type(notification.notification_type, settings_obj):
            send_sms_notification.delay(notification_id)
        
        # Send push notification if enabled
        if should_send_push_for_type(notification.notification_type, settings_obj):
            send_push_notification.delay(notification_id)
            
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")


@shared_task
def send_email_notification(notification_id):
    """Send email notification"""
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.user
        
        # Try to get template
        template_name = f"{notification.notification_type.lower()}_notification"
        try:
            template = NotificationTemplate.objects.get(name=template_name)
            subject = template.subject.format(title=notification.title)
            html_content = template.email_body.format(
                user_name=user.name or user.email.split('@')[0],
                title=notification.title,
                message=notification.message,
                site_name=getattr(settings, 'SITE_NAME', 'A-List Home Pros'),
                action_url=f"{getattr(settings, 'FRONTEND_URL', '')}/notifications/{notification.id}"
            )
        except NotificationTemplate.DoesNotExist:
            # Use default template
            subject = notification.title
            html_content = render_to_string('notifications/email/default.html', {
                'user_name': user.name or user.email.split('@')[0],
                'title': notification.title,
                'message': notification.message,
                'site_name': getattr(settings, 'SITE_NAME', 'A-List Home Pros'),
                'action_url': f"{getattr(settings, 'FRONTEND_URL', '')}/notifications/{notification.id}"
            })
        
        plain_content = strip_tags(html_content)
        
        # Send email
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_content,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@alistpros.com'),
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        # Update delivery status
        notification.email_status = 'SENT'
        notification.save(update_fields=['email_status'])
        
        logger.info(f"Email notification sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email notification {notification_id}: {str(e)}")
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.email_status = 'FAILED'
            notification.save(update_fields=['email_status'])
        except:
            pass
        return False


@shared_task
def send_sms_notification(notification_id):
    """Send SMS notification (placeholder for SMS service integration)"""
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.user
        
        # Get user's phone number
        phone_number = getattr(user, 'phone_number', None)
        if not phone_number:
            logger.warning(f"No phone number for user {user.email}")
            return False
        
        # Try to get SMS template
        template_name = f"{notification.notification_type.lower()}_notification"
        try:
            template = NotificationTemplate.objects.get(name=template_name)
            sms_content = template.sms_body.format(
                user_name=user.name or user.email.split('@')[0],
                title=notification.title,
                message=notification.message[:100] + ('...' if len(notification.message) > 100 else '')
            )
        except NotificationTemplate.DoesNotExist:
            # Use default SMS content
            sms_content = f"{notification.title}: {notification.message[:100]}..."
        
        # TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
        # For now, just log the SMS
        logger.info(f"SMS would be sent to {phone_number}: {sms_content}")
        
        # Update delivery status
        notification.sms_status = 'SENT'
        notification.save(update_fields=['sms_status'])
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to send SMS notification {notification_id}: {str(e)}")
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.sms_status = 'FAILED'
            notification.save(update_fields=['sms_status'])
        except:
            pass
        return False


@shared_task
def send_push_notification(notification_id):
    """Send push notification (placeholder for push service integration)"""
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.user
        
        # Try to get push template
        template_name = f"{notification.notification_type.lower()}_notification"
        try:
            template = NotificationTemplate.objects.get(name=template_name)
            push_content = template.push_body.format(
                user_name=user.name or user.email.split('@')[0],
                title=notification.title,
                message=notification.message[:200] + ('...' if len(notification.message) > 200 else '')
            )
        except NotificationTemplate.DoesNotExist:
            # Use default push content
            push_content = notification.message[:200] + ('...' if len(notification.message) > 200 else '')
        
        # TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
        # For now, just log the push notification
        logger.info(f"Push notification would be sent to user {user.id}: {notification.title}")
        
        # Update delivery status
        notification.push_status = 'SENT'
        notification.save(update_fields=['push_status'])
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to send push notification {notification_id}: {str(e)}")
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.push_status = 'FAILED'
            notification.save(update_fields=['push_status'])
        except:
            pass
        return False


@shared_task
def send_realtime_notification(user_id, notification_data):
    """Send real-time notification via WebSocket"""
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        group_name = f'notifications_{user_id}'
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'notification_message',
                'notification': notification_data
            }
        )
        
        logger.info(f"Real-time notification sent to user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send real-time notification to user {user_id}: {str(e)}")
        return False


# Helper functions for notification settings
def should_send_email_for_type(notification_type, settings):
    """Check if email should be sent for notification type"""
    if not settings.email_enabled:
        return False
    
    type_mapping = {
        'MESSAGE': settings.new_message_email,
        'APPOINTMENT': settings.appointment_reminder_email,
        'PAYMENT': settings.payment_email,
        'MARKETING': settings.marketing_email,
    }
    
    return type_mapping.get(notification_type, True)


def should_send_sms_for_type(notification_type, settings):
    """Check if SMS should be sent for notification type"""
    if not settings.sms_enabled:
        return False
    
    type_mapping = {
        'MESSAGE': settings.new_message_sms,
        'APPOINTMENT': settings.appointment_reminder_sms,
        'PAYMENT': settings.payment_sms,
        'MARKETING': settings.marketing_sms,
    }
    
    return type_mapping.get(notification_type, False)


def should_send_push_for_type(notification_type, settings):
    """Check if push notification should be sent for notification type"""
    if not settings.push_enabled:
        return False
    
    type_mapping = {
        'MESSAGE': settings.new_message_push,
        'APPOINTMENT': settings.appointment_reminder_push,
        'PAYMENT': settings.payment_push,
        'MARKETING': settings.marketing_push,
    }
    
    return type_mapping.get(notification_type, True)


# Enhanced convenience functions
def create_registration_notification(user):
    """Create welcome notification for new user registration"""
    title = "Welcome to A-List Home Pros!"
    message = (
        f"Welcome {user.name or user.email}! Thank you for joining A-List Home Pros. "
        "We're excited to help you connect with top-quality home service professionals."
    )
    
    return create_notification(
        user=user,
        notification_type='REGISTRATION',
        title=title,
        message=message,
        priority='medium'
    )


def create_alistpro_onboarding_notification(user):
    """Create onboarding notification for A-List Pro"""
    title = "Complete Your A-List Pro Profile"
    message = (
        "Welcome to the A-List Pro network! Complete your professional profile "
        "to start receiving service requests and grow your business with us."
    )
    
    return create_notification(
        user=user,
        notification_type='ALISTPRO_ONBOARDING',
        title=title,
        message=message,
        priority='high'
    )


def create_profile_update_notification(user):
    """Create notification for profile updates"""
    title = "Profile Updated Successfully"
    message = "Your profile has been updated successfully. Changes are now visible to clients."
    
    return create_notification(
        user=user,
        notification_type='PROFILE_UPDATE',
        title=title,
        message=message,
        priority='low'
    )


def create_alistpro_verification_notification(user, verified=True):
    """Create notification for A-List Pro verification status"""
    if verified:
        title = "Congratulations! Your A-List Pro Profile is Verified"
        message = (
            "Your professional profile has been verified and approved. "
            "You can now start receiving service requests and build your client base."
        )
        priority = 'high'
    else:
        title = "A-List Pro Profile Verification Required"
        message = (
            "Additional information is needed to verify your professional profile. "
            "Please update your profile with the required documentation."
        )
        priority = 'medium'
    
    return create_notification(
        user=user,
        notification_type='ALISTPRO_VERIFICATION',
        title=title,
        message=message,
        priority=priority
    )


def create_new_review_notification(professional, review):
    """Create notification for new review received"""
    title = "New Review Received"
    rating_stars = "⭐" * review.rating
    message = f"You received a new {review.rating}-star review: {rating_stars}\n\"{review.comment[:100]}...\""
    
    return create_notification(
        user=professional,
        notification_type='REVIEW',
        title=title,
        message=message,
        related_object_type='review',
        related_object_id=review.id,
        priority='medium'
    )


# Utility functions
def get_unread_notification_count(user):
    """Get unread notification count for user with caching"""
    cache_key = f"user_{user.id}_unread_notifications"
    count = cache.get(cache_key)
    
    if count is None:
        count = Notification.objects.filter(user=user, read=False).count()
        cache.set(cache_key, count, 300)  # 5 minutes cache
    
    return count


def bulk_create_notifications(users, notification_type, title, message, **kwargs):
    """Create notifications for multiple users efficiently"""
    notifications = []
    for user in users:
        notification = create_notification(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            **kwargs
        )
        if notification:
            notifications.append(notification)
    return notifications


@shared_task
def cleanup_old_notifications(days=30):
    """Clean up old read notifications"""
    cutoff_date = timezone.now() - timedelta(days=days)
    deleted_count = Notification.objects.filter(
        read=True,
        created_at__lt=cutoff_date
    ).delete()[0]
    
    logger.info(f"Cleaned up {deleted_count} old notifications")
    return deleted_count


@shared_task
def send_daily_digest(user_id):
    """Send daily notification digest to user"""
    try:
        user = User.objects.get(id=user_id)
        
        # Get user's notification settings
        try:
            settings_obj = NotificationSetting.objects.get(user=user)
            if not settings_obj.email_enabled:
                return False
        except NotificationSetting.DoesNotExist:
            return False
        
        # Get unread notifications from last 24 hours
        yesterday = timezone.now() - timedelta(days=1)
        notifications = Notification.objects.filter(
            user=user,
            read=False,
            created_at__gte=yesterday
        ).order_by('-created_at')
        
        if not notifications.exists():
            return False
        
        # Group notifications by type
        grouped_notifications = {}
        for notification in notifications:
            if notification.notification_type not in grouped_notifications:
                grouped_notifications[notification.notification_type] = []
            grouped_notifications[notification.notification_type].append(notification)
        
        # Send digest email
        subject = f"Daily Notification Summary - {notifications.count()} unread notifications"
        html_content = render_to_string('notifications/email/daily_digest.html', {
            'user_name': user.name or user.email.split('@')[0],
            'grouped_notifications': grouped_notifications,
            'total_count': notifications.count(),
            'site_name': getattr(settings, 'SITE_NAME', 'A-List Home Pros'),
            'unsubscribe_url': f"{getattr(settings, 'FRONTEND_URL', '')}/notifications/settings"
        })
        
        plain_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_content,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@alistpros.com'),
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f"Daily digest sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send daily digest to user {user_id}: {str(e)}")
        return False
