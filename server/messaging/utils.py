from django.conf import settings
from django.utils import timezone
from django.db.models import Q, Count, Exists, OuterRef, Max
from django.contrib.auth import get_user_model
from .models import Conversation, Message, MessageReaction, ConversationMember
from notifications.models import Notification, NotificationSetting
from notifications.utils import create_notification
import json
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class MessagingService:
    """Enhanced messaging service with real-time capabilities"""
    
    @staticmethod
    def create_conversation(participants, title="", conversation_type="direct", related_service_request=None):
        """Create a new conversation"""
        conversation = Conversation.objects.create(
            title=title,
            conversation_type=conversation_type,
            related_service_request=related_service_request
        )
        conversation.participants.set(participants)
        
        # Send welcome message for group conversations
        if conversation_type == "group" and len(participants) > 2:
            MessagingService.send_system_message(
                conversation,
                f"Group conversation '{title}' created with {len(participants)} participants."
            )
        
        return conversation
    
    @staticmethod
    def send_message(conversation, sender, content, message_type="text", reply_to=None, attachments=None):
        """Send a message in a conversation"""
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            content=content,
            message_type=message_type,
            reply_to=reply_to
        )
        
        if attachments:
            message.attachments.set(attachments)
        
        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()
        
        # Send notifications to other participants
        MessagingService._notify_participants(message)
        
        return message
    
    @staticmethod
    def send_system_message(conversation, content):
        """Send a system message"""
        return Message.objects.create(
            conversation=conversation,
            sender=None,  # System message
            content=content,
            message_type="system"
        )
    
    @staticmethod
    def mark_conversation_as_read(conversation, user):
        """Mark all messages in conversation as read for user"""
        unread_messages = conversation.messages.exclude(
            Q(read_by=user) | Q(sender=user)
        )
        
        for message in unread_messages:
            message.read_by.add(user)
    
    @staticmethod
    def get_unread_count(user):
        """Get total unread message count for user"""
        return Message.objects.filter(
            conversation__participants=user
        ).exclude(
            Q(read_by=user) | Q(sender=user)
        ).count()
    
    @staticmethod
    def search_messages(user, query, conversation=None):
        """Search messages for a user"""
        messages = Message.objects.filter(
            conversation__participants=user,
            content__icontains=query,
            is_deleted=False
        )
        
        if conversation:
            messages = messages.filter(conversation=conversation)
        
        return messages.order_by('-created_at')
    
    @staticmethod
    def add_reaction(message, user, reaction_type):
        """Add or update reaction to a message"""
        reaction, created = MessageReaction.objects.get_or_create(
            message=message,
            user=user,
            defaults={'reaction_type': reaction_type}
        )
        
        if not created and reaction.reaction_type != reaction_type:
            reaction.reaction_type = reaction_type
            reaction.save()
        
        return reaction
    
    @staticmethod
    def remove_reaction(message, user, reaction_type):
        """Remove reaction from a message"""
        MessageReaction.objects.filter(
            message=message,
            user=user,
            reaction_type=reaction_type
        ).delete()
    
    @staticmethod
    def _notify_participants(message):
        """Send notifications to conversation participants"""
        participants = message.conversation.participants.exclude(
            id=message.sender.id
        )
        
        for participant in participants:
            # Check user's notification preferences
            try:
                settings_obj = NotificationSetting.objects.get(user=participant)
                if not settings_obj.new_message_push:
                    continue
            except NotificationSetting.DoesNotExist:
                # Create default preferences and continue
                NotificationSetting.objects.create(user=participant)
            
            # Create notification
            create_notification(
                user=participant,
                notification_type='MESSAGE',
                title=f"New message from {message.sender.name or message.sender.email}",
                message=message.content[:100] + "..." if len(message.content) > 100 else message.content,
                related_object_type='message',
                related_object_id=message.id
            )


class NotificationService:
    """Enhanced notification service"""
    
    @staticmethod
    def create_notification(user, notification_type, title, content, priority='medium', 
                          related_object_type=None, related_object_id=None, action_url=None,
                          scheduled_for=None, expires_at=None):
        """Create a new notification"""
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=content,
            related_object_type=related_object_type,
            related_object_id=related_object_id
        )
        
        # Send immediate notifications if not scheduled
        if not scheduled_for:
            NotificationService._send_notification(notification)
        
        return notification
    
    @staticmethod
    def create_appointment_reminder(appointment, hours_before=24):
        """Create appointment reminder notification"""
        reminder_time = appointment.appointment_date - timezone.timedelta(hours=hours_before)
        
        return NotificationService.create_notification(
            user=appointment.client,
            notification_type='APPOINTMENT',
            title=f"Appointment Reminder",
            content=f"You have an appointment with {appointment.alistpro.business_name} tomorrow at {appointment.start_time}",
            related_object_type='appointment',
            related_object_id=appointment.id
        )
    
    @staticmethod
    def create_quote_notification(quote, notification_type='quote'):
        """Create quote-related notification"""
        if notification_type == 'quote_request':
            # Notify professional about new quote request
            user = quote.professional
            title = "New Quote Request"
            content = f"You have a new quote request for: {quote.service_request.title}"
        else:
            # Notify client about quote response
            user = quote.service_request.client
            title = "Quote Received"
            content = f"You received a quote for: {quote.service_request.title} - ${quote.total_price}"
        
        return NotificationService.create_notification(
            user=user,
            notification_type=notification_type,
            title=title,
            content=content,
            priority='high',
            related_object_type='quote',
            related_object_id=quote.id,
            action_url=f"/quotes/{quote.id}/"
        )
    
    @staticmethod
    def create_payment_notification(payment, status_change=True):
        """Create payment-related notification"""
        if status_change:
            title = f"Payment {payment.status.title()}"
            content = f"Your payment of ${payment.amount} has been {payment.status}"
        else:
            title = "Payment Received"
            content = f"Payment of ${payment.amount} has been received"
        
        return NotificationService.create_notification(
            user=payment.client,
            notification_type='payment',
            title=title,
            content=content,
            priority='high',
            related_object_type='payment',
            related_object_id=payment.id,
            action_url=f"/payments/{payment.id}/"
        )
    
    @staticmethod
    def create_review_notification(review):
        """Create review notification for professional"""
        return NotificationService.create_notification(
            user=review.alistpro.user,
            notification_type='review',
            title="New Review Received",
            content=f"You received a {review.rating}-star review from {review.client.name or review.client.email}",
            priority='medium',
            related_object_type='review',
            related_object_id=review.id,
            action_url=f"/reviews/{review.id}/"
        )
    
    @staticmethod
    def create_welcome_notification(user):
        """Create welcome notification for new users"""
        if user.role in ['contractor', 'specialist', 'crew']:
            title = "Welcome to A-List Home Pros!"
            content = "Complete your professional profile to start receiving service requests."
            action_url = "/profile/complete/"
        else:
            title = "Welcome to A-List Home!"
            content = "Start browsing our verified professionals for your home service needs."
            action_url = "/browse-professionals/"
        
        return NotificationService.create_notification(
            user=user,
            notification_type='welcome',
            title=title,
            content=content,
            priority='medium',
            action_url=action_url
        )
    
    @staticmethod
    def mark_all_as_read(user):
        """Mark all notifications as read for user"""
        notifications = Notification.objects.filter(user=user, read=False)
        for notification in notifications:
            notification.mark_as_read()
        return notifications.count()
    
    @staticmethod
    def get_unread_count(user):
        """Get unread notification count for user"""
        return Notification.objects.filter(user=user, read=False).count()
    
    @staticmethod
    def _send_notification(notification):
        """Send notification via enabled channels"""
        try:
            settings_obj = notification.user.notification_settings
        except NotificationSetting.DoesNotExist:
            # Create default settings
            settings_obj = NotificationSetting.objects.create(user=notification.user)
        
        # Skip if in quiet hours
        if settings_obj.is_in_quiet_hours():
            return
        
        # Send email notification
        if settings_obj.email_enabled and NotificationService._should_send_email(notification, settings_obj):
            NotificationService._send_email_notification(notification)
        
        # Send SMS notification
        if settings_obj.sms_enabled and NotificationService._should_send_sms(notification, settings_obj):
            NotificationService._send_sms_notification(notification)
        
        # Send push notification
        if settings_obj.push_enabled and NotificationService._should_send_push(notification, settings_obj):
            NotificationService._send_push_notification(notification)
    
    @staticmethod
    def _should_send_email(notification, settings):
        """Check if email should be sent for this notification type"""
        type_mapping = {
            'message': settings.new_message_email,
            'appointment': settings.appointment_status_change_email,
            'appointment_reminder': settings.appointment_reminder_email,
            'quote': settings.quote_received_email,
            'payment': settings.payment_email,
            'review': settings.review_received_email,
            'service_request': settings.new_service_request_email,
        }
        return type_mapping.get(notification.notification_type, True)
    
    @staticmethod
    def _should_send_sms(notification, settings):
        """Check if SMS should be sent for this notification type"""
        type_mapping = {
            'message': settings.new_message_sms,
            'appointment': settings.appointment_status_change_sms,
            'appointment_reminder': settings.appointment_reminder_sms,
            'quote': settings.quote_received_sms,
            'payment': settings.payment_sms,
            'review': settings.review_received_sms,
            'service_request': settings.new_service_request_sms,
        }
        return type_mapping.get(notification.notification_type, False)
    
    @staticmethod
    def _should_send_push(notification, settings):
        """Check if push notification should be sent for this notification type"""
        type_mapping = {
            'message': settings.new_message_push,
            'appointment': settings.appointment_status_change_push,
            'appointment_reminder': settings.appointment_reminder_push,
            'quote': settings.quote_received_push,
            'payment': settings.payment_push,
            'review': settings.review_received_push,
            'service_request': settings.new_service_request_push,
        }
        return type_mapping.get(notification.notification_type, True)
    
    @staticmethod
    def _send_email_notification(notification):
        """Send email notification (placeholder for actual implementation)"""
        # TODO: Implement actual email sending
        notification.email_status = 'sent'
        notification.email_sent_at = timezone.now()
        notification.save()
    
    @staticmethod
    def _send_sms_notification(notification):
        """Send SMS notification (placeholder for actual implementation)"""
        # TODO: Implement actual SMS sending
        notification.sms_status = 'sent'
        notification.sms_sent_at = timezone.now()
        notification.save()
    
    @staticmethod
    def _send_push_notification(notification):
        """Send push notification (placeholder for actual implementation)"""
        # TODO: Implement actual push notification sending
        notification.push_status = 'sent'
        notification.push_sent_at = timezone.now()
        notification.save()


class RealTimeService:
    """Service for real-time features"""
    
    @staticmethod
    def broadcast_message(message):
        """Broadcast message to conversation participants"""
        # TODO: Implement WebSocket broadcasting
        pass
    
    @staticmethod
    def broadcast_notification(notification):
        """Broadcast notification to user"""
        # TODO: Implement WebSocket broadcasting
        pass
    
    @staticmethod
    def update_user_status(user, status='online'):
        """Update user online status"""
        # TODO: Implement user status tracking
        pass 


class ConversationManager:
    """Enhanced conversation management utilities"""
    
    @staticmethod
    def create_conversation(creator, participants, title=None, is_group=False, related_object=None):
        """
        Create a new conversation with participants
        
        Args:
            creator: User who creates the conversation
            participants: List of User objects or user IDs
            title: Optional conversation title
            is_group: Whether this is a group conversation
            related_object: Optional related object (ServiceRequest, etc.)
        
        Returns:
            Conversation object
        """
        try:
            # Ensure creator is in participants
            participant_users = []
            for participant in participants:
                if isinstance(participant, int):
                    participant_users.append(User.objects.get(id=participant))
                else:
                    participant_users.append(participant)
            
            if creator not in participant_users:
                participant_users.append(creator)
            
            # Create conversation
            conversation = Conversation.objects.create(
                title=title or ConversationManager._generate_title(participant_users),
                is_group=is_group,
                admin=creator if is_group else None,
                related_object_type=type(related_object).__name__.lower() if related_object else '',
                related_object_id=related_object.id if related_object else None
            )
            
            # Add participants
            conversation.participants.set(participant_users)
            
            # Create membership records
            for participant in participant_users:
                ConversationMember.objects.create(
                    conversation=conversation,
                    user=participant,
                    can_add_members=(participant == creator and is_group),
                    can_remove_members=(participant == creator and is_group),
                    can_edit_conversation=(participant == creator and is_group)
                )
            
            logger.info(f"Conversation created by {creator.email} with {len(participant_users)} participants")
            return conversation
            
        except Exception as e:
            logger.error(f"Failed to create conversation: {str(e)}")
            return None
    
    @staticmethod
    def _generate_title(participants):
        """Generate a default title for conversations"""
        if len(participants) <= 2:
            return None  # 1-on-1 conversations don't need titles
        
        names = [p.name or p.email.split('@')[0] for p in participants[:3]]
        if len(participants) > 3:
            return f"{', '.join(names)} and {len(participants) - 3} others"
        return ', '.join(names)
    
    @staticmethod
    def find_or_create_direct_conversation(user1, user2):
        """
        Find existing direct conversation between two users or create new one
        
        Args:
            user1: First user
            user2: Second user
        
        Returns:
            Conversation object
        """
        # Look for existing conversation between these two users
        conversation = Conversation.objects.filter(
            is_group=False,
            participants=user1
        ).filter(
            participants=user2
        ).annotate(
            participant_count=Count('participants')
        ).filter(
            participant_count=2
        ).first()
        
        if conversation:
            return conversation
        
        # Create new conversation
        return ConversationManager.create_conversation(
            creator=user1,
            participants=[user1, user2],
            is_group=False
        )
    
    @staticmethod
    def get_user_conversations(user, search_query=None):
        """
        Get all conversations for a user with enhanced filtering
        
        Args:
            user: User object
            search_query: Optional search query
        
        Returns:
            QuerySet of conversations
        """
        queryset = Conversation.objects.filter(
            participants=user
        ).select_related('admin').prefetch_related(
            'participants',
            'messages__sender'
        ).annotate(
            unread_count=Count(
                'messages',
                filter=Q(
                    messages__created_at__gt=OuterRef('memberships__last_read_at')
                ) & ~Q(messages__sender=user)
            ),
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time')
        
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(participants__name__icontains=search_query) |
                Q(participants__email__icontains=search_query) |
                Q(messages__content__icontains=search_query)
            ).distinct()
        
        return queryset


class MessageManager:
    """Enhanced message management utilities"""
    
    @staticmethod
    def send_message(sender, conversation, content, message_type='TEXT', **kwargs):
        """
        Send a message in a conversation
        
        Args:
            sender: User sending the message
            conversation: Conversation object
            content: Message content
            message_type: Type of message (TEXT, IMAGE, FILE, etc.)
            **kwargs: Additional message fields
        
        Returns:
            Message object
        """
        try:
            # Check if sender is participant
            if not conversation.participants.filter(id=sender.id).exists():
                raise ValueError("Sender is not a participant in this conversation")
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                sender=sender,
                content=content,
                message_type=message_type,
                **kwargs
            )
            
            # Mark as read by sender
            message.read_by.add(sender)
            
            # Update conversation timestamp
            conversation.updated_at = timezone.now()
            conversation.save()
            
            # Send notifications to other participants
            MessageManager._notify_participants(message)
            
            logger.info(f"Message sent by {sender.email} in conversation {conversation.id}")
            return message
            
        except Exception as e:
            logger.error(f"Failed to send message: {str(e)}")
            return None
    
    @staticmethod
    def _notify_participants(message):
        """Send notifications to conversation participants"""
        other_participants = message.conversation.participants.exclude(
            id=message.sender.id
        )
        
        for participant in other_participants:
            # Check if participant has muted this conversation
            try:
                membership = ConversationMember.objects.get(
                    conversation=message.conversation,
                    user=participant
                )
                if membership.is_muted:
                    continue
            except ConversationMember.DoesNotExist:
                pass
            
            # Create notification
            sender_name = message.sender.name or message.sender.email.split('@')[0]
            title = f"New message from {sender_name}"
            
            if message.conversation.title:
                title += f" in {message.conversation.title}"
            
            create_notification(
                user=participant,
                notification_type='MESSAGE',
                title=title,
                message=message.content[:100] + ('...' if len(message.content) > 100 else ''),
                related_object_type='conversation',
                related_object_id=message.conversation.id
            )
    
    @staticmethod
    def mark_conversation_read(user, conversation):
        """Mark all messages in conversation as read for user"""
        unread_messages = conversation.messages.exclude(
            Q(sender=user) | Q(read_by=user)
        )
        
        for message in unread_messages:
            message.read_by.add(user)
        
        # Update membership
        membership, created = ConversationMember.objects.get_or_create(
            conversation=conversation,
            user=user
        )
        membership.mark_conversation_read()
        
        return unread_messages.count()
    
    @staticmethod
    def get_conversation_messages(conversation, user, limit=50, before_message_id=None):
        """
        Get messages for a conversation with pagination
        
        Args:
            conversation: Conversation object
            user: User requesting messages
            limit: Number of messages to return
            before_message_id: Get messages before this message ID (for pagination)
        
        Returns:
            QuerySet of messages
        """
        # Check if user is participant
        if not conversation.participants.filter(id=user.id).exists():
            return Message.objects.none()
        
        queryset = conversation.messages.filter(
            is_deleted=False
        ).select_related('sender', 'reply_to__sender').prefetch_related(
            'reactions__user',
            'read_by'
        ).order_by('-created_at')
        
        if before_message_id:
            queryset = queryset.filter(id__lt=before_message_id)
        
        return queryset[:limit]


class ReactionManager:
    """Message reaction management utilities"""
    
    @staticmethod
    def add_reaction(user, message, reaction_type):
        """Add or update reaction to a message"""
        try:
            # Remove existing reaction if any
            MessageReaction.objects.filter(
                message=message,
                user=user
            ).delete()
            
            # Add new reaction
            reaction = MessageReaction.objects.create(
                message=message,
                user=user,
                reaction_type=reaction_type
            )
            
            logger.info(f"Reaction {reaction_type} added by {user.email} to message {message.id}")
            return reaction
            
        except Exception as e:
            logger.error(f"Failed to add reaction: {str(e)}")
            return None
    
    @staticmethod
    def remove_reaction(user, message):
        """Remove user's reaction from a message"""
        try:
            deleted_count = MessageReaction.objects.filter(
                message=message,
                user=user
            ).delete()[0]
            
            logger.info(f"Reaction removed by {user.email} from message {message.id}")
            return deleted_count > 0
            
        except Exception as e:
            logger.error(f"Failed to remove reaction: {str(e)}")
            return False
    
    @staticmethod
    def get_message_reactions(message):
        """Get reaction summary for a message"""
        reactions = MessageReaction.objects.filter(message=message).values(
            'reaction_type'
        ).annotate(count=Count('reaction_type')).order_by('-count')
        
        return {r['reaction_type']: r['count'] for r in reactions}


class SearchManager:
    """Enhanced search functionality for messaging"""
    
    @staticmethod
    def search_conversations(user, query):
        """Search user's conversations"""
        return ConversationManager.get_user_conversations(user, query)
    
    @staticmethod
    def search_messages(user, query, conversation=None):
        """
        Search messages across conversations or within a specific conversation
        
        Args:
            user: User performing search
            query: Search query
            conversation: Optional specific conversation to search in
        
        Returns:
            QuerySet of messages
        """
        # Base query - only messages in conversations user is part of
        queryset = Message.objects.filter(
            conversation__participants=user,
            is_deleted=False,
            content__icontains=query
        ).select_related(
            'sender', 'conversation'
        ).order_by('-created_at')
        
        if conversation:
            queryset = queryset.filter(conversation=conversation)
        
        return queryset


class ConversationAnalytics:
    """Analytics and insights for conversations"""
    
    @staticmethod
    def get_user_messaging_stats(user):
        """Get messaging statistics for a user"""
        return {
            'total_conversations': Conversation.objects.filter(participants=user).count(),
            'total_messages_sent': Message.objects.filter(sender=user).count(),
            'total_messages_received': Message.objects.filter(
                conversation__participants=user
            ).exclude(sender=user).count(),
            'unread_conversations': Conversation.objects.filter(
                participants=user,
                messages__read_by=user
            ).annotate(
                unread_count=Count(
                    'messages',
                    filter=~Q(messages__read_by=user) & ~Q(messages__sender=user)
                )
            ).filter(unread_count__gt=0).count()
        }
    
    @staticmethod
    def get_conversation_stats(conversation):
        """Get statistics for a specific conversation"""
        return {
            'total_messages': conversation.messages.count(),
            'participant_count': conversation.participants.count(),
            'most_active_participant': conversation.messages.values(
                'sender__id', 'sender__name', 'sender__email'
            ).annotate(
                message_count=Count('id')
            ).order_by('-message_count').first(),
            'created_date': conversation.created_at,
            'last_activity': conversation.updated_at
        }


# Utility functions for WebSocket integration
def get_conversation_group_name(conversation_id):
    """Get WebSocket group name for a conversation"""
    return f"conversation_{conversation_id}"


def get_user_group_name(user_id):
    """Get WebSocket group name for a user"""
    return f"user_{user_id}"


def format_message_for_websocket(message):
    """Format message data for WebSocket transmission"""
    return {
        'id': message.id,
        'conversation_id': message.conversation.id,
        'sender': {
            'id': message.sender.id,
            'name': message.sender.name or message.sender.email.split('@')[0],
            'email': message.sender.email
        },
        'content': message.content,
        'message_type': message.message_type,
        'created_at': message.created_at.isoformat(),
        'is_edited': message.is_edited,
        'reply_to_id': message.reply_to.id if message.reply_to else None
    } 