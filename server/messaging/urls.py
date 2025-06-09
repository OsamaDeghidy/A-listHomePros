from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

# Main router
router = DefaultRouter()
router.register(r'conversations', views.ConversationViewSet, basename='conversations')
router.register(r'notifications', views.NotificationViewSet, basename='notifications')

# Nested router for messages within conversations
conversations_router = routers.NestedDefaultRouter(router, r'conversations', lookup='conversation')
conversations_router.register(r'messages', views.MessageViewSet, basename='conversation-messages')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include(conversations_router.urls)),
    path('api/users/search/', views.UserSearchView.as_view(), name='user-search'),
]

# API Endpoints Summary:
# GET    /api/conversations/                    - List user's conversations
# POST   /api/conversations/                    - Create new conversation
# GET    /api/conversations/{id}/               - Get conversation details
# PATCH  /api/conversations/{id}/               - Update conversation
# DELETE /api/conversations/{id}/               - Delete conversation
# POST   /api/conversations/{id}/mark_read/     - Mark conversation as read
# POST   /api/conversations/{id}/add_participant/ - Add participant to group
# POST   /api/conversations/{id}/remove_participant/ - Remove participant from group
# POST   /api/conversations/{id}/archive/       - Archive/unarchive conversation
# GET    /api/conversations/search/             - Search conversations

# GET    /api/conversations/{id}/messages/      - List messages in conversation
# POST   /api/conversations/{id}/messages/      - Send new message
# GET    /api/conversations/{id}/messages/{id}/ - Get message details
# PATCH  /api/conversations/{id}/messages/{id}/ - Edit message
# DELETE /api/conversations/{id}/messages/{id}/ - Delete message
# POST   /api/conversations/{id}/messages/{id}/mark_read/ - Mark message as read
# POST   /api/conversations/{id}/messages/{id}/react/ - React to message
# DELETE /api/conversations/{id}/messages/{id}/remove_reaction/ - Remove reaction
# PATCH  /api/conversations/{id}/messages/{id}/edit/ - Edit message content
# DELETE /api/conversations/{id}/messages/{id}/soft_delete/ - Soft delete message

# GET    /api/notifications/                    - List user's notifications
# PATCH  /api/notifications/{id}/               - Update notification
# DELETE /api/notifications/{id}/               - Delete notification
# GET    /api/notifications/unread_count/       - Get unread count
# POST   /api/notifications/mark_all_read/      - Mark all as read
# POST   /api/notifications/{id}/mark_read/     - Mark single as read

# GET    /api/users/search/                     - Search users
