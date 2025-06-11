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
    path('', include(router.urls)),
    path('', include(conversations_router.urls)),
    path('users/search/', views.UserSearchView.as_view(), name='user-search'),
]

# API Endpoints Summary:
# GET    /conversations/                    - List user's conversations
# POST   /conversations/                    - Create new conversation
# GET    /conversations/{id}/               - Get conversation details
# PATCH  /conversations/{id}/               - Update conversation
# DELETE /conversations/{id}/               - Delete conversation
# POST   /conversations/{id}/mark_read/     - Mark conversation as read
# POST   /conversations/{id}/add_participant/ - Add participant to group
# POST   /conversations/{id}/remove_participant/ - Remove participant from group
# POST   /conversations/{id}/archive/       - Archive/unarchive conversation
# GET    /conversations/search/             - Search conversations

# GET    /conversations/{id}/messages/      - List messages in conversation
# POST   /conversations/{id}/messages/      - Send new message
# GET    /conversations/{id}/messages/{id}/ - Get message details
# PATCH  /conversations/{id}/messages/{id}/ - Edit message
# DELETE /conversations/{id}/messages/{id}/ - Delete message
# POST   /conversations/{id}/messages/{id}/mark_read/ - Mark message as read
# POST   /conversations/{id}/messages/{id}/react/ - React to message
# DELETE /conversations/{id}/messages/{id}/remove_reaction/ - Remove reaction
# PATCH  /conversations/{id}/messages/{id}/edit/ - Edit message content
# DELETE /conversations/{id}/messages/{id}/soft_delete/ - Soft delete message

# GET    /notifications/                    - List user's notifications
# PATCH  /notifications/{id}/               - Update notification
# DELETE /notifications/{id}/               - Delete notification
# GET    /notifications/unread_count/       - Get unread count
# POST   /notifications/mark_all_read/      - Mark all as read
# POST   /notifications/{id}/mark_read/     - Mark single as read

# GET    /users/search/                     - Search users
