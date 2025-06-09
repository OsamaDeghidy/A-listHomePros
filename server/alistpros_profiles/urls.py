from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.AListHomeProProfileViewSet)
router.register(r'reviews', views.AListHomeProReviewViewSet, basename='alistproreview')

urlpatterns = [
    path('', include(router.urls)),
    path('services/', views.ServiceCategoryListView.as_view(), name='service-categories'),
    path('profile-detail/<int:pk>/', views.AListHomeProProfileDetailView.as_view(), name='alistpro-profile-detail'),
    path('profiles/create/', views.AListHomeProProfileCreateView.as_view(), name='alistpro-profile-create'),
    path('profiles/update/', views.AListHomeProProfileUpdateView.as_view(), name='alistpro-profile-update'),
    path('portfolio/', views.AListHomeProPortfolioListCreateView.as_view(), name='alistpro-portfolio-list-create'),
    path('portfolio/<int:pk>/', views.AListHomeProPortfolioDetailView.as_view(), name='alistpro-portfolio-detail'),
    path('profiles/<int:alistpro_id>/reviews/', views.AListHomeProReviewCreateView.as_view(), name='alistpro-review-create'),
    path('admin/pending/', views.AdminPendingAListHomeProsView.as_view(), name='admin-pending-alistpros'),
    path('categories/', views.ServiceCategoryListView.as_view(), name='service-categories'),
    
    # Service Request and Quote URLs
    path('requests/', views.ServiceRequestListCreateView.as_view(), name='service-request-list'),
    path('requests/<int:pk>/', views.ServiceRequestDetailView.as_view(), name='service-request-detail'),
    path('quotes/', views.ServiceQuoteListCreateView.as_view(), name='service-quote-list'),
    path('quotes/<int:pk>/', views.ServiceQuoteDetailView.as_view(), name='service-quote-detail'),
    path('quotes/<int:quote_id>/accept/', views.accept_quote, name='accept-quote'),
    path('jobs/', views.JobAssignmentListView.as_view(), name='job-assignment-list'),
    path('jobs/<int:pk>/', views.JobAssignmentDetailView.as_view(), name='job-assignment-detail'),
    
    # AListHomePro Legacy URLs
    path('alist-home-pros/', views.AListHomeProProfileListView.as_view(), name='alist-home-pro-list'),
    path('alist-home-pros/<int:pk>/', views.AListHomeProProfileDetailView.as_view(), name='alist-home-pro-detail'),
]
