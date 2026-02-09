from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChecklistViewSet, ChecklistItemViewSet, DashboardStatsView

# ===== AUTO-GENERATED URLS (Using Router) =====
# Commented out for better readability - using explicit URLs below
# router = DefaultRouter()
# router.register(r'checklists', ChecklistViewSet, basename='checklist')
# router.register(r'items', ChecklistItemViewSet, basename='checklistitem')

urlpatterns = [
    # ===== Dashboard Statistics =====
    # GET /api/stats/ - Get dashboard statistics
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # ===== Checklist URLs =====
    # GET /api/checklists/ - List all checklists
    path('checklists/', ChecklistViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='checklist-list'),
    
    # GET /api/checklists/<id>/ - Get specific checklist
    # PUT /api/checklists/<id>/ - Update checklist
    # PATCH /api/checklists/<id>/ - Partial update checklist
    # DELETE /api/checklists/<id>/ - Delete checklist
    path('checklists/<int:pk>/', ChecklistViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='checklist-detail'),
    
    # GET /api/checklists/<id>/items/ - Get items in a checklist
    path('checklists/<int:pk>/items/', ChecklistViewSet.as_view({
        'get': 'items'
    }), name='checklist-items'),
    
    # POST /api/checklists/<id>/add-item/ - Add item to checklist
    path('checklists/<int:pk>/add-item/', ChecklistViewSet.as_view({
        'post': 'add_item'
    }), name='checklist-add-item'),
    
    # ===== Checklist Item URLs =====
    # GET /api/items/ - List all items
    path('items/', ChecklistItemViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='checklistitem-list'),
    
    # GET /api/items/<id>/ - Get specific item
    # PUT /api/items/<id>/ - Update item
    # PATCH /api/items/<id>/ - Partial update item
    # DELETE /api/items/<id>/ - Delete item
    path('items/<int:pk>/', ChecklistItemViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='checklistitem-detail'),
    
    # POST /api/items/<id>/complete/ - Mark item as completed
    path('items/<int:pk>/complete/', ChecklistItemViewSet.as_view({
        'post': 'complete'
    }), name='checklistitem-complete'),
]
