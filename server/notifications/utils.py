from django.utils import timezone
from django.conf import settings
from .models import Notification, NotificationSetting

def create_notification(user, notification_type, title, message, related_object_type=None, related_object_id=None):
    """
    Create a new notification for a user
    
    Args:
        user: The user to notify
        notification_type: Type of notification (from Notification.NOTIFICATION_TYPES)
        title: Notification title
        message: Notification message
        related_object_type: Optional related object type (e.g., 'appointment', 'message')
        related_object_id: Optional related object ID
        
    Returns:
        The created notification instance
    """
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        related_object_type=related_object_type or '',
        related_object_id=related_object_id
    )
    
    # Get user notification settings
    try:
        settings = NotificationSetting.objects.get(user=user)
    except NotificationSetting.DoesNotExist:
        # Create default settings if they don't exist
        settings = NotificationSetting.objects.create(user=user)
    
    # TODO: Implement actual email, SMS, and push notification sending
    # For now, just mark as sent for demonstration purposes
    if settings.email_enabled:
        notification.email_status = 'SENT'
    
    if settings.sms_enabled:
        notification.sms_status = 'SENT'
    
    if settings.push_enabled:
        notification.push_status = 'SENT'
    
    notification.save()
    return notification

def create_registration_notification(user):
    """Create a notification for a new user registration"""
    return create_notification(
        user=user,
        notification_type='REGISTRATION',
        title='Welcome to A-List Home Pros!',
        message=f'Thank you for registering, {user.name}! Your account has been created successfully.'
    )

def create_alistpro_onboarding_notification(user):
    """Create a notification for A-List Home Pro onboarding"""
    return create_notification(
        user=user,
        notification_type='ALISTPRO_ONBOARDING',
        title='Start Your A-List Home Pro Onboarding',
        message='Welcome to A-List Home Pros! Please complete your profile to start receiving job requests.'
    )

def create_profile_update_notification(user):
    """Create a notification for profile updates"""
    return create_notification(
        user=user,
        notification_type='PROFILE_UPDATE',
        title='Profile Updated',
        message='Your profile has been updated successfully.'
    )

def create_alistpro_verification_notification(user, verified=False):
    """Create a notification for A-List Home Pro verification status"""
    if verified:
        title = 'Profile Verified!'
        message = 'Congratulations! Your A-List Home Pro profile has been verified. You can now receive job requests.'
    else:
        title = 'Profile Verification Update'
        message = 'Your A-List Home Pro profile verification is in progress. We will notify you once it is complete.'
    
    return create_notification(
        user=user,
        notification_type='ALISTPRO_VERIFICATION',
        title=title,
        message=message
    )

def create_new_review_notification(user, reviewer_name, rating):
    """Create a notification for a new review"""
    return create_notification(
        user=user,
        notification_type='REVIEW',
        title='New Review Received',
        message=f'You received a new {rating}-star review from {reviewer_name}.'
    )
