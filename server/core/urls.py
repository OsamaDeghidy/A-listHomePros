from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AddressViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]

# This will create the following endpoints:
# GET /api/core/addresses/ - List all addresses for authenticated user
# POST /api/core/addresses/ - Create new address
# GET /api/core/addresses/{id}/ - Retrieve specific address
# PUT /api/core/addresses/{id}/ - Update specific address
# PATCH /api/core/addresses/{id}/ - Partial update specific address
# DELETE /api/core/addresses/{id}/ - Delete specific address
# GET /api/core/addresses/primary/ - Get primary address
# POST /api/core/addresses/{id}/set_primary/ - Set address as primary
# GET /api/core/addresses/nearby/ - Get nearby addresses for map 