from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import TimeStampedModel
from django.core.cache import cache
from django.core.cache import cache


class Conversation(TimeStampedModel):
    """Enhanced conversation between multiple users with better features"""
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations'
    )
    title = models.CharField(max_length=255, blank=True, db_index=True)
    
    # Enhanced features
    is_group = models.BooleanField(default=False, db_index=True, help_text="Is this a group conversation?")
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='administered_conversations',
        help_text="Group admin (for group conversations)"
    )
    description = models.TextField(blank=True, help_text="Group description")
    avatar = models.ImageField(upload_to='conversation_avatars/', blank=True, null=True)
    
    # Privacy settings
    is_archived = models.BooleanField(default=False, db_index=True)
    is_muted = models.BooleanField(default=False, db_index=True)
    
    # Related objects (for context-based conversations)
    related_object_type = models.CharField(max_length=50, blank=True, db_index=True, help_text="E.g., 'servicerequest', 'appointment'")
    related_object_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    
    # Performance optimization
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    message_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['related_object_type', 'related_object_id']),
            models.Index(fields=['-updated_at']),
            models.Index(fields=['is_group', '-updated_at']),
            models.Index(fields=['is_archived', '-updated_at']),
            models.Index(fields=['-last_message_at']),
        ]
    
    def __str__(self):
        if self.title:
            return self.title
        participants = self.participants.all()[:3]
        names = [p.name or p.email.split('@')[0] for p in participants]
        if self.participants.count() > 3:
            return f"{', '.join(names)} and {self.participants.count() - 3} others"
        return ', '.join(names)
    
    @property
    def last_message(self):
        """Get last message with caching"""
        cache_key = f"conversation_{self.id}_last_message"
        message = cache.get(cache_key)
        if message is None:
            message = self.messages.select_related('sender').order_by('-created_at').first()
            if message:
                cache.set(cache_key, message, 300)  # 5 minutes cache
        return message
    
    @property
    def unread_count(self):
        """Get unread message count for current user"""
        # This will be set per user in the API view
        return getattr(self, '_unread_count', 0)
    
    def get_unread_count_for_user(self, user):
        """Get unread message count for specific user with caching"""
        cache_key = f"conversation_{self.id}_unread_count_{user.id}"
        count = cache.get(cache_key)
        if count is None:
            count = self.messages.exclude(
                models.Q(sender=user) | models.Q(read_by=user)
            ).count()
            cache.set(cache_key, count, 60)  # 1 minute cache
        return count
    
    def mark_all_read_for_user(self, user):
        """Mark all messages as read for a specific user"""
        unread_messages = self.messages.exclude(
            models.Q(sender=user) | models.Q(read_by=user)
        )
        for message in unread_messages:
            message.read_by.add(user)
        
        # Clear cache
        cache_key = f"conversation_{self.id}_unread_count_{user.id}"
        cache.delete(cache_key)
    
    def update_last_message_time(self):
        """Update last message timestamp and count"""
        self.last_message_at = timezone.now()
        self.message_count = self.messages.count()
        self.save(update_fields=['last_message_at', 'message_count', 'updated_at'])
        
        # Clear cache
        cache_key = f"conversation_{self.id}_last_message"
        cache.delete(cache_key)


class Message(TimeStampedModel):
    """Enhanced message with attachments, reactions, and better features"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    read_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='read_messages',
        blank=True
    )
    
    # Enhanced features
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('TEXT', 'Text'),
            ('IMAGE', 'Image'),
            ('FILE', 'File'),
            ('LOCATION', 'Location'),
            ('SYSTEM', 'System Message'),
        ],
        default='TEXT'
    )
    
    # Attachments
    image = models.ImageField(upload_to='message_images/', blank=True, null=True)
    file = models.FileField(upload_to='message_files/', blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text="File size in bytes")
    
    # Location data
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_name = models.CharField(max_length=255, blank=True)
    
    # Message states
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Reply to message
    reply_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='replies'
    )
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
        ]
    
    def __str__(self):
        sender_name = self.sender.name or self.sender.email.split('@')[0]
        content_preview = self.content[:50] + '...' if len(self.content) > 50 else self.content
        return f"{sender_name}: {content_preview}"
    
    @property
    def is_read_by_all(self):
        """Check if message has been read by all participants except sender"""
        participants = self.conversation.participants.exclude(id=self.sender.id)
        return all(participant in self.read_by.all() for participant in participants)
    
    def mark_as_read_by(self, user):
        """Mark message as read by specific user"""
        if user != self.sender:
            self.read_by.add(user)
    
    def edit_content(self, new_content):
        """Edit message content"""
        self.content = new_content
        self.is_edited = True
        self.edited_at = timezone.now()
        self.save(update_fields=['content', 'is_edited', 'edited_at'])
    
    def soft_delete(self):
        """Soft delete message"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])


class MessageReaction(TimeStampedModel):
    """Reactions to messages (like, love, etc.)"""
    REACTION_TYPES = [
        ('👍', 'Thumbs Up'),
        ('❤️', 'Love'),
        ('😂', 'Laugh'),
        ('😮', 'Wow'),
        ('😢', 'Sad'),
        ('😠', 'Angry'),
    ]
    
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='reactions'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='message_reactions'
    )
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES)
    
    class Meta:
        unique_together = ['message', 'user']  # One reaction per user per message
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.name} reacted {self.reaction_type} to message {self.message.id}"


class ConversationMember(TimeStampedModel):
    """Enhanced conversation membership with more control"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversation_memberships'
    )
    
    # Member permissions
    can_add_members = models.BooleanField(default=False)
    can_remove_members = models.BooleanField(default=False)
    can_edit_conversation = models.BooleanField(default=False)
    
    # Member status
    is_muted = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)
    joined_at = models.DateTimeField(default=timezone.now)
    left_at = models.DateTimeField(null=True, blank=True)
    
    # Last read tracking
    last_read_at = models.DateTimeField(default=timezone.now)
    last_read_message = models.ForeignKey(
        Message,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='last_read_by'
    )
    
    class Meta:
        unique_together = ['conversation', 'user']
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.user.name} in {self.conversation}"
    
    def mark_conversation_read(self, message=None):
        """Mark conversation as read up to specific message"""
        self.last_read_at = timezone.now()
        if message:
            self.last_read_message = message
        else:
            self.last_read_message = self.conversation.last_message
        self.save(update_fields=['last_read_at', 'last_read_message'])


# Keep original Notification model for backwards compatibility
class Notification(TimeStampedModel):
    """System notification for a user"""
    NOTIFICATION_TYPES = (
        ('MESSAGE', 'New Message'),
        ('REVIEW', 'New Review'),
        ('PAYMENT', 'Payment Update'),
        ('SYSTEM', 'System Notification'),
        ('APPOINTMENT', 'Appointment Update'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='messaging_notifications'
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    content = models.TextField()
    read = models.BooleanField(default=False)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} notification for {self.user.email}"
