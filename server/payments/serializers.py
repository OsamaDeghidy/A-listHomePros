from rest_framework import serializers
from .models import StripeAccount, EscrowAccount, EscrowMilestone, EscrowTransaction, EscrowWorkOrder, SubscriptionPlan, UserSubscription, SubscriptionInvoice, ProjectCommission
from users.serializers import UserSerializer
from users.models import CustomUser as User
from alistpros_profiles.serializers import AListHomeProProfileSerializer


class StripeAccountSerializer(serializers.ModelSerializer):
    """
    Serializer for Stripe Connect accounts
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StripeAccount
        fields = (
            'id', 'user', 'stripe_account_id', 'is_details_submitted',
            'is_charges_enabled', 'is_payouts_enabled', 'onboarding_url',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'user', 'stripe_account_id', 'is_details_submitted',
            'is_charges_enabled', 'is_payouts_enabled', 'onboarding_url',
            'created_at', 'updated_at'
        )


# Payment serializers removed - replaced by EscrowAccount system


class EscrowAccountSerializer(serializers.ModelSerializer):
    """
    Serializer for Escrow accounts
    """
    client = UserSerializer(read_only=True)
    specialist = UserSerializer(read_only=True)
    platform_fee = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    net_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = EscrowAccount
        fields = (
            'id', 'client', 'specialist', 'project_title', 'project_description',
            'total_amount', 'platform_fee', 'net_amount', 'status',
            'funded_at', 'work_started_at', 'completed_at', 'approved_at', 'released_at',
            'dispute_reason', 'disputed_at', 'resolved_at', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'client', 'specialist', 'platform_fee', 'net_amount',
            'funded_at', 'work_started_at', 'completed_at', 'approved_at', 'released_at',
            'disputed_at', 'resolved_at', 'created_at', 'updated_at'
        )


class EscrowAccountCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Escrow accounts
    """
    specialist_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = EscrowAccount
        fields = ('project_title', 'project_description', 'total_amount', 'specialist_id')
    
    def validate_total_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Total amount must be greater than zero")
        return value
    
    def validate_specialist_id(self, value):
        if value:
            try:
                specialist = User.objects.get(id=value, role='specialist')
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid specialist ID")
        return value


class EscrowMilestoneSerializer(serializers.ModelSerializer):
    """
    Serializer for Escrow milestones
    """
    class Meta:
        model = EscrowMilestone
        fields = (
            'id', 'title', 'description', 'amount', 'due_date',
            'completed_at', 'approved_at', 'released_at', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'completed_at', 'approved_at', 'released_at', 'created_at', 'updated_at'
        )


class EscrowTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Escrow transactions
    """
    class Meta:
        model = EscrowTransaction
        fields = (
            'id', 'transaction_type', 'amount', 'description',
            'stripe_transaction_id', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class EscrowWorkOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Escrow work orders
    """
    assigned_to = UserSerializer(read_only=True)
    escrow = EscrowAccountSerializer(read_only=True)
    
    class Meta:
        model = EscrowWorkOrder
        fields = (
            'id', 'escrow', 'assigned_to', 'work_type', 'title', 'description',
            'assigned_amount', 'estimated_hours', 'status',
            'assigned_at', 'accepted_at', 'started_at', 'completed_at', 'approved_at'
        )
        read_only_fields = (
            'id', 'escrow', 'assigned_to', 'assigned_at', 'accepted_at',
            'started_at', 'completed_at', 'approved_at'
        )


class CrewJobInvitationSerializer(serializers.ModelSerializer):
    """
    Serializer for crew job invitations (from work orders)
    """
    escrow_project = EscrowAccountSerializer(source='escrow', read_only=True)
    client_name = serializers.CharField(source='escrow.client.name', read_only=True)
    specialist_name = serializers.CharField(source='escrow.specialist.name', read_only=True)
    is_escrow_funded = serializers.SerializerMethodField()
    
    class Meta:
        model = EscrowWorkOrder
        fields = (
            'id', 'title', 'description', 'assigned_amount', 'estimated_hours',
            'status', 'work_type', 'assigned_at', 'escrow_project',
            'client_name', 'specialist_name', 'is_escrow_funded'
        )
        read_only_fields = ('id', 'assigned_at')
    
    def get_is_escrow_funded(self, obj):
        return obj.escrow.status in ['funded', 'in_progress', 'pending_approval']


# PaymentInstallment serializers removed - replaced by EscrowMilestone system


class PaymentSummarySerializer(serializers.Serializer):
    """
    Serializer لملخص الدفعات
    Serializer for payment summary
    """
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_pending = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_held = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_released = serializers.DecimalField(max_digits=10, decimal_places=2)
    platform_fees_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    installments_count = serializers.IntegerField()
    
    first_payment_status = serializers.CharField()
    second_payment_status = serializers.CharField()
    
    next_release_date = serializers.DateTimeField(allow_null=True)
    days_until_next_release = serializers.IntegerField(allow_null=True)


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for subscription plans"""
    plan_type_display = serializers.CharField(source='get_plan_type_display', read_only=True)
    tier_display = serializers.CharField(source='get_tier_display', read_only=True)
    project_fee_rate = serializers.SerializerMethodField()
    feature_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'plan_type', 'plan_type_display', 'tier', 'tier_display',
            'price', 'description', 'features', 'feature_count', 'project_fee_rate',
            'is_active', 'stripe_price_id', 'stripe_product_id', 'created_at'
        ]
    
    def get_project_fee_rate(self, obj):
        """Get project fee rate from subscription plans config"""
        from .subscription_plans import SUBSCRIPTION_PLANS
        plan_key = f"{obj.plan_type}_{obj.tier}"
        plan_config = SUBSCRIPTION_PLANS.get(plan_key, {})
        return float(plan_config.get('project_fee_rate', 0))
    
    def get_feature_count(self, obj):
        """Get number of features in this plan"""
        return len(obj.features) if obj.features else 0


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for user subscriptions"""
    plan = SubscriptionPlanSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    has_premium_access = serializers.BooleanField(read_only=True)
    days_remaining = serializers.SerializerMethodField()
    project_fee_rate = serializers.SerializerMethodField()
    user_features = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSubscription
        fields = [
            'id', 'plan', 'status', 'status_display', 'is_active', 'has_premium_access',
            'current_period_start', 'current_period_end', 'days_remaining', 
            'project_fee_rate', 'user_features', 'created_at'
        ]
    
    def get_days_remaining(self, obj):
        if obj.current_period_end:
            from django.utils import timezone
            remaining = obj.current_period_end - timezone.now()
            return max(0, remaining.days)
        return 0
    
    def get_project_fee_rate(self, obj):
        """Get project fee rate for this subscription"""
        from .subscription_plans import SUBSCRIPTION_PLANS
        plan_key = f"{obj.plan.plan_type}_{obj.plan.tier}"
        plan_config = SUBSCRIPTION_PLANS.get(plan_key, {})
        return float(plan_config.get('project_fee_rate', 0))
    
    def get_user_features(self, obj):
        """Get all features available to this user"""
        from .feature_access import FeatureAccessService
        return FeatureAccessService.get_user_features(obj.user)


class FeatureAccessSerializer(serializers.Serializer):
    """Serializer for checking feature access"""
    feature_key = serializers.CharField()
    has_access = serializers.BooleanField(read_only=True)
    plan_required = serializers.CharField(read_only=True, required=False)
    upgrade_suggestions = serializers.ListField(read_only=True, required=False)


class UserPlanInfoSerializer(serializers.Serializer):
    """Serializer for user plan information"""
    has_subscription = serializers.BooleanField()
    is_active = serializers.BooleanField()
    plan_name = serializers.CharField(allow_null=True)
    plan_type = serializers.CharField(allow_null=True)
    tier = serializers.CharField(allow_null=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    features = serializers.ListField(child=serializers.CharField())
    project_fee_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    current_period_end = serializers.DateTimeField(allow_null=True)
    days_remaining = serializers.IntegerField(required=False)


class SubscriptionInvoiceSerializer(serializers.ModelSerializer):
    """Serializer for subscription invoices"""
    
    class Meta:
        model = SubscriptionInvoice
        fields = [
            'id', 'stripe_invoice_id', 'amount_paid', 'currency', 'status',
            'invoice_pdf', 'created_at', 'paid_at'
        ]


class ProjectCommissionSerializer(serializers.ModelSerializer):
    """Serializer for project commissions"""
    
    class Meta:
        model = ProjectCommission
        fields = [
            'id', 'project_value', 'commission_rate', 'commission_amount',
            'status', 'created_at', 'paid_at'
        ]


class CreateSubscriptionSerializer(serializers.Serializer):
    """Serializer for creating Stripe subscriptions"""
    plan_id = serializers.IntegerField()
    success_url = serializers.URLField()
    cancel_url = serializers.URLField()
    
    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
            return value
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive subscription plan")


class ChangeSubscriptionSerializer(serializers.Serializer):
    """Serializer for changing subscription plans"""
    new_plan_id = serializers.IntegerField()
    
    def validate_new_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
            return value
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive subscription plan")
