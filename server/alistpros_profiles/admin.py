from django.contrib import admin
from django.utils.html import mark_safe, format_html
from django.urls import reverse
from django.utils.safestring import SafeString
from .models import (
    ServiceCategory, AListHomeProProfile, AListHomeProPortfolio, 
    AListHomeProReview, ServiceRequest, 
    ServiceQuote, JobAssignment
)


class AListHomeProPortfolioInline(admin.TabularInline):
    model = AListHomeProPortfolio
    extra = 0
    readonly_fields = ['image_preview', 'created_at', 'updated_at']
    fields = ('title', 'description', 'image', 'image_preview', 'completion_date')
    
    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="100" />')
        return "No Image"
    image_preview.short_description = 'Preview'


class AListHomeProReviewInline(admin.TabularInline):
    model = AListHomeProReview
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ('client', 'rating', 'comment', 'is_verified', 'created_at')
    can_delete = False


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'get_pro_count', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_pro_count(self, obj):
        try:
            return obj.alistpros.count()
        except AttributeError:
            # Handle case where old 'professionals' relationship might still exist
            try:
                return obj.professionals.count() if hasattr(obj, 'professionals') else 0
            except:
                return 0
    get_pro_count.short_description = 'Professionals'


# ProfessionalProfile admin removed - using AListHomeProProfile instead


@admin.register(AListHomeProProfile)
class AListHomeProProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'business_name', 'user_email', 'years_of_experience', 'is_onboarded',
                   'service_radius', 'get_categories', 'profile_image_preview', 'created_at']
    list_filter = ['is_onboarded', 'years_of_experience', 'service_categories', 'created_at', 'updated_at']
    search_fields = ['business_name', 'business_description', 'user__email', 'user__name', 'license_number']
    readonly_fields = ['profile_image_preview', 'created_at', 'updated_at']
    filter_horizontal = ['service_categories']
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'business_name', 'business_description', 'years_of_experience', 'is_onboarded')
        }),
        ('Professional Details', {
            'fields': ('license_number', 'insurance_info', 'service_radius')
        }),
        ('Categories & Media', {
            'fields': ('service_categories', 'profile_image', 'profile_image_preview')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    inlines = [AListHomeProPortfolioInline, AListHomeProReviewInline]
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    
    def get_categories(self, obj):
        return ", ".join([cat.name for cat in obj.service_categories.all()])
    get_categories.short_description = 'Categories'
    
    def profile_image_preview(self, obj):
        if obj.profile_image:
            return mark_safe(f'<img src="{obj.profile_image.url}" width="100" />')
        return "No Image"
    profile_image_preview.short_description = 'Image Preview'


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'title', 'client_name', 'professional_name', 'service_category',
        'status', 'urgency', 'created_at'
    ]
    list_filter = ['status', 'urgency', 'service_category', 'created_at']
    search_fields = ['title', 'description', 'client__name', 'client__email']
    readonly_fields = ['created_at', 'updated_at']
    
    def client_name(self, obj):
        return obj.client.name or obj.client.email
    client_name.short_description = 'Client'
    
    def professional_name(self, obj):
        if obj.professional:
            return obj.professional.name or obj.professional.email
        return 'Not Assigned'
    professional_name.short_description = 'Professional'


# Review admin removed - using AListHomeProReview instead


@admin.register(AListHomeProReview)
class AListHomeProReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'alistpro_name', 'client_name', 'rating', 'is_verified', 'created_at']
    list_filter = ['rating', 'is_verified', 'created_at']
    search_fields = ['comment', 'client__name', 'client__email', 'alistpro__business_name']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['is_verified']
    
    def alistpro_name(self, obj):
        return obj.alistpro.business_name
    alistpro_name.short_description = 'Professional'
    
    def client_name(self, obj):
        return obj.client.name or obj.client.email
    client_name.short_description = 'Client'


# Additional Models for New Professional Profile System

@admin.register(ServiceQuote)
class ServiceQuoteAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'service_request_title', 'professional_name', 'total_price', 
        'status_badge', 'status', 'start_date', 'expires_at', 'created_at'
    ]
    list_filter = ['status', 'materials_included', 'created_at', 'start_date']
    search_fields = [
        'title', 'description', 'professional__name', 'professional__email',
        'service_request__title', 'service_request__client__name'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['status']
    ordering = ['-created_at']
    
    fieldsets = (
        ('📝 Quote Information', {
            'fields': ('service_request', 'professional', 'title', 'description')
        }),
        ('💰 Financial Details', {
            'fields': ('total_price', 'materials_included')
        }),
        ('📅 Timeline', {
            'fields': ('estimated_duration', 'start_date', 'completion_date')
        }),
        ('📋 Terms & Conditions', {
            'fields': ('terms_and_conditions', 'warranty_period'),
            'classes': ('collapse',)
        }),
        ('📊 Status & Expiry', {
            'fields': ('status', 'expires_at', 'client_message')
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def service_request_title(self, obj):
        return obj.service_request.title
    service_request_title.short_description = 'Service Request'
    
    def professional_name(self, obj):
        return obj.professional.name or obj.professional.email
    professional_name.short_description = 'Professional'
    
    def status_badge(self, obj):
        status_colors = {
            'pending': '#ffc107',
            'accepted': '#28a745',
            'rejected': '#dc3545',
            'expired': '#6c757d'
        }
        color = status_colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(JobAssignment)
class JobAssignmentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'service_request_title', 'professional_name', 'client_name',
        'total_amount', 'status_badge', 'status', 'payment_status_badge', 'payment_status', 'start_date', 'actual_completion_date'
    ]
    list_filter = ['status', 'payment_status', 'use_escrow', 'created_at']
    search_fields = [
        'service_request__title', 'professional__name', 'client__name',
        'professional__email', 'client__email'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['status', 'payment_status']
    ordering = ['-created_at']
    
    fieldsets = (
        ('🤝 Project Parties', {
            'fields': ('service_request', 'quote', 'professional', 'client')
        }),
        ('💼 Project Details', {
            'fields': ('status', 'start_date', 'completion_date', 'actual_completion_date')
        }),
        ('💰 Financial Information', {
            'fields': ('total_amount', 'payment_status', 'use_escrow')
        }),
        ('📝 Progress & Notes', {
            'fields': ('progress_notes', 'completion_photos'),
            'classes': ('collapse',)
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def service_request_title(self, obj):
        return obj.service_request.title
    service_request_title.short_description = 'Service Request'
    
    def professional_name(self, obj):
        return obj.professional.name or obj.professional.email
    professional_name.short_description = 'Professional'
    
    def client_name(self, obj):
        return obj.client.name or obj.client.email
    client_name.short_description = 'Client'
    
    def status_badge(self, obj):
        status_colors = {
            'assigned': '#17a2b8',
            'in_progress': '#ffc107',
            'completed': '#28a745',
            'cancelled': '#dc3545'
        }
        color = status_colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Project Status'
    
    def payment_status_badge(self, obj):
        if obj.payment_status == 'completed':
            return format_html('<span style="color: green; font-weight: bold;">✅ Completed</span>')
        elif obj.payment_status == 'pending':
            return format_html('<span style="color: orange; font-weight: bold;">⏳ Pending</span>')
        else:
            return format_html('<span style="color: red; font-weight: bold;">❌ Failed</span>')
    payment_status_badge.short_description = 'Payment Status'


# Availability and TimeOff admin removed - these models are now in scheduling app
# Use AvailabilitySlot and UnavailableDate instead


@admin.register(AListHomeProPortfolio)
class AListHomeProPortfolioAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'alistpro_name', 'image_preview', 'completion_date', 'created_at']
    list_filter = ['completion_date', 'created_at']
    search_fields = ['title', 'description', 'alistpro__business_name']
    readonly_fields = ['image_preview', 'created_at', 'updated_at']
    
    def alistpro_name(self, obj):
        return obj.alistpro.business_name
    alistpro_name.short_description = 'Professional'
    
    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="75" />')
        return "No Image"
    image_preview.short_description = 'Preview'
