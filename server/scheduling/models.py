from django.db import models
from django.conf import settings
from core.models import TimeStampedModel
from alistpros_profiles.models import AListHomeProProfile, ServiceCategory


class AvailabilitySlot(TimeStampedModel):
    """Time slots when an A-List Home Pro is available for appointments"""
    alistpro = models.ForeignKey(
        AListHomeProProfile,
        on_delete=models.CASCADE,
        related_name='availability_slots'
    )
    # Support both old and new structure
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='professional_availability_slots',
        null=True,
        blank=True,
        help_text='Direct reference to professional user (for compatibility)'
    )
    day_of_week = models.IntegerField(
        choices=[
            (0, 'Sunday'),
            (1, 'Monday'),
            (2, 'Tuesday'),
            (3, 'Wednesday'),
            (4, 'Thursday'),
            (5, 'Friday'),
            (6, 'Saturday'),
        ]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_recurring = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['day_of_week', 'start_time']
        
    def __str__(self):
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        if self.alistpro:
            name = self.alistpro.business_name or self.alistpro.user.name
        else:
            name = self.professional.name
        return f"{name} - {day_names[self.day_of_week]} {self.start_time} to {self.end_time}"


class UnavailableDate(TimeStampedModel):
    """Specific dates when an A-List Home Pro is unavailable"""
    alistpro = models.ForeignKey(
        AListHomeProProfile,
        on_delete=models.CASCADE,
        related_name='unavailable_dates'
    )
    # Support both old and new structure  
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='professional_unavailable_dates',
        null=True,
        blank=True,
        help_text='Direct reference to professional user (for compatibility)'
    )
    start_date = models.DateField(help_text="Start date of unavailability")
    end_date = models.DateField(blank=True, null=True, help_text="End date of unavailability (optional, defaults to start_date)")
    reason = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['start_date']
        
    def __str__(self):
        if self.alistpro:
            name = self.alistpro.business_name or self.alistpro.user.name
        else:
            name = self.professional.name
        return f"{name} - Unavailable on {self.start_date}"


class AppointmentStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', 'Requested'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    RESCHEDULED = 'RESCHEDULED', 'Rescheduled'


class Appointment(TimeStampedModel):
    """Appointment between a client and A-List Home Pro"""
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    alistpro = models.ForeignKey(
        AListHomeProProfile,
        on_delete=models.CASCADE,
        related_name='alistpro_appointments'
    )
    service_category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='appointments'
    )
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.REQUESTED
    )
    notes = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    class Meta:
        ordering = ['appointment_date', 'start_time']
        
    def __str__(self):
        return f"Appointment with {self.alistpro.business_name} on {self.appointment_date} at {self.start_time}"


class AppointmentNote(TimeStampedModel):
    """Notes related to an appointment"""
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='appointment_notes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointment_notes'
    )
    note = models.TextField()
    is_private = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Note for appointment {self.appointment.id} by {self.user.name}"
