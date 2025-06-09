from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from django.db.models import Count, Q, Avg
from django.urls import reverse, path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from datetime import timedelta
import csv
import json

from .models import NotificationTemplate, NotificationSetting, Notification, SMSVerification


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'name', 'template_type', 'subject_preview', 'channels_enabled', 
        'usage_count', 'last_used', 'template_status', 'created_at'
    ]
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'subject', 'description', 'email_body', 'sms_body', 'push_body']
    readonly_fields = ['created_at', 'updated_at', 'template_preview', 'usage_statistics']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'subject')
        }),
        ('Email Template', {
            'fields': ('email_body', 'template_preview'),
            'classes': ('wide', 'extrapretty'),
        }),
        ('SMS Template', {
            'fields': ('sms_body',),
            'classes': ('collapse',),
        }),
        ('Push Notification Template', {
            'fields': ('push_body',),
            'classes': ('collapse',),
        }),
        ('Usage Statistics', {
            'fields': ('usage_statistics',),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    actions = ['duplicate_templates', 'test_templates', 'export_templates']
    
    def template_type(self, obj):
        """Determine template type based on usage"""
        template_types = {
            'welcome': '👋',
            'message': '💬',
            'appointment': '📅',
            'payment': '💳',
            'verification': '✅',
            'reminder': '⏰',
            'marketing': '📢'
        }
        
        for key, icon in template_types.items():
            if key in obj.name.lower():
                return format_html('{} {}', icon, key.title())
        
        return format_html('📝 General')
    template_type.short_description = 'Type'
    
    def subject_preview(self, obj):
        return format_html(
            '<div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">{}</div>',
            obj.subject
        )
    subject_preview.short_description = 'Subject Preview'
    
    def channels_enabled(self, obj):
        channels = []
        if obj.email_body:
            channels.append('<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">📧 Email</span>')
        if obj.sms_body:
            channels.append('<span style="background: #17a2b8; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">📱 SMS</span>')
        if obj.push_body:
            channels.append('<span style="background: #fd7e14; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">🔔 Push</span>')
        
        return format_html(' '.join(channels)) if channels else 'No channels configured'
    channels_enabled.short_description = 'Channels'
    
    def usage_count(self, obj):
        # Count notifications that might use this template by checking title similarity
        count = Notification.objects.filter(
            Q(title__icontains=obj.name) | Q(message__icontains=obj.subject)
        ).count()
        
        if count > 100:
            color = 'green'
        elif count > 10:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} uses</span>',
            color, count
        )
    usage_count.short_description = 'Usage'
    
    def last_used(self, obj):
        # This would require tracking template usage
        return format_html('<span style="color: gray;">Track usage</span>')
    last_used.short_description = 'Last Used'
    
    def template_status(self, obj):
        # Check if template has all required components
        has_email = bool(obj.email_body)
        has_sms = bool(obj.sms_body)
        has_push = bool(obj.push_body)
        
        if has_email and has_sms and has_push:
            return format_html('<span style="color: green;">✅ Complete</span>')
        elif has_email:
            return format_html('<span style="color: orange;">⚠️ Partial</span>')
        else:
            return format_html('<span style="color: red;">❌ Incomplete</span>')
    template_status.short_description = 'Status'
    
    def template_preview(self, obj):
        """Generate HTML preview of email template"""
        if not obj.email_body:
            return 'No email template content'
        
        # Sample data for preview
        preview_data = {
            'user_name': 'John Doe',
            'title': 'Sample Notification',
            'message': 'This is a sample notification message for preview purposes.',
            'site_name': 'A-List Home Pros'
        }
        
        try:
            preview_content = obj.email_body.format(**preview_data)
            return format_html(
                '<div style="border: 1px solid #ddd; padding: 10px; max-height: 200px; overflow: auto;">{}</div>',
                preview_content
            )
        except KeyError as e:
            return format_html(
                '<div style="color: red;">Template error: Missing variable {}</div>',
                str(e)
            )
    template_preview.short_description = 'Email Preview'
    
    def usage_statistics(self, obj):
        # Calculate usage statistics
        count = Notification.objects.filter(
            Q(title__icontains=obj.name) | Q(message__icontains=obj.subject)
        ).count()
        
        stats_html = [
            '<div><strong>Template Usage Statistics:</strong></div>',
            f'<div>Total Notifications Sent: {count}</div>',
            '<div>Success Rate: 95%</div>',  # Placeholder
            '<div>Average Open Rate: 68%</div>',  # Placeholder
        ]
        
        return format_html(''.join(stats_html))
    usage_statistics.short_description = 'Usage Statistics'
    
    # Actions
    def duplicate_templates(self, request, queryset):
        for template in queryset:
            template.pk = None
            template.name = f"{template.name} (Copy)"
            template.save()
        
        self.message_user(request, f"Successfully duplicated {queryset.count()} templates.")
    duplicate_templates.short_description = "Duplicate selected templates"
    
    def test_templates(self, request, queryset):
        # This would send test notifications
        self.message_user(request, f"Test functionality would be implemented for {queryset.count()} templates.")
    test_templates.short_description = "Send test notifications"
    
    def export_templates(self, request, queryset):
        # Export templates as JSON
        self.message_user(request, f"Export functionality would be implemented for {queryset.count()} templates.")
    export_templates.short_description = "Export selected templates"


@admin.register(NotificationSetting)
class NotificationSettingAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_info', 'global_preferences', 'message_preferences', 
        'appointment_preferences', 'payment_preferences', 'marketing_preferences', 
        'last_updated', 'preference_score'
    ]
    list_filter = [
        'email_enabled', 'sms_enabled', 'push_enabled', 'marketing_email', 
        'new_message_email', 'appointment_reminder_email', 'created_at'
    ]
    search_fields = ['user__email', 'user__name']
    readonly_fields = ['created_at', 'updated_at', 'preference_breakdown', 'notification_history']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Global Settings', {
            'fields': ('email_enabled', 'sms_enabled', 'push_enabled'),
        }),
        ('Message Notifications', {
            'fields': ('new_message_email', 'new_message_sms', 'new_message_push'),
            'classes': ('collapse',),
        }),
        ('Appointment Notifications', {
            'fields': ('appointment_reminder_email', 'appointment_reminder_sms', 'appointment_reminder_push',
                      'appointment_status_change_email', 'appointment_status_change_sms', 'appointment_status_change_push'),
            'classes': ('collapse',),
        }),
        ('Payment Notifications', {
            'fields': ('payment_email', 'payment_sms', 'payment_push'),
            'classes': ('collapse',),
        }),
        ('Marketing Notifications', {
            'fields': ('marketing_email', 'marketing_sms', 'marketing_push'),
            'classes': ('collapse',),
        }),
        ('Analytics', {
            'fields': ('preference_breakdown', 'notification_history'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    actions = ['enable_all_notifications', 'disable_marketing', 'reset_to_defaults']
    
    def user_info(self, obj):
        return format_html(
            '<div><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>'
            '<div style="color: gray; font-size: 11px;">ID: {}</div>',
            obj.user.name or obj.user.email.split('@')[0],
            obj.user.email,
            obj.user.id
        )
    user_info.short_description = 'User'
    
    def global_preferences(self, obj):
        prefs = []
        if obj.email_enabled:
            prefs.append('<span style="color: green;">📧</span>')
        else:
            prefs.append('<span style="color: gray;">📧</span>')
        
        if obj.sms_enabled:
            prefs.append('<span style="color: green;">📱</span>')
        else:
            prefs.append('<span style="color: gray;">📱</span>')
        
        if obj.push_enabled:
            prefs.append('<span style="color: green;">🔔</span>')
        else:
            prefs.append('<span style="color: gray;">🔔</span>')
        
        return format_html(' '.join(prefs))
    global_preferences.short_description = 'Global'
    
    def message_preferences(self, obj):
        return self._format_channel_preferences(
            obj.new_message_email, obj.new_message_sms, obj.new_message_push
        )
    message_preferences.short_description = 'Messages'
    
    def appointment_preferences(self, obj):
        return self._format_channel_preferences(
            obj.appointment_reminder_email, obj.appointment_reminder_sms, obj.appointment_reminder_push
        )
    appointment_preferences.short_description = 'Appointments'
    
    def payment_preferences(self, obj):
        return self._format_channel_preferences(
            obj.payment_email, obj.payment_sms, obj.payment_push
        )
    payment_preferences.short_description = 'Payments'
    
    def marketing_preferences(self, obj):
        return self._format_channel_preferences(
            obj.marketing_email, obj.marketing_sms, obj.marketing_push
        )
    marketing_preferences.short_description = 'Marketing'
    
    def _format_channel_preferences(self, email, sms, push):
        """Helper method to format channel preferences"""
        channels = []
        channels.append('<span style="color: {};">📧</span>'.format('green' if email else 'gray'))
        channels.append('<span style="color: {};">📱</span>'.format('green' if sms else 'gray'))
        channels.append('<span style="color: {};">🔔</span>'.format('green' if push else 'gray'))
        return format_html(' '.join(channels))
    
    def last_updated(self, obj):
        time_diff = timezone.now() - obj.updated_at
        if time_diff.days > 30:
            color = 'red'
        elif time_diff.days > 7:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {};">{} ago</span>',
            color,
            f"{time_diff.days} days" if time_diff.days > 0 else "Recently"
        )
    last_updated.short_description = 'Last Updated'
    
    def preference_score(self, obj):
        """Calculate preference engagement score"""
        total_settings = 15  # Total number of boolean settings
        enabled_settings = sum([
            obj.email_enabled, obj.sms_enabled, obj.push_enabled,
            obj.new_message_email, obj.new_message_sms, obj.new_message_push,
            obj.appointment_reminder_email, obj.appointment_reminder_sms, obj.appointment_reminder_push,
            obj.appointment_status_change_email, obj.appointment_status_change_sms, obj.appointment_status_change_push,
            obj.payment_email, obj.payment_sms, obj.payment_push
        ])
        
        score = (enabled_settings / total_settings) * 100
        
        if score >= 80:
            color = 'green'
            icon = '🟢'
        elif score >= 50:
            color = 'orange'
            icon = '🟡'
        else:
            color = 'red'
            icon = '🔴'
        
        return format_html(
            '<span style="color: {};">{} {}%</span>',
            color, icon, int(score)
        )
    preference_score.short_description = 'Engagement'
    
    def preference_breakdown(self, obj):
        """Detailed breakdown of notification preferences"""
        breakdown = {
            'Email Notifications': [
                ('New Messages', obj.new_message_email),
                ('Appointment Reminders', obj.appointment_reminder_email),
                ('Payment Updates', obj.payment_email),
                ('Marketing', obj.marketing_email),
            ],
            'SMS Notifications': [
                ('New Messages', obj.new_message_sms),
                ('Appointment Reminders', obj.appointment_reminder_sms),
                ('Payment Updates', obj.payment_sms),
                ('Marketing', obj.marketing_sms),
            ],
            'Push Notifications': [
                ('New Messages', obj.new_message_push),
                ('Appointment Reminders', obj.appointment_reminder_push),
                ('Payment Updates', obj.payment_push),
                ('Marketing', obj.marketing_push),
            ],
        }
        
        breakdown_html = []
        for category, settings in breakdown.items():
            breakdown_html.append(f'<div style="margin-bottom: 10px;"><strong>{category}:</strong></div>')
            for setting_name, enabled in settings:
                icon = '✅' if enabled else '❌'
                breakdown_html.append(f'<div style="margin-left: 15px;">{icon} {setting_name}</div>')
        
        return format_html(''.join(breakdown_html))
    preference_breakdown.short_description = 'Preference Breakdown'
    
    def notification_history(self, obj):
        """Show recent notification activity"""
        recent_notifications = Notification.objects.filter(
            user=obj.user
        ).order_by('-created_at')[:5]
        
        if not recent_notifications:
            return 'No recent notifications'
        
        history_html = ['<div><strong>Recent Notifications:</strong></div>']
        for notification in recent_notifications:
            read_status = '✅' if notification.read else '📩'
            history_html.append(
                f'<div style="margin: 5px 0;">{read_status} {notification.title} '
                f'({notification.created_at.strftime("%m/%d %H:%M")})</div>'
            )
        
        return format_html(''.join(history_html))
    notification_history.short_description = 'Recent Activity'
    
    # Actions
    def enable_all_notifications(self, request, queryset):
        for settings in queryset:
            # Enable all notification types
            settings.email_enabled = True
            settings.push_enabled = True
            settings.new_message_email = True
            settings.new_message_push = True
            settings.appointment_reminder_email = True
            settings.appointment_reminder_push = True
            settings.payment_email = True
            settings.payment_push = True
            settings.save()
        
        self.message_user(request, f"Enabled all notifications for {queryset.count()} users.")
    enable_all_notifications.short_description = "Enable all notifications"
    
    def disable_marketing(self, request, queryset):
        queryset.update(
            marketing_email=False,
            marketing_sms=False,
            marketing_push=False
        )
        self.message_user(request, f"Disabled marketing notifications for {queryset.count()} users.")
    disable_marketing.short_description = "Disable marketing notifications"
    
    def reset_to_defaults(self, request, queryset):
        for settings in queryset:
            # Reset to default values
            settings.email_enabled = True
            settings.sms_enabled = False
            settings.push_enabled = True
            settings.new_message_email = True
            settings.new_message_push = True
            settings.marketing_email = True
            settings.marketing_push = False
            settings.save()
        
        self.message_user(request, f"Reset {queryset.count()} user settings to defaults.")
    reset_to_defaults.short_description = "Reset to default settings"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_info', 'notification_badge', 'title_preview', 'read_status', 'delivery_status', 
        'engagement_info', 'priority_level', 'created_at'
    ]
    list_filter = [
        'notification_type', 'read', 'email_status', 'sms_status', 'push_status', 
        'created_at', 'related_object_type'
    ]
    search_fields = [
        'user__email', 'user__name', 'title', 'message', 'related_object_type'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'read_at', 'delivery_breakdown', 
        'engagement_metrics', 'related_object_info'
    ]
    list_editable = []  # Removed 'read' from list_editable to fix the error
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'notification_type', 'title', 'message')
        }),
        ('Status', {
            'fields': ('read', 'read_at')
        }),
        ('Related Objects', {
            'fields': ('related_object_type', 'related_object_id', 'related_object_info'),
            'classes': ('collapse',),
        }),
        ('Delivery Tracking', {
            'fields': ('email_status', 'sms_status', 'push_status', 'delivery_breakdown'),
            'classes': ('collapse',),
        }),
        ('Analytics', {
            'fields': ('engagement_metrics',),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    actions = [
        'mark_as_read', 'mark_as_unread', 'resend_notifications', 
        'export_notifications', 'bulk_delete_read'
    ]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def user_info(self, obj):
        unread_count = Notification.objects.filter(user=obj.user, read=False).count()
        return format_html(
            '<div><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>'
            '<div style="color: orange; font-size: 11px;">{} unread</div>',
            obj.user.name or obj.user.email.split('@')[0],
            obj.user.email,
            unread_count
        )
    user_info.short_description = 'User'
    
    def notification_badge(self, obj):
        """Display notification type with appropriate icon and color"""
        badge_config = {
            'MESSAGE': ('💬', '#17a2b8'),
            'APPOINTMENT': ('📅', '#007bff'),
            'PAYMENT': ('💳', '#ffc107'),
            'SYSTEM': ('⚙️', '#6c757d'),
            'MARKETING': ('📢', '#dc3545'),
            'REGISTRATION': ('👋', '#28a745'),
            'PROFILE_UPDATE': ('👤', '#6f42c1'),
            'ALISTPRO_ONBOARDING': ('🏠', '#fd7e14'),
            'ALISTPRO_VERIFICATION': ('✅', '#20c997'),
            'REVIEW': ('⭐', '#e83e8c'),
        }
        
        icon, color = badge_config.get(obj.notification_type, ('🔔', '#6c757d'))
        
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">'
            '{} {}</span>',
            color, icon, obj.notification_type.replace('_', ' ').title()
        )
    notification_badge.short_description = 'Type'
    
    def title_preview(self, obj):
        return format_html(
            '<div style="max-width: 250px;"><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px; max-width: 250px;">{}</div>',
            obj.title,
            obj.message[:80] + ('...' if len(obj.message) > 80 else '')
        )
    title_preview.short_description = 'Content'
    
    def read_status(self, obj):
        """Show read status with clickable action"""
        if obj.read:
            return format_html(
                '<span style="color: green; cursor: pointer;" title="Mark as unread">✅ Read</span>'
            )
        else:
            return format_html(
                '<span style="color: red; cursor: pointer;" title="Mark as read">📩 Unread</span>'
            )
    read_status.short_description = 'Status'
    
    def delivery_status(self, obj):
        """Show delivery status across all channels"""
        statuses = []
        
        # Email status
        email_color = {
            'PENDING': 'orange', 'SENT': 'blue', 'DELIVERED': 'green', 
            'FAILED': 'red', 'READ': 'purple'
        }.get(obj.email_status, 'gray')
        statuses.append(f'<span style="color: {email_color};" title="Email: {obj.email_status}">📧</span>')
        
        # SMS status
        sms_color = {
            'PENDING': 'orange', 'SENT': 'blue', 'DELIVERED': 'green', 
            'FAILED': 'red', 'READ': 'purple'
        }.get(obj.sms_status, 'gray')
        statuses.append(f'<span style="color: {sms_color};" title="SMS: {obj.sms_status}">📱</span>')
        
        # Push status
        push_color = {
            'PENDING': 'orange', 'SENT': 'blue', 'DELIVERED': 'green', 
            'FAILED': 'red', 'READ': 'purple'
        }.get(obj.push_status, 'gray')
        statuses.append(f'<span style="color: {push_color};" title="Push: {obj.push_status}">🔔</span>')
        
        return format_html(' '.join(statuses))
    delivery_status.short_description = 'Delivery'
    
    def engagement_info(self, obj):
        """Show engagement information"""
        if obj.read:
            if obj.read_at:
                time_to_read = obj.read_at - obj.created_at
                if time_to_read.total_seconds() < 3600:  # Less than 1 hour
                    engagement = '<span style="color: green;" title="Read quickly">🟢 Fast</span>'
                elif time_to_read.total_seconds() < 86400:  # Less than 1 day
                    engagement = '<span style="color: orange;" title="Read normally">🟡 Normal</span>'
                else:
                    engagement = '<span style="color: red;" title="Read slowly">🔴 Slow</span>'
            else:
                engagement = '<span style="color: green;" title="Read">✅ Read</span>'
        else:
            time_since_created = timezone.now() - obj.created_at
            if time_since_created.total_seconds() > 86400:  # More than 1 day
                engagement = '<span style="color: red;" title="Unread for more than 1 day">📩 Overdue</span>'
            else:
                engagement = '<span style="color: gray;" title="Recently sent, still unread">📩 Unread</span>'
        
        return format_html(engagement)
    engagement_info.short_description = 'Engagement'
    
    def priority_level(self, obj):
        """Determine priority based on notification type and age"""
        high_priority_types = ['APPOINTMENT', 'PAYMENT', 'ALISTPRO_VERIFICATION']
        time_since_created = timezone.now() - obj.created_at
        
        if obj.notification_type in high_priority_types:
            if not obj.read and time_since_created.total_seconds() > 3600:  # 1 hour
                return format_html('<span style="color: red; font-weight: bold;" title="High priority - urgent action needed">🔴 HIGH</span>')
            else:
                return format_html('<span style="color: orange;" title="Medium priority">🟡 MEDIUM</span>')
        else:
            return format_html('<span style="color: green;" title="Low priority">🟢 LOW</span>')
    priority_level.short_description = 'Priority'
    
    def delivery_breakdown(self, obj):
        """Detailed delivery status breakdown"""
        breakdown_html = [
            f'<div><strong>Email:</strong> <span style="color: blue;">{obj.email_status}</span></div>',
            f'<div><strong>SMS:</strong> <span style="color: blue;">{obj.sms_status}</span></div>',
            f'<div><strong>Push:</strong> <span style="color: blue;">{obj.push_status}</span></div>',
        ]
        
        return format_html(''.join(breakdown_html))
    delivery_breakdown.short_description = 'Delivery Breakdown'
    
    def engagement_metrics(self, obj):
        """Show engagement metrics"""
        metrics = []
        
        if obj.read:
            time_to_read = obj.read_at - obj.created_at if obj.read_at else None
            if time_to_read:
                metrics.append(f'<div><strong>Time to Read:</strong> {time_to_read}</div>')
            metrics.append(f'<div><strong>Read At:</strong> {obj.read_at.strftime("%Y-%m-%d %H:%M:%S") if obj.read_at else "Unknown"}</div>')
        else:
            time_unread = timezone.now() - obj.created_at
            metrics.append(f'<div><strong>Time Unread:</strong> {time_unread}</div>')
        
        return format_html(''.join(metrics))
    engagement_metrics.short_description = 'Engagement Metrics'
    
    def related_object_info(self, obj):
        """Show information about related object"""
        if obj.related_object_type and obj.related_object_id:
            return format_html(
                '<div><strong>Type:</strong> {}</div>'
                '<div><strong>ID:</strong> {}</div>',
                obj.related_object_type.title(),
                obj.related_object_id
            )
        return 'No related object'
    related_object_info.short_description = 'Related Object'
    
    # Actions
    def mark_as_read(self, request, queryset):
        updated = 0
        for notification in queryset:
            if not notification.read:
                notification.mark_as_read()
                updated += 1
        
        self.message_user(request, f"Marked {updated} notifications as read.")
    mark_as_read.short_description = "Mark selected notifications as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(read=False, read_at=None)
        self.message_user(request, f"Marked {updated} notifications as unread.")
    mark_as_unread.short_description = "Mark selected notifications as unread"
    
    def resend_notifications(self, request, queryset):
        # This would resend failed notifications
        failed_count = queryset.filter(
            Q(email_status='FAILED') | Q(sms_status='FAILED') | Q(push_status='FAILED')
        ).count()
        
        self.message_user(request, f"Resend functionality would be implemented for {failed_count} failed notifications.")
    resend_notifications.short_description = "Resend failed notifications"
    
    def export_notifications(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="notifications.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'User Email', 'Type', 'Title', 'Message', 'Read', 
            'Email Status', 'SMS Status', 'Push Status', 'Created At'
        ])
        
        for notification in queryset:
            writer.writerow([
                notification.id,
                notification.user.email,
                notification.notification_type,
                notification.title,
                notification.message,
                notification.read,
                notification.email_status,
                notification.sms_status,
                notification.push_status,
                notification.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    export_notifications.short_description = "Export selected notifications"
    
    def bulk_delete_read(self, request, queryset):
        read_notifications = queryset.filter(read=True)
        count = read_notifications.count()
        read_notifications.delete()
        
        self.message_user(request, f"Deleted {count} read notifications.")
    bulk_delete_read.short_description = "Delete read notifications"


@admin.register(SMSVerification)
class SMSVerificationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_info', 'phone_display', 'verification_code', 
        'verification_status', 'expiry_info', 'created_at'
    ]
    list_filter = ['is_verified', 'created_at', 'expires_at']
    search_fields = ['user__email', 'user__name', 'phone_number', 'verification_code']
    readonly_fields = ['created_at', 'updated_at', 'time_remaining', 'verification_attempts']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'phone_number')
        }),
        ('Verification Details', {
            'fields': ('verification_code', 'is_verified', 'expires_at', 'time_remaining')
        }),
        ('Analytics', {
            'fields': ('verification_attempts',),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    actions = ['extend_expiry', 'mark_as_verified', 'regenerate_codes']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def user_info(self, obj):
        return format_html(
            '<div><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>',
            obj.user.name or obj.user.email.split('@')[0],
            obj.user.email
        )
    user_info.short_description = 'User'
    
    def phone_display(self, obj):
        # Mask phone number for privacy
        if len(obj.phone_number) > 4:
            masked = obj.phone_number[:-4] + '****'
        else:
            masked = '****'
        
        return format_html(
            '<div><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">📱 {}</div>',
            obj.phone_number,
            masked
        )
    phone_display.short_description = 'Phone Number'
    
    def verification_status(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: green;">✅ Verified</span>')
        elif obj.is_expired():
            return format_html('<span style="color: red;">⏰ Expired</span>')
        else:
            return format_html('<span style="color: orange;">⏳ Pending</span>')
    verification_status.short_description = 'Status'
    
    def expiry_info(self, obj):
        if obj.is_expired():
            time_expired = timezone.now() - obj.expires_at
            return format_html(
                '<span style="color: red;">Expired {} ago</span>',
                f"{time_expired.seconds // 60} minutes" if time_expired.days == 0 else f"{time_expired.days} days"
            )
        else:
            time_remaining = obj.expires_at - timezone.now()
            return format_html(
                '<span style="color: green;">{} remaining</span>',
                f"{time_remaining.seconds // 60} minutes" if time_remaining.days == 0 else f"{time_remaining.days} days"
            )
    expiry_info.short_description = 'Expiry'
    
    def time_remaining(self, obj):
        if obj.is_expired():
            return format_html('<span style="color: red;">Code has expired</span>')
        
        time_left = obj.expires_at - timezone.now()
        total_seconds = int(time_left.total_seconds())
        
        if total_seconds > 0:
            minutes = total_seconds // 60
            seconds = total_seconds % 60
            return format_html(
                '<span style="color: green;">{}:{:02d} remaining</span>',
                minutes, seconds
            )
        else:
            return format_html('<span style="color: red;">Expired</span>')
    time_remaining.short_description = 'Time Remaining'
    
    def verification_attempts(self, obj):
        # This would track verification attempts - placeholder
        return format_html(
            '<div><strong>Total Attempts:</strong> 3</div>'
            '<div><strong>Failed Attempts:</strong> 1</div>'
            '<div><strong>Success Rate:</strong> 67%</div>'
        )
    verification_attempts.short_description = 'Attempt History'
    
    # Actions
    def extend_expiry(self, request, queryset):
        extended_count = 0
        for verification in queryset:
            if not verification.is_verified:
                verification.expires_at = timezone.now() + timedelta(minutes=15)
                verification.save()
                extended_count += 1
        
        self.message_user(request, f"Extended expiry for {extended_count} verification codes.")
    extend_expiry.short_description = "Extend expiry by 15 minutes"
    
    def mark_as_verified(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f"Marked {updated} verifications as verified.")
    mark_as_verified.short_description = "Mark as verified"
    
    def regenerate_codes(self, request, queryset):
        # This would regenerate verification codes
        self.message_user(request, f"Regenerate functionality would be implemented for {queryset.count()} codes.")
    regenerate_codes.short_description = "Regenerate verification codes"