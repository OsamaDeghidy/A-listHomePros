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
    list_display = ['id', 'name', 'description', 'icon', 'get_pro_count', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fields = ('name', 'description', 'icon', 'created_at', 'updated_at')
    
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


@admin.register(AListHomeProProfile)
class AListHomeProProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'business_name', 'user_email', 'profession', 'years_of_experience', 
                   'is_verified', 'is_featured', 'is_onboarded', 'is_available', 'service_radius', 
                   'average_rating', 'total_jobs', 'jobs_completed', 'get_categories', 
                   'profile_image_preview', 'created_at']
    list_filter = ['is_verified', 'is_featured', 'is_onboarded', 'is_available', 
                  'years_of_experience', 'service_categories', 'created_at', 'updated_at']
    search_fields = ['business_name', 'business_description', 'profession', 'bio', 
                    'user__email', 'user__name', 'license_number', 'license_type']
    readonly_fields = ['profile_image_preview', 'cover_image_preview', 'success_rate', 
                      'can_be_hired', 'created_at', 'updated_at']
    filter_horizontal = ['service_categories']
    list_editable = ['is_verified', 'is_featured', 'is_available']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'business_name', 'business_description', 'profession', 
                      'bio', 'years_of_experience')
        }),
        ('Location Information', {
            'fields': ('address', 'service_radius', 'latitude', 'longitude')
        }),
        ('Professional Details', {
            'fields': ('license_number', 'license_type', 'license_expiry', 
                      'insurance_info', 'certifications')
        }),
        ('Services & Availability', {
            'fields': ('service_categories', 'hourly_rate', 'is_available')
        }),
        ('Profile Media', {
            'fields': ('profile_image', 'profile_image_preview', 'cover_image', 
                      'cover_image_preview', 'website')
        }),
        ('Platform Status', {
            'fields': ('is_verified', 'is_featured', 'is_onboarded')
        }),
        ('Statistics', {
            'fields': ('total_jobs', 'jobs_completed', 'average_rating', 
                      'response_time_hours', 'success_rate', 'can_be_hired'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
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
    profile_image_preview.short_description = 'Profile Image Preview'
    
    def cover_image_preview(self, obj):
        if obj.cover_image:
            return mark_safe(f'<img src="{obj.cover_image.url}" width="150" height="75" style="object-fit: cover;" />')
        return "No Cover Image"
    cover_image_preview.short_description = 'Cover Image Preview'


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'title', 'client_name', 'professional_name', 'service_category',
        'status', 'urgency', 'budget_range', 'is_public', 'flexible_schedule',
        'preferred_date', 'created_at'
    ]
    list_filter = ['status', 'urgency', 'service_category', 'is_public', 
                  'flexible_schedule', 'created_at', 'preferred_date']
    search_fields = ['title', 'description', 'client__name', 'client__email',
                    'service_address__street_address', 'service_address__city']
    readonly_fields = ['created_at', 'updated_at', 'images_preview']
    list_editable = ['status', 'is_public']
    
    fieldsets = (
        ('Request Details', {
            'fields': ('client', 'professional', 'title', 'description', 
                      'service_category', 'urgency')
        }),
        ('Location & Timing', {
            'fields': ('service_address', 'preferred_date', 'flexible_schedule')
        }),
        ('Budget', {
            'fields': ('budget_min', 'budget_max')
        }),
        ('Status & Management', {
            'fields': ('status', 'is_public')
        }),
        ('Images', {
            'fields': ('images', 'images_preview'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def client_name(self, obj):
        return obj.client.name or obj.client.email
    client_name.short_description = 'Client'
    
    def professional_name(self, obj):
        if obj.professional:
            return obj.professional.name or obj.professional.email
        return 'Not Assigned'
    professional_name.short_description = 'Professional'
    
    def budget_range(self, obj):
        if obj.budget_min and obj.budget_max:
            return f"${obj.budget_min} - ${obj.budget_max}"
        elif obj.budget_min:
            return f"From ${obj.budget_min}"
        elif obj.budget_max:
            return f"Up to ${obj.budget_max}"
        return "Not specified"
    budget_range.short_description = 'Budget Range'
    
    def images_preview(self, obj):
        if obj.images:
            previews = []
            for img_url in obj.images[:3]:  # Show first 3 images
                previews.append(f'<img src="{img_url}" width="75" style="margin: 2px;" />')
            if len(obj.images) > 3:
                previews.append(f'<span>+{len(obj.images) - 3} more</span>')
            return mark_safe(''.join(previews))
        return "No Images"
    images_preview.short_description = 'Images Preview'


@admin.register(AListHomeProReview)
class AListHomeProReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'alistpro_name', 'client_name', 'rating', 'title', 
                   'is_verified', 'helpful_count', 'service_category', 
                   'has_response', 'created_at']
    list_filter = ['rating', 'is_verified', 'service_category', 'created_at']
    search_fields = ['title', 'comment', 'professional_response', 
                    'client__name', 'client__email', 'alistpro__business_name']
    readonly_fields = ['created_at', 'updated_at', 'response_date']
    list_editable = ['is_verified']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('alistpro', 'client', 'service_category', 'rating', 'title', 'comment')
        }),
        ('Review Status', {
            'fields': ('is_verified', 'helpful_count')
        }),
        ('Professional Response', {
            'fields': ('professional_response', 'response_date'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def alistpro_name(self, obj):
        return obj.alistpro.business_name or obj.alistpro.user.name
    alistpro_name.short_description = 'Professional'
    
    def client_name(self, obj):
        return obj.client.name or obj.client.email
    client_name.short_description = 'Client'
    
    def has_response(self, obj):
        return bool(obj.professional_response)
    has_response.boolean = True
    has_response.short_description = 'Has Response'


@admin.register(ServiceQuote)
class ServiceQuoteAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'service_request_title', 'professional_name', 'total_price', 
        'status_badge', 'status', 'materials_included', 'warranty_period',
        'start_date', 'completion_date', 'expires_at', 'created_at'
    ]
    list_filter = ['status', 'materials_included', 'created_at', 'start_date', 'expires_at']
    search_fields = [
        'title', 'description', 'professional__name', 'professional__email',
        'service_request__title', 'service_request__client__name',
        'terms_and_conditions', 'warranty_period'
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
        'total_amount', 'status_badge', 'status', 'payment_status_badge', 
        'payment_status', 'use_escrow', 'start_date', 'completion_date',
        'actual_completion_date', 'created_at'
    ]
    list_filter = ['status', 'payment_status', 'use_escrow', 'created_at', 
                  'start_date', 'completion_date']
    search_fields = [
        'service_request__title', 'professional__name', 'client__name',
        'professional__email', 'client__email', 'progress_notes'
    ]
    readonly_fields = ['created_at', 'updated_at', 'completion_photos_preview']
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
            'fields': ('progress_notes', 'completion_photos', 'completion_photos_preview'),
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
    
    def completion_photos_preview(self, obj):
        if obj.completion_photos:
            previews = []
            for photo_url in obj.completion_photos[:3]:  # Show first 3 photos
                previews.append(f'<img src="{photo_url}" width="75" style="margin: 2px;" />')
            if len(obj.completion_photos) > 3:
                previews.append(f'<span>+{len(obj.completion_photos) - 3} more</span>')
            return mark_safe(''.join(previews))
        return "No Photos"
    completion_photos_preview.short_description = 'Completion Photos'


@admin.register(AListHomeProPortfolio)
class AListHomeProPortfolioAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'alistpro_name', 'image_preview', 'completion_date', 'created_at']
    list_filter = ['completion_date', 'created_at']
    search_fields = ['title', 'description', 'alistpro__business_name', 'alistpro__user__name']
    readonly_fields = ['image_preview', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Portfolio Information', {
            'fields': ('alistpro', 'title', 'description', 'completion_date')
        }),
        ('Media', {
            'fields': ('image', 'image_preview')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def alistpro_name(self, obj):
        return obj.alistpro.business_name or obj.alistpro.user.name
    alistpro_name.short_description = 'Professional'
    
    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="75" />')
        return "No Image"
    image_preview.short_description = 'Preview'
