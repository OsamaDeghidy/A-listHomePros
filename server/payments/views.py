from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.urls import reverse
import stripe
import json
import logging
from django.utils import timezone
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Import both models to support backward compatibility during transition
from alistpros_profiles.models import AListHomeProProfile

from .models import (
    AListHomeProStripeAccount, 
    EscrowAccount, EscrowWorkOrder, EscrowTransaction, EscrowStatus, EscrowMilestone,
    SubscriptionPlan, UserSubscription, SubscriptionInvoice
)
from .serializers import (
    StripeAccountSerializer, 
    EscrowAccountCreateSerializer, EscrowAccountSerializer, 
    EscrowWorkOrderSerializer, CrewJobInvitationSerializer,
    SubscriptionPlanSerializer, UserSubscriptionSerializer, CreateSubscriptionSerializer, ChangeSubscriptionSerializer
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
from .feature_access import FeatureAccessService, get_user_plan_info, requires_feature
from .subscription_plans import SUBSCRIPTION_PLANS
from .swagger_schemas import (
    subscription_plan_list_swagger,
    current_subscription_swagger,
    check_feature_swagger,
    multiple_features_swagger,
    plan_comparison_swagger,
    create_checkout_session_swagger,
    user_subscription_response_schema,
    feature_check_response_schema,
    multiple_features_response_schema,
    plan_comparison_response_schema,
    error_response_schema,
    subscription_plan_response_schema
)

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


# PaymentSessionCreateView removed - replaced by EscrowAccount system


# PaymentCreateView removed - replaced by EscrowAccount system


# PaymentListView removed - replaced by EscrowAccount system


# PaymentDetailView removed - replaced by EscrowAccount system


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


# ========== NEW MILESTONE PAYMENT VIEWS ==========

@api_view(['POST'])
@permission_classes([IsClient])
def pay_milestone(request, milestone_id):
    """
    دفع milestone محدد باستخدام Stripe
    Pay specific milestone using Stripe
    """
    try:
        # الحصول على المعلم
        try:
            milestone = EscrowMilestone.objects.get(id=milestone_id)
        except EscrowMilestone.DoesNotExist:
            return Response({
                'error': 'Milestone not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # التحقق من الصلاحيات
        if request.user != milestone.escrow.client:
            return Response({
                'error': 'Only the client can pay this milestone'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # التحقق من حالة المعلم
        if milestone.status != 'pending':
            return Response({
                'error': f'Milestone is {milestone.status}, cannot be paid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # إنشاء Stripe payment intent للمعلم
            import stripe
            payment_intent = stripe.PaymentIntent.create(
                amount=int(milestone.amount * 100),  # تحويل للسنت
                currency="usd",
                description=f"Payment for: {milestone.title} - {milestone.escrow.project_title}",
                metadata={
                    "milestone_id": str(milestone.id),
                    "escrow_id": str(milestone.escrow.id),
                    "client_id": str(request.user.id),
                }
            )
            
            # تحديث المعلم بـ payment intent
            milestone.stripe_payment_intent_id = payment_intent.id
            milestone.save()
            
            # إنشاء سجل معاملة
            EscrowTransaction.objects.create(
                escrow=milestone.escrow,
                transaction_type='deposit',
                amount=milestone.amount,
                description=f"Client payment for milestone: {milestone.title}",
                stripe_transaction_id=payment_intent.id
            )
            
            return Response({
                'client_secret': payment_intent.client_secret,
                'milestone_id': milestone.id,
                'amount': str(milestone.amount),
                'platform_fee': str(milestone.platform_fee),
                'net_amount': str(milestone.net_amount)
            })
            
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Failed to process payment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsClient])
def confirm_milestone_payment(request, milestone_id):
    """
    تأكيد دفع المعلم بعد نجاح Stripe payment
    Confirm milestone payment after successful Stripe payment
    """
    try:
        # الحصول على المعلم
        try:
            milestone = EscrowMilestone.objects.get(id=milestone_id)
        except EscrowMilestone.DoesNotExist:
            return Response({
                'error': 'Milestone not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # التحقق من الصلاحيات
        if request.user != milestone.escrow.client:
            return Response({
                'error': 'Only the client can confirm this payment'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # التحقق من الدفع مع Stripe
        if milestone.stripe_payment_intent_id:
            try:
                import stripe
                payment_intent = stripe.PaymentIntent.retrieve(milestone.stripe_payment_intent_id)
                if payment_intent.status == 'succeeded':
                    # تحديث حالة المعلم لمدفوع وبدء فترة الحجز
                    milestone.mark_as_paid()
                    
                    # إرسال رسالة في المحادثة
                    if hasattr(milestone.escrow, 'service_quote') and milestone.escrow.service_quote:
                        service_request = milestone.escrow.service_quote.service_request
                        if hasattr(service_request, 'conversation') and service_request.conversation:
                            from messaging.models import Message
                            Message.objects.create(
                                conversation=service_request.conversation,
                                sender=request.user,
                                content=f"💰 تم دفع: {milestone.title}\n\nالمبلغ: ${milestone.amount}\nسيتم الإفراج عن الأموال تلقائياً بعد 14 يوم إذا لم يكن هناك مشاكل.",
                                message_type='payment'
                            )
                    
                    # إرسال إشعار للمحترف
                    from notifications.models import Notification
                    Notification.objects.create(
                        user=milestone.escrow.professional.user,
                        title="Payment Received",
                        message=f"Payment received for: {milestone.title} (${milestone.amount})",
                        notification_type='payment'
                    )
                    
                    return Response({
                        'status': 'paid',
                        'hold_until': milestone.hold_until,
                        'days_until_release': milestone.days_until_release
                    })
                else:
                    return Response({
                        'error': 'Payment not yet completed'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except stripe.error.StripeError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'No payment intent found'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': f'Failed to confirm payment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_milestone_completed(request, milestone_id):
    """
    تحديد milestone كمكتمل (المحترف فقط)
    Mark milestone as completed (Professional only)
    """
    try:
        # الحصول على المعلم
        try:
            milestone = EscrowMilestone.objects.get(id=milestone_id)
        except EscrowMilestone.DoesNotExist:
            return Response({
                'error': 'Milestone not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # التحقق من الصلاحيات
        if request.user != milestone.escrow.professional.user:
            return Response({
                'error': 'Only the professional can mark milestone as completed'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # التحقق من حالة المعلم
        if milestone.status not in ['paid', 'held']:
            return Response({
                'error': f'Milestone must be paid first (current status: {milestone.status})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # تحديد المعلم كمكتمل
        milestone.mark_as_completed()
        
        # إرسال رسالة في المحادثة
        if hasattr(milestone.escrow, 'service_quote') and milestone.escrow.service_quote:
            service_request = milestone.escrow.service_quote.service_request
            if hasattr(service_request, 'conversation') and service_request.conversation:
                from messaging.models import Message
                Message.objects.create(
                    conversation=service_request.conversation,
                    sender=request.user,
                    content=f"✅ تم إنجاز: {milestone.title}\n\nيرجى مراجعة العمل والموافقة عليه.\nأو انتظر 14 يوم للموافقة التلقائية.",
                    message_type='completion'
                )
        
        # إرسال إشعار للعميل
        from notifications.models import Notification
        Notification.objects.create(
            user=milestone.escrow.client,
            title="Work Completed",
            message=f"Work completed for: {milestone.title}. Please review and approve.",
            notification_type='completion'
        )
        
        return Response({
            'status': 'completed',
            'message': 'Milestone marked as completed',
            'awaiting_approval': True
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to mark milestone as completed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsClient])
def approve_milestone(request, milestone_id):
    """
    موافقة العميل على milestone مكتمل
    Client approval of completed milestone
    """
    try:
        # الحصول على المعلم
        try:
            milestone = EscrowMilestone.objects.get(id=milestone_id)
        except EscrowMilestone.DoesNotExist:
            return Response({
                'error': 'Milestone not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # التحقق من الصلاحيات
        if request.user != milestone.escrow.client:
            return Response({
                'error': 'Only the client can approve this milestone'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # التحقق من حالة المعلم
        if milestone.status != 'completed':
            return Response({
                'error': f'Milestone must be completed first (current status: {milestone.status})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # موافقة وإفراج عن الدفعة
        milestone.approve_work()
        
        # إرسال رسالة في المحادثة
        if hasattr(milestone.escrow, 'service_quote') and milestone.escrow.service_quote:
            service_request = milestone.escrow.service_quote.service_request
            if hasattr(service_request, 'conversation') and service_request.conversation:
                from messaging.models import Message
                Message.objects.create(
                    conversation=service_request.conversation,
                    sender=request.user,
                    content=f"👍 تمت الموافقة على: {milestone.title}\n\nتم إفراج المبلغ: ${milestone.amount}",
                    message_type='approval'
                )
        
        # إرسال إشعار للمحترف
        from notifications.models import Notification
        Notification.objects.create(
            user=milestone.escrow.professional.user,
            title="Payment Released",
            message=f"Payment released for: {milestone.title} (${milestone.amount})",
            notification_type='payment_release'
        )
        
        return Response({
            'status': 'approved_and_released',
            'amount_released': str(milestone.amount),
            'message': 'Milestone approved and payment released'
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to approve milestone: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_escrow_milestones(request, escrow_id):
    """
    الحصول على جميع milestones لـ escrow معين
    Get all milestones for a specific escrow account
    """
    try:
        # الحصول على الـ escrow
        try:
            escrow = EscrowAccount.objects.get(id=escrow_id)
        except EscrowAccount.DoesNotExist:
            return Response({
                'error': 'Escrow account not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # التحقق من الصلاحيات
        if request.user not in [escrow.client, escrow.professional.user]:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # الحصول على المعالم
        milestones = escrow.milestones.all().order_by('created_at')
        
        milestones_data = []
        for milestone in milestones:
            milestone_data = {
                'id': milestone.id,
                'title': milestone.title,
                'description': milestone.description,
                'amount': str(milestone.amount),
                'platform_fee': str(milestone.platform_fee),
                'net_amount': str(milestone.net_amount),
                'status': milestone.status,
                'due_date': milestone.due_date,
                'paid_at': milestone.paid_at,
                'hold_until': milestone.hold_until,
                'completed_at': milestone.completed_at,
                'approved_at': milestone.approved_at,
                'released_at': milestone.released_at,
                'days_until_release': milestone.days_until_release,
                'is_ready_for_release': milestone.is_ready_for_release,
                'created_at': milestone.created_at,
                'updated_at': milestone.updated_at
            }
            milestones_data.append(milestone_data)
        
        return Response({
            'escrow_id': escrow.id,
            'project_title': escrow.project_title,
            'project_type': escrow.project_type,
            'total_amount': str(escrow.total_amount),
            'milestones': milestones_data,
            'progress_percentage': escrow.get_progress_percentage(),
            'next_pending_milestone': {
                'id': escrow.get_next_pending_milestone().id if escrow.get_next_pending_milestone() else None,
                'amount': str(escrow.get_next_pending_milestone().amount) if escrow.get_next_pending_milestone() else None
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get milestones: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== PAYMENT SUMMARY APIs ==========

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_payment_summary(request, quote_id):
    """
    الحصول على ملخص الدفعات لكوت معين
    Get payment summary for a specific quote
    """
    try:
        # الحصول على الكوت
        try:
            from alistpros_profiles.models import ServiceQuote
            quote = ServiceQuote.objects.get(id=quote_id)
        except ServiceQuote.DoesNotExist:
            return Response({
                'error': 'Quote not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # التحقق من الصلاحيات
        if request.user not in [quote.service_request.client, quote.professional]:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # البحث عن escrow مرتبط بهذا الكوت
        escrow = EscrowAccount.objects.filter(service_quote=quote).first()
        if not escrow:
            return Response({
                'error': 'No escrow account found for this quote',
                'has_escrow': False
            }, status=status.HTTP_404_NOT_FOUND)
        
        # حساب الملخص
        milestones = escrow.milestones.all()
        total_paid = sum(m.amount for m in milestones if m.status in ['paid', 'held', 'completed', 'approved', 'released'])
        total_pending = sum(m.amount for m in milestones if m.status == 'pending')
        total_held = sum(m.amount for m in milestones if m.status == 'held')
        total_released = sum(m.amount for m in milestones if m.status == 'released')
        platform_fees_total = sum(m.platform_fee for m in milestones)
        
        # حالة الدفعات
        first_milestone = milestones.first()
        second_milestone = milestones.last() if milestones.count() > 1 else None
        
        # تاريخ الإفراج التالي
        next_held_milestone = milestones.filter(status='held').order_by('hold_until').first()
        next_release_date = next_held_milestone.hold_until if next_held_milestone else None
        days_until_next_release = next_held_milestone.days_until_release if next_held_milestone else None
        
        return Response({
            'quote_id': quote.id,
            'escrow_id': escrow.id,
            'total_amount': str(escrow.total_amount),
            'total_paid': str(total_paid),
            'total_pending': str(total_pending),
            'total_held': str(total_held),
            'total_released': str(total_released),
            'platform_fees_total': str(platform_fees_total),
            'installments_count': milestones.count(),
            'first_payment_status': first_milestone.status if first_milestone else None,
            'second_payment_status': second_milestone.status if second_milestone else None,
            'next_release_date': next_release_date,
            'days_until_next_release': days_until_next_release,
            'progress_percentage': escrow.get_progress_percentage()
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get payment summary: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for subscription plans"""
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]  # Public for pricing page
    
    def get_queryset(self):
        queryset = super().get_queryset()
        plan_type = self.request.query_params.get('plan_type')
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        return queryset.order_by('plan_type', 'price')
    
    @subscription_plan_list_swagger()
    def list(self, request, *args, **kwargs):
        """Get list of available subscription plans with optional filtering by plan type"""
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Get detailed information about a specific subscription plan",
        operation_summary="Get Subscription Plan Details",
        responses={
            200: openapi.Response(
                description="Subscription plan details",
                schema=subscription_plan_response_schema
            ),
            404: openapi.Response(description="Plan not found")
        },
        tags=['Subscription Plans']
    )
    def retrieve(self, request, *args, **kwargs):
        """Get detailed information about a specific subscription plan"""
        return super().retrieve(request, *args, **kwargs)


class UserSubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for user subscriptions"""
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    @current_subscription_swagger()
    def current(self, request):
        """Get current user's subscription"""
        try:
            subscription = UserSubscription.objects.get(user=request.user)
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except UserSubscription.DoesNotExist:
            return Response({'message': 'No active subscription'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    @swagger_auto_schema(
        operation_description="Get detailed plan information for current user including features and billing",
        operation_summary="Get User Plan Info",
        responses={
            200: openapi.Response(
                description="Detailed plan information",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'has_subscription': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'plan_name': openapi.Schema(type=openapi.TYPE_STRING),
                        'plan_type': openapi.Schema(type=openapi.TYPE_STRING),
                        'tier': openapi.Schema(type=openapi.TYPE_STRING),
                        'price': openapi.Schema(type=openapi.TYPE_NUMBER),
                        'features': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                        'project_fee_rate': openapi.Schema(type=openapi.TYPE_NUMBER),
                        'current_period_end': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                    }
                )
            )
        },
        tags=['User Subscription']
    )
    def plan_info(self, request):
        """Get detailed plan information for current user"""
        plan_info = get_user_plan_info(request.user)
        serializer = UserPlanInfoSerializer(plan_info)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    @check_feature_swagger()
    def check_feature(self, request):
        """Check if user has access to specific feature"""
        feature_key = request.data.get('feature_key')
        if not feature_key:
            return Response({'error': 'feature_key is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        has_access = FeatureAccessService.check_feature(request.user, feature_key)
        
        response_data = {
            'feature_key': feature_key,
            'has_access': has_access
        }
        
        if not has_access:
            suggestions = FeatureAccessService.get_upgrade_suggestions(request.user, feature_key)
            response_data['upgrade_suggestions'] = suggestions
            response_data['upgrade_url'] = '/subscription-plans'
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    @swagger_auto_schema(
        operation_description="Get all features available to current user based on their subscription",
        operation_summary="Get Available Features",
        responses={
            200: openapi.Response(
                description="List of available features",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'features': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(type=openapi.TYPE_STRING),
                            description='List of feature keys available to user'
                        )
                    }
                )
            )
        },
        tags=['Feature Access']
    )
    def available_features(self, request):
        """Get all features available to current user"""
        features = FeatureAccessService.get_user_features(request.user)
        return Response({'features': features})
    
    @action(detail=False, methods=['post'])
    @create_checkout_session_swagger()
    def create_checkout_session(self, request):
        """Create Stripe checkout session for subscription"""
        serializer = CreateSubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                plan = SubscriptionPlan.objects.get(id=serializer.validated_data['plan_id'])
                
                # Create or retrieve Stripe customer
                stripe.api_key = settings.STRIPE_SECRET_KEY
                customer = None
                try:
                    # Try to find existing customer
                    customers = stripe.Customer.list(email=request.user.email, limit=1)
                    if customers.data:
                        customer = customers.data[0]
                except:
                    pass
                
                if not customer:
                    customer = stripe.Customer.create(
                        email=request.user.email,
                        name=f"{request.user.first_name} {request.user.last_name}".strip(),
                        metadata={'user_id': request.user.id}
                    )
                
                # Create checkout session
                checkout_session = stripe.checkout.Session.create(
                    customer=customer.id,
                    payment_method_types=['card'],
                    line_items=[{
                        'price': plan.stripe_price_id,
                        'quantity': 1,
                    }],
                    mode='subscription',
                    success_url=serializer.validated_data['success_url'],
                    cancel_url=serializer.validated_data['cancel_url'],
                    metadata={
                        'user_id': request.user.id,
                        'plan_id': plan.id,
                    }
                )
                
                return Response({
                    'checkout_url': checkout_session.url,
                    'session_id': checkout_session.id
                })
                
            except Exception as e:
                logging.error(f"Error creating checkout session: {str(e)}")
                return Response(
                    {'error': 'Failed to create checkout session'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_plan(self, request):
        """Change subscription plan"""
        serializer = ChangeSubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                subscription = UserSubscription.objects.get(user=request.user, status='active')
                new_plan = SubscriptionPlan.objects.get(id=serializer.validated_data['new_plan_id'])
                
                stripe.api_key = settings.STRIPE_SECRET_KEY
                
                # Get current subscription from Stripe
                stripe_subscription = stripe.Subscription.retrieve(subscription.stripe_subscription_id)
                
                # Update subscription with new price
                updated_subscription = stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    items=[{
                        'id': stripe_subscription['items']['data'][0].id,
                        'price': new_plan.stripe_price_id,
                    }],
                    proration_behavior='immediate_prorated'
                )
                
                # Update local subscription
                subscription.plan = new_plan
                subscription.save()
                
                return Response({'message': 'Subscription updated successfully'})
                
            except UserSubscription.DoesNotExist:
                return Response(
                    {'error': 'No active subscription found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                logging.error(f"Error changing subscription: {str(e)}")
                return Response(
                    {'error': 'Failed to change subscription'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def cancel_subscription(self, request):
        """Cancel subscription"""
        try:
            subscription = UserSubscription.objects.get(user=request.user, status='active')
            
            stripe.api_key = settings.STRIPE_SECRET_KEY
            
            # Cancel subscription in Stripe
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )
            
            # Update local subscription
            subscription.status = 'cancelled'
            subscription.cancelled_at = timezone.now()
            subscription.save()
            
            return Response({'message': 'Subscription cancelled successfully'})
            
        except UserSubscription.DoesNotExist:
            return Response(
                {'error': 'No active subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logging.error(f"Error cancelling subscription: {str(e)}")
            return Response(
                {'error': 'Failed to cancel subscription'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def invoices(self, request):
        """Get subscription invoices"""
        try:
            subscription = UserSubscription.objects.get(user=request.user)
            invoices = subscription.invoices.all().order_by('-created_at')
            serializer = SubscriptionInvoiceSerializer(invoices, many=True)
            return Response(serializer.data)
        except UserSubscription.DoesNotExist:
            return Response([], safe=False)


class FeatureAccessAPIView(APIView):
    """API for checking feature access"""
    permission_classes = [permissions.IsAuthenticated]
    
    @multiple_features_swagger()
    def post(self, request):
        """Check multiple features at once"""
        features = request.data.get('features', [])
        if not features:
            return Response({'error': 'features list is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        results = {}
        for feature in features:
            results[feature] = FeatureAccessService.check_feature(request.user, feature)
        
        return Response({
            'feature_access': results,
            'user_plan': get_user_plan_info(request.user)
        })


class PlanComparisonAPIView(APIView):
    """API for plan comparison"""
    permission_classes = [permissions.AllowAny]
    
    @plan_comparison_swagger()
    def get(self, request):
        """Get plan comparison data"""
        plans = SubscriptionPlan.objects.filter(is_active=True).order_by('plan_type', 'price')
        serializer = SubscriptionPlanSerializer(plans, many=True)
        
        # Group plans by type
        grouped_plans = {}
        for plan_data in serializer.data:
            plan_type = plan_data['plan_type']
            if plan_type not in grouped_plans:
                grouped_plans[plan_type] = []
            grouped_plans[plan_type].append(plan_data)
        
        # Get all unique features
        all_features = set()
        for plan_config in SUBSCRIPTION_PLANS.values():
            all_features.update(plan_config['features'])
        
        return Response({
            'plans_by_type': grouped_plans,
            'all_features': sorted(list(all_features)),
            'feature_descriptions': self._get_feature_descriptions()
        })
    
    def _get_feature_descriptions(self):
        """Get feature descriptions for UI"""
        from .subscription_plans import FEATURE_PERMISSIONS
        descriptions = {}
        for feature_key, feature_info in FEATURE_PERMISSIONS.items():
            descriptions[feature_key] = feature_info.get('description', feature_key.replace('_', ' ').title())
        return descriptions


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """Handle Stripe webhooks for subscription events"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            logging.error("Invalid payload in Stripe webhook")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            logging.error("Invalid signature in Stripe webhook")
            return HttpResponse(status=400)
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            self.handle_checkout_completed(event['data']['object'])
        elif event['type'] == 'invoice.payment_succeeded':
            self.handle_payment_succeeded(event['data']['object'])
        elif event['type'] == 'invoice.payment_failed':
            self.handle_payment_failed(event['data']['object'])
        elif event['type'] == 'customer.subscription.updated':
            self.handle_subscription_updated(event['data']['object'])
        elif event['type'] == 'customer.subscription.deleted':
            self.handle_subscription_deleted(event['data']['object'])
        
        return HttpResponse(status=200)
    
    def handle_checkout_completed(self, session):
        """Handle successful checkout completion"""
        try:
            user_id = session['metadata']['user_id']
            plan_id = session['metadata']['plan_id']
            
            user = User.objects.get(id=user_id)
            plan = SubscriptionPlan.objects.get(id=plan_id)
            
            # Get subscription from Stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            subscription = stripe.Subscription.retrieve(session['subscription'])
            
            # Create or update UserSubscription
            user_subscription, created = UserSubscription.objects.update_or_create(
                user=user,
                defaults={
                    'plan': plan,
                    'stripe_subscription_id': subscription.id,
                    'stripe_customer_id': subscription.customer,
                    'status': 'active',
                    'current_period_start': timezone.datetime.fromtimestamp(
                        subscription.current_period_start, tz=timezone.utc
                    ),
                    'current_period_end': timezone.datetime.fromtimestamp(
                        subscription.current_period_end, tz=timezone.utc
                    ),
                }
            )
            
            logging.info(f"Subscription {'created' if created else 'updated'} for user {user.email}")
            
        except Exception as e:
            logging.error(f"Error handling checkout completion: {str(e)}")
    
    def handle_payment_succeeded(self, invoice):
        """Handle successful payment"""
        try:
            subscription_id = invoice['subscription']
            if subscription_id:
                subscription = UserSubscription.objects.get(stripe_subscription_id=subscription_id)
                
                # Create invoice record
                SubscriptionInvoice.objects.create(
                    subscription=subscription,
                    stripe_invoice_id=invoice['id'],
                    amount_paid=invoice['amount_paid'] / 100,  # Convert from cents
                    currency=invoice['currency'],
                    status=invoice['status'],
                    invoice_pdf=invoice.get('invoice_pdf'),
                    paid_at=timezone.datetime.fromtimestamp(invoice['status_transitions']['paid_at'], tz=timezone.utc) if invoice['status_transitions']['paid_at'] else None
                )
                
                # Update subscription status
                subscription.status = 'active'
                subscription.save()
                
        except Exception as e:
            logging.error(f"Error handling payment success: {str(e)}")
    
    def handle_payment_failed(self, invoice):
        """Handle failed payment"""
        try:
            subscription_id = invoice['subscription']
            if subscription_id:
                subscription = UserSubscription.objects.get(stripe_subscription_id=subscription_id)
                subscription.status = 'past_due'
                subscription.save()
                
        except Exception as e:
            logging.error(f"Error handling payment failure: {str(e)}")
    
    def handle_subscription_updated(self, subscription_data):
        """Handle subscription updates"""
        try:
            subscription = UserSubscription.objects.get(
                stripe_subscription_id=subscription_data['id']
            )
            
            subscription.status = subscription_data['status']
            subscription.current_period_start = timezone.datetime.fromtimestamp(
                subscription_data['current_period_start'], tz=timezone.utc
            )
            subscription.current_period_end = timezone.datetime.fromtimestamp(
                subscription_data['current_period_end'], tz=timezone.utc
            )
            subscription.save()
            
        except Exception as e:
            logging.error(f"Error handling subscription update: {str(e)}")
    
    def handle_subscription_deleted(self, subscription_data):
        """Handle subscription deletion"""
        try:
            subscription = UserSubscription.objects.get(
                stripe_subscription_id=subscription_data['id']
            )
            
            subscription.status = 'cancelled'
            subscription.cancelled_at = timezone.now()
            subscription.save()
            
        except Exception as e:
            logging.error(f"Error handling subscription deletion: {str(e)}")
