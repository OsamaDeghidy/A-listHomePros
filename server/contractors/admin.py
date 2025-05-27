from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import ServiceCategory, ContractorProfile, ContractorPortfolio, ContractorReview


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    """
    Admin interface for ServiceCategory model
    واجهة الإدارة لفئات الخدمات
    """
    list_display = ('name', 'description', 'created_at', 'updated_at', 'contractor_count')
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    
    def contractor_count(self, obj):
        """
        Returns the number of contractors for this category
        يعرض عدد المقاولين في هذه الفئة
        """
        return obj.contractors.count()
    contractor_count.short_description = 'Number of Contractors'


class ContractorPortfolioInline(admin.TabularInline):
    """
    Inline admin for ContractorPortfolio
    واجهة إدارة مضمنة لمعرض أعمال المقاول
    """
    model = ContractorPortfolio
    extra = 1
    fields = ('title', 'description', 'image', 'completion_date')


class ContractorReviewInline(admin.TabularInline):
    """
    Inline admin for ContractorReview
    واجهة إدارة مضمنة لتقييمات المقاول
    """
    model = ContractorReview
    extra = 0
    fields = ('client', 'rating', 'comment', 'is_verified', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(ContractorProfile)
class ContractorProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for ContractorProfile model
    واجهة الإدارة لملفات المقاولين
    """
    list_display = ('business_name', 'user_email', 'years_of_experience', 
                   'service_radius', 'is_onboarded', 'profile_image_preview', 'created_at')
    list_filter = ('is_onboarded', 'years_of_experience', 'service_categories', 'created_at')
    search_fields = ('business_name', 'business_description', 'user__email', 'license_number')
    readonly_fields = ('created_at', 'updated_at', 'profile_image_preview')
    filter_horizontal = ('service_categories',)
    inlines = [ContractorPortfolioInline, ContractorReviewInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'business_name', 'business_description', 'profile_image', 'profile_image_preview')
        }),
        ('Professional Details', {
            'fields': ('years_of_experience', 'license_number', 'insurance_info', 'service_radius')
        }),
        ('Categories', {
            'fields': ('service_categories',)
        }),
        ('Status', {
            'fields': ('is_onboarded',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def user_email(self, obj):
        """
        Returns the email of the user
        يعرض البريد الإلكتروني للمستخدم
        """
        return obj.user.email
    user_email.short_description = 'Email'
    
    def profile_image_preview(self, obj):
        """
        Returns a thumbnail of the profile image
        يعرض صورة مصغرة للملف الشخصي
        """
        if obj.profile_image:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 50%;" />', obj.profile_image.url)
        return "No Image"
    profile_image_preview.short_description = 'Profile Image'


@admin.register(ContractorPortfolio)
class ContractorPortfolioAdmin(admin.ModelAdmin):
    """
    Admin interface for ContractorPortfolio model
    واجهة الإدارة لمعرض أعمال المقاولين
    """
    list_display = ('title', 'contractor_name', 'image_preview', 'completion_date', 'created_at')
    list_filter = ('completion_date', 'created_at')
    search_fields = ('title', 'description', 'contractor__business_name')
    readonly_fields = ('created_at', 'updated_at', 'image_preview')
    
    fieldsets = (
        ('Portfolio Item', {
            'fields': ('contractor', 'title', 'description', 'image', 'image_preview', 'completion_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def contractor_name(self, obj):
        """
        Returns the business name of the contractor
        يعرض اسم الشركة للمقاول
        """
        return obj.contractor.business_name
    contractor_name.short_description = 'Contractor'
    
    def image_preview(self, obj):
        """
        Returns a thumbnail of the portfolio image
        يعرض صورة مصغرة لمعرض الأعمال
        """
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'


@admin.register(ContractorReview)
class ContractorReviewAdmin(admin.ModelAdmin):
    """
    Admin interface for ContractorReview model
    واجهة الإدارة لتقييمات المقاولين
    """
    list_display = ('contractor_name', 'client_name', 'rating_stars', 'comment_excerpt', 'is_verified', 'created_at')
    list_filter = ('rating', 'is_verified', 'created_at')
    search_fields = ('comment', 'contractor__business_name', 'client__email')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_verified',)
    
    fieldsets = (
        ('Review Details', {
            'fields': ('contractor', 'client', 'rating', 'comment', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def contractor_name(self, obj):
        """
        Returns the business name of the contractor
        يعرض اسم الشركة للمقاول
        """
        return obj.contractor.business_name
    contractor_name.short_description = 'Contractor'
    
    def client_name(self, obj):
        """
        Returns the name of the client
        يعرض اسم العميل
        """
        return obj.client.get_full_name() or obj.client.email
    client_name.short_description = 'Client'
    
    def rating_stars(self, obj):
        """
        Displays the rating as stars
        يعرض التقييم على شكل نجوم
        """
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html('<span style="color: gold;">{}</span>', stars)
    rating_stars.short_description = 'Rating'
    
    def comment_excerpt(self, obj):
        """
        Returns the first 50 characters of the comment
        يعرض أول 50 حرفًا من التعليق
        """
        if len(obj.comment) > 50:
            return obj.comment[:50] + '...'
        return obj.comment
    comment_excerpt.short_description = 'Comment'
