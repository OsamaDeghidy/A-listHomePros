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
    readonly_fields = ['created_at', 'updated_at', 'reaction_count', 'read_count']
    fields = ['sender', 'content_preview', 'message_type', 'created_at', 'reaction_count', 'read_count']
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('sender').prefetch_related('reactions', 'read_by')[:10]
    
    def content_preview(self, obj):
        if obj.message_type == 'TEXT':
            return obj.content[:100] + ('...' if len(obj.content) > 100 else '')
        elif obj.message_type == 'IMAGE':
            return '📷 Image Message'
        elif obj.message_type == 'FILE':
            return f'📎 File: {obj.file_name or "Unknown"}'
        else:
            return f'{obj.message_type} Message'
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
            participants = obj.participants.all()[:3]
            names = [p.name or p.email.split('@')[0] for p in participants]
            if obj.participants.count() > 3:
                title = f"{', '.join(names)} and {obj.participants.count() - 3} others"
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
            flags.append(f'<span style="background: blue; color: white; padding: 2px 6px; border-radius: 3px;">🔗 {obj.related_object_type}</span>')
        
        return format_html(' '.join(flags)) if flags else '-'
    status_flags.short_description = 'Status'
    
    def participant_list(self, obj):
        participants = obj.participants.all()
        participant_html = []
        for participant in participants:
            admin_badge = '👑' if participant == obj.admin else ''
            participant_html.append(
                f'<div style="margin: 2px 0;">{admin_badge} {participant.name or participant.email}</div>'
            )
        return format_html(''.join(participant_html))
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
        for label, count in stats.items():
            stats_html.append(f'<div><strong>{label}:</strong> {count}</div>')
        
        return format_html(''.join(stats_html))
    message_statistics.short_description = 'Message Statistics'
    
    def last_message_info(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return format_html(
                '<div><strong>Sender:</strong> {}</div>'
                '<div><strong>Content:</strong> {}</div>'
                '<div><strong>Time:</strong> {}</div>',
                last_message.sender.name or last_message.sender.email,
                last_message.content[:100] + ('...' if len(last_message.content) > 100 else ''),
                last_message.created_at.strftime('%Y-%m-%d %H:%M:%S')
            )
        return 'No messages yet'
    last_message_info.short_description = 'Last Message'
    
    def conversation_analytics(self, obj):
        # Most active participants
        active_participants = obj.messages.values(
            'sender__name', 'sender__email'
        ).annotate(
            message_count=Count('id')
        ).order_by('-message_count')[:3]
        
        analytics_html = ['<div><strong>Most Active Participants:</strong></div>']
        for participant in active_participants:
            name = participant['sender__name'] or participant['sender__email'].split('@')[0]
            analytics_html.append(
                f'<div style="margin-left: 10px;">{name}: {participant["message_count"]} messages</div>'
            )
        
        return format_html(''.join(analytics_html))
    conversation_analytics.short_description = 'Analytics'
    
    # Actions
    def archive_conversations(self, request, queryset):
        updated = queryset.update(is_archived=True)
        self.message_user(request, f"Successfully archived {updated} conversations.")
    archive_conversations.short_description = "Archive selected conversations"
    
    def unarchive_conversations(self, request, queryset):
        updated = queryset.update(is_archived=False)
        self.message_user(request, f"Successfully unarchived {updated} conversations.")
    unarchive_conversations.short_description = "Unarchive selected conversations"
    
    def export_conversation_data(self, request, queryset):
        # This would export conversation data - placeholder for now
        self.message_user(request, f"Export functionality would be implemented here for {queryset.count()} conversations.")
    export_conversation_data.short_description = "Export conversation data"


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
        title = obj.conversation.title or f"Conversation {obj.conversation.id}"
        return format_html('<a href="{}">{}</a>', url, title)
    conversation_link.short_description = 'Conversation'
    
    def sender_info(self, obj):
        return format_html(
            '<div><strong>{}</strong></div><div style="color: gray; font-size: 11px;">{}</div>',
            obj.sender.name or obj.sender.email.split('@')[0],
            obj.sender.email
        )
    sender_info.short_description = 'Sender'
    
    def content_preview(self, obj):
        if obj.message_type == 'TEXT':
            content = obj.content[:80] + ('...' if len(obj.content) > 80 else '')
            return format_html('<div style="max-width: 300px;">{}</div>', content)
        elif obj.message_type == 'IMAGE':
            if obj.image:
                return format_html(
                    '📷 <a href="{}" target="_blank">View Image</a>',
                    obj.image.url
                )
            return '📷 Image Message'
        elif obj.message_type == 'FILE':
            if obj.file:
                return format_html(
                    '📎 <a href="{}" target="_blank">{}</a>',
                    obj.file.url,
                    obj.file_name or 'Download File'
                )
            return f'📎 File: {obj.file_name or "Unknown"}'
        elif obj.message_type == 'LOCATION':
            return format_html(
                '📍 Location: {}',
                obj.location_name or f'{obj.latitude}, {obj.longitude}'
            )
        else:
            return f'{obj.message_type} Message'
    content_preview.short_description = 'Content'
    
    def message_type_badge(self, obj):
        colors = {
            'TEXT': 'blue',
            'IMAGE': 'green',
            'FILE': 'orange',
            'LOCATION': 'purple',
            'SYSTEM': 'gray'
        }
        color = colors.get(obj.message_type, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">{}</span>',
            color,
            obj.message_type
        )
    message_type_badge.short_description = 'Type'
    
    def reaction_summary(self, obj):
        reactions = obj.reactions.values('reaction_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        if not reactions:
            return '-'
        
        reaction_html = []
        for reaction in reactions:
            reaction_html.append(f'{reaction["reaction_type"]} {reaction["count"]}')
        
        return format_html(' '.join(reaction_html))
    reaction_summary.short_description = 'Reactions'
    
    def read_status(self, obj):
        total_participants = obj.conversation.participants.count()
        read_count = obj.read_by.count()
        
        if obj.sender in obj.read_by.all():
            read_count -= 1  # Don't count sender
            total_participants -= 1
        
        if total_participants == 0:
            return 'No other participants'
        
        percentage = (read_count / total_participants) * 100
        
        if percentage == 100:
            color = 'green'
            icon = '✅'
        elif percentage >= 50:
            color = 'orange'
            icon = '👁️'
        else:
            color = 'red'
            icon = '📩'
        
        return format_html(
            '<span style="color: {};">{} {}/{} ({}%)</span>',
            color, icon, read_count, total_participants, int(percentage)
        )
    read_status.short_description = 'Read Status'
    
    def message_flags(self, obj):
        flags = []
        if obj.is_edited:
            flags.append('<span style="background: blue; color: white; padding: 1px 4px; border-radius: 2px; font-size: 10px;">EDITED</span>')
        if obj.is_deleted:
            flags.append('<span style="background: red; color: white; padding: 1px 4px; border-radius: 2px; font-size: 10px;">DELETED</span>')
        if obj.reply_to:
            flags.append('<span style="background: green; color: white; padding: 1px 4px; border-radius: 2px; font-size: 10px;">REPLY</span>')
        
        return format_html(' '.join(flags)) if flags else '-'
    message_flags.short_description = 'Flags'
    
    def reaction_breakdown(self, obj):
        reactions = obj.reactions.select_related('user')
        if not reactions:
            return 'No reactions'
        
        breakdown_html = []
        for reaction in reactions:
            user_name = reaction.user.name or reaction.user.email.split('@')[0]
            breakdown_html.append(
                f'<div>{reaction.reaction_type} {user_name} ({reaction.created_at.strftime("%m/%d %H:%M")})</div>'
            )
        
        return format_html(''.join(breakdown_html))
    reaction_breakdown.short_description = 'Reaction Breakdown'
    
    def read_by_list(self, obj):
        readers = obj.read_by.all()
        if not readers:
            return 'Unread by all'
        
        reader_html = []
        for reader in readers:
            user_name = reader.name or reader.email.split('@')[0]
            reader_html.append(f'<div>✓ {user_name}</div>')
        
        return format_html(''.join(reader_html))
    read_by_list.short_description = 'Read By'
    
    def message_analytics(self, obj):
        analytics = {
            'Character Count': len(obj.content),
            'Word Count': len(obj.content.split()) if obj.content else 0,
            'Reaction Count': obj.reactions.count(),
            'Reply Count': obj.replies.count() if hasattr(obj, 'replies') else 0,
        }
        
        analytics_html = []
        for label, value in analytics.items():
            analytics_html.append(f'<div><strong>{label}:</strong> {value}</div>')
        
        return format_html(''.join(analytics_html))
    message_analytics.short_description = 'Message Analytics'
    
    # Actions
    def mark_as_read_by_all(self, request, queryset):
        count = 0
        for message in queryset:
            participants = message.conversation.participants.exclude(id=message.sender.id)
            for participant in participants:
                message.read_by.add(participant)
            count += 1
        
        self.message_user(request, f"Marked {count} messages as read by all participants.")
    mark_as_read_by_all.short_description = "Mark as read by all participants"
    
    def soft_delete_messages(self, request, queryset):
        updated = queryset.update(
            is_deleted=True,
            deleted_at=timezone.now()
        )
        self.message_user(request, f"Soft deleted {updated} messages.")
    soft_delete_messages.short_description = "Soft delete selected messages"


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
            'message__conversation', 'message__sender', 'user'
        )
    
    def message_info(self, obj):
        return format_html(
            '<div><strong>Conversation:</strong> {}</div>'
            '<div><strong>Sender:</strong> {}</div>'
            '<div><strong>Content:</strong> {}</div>',
            obj.message.conversation.title or f"Conversation {obj.message.conversation.id}",
            obj.message.sender.name or obj.message.sender.email,
            obj.message.content[:50] + ('...' if len(obj.message.content) > 50 else '')
        )
    message_info.short_description = 'Message Info'
    
    def user_info(self, obj):
        return format_html(
            '<div><strong>{}</strong></div><div style="color: gray; font-size: 11px;">{}</div>',
            obj.user.name or obj.user.email.split('@')[0],
            obj.user.email
        )
    user_info.short_description = 'User'
    
    def reaction_emoji(self, obj):
        return format_html(
            '<span style="font-size: 24px;">{}</span>',
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
            'conversation', 'user', 'last_read_message'
        )
    
    def conversation_info(self, obj):
        url = reverse('admin:messaging_conversation_change', args=[obj.conversation.id])
        title = obj.conversation.title or f"Conversation {obj.conversation.id}"
        conv_type = "👥 Group" if obj.conversation.is_group else "💬 Direct"
        return format_html(
            '<div><a href="{}">{}</a></div><div style="color: gray; font-size: 11px;">{}</div>',
            url, title, conv_type
        )
    conversation_info.short_description = 'Conversation'
    
    def user_info(self, obj):
        admin_badge = '👑' if obj.conversation.admin == obj.user else ''
        return format_html(
            '<div>{} <strong>{}</strong></div><div style="color: gray; font-size: 11px;">{}</div>',
            admin_badge,
            obj.user.name or obj.user.email.split('@')[0],
            obj.user.email
        )
    user_info.short_description = 'User'
    
    def member_permissions(self, obj):
        permissions = []
        if obj.can_add_members:
            permissions.append('➕ Add')
        if obj.can_remove_members:
            permissions.append('➖ Remove')
        if obj.can_edit_conversation:
            permissions.append('✏️ Edit')
        
        return format_html(' | '.join(permissions)) if permissions else '👁️ View Only'
    member_permissions.short_description = 'Permissions'
    
    def member_status(self, obj):
        status = []
        if obj.left_at:
            status.append('<span style="color: red;">🚪 Left</span>')
        elif obj.is_blocked:
            status.append('<span style="color: red;">🚫 Blocked</span>')
        elif obj.is_muted:
            status.append('<span style="color: orange;">🔇 Muted</span>')
        else:
            status.append('<span style="color: green;">✅ Active</span>')
        
        return format_html(' '.join(status))
    member_status.short_description = 'Status'
    
    def activity_info(self, obj):
        if obj.last_read_at:
            time_diff = timezone.now() - obj.last_read_at
            if time_diff.days > 0:
                last_read = f"{time_diff.days} days ago"
            elif time_diff.seconds > 3600:
                hours = time_diff.seconds // 3600
                last_read = f"{hours} hours ago"
            else:
                minutes = time_diff.seconds // 60
                last_read = f"{minutes} minutes ago"
        else:
            last_read = "Never"
        
        return format_html(
            '<div><strong>Last Read:</strong> {}</div>',
            last_read
        )
    activity_info.short_description = 'Activity'
