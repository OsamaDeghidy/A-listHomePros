from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel
from users.models import UserRole


class ServiceCategory(TimeStampedModel):
    """
    Categories of services offered by A-List Home Pros
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon class name')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Service Categories'



class ServiceRequest(TimeStampedModel):
    """
    Service requests from clients to professionals
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('quoted', 'Quoted'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('emergency', 'Emergency'),
    ]
    
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='service_requests')
    professional = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_requests', null=True, blank=True)
    
    # Request Details
    title = models.CharField(max_length=200)
    description = models.TextField()
    service_category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    
    # Location and Timing
    service_address = models.ForeignKey('core.Address', on_delete=models.CASCADE, related_name='service_requests')
    preferred_date = models.DateTimeField(null=True, blank=True)
    flexible_schedule = models.BooleanField(default=True)
    
    # Budget
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status and Management
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_public = models.BooleanField(default=True, help_text='Whether this request is visible to all professionals')
    
    # Images
    images = models.JSONField(default=list, blank=True, help_text='List of image URLs')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.client.name}"


class ServiceQuote(TimeStampedModel):
    """
    Quotes from professionals to service requests
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='quotes')
    professional = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quotes_sent')
    
    # Quote Details
    title = models.CharField(max_length=200)
    description = models.TextField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_duration = models.CharField(max_length=100, help_text='e.g., 2-3 hours, 1 day')
    
    # Timeline
    start_date = models.DateTimeField()
    completion_date = models.DateTimeField()
    
    # Terms
    terms_and_conditions = models.TextField(blank=True)
    materials_included = models.BooleanField(default=True)
    warranty_period = models.CharField(max_length=100, blank=True, help_text='e.g., 1 year')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Response from client
    client_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['service_request', 'professional']
    
    def __str__(self):
        return f"Quote for {self.service_request.title} by {self.professional.name}"


class JobAssignment(TimeStampedModel):
    """
    Job assignments when quotes are accepted
    """
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    service_request = models.OneToOneField(ServiceRequest, on_delete=models.CASCADE, related_name='assignment')
    quote = models.OneToOneField(ServiceQuote, on_delete=models.CASCADE, related_name='assignment')
    professional = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_assignments')
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hired_jobs')
    
    # Job Details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    start_date = models.DateTimeField()
    completion_date = models.DateTimeField(null=True, blank=True)
    actual_completion_date = models.DateTimeField(null=True, blank=True)
    
    # Payment
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, default='pending')
    use_escrow = models.BooleanField(default=False)
    
    # Progress Updates
    progress_notes = models.TextField(blank=True)
    completion_photos = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Job: {self.service_request.title} - {self.professional.name}"


# Availability and TimeOff models moved to scheduling app
# Use AvailabilitySlot and UnavailableDate instead


# Review model removed - use AListHomeProReview instead


# Legacy models for backward compatibility
class AListHomeProProfile(TimeStampedModel):
    """
    Extended profile information for A-List Home Pros
    Supports all professional users (contractor, specialist, crew)
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alistpro_profile')
    
    # Basic Information
    business_name = models.CharField(max_length=255, blank=True, null=True)
    business_description = models.TextField(blank=True, help_text='Professional biography')
    profession = models.CharField(max_length=200, blank=True, help_text='Primary profession/specialization')
    bio = models.TextField(blank=True, help_text='Professional biography')
    years_of_experience = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(50)])
    
    # Location Information
    address = models.OneToOneField('core.Address', on_delete=models.SET_NULL, null=True, blank=True, related_name='alistpro_address')
    service_radius = models.PositiveIntegerField(default=50, help_text='Service radius in miles')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Professional Details
    license_number = models.CharField(max_length=100, blank=True, help_text='Professional license number')
    license_type = models.CharField(max_length=100, blank=True, help_text='Type of license')
    license_expiry = models.DateField(null=True, blank=True)
    insurance_info = models.CharField(max_length=255, blank=True)
    certifications = models.TextField(blank=True, help_text='Professional certifications')
    
    # Services and Availability
    service_categories = models.ManyToManyField(ServiceCategory, related_name='alistpros', blank=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    
    # Profile Details
    profile_image = models.ImageField(upload_to='alistpro_profiles/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='alistpro_covers/', blank=True, null=True)
    website = models.URLField(blank=True)
    
    # Platform Status
    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_onboarded = models.BooleanField(default=False)
    
    # Statistics
    total_jobs = models.PositiveIntegerField(default=0)
    jobs_completed = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    response_time_hours = models.PositiveIntegerField(default=24, help_text='Average response time in hours')
    
    class Meta:
        ordering = ['-average_rating', '-total_jobs']
        verbose_name = 'A-List Home Pro Profile'
        verbose_name_plural = 'A-List Home Pro Profiles'
    
    def __str__(self):
        name = self.business_name or self.user.name
        return f"{name} ({self.user.get_role_display()})"
    
    @property 
    def success_rate(self):
        if self.total_jobs == 0:
            return 0
        return round((self.jobs_completed / self.total_jobs) * 100, 1)
    
    @property
    def can_be_hired(self):
        return self.is_available and self.is_verified and self.user.role in ['contractor', 'specialist', 'crew']


class AListHomeProPortfolio(TimeStampedModel):
    """
    Portfolio items for A-List Home Pros to showcase their work
    """
    alistpro = models.ForeignKey(AListHomeProProfile, on_delete=models.CASCADE, related_name='portfolio_items')
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='alistpro_portfolio/')
    completion_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.title


class AListHomeProReview(TimeStampedModel):
    """
    DEPRECATED: Use Review instead
    Reviews for A-List Home Pros left by clients
    """
    alistpro = models.ForeignKey(AListHomeProProfile, on_delete=models.CASCADE, related_name='reviews')
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alistpro_reviews_given')
    rating = models.PositiveSmallIntegerField(choices=[(1, '1 Star'), (2, '2 Stars'), (3, '3 Stars'), (4, '4 Stars'), (5, '5 Stars')])
    title = models.CharField(max_length=255, blank=True)
    comment = models.TextField()
    is_verified = models.BooleanField(default=False)
    
    # Professional response fields
    professional_response = models.TextField(blank=True, null=True, help_text='Professional response to the review')
    response_date = models.DateTimeField(blank=True, null=True, help_text='Date when professional responded')
    
    # Additional fields for better review management
    helpful_count = models.PositiveIntegerField(default=0, help_text='Number of people who found this review helpful')
    service_category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True, help_text='Service category this review is for')
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['alistpro', 'client']  # One review per client per professional
    
    def __str__(self):
        return f"Review for {self.alistpro.business_name} by {self.client.email} ({self.rating} stars)"
