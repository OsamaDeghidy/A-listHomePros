from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for contractor profiles
router = DefaultRouter()
router.register(r'profiles', views.ContractorProfileViewSet)

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Service categories
    path('services/', views.ServiceCategoryListView.as_view(), name='service-categories'),
    
    # Legacy contractor profile endpoints
    path('profile-detail/<int:pk>/', views.ContractorProfileDetailView.as_view(), name='contractor-profile-detail'),
    path('profiles/create/', views.ContractorProfileCreateView.as_view(), name='contractor-profile-create'),
    path('profiles/update/', views.ContractorProfileUpdateView.as_view(), name='contractor-profile-update'),
    
    # Portfolio items
    path('portfolio/', views.ContractorPortfolioListCreateView.as_view(), name='contractor-portfolio-list-create'),
    path('portfolio/<int:pk>/', views.ContractorPortfolioDetailView.as_view(), name='contractor-portfolio-detail'),
    
    # Reviews
    path('profiles/<int:contractor_id>/reviews/', views.ContractorReviewCreateView.as_view(), name='contractor-review-create'),
    
    # Admin endpoints
    path('admin/pending/', views.AdminPendingContractorsView.as_view(), name='admin-pending-contractors'),
]
