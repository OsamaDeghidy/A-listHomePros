from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count, Sum, Q, Avg
from django.urls import reverse, path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from datetime import timedelta
import csv
import json

from .models import (
    Payment, AListHomeProStripeAccount, EscrowAccount, EscrowMilestone, 
    EscrowTransaction, EscrowWorkOrder
)


class EscrowMilestoneInline(admin.TabularInline):
    """Inline for escrow milestones"""
    model = EscrowMilestone
    extra = 0
    readonly_fields = ['completed_at', 'approved_at', 'released_at']
    fields = ['title', 'description', 'amount', 'due_date', 'completed_at', 'approved_at', 'released_at']


class EscrowTransactionInline(admin.TabularInline):
    """Inline for escrow transactions"""
    model = EscrowTransaction
    extra = 0
    readonly_fields = ['created_at', 'stripe_transaction_id']
    fields = ['transaction_type', 'amount', 'description', 'stripe_transaction_id', 'created_at']
    ordering = ['-created_at']


class EscrowWorkOrderInline(admin.TabularInline):
    """Inline for escrow work orders"""
    model = EscrowWorkOrder
    extra = 0
    readonly_fields = ['assigned_at', 'accepted_at', 'started_at', 'completed_at', 'approved_at']
    fields = [
        'assigned_to', 'work_type', 'title', 'assigned_amount', 
        'status', 'assigned_at', 'completed_at'
    ]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'client_info', 'professional_info', 'amount_display', 
        'status_badge', 'payment_method', 'created_at', 'completed_at'
    ]
    list_filter = ['status', 'created_at', 'completed_at']
    search_fields = [
        'client__name', 'client__email', 'professional__business_name',
        'professional__user__name', 'professional__user__email', 'description'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'stripe_payment_intent_id', 
        'stripe_transfer_id', 'payment_details', 'transaction_history'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('client', 'professional', 'amount', 'description')
        }),
        ('Payment Status', {
            'fields': ('status', 'completed_at')
        }),
        ('Stripe Information', {
            'fields': ('stripe_payment_intent_id', 'stripe_transfer_id'),
            'classes': ('collapse',),
        }),
        ('Details', {
            'fields': ('payment_details', 'transaction_history'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_failed', 'export_payments']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'client', 'professional__user'
        )
    
    def client_info(self, obj):
        if obj.client:
            return format_html(
                '<div><strong>{}</strong></div><div style="color: gray; font-size: 11px;">{}</div>',
                obj.client.name or obj.client.email.split('@')[0],
                obj.client.email
            )
        return 'No client'
    client_info.short_description = 'Client'
    
    def professional_info(self, obj):
        if obj.professional:
            pro_name = obj.professional.business_name or obj.professional.user.name or 'No Name'
            pro_email = obj.professional.user.email
            return format_html(
                '<div><strong>{}</strong></div><div style="color: gray; font-size: 11px;">{}</div>',
                pro_name, pro_email
            )
        return 'No professional'
    professional_info.short_description = 'Professional'
    
    def amount_display(self, obj):
        return format_html(
            '<strong style="font-size: 14px;">${}</strong>',
            obj.amount
        )
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def status_badge(self, obj):
        status_colors = {
            'pending': '#ffc107',
            'processing': '#17a2b8',
            'completed': '#28a745',
            'failed': '#dc3545',
            'refunded': '#6c757d'
        }
        
        color = status_colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def payment_method(self, obj):
        if obj.stripe_payment_intent_id:
            return format_html(
                '<span style="color: #635bff;">💳 Stripe</span>'
            )
        return format_html('<span style="color: gray;">Unknown</span>')
    payment_method.short_description = 'Method'
    
    def payment_details(self, obj):
        details = []
        
        if obj.stripe_payment_intent_id:
            details.append(f'<div><strong>Stripe Payment Intent:</strong> {obj.stripe_payment_intent_id}</div>')
        
        if obj.stripe_transfer_id:
            details.append(f'<div><strong>Stripe Transfer:</strong> {obj.stripe_transfer_id}</div>')
        
        if obj.completed_at:
            time_to_complete = obj.completed_at - obj.created_at
            details.append(f'<div><strong>Processing Time:</strong> {time_to_complete}</div>')
        
        return format_html(''.join(details)) if details else 'No additional details'
    payment_details.short_description = 'Payment Details'
    
    def transaction_history(self, obj):
        # This would show the payment transaction history
        return format_html(
            '<div>Transaction history would be implemented here</div>'
        )
    transaction_history.short_description = 'Transaction History'
    
    # Actions
    def mark_as_completed(self, request, queryset):
        updated = queryset.filter(status='processing').update(
            status='completed',
            completed_at=timezone.now()
        )
        self.message_user(request, f"Successfully marked {updated} payments as completed.")
    mark_as_completed.short_description = "Mark selected payments as completed"
    
    def mark_as_failed(self, request, queryset):
        updated = queryset.filter(status__in=['pending', 'processing']).update(
            status='failed'
        )
        self.message_user(request, f"Successfully marked {updated} payments as failed.")
    mark_as_failed.short_description = "Mark selected payments as failed"
    
    def export_payments(self, request, queryset):
        # Export payments to CSV
        self.message_user(request, f"Export functionality would be implemented for {queryset.count()} payments.")
    export_payments.short_description = "Export selected payments"


@admin.register(AListHomeProStripeAccount)
class AListHomeProStripeAccountAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_info', 'stripe_account_id', 'account_status',
        'onboarding_progress', 'capabilities', 'last_activity', 'created_at'
    ]
    list_filter = [
        'is_details_submitted', 'is_charges_enabled', 'is_payouts_enabled',
        'onboarding_complete', 'created_at'
    ]
    search_fields = [
        'user__name', 'user__email', 'stripe_account_id'
    ]
    readonly_fields = [
        'stripe_account_id', 'onboarding_started_at', 'onboarding_completed_at',
        'last_webhook_received_at', 'last_webhook_type', 'created_at', 'updated_at',
        'account_details', 'webhook_history'
    ]
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Stripe Account', {
            'fields': ('stripe_account_id', 'account_details')
        }),
        ('Account Status', {
            'fields': ('is_details_submitted', 'is_charges_enabled', 'is_payouts_enabled')
        }),
        ('Onboarding', {
            'fields': ('onboarding_complete', 'onboarding_url', 'onboarding_started_at', 'onboarding_completed_at'),
            'classes': ('collapse',),
        }),
        ('Webhook Information', {
            'fields': ('last_webhook_received_at', 'last_webhook_type', 'webhook_history'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    actions = ['refresh_account_status', 'create_onboarding_links']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def user_info(self, obj):
        if obj.user:
            return format_html(
                '<div><strong>{}</strong></div><div style="color: gray; font-size: 11px;">{}</div>',
                obj.user.name or obj.user.email.split('@')[0],
                obj.user.email
            )
        return 'No user'
    user_info.short_description = 'User'
    
    def account_status(self, obj):
        if obj.onboarding_complete:
            return format_html('<span style="color: green;">✅ Active</span>')
        elif obj.is_details_submitted:
            return format_html('<span style="color: orange;">⏳ Pending</span>')
        else:
            return format_html('<span style="color: red;">❌ Incomplete</span>')
    account_status.short_description = 'Status'
    
    def onboarding_progress(self, obj):
        progress = 0
        if obj.is_details_submitted:
            progress += 33
        if obj.is_charges_enabled:
            progress += 33
        if obj.is_payouts_enabled:
            progress += 34
        
        color = 'green' if progress == 100 else 'orange' if progress > 50 else 'red'
        return format_html(
            '<div style="width: 100px; background: #f0f0f0; border-radius: 10px; overflow: hidden;">'
            '<div style="width: {}%; background: {}; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">'
            '{}%</div></div>',
            progress, color, progress
        )
    onboarding_progress.short_description = 'Progress'
    
    def capabilities(self, obj):
        capabilities = []
        if obj.is_charges_enabled:
            capabilities.append('<span style="background: green; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">💳 Charges</span>')
        if obj.is_payouts_enabled:
            capabilities.append('<span style="background: blue; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">💰 Payouts</span>')
        
        return format_html(' '.join(capabilities)) if capabilities else 'No capabilities'
    capabilities.short_description = 'Capabilities'
    
    def last_activity(self, obj):
        if obj.last_webhook_received_at:
            time_diff = timezone.now() - obj.last_webhook_received_at
            if time_diff.days > 0:
                return format_html('<span style="color: gray;">{} days ago</span>', time_diff.days)
            else:
                hours = time_diff.seconds // 3600
                return format_html('<span style="color: orange;">{} hours ago</span>', hours)
        return format_html('<span style="color: red;">No activity</span>')
    last_activity.short_description = 'Last Activity'
    
    def account_details(self, obj):
        details = [
            f'<div><strong>Account ID:</strong> {obj.stripe_account_id}</div>',
            f'<div><strong>Details Submitted:</strong> {"Yes" if obj.is_details_submitted else "No"}</div>',
            f'<div><strong>Charges Enabled:</strong> {"Yes" if obj.is_charges_enabled else "No"}</div>',
            f'<div><strong>Payouts Enabled:</strong> {"Yes" if obj.is_payouts_enabled else "No"}</div>',
        ]
        return format_html(''.join(details))
    account_details.short_description = 'Account Details'
    
    def webhook_history(self, obj):
        if obj.last_webhook_received_at:
            return format_html(
                '<div><strong>Last Webhook:</strong> {}</div>'
                '<div><strong>Type:</strong> {}</div>'
                '<div><strong>Received:</strong> {}</div>',
                obj.last_webhook_type or 'Unknown',
                obj.last_webhook_type or 'N/A',
                obj.last_webhook_received_at.strftime('%Y-%m-%d %H:%M:%S')
            )
        return 'No webhook history'
    webhook_history.short_description = 'Webhook History'
    
    # Actions
    def refresh_account_status(self, request, queryset):
        # This would refresh account status from Stripe
        self.message_user(request, f"Account status refresh would be implemented for {queryset.count()} accounts.")
    refresh_account_status.short_description = "Refresh account status from Stripe"
    
    def create_onboarding_links(self, request, queryset):
        # This would create new onboarding links
        self.message_user(request, f"Onboarding link creation would be implemented for {queryset.count()} accounts.")
    create_onboarding_links.short_description = "Create new onboarding links"


@admin.register(EscrowAccount)
class EscrowAccountAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'project_info', 'client_info', 'specialist_info', 'amount_breakdown', 
        'status_badge', 'progress_info', 'created_at'
    ]
    list_filter = [
        'status', 'created_at', 'funded_at', 'completed_at', 'released_at'
    ]
    search_fields = [
        'project_title', 'project_description', 'client__email', 
        'specialist__email'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'platform_fee', 'net_amount',
        'project_analytics', 'timeline_info'
    ]
    inlines = [EscrowMilestoneInline, EscrowTransactionInline, EscrowWorkOrderInline]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('📋 Project Information', {
            'fields': ('project_title', 'project_description', 'client', 'specialist')
        }),
        ('💰 Financial Details', {
            'fields': ('total_amount', 'platform_fee', 'net_amount')
        }),
        ('📊 Status & Timeline', {
            'fields': ('status', 'timeline_info')
        }),
        ('💳 Stripe Integration', {
            'fields': ('stripe_payment_intent_id', 'stripe_transfer_id'),
            'classes': ('collapse',)
        }),
        ('🔍 Dispute Information', {
            'fields': ('dispute_reason', 'disputed_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
        ('📈 Analytics', {
            'fields': ('project_analytics',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_funded', 'mark_completed', 'release_funds', 'export_escrows']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'client', 'specialist'
        ).prefetch_related('milestones', 'transactions', 'work_orders')
    
    def project_info(self, obj):
        milestone_count = obj.milestones.count()
        work_order_count = obj.work_orders.count()
        
        return format_html(
            '<div><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>'
            '<div style="color: blue; font-size: 11px;">{} milestones, {} work orders</div>',
            obj.project_title,
            obj.project_description[:50] + ('...' if len(obj.project_description) > 50 else ''),
            milestone_count,
            work_order_count
        )
    project_info.short_description = 'Project'
    
    def client_info(self, obj):
        return format_html(
            '<div><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>',
            obj.client.name or obj.client.email.split('@')[0],
            obj.client.email
        )
    client_info.short_description = 'Client'
    
    def specialist_info(self, obj):
        if obj.specialist:
            return format_html(
                '<div><strong>{}</strong></div>'
                '<div style="color: gray; font-size: 11px;">{}</div>',
                obj.specialist.name or obj.specialist.email.split('@')[0],
                obj.specialist.email
            )
        return format_html('<span style="color: red;">No Specialist Assigned</span>')
    specialist_info.short_description = 'Specialist'
    
    def amount_breakdown(self, obj):
        return format_html(
            '<div style="font-weight: bold; color: #28a745;">${:,.2f} Total</div>'
            '<div style="color: #dc3545; font-size: 11px;">${:,.2f} Platform Fee</div>'
            '<div style="color: #007bff; font-size: 11px;">${:,.2f} Net Amount</div>',
            obj.total_amount,
            obj.platform_fee,
            obj.net_amount
        )
    amount_breakdown.short_description = 'Amount'
    
    def status_badge(self, obj):
        status_config = {
            'pending': ('⏳', '#ffc107'),
            'funded': ('💰', '#28a745'),
            'in_progress': ('⚡', '#17a2b8'),
            'pending_approval': ('👀', '#fd7e14'),
            'released': ('✅', '#20c997'),
            'disputed': ('⚠️', '#dc3545'),
            'refunded': ('↩️', '#6f42c1'),
            'cancelled': ('❌', '#6c757d'),
        }
        
        icon, color = status_config.get(obj.status, ('❓', '#6c757d'))
        
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 12px; '
            'font-size: 11px; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def progress_info(self, obj):
        """Show project progress information"""
        if obj.status == 'pending':
            return format_html('<span style="color: orange;">⏳ Awaiting Funding</span>')
        elif obj.status == 'funded':
            return format_html('<span style="color: green;">💰 Ready to Start</span>')
        elif obj.status == 'in_progress':
            if obj.work_started_at:
                time_in_progress = timezone.now() - obj.work_started_at
                return format_html(
                    '<span style="color: blue;">⚡ In Progress</span><br>'
                    '<span style="color: gray; font-size: 11px;">{} days</span>',
                    time_in_progress.days
                )
            return format_html('<span style="color: blue;">⚡ In Progress</span>')
        elif obj.status == 'completed':
            if obj.completed_at:
                return format_html(
                    '<span style="color: green;">✅ Completed</span><br>'
                    '<span style="color: gray; font-size: 11px;">{}</span>',
                    obj.completed_at.strftime('%m/%d %H:%M')
                )
        elif obj.status == 'released':
            return format_html('<span style="color: green;">🎉 Funds Released</span>')
        
        return format_html('<span style="color: gray;">-</span>')
    progress_info.short_description = 'Progress'
    
    def timeline_info(self, obj):
        """Show detailed timeline information"""
        timeline = []
        
        timeline.append(f'<div><strong>Created:</strong> {obj.created_at.strftime("%Y-%m-%d %H:%M")}</div>')
        
        if obj.funded_at:
            timeline.append(f'<div><strong>Funded:</strong> {obj.funded_at.strftime("%Y-%m-%d %H:%M")}</div>')
        
        if obj.work_started_at:
            timeline.append(f'<div><strong>Work Started:</strong> {obj.work_started_at.strftime("%Y-%m-%d %H:%M")}</div>')
        
        if obj.completed_at:
            timeline.append(f'<div><strong>Completed:</strong> {obj.completed_at.strftime("%Y-%m-%d %H:%M")}</div>')
        
        if obj.released_at:
            timeline.append(f'<div><strong>Released:</strong> {obj.released_at.strftime("%Y-%m-%d %H:%M")}</div>')
        
        if obj.disputed_at:
            timeline.append(f'<div style="color: red;"><strong>Disputed:</strong> {obj.disputed_at.strftime("%Y-%m-%d %H:%M")}</div>')
        
        return format_html(''.join(timeline))
    timeline_info.short_description = 'Timeline'
    
    def project_analytics(self, obj):
        """Show project analytics"""
        analytics = []
        
        # Milestone analytics
        milestones = obj.milestones.all()
        completed_milestones = milestones.filter(completed_at__isnull=False).count()
        total_milestones = milestones.count()
        
        if total_milestones > 0:
            completion_rate = (completed_milestones / total_milestones) * 100
            analytics.append(f'<div><strong>Milestone Completion:</strong> {completed_milestones}/{total_milestones} ({completion_rate:.1f}%)</div>')
        
        # Work order analytics
        work_orders = obj.work_orders.all()
        completed_work_orders = work_orders.filter(status='completed').count()
        total_work_orders = work_orders.count()
        
        if total_work_orders > 0:
            analytics.append(f'<div><strong>Work Orders:</strong> {completed_work_orders}/{total_work_orders} completed</div>')
        
        # Financial analytics
        transactions = obj.transactions.all()
        total_transactions = transactions.count()
        analytics.append(f'<div><strong>Total Transactions:</strong> {total_transactions}</div>')
        
        # Time analytics
        if obj.funded_at and obj.completed_at:
            project_duration = obj.completed_at - obj.funded_at
            analytics.append(f'<div><strong>Project Duration:</strong> {project_duration.days} days</div>')
        
        return format_html(''.join(analytics))
    project_analytics.short_description = 'Project Analytics'
    
    # Actions
    def mark_funded(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='funded',
            funded_at=timezone.now()
        )
        self.message_user(request, f'Marked {updated} escrows as funded.')
    mark_funded.short_description = "Mark as funded"
    
    def mark_completed(self, request, queryset):
        updated = queryset.filter(status='in_progress').update(
            status='pending_approval',
            completed_at=timezone.now()
        )
        self.message_user(request, f'Marked {updated} escrows as completed (pending approval).')
    mark_completed.short_description = "Mark as completed"
    
    def release_funds(self, request, queryset):
        updated = queryset.filter(status='pending_approval').update(
            status='released',
            released_at=timezone.now()
        )
        self.message_user(request, f'Released funds for {updated} escrows.')
    release_funds.short_description = "Release funds"


@admin.register(EscrowMilestone)
class EscrowMilestoneAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'escrow_project', 'milestone_info', 'amount_display', 
        'milestone_status', 'due_date', 'completion_info'
    ]
    list_filter = ['due_date', 'completed_at', 'approved_at', 'released_at']
    search_fields = ['title', 'description', 'escrow__project_title']
    readonly_fields = ['created_at', 'updated_at', 'completed_at', 'approved_at', 'released_at']
    
    def escrow_project(self, obj):
        return format_html(
            '<a href="{}">{}</a>',
            reverse('admin:payments_escrowaccount_change', args=[obj.escrow.id]),
            obj.escrow.project_title
        )
    escrow_project.short_description = 'Project'
    
    def milestone_info(self, obj):
        return format_html(
            '<div><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>',
            obj.title,
            obj.description[:50] + ('...' if len(obj.description) > 50 else '')
        )
    milestone_info.short_description = 'Milestone'
    
    def amount_display(self, obj):
        return format_html('<strong>${:,.2f}</strong>', obj.amount)
    amount_display.short_description = 'Amount'
    
    def milestone_status(self, obj):
        if obj.released_at:
            return format_html('<span style="color: green;">✅ Released</span>')
        elif obj.approved_at:
            return format_html('<span style="color: blue;">👍 Approved</span>')
        elif obj.completed_at:
            return format_html('<span style="color: orange;">⏳ Pending Approval</span>')
        else:
            return format_html('<span style="color: gray;">📋 Pending</span>')
    milestone_status.short_description = 'Status'
    
    def completion_info(self, obj):
        if obj.completed_at:
            return format_html(
                '<div style="color: green;">Completed</div>'
                '<div style="color: gray; font-size: 11px;">{}</div>',
                obj.completed_at.strftime('%m/%d %H:%M')
            )
        elif obj.due_date:
            days_until_due = (obj.due_date - timezone.now().date()).days
            if days_until_due < 0:
                return format_html('<span style="color: red;">⚠️ Overdue</span>')
            elif days_until_due <= 3:
                return format_html('<span style="color: orange;">⏰ Due Soon</span>')
            else:
                return format_html('<span style="color: green;">📅 On Track</span>')
        return format_html('<span style="color: gray;">-</span>')
    completion_info.short_description = 'Completion'


@admin.register(EscrowTransaction)
class EscrowTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'escrow_project', 'transaction_info', 'amount_display', 
        'stripe_info', 'created_at'
    ]
    list_filter = ['transaction_type', 'created_at']
    search_fields = [
        'escrow__project_title', 'description', 'stripe_transaction_id'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    def escrow_project(self, obj):
        return format_html(
            '<a href="{}">{}</a>',
            reverse('admin:payments_escrowaccount_change', args=[obj.escrow.id]),
            obj.escrow.project_title
        )
    escrow_project.short_description = 'Project'
    
    def transaction_info(self, obj):
        type_icons = {
            'deposit': '💰',
            'release': '📤',
            'refund': '↩️',
            'fee': '💳',
            'dispute_fee': '⚖️'
        }
        
        icon = type_icons.get(obj.transaction_type, '💸')
        
        return format_html(
            '<div>{} <strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>',
            icon,
            obj.get_transaction_type_display(),
            obj.description[:50] + ('...' if len(obj.description) > 50 else '')
        )
    transaction_info.short_description = 'Transaction'
    
    def amount_display(self, obj):
        color = '#28a745' if obj.transaction_type in ['deposit', 'release'] else '#dc3545'
        return format_html(
            '<strong style="color: {};">${:,.2f}</strong>',
            color, obj.amount
        )
    amount_display.short_description = 'Amount'
    
    def stripe_info(self, obj):
        if obj.stripe_transaction_id:
            return format_html(
                '<div>💳 Stripe</div>'
                '<div style="color: gray; font-size: 10px;">...{}</div>',
                obj.stripe_transaction_id[-8:]
            )
        return format_html('<span style="color: gray;">Manual</span>')
    stripe_info.short_description = 'Payment Method'


@admin.register(EscrowWorkOrder)
class EscrowWorkOrderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'escrow_project', 'work_order_info', 'assigned_to_info', 
        'amount_display', 'status_badge', 'timeline_info'
    ]
    list_filter = ['work_type', 'status', 'assigned_at', 'completed_at']
    search_fields = [
        'title', 'description', 'escrow__project_title', 
        'assigned_to__email', 'assigned_to__name'
    ]
    readonly_fields = [
        'assigned_at', 'accepted_at', 'started_at', 'completed_at', 'approved_at'
    ]
    
    def escrow_project(self, obj):
        return format_html(
            '<a href="{}">{}</a>',
            reverse('admin:payments_escrowaccount_change', args=[obj.escrow.id]),
            obj.escrow.project_title
        )
    escrow_project.short_description = 'Project'
    
    def work_order_info(self, obj):
        work_type_icons = {
            'contractor': '🔨',
            'crew': '👥',
            'specialist': '🎯'
        }
        
        icon = work_type_icons.get(obj.work_type, '⚙️')
        
        return format_html(
            '<div>{} <strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>'
            '<div style="color: blue; font-size: 11px;">{} work</div>',
            icon,
            obj.title,
            obj.description[:40] + ('...' if len(obj.description) > 40 else ''),
            obj.work_type.title()
        )
    work_order_info.short_description = 'Work Order'
    
    def assigned_to_info(self, obj):
        return format_html(
            '<div><strong>{}</strong></div>'
            '<div style="color: gray; font-size: 11px;">{}</div>',
            obj.assigned_to.name or obj.assigned_to.email.split('@')[0],
            obj.assigned_to.email
        )
    assigned_to_info.short_description = 'Assigned To'
    
    def amount_display(self, obj):
        if obj.estimated_hours:
            hourly_rate = obj.assigned_amount / obj.estimated_hours
            return format_html(
                '<div style="font-weight: bold; color: #28a745;">${:,.2f}</div>'
                '<div style="color: gray; font-size: 11px;">${:,.2f}/hr × {} hrs</div>',
                obj.assigned_amount,
                hourly_rate,
                obj.estimated_hours
            )
        return format_html('<strong style="color: #28a745;">${:,.2f}</strong>', obj.assigned_amount)
    amount_display.short_description = 'Amount'
    
    def status_badge(self, obj):
        status_config = {
            'pending': ('⏳', '#ffc107'),
            'accepted': ('✅', '#28a745'),
            'rejected': ('❌', '#dc3545'),
            'in_progress': ('⚡', '#17a2b8'),
            'completed': ('🎉', '#20c997'),
            'approved': ('👍', '#6f42c1'),
        }
        
        icon, color = status_config.get(obj.status, ('❓', '#6c757d'))
        
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 12px; '
            'font-size: 11px; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def timeline_info(self, obj):
        if obj.completed_at:
            duration = obj.completed_at - obj.started_at if obj.started_at else None
            return format_html(
                '<div style="color: green;">Completed</div>'
                '<div style="color: gray; font-size: 11px;">{}</div>',
                f'Took {duration}' if duration else obj.completed_at.strftime('%m/%d')
            )
        elif obj.started_at:
            duration = timezone.now() - obj.started_at
            return format_html(
                '<div style="color: blue;">In Progress</div>'
                '<div style="color: gray; font-size: 11px;">{} days</div>',
                duration.days
            )
        elif obj.accepted_at:
            return format_html('<div style="color: orange;">Accepted</div>')
        else:
            return format_html('<div style="color: gray;">Pending</div>')
    timeline_info.short_description = 'Timeline'
