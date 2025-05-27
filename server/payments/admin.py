from django.contrib import admin
from django.utils.html import format_html
from .models import Payment, AListHomeProStripeAccount


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'client_name', 'pro_name', 'amount_display', 'status_badge', 'description_preview', 'created_at', 'completed_at']
    list_filter = ['status', 'created_at', 'completed_at']
    search_fields = ['client__email', 'client__name', 'description', 'stripe_payment_intent_id', 'stripe_transfer_id']
    readonly_fields = ['created_at', 'updated_at', 'stripe_payment_intent_id', 'stripe_transfer_id']
    fieldsets = (
        ('Basic Information', {
            'fields': ('client', 'alistpro', 'contractor', 'amount', 'description', 'status')
        }),
        ('Stripe Information', {
            'fields': ('stripe_payment_intent_id', 'stripe_transfer_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at')
        }),
    )
    
    def client_name(self, obj):
        return obj.client.name or obj.client.email
    client_name.short_description = 'Client'
    
    def pro_name(self, obj):
        if obj.alistpro:
            return obj.alistpro.business_name
        elif obj.contractor:
            return obj.contractor.business_name
        return "Unknown Pro"
    pro_name.short_description = 'Service Provider'
    
    def amount_display(self, obj):
        return f"${obj.amount}"
    amount_display.short_description = 'Amount'
    
    def status_badge(self, obj):
        status_colors = {
            'pending': 'orange',
            'processing': 'blue',
            'completed': 'green',
            'failed': 'red',
            'refunded': 'purple'
        }
        color = status_colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 8px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def description_preview(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_preview.short_description = 'Description'


@admin.register(AListHomeProStripeAccount)
class AListHomeProStripeAccountAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email', 'stripe_account_id', 'onboarding_status', 'is_charges_enabled', 'is_payouts_enabled', 'onboarding_started_at', 'onboarding_completed_at']
    list_filter = ['is_details_submitted', 'is_charges_enabled', 'is_payouts_enabled', 'onboarding_complete']
    search_fields = ['user__email', 'user__name', 'stripe_account_id']
    readonly_fields = ['last_webhook_received_at', 'last_webhook_type', 'onboarding_started_at', 'onboarding_completed_at']
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'stripe_account_id')
        }),
        ('Account Status', {
            'fields': ('is_details_submitted', 'is_charges_enabled', 'is_payouts_enabled', 'onboarding_complete')
        }),
        ('Onboarding', {
            'fields': ('onboarding_url', 'onboarding_started_at', 'onboarding_completed_at')
        }),
        ('Webhook Information', {
            'fields': ('last_webhook_received_at', 'last_webhook_type')
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    
    def onboarding_status(self, obj):
        if obj.onboarding_complete:
            return format_html('<span style="color: green;">✓ Complete</span>')
        elif obj.onboarding_url:
            return format_html('<span style="color: orange;">⟳ In Progress</span>')
        else:
            return format_html('<span style="color: red;">✗ Not Started</span>')
    onboarding_status.short_description = 'Onboarding Status'


# Register the StripeAccount proxy model
#admin.site.register(AListHomeProStripeAccount.Meta.proxy)
