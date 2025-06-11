from rest_framework import viewsets, permissions, status, filters, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Exists, OuterRef, Prefetch
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Conversation, Message, MessageReaction, ConversationMember, Notification
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    MessageReactionCreateSerializer,
    NotificationSerializer,
    UserBasicSerializer
)
from notifications.utils import QuickNotifications

User = get_user_model()


class ConversationViewSet(viewsets.ModelViewSet):
    """Enhanced conversation management with real-time features"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'participants__name', 'participants__email']
    ordering_fields = ['updated_at', 'created_at']
    ordering = ['-updated_at']

    def get_queryset(self):
        """Get conversations for current user with optimizations"""
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Conversation.objects.none()
        
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related(
            'participants',
            'admin',
            Prefetch(
                'messages',
                queryset=Message.objects.select_related('sender').order_by('-created_at')[:1],
                to_attr='latest_messages'
            )
        ).order_by('-updated_at')

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return ConversationListSerializer
        elif self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer

    def retrieve(self, request, *args, **kwargs):
        """Retrieve conversation and mark as read"""
        conversation = self.get_object()
        
        # Mark conversation as read for current user
        membership, created = ConversationMember.objects.get_or_create(
            conversation=conversation,
            user=request.user
        )
        membership.mark_conversation_read()
        
        # Mark all unread messages as read
        conversation.mark_all_read_for_user(request.user)
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark conversation as read"""
        conversation = self.get_object()
        conversation.mark_all_read_for_user(request.user)
        return Response({'status': 'marked as read'})

    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        """Add participant to group conversation"""
        conversation = self.get_object()
        
        # Check permissions
        membership = get_object_or_404(
            ConversationMember,
            conversation=conversation,
            user=request.user
        )
        
        if not conversation.is_group or not membership.can_add_members:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            conversation.participants.add(user)
            
            # Create membership
            ConversationMember.objects.get_or_create(
                conversation=conversation,
                user=user
            )
            
            # Send system message
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=f"{user.name or user.email} was added to the conversation",
                message_type='SYSTEM'
            )
            
            return Response({'status': 'participant added'})
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def remove_participant(self, request, pk=None):
        """Remove participant from group conversation"""
        conversation = self.get_object()
        
        # Check permissions
        membership = get_object_or_404(
            ConversationMember,
            conversation=conversation,
            user=request.user
        )
        
        if not conversation.is_group or not membership.can_remove_members:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            conversation.participants.remove(user)
            
            # Update membership
            ConversationMember.objects.filter(
                conversation=conversation,
                user=user
            ).update(left_at=timezone.now())
            
            # Send system message
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=f"{user.name or user.email} was removed from the conversation",
                message_type='SYSTEM'
            )
            
            return Response({'status': 'participant removed'})
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive/unarchive conversation"""
        conversation = self.get_object()
        conversation.is_archived = not conversation.is_archived
        conversation.save()
        
        return Response({
            'status': 'archived' if conversation.is_archived else 'unarchived'
        })

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search conversations and messages"""
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([], status=status.HTTP_200_OK)
        
        # Search conversations by title and participant names
        conversations = self.get_queryset().filter(
            Q(title__icontains=query) |
            Q(participants__name__icontains=query) |
            Q(participants__email__icontains=query)
        ).distinct()
        
        # Also search messages
        message_conversations = self.get_queryset().filter(
            messages__content__icontains=query
        ).distinct()
        
        # Combine results
        all_conversations = (conversations | message_conversations).distinct()
        
        serializer = ConversationListSerializer(
            all_conversations,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """Enhanced message management with reactions and threading"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get messages for conversations user is part of"""
        conversation_id = self.kwargs.get('conversation_pk')
        if conversation_id:
            # Check if user is participant
            conversation = get_object_or_404(
                Conversation.objects.filter(participants=self.request.user),
                id=conversation_id
            )
            return Message.objects.filter(
                conversation=conversation,
                is_deleted=False
            ).select_related('sender', 'reply_to__sender').prefetch_related(
                'reactions__user',
                'read_by'
            ).order_by('created_at')
        
        return Message.objects.none()

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer

    def perform_create(self, serializer):
        """Create message and send notifications"""
        conversation_id = self.kwargs.get('conversation_pk')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if user is participant
        if not conversation.participants.filter(id=self.request.user.id).exists():
            raise permissions.PermissionDenied("You are not a participant in this conversation")
        
        # Save message with sender and conversation
        message = serializer.save(
            conversation=conversation, 
            sender=self.request.user
        )
        
        # Mark message as read by sender
        message.read_by.add(self.request.user)
        
        # Update conversation timestamp
        conversation.update_last_message_time()
        
        # Send notifications to other participants
        other_participants = conversation.participants.exclude(id=self.request.user.id)
        for participant in other_participants:
            try:
                from notifications.utils import create_notification
                create_notification(
                    user=participant,
                    notification_type='MESSAGE',
                    title=f"New message from {self.request.user.name or self.request.user.email}",
                    message=message.content[:100] + ('...' if len(message.content) > 100 else ''),
                    related_object_type='conversation',
                    related_object_id=conversation.id
                )
            except (ImportError, Exception) as e:
                # Log the error but don't fail the message creation
                print(f"Failed to create notification for {participant.email}: {e}")
                pass

    @action(detail=True, methods=['post'])
    def mark_read(self, request, conversation_pk=None, pk=None):
        """Mark message as read"""
        message = self.get_object()
        message.mark_as_read_by(request.user)
        return Response({'status': 'marked as read'})

    @action(detail=True, methods=['post'])
    def react(self, request, conversation_pk=None, pk=None):
        """Add or update reaction to message"""
        message = self.get_object()
        reaction_type = request.data.get('reaction_type')
        
        if not reaction_type:
            return Response(
                {'error': 'reaction_type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove existing reaction and add new one
        MessageReaction.objects.filter(
            message=message,
            user=request.user
        ).delete()
        
        reaction = MessageReaction.objects.create(
            message=message,
            user=request.user,
            reaction_type=reaction_type
        )
        
        serializer = MessageReactionCreateSerializer(reaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def remove_reaction(self, request, conversation_pk=None, pk=None):
        """Remove reaction from message"""
        message = self.get_object()
        MessageReaction.objects.filter(
            message=message,
            user=request.user
        ).delete()
        
        return Response({'status': 'reaction removed'})

    @action(detail=True, methods=['patch'])
    def edit(self, request, conversation_pk=None, pk=None):
        """Edit message content"""
        message = self.get_object()
        
        if message.sender != request.user:
            return Response(
                {'error': 'You can only edit your own messages'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_content = request.data.get('content')
        if not new_content:
            return Response(
                {'error': 'content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message.edit_content(new_content)
        serializer = self.get_serializer(message)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, conversation_pk=None, pk=None):
        """Soft delete message"""
        message = self.get_object()
        
        if message.sender != request.user:
            return Response(
                {'error': 'You can only delete your own messages'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.soft_delete()
        return Response({'status': 'message deleted'})


class NotificationViewSet(viewsets.ModelViewSet):
    """Enhanced notification management"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        """Get notifications for current user"""
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()
        
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count"""
        count = self.get_queryset().filter(read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated = self.get_queryset().filter(read=False).update(
            read=True,
            read_at=timezone.now()
        )
        return Response({'marked_read': updated})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark single notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'status': 'marked as read'})

    def perform_update(self, serializer):
        """Update notification read status"""
        if 'read' in serializer.validated_data and serializer.validated_data['read']:
            serializer.validated_data['read_at'] = timezone.now()
        serializer.save()


class UserSearchView(generics.ListAPIView):
    """Search users for starting conversations"""
    serializer_class = UserBasicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return User.objects.none()
        
        return User.objects.filter(
            Q(name__icontains=query) |
            Q(email__icontains=query)
        ).exclude(id=self.request.user.id)[:10]


# WebSocket Consumer (if using Django Channels)
# This would go in a separate consumers.py file
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class MessagingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        
        self.user_group_name = f"user_{self.user.id}"
        
        # Join user's personal group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave user's personal group
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'typing':
                # Handle typing indicators
                conversation_id = text_data_json.get('conversation_id')
                await self.handle_typing(conversation_id)
            elif message_type == 'join_conversation':
                # Join conversation group
                conversation_id = text_data_json.get('conversation_id')
                await self.join_conversation(conversation_id)
                
        except json.JSONDecodeError:
            pass
    
    async def handle_typing(self, conversation_id):
        # Send typing indicator to conversation participants
        await self.channel_layer.group_send(
            f"conversation_{conversation_id}",
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'user_name': self.user.name or self.user.email.split('@')[0]
            }
        )
    
    async def join_conversation(self, conversation_id):
        # Join conversation group for real-time messages
        await self.channel_layer.group_add(
            f"conversation_{conversation_id}",
            self.channel_name
        )
    
    async def new_message(self, event):
        # Send new message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))
    
    async def typing_indicator(self, event):
        # Send typing indicator to WebSocket
        if event['user_id'] != self.user.id:  # Don't send to sender
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'user_name': event['user_name']
            }))
"""
