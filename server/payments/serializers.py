from rest_framework import serializers
from .models import Payment, StripeAccount, EscrowAccount, EscrowMilestone, EscrowTransaction, EscrowWorkOrder
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


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for payments
    """
    client = UserSerializer(read_only=True)
    contractor = AListHomeProProfileSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = (
            'id', 'client', 'contractor', 'amount', 'description',
            'status', 'stripe_payment_intent_id', 'stripe_transfer_id',
            'completed_at', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'client', 'contractor', 'stripe_payment_intent_id',
            'stripe_transfer_id', 'completed_at', 'created_at', 'updated_at'
        )


class PaymentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating payments
    """
    contractor_id = serializers.IntegerField(write_only=True)
    client_secret = serializers.CharField(read_only=True)
    
    class Meta:
        model = Payment
        fields = ('contractor_id', 'amount', 'description', 'client_secret')
    
    def validate_amount(self, value):
        """
        Validate the payment amount
        """
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value


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
