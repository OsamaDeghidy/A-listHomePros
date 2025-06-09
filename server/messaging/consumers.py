"""
WebSocket consumers for real-time messaging
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message, ConversationMember
from .serializers import MessageSerializer
from notifications.utils import create_notification

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """Real-time chat consumer for conversations"""
    
    async def connect(self):
        """Accept WebSocket connection"""
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope["user"]
        
        # Check if user is authenticated and participant
        if not self.user.is_authenticated:
            await self.close()
            return
        
        is_participant = await self.check_user_permission()
        if not is_participant:
            await self.close()
            return
        
        # Join conversation group
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()
        
        # Send user status (online)
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'online',
                'user_name': self.user.name or self.user.email.split('@')[0]
            }
        )
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Send user status (offline)
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'offline',
                'user_name': self.user.name or self.user.email.split('@')[0]
            }
        )
        
        # Leave conversation group
        await self.channel_layer.group_discard(
            self.conversation_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing_start':
                await self.handle_typing_status(data, True)
            elif message_type == 'typing_stop':
                await self.handle_typing_status(data, False)
            elif message_type == 'message_read':
                await self.handle_message_read(data)
            elif message_type == 'reaction':
                await self.handle_reaction(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
    
    async def handle_chat_message(self, data):
        """Handle new chat message"""
        content = data.get('content', '').strip()
        message_type = data.get('message_type', 'TEXT')
        reply_to_id = data.get('reply_to_id')
        
        if not content:
            return
        
        # Create message in database
        message = await self.create_message(content, message_type, reply_to_id)
        if not message:
            return
        
        # Serialize message
        message_data = await self.serialize_message(message)
        
        # Send message to conversation group
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'chat_message',
                'message': message_data
            }
        )
        
        # Send notifications to other participants
        await self.send_message_notifications(message)
    
    async def handle_typing_status(self, data, is_typing):
        """Handle typing indicators"""
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'typing_status',
                'user_id': self.user.id,
                'user_name': self.user.name or self.user.email.split('@')[0],
                'is_typing': is_typing
            }
        )
    
    async def handle_message_read(self, data):
        """Handle message read status"""
        message_id = data.get('message_id')
        if message_id:
            await self.mark_message_read(message_id)
            
            # Broadcast read status
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'message_read',
                    'message_id': message_id,
                    'user_id': self.user.id
                }
            )
    
    async def handle_reaction(self, data):
        """Handle message reactions"""
        message_id = data.get('message_id')
        reaction_type = data.get('reaction_type')
        
        if message_id and reaction_type:
            success = await self.add_message_reaction(message_id, reaction_type)
            if success:
                await self.channel_layer.group_send(
                    self.conversation_group_name,
                    {
                        'type': 'message_reaction',
                        'message_id': message_id,
                        'user_id': self.user.id,
                        'reaction_type': reaction_type,
                        'user_name': self.user.name or self.user.email.split('@')[0]
                    }
                )
    
    # WebSocket message handlers
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def user_status(self, event):
        """Send user status to WebSocket"""
        # Don't send to the user themselves
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'status': event['status']
            }))
    
    async def typing_status(self, event):
        """Send typing status to WebSocket"""
        # Don't send to the user themselves
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_status',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }))
    
    async def message_read(self, event):
        """Send message read status to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_read',
            'message_id': event['message_id'],
            'user_id': event['user_id']
        }))
    
    async def message_reaction(self, event):
        """Send message reaction to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_reaction',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'user_name': event['user_name'],
            'reaction_type': event['reaction_type']
        }))
    
    # Database operations
    @database_sync_to_async
    def check_user_permission(self):
        """Check if user is participant in conversation"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except Conversation.DoesNotExist:
            return False
    
    @database_sync_to_async
    def create_message(self, content, message_type, reply_to_id=None):
        """Create new message in database"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            
            reply_to = None
            if reply_to_id:
                try:
                    reply_to = Message.objects.get(id=reply_to_id, conversation=conversation)
                except Message.DoesNotExist:
                    pass
            
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content,
                message_type=message_type,
                reply_to=reply_to
            )
            
            # Update conversation timestamp
            conversation.update_last_message_time()
            
            return message
        except Exception as e:
            print(f"Error creating message: {e}")
            return None
    
    @database_sync_to_async
    def serialize_message(self, message):
        """Serialize message for WebSocket"""
        serializer = MessageSerializer(message)
        return serializer.data
    
    @database_sync_to_async
    def mark_message_read(self, message_id):
        """Mark message as read"""
        try:
            message = Message.objects.get(id=message_id, conversation_id=self.conversation_id)
            message.read_by.add(self.user)
            return True
        except Message.DoesNotExist:
            return False
    
    @database_sync_to_async
    def add_message_reaction(self, message_id, reaction_type):
        """Add reaction to message"""
        try:
            from .models import MessageReaction
            message = Message.objects.get(id=message_id, conversation_id=self.conversation_id)
            
            # Remove existing reaction if any
            MessageReaction.objects.filter(message=message, user=self.user).delete()
            
            # Add new reaction
            MessageReaction.objects.create(
                message=message,
                user=self.user,
                reaction_type=reaction_type
            )
            return True
        except Exception as e:
            print(f"Error adding reaction: {e}")
            return False
    
    @database_sync_to_async
    def send_message_notifications(self, message):
        """Send notifications to other participants"""
        try:
            conversation = message.conversation
            participants = conversation.participants.exclude(id=self.user.id)
            
            for participant in participants:
                # Check if user has notifications enabled
                from notifications.models import NotificationSetting
                try:
                    settings = NotificationSetting.objects.get(user=participant)
                    if not settings.new_message_push:
                        continue
                except NotificationSetting.DoesNotExist:
                    pass  # Default to sending notification
                
                create_notification(
                    user=participant,
                    notification_type='MESSAGE',
                    title=f"New message from {self.user.name or self.user.email}",
                    message=message.content[:100] + ('...' if len(message.content) > 100 else ''),
                    related_object_type='conversation',
                    related_object_id=conversation.id
                )
        except Exception as e:
            print(f"Error sending notifications: {e}")


class NotificationConsumer(AsyncWebsocketConsumer):
    """Real-time notification consumer"""
    
    async def connect(self):
        """Accept WebSocket connection for notifications"""
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.notification_group_name = f'notifications_{self.user.id}'
        
        # Join user's notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """Handle disconnection"""
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_notification_read':
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
                    
        except json.JSONDecodeError:
            pass
    
    async def notification_message(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark notification as read"""
        try:
            from notifications.models import Notification
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False 