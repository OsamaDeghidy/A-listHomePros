from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Max
from .models import Conversation, Message, MessageReaction, ConversationMember, Notification

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for messaging"""
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'full_name', 'avatar_url', 'is_online']
        read_only_fields = ['id', 'email']
    
    def get_full_name(self, obj):
        return obj.name or obj.email.split('@')[0]
    
    def get_avatar_url(self, obj):
        # Return user avatar URL if available
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return self.context['request'].build_absolute_uri(obj.profile.avatar.url)
        return None
    
    def get_is_online(self, obj):
        # Check if user is online (you can implement this based on your logic)
        return False  # Placeholder


class MessageReactionSerializer(serializers.ModelSerializer):
    """Serializer for message reactions"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = MessageReaction
        fields = ['id', 'reaction_type', 'user', 'created_at']
        read_only_fields = ['id', 'created_at']


class MessageReactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating message reactions"""
    class Meta:
        model = MessageReaction
        fields = ['reaction_type']


class MessageSerializer(serializers.ModelSerializer):
    """Enhanced message serializer with reactions and read status"""
    sender = UserBasicSerializer(read_only=True)
    reactions = MessageReactionSerializer(many=True, read_only=True)
    reaction_counts = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()
    read_by_users = UserBasicSerializer(source='read_by', many=True, read_only=True)
    reply_to_message = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'content', 'message_type',
            'created_at', 'updated_at', 'is_edited', 'edited_at',
            'is_deleted', 'deleted_at', 'reply_to', 'reply_to_message',
            'reactions', 'reaction_counts', 'is_read', 'read_by_users',
            'image', 'image_url', 'file', 'file_url', 'file_name', 'file_size',
            'latitude', 'longitude', 'location_name'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'is_edited', 'edited_at',
            'is_deleted', 'deleted_at'
        ]
    
    def get_reaction_counts(self, obj):
        """Get reaction counts grouped by type"""
        if not hasattr(obj, '_reaction_counts'):
            reactions = obj.reactions.values('reaction_type').annotate(
                count=Count('id')
            ).order_by('-count')
            obj._reaction_counts = {r['reaction_type']: r['count'] for r in reactions}
        return obj._reaction_counts
    
    def get_is_read(self, obj):
        """Check if current user has read this message"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.read_by.filter(id=request.user.id).exists()
        return False
    
    def get_reply_to_message(self, obj):
        """Get basic info about the message being replied to"""
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'content': obj.reply_to.content[:100] + ('...' if len(obj.reply_to.content) > 100 else ''),
                'sender': obj.reply_to.sender.name or obj.reply_to.sender.email.split('@')[0],
                'message_type': obj.reply_to.message_type
            }
        return None
    
    def get_file_url(self, obj):
        """Get absolute URL for file attachment"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
    
    def get_image_url(self, obj):
        """Get absolute URL for image attachment"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    class Meta:
        model = Message
        fields = [
            'content', 'message_type', 'reply_to', 'image', 'file',
            'file_name', 'latitude', 'longitude', 'location_name'
        ]
    
    def validate_content(self, value):
        """Validate message content"""
        if not value.strip() and self.initial_data.get('message_type') == 'TEXT':
            raise serializers.ValidationError("Text messages cannot be empty.")
        return value.strip()
    
    def validate_reply_to(self, value):
        """Validate reply_to message belongs to same conversation"""
        if value:
            conversation_id = self.context.get('conversation_id')
            if value.conversation.id != conversation_id:
                raise serializers.ValidationError("Cannot reply to message from different conversation.")
        return value


class ConversationMemberSerializer(serializers.ModelSerializer):
    """Serializer for conversation members"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = ConversationMember
        fields = [
            'id', 'user', 'can_add_members', 'can_remove_members',
            'can_edit_conversation', 'is_muted', 'is_blocked',
            'joined_at', 'left_at', 'last_read_at'
        ]
        read_only_fields = ['id', 'joined_at', 'left_at']


class ConversationSerializer(serializers.ModelSerializer):
    """Enhanced conversation serializer with optimizations"""
    participants = UserBasicSerializer(many=True, read_only=True)
    admin = UserBasicSerializer(read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    message_count = serializers.IntegerField(read_only=True)
    my_membership = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'title', 'description', 'is_group', 'admin', 'participants',
            'avatar', 'avatar_url', 'is_archived', 'is_muted',
            'related_object_type', 'related_object_id',
            'last_message', 'unread_count', 'message_count', 'my_membership',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'message_count']
    
    def get_unread_count(self, obj):
        """Get unread message count for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_unread_count_for_user(request.user)
        return 0
    
    def get_my_membership(self, obj):
        """Get current user's membership details"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                membership = ConversationMember.objects.get(
                    conversation=obj,
                    user=request.user
                )
                return ConversationMemberSerializer(membership).data
            except ConversationMember.DoesNotExist:
                return None
        return None
    
    def get_avatar_url(self, obj):
        """Get conversation avatar URL"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
        return None


class ConversationListSerializer(serializers.ModelSerializer):
    """Optimized serializer for conversation list"""
    participants_count = serializers.IntegerField(read_only=True)
    last_message_preview = serializers.SerializerMethodField()
    last_message_time = serializers.DateTimeField(source='updated_at', read_only=True)
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'title', 'is_group', 'participants_count',
            'avatar_url', 'is_archived', 'is_muted',
            'last_message_preview', 'last_message_time', 'unread_count',
            'other_participant'
        ]
    
    def get_last_message_preview(self, obj):
        """Get preview of last message"""
        if hasattr(obj, 'latest_messages') and obj.latest_messages:
            message = obj.latest_messages[0]
            sender_name = message.sender.name or message.sender.email.split('@')[0]
            
            if message.message_type == 'TEXT':
                content = message.content[:50] + ('...' if len(message.content) > 50 else '')
            elif message.message_type == 'IMAGE':
                content = '📷 Image'
            elif message.message_type == 'FILE':
                content = f'📎 {message.file_name or "File"}'
            else:
                content = f'{message.message_type.title()} message'
            
            return {
                'sender_name': sender_name,
                'content': content,
                'created_at': message.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        """Get unread count for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_unread_count_for_user(request.user)
        return 0
    
    def get_other_participant(self, obj):
        """For direct conversations, get the other participant"""
        if not obj.is_group:
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                other_participants = obj.participants.exclude(id=request.user.id)
                if other_participants.exists():
                    return UserBasicSerializer(other_participants.first(), context=self.context).data
        return None
    
    def get_avatar_url(self, obj):
        """Get conversation avatar URL"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
        elif not obj.is_group:
            # For direct conversations, use other participant's avatar
            other_participant = self.get_other_participant(obj)
            if other_participant:
                return other_participant.get('avatar_url')
        return None


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating conversations"""
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Conversation
        fields = [
            'title', 'description', 'is_group', 'avatar',
            'participant_ids'
        ]
    
    def validate_participant_ids(self, value):
        """Validate participant IDs"""
        if len(value) < 1:
            raise serializers.ValidationError("At least one participant is required.")
        
        # Check if users exist
        existing_users = User.objects.filter(id__in=value).values_list('id', flat=True)
        missing_users = set(value) - set(existing_users)
        
        if missing_users:
            raise serializers.ValidationError(f"Users with IDs {list(missing_users)} do not exist.")
        
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        if attrs.get('is_group', False):
            if len(attrs['participant_ids']) < 2:
                raise serializers.ValidationError("Group conversations require at least 2 participants.")
            if not attrs.get('title'):
                raise serializers.ValidationError("Group conversations require a title.")
        else:
            if len(attrs['participant_ids']) != 1:
                raise serializers.ValidationError("Direct conversations require exactly 1 other participant.")
        
        return attrs
    
    def create(self, validated_data):
        """Create conversation with participants"""
        participant_ids = validated_data.pop('participant_ids')
        request = self.context['request']
        
        # Create conversation
        conversation = Conversation.objects.create(**validated_data)
        
        # Add participants
        participants = User.objects.filter(id__in=participant_ids)
        conversation.participants.set(participants)
        
        # Add creator if not already included
        if request.user not in participants:
            conversation.participants.add(request.user)
        
        # Create membership records
        all_participants = list(participants) + [request.user]
        for participant in set(all_participants):
            ConversationMember.objects.create(
                conversation=conversation,
                user=participant,
                can_add_members=(participant == request.user and conversation.is_group),
                can_remove_members=(participant == request.user and conversation.is_group),
                can_edit_conversation=(participant == request.user and conversation.is_group)
            )
        
        # Set admin for group conversations
        if conversation.is_group:
            conversation.admin = request.user
            conversation.save(update_fields=['admin'])
        
        return conversation


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        ref_name = 'MessagingNotification'  # Fix Swagger conflict
        fields = [
            'id', 'notification_type', 'title', 'content', 'read',
            'related_object_id', 'related_object_type',
            'created_at', 'time_ago'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} days ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hours ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minutes ago"
        else:
            return "Just now"
