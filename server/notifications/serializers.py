from rest_framework import serializers
from .models import NotificationTemplate, NotificationSetting, Notification, SMSVerification


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for notification templates"""
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'description', 'subject', 
            'email_body', 'sms_body', 'push_body',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationSettingSerializer(serializers.ModelSerializer):
    """Serializer for user notification settings"""
    class Meta:
        model = NotificationSetting
        fields = [
            'id', 'user', 'email_enabled', 'sms_enabled', 'push_enabled',
            'new_message_email', 'new_message_sms', 'new_message_push',
            'appointment_reminder_email', 'appointment_reminder_sms', 'appointment_reminder_push',
            'appointment_status_change_email', 'appointment_status_change_sms', 'appointment_status_change_push',
            'payment_email', 'payment_sms', 'payment_push',
            'marketing_email', 'marketing_sms', 'marketing_push',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message',
            'read', 'read_at', 'related_object_type', 'related_object_id',
            'email_status', 'sms_status', 'push_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SMSVerificationSerializer(serializers.ModelSerializer):
    """Serializer for SMS verification"""
    class Meta:
        model = SMSVerification
        fields = [
            'id', 'user', 'phone_number', 'verification_code',
            'is_verified', 'expires_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'expires_at', 'created_at', 'updated_at']
        extra_kwargs = {
            'verification_code': {'write_only': True}
        }


class VerifyPhoneNumberSerializer(serializers.Serializer):
    """Serializer for verifying phone number"""
    phone_number = serializers.CharField(max_length=20)
    verification_code = serializers.CharField(max_length=10)


class NotificationBulkMarkReadSerializer(serializers.Serializer):
    """Serializer for marking multiple notifications as read"""
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
