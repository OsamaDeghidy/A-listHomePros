from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class NotificationTemplate(TimeStampedModel):
    """Template for notifications"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    subject = models.CharField(max_length=255)
    email_body = models.TextField()
    sms_body = models.TextField(blank=True)
    push_body = models.TextField(blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class NotificationSetting(TimeStampedModel):
    """User notification preferences"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_settings'
    )
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=True)
    
    # Specific notification types
    new_message_email = models.BooleanField(default=True)
    new_message_sms = models.BooleanField(default=False)
    new_message_push = models.BooleanField(default=True)
    
    appointment_reminder_email = models.BooleanField(default=True)
    appointment_reminder_sms = models.BooleanField(default=False)
    appointment_reminder_push = models.BooleanField(default=True)
    
    appointment_status_change_email = models.BooleanField(default=True)
    appointment_status_change_sms = models.BooleanField(default=False)
    appointment_status_change_push = models.BooleanField(default=True)
    
    payment_email = models.BooleanField(default=True)
    payment_sms = models.BooleanField(default=False)
    payment_push = models.BooleanField(default=True)
    
    marketing_email = models.BooleanField(default=True)
    marketing_sms = models.BooleanField(default=False)
    marketing_push = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Notification Setting'
        verbose_name_plural = 'Notification Settings'
    
    def __str__(self):
        return f"Notification settings for {self.user.email}"


class Notification(TimeStampedModel):
    """System notification record"""
    NOTIFICATION_TYPES = (
        ('MESSAGE', 'New Message'),
        ('APPOINTMENT', 'Appointment Update'),
        ('PAYMENT', 'Payment Update'),
        ('SYSTEM', 'System Notification'),
        ('MARKETING', 'Marketing'),
        ('REGISTRATION', 'User Registration'),
        ('PROFILE_UPDATE', 'Profile Update'),
        ('ALISTPRO_ONBOARDING', 'A-List Home Pro Onboarding'),
        ('ALISTPRO_VERIFICATION', 'A-List Home Pro Verification'),
        ('REVIEW', 'New Review'),
    )
    
    DELIVERY_STATUSES = (
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
        ('READ', 'Read'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='system_notifications'
    )
    notification_type = models.CharField(max_length=25, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Related objects
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    
    # Delivery tracking
    email_status = models.CharField(max_length=20, choices=DELIVERY_STATUSES, default='PENDING')
    sms_status = models.CharField(max_length=20, choices=DELIVERY_STATUSES, default='PENDING')
    push_status = models.CharField(max_length=20, choices=DELIVERY_STATUSES, default='PENDING')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} for {self.user.email}: {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        from django.utils import timezone
        self.read = True
        self.read_at = timezone.now()
        self.save(update_fields=['read', 'read_at'])


class SMSVerification(TimeStampedModel):
    """SMS verification codes"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sms_verifications'
    )
    phone_number = models.CharField(max_length=20)
    verification_code = models.CharField(max_length=10)
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"SMS verification for {self.phone_number}"
    
    def is_expired(self):
        """Check if verification code is expired"""
        from django.utils import timezone
        return timezone.now() > self.expires_at
