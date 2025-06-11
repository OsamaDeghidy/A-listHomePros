from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.urls import reverse
import stripe
import json
import logging
from django.utils import timezone

# Import both models to support backward compatibility during transition
from alistpros_profiles.models import AListHomeProProfile

from .models import (
    Payment, AListHomeProStripeAccount, 
    EscrowAccount, EscrowWorkOrder, EscrowTransaction, EscrowStatus
)
from .serializers import (
    PaymentSerializer, PaymentCreateSerializer, StripeAccountSerializer, 
    EscrowAccountCreateSerializer, EscrowAccountSerializer, 
    EscrowWorkOrderSerializer, CrewJobInvitationSerializer
)
from .utils import (
    create_stripe_account,
    generate_account_link,
    handle_account_updated_webhook,
    create_payment_intent,
    get_stripe_dashboard_link,
    create_payment_session
)
from users.permissions import IsAListHomePro, IsClient, IsAdmin, IsSpecialist, IsCrew
from users.models import CustomUser as User

logger = logging.getLogger(__name__)

# Configure Stripe with the API key
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeOnboardingView(APIView):
    """
    Initiate Stripe Connect onboarding for A-List Home Pros
    """
    permission_classes = [IsAListHomePro]
    
    def post(self, request):
        user = request.user
        
        try:
            # Create or get Stripe account
            stripe_account = create_stripe_account(user)
            
            # Generate account link for onboarding
            base_url = settings.SITE_URL
            refresh_url = f"{base_url}/dashboard/stripe-refresh"
            return_url = f"{base_url}/dashboard/stripe-return"
            
            account_link_url = generate_account_link(
                stripe_account,
                refresh_url,
                return_url
            )
            
            return Response({
                'account_link': account_link_url,
                'stripe_account_id': stripe_account.stripe_account_id,
                'onboarding_started': True
            })
        except Exception as e:
            logger.error(f"Error in StripeOnboardingView: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class StripeAccountStatusView(APIView):
    """
    Check the status of a Stripe Connect account
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        try:
            # Get Stripe account
            try:
                stripe_account = AListHomeProStripeAccount.objects.get(user=user)
            except AListHomeProStripeAccount.DoesNotExist:
                return Response({
                    'has_account': False
                })
            
            # Get account information directly from the database
            serializer = StripeAccountSerializer(stripe_account)
            
            # Add additional information
            response_data = serializer.data
            response_data['has_account'] = True
            response_data['onboarding_complete'] = stripe_account.onboarding_complete
            
            # If onboarding is not complete, provide a new link
            if not stripe_account.onboarding_complete:
                base_url = settings.SITE_URL
                refresh_url = f"{base_url}/dashboard/stripe-refresh"
                return_url = f"{base_url}/dashboard/stripe-return"
                
                try:
                    account_link_url = generate_account_link(
                        stripe_account,
                        refresh_url,
                        return_url
                    )
                    response_data['account_link'] = account_link_url
                except Exception as link_error:
                    logger.error(f"Error generating account link: {str(link_error)}")
                    response_data['account_link_error'] = str(link_error)
            
            return Response(response_data)
        except Exception as e:
            logger.error(f"Error in StripeAccountStatusView: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class PaymentSessionCreateView(APIView):
    """
    Create a payment session for booking appointments
    """
    permission_classes = [IsClient]
    
    def post(self, request):
        # Validate required fields
        required_fields = ['alistpro_id', 'amount', 'appointment_id', 'success_url', 'cancel_url']
        for field in required_fields:
            if field not in request.data:
                return Response({
                    'error': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        pro_id = request.data.get('alistpro_id')
        amount = float(request.data.get('amount'))
        appointment_id = request.data.get('appointment_id')
        success_url = request.data.get('success_url')
        cancel_url = request.data.get('cancel_url')
        
        try:
            # Get A-List Home Pro profile
            pro_profile = get_object_or_404(AListHomeProProfile, id=pro_id)
            
            # Create payment session
            session = create_payment_session(
                request.user,
                pro_profile,
                amount,
                appointment_id,
                success_url,
                cancel_url
            )
            
            # Create payment record
            payment_data = {
                'client': request.user,
                'alistpro': pro_profile,
                'amount': amount,
                'description': f'Booking payment for appointment #{appointment_id}',
                'status': 'pending'
            }
            
            payment = Payment.objects.create(**payment_data)
            
            return Response({
                'payment_id': payment.id,
                'session_id': session.id,
                'checkout_url': session.url
            })
        except Exception as e:
            logger.error(f"Error in PaymentSessionCreateView: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class PaymentCreateView(APIView):
    """
    Create a payment from a client to an A-List Home Pro
    """
    permission_classes = [IsClient]
    
    def post(self, request):
        serializer = PaymentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        pro_id = serializer.validated_data.get('alistpro_id') or serializer.validated_data.get('contractor_id')
        amount = serializer.validated_data['amount']
        description = serializer.validated_data['description']
        
        try:
            # Get A-List Home Pro profile
            if USE_NEW_MODEL:
                pro_profile = get_object_or_404(AListHomeProProfile, id=pro_id)
            else:
                pro_profile = get_object_or_404(ContractorProfile, id=pro_id)
            
            # Create payment intent
            payment_intent = create_payment_intent(
                request.user,
                pro_profile,
                amount,
                description
            )
            
            # Create payment record
            payment_data = {
                'client': request.user,
                'amount': amount,
                'description': description,
                'stripe_payment_intent_id': payment_intent.id
            }
            
            if USE_NEW_MODEL:
                payment_data['alistpro'] = pro_profile
            else:
                payment_data['contractor'] = pro_profile
                
            payment = Payment.objects.create(**payment_data)
            
            return Response({
                'payment_id': payment.id,
                'client_secret': payment_intent.client_secret
            })
        except Exception as e:
            logger.error(f"Error in PaymentCreateView: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class PaymentListView(generics.ListAPIView):
    """
    List payments for the authenticated user
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # For clients, show payments they've made
        if user.role == 'client':
            return Payment.objects.filter(client=user).order_by('-created_at')
        
        # For A-List Home Pros, show payments they've received
        elif user.role == 'alistpro' and hasattr(user, 'alistpro_profile'):
            return Payment.objects.filter(alistpro=user.alistpro_profile).order_by('-created_at')
        
        # For admins, show all payments
        elif user.is_admin:
            return Payment.objects.all().order_by('-created_at')
        
        return Payment.objects.none()


class PaymentDetailView(generics.RetrieveAPIView):
    """
    Retrieve a payment
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # للحماية من أخطاء Swagger
        if getattr(self, 'swagger_fake_view', False):
            return Payment.objects.none()
            
        user = self.request.user
        
        # For clients, show payments they've made
        if hasattr(user, 'role') and user.role == 'client':
            return Payment.objects.filter(client=user)
        
        # For A-List Home Pros, show payments they've received
        elif hasattr(user, 'role') and user.role == 'alistpro' and hasattr(user, 'alistpro_profile'):
            return Payment.objects.filter(alistpro=user.alistpro_profile)
        
        # For admins, show all payments
        elif hasattr(user, 'is_admin') and user.is_admin:
            return Payment.objects.all()
        
        return Payment.objects.none()


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    """
    Handle Stripe webhook events
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        logger.error(f"Invalid Stripe webhook payload: {str(e)}")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        logger.error(f"Invalid Stripe webhook signature: {str(e)}")
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    # Log the event type
    event_type = event['type']
    logger.info(f"Received Stripe webhook: {event_type}")
    
    # Handle the event
    try:
        if event_type == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            payment_id = payment_intent.get('id')
            
            # Find the payment record
            try:
                payment = Payment.objects.get(stripe_payment_intent_id=payment_id)
                payment.status = 'completed'
                payment.completed_at = timezone.now()
                payment.save()
                logger.info(f"Payment {payment_id} marked as completed")
            except Payment.DoesNotExist:
                logger.warning(f"Payment record not found for payment_intent {payment_id}")
                
        elif event_type == 'account.updated':
            handle_account_updated_webhook(event)
            
    except Exception as e:
        logger.error(f"Error processing Stripe webhook {event_type}: {str(e)}")
        # Still return 200 to acknowledge receipt
    
    # Return a response to acknowledge receipt of the event
    return Response({'status': 'success'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stripe_dashboard_link(request):
    """
    Generate a link to the Stripe Express dashboard for an A-List Home Pro
    """
    user = request.user
    
    try:
        # Get Stripe account
        try:
            stripe_account = AListHomeProStripeAccount.objects.get(user=user)
        except AListHomeProStripeAccount.DoesNotExist:
            return Response({
                'error': 'No Stripe account found',
                'message': 'You need to set up a Stripe account first'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Generate dashboard link using utility function
        try:
            dashboard_url = get_stripe_dashboard_link(stripe_account.stripe_account_id)
            
            return Response({
                'url': dashboard_url
            })
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error generating dashboard link: {str(e)}")
            return Response({
                'error': 'Stripe API error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error generating Stripe dashboard link: {str(e)}")
        return Response({
            'error': 'Server error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EscrowAccountCreateView(APIView):
    """
    Create a new escrow account for secure project payments
    """
    permission_classes = [IsClient]
    
    def post(self, request):
        serializer = EscrowAccountCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create escrow account
        escrow_data = serializer.validated_data
        specialist_id = escrow_data.pop('specialist_id', None)
        
        escrow = EscrowAccount.objects.create(
            client=request.user,
            specialist_id=specialist_id,
            **escrow_data
        )
        
        return Response({
            'escrow_id': escrow.id,
            'platform_fee': str(escrow.platform_fee),
            'net_amount': str(escrow.net_amount),
            'status': escrow.status
        }, status=status.HTTP_201_CREATED)


class EscrowAccountListView(generics.ListAPIView):
    """
    List escrow accounts for the authenticated user
    """
    serializer_class = EscrowAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'client':
            return EscrowAccount.objects.filter(client=user).order_by('-created_at')
        elif user.role == 'specialist':
            return EscrowAccount.objects.filter(specialist=user).order_by('-created_at')
        elif user.role in ['contractor', 'crew']:
            # Show escrows where they have work orders
            return EscrowAccount.objects.filter(
                work_orders__assigned_to=user
            ).distinct().order_by('-created_at')
        
        return EscrowAccount.objects.none()


class EscrowAccountDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update escrow account details
    """
    serializer_class = EscrowAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return EscrowAccount.objects.none()
        
        if user.role == 'client':
            return EscrowAccount.objects.filter(client=user)
        elif user.role == 'specialist':
            return EscrowAccount.objects.filter(specialist=user)
        elif user.role in ['contractor', 'crew']:
            return EscrowAccount.objects.filter(work_orders__assigned_to=user).distinct()
        
        return EscrowAccount.objects.none()


class EscrowFundView(APIView):
    """
    Fund an escrow account using Stripe payment
    """
    permission_classes = [IsClient]
    
    def post(self, request, escrow_id):
        try:
            escrow = EscrowAccount.objects.get(id=escrow_id, client=request.user)
        except EscrowAccount.DoesNotExist:
            return Response({'error': 'Escrow account not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if escrow.status != EscrowStatus.PENDING:
            return Response({'error': 'Escrow account is not in pending status'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create Stripe payment intent for escrow funding
            payment_intent = stripe.PaymentIntent.create(
                amount=int(escrow.total_amount * 100),  # Convert to cents
                currency="usd",
                description=f"Escrow funding for: {escrow.project_title}",
                metadata={
                    "escrow_id": str(escrow.id),
                    "client_id": str(request.user.id),
                }
            )
            
            # Update escrow with payment intent
            escrow.stripe_payment_intent_id = payment_intent.id
            escrow.save()
            
            # Create transaction record
            EscrowTransaction.objects.create(
                escrow=escrow,
                transaction_type='deposit',
                amount=escrow.total_amount,
                description=f"Client deposit for {escrow.project_title}",
                stripe_transaction_id=payment_intent.id
            )
            
            return Response({
                'client_secret': payment_intent.client_secret,
                'escrow_id': escrow.id
            })
            
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class EscrowConfirmFundingView(APIView):
    """
    Confirm escrow funding after successful Stripe payment
    """
    permission_classes = [IsClient]
    
    def post(self, request, escrow_id):
        try:
            escrow = EscrowAccount.objects.get(id=escrow_id, client=request.user)
        except EscrowAccount.DoesNotExist:
            return Response({'error': 'Escrow account not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Verify payment with Stripe
        if escrow.stripe_payment_intent_id:
            try:
                payment_intent = stripe.PaymentIntent.retrieve(escrow.stripe_payment_intent_id)
                if payment_intent.status == 'succeeded':
                    escrow.status = EscrowStatus.FUNDED
                    escrow.funded_at = timezone.now()
                    escrow.save()
                    
                    return Response({'status': 'funded'})
                else:
                    return Response({'error': 'Payment not yet completed'}, 
                                  status=status.HTTP_400_BAD_REQUEST)
            except stripe.error.StripeError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'No payment intent found'}, 
                      status=status.HTTP_400_BAD_REQUEST)


class EscrowWorkOrderCreateView(APIView):
    """
    Create work orders within an escrow project (Specialist only)
    """
    permission_classes = [IsSpecialist]
    
    def post(self, request, escrow_id):
        try:
            escrow = EscrowAccount.objects.get(id=escrow_id, specialist=request.user)
        except EscrowAccount.DoesNotExist:
            return Response({'error': 'Escrow account not found or not managed by you'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if escrow.status != EscrowStatus.FUNDED:
            return Response({'error': 'Escrow must be funded before creating work orders'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        serializer = EscrowWorkOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate assigned_to user
        assigned_to_id = request.data.get('assigned_to_id')
        try:
            assigned_user = User.objects.get(id=assigned_to_id)
            if assigned_user.role not in ['contractor', 'crew']:
                return Response({'error': 'Can only assign to contractors or crew'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Invalid assigned user'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create work order
        work_order = EscrowWorkOrder.objects.create(
            escrow=escrow,
            assigned_to=assigned_user,
            work_type=assigned_user.role,
            **serializer.validated_data
        )
        
        return Response(EscrowWorkOrderSerializer(work_order).data, 
                       status=status.HTTP_201_CREATED)


class CrewJobInvitationsView(generics.ListAPIView):
    """
    List available job invitations for crew members (Uber-style)
    """
    serializer_class = CrewJobInvitationSerializer
    permission_classes = [IsCrew]
    
    def get_queryset(self):
        return EscrowWorkOrder.objects.filter(
            assigned_to=self.request.user,
            status='pending'
        ).select_related('escrow', 'escrow__client', 'escrow__specialist').order_by('-assigned_at')


class CrewJobResponseView(APIView):
    """
    Accept or reject job invitations (Crew only)
    """
    permission_classes = [IsCrew]
    
    def post(self, request, work_order_id):
        try:
            work_order = EscrowWorkOrder.objects.get(
                id=work_order_id, 
                assigned_to=request.user,
                status='pending'
            )
        except EscrowWorkOrder.DoesNotExist:
            return Response({'error': 'Work order not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        action = request.data.get('action')  # 'accept' or 'reject'
        
        if action == 'accept':
            work_order.status = 'accepted'
            work_order.accepted_at = timezone.now()
            work_order.save()
            
            # Update escrow status if this is the first accepted work order
            if work_order.escrow.status == EscrowStatus.FUNDED:
                work_order.escrow.status = EscrowStatus.IN_PROGRESS
                work_order.escrow.work_started_at = timezone.now()
                work_order.escrow.save()
            
            return Response({'status': 'accepted'})
            
        elif action == 'reject':
            work_order.status = 'rejected'
            work_order.save()
            return Response({'status': 'rejected'})
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


class EscrowApprovalView(APIView):
    """
    Client approval/dispute of completed work
    """
    permission_classes = [IsClient]
    
    def post(self, request, escrow_id):
        try:
            escrow = EscrowAccount.objects.get(id=escrow_id, client=request.user)
        except EscrowAccount.DoesNotExist:
            return Response({'error': 'Escrow account not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        action = request.data.get('action')  # 'approve' or 'dispute'
        
        if action == 'approve':
            escrow.status = EscrowStatus.RELEASED
            escrow.approved_at = timezone.now()
            escrow.released_at = timezone.now()
            escrow.save()
            
            # Process payment release to service providers
            # This would integrate with Stripe transfers
            
            return Response({'status': 'approved_and_released'})
            
        elif action == 'dispute':
            dispute_reason = request.data.get('dispute_reason', '')
            escrow.status = EscrowStatus.DISPUTED
            escrow.dispute_reason = dispute_reason
            escrow.disputed_at = timezone.now()
            escrow.save()
            
            return Response({'status': 'disputed'})
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


class SpecialistEscrowManagementView(generics.ListAPIView):
    """
    Specialist view for managing escrow projects and coordinating work
    """
    serializer_class = EscrowAccountSerializer
    permission_classes = [IsSpecialist]
    
    def get_queryset(self):
        return EscrowAccount.objects.filter(
            specialist=self.request.user
        ).prefetch_related('work_orders', 'milestones').order_by('-created_at')
