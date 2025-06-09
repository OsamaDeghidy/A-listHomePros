from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.utils import timezone
from .models import CustomUser, EmailVerification


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = [
        'id', 'email', 'name', 'phone_number', 'role_badge', 
        'verification_status', 'account_status', 'is_verified', 'is_active', 'last_login', 'date_joined'
    ]
    list_filter = [
        'role', 'is_verified', 'email_verified', 'is_staff', 
        'is_superuser', 'is_active', 'date_joined'
    ]
    search_fields = ['email', 'name', 'phone_number']
    ordering = ('-date_joined',)
    list_editable = ['is_verified', 'is_active']
    readonly_fields = ['date_joined', 'last_login']
    
    fieldsets = (
        ('👤 Basic Information', {
            'fields': ('email', 'password', 'name', 'phone_number')
        }),
        ('🔒 Permissions & Roles', {
            'fields': ('role', 'is_verified', 'email_verified', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('👥 Groups & Permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('📅 Important Dates', {
            'fields': ('last_login', 'date_joined'),
        }),
    )
    
    add_fieldsets = (
        ('Create New User', {
            'classes': ('wide',),
            'fields': ('email', 'name', 'phone_number', 'role', 'password1', 'password2'),
        }),
    )
    
    actions = ['verify_users', 'unverify_users', 'verify_emails', 'activate_users', 'deactivate_users']
    
    def role_badge(self, obj):
        role_colors = {
            'admin': '#dc3545',
            'client': '#007bff', 
            'contractor': '#28a745',
            'specialist': '#fd7e14',
            'crew': '#6f42c1'
        }
        color = role_colors.get(obj.role, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">{}</span>',
            color, obj.get_role_display()
        )
    role_badge.short_description = 'Role'
    
    def verification_status(self, obj):
        if obj.is_verified and obj.email_verified:
            return format_html('<span style="color: green; font-weight: bold;">✅ Fully Verified</span>')
        elif obj.is_verified:
            return format_html('<span style="color: orange; font-weight: bold;">⚡ Partially Verified</span>')
        else:
            return format_html('<span style="color: red; font-weight: bold;">❌ Not Verified</span>')
    verification_status.short_description = 'Verification Status'
    
    def account_status(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">🟢 Active</span>')
        else:
            return format_html('<span style="color: red;">🔴 Disabled</span>')
    account_status.short_description = 'Account Status'
    
    def verify_users(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} users verified.')
    verify_users.short_description = 'Verify selected users'
    
    def unverify_users(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'{updated} users unverified.')
    unverify_users.short_description = 'Unverify users'
    
    def verify_emails(self, request, queryset):
        updated = queryset.update(email_verified=True)
        self.message_user(request, f'{updated} user emails verified.')
    verify_emails.short_description = 'Verify user emails'
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users activated.')
    activate_users.short_description = 'Activate users'
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users deactivated.')
    deactivate_users.short_description = 'Deactivate users'


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_email', 'user_name', 'token_preview', 
        'is_expired_status', 'created_at'
    ]
    list_filter = ['created_at', 'user__role']
    search_fields = ['user__email', 'user__name', 'token']
    readonly_fields = ['token', 'created_at']
    ordering = ('-created_at',)
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    
    def user_name(self, obj):
        return obj.user.name or '-'
    user_name.short_description = 'Name'
    
    def token_preview(self, obj):
        return f"{obj.token[:8]}..."
    token_preview.short_description = 'Token'
    
    def is_expired_status(self, obj):
        if obj.is_expired():
            return format_html('<span style="color: red;">❌ Expired</span>')
        else:
            return format_html('<span style="color: green;">✅ Valid</span>')
    is_expired_status.short_description = 'Status'
