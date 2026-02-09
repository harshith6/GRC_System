from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .serializers import (
    ChecklistSerializer,
    ChecklistListSerializer,
    ChecklistItemSerializer,
    ChecklistItemCreateSerializer,
    ChecklistStatsSerializer
)
from .services import ChecklistService, ChecklistItemService
from .exceptions import ValidationError


class ChecklistViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Checklist model.
    
    This provides CRUD operations for checklists:
    - GET /api/checklists/ - List all checklists
    - POST /api/checklists/ - Create a new checklist
    - GET /api/checklists/{id}/ - Get a specific checklist
    - PUT /api/checklists/{id}/ - Update a checklist
    - PATCH /api/checklists/{id}/ - Partially update a checklist
    - DELETE /api/checklists/{id}/ - Delete a checklist
    
    Additional custom endpoints:
    - GET /api/checklists/{id}/items/ - Get items in a checklist
    - POST /api/checklists/{id}/items/ - Add item to a checklist
    """
    
    # Require authentication for all operations
    permission_classes = [IsAuthenticated]
    
    # Use different serializers for list vs detail views
    serializer_class = ChecklistSerializer
    
    # Enable filtering by status
    filterset_fields = ['status']
    
    # Enable searching by name and description
    search_fields = ['name', 'description']
    
    # Enable ordering by various fields
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'name']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = ChecklistService()
    
    def get_queryset(self):
        
        return self.service.get_user_checklists(self.request.user)
    
    def get_serializer_class(self):
        
        if self.action == 'list':
            return ChecklistListSerializer
        return ChecklistSerializer
    
    def perform_create(self, serializer):
        
        try:
            data = serializer.validated_data
            checklist = self.service.create_checklist(self.request.user, data)
            serializer.instance = checklist
        except ValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def perform_update(self, serializer):
       
        try:
            data = serializer.validated_data
            checklist = self.service.update_checklist(
                self.get_object().id,
                data,
                self.request.user
            )
            serializer.instance = checklist
        except ValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def perform_destroy(self, instance):
       
        try:
            self.service.delete_checklist(instance.id, self.request.user)
        except ValidationError as e:
            raise serializers.ValidationError(e.message)
    
    @action(detail=True, methods=['get'], url_path='items')
    def items(self, request, pk=None):
        """
        Get all items for a specific checklist.
        """
        try:
            items = self.service.get_checklist_items(pk)
            serializer = ChecklistItemSerializer(items, many=True)
            return Response({
                'success': True,
                'count': len(items),
                'items': serializer.data
            }, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({
                'success': False,
                'error': e.message
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='add-item')
    def add_item(self, request, pk=None):
        """
        Add a new item to a checklist.
        """
        try:
            item_service = ChecklistItemService()
            item = item_service.create_item(pk, request.data)
            serializer = ChecklistItemSerializer(item)
            return Response({
                'success': True,
                'item': serializer.data,
                'message': 'Item added successfully'
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({
                'success': False,
                'error': e.message
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChecklistItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ChecklistItem model.
    
    This provides CRUD operations for checklist items:
    - GET /api/items/ - List all items (rarely used)
    - GET /api/items/{id}/ - Get a specific item
    - PUT /api/items/{id}/ - Update an item
    - PATCH /api/items/{id}/ - Partially update an item
    - DELETE /api/items/{id}/ - Delete an item
    
    Custom endpoints:
    - POST /api/items/{id}/complete/ - Mark item as completed
    """
    
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsAuthenticated]
    
    # Enable filtering by status and checklist
    filterset_fields = ['status', 'checklist']
    
    # Enable searching
    search_fields = ['title', 'description', 'assigned_owner']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = ChecklistItemService()
    
    def get_queryset(self):
        
        return self.service.get_all_items()
    
    def perform_create(self, serializer):
        
        try:
            checklist_id = self.request.data.get('checklist')
            item = self.service.create_item(checklist_id, serializer.validated_data)
            serializer.instance = item
        except ValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def perform_update(self, serializer):
        
        try:
            item = self.service.update_item(
                self.get_object().id,
                serializer.validated_data
            )
            serializer.instance = item
        except ValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def perform_destroy(self, instance):
        
        try:
            self.service.delete_item(instance.id)
        except ValidationError as e:
            raise serializers.ValidationError(e.message)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark a checklist item as completed.
        """
        try:
            data = {'status': 'completed'}
            evidence_notes = request.data.get('evidence_notes')
            if evidence_notes:
                data['evidence_notes'] = evidence_notes
            
            item = self.service.update_item(pk, data)
            serializer = self.get_serializer(item)
            return Response({
                'success': True,
                'item': serializer.data,
                'message': 'Item marked as completed'
            }, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({
                'success': False,
                'error': e.message
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardStatsView(APIView):
    """
    API endpoint for dashboard statistics using service layer.
    
    GET /api/stats/
    
    Returns:
    {
        "total_checklists": 15,
        "active_checklists": 8,
        "draft_checklists": 3,
        "completed_checklists": 4,
        "total_items": 120,
        "pending_items": 45,
        "in_progress_items": 30,
        "completed_items": 45,
        "overdue_checklists": 2,
        "average_completion": 65.5
    }
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Calculate and return dashboard statistics using service layer.
        """
        try:
            service = ChecklistService()
            stats = service.get_dashboard_stats(request.user)
            serializer = ChecklistStatsSerializer(stats)
            return Response({
                'success': True,
                'stats': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
