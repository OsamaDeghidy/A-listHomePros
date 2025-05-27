from django.contrib import admin
from django.utils.html import mark_safe
from .models import ServiceCategory, AListHomeProProfile, AListHomeProPortfolio, AListHomeProReview


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
        return obj.alistpros.count()
    get_pro_count.short_description = 'Professionals'


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
