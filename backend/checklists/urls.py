from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChecklistViewSet, ChecklistItemViewSet, DashboardStatsView

# Create a router for our ViewSets
# The router automatically generates URL patterns for standard CRUD operations
router = DefaultRouter()

# Register our ViewSets with the router
# This creates URLs like:
# - /api/checklists/ (list, create)
# - /api/checklists/{id}/ (retrieve, update, delete)
# - /api/items/ (list)
# - /api/items/{id}/ (retrieve, update, delete)
router.register(r'checklists', ChecklistViewSet, basename='checklist')
router.register(r'items', ChecklistItemViewSet, basename='checklistitem')

urlpatterns = [
    # Include all router-generated URLs
    path('', include(router.urls)),
    # Dashboard statistics endpoint
    # GET /api/stats/
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
