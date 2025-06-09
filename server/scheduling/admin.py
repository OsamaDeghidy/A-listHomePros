from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import AvailabilitySlot, UnavailableDate, Appointment, AppointmentNote


class AppointmentNoteInline(admin.TabularInline):
    model = AppointmentNote
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ('user', 'note', 'is_private', 'created_at')


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'alistpro_name', 'day_badge', 'time_range', 
        'recurring_status', 'created_at'
    ]
    list_filter = ['day_of_week', 'is_recurring', 'alistpro']
    search_fields = ['alistpro__business_name', 'alistpro__user__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['alistpro', 'day_of_week', 'start_time']
    
    fieldsets = (
        ('🏢 Service Provider Information', {
            'fields': ('alistpro',)
        }),
        ('📅 Time Information', {
            'fields': ('day_of_week', 'start_time', 'end_time', 'is_recurring')
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def alistpro_name(self, obj):
        return obj.alistpro.business_name or obj.alistpro.user.name
    alistpro_name.short_description = 'Service Provider'
    
    def day_badge(self, obj):
        day_names = {
            0: ('Sunday', '#007bff'),
            1: ('Monday', '#28a745'),
            2: ('Tuesday', '#17a2b8'),
            3: ('Wednesday', '#ffc107'),
            4: ('Thursday', '#fd7e14'),
            5: ('Friday', '#dc3545'),
            6: ('Saturday', '#6f42c1')
        }
        day_name, color = day_names.get(obj.day_of_week, ('Unknown', '#6c757d'))
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">{}</span>',
            color, day_name
        )
    day_badge.short_description = 'Day'
    
    def time_range(self, obj):
        return f"{obj.start_time} - {obj.end_time}"
    time_range.short_description = 'Time Range'
    
    def recurring_status(self, obj):
        if obj.is_recurring:
            return format_html('<span style="color: green;">🔄 Recurring</span>')
        else:
            return format_html('<span style="color: orange;">📅 One-time</span>')
    recurring_status.short_description = 'Recurrence'


@admin.register(UnavailableDate)
class UnavailableDateAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'alistpro_name', 'date_range', 'reason_preview', 'created_at'
    ]
    list_filter = ['start_date', 'alistpro']
    search_fields = ['alistpro__business_name', 'alistpro__user__name', 'reason']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-start_date']
    
    fieldsets = (
        ('🏢 Service Provider Information', {
            'fields': ('alistpro',)
        }),
        ('📅 Unavailable Period', {
            'fields': ('start_date', 'end_date', 'reason')
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def alistpro_name(self, obj):
        return obj.alistpro.business_name or obj.alistpro.user.name
    alistpro_name.short_description = 'Service Provider'
    
    def date_range(self, obj):
        if obj.start_date == obj.end_date:
            return f"{obj.start_date}"
        return f"{obj.start_date} to {obj.end_date}"
    date_range.short_description = 'Period'
    
    def reason_preview(self, obj):
        return obj.reason[:30] + '...' if len(obj.reason) > 30 else obj.reason
    reason_preview.short_description = 'Reason'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'client_name', 'alistpro_name', 'appointment_datetime', 
        'duration', 'status_badge', 'status', 'location_preview', 'created_at'
    ]
    list_filter = ['status', 'appointment_date', 'alistpro']
    search_fields = [
        'client__name', 'client__email', 'alistpro__business_name', 
        'alistpro__user__name', 'location', 'notes'
    ]
    readonly_fields = ['created_at', 'updated_at']
    inlines = [AppointmentNoteInline]
    list_editable = ['status']
    ordering = ['-appointment_date', '-start_time']
    
    fieldsets = (
        ('👥 Parties Involved', {
            'fields': ('client', 'alistpro')
        }),
        ('📅 Appointment Information', {
            'fields': ('appointment_date', 'start_time', 'end_time', 'status')
        }),
        ('📍 Location & Notes', {
            'fields': ('location', 'notes')
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['confirm_appointments', 'cancel_appointments', 'complete_appointments']
    
    def client_name(self, obj):
        return obj.client.name or obj.client.email
    client_name.short_description = 'Client'
    
    def alistpro_name(self, obj):
        return obj.alistpro.business_name or obj.alistpro.user.name
    alistpro_name.short_description = 'Service Provider'
    
    def appointment_datetime(self, obj):
        return f"{obj.appointment_date} {obj.start_time}"
    appointment_datetime.short_description = 'Date & Time'
    
    def duration(self, obj):
        if obj.start_time and obj.end_time:
            start = timezone.datetime.combine(obj.appointment_date, obj.start_time)
            end = timezone.datetime.combine(obj.appointment_date, obj.end_time)
            duration = end - start
            hours = duration.seconds // 3600
            minutes = (duration.seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return "Not Set"
    duration.short_description = 'Duration'
    
    def status_badge(self, obj):
        status_colors = {
            'pending': '#ffc107',
            'confirmed': '#28a745',
            'in_progress': '#17a2b8',
            'completed': '#6f42c1',
            'cancelled': '#dc3545',
            'no_show': '#6c757d'
        }
        color = status_colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def location_preview(self, obj):
        return obj.location[:30] + '...' if len(obj.location) > 30 else obj.location
    location_preview.short_description = 'Location'
    
    def confirm_appointments(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} appointments confirmed.')
    confirm_appointments.short_description = 'Confirm selected appointments'
    
    def cancel_appointments(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} appointments cancelled.')
    cancel_appointments.short_description = 'Cancel selected appointments'
    
    def complete_appointments(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} appointments completed.')
    complete_appointments.short_description = 'Complete selected appointments'


@admin.register(AppointmentNote)
class AppointmentNoteAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'appointment_info', 'user_name', 'note_preview', 
        'privacy_status', 'created_at'
    ]
    list_filter = ['is_private', 'created_at', 'user__role']
    search_fields = [
        'note', 'user__name', 'user__email', 
        'appointment__client__name', 'appointment__alistpro__business_name'
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('📝 Note Information', {
            'fields': ('appointment', 'user', 'note', 'is_private')
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def appointment_info(self, obj):
        return f"{obj.appointment.client.name} with {obj.appointment.alistpro.business_name}"
    appointment_info.short_description = 'Appointment'
    
    def user_name(self, obj):
        return obj.user.name or obj.user.email
    user_name.short_description = 'User'
    
    def note_preview(self, obj):
        return obj.note[:50] + '...' if len(obj.note) > 50 else obj.note
    note_preview.short_description = 'Note'
    
    def privacy_status(self, obj):
        if obj.is_private:
            return format_html('<span style="color: red;">🔒 Private</span>')
        else:
            return format_html('<span style="color: green;">🌐 Public</span>')
    privacy_status.short_description = 'Privacy'
