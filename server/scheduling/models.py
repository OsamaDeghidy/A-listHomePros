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
    day_of_week = models.IntegerField(
        choices=[
            (0, 'Monday'),
            (1, 'Tuesday'),
            (2, 'Wednesday'),
            (3, 'Thursday'),
            (4, 'Friday'),
            (5, 'Saturday'),
            (6, 'Sunday'),
        ]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_recurring = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['day_of_week', 'start_time']
        
    def __str__(self):
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return f"{self.alistpro.business_name} - {day_names[self.day_of_week]} {self.start_time} to {self.end_time}"


class UnavailableDate(TimeStampedModel):
    """Specific dates when an A-List Home Pro is unavailable"""
    alistpro = models.ForeignKey(
        AListHomeProProfile,
        on_delete=models.CASCADE,
        related_name='unavailable_dates'
    )
    date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['date']
        
    def __str__(self):
        return f"{self.alistpro.business_name} - Unavailable on {self.date}"


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
