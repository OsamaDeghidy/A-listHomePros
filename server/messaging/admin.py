from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count, Q, Exists, OuterRef, Prefetch, Max
from django.urls import reverse
from django.utils.safestring import mark_safe
import json

from .models import Conversation, Message, MessageReaction, ConversationMember


class ConversationMemberInline(admin.TabularInline):
    """Inline for conversation members"""
    model = ConversationMember
    extra = 0
    readonly_fields = ['joined_at', 'left_at', 'last_read_at']
    fields = [
        'user', 'can_add_members', 'can_remove_members', 'can_edit_conversation',
        'is_muted', 'is_blocked', 'joined_at', 'left_at', 'last_read_at'
    ]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


class MessageInline(admin.TabularInline):
    """Inline for recent messages"""
    model = Message
    extra = 0
    readonly_fields = ['created_at', 'updated_at', 'reaction_count', 'read_count', 'content_preview']
    fields = ['sender', 'content_preview', 'message_type', 'created_at', 'reaction_count', 'read_count']
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        # Fix: Get the queryset first, then apply select_related and prefetch_related, then slice
        qs = super().get_queryset(request)
        qs = qs.select_related('sender').prefetch_related('reactions', 'read_by')
        qs = qs.order_by('-created_at')
        return qs
    
    def has_add_permission(self, request, obj=None):
        return False  # Disable adding through inline to show only recent messages
    
    def content_preview(self, obj):
        if obj.message_type == 'TEXT':
            return obj.content[:100] + ('...' if len(obj.content) > 100 else '')
        elif obj.message_type == 'IMAGE':
            return '📷 Image Message'
        elif obj.message_type == 'FILE':
            return '📎 File: {}'.format(obj.file_name or "Unknown")
        else:
            return '{} Message'.format(obj.message_type)
    content_preview.short_description = 'Content Preview'
    
    def reaction_count(self, obj):
        return obj.reactions.count()
    reaction_count.short_description = 'Reactions'
    
    def read_count(self, obj):
        return obj.read_by.count()
    read_count.short_description = 'Read By'


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'title_display', 'conversation_type', 'participant_count', 
        'total_messages', 'last_activity', 'admin_user', 'status_flags', 'created_at'
    ]
    list_filter = [
        'is_group', 'is_archived', 'is_muted', 'created_at', 'updated_at',
        'related_object_type'
    ]
    search_fields = [
        'title', 'description', 'participants__name', 'participants__email',
        'admin__name', 'admin__email'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'participant_list', 'message_statistics',
        'last_message_info', 'conversation_analytics'
    ]
    filter_horizontal = ['participants']
    inlines = [ConversationMemberInline, MessageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'is_group', 'admin')
        }),
        ('Participants', {
            'fields': ('participants', 'participant_list'),
            'classes': ('wide',),
        }),
        ('Settings', {
            'fields': ('is_archived', 'is_muted'),
            'classes': ('collapse',),
        }),
        ('Related Object', {
            'fields': ('related_object_type', 'related_object_id'),
            'classes': ('collapse',),
        }),
        ('Media', {
            'fields': ('avatar',),
            'classes': ('collapse',),
        }),
        ('Statistics', {
            'fields': ('message_statistics', 'conversation_analytics'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_message_info'),
            'classes': ('collapse',),
        }),
    )
    
    actions = ['archive_conversations', 'unarchive_conversations', 'export_conversation_data']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('admin').prefetch_related(
            'participants'
        ).annotate(
            participant_count_calc=Count('participants'),
            last_message_time=Max('messages__created_at')
        )
    
    def title_display(self, obj):
        if obj.title:
            icon = '👥' if obj.is_group else '💬'
            return format_html('{} {}', icon, obj.title)
        else:
            participants = list(obj.participants.all()[:3])
            names = [p.name or p.email.split('@')[0] for p in participants]
            participant_count = obj.participants.count()
            if participant_count > 3:
                title = "{} and {} others".format(', '.join(names), participant_count - 3)
            else:
                title = ', '.join(names)
            return format_html('💬 {}', title)
    title_display.short_description = 'Conversation'
    title_display.admin_order_field = 'title'
    
    def conversation_type(self, obj):
        if obj.is_group:
            return format_html('<span style="color: blue;">👥 Group</span>')
        else:
            return format_html('<span style="color: green;">💬 Direct</span>')
    conversation_type.short_description = 'Type'
    
    def participant_count(self, obj):
        count = getattr(obj, 'participant_count_calc', obj.participants.count())
        return format_html('<strong>{}</strong> participants', count)
    participant_count.short_description = 'Participants'
    participant_count.admin_order_field = 'participant_count_calc'
    
    def total_messages(self, obj):
        # Use the model field message_count if available, otherwise count
        count = obj.message_count if hasattr(obj, 'message_count') else obj.messages.count()
        return format_html('<strong>{}</strong> messages', count)
    total_messages.short_description = 'Messages'
    total_messages.admin_order_field = 'message_count'
    
    def last_activity(self, obj):
        last_message_time = getattr(obj, 'last_message_time', None) or obj.last_message_at
        if last_message_time:
            time_diff = timezone.now() - last_message_time
            if time_diff.days > 0:
                return format_html('<span style="color: gray;">{} days ago</span>', time_diff.days)
            elif time_diff.seconds > 3600:
                hours = time_diff.seconds // 3600
                return format_html('<span style="color: orange;">{} hours ago</span>', hours)
            else:
                minutes = time_diff.seconds // 60
                return format_html('<span style="color: green;">{} minutes ago</span>', minutes)
        return format_html('<span style="color: red;">No messages</span>')
    last_activity.short_description = 'Last Activity'
    last_activity.admin_order_field = 'last_message_time'
    
    def admin_user(self, obj):
        if obj.admin:
            return format_html('👑 {}', obj.admin.name or obj.admin.email)
        return '-'
    admin_user.short_description = 'Admin'
    
    def status_flags(self, obj):
        flags = []
        if obj.is_archived:
            flags.append('<span style="background: gray; color: white; padding: 2px 6px; border-radius: 3px;">📦 Archived</span>')
        if obj.is_muted:
            flags.append('<span style="background: orange; color: white; padding: 2px 6px; border-radius: 3px;">🔇 Muted</span>')
        if obj.related_object_type:
            flags.append('<span style="background: blue; color: white; padding: 2px 6px; border-radius: 3px;">🔗 {}</span>'.format(obj.related_object_type))
        
        return mark_safe(' '.join(flags)) if flags else '-'
    status_flags.short_description = 'Status'
    
    def participant_list(self, obj):
        participants = list(obj.participants.all())
        participant_html = []
        for participant in participants:
            admin_badge = '👑' if participant == obj.admin else ''
            participant_html.append(
                '<div style="margin: 2px 0;">{} {}</div>'.format(admin_badge, participant.name or participant.email)
            )
        return mark_safe(''.join(participant_html))
    participant_list.short_description = 'Participant List'
    
    def message_statistics(self, obj):
        stats = {
            'Total Messages': obj.messages.count(),
            'Text Messages': obj.messages.filter(message_type='TEXT').count(),
            'Image Messages': obj.messages.filter(message_type='IMAGE').count(),
            'File Messages': obj.messages.filter(message_type='FILE').count(),
            'System Messages': obj.messages.filter(message_type='SYSTEM').count(),
        }
        
        stats_html = []
        for key, value in stats.items():
            stats_html.append('<div><strong>{}:</strong> {}</div>'.format(key, value))
        
        return mark_safe(''.join(stats_html))
    message_statistics.short_description = 'Message Statistics'
    
    def last_message_info(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return format_html(
                '<div><strong>From:</strong> {}</div>'
                '<div><strong>Content:</strong> {}</div>'
                '<div><strong>Time:</strong> {}</div>',
                last_message.sender.name if last_message.sender else 'System',
                last_message.content[:50] + ('...' if len(last_message.content) > 50 else ''),
                last_message.created_at.strftime('%Y-%m-%d %H:%M')
            )
        return 'No messages yet'
    last_message_info.short_description = 'Last Message'
    
    def conversation_analytics(self, obj):
        # Most active participants
        participant_stats = obj.messages.values('sender__name', 'sender__email').annotate(
            message_count=Count('id')
        ).order_by('-message_count')[:5]
        
        analytics_html = ['<div><strong>Most Active Participants:</strong></div>']
        for stat in participant_stats:
            name = stat['sender__name'] or stat['sender__email']
            analytics_html.append('<div>• {}: {} messages</div>'.format(name, stat["message_count"]))
        
        return mark_safe(''.join(analytics_html))
    conversation_analytics.short_description = 'Analytics'
    
    def archive_conversations(self, request, queryset):
        updated = queryset.update(is_archived=True)
        self.message_user(request, '{} conversations archived successfully.'.format(updated))
    archive_conversations.short_description = 'Archive selected conversations'
    
    def unarchive_conversations(self, request, queryset):
        updated = queryset.update(is_archived=False)
        self.message_user(request, '{} conversations unarchived successfully.'.format(updated))
    unarchive_conversations.short_description = 'Unarchive selected conversations'
    
    def export_conversation_data(self, request, queryset):
        # This would export conversation data - placeholder for now
        self.message_user(request, 'Export feature coming soon for {} conversations.'.format(queryset.count()))
    export_conversation_data.short_description = 'Export conversation data'


class MessageReactionInline(admin.TabularInline):
    """Inline for message reactions"""
    model = MessageReaction
    extra = 0
    readonly_fields = ['created_at']
    fields = ['user', 'reaction_type', 'created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'conversation_link', 'sender_info', 'content_preview', 
        'message_type_badge', 'reaction_summary', 'read_status', 'message_flags', 'created_at'
    ]
    list_filter = [
        'message_type', 'is_edited', 'is_deleted', 'created_at',
        'conversation__is_group'
    ]
    search_fields = [
        'content', 'sender__name', 'sender__email', 
        'conversation__title', 'file_name'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'edited_at', 'deleted_at',
        'reaction_breakdown', 'read_by_list', 'message_analytics'
    ]
    inlines = [MessageReactionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('conversation', 'sender', 'content', 'message_type')
        }),
        ('Reply Information', {
            'fields': ('reply_to',),
            'classes': ('collapse',),
        }),
        ('Attachments', {
            'fields': ('image', 'file', 'file_name', 'file_size'),
            'classes': ('collapse',),
        }),
        ('Location Data', {
            'fields': ('latitude', 'longitude', 'location_name'),
            'classes': ('collapse',),
        }),
        ('Status', {
            'fields': ('is_edited', 'edited_at', 'is_deleted', 'deleted_at'),
            'classes': ('collapse',),
        }),
        ('Engagement', {
            'fields': ('reaction_breakdown', 'read_by_list'),
            'classes': ('collapse',),
        }),
        ('Analytics', {
            'fields': ('message_analytics',),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    actions = ['mark_as_read_by_all', 'soft_delete_messages', 'export_messages']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'conversation', 'sender', 'reply_to'
        ).prefetch_related('reactions', 'read_by')
    
    def conversation_link(self, obj):
        url = reverse('admin:messaging_conversation_change', args=[obj.conversation.id])
        return format_html('<a href="{}">{}</a>', url, str(obj.conversation))
    conversation_link.short_description = 'Conversation'
    
    def sender_info(self, obj):
        if obj.sender:
            return format_html(
                '<div><strong>{}</strong></div><small>{}</small>',
                obj.sender.name or 'Unknown',
                obj.sender.email
            )
        return format_html('<span style="color: gray;">System</span>')
    sender_info.short_description = 'Sender'
    
    def content_preview(self, obj):
        if obj.is_deleted:
            return format_html('<span style="color: red; font-style: italic;">🗑️ Message deleted</span>')
        
        if obj.message_type == 'TEXT':
            content = obj.content[:100] + ('...' if len(obj.content) > 100 else '')
            if obj.is_edited:
                content += ' ✏️'
            return content
        elif obj.message_type == 'IMAGE':
            if obj.image:
                return format_html('📷 <a href="{}" target="_blank">View Image</a>', obj.image.url)
            return '📷 Image Message'
        elif obj.message_type == 'FILE':
            if obj.file:
                return format_html('📎 <a href="{}" target="_blank">{}</a>', 
                                 obj.file.url, obj.file_name or 'Download File')
            return '📎 File: {}'.format(obj.file_name or "Unknown")
        elif obj.message_type == 'LOCATION':
            if obj.latitude and obj.longitude:
                return format_html('📍 <a href="https://maps.google.com/?q={},{}" target="_blank">{}</a>',
                                 obj.latitude, obj.longitude, obj.location_name or 'View Location')
            return '📍 Location Message'
        elif obj.message_type == 'SYSTEM':
            return format_html('<span style="color: blue; font-style: italic;">🤖 {}</span>', obj.content)
        else:
            return '{} Message'.format(obj.message_type)
    content_preview.short_description = 'Content'
    
    def message_type_badge(self, obj):
        badges = {
            'TEXT': ('<span style="background: green; color: white; padding: 2px 6px; border-radius: 3px;">💬 Text</span>', 'green'),
            'IMAGE': ('<span style="background: blue; color: white; padding: 2px 6px; border-radius: 3px;">📷 Image</span>', 'blue'),
            'FILE': ('<span style="background: orange; color: white; padding: 2px 6px; border-radius: 3px;">📎 File</span>', 'orange'),
            'LOCATION': ('<span style="background: purple; color: white; padding: 2px 6px; border-radius: 3px;">📍 Location</span>', 'purple'),
            'SYSTEM': ('<span style="background: gray; color: white; padding: 2px 6px; border-radius: 3px;">🤖 System</span>', 'gray'),
            'QUOTE': ('<span style="background: teal; color: white; padding: 2px 6px; border-radius: 3px;">💬 Quote</span>', 'teal'),
        }
        badge, _ = badges.get(obj.message_type, ('Unknown', 'black'))
        return format_html(badge)
    message_type_badge.short_description = 'Type'
    
    def reaction_summary(self, obj):
        reactions = obj.reactions.values('reaction_type').annotate(count=Count('id'))
        if reactions:
            reaction_html = []
            for reaction in reactions:
                reaction_html.append('{} {}'.format(reaction["reaction_type"], reaction["count"]))
            return format_html(' '.join(reaction_html))
        return '-'
    reaction_summary.short_description = 'Reactions'
    
    def read_status(self, obj):
        total_participants = obj.conversation.participants.count()
        read_count = obj.read_by.count()
        
        if obj.sender:
            # Exclude sender from participants count
            participants_excluding_sender = total_participants - 1
            if participants_excluding_sender == 0:
                return format_html('<span style="color: gray;">No other participants</span>')
            
            read_percentage = (read_count / total_participants) * 100 if total_participants > 0 else 0
            
            if read_count == 0:
                return format_html('<span style="color: red;">👁️ Unread by all</span>')
            elif read_count == participants_excluding_sender:
                return format_html('<span style="color: green;">👁️ Read by all</span>')
            else:
                return format_html('<span style="color: orange;">👁️ Read by {}/{} ({}%)</span>', 
                                 read_count, participants_excluding_sender, int(read_percentage))
        else:
            # System message
            return format_html('<span style="color: gray;">System message</span>')
    read_status.short_description = 'Read Status'
    
    def message_flags(self, obj):
        flags = []
        if obj.is_edited:
            flags.append('<span style="background: blue; color: white; padding: 2px 6px; border-radius: 3px;">✏️ Edited</span>')
        if obj.is_deleted:
            flags.append('<span style="background: red; color: white; padding: 2px 6px; border-radius: 3px;">🗑️ Deleted</span>')
        if obj.reply_to:
            flags.append('<span style="background: purple; color: white; padding: 2px 6px; border-radius: 3px;">↩️ Reply</span>')
        
        return mark_safe(' '.join(flags)) if flags else '-'
    message_flags.short_description = 'Flags'
    
    def reaction_breakdown(self, obj):
        reactions = obj.reactions.select_related('user').order_by('-created_at')
        if reactions:
            reaction_html = ['<div><strong>Reactions:</strong></div>']
            for reaction in reactions:
                user_name = reaction.user.name or reaction.user.email
                reaction_html.append('<div>• {} by {}</div>'.format(reaction.reaction_type, user_name))
            return mark_safe(''.join(reaction_html))
        return 'No reactions'
    reaction_breakdown.short_description = 'Reaction Breakdown'
    
    def read_by_list(self, obj):
        readers = list(obj.read_by.all())
        if readers:
            reader_html = ['<div><strong>Read by:</strong></div>']
            for reader in readers:
                reader_name = reader.name or reader.email
                reader_html.append('<div>• {}</div>'.format(reader_name))
            return mark_safe(''.join(reader_html))
        return 'Not read by anyone'
    read_by_list.short_description = 'Read By'
    
    def message_analytics(self, obj):
        analytics_html = [
            '<div><strong>Character Count:</strong> {}</div>'.format(len(obj.content)),
            '<div><strong>Word Count:</strong> {}</div>'.format(len(obj.content.split())),
        ]
        
        if obj.file_size:
            analytics_html.append('<div><strong>File Size:</strong> {} bytes</div>'.format(obj.file_size))
        
        return mark_safe(''.join(analytics_html))
    message_analytics.short_description = 'Analytics'
    
    def mark_as_read_by_all(self, request, queryset):
        total_marked = 0
        for message in queryset:
            participants = message.conversation.participants.exclude(id=message.sender.id if message.sender else None)
            for participant in participants:
                message.read_by.add(participant)
            total_marked += 1
        self.message_user(request, '{} messages marked as read by all participants.'.format(total_marked))
    mark_as_read_by_all.short_description = 'Mark as read by all participants'
    
    def soft_delete_messages(self, request, queryset):
        updated = queryset.update(is_deleted=True, deleted_at=timezone.now())
        self.message_user(request, '{} messages soft deleted successfully.'.format(updated))
    soft_delete_messages.short_description = 'Soft delete selected messages'


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'message_info', 'user_info', 'reaction_emoji', 'created_at']
    list_filter = ['reaction_type', 'created_at', 'message__message_type']
    search_fields = [
        'user__name', 'user__email', 'message__content',
        'message__conversation__title'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'message__conversation', 'message__sender'
        )
    
    def message_info(self, obj):
        content_preview = obj.message.content[:50] + ('...' if len(obj.message.content) > 50 else '')
        url = reverse('admin:messaging_message_change', args=[obj.message.id])
        return format_html(
            '<a href="{}">Message #{}</a><br/><small>{}</small>',
            url, obj.message.id, content_preview
        )
    message_info.short_description = 'Message'
    
    def user_info(self, obj):
        url = reverse('admin:users_customuser_change', args=[obj.user.id])
        return format_html(
            '<a href="{}">{}</a><br/><small>{}</small>',
            url, obj.user.name or 'Unknown', obj.user.email
        )
    user_info.short_description = 'User'
    
    def reaction_emoji(self, obj):
        return format_html(
            '<span style="font-size: 20px;">{}</span>',
            obj.reaction_type
        )
    reaction_emoji.short_description = 'Reaction'


@admin.register(ConversationMember)
class ConversationMemberAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'conversation_info', 'user_info', 'member_permissions', 
        'member_status', 'activity_info', 'joined_at'
    ]
    list_filter = [
        'can_add_members', 'can_remove_members', 'can_edit_conversation',
        'is_muted', 'is_blocked', 'joined_at'
    ]
    search_fields = [
        'user__name', 'user__email', 'conversation__title'
    ]
    readonly_fields = ['joined_at', 'left_at', 'last_read_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'conversation'
        )
    
    def conversation_info(self, obj):
        url = reverse('admin:messaging_conversation_change', args=[obj.conversation.id])
        return format_html(
            '<a href="{}">{}</a><br/><small>{} participants</small>',
            url, str(obj.conversation), obj.conversation.participants.count()
        )
    conversation_info.short_description = 'Conversation'
    
    def user_info(self, obj):
        url = reverse('admin:users_customuser_change', args=[obj.user.id])
        admin_badge = '👑' if obj.conversation.admin == obj.user else ''
        return format_html(
            '<a href="{}">{} {}</a><br/><small>{}</small>',
            url, admin_badge, obj.user.name or 'Unknown', obj.user.email
        )
    user_info.short_description = 'User'
    
    def member_permissions(self, obj):
        permissions = []
        if obj.can_add_members:
            permissions.append('Add Members')
        if obj.can_remove_members:
            permissions.append('Remove Members')
        if obj.can_edit_conversation:
            permissions.append('Edit Conversation')
        
        return ', '.join(permissions) if permissions else 'No special permissions'
    member_permissions.short_description = 'Permissions'
    
    def member_status(self, obj):
        status = []
        if obj.is_muted:
            status.append('<span style="background: orange; color: white; padding: 2px 6px; border-radius: 3px;">🔇 Muted</span>')
        if obj.is_blocked:
            status.append('<span style="background: red; color: white; padding: 2px 6px; border-radius: 3px;">🚫 Blocked</span>')
        if obj.left_at:
            status.append('<span style="background: gray; color: white; padding: 2px 6px; border-radius: 3px;">👋 Left</span>')
        
        return mark_safe(' '.join(status)) if status else format_html('<span style="color: green;">✅ Active</span>')
    member_status.short_description = 'Status'
    
    def activity_info(self, obj):
        info_html = ['<div><strong>Joined:</strong> {}</div>'.format(obj.joined_at.strftime("%Y-%m-%d %H:%M"))]
        
        if obj.last_read_at:
            info_html.append('<div><strong>Last Read:</strong> {}</div>'.format(obj.last_read_at.strftime("%Y-%m-%d %H:%M")))
        
        if obj.left_at:
            info_html.append('<div><strong>Left:</strong> {}</div>'.format(obj.left_at.strftime("%Y-%m-%d %H:%M")))
        
        return mark_safe(''.join(info_html))
    activity_info.short_description = 'Activity'
