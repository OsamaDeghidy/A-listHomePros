from django.contrib import admin
from django.utils.html import format_html
from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user_name', 'address_display', 'city', 'state', 
        'zip_code', 'country', 'primary_status', 'is_primary', 'created_at'
    ]
    list_filter = ['is_primary', 'city', 'state', 'country', 'created_at']
    search_fields = [
        'user__name', 'user__email', 'street_address', 
        'city', 'state', 'zip_code'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['is_primary']
    ordering = ['-created_at']
    
    fieldsets = (
        ('👤 User Information', {
            'fields': ('user',)
        }),
        ('📍 Address Details', {
            'fields': ('street_address', 'city', 'state', 'zip_code', 'country')
        }),
        ('⚙️ Settings', {
            'fields': ('is_primary',)
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_primary', 'remove_primary']
    
    def user_name(self, obj):
        return obj.user.name or obj.user.email
    user_name.short_description = 'User'
    
    def address_display(self, obj):
        return obj.street_address[:30] + '...' if len(obj.street_address) > 30 else obj.street_address
    address_display.short_description = 'Address'
    
    def primary_status(self, obj):
        if obj.is_primary:
            return format_html('<span style="color: green; font-weight: bold;">⭐ Primary Address</span>')
        else:
            return format_html('<span style="color: gray;">📍 Secondary Address</span>')
    primary_status.short_description = 'Type'
    
    def make_primary(self, request, queryset):
        # Remove all primary addresses for selected users first
        for address in queryset:
            Address.objects.filter(user=address.user, is_primary=True).update(is_primary=False)
        
        updated = queryset.update(is_primary=True)
        self.message_user(request, f'{updated} addresses set as primary.')
    make_primary.short_description = 'Set as primary address'
    
    def remove_primary(self, request, queryset):
        updated = queryset.update(is_primary=False)
        self.message_user(request, f'Primary status removed from {updated} addresses.')
    remove_primary.short_description = 'Remove primary status'
