from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.contrib import messages
from .models import Address


class AddressForm(forms.ModelForm):
    """Custom form for Address with optional zip_code"""
    
    class Meta:
        model = Address
        fields = '__all__'
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make zip_code optional
        self.fields['zip_code'].required = False
        self.fields['zip_code'].help_text = 'Optional postal/zip code'
        
        # Add helpful placeholders
        self.fields['street_address'].widget.attrs.update({
            'placeholder': 'e.g., Corniche Road, 123 Main Street'
        })
        self.fields['city'].widget.attrs.update({
            'placeholder': 'e.g., Alexandria, Cairo'
        })
        self.fields['state'].widget.attrs.update({
            'placeholder': 'e.g., Alexandria, Giza'
        })
        self.fields['zip_code'].widget.attrs.update({
            'placeholder': 'e.g., 21500 (optional)'
        })

    def clean_zip_code(self):
        """Clean zip_code field - convert empty string to None"""
        zip_code = self.cleaned_data.get('zip_code')
        if zip_code is not None and zip_code.strip() == '':
            return None
        return zip_code


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    form = AddressForm  # Use custom form
    list_display = [
        'id', 'user_name', 'address_display', 'city', 'state', 
        'zip_code', 'country', 'coordinates_display', 'primary_status', 'is_primary', 'created_at'
    ]
    list_filter = ['is_primary', 'city', 'state', 'country', 'created_at']
    search_fields = [
        'user__name', 'user__email', 'street_address', 
        'city', 'state', 'zip_code'
    ]
    readonly_fields = ['created_at', 'updated_at', 'coordinates_display', 'geocoding_status']
    list_editable = ['is_primary']
    ordering = ['-created_at']
    
    fieldsets = (
        ('👤 User Information', {
            'fields': ('user',)
        }),
        ('📍 Address Details', {
            'fields': ('street_address', 'city', 'state', 'zip_code', 'country'),
            'description': 'Enter address details. Zip code is optional.'
        }),
        ('🗺️ Location Coordinates', {
            'fields': ('latitude', 'longitude', 'coordinates_display', 'geocoding_status'),
            'classes': ('collapse',),
            'description': 'Geographic coordinates for map display. Leave empty for automatic geocoding when saving.'
        }),
        ('⚙️ Settings', {
            'fields': ('is_primary',)
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['make_primary', 'remove_primary', 'geocode_addresses']
    
    def user_name(self, obj):
        return obj.user.name or obj.user.email
    user_name.short_description = 'User'
    
    def address_display(self, obj):
        return obj.street_address[:30] + '...' if len(obj.street_address) > 30 else obj.street_address
    address_display.short_description = 'Address'
    
    def coordinates_display(self, obj):
        if obj.latitude and obj.longitude:
            return format_html(
                '<span style="color: green; font-weight: bold;">📍 {}, {}</span><br>'
                '<small><a href="https://www.google.com/maps?q={},{}" target="_blank">🔗 View on Google Maps</a></small>',
                obj.latitude, obj.longitude, obj.latitude, obj.longitude
            )
        else:
            return format_html('<span style="color: orange;">⚠️ No coordinates</span>')
    coordinates_display.short_description = 'Coordinates'
    
    def geocoding_status(self, obj):
        if obj.latitude and obj.longitude:
            return format_html('<span style="color: green;">✅ Geocoded successfully</span>')
        else:
            return format_html('<span style="color: red;">❌ Not geocoded</span>')
    geocoding_status.short_description = 'Geocoding Status'
    
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
    
    def geocode_addresses(self, request, queryset):
        """Manually geocode selected addresses"""
        geocoded_count = 0
        failed_count = 0
        
        for address in queryset:
            if not address.latitude or not address.longitude:
                if address.geocode_address():
                    address.save()
                    geocoded_count += 1
                else:
                    failed_count += 1
        
        if geocoded_count > 0:
            messages.success(request, f'Successfully geocoded {geocoded_count} addresses.')
        
        if failed_count > 0:
            messages.warning(request, f'Failed to geocode {failed_count} addresses.')
        
        if geocoded_count == 0 and failed_count == 0:
            messages.info(request, 'All selected addresses already have coordinates.')
    
    geocode_addresses.short_description = 'Geocode selected addresses'
    
    def save_model(self, request, obj, form, change):
        """Override save to provide feedback about geocoding and handle empty zip_code"""
        # Handle empty zip_code
        if not obj.zip_code or obj.zip_code.strip() == '':
            obj.zip_code = None
            
        had_coordinates_before = bool(obj.latitude and obj.longitude) if change else False
        
        super().save_model(request, obj, form, change)
        
        # Refresh from database to get updated coordinates
        obj.refresh_from_db()
        
        if obj.latitude and obj.longitude:
            if not had_coordinates_before:
                messages.success(request, f'Address saved and automatically geocoded to: {obj.latitude}, {obj.longitude}')
            else:
                messages.info(request, 'Address saved successfully.')
        else:
            messages.warning(request, 'Address saved but could not be geocoded automatically. Please check the address details.')

    class Media:
        css = {
            'all': ('admin/css/address_admin.css',)
        }
        js = ('admin/js/address_admin.js',)
