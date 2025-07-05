from celery import shared_task
from django.utils import timezone
from django.conf import settings
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


@shared_task
def auto_release_payment(milestone_id):
    """
    تحرير الدفعة تلقائياً بعد 14 يوم إذا لم يتم الاعتراض
    Auto-release payment after 14 days if no disputes
    """
    try:
        from .models import EscrowMilestone
        
        # الحصول على المعلم
        try:
            milestone = EscrowMilestone.objects.get(id=milestone_id)
        except EscrowMilestone.DoesNotExist:
            logger.error(f"Milestone {milestone_id} not found for auto-release")
            return
        
        # التحقق من أن المعلم ما زال في فترة الحجز
        if milestone.status != 'held':
            logger.info(f"Milestone {milestone_id} is no longer held (status: {milestone.status})")
            return
        
        # التحقق من انتهاء فترة الحجز
        if milestone.hold_until and timezone.now() >= milestone.hold_until:
            # إفراج تلقائي
            milestone.release_payment()
            
            # إرسال إشعارات
            try:
                from notifications.models import Notification
                
                # إشعار للمحترف
                Notification.objects.create(
                    user=milestone.escrow.professional.user,
                    title="Payment Auto-Released",
                    message=f"Payment automatically released for: {milestone.title} (${milestone.amount})",
                    notification_type='payment_release'
                )
                
                # إشعار للعميل
                Notification.objects.create(
                    user=milestone.escrow.client,
                    title="Payment Released",
                    message=f"Payment was automatically released for: {milestone.title} (${milestone.amount})",
                    notification_type='payment_release'
                )
                
                # إرسال رسالة في المحادثة
                if hasattr(milestone.escrow, 'service_quote') and milestone.escrow.service_quote:
                    service_request = milestone.escrow.service_quote.service_request
                    if hasattr(service_request, 'conversation') and service_request.conversation:
                        from messaging.models import Message
                        Message.objects.create(
                            conversation=service_request.conversation,
                            sender=milestone.escrow.client,  # نظام
                            content=f"🔓 إفراج تلقائي: {milestone.title}\n\nتم إفراج المبلغ تلقائياً بعد انتهاء فترة الحجز (14 يوم).\nالمبلغ: ${milestone.amount}",
                            message_type='auto_release'
                        )
                
            except Exception as notification_error:
                logger.error(f"Error sending auto-release notifications: {str(notification_error)}")
            
            logger.info(f"Payment auto-released for milestone {milestone_id}: ${milestone.amount}")
        else:
            logger.warning(f"Milestone {milestone_id} hold period not yet expired")
            
    except Exception as e:
        logger.error(f"Error in auto_release_payment for milestone {milestone_id}: {str(e)}")


@shared_task
def process_pending_releases():
    """
    معالجة جميع الدفعات المعلقة للإفراج
    Process all pending payment releases
    """
    try:
        from .models import EscrowMilestone
        
        # العثور على جميع المعالم الجاهزة للإفراج
        ready_milestones = EscrowMilestone.objects.filter(
            status='held',
            hold_until__lte=timezone.now()
        )
        
        released_count = 0
        for milestone in ready_milestones:
            try:
                auto_release_payment.delay(milestone.id)
                released_count += 1
            except Exception as e:
                logger.error(f"Error scheduling auto-release for milestone {milestone.id}: {str(e)}")
        
        logger.info(f"Scheduled auto-release for {released_count} milestones")
        return released_count
        
    except Exception as e:
        logger.error(f"Error in process_pending_releases: {str(e)}")
        return 0


@shared_task
def send_payment_reminders():
    """
    إرسال تذكيرات للعملاء للدفعات المعلقة
    Send payment reminders to clients for pending milestones
    """
    try:
        from .models import EscrowMilestone
        from datetime import timedelta
        
        # العثور على المعالم المعلقة لأكثر من يوم
        pending_milestones = EscrowMilestone.objects.filter(
            status='pending',
            created_at__lt=timezone.now() - timedelta(days=1)
        ).select_related('escrow', 'escrow__client', 'escrow__professional')
        
        reminder_count = 0
        for milestone in pending_milestones:
            try:
                from notifications.models import Notification
                
                # إرسال تذكير للعميل
                Notification.objects.create(
                    user=milestone.escrow.client,
                    title="Payment Reminder",
                    message=f"Reminder: Payment pending for {milestone.title} (${milestone.amount})",
                    notification_type='payment_reminder'
                )
                
                reminder_count += 1
                
            except Exception as e:
                logger.error(f"Error sending reminder for milestone {milestone.id}: {str(e)}")
        
        logger.info(f"Sent {reminder_count} payment reminders")
        return reminder_count
        
    except Exception as e:
        logger.error(f"Error in send_payment_reminders: {str(e)}")
        return 0


@shared_task
def calculate_platform_revenue_report():
    """
    حساب تقرير إيرادات المنصة من العمولات
    Calculate platform revenue report from commissions
    """
    try:
        from .models import PaymentInstallment
        from django.db.models import Sum
        from datetime import datetime, timedelta
        
        # إيرادات آخر 30 يوم
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        revenue_data = PaymentInstallment.objects.filter(
            status='released',
            released_at__gte=thirty_days_ago
        ).aggregate(
            total_platform_fees=Sum('platform_fee'),
            total_gross_amount=Sum('gross_amount'),
            total_net_amount=Sum('net_amount')
        )
        
        logger.info(f"Platform revenue report generated: {revenue_data}")
        
        return revenue_data
        
    except Exception as exc:
        logger.error(f"Error generating platform revenue report: {str(exc)}")
        return None


@shared_task
def send_payment_hold_reminder(installment_id, days_remaining):
    """
    إرسال تذكير بانتهاء فترة الحجز
    Send reminder about hold period ending
    """
    try:
        from .models import PaymentInstallment
        from notifications.models import Notification
        
        installment = PaymentInstallment.objects.get(id=installment_id)
        
        # إشعار للعميل
        Notification.objects.create(
            user=installment.client,
            title=f"Payment Hold Ending in {days_remaining} days",
            message=f"Your payment for '{installment.quote.service_request.title}' will be released to the professional in {days_remaining} days. If you have any concerns, please contact support.",
            notification_type='payment'
        )
        
        # إشعار للمحترف
        Notification.objects.create(
            user=installment.professional.user,
            title=f"Payment Release in {days_remaining} days",
            message=f"Payment for '{installment.quote.service_request.title}' will be released to your account in {days_remaining} days.",
            notification_type='payment'
        )
        
        logger.info(f"Payment hold reminder sent for installment {installment_id}")
        
    except Exception as exc:
        logger.error(f"Error sending payment hold reminder for {installment_id}: {str(exc)}") 