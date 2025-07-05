from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from decimal import Decimal
from datetime import timedelta
from django.conf import settings

# Use AListHomeProProfile model
from alistpros_profiles.models import AListHomeProProfile


# Payment models replaced by unified EscrowAccount + EscrowMilestone system


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
    Unified escrow account for all payment types - from simple services to complex projects
    Replaces both Payment and PaymentInstallment models for consistency
    """
    # Project Types
    PROJECT_TYPES = [
        ('simple', 'Simple Service'),      # Single payment (was Payment)
        ('installment', 'Installment'),    # 2-3 payments (was PaymentInstallment)
        ('complex', 'Complex Project'),    # Multiple milestones
    ]
    
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='escrow_accounts')
    professional = models.ForeignKey('alistpros_profiles.AListHomeProProfile', on_delete=models.CASCADE, 
                                    related_name='escrow_received', null=True, blank=True)
    specialist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                                   related_name='managed_escrows', null=True, blank=True,
                                   limit_choices_to={'role': 'specialist'})
    
    # Project Info
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPES, default='simple')
    project_title = models.CharField(max_length=255)
    project_description = models.TextField()
    
    # Financial Details
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)  # Amount after platform fee
    status = models.CharField(max_length=20, choices=EscrowStatus.choices, default=EscrowStatus.PENDING)
    
    # Link to original quote if applicable
    service_quote = models.ForeignKey('alistpros_profiles.ServiceQuote', on_delete=models.SET_NULL, 
                                     null=True, blank=True, related_name='escrow_accounts')
    
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
    
    @classmethod
    def create_simple_service(cls, client, professional, title, description, amount):
        """Create a simple service escrow (single payment)"""
        escrow = cls.objects.create(
            client=client,
            professional=professional,
            project_type='simple',
            project_title=title,
            project_description=description,
            total_amount=amount
        )
        
        # Create single milestone for payment
        escrow.milestones.create(
            title="Service Payment",
            description=description,
            amount=amount
        )
        return escrow
    
    @classmethod
    def create_installment_service(cls, client, professional, title, description, total_amount, quote=None):
        """Create an installment service escrow (2 payments: 50%/50%)"""
        escrow = cls.objects.create(
            client=client,
            professional=professional,
            project_type='installment',
            project_title=title,
            project_description=description,
            total_amount=total_amount,
            service_quote=quote
        )
        
        # Create two milestones
        first_amount = total_amount * Decimal('0.5')  # 50%
        second_amount = total_amount - first_amount   # 50%
        
        escrow.milestones.create(
            title="First Payment (50%)",
            description="Initial payment to start work",
            amount=first_amount
        )
        
        escrow.milestones.create(
            title="Final Payment (50%)",
            description="Final payment after work completion",
            amount=second_amount
        )
        return escrow
    
    @classmethod
    def create_custom_installments(cls, client, professional, title, description, milestone_data):
        """Create custom installment escrow with multiple milestones
        milestone_data = [
            {'title': 'Phase 1', 'description': '...', 'amount': 1000},
            {'title': 'Phase 2', 'description': '...', 'amount': 1500},
        ]"""
        total_amount = sum(m['amount'] for m in milestone_data)
        
        escrow = cls.objects.create(
            client=client,
            professional=professional,
            project_type='complex',
            project_title=title,
            project_description=description,
            total_amount=total_amount
        )
        
        # Create milestones
        for milestone in milestone_data:
            escrow.milestones.create(
                title=milestone['title'],
                description=milestone['description'],
                amount=milestone['amount']
            )
        return escrow
    
    def get_next_pending_milestone(self):
        """Get the next milestone pending payment"""
        return self.milestones.filter(status='pending').first()
    
    def get_progress_percentage(self):
        """Calculate project completion percentage"""
        total_milestones = self.milestones.count()
        completed_milestones = self.milestones.filter(status__in=['completed', 'approved', 'released']).count()
        
        if total_milestones == 0:
            return 0
        return (completed_milestones / total_milestones) * 100
    
    def save(self, *args, **kwargs):
        if not self.platform_fee:
            self.platform_fee = self.calculate_platform_fee()
        self.net_amount = self.total_amount - self.platform_fee
        super().save(*args, **kwargs)


class EscrowMilestone(TimeStampedModel):
    """
    Milestones within an escrow account for project phases
    Enhanced to support installment payments with 14-day hold system
    """
    escrow = models.ForeignKey(EscrowAccount, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Payment Details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(
        max_digits=10, decimal_places=2, 
        default=0,
        help_text='Platform commission (5%)'
    )
    net_amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0,
        help_text='Amount after platform fee'
    )
    
    # Status and Timeline
    MILESTONE_STATUS = [
        ('pending', 'Pending Payment'),
        ('paid', 'Payment Received'),
        ('held', 'On Hold (14 days)'),
        ('completed', 'Work Completed'),
        ('approved', 'Approved by Client'),
        ('released', 'Released to Professional'),
        ('refunded', 'Refunded to Client'),
        ('disputed', 'Disputed'),
    ]
    status = models.CharField(max_length=20, choices=MILESTONE_STATUS, default='pending')
    
    # Timeline fields
    due_date = models.DateField(blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    hold_until = models.DateTimeField(
        blank=True, null=True,
        help_text='Date when payment will be automatically released (14 days after payment)'
    )
    completed_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    released_at = models.DateTimeField(blank=True, null=True)
    
    # Stripe Integration
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    stripe_transfer_id = models.CharField(max_length=255, blank=True)
    
    # Additional Info
    notes = models.TextField(blank=True, help_text='Internal notes')
    
    class Meta:
        ordering = ['created_at']
    
    def calculate_platform_fee(self):
        """حساب عمولة المنصة 5%"""
        return self.amount * Decimal('0.05')
    
    def calculate_hold_until(self):
        """حساب تاريخ انتهاء الحجز (14 يوم من تاريخ الدفع)"""
        if self.paid_at:
            return self.paid_at + timedelta(days=14)
        return None
    
    def mark_as_paid(self):
        """تحديد الدفعة كمدفوعة وبدء فترة الحجز"""
        self.status = 'held'
        self.paid_at = timezone.now()
        self.hold_until = self.calculate_hold_until()
        self.save()
        
        # جدولة الإفراج التلقائي بعد 14 يوم
        from .tasks import auto_release_payment
        auto_release_payment.apply_async(
            args=[self.id],
            eta=self.hold_until
        )
    
    def mark_as_completed(self):
        """تحديد العمل كمكتمل"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
    
    def approve_work(self):
        """موافقة العميل على العمل"""
        self.status = 'approved'
        self.approved_at = timezone.now()
        self.save()
        
        # إذا كان في فترة الحجز، الإفراج فوري
        if self.status == 'held' or timezone.now() >= self.hold_until:
            self.release_payment()
    
    def release_payment(self):
        """إفراج عن الدفعة للمحترف"""
        self.status = 'released'
        self.released_at = timezone.now()
        self.save()
        
        # TODO: تنفيذ تحويل الأموال عبر Stripe
        # Transfer money to professional via Stripe
    
    def refund_payment(self, reason=""):
        """إرجاع الدفعة للعميل"""
        self.status = 'refunded'
        self.notes = f"Refunded: {reason}"
        self.save()
        
        # TODO: تنفيذ الاسترداد عبر Stripe
        # Process refund via Stripe
    
    def save(self, *args, **kwargs):
        # Calculate platform fee automatically
        if not self.platform_fee:
            self.platform_fee = self.calculate_platform_fee()
        self.net_amount = self.amount - self.platform_fee
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.escrow.project_title} - {self.title} (${self.amount})"
    
    @property
    def days_until_release(self):
        """عدد الأيام المتبقية لإفراج الدفعة"""
        if self.hold_until and self.status == 'held':
            remaining = self.hold_until - timezone.now()
            return max(0, remaining.days)
        return 0
    
    @property
    def is_ready_for_release(self):
        """هل الدفعة جاهزة للإفراج؟"""
        return (
            self.status == 'held' and 
            self.hold_until and 
            timezone.now() >= self.hold_until
        )


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


# PaymentInstallment model replaced by EscrowMilestone system for better flexibility


class SubscriptionPlan(models.Model):
    """Subscription plans for different user types"""
    PLAN_TYPES = [
        ('home_pro', 'Home Pro'),
        ('crew', 'Crew Member'), 
        ('specialist', 'Specialist'),
    ]
    
    PLAN_TIERS = [
        ('basic', 'Basic'),
        ('premium', 'Premium'),
    ]
    
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    tier = models.CharField(max_length=20, choices=PLAN_TIERS, default='basic')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_price_id = models.CharField(max_length=100, unique=True)
    stripe_product_id = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    features = models.JSONField(default=list)  # List of features
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['plan_type', 'tier']
    
    def __str__(self):
        return f"{self.get_plan_type_display()} - {self.get_tier_display()} (${self.price}/month)"


class UserSubscription(models.Model):
    """User's subscription status"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('cancelled', 'Cancelled'),
        ('past_due', 'Past Due'),
        ('trialing', 'Trialing'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    stripe_subscription_id = models.CharField(max_length=100, unique=True)
    stripe_customer_id = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.status})"
    
    @property
    def is_active(self):
        return self.status in ['active', 'trialing']
    
    @property
    def has_premium_access(self):
        return self.is_active and self.plan.tier == 'premium'


class SubscriptionInvoice(models.Model):
    """Track subscription invoices from Stripe"""
    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE, related_name='invoices')
    stripe_invoice_id = models.CharField(max_length=100, unique=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20)
    invoice_pdf = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Invoice {self.stripe_invoice_id} - ${self.amount_paid}"


class ProjectCommission(models.Model):
    """Track project commissions/fees"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    appointment = models.ForeignKey('scheduling.Appointment', on_delete=models.CASCADE, null=True, blank=True)
    project_value = models.DecimalField(max_digits=10, decimal_places=2)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))  # Percentage
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.commission_amount:
            self.commission_amount = (self.project_value * self.commission_rate / 100)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Commission for {self.user.email} - ${self.commission_amount}"
