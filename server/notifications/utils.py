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
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from datetime import datetime, timedelta
import logging
from django.core.cache import cache
import json

# Mock shared_task decorator when celery is not available
try:
    from celery import shared_task
except ImportError:
    def shared_task(func):
        return func

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
            
            logger.info(f"SMS sent to {user.phone_number}: {title}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send SMS to {user.phone_number}: {str(e)}")
            return False
    
    @staticmethod
    def _send_push_notification(user, title, message, context, notification):
        """Send push notification (placeholder for push service integration)"""
        try:
            # This is a placeholder - integrate with push notification service
            # firebase_admin.messaging.send()
            
            # For now, we'll just log it
            logger.info(f"Push notification sent to {user.email}: {title}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send push notification to {user.email}: {str(e)}")
            return False


class QuickNotifications:
    """Quick utility functions for common notification types"""
    
    @staticmethod
    def new_message(recipient, sender, conversation, message):
        """Send notification for new message"""
        title = f"New message from {sender.name or sender.email.split('@')[0]}"
        content = message.content[:100] + ('...' if len(message.content) > 100 else '')
        
        return NotificationManager.create_notification(
            user=recipient,
            notification_type='MESSAGE',
            title=title,
            message=content,
            related_object=message,
            send_email=True,
            send_push=True,
            send_sms=False
        )
    
    @staticmethod
    def appointment_reminder(user, appointment):
        """Send appointment reminder notification"""
        title = "Appointment Reminder"
        message = f"You have an appointment with {appointment.alistpro.business_name} tomorrow at {appointment.start_time}"
        
        return NotificationManager.create_notification(
            user=user,
            notification_type='APPOINTMENT',
            title=title,
            message=message,
            related_object=appointment,
            send_email=True,
            send_push=True,
            send_sms=True
        )
    
    @staticmethod
    def payment_received(user, payment):
        """Send payment received notification"""
        title = "Payment Received"
        message = f"Payment of ${payment.amount} has been received for your service"
        
        return NotificationManager.create_notification(
            user=user,
            notification_type='PAYMENT',
            title=title,
            message=message,
            related_object=payment,
            send_email=True,
            send_push=True,
            send_sms=False
        )
    
    @staticmethod
    def new_review(professional, review):
        """Send new review notification"""
        title = "New Review Received"
        message = f"You received a {review.rating}-star review: {review.comment[:50]}..."
        
        return NotificationManager.create_notification(
            user=professional.user,
            notification_type='REVIEW',
            title=title,
            message=message,
            related_object=review,
            send_email=True,
            send_push=True,
            send_sms=False
        )
    
    @staticmethod
    def alistpro_verification_approved(user, profile):
        """Send A-List Home Pro verification approval notification"""
        title = "Congratulations! Your A-List Home Pro profile has been approved"
        message = "You can now start receiving service requests and building your client base."
        
        return NotificationManager.create_notification(
            user=user,
            notification_type='VERIFICATION',
            title=title,
            message=message,
            related_object=profile,
            send_email=True,
            send_push=True,
            send_sms=True
        )


def bulk_notify(users, notification_type, title, message, **kwargs):
    """Send notification to multiple users"""
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
    """Mark notifications as read"""
    qs = Notification.objects.filter(user=user, read=False)
    if notification_ids:
        qs = qs.filter(id__in=notification_ids)
    return qs.update(read=True, read_at=timezone.now())


def get_unread_count(user):
    """Get unread notification count for user"""
    return Notification.objects.filter(user=user, read=False).count()


def cleanup_old_notifications(days=30):
    """Clean up old read notifications"""
    cutoff_date = timezone.now() - timedelta(days=days)
    deleted_count = Notification.objects.filter(
        read=True,
        read_at__lt=cutoff_date
    ).delete()
    return deleted_count


def create_notification(user, notification_type, title, message, related_object_type=None, related_object_id=None, priority='medium'):
    """
    Create a notification for a user.
    
    Enhanced version with better error handling and logging.
    """
    try:
        # Validate input
        if not user or not notification_type or not title:
            logger.error(f"Invalid notification parameters: user={user}, type={notification_type}, title={title}")
            return None
        
        # Check if user wants this type of notification
        try:
            settings_obj = NotificationSetting.objects.get(user=user)
        except NotificationSetting.DoesNotExist:
            # Create default settings for user
            settings_obj = NotificationSetting.objects.create(user=user)
            logger.info(f"Created default notification settings for user {user.email}")
        
        # Create notification
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            related_object_type=related_object_type or '',
            related_object_id=related_object_id,
            priority=priority
        )
        
        logger.info(f"Created notification {notification.id} for user {user.email}: {title}")
        return notification
        
    except Exception as e:
        logger.error(f"Failed to create notification: {str(e)}")
        return None


# Celery tasks (will work with or without celery installed)
@shared_task
def queue_notification_delivery(notification_id):
    """
    Queue notification for delivery via email, SMS, and push
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.user
        settings_obj, _ = NotificationSetting.objects.get_or_create(user=user)
        
        # Send email if enabled
        if settings_obj.email_enabled:
            send_email_notification.delay(notification_id)
        
        # Send SMS if enabled
        if settings_obj.sms_enabled:
            send_sms_notification.delay(notification_id)
        
        # Send push if enabled
        if settings_obj.push_enabled:
            send_push_notification.delay(notification_id)
            
        logger.info(f"Queued delivery for notification {notification_id}")
            
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
    except Exception as e:
        logger.error(f"Failed to queue notification delivery: {str(e)}")


@shared_task
def send_email_notification(notification_id):
    """
    Send email notification
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.user
        
        if not user.email:
            logger.warning(f"User {user.id} has no email address")
            return False
        
        # Prepare email context
        context = {
            'user': user,
            'notification': notification,
            'site_name': getattr(settings, 'SITE_NAME', 'A-List Home Pros'),
            'site_url': getattr(settings, 'SITE_URL', 'https://alistpros.com'),
        }
        
        # Check for custom template
        template_name = f'notifications/email_{notification.notification_type.lower()}.html'
        
        try:
            # Try to render custom template first
            html_message = render_to_string(template_name, context)
        except:
            # Fall back to default template
            html_message = render_to_string('notifications/email_base.html', context)
        
        plain_message = strip_tags(html_message)
        
        # Send email
        email = EmailMultiAlternatives(
            subject=notification.title,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_message, "text/html")
        success = email.send()
        
        # Update notification status
        notification.email_status = 'SENT' if success else 'FAILED'
        notification.save()
        
        logger.info(f"Email notification sent to {user.email}: {notification.title}")
        return True
        
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
        return False
    except Exception as e:
        logger.error(f"Failed to send email notification: {str(e)}")
        return False


@shared_task
def send_sms_notification(notification_id):
    """
    Send SMS notification
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.user
        
        if not user.phone_number:
            logger.warning(f"User {user.email} has no phone number")
            return False
        
        # Prepare SMS content (keep it short)
        sms_content = f"{notification.title}: {notification.message[:100]}{'...' if len(notification.message) > 100 else ''}"
        
        # TODO: Integrate with SMS service (Twilio, etc.)
        # For now, just log the SMS
        logger.info(f"SMS would be sent to {user.phone_number}: {sms_content}")
        
        # Update notification status
        notification.sms_status = 'SENT'
        notification.save()
        
        return True
        
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
        return False
    except Exception as e:
        logger.error(f"Failed to send SMS notification: {str(e)}")
        return False


@shared_task
def send_push_notification(notification_id):
    """
    Send push notification
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        user = notification.user
        
        # TODO: Integrate with push notification service (Firebase, etc.)
        # For now, just log the push notification
        logger.info(f"Push notification would be sent to {user.email}: {notification.title}")
        
        # Send real-time notification via WebSocket if available
        send_realtime_notification.delay(user.id, {
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'type': notification.notification_type,
            'created_at': notification.created_at.isoformat()
        })
        
        # Update notification status
        notification.push_status = 'SENT'
        notification.save()
        
        return True
        
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
        return False
    except Exception as e:
        logger.error(f"Failed to send push notification: {str(e)}")
        return False


@shared_task
def send_realtime_notification(user_id, notification_data):
    """
    Send real-time notification via WebSocket
    """
    try:
        # TODO: Integrate with WebSocket/channels for real-time notifications
        logger.info(f"Real-time notification sent to user {user_id}: {notification_data['title']}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send real-time notification: {str(e)}")
        return False


def should_send_email_for_type(notification_type, settings):
    """Check if email should be sent for notification type"""
    mapping = {
        'MESSAGE': settings.new_message_email,
        'APPOINTMENT': settings.appointment_status_change_email,
        'PAYMENT': settings.payment_email,
        'MARKETING': settings.marketing_email,
    }
    return mapping.get(notification_type, True)


def should_send_sms_for_type(notification_type, settings):
    """Check if SMS should be sent for notification type"""
    mapping = {
        'MESSAGE': settings.new_message_sms,
        'APPOINTMENT': settings.appointment_status_change_sms,
        'PAYMENT': settings.payment_sms,
        'MARKETING': settings.marketing_sms,
    }
    return mapping.get(notification_type, False)


def should_send_push_for_type(notification_type, settings):
    """Check if push should be sent for notification type"""
    mapping = {
        'MESSAGE': settings.new_message_push,
        'APPOINTMENT': settings.appointment_status_change_push,
        'PAYMENT': settings.payment_push,
        'MARKETING': settings.marketing_push,
    }
    return mapping.get(notification_type, True)


def create_registration_notification(user):
    """Create welcome notification for new user"""
    return create_notification(
        user=user,
        notification_type='WELCOME',
        title='Welcome to A-List Home Pros!',
        message='Thank you for joining our platform. Get started by completing your profile.',
        priority='high'
    )


def create_alistpro_onboarding_notification(user):
    """Create onboarding notification for new A-List Home Pro"""
    return create_notification(
        user=user,
        notification_type='ONBOARDING',
        title='Complete Your A-List Home Pro Profile',
        message='Finish setting up your professional profile to start receiving service requests.',
        priority='high'
    )


def create_profile_update_notification(user):
    """Create notification for profile update"""
    return create_notification(
        user=user,
        notification_type='PROFILE',
        title='Profile Updated Successfully',
        message='Your profile information has been updated.',
        priority='low'
    )


def create_alistpro_verification_notification(user, verified=True):
    """Create notification for A-List Home Pro verification status"""
    if verified:
        title = 'Profile Verification Approved!'
        message = 'Congratulations! Your A-List Home Pro profile has been verified. You can now start receiving service requests.'
        priority = 'high'
    else:
        title = 'Profile Verification Needed'
        message = 'Your A-List Home Pro profile requires additional verification. Please check your profile and submit required documents.'
        priority = 'medium'
    
    return create_notification(
        user=user,
        notification_type='VERIFICATION',
        title=title,
        message=message,
        priority=priority
    )


def create_new_review_notification(professional, review):
    """Create notification for new review"""
    title = f"New {review.rating}-Star Review!"
    message = f"You received a new review: \"{review.comment[:50]}{'...' if len(review.comment) > 50 else ''}\""
    
    return create_notification(
        user=professional,
        notification_type='REVIEW',
        title=title,
        message=message,
        related_object_type='review',
        related_object_id=review.id,
        priority='medium'
    )


def get_unread_notification_count(user):
    """Get count of unread notifications for user"""
    try:
        count = Notification.objects.filter(user=user, read=False).count()
        return count
    except Exception as e:
        logger.error(f"Failed to get unread count for user {user.email}: {str(e)}")
        return 0


def bulk_create_notifications(users, notification_type, title, message, **kwargs):
    """Create notifications for multiple users efficiently"""
    notifications = []
    for user in users:
        notification = Notification(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            **kwargs
        )
        notifications.append(notification)
    
    created_notifications = Notification.objects.bulk_create(notifications)
    logger.info(f"Created {len(created_notifications)} bulk notifications")
    return created_notifications


@shared_task
def cleanup_old_notifications(days=30):
    """Clean up old read notifications"""
    cutoff_date = timezone.now() - timedelta(days=days)
    deleted_count, _ = Notification.objects.filter(
        read=True,
        read_at__lt=cutoff_date
    ).delete()
    logger.info(f"Cleaned up {deleted_count} old notifications")
    return deleted_count


@shared_task
def send_daily_digest(user_id):
    """Send daily digest of notifications"""
    try:
        user = User.objects.get(id=user_id)
        
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
        grouped = {}
        for notification in notifications:
            if notification.notification_type not in grouped:
                grouped[notification.notification_type] = []
            grouped[notification.notification_type].append(notification)
        
        # Create digest content
        digest_content = f"You have {notifications.count()} unread notifications:\n\n"
        for notif_type, notifs in grouped.items():
            digest_content += f"{notif_type.title()}: {len(notifs)} notifications\n"
        
        # Send digest email
        create_notification(
            user=user,
            notification_type='DIGEST',
            title='Daily Notification Digest',
            message=digest_content,
            priority='low'
        )
        
        logger.info(f"Sent daily digest to {user.email}")
        return True
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for daily digest")
        return False
    except Exception as e:
        logger.error(f"Failed to send daily digest: {str(e)}")
        return False
