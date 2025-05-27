from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import NotificationTemplate, NotificationSetting, Notification, SMSVerification


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'subject', 'email_preview', 'sms_preview', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'subject', 'description', 'email_body', 'sms_body', 'push_body']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'subject')
        }),
        ('Message Content', {
            'fields': ('email_body', 'sms_body', 'push_body'),
            'classes': ('wide', 'extrapretty'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def email_preview(self, obj):
        return obj.email_body[:50] + '...' if len(obj.email_body) > 50 else obj.email_body
    email_preview.short_description = 'Email Preview'
    
    def sms_preview(self, obj):
        if not obj.sms_body:
            return "-"
        return obj.sms_body[:30] + '...' if len(obj.sms_body) > 30 else obj.sms_body
    sms_preview.short_description = 'SMS Preview'


@admin.register(NotificationSetting)
class NotificationSettingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email', 'email_status', 'sms_status', 'push_status', 'created_at', 'updated_at']
    list_filter = ['email_enabled', 'sms_enabled', 'push_enabled', 'marketing_email', 'created_at']
    search_fields = ['user__email', 'user__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Global Settings', {
            'fields': ('email_enabled', 'sms_enabled', 'push_enabled'),
        }),
        ('Messages', {
            'fields': ('new_message_email', 'new_message_sms', 'new_message_push'),
            'classes': ('collapse',),
        }),
        ('Appointments', {
            'fields': ('appointment_reminder_email', 'appointment_reminder_sms', 'appointment_reminder_push',
                      'appointment_status_change_email', 'appointment_status_change_sms', 'appointment_status_change_push'),
            'classes': ('collapse',),
        }),
        ('Payments', {
            'fields': ('payment_email', 'payment_sms', 'payment_push'),
            'classes': ('collapse',),
        }),
        ('Marketing', {
            'fields': ('marketing_email', 'marketing_sms', 'marketing_push'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def email_status(self, obj):
        if obj.email_enabled:
            return format_html('<span style="color: green;">✓ Enabled</span>')
        return format_html('<span style="color: gray;">✗ Disabled</span>')
    email_status.short_description = 'Email'
    
    def sms_status(self, obj):
        if obj.sms_enabled:
            return format_html('<span style="color: green;">✓ Enabled</span>')
        return format_html('<span style="color: gray;">✗ Disabled</span>')
    sms_status.short_description = 'SMS'
    
    def push_status(self, obj):
        if obj.push_enabled:
            return format_html('<span style="color: green;">✓ Enabled</span>')
        return format_html('<span style="color: gray;">✗ Disabled</span>')
    push_status.short_description = 'Push'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email', 'notification_type_badge', 'title', 'message_preview', 'read', 'read_status', 'created_at']
    list_filter = ['notification_type', 'read', 'email_status', 'sms_status', 'push_status', 'created_at']
    search_fields = ['user__email', 'user__name', 'title', 'message']
    readonly_fields = ['created_at', 'updated_at', 'read_at']
    list_editable = ['read']
    actions = ['mark_as_read', 'mark_as_unread']
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'notification_type', 'title', 'message')
        }),
        ('Status', {
            'fields': ('read', 'read_at')
        }),
        ('Related Objects', {
            'fields': ('related_object_type', 'related_object_id'),
            'classes': ('collapse',),
        }),
        ('Delivery Tracking', {
            'fields': ('email_status', 'sms_status', 'push_status'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email if obj.user else "No User"
    user_email.short_description = "User"
    
    def message_preview(self, obj):
        return obj.message[:50] + "..." if len(obj.message) > 50 else obj.message
    message_preview.short_description = "Message Preview"
    
    def notification_type_badge(self, obj):
        badge_colors = {
            'system': 'blue',
            'booking': 'green',
            'payment': 'purple',
            'message': 'indigo',
            'review': 'yellow',
            'marketing': 'red',
            'security': 'orange',
        }
        color = badge_colors.get(obj.notification_type, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px;">{}</span>',
            color, obj.notification_type.title()
        )
    notification_type_badge.short_description = "Type"
    
    def read_status(self, obj):
        if obj.read:
            return format_html('<span style="color: green;">✓ Read</span>')
        return format_html('<span style="color: red;">✗ Unread</span>')
    read_status.short_description = "Status"
    
    def mark_as_read(self, request, queryset):
        queryset.update(read=True)
    mark_as_read.short_description = "Mark selected notifications as read"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(read=False)
    mark_as_unread.short_description = "Mark selected notifications as unread"


@admin.register(SMSVerification)
class SMSVerificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email', 'phone_number', 'verification_code', 'is_verified', 'expires_at', 'status', 'created_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['user__email', 'user__name', 'phone_number', 'verification_code']
    readonly_fields = ['created_at', 'updated_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def status(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: green;">✓ Verified</span>')
        elif obj.is_expired():
            return format_html('<span style="color: red;">✗ Expired</span>')
        else:
            return format_html('<span style="color: orange;">⟳ Pending</span>')
    status.short_description = 'Status'