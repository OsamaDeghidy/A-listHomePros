from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from decimal import Decimal

# Use AListHomeProProfile model
from alistpros_profiles.models import AListHomeProProfile


class PaymentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'


class Payment(TimeStampedModel):
    """
    Model to track payments between clients and A-List Home Pros
    """
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments_made')
    # Use AListHomeProProfile for all professional users
    professional = models.ForeignKey('alistpros_profiles.AListHomeProProfile', on_delete=models.CASCADE, 
                                     related_name='payments_received', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_transfer_id = models.CharField(max_length=255, blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        if self.professional:
            pro_name = self.professional.business_name or self.professional.user.name
        else:
            pro_name = "Unknown Pro"
        return f"Payment of ${self.amount} from {self.client.name} to {pro_name}"


class AListHomeProStripeAccount(TimeStampedModel):
    """
    Model to track Stripe Connect Express accounts for A-List Home Pros
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alistpro_stripe_account')
    stripe_account_id = models.CharField(max_length=255)
    is_details_submitted = models.BooleanField(default=False)
    is_charges_enabled = models.BooleanField(default=False)
    is_payouts_enabled = models.BooleanField(default=False)
    onboarding_url = models.TextField(blank=True, null=True)
    onboarding_complete = models.BooleanField(default=False)
    onboarding_started_at = models.DateTimeField(auto_now_add=True)
    onboarding_completed_at = models.DateTimeField(null=True, blank=True)
    last_webhook_received_at = models.DateTimeField(null=True, blank=True)
    last_webhook_type = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Stripe account for {self.user.email}"
    
    def mark_onboarding_complete(self):
        """Mark the onboarding process as complete"""
        self.onboarding_complete = True
        self.onboarding_completed_at = timezone.now()
        self.save(update_fields=['onboarding_complete', 'onboarding_completed_at'])
    
    def update_webhook_received(self, webhook_type):
        """Update the last webhook received information"""
        self.last_webhook_received_at = timezone.now()
        self.last_webhook_type = webhook_type
        self.save(update_fields=['last_webhook_received_at', 'last_webhook_type'])


# Keep the old model name as a proxy for backward compatibility
class StripeAccount(AListHomeProStripeAccount):
    class Meta:
        proxy = True


class EscrowStatus(models.TextChoices):
    PENDING = 'pending', _('Pending Deposit')
    FUNDED = 'funded', _('Funded')
    IN_PROGRESS = 'in_progress', _('Work In Progress')
    PENDING_APPROVAL = 'pending_approval', _('Pending Client Approval')
    RELEASED = 'released', _('Released to Provider')
    DISPUTED = 'disputed', _('Disputed')
    REFUNDED = 'refunded', _('Refunded to Client')
    CANCELLED = 'cancelled', _('Cancelled')


class EscrowAccount(TimeStampedModel):
    """
    Escrow account for secure payments between clients and service providers
    Similar to Upwork's escrow system
    """
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='escrow_accounts')
    specialist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                                   related_name='managed_escrows', null=True, blank=True,
                                   limit_choices_to={'role': 'specialist'})
    project_title = models.CharField(max_length=255)
    project_description = models.TextField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)  # Amount after platform fee
    status = models.CharField(max_length=20, choices=EscrowStatus.choices, default=EscrowStatus.PENDING)
    
    # Stripe integration
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_transfer_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Timeline
    funded_at = models.DateTimeField(blank=True, null=True)
    work_started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    released_at = models.DateTimeField(blank=True, null=True)
    
    # Dispute handling
    dispute_reason = models.TextField(blank=True, null=True)
    disputed_at = models.DateTimeField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Escrow: {self.project_title} - ${self.total_amount}"
    
    def calculate_platform_fee(self):
        """Calculate platform fee based on total amount"""
        fee_percentage = getattr(settings, 'ESCROW_PLATFORM_FEE', 0.05)  # 5% default
        return self.total_amount * Decimal(fee_percentage)
    
    def save(self, *args, **kwargs):
        if not self.platform_fee:
            self.platform_fee = self.calculate_platform_fee()
        self.net_amount = self.total_amount - self.platform_fee
        super().save(*args, **kwargs)


class EscrowMilestone(TimeStampedModel):
    """
    Milestones within an escrow account for project phases
    """
    escrow = models.ForeignKey(EscrowAccount, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    released_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.escrow.project_title} - {self.title}"


class EscrowTransaction(TimeStampedModel):
    """
    Track all transactions within an escrow account
    """
    TRANSACTION_TYPES = [
        ('deposit', 'Client Deposit'),
        ('release', 'Release to Provider'),
        ('refund', 'Refund to Client'),
        ('fee', 'Platform Fee'),
        ('dispute_fee', 'Dispute Resolution Fee'),
    ]
    
    escrow = models.ForeignKey(EscrowAccount, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    stripe_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.escrow.project_title} - {self.transaction_type}: ${self.amount}"


class EscrowWorkOrder(TimeStampedModel):
    """
    Work orders assigned to contractors/crew through escrow projects
    """
    escrow = models.ForeignKey(EscrowAccount, on_delete=models.CASCADE, related_name='work_orders')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                                    related_name='assigned_work_orders')
    work_type = models.CharField(max_length=100)  # 'contractor', 'crew', 'specialist'
    title = models.CharField(max_length=255)
    description = models.TextField()
    assigned_amount = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    # Status tracking
    STATUS_CHOICES = [
        ('pending', 'Pending Assignment'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('approved', 'Approved by Client'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timeline
    assigned_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Work Order: {self.title} - {self.assigned_to.name}"
