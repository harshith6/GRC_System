from rest_framework import serializers
from django.utils import timezone
from .models import Checklist, ChecklistItem


class ChecklistItemSerializer(serializers.ModelSerializer):
    
    # Read-only computed field to show if the item is completed
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistItem
        fields = [
            'id',
            'checklist',
            'title',
            'description',
            'status',
            'assigned_owner',
            'evidence_notes',
            'completed_at',
            'created_at',
            'updated_at',
            'is_completed'
        ]
        # These fields are automatically managed by Django, so read-only
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_completed']
    
    def get_is_completed(self, obj):
        
        return obj.is_completed()
    
    def validate_status(self, value):
        
        allowed_statuses = ['pending', 'in-progress', 'completed', 'not-applicable']
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(allowed_statuses)}"
            )
        return value
    
    def update(self, instance, validated_data):
        
        # Get the new status from validated_data
        new_status = validated_data.get('status', instance.status)
        
        # If changing to completed and no completed_at timestamp, set it now
        if new_status == 'completed' and not instance.completed_at:
            validated_data['completed_at'] = timezone.now()
        
        # If changing away from completed, clear the completed_at timestamp
        if new_status != 'completed' and instance.status == 'completed':
            validated_data['completed_at'] = None
        
        # Update the instance with validated data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class ChecklistItemCreateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ChecklistItem
        fields = [
            'title',
            'description',
            'status',
            'assigned_owner',
            'evidence_notes'
        ]
    
    def validate_title(self, value):
    
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value


class ChecklistSerializer(serializers.ModelSerializer):
    
    # Nested serialization - includes all items in the checklist
    # read_only=True because items are managed through separate endpoints
    items = ChecklistItemSerializer(many=True, read_only=True)
    
    # Computed fields that don't exist in the database
    is_overdue = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    completed_items = serializers.SerializerMethodField()
    pending_items = serializers.SerializerMethodField()
    
    # Include creator information
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Checklist
        fields = [
            'id',
            'name',
            'description',
            'due_date',
            'status',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at',
            'items',
            'is_overdue',
            'completion_percentage',
            'total_items',
            'completed_items',
            'pending_items'
        ]
        read_only_fields = [
            'id',
            'created_by',
            'created_at',
            'updated_at',
            'is_overdue',
            'completion_percentage'
        ]
    
    def get_is_overdue(self, obj):
        
        return obj.is_overdue()
    
    def get_completion_percentage(self, obj):
        
        return obj.get_completion_percentage()
    
    def get_total_items(self, obj):
        
        return obj.items.count()
    
    def get_completed_items(self, obj):
        
        return obj.items.filter(
            status__in=['completed', 'not-applicable']
        ).count()
    
    def get_pending_items(self, obj):
        
        return obj.items.filter(
            status__in=['pending', 'in-progress']
        ).count()
    
    def validate_status(self, value):
        
        allowed_statuses = ['draft', 'active', 'completed']
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(allowed_statuses)}"
            )
        return value
    
    def validate_due_date(self, value):
    
        # Only validate for creation (no instance exists yet)
        if not self.instance and value:
            if value < timezone.now().date():
                raise serializers.ValidationError(
                    "Due date cannot be in the past"
                )
        return value
    
    def validate_name(self, value):
        
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        return value


class ChecklistListSerializer(serializers.ModelSerializer):
    
    # Computed fields
    is_overdue = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    completed_items = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Checklist
        fields = [
            'id',
            'name',
            'description',
            'due_date',
            'status',
            'created_by_username',
            'created_at',
            'updated_at',
            'is_overdue',
            'completion_percentage',
            'total_items',
            'completed_items'
        ]
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()
    
    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()
    
    def get_total_items(self, obj):
        return obj.items.count()
    
    def get_completed_items(self, obj):
        return obj.items.filter(
            status__in=['completed', 'not-applicable']
        ).count()


class ChecklistStatsSerializer(serializers.Serializer):
    
    total_checklists = serializers.IntegerField()
    active_checklists = serializers.IntegerField()
    draft_checklists = serializers.IntegerField()
    completed_checklists = serializers.IntegerField()
    total_items = serializers.IntegerField()
    pending_items = serializers.IntegerField()
    in_progress_items = serializers.IntegerField()
    completed_items = serializers.IntegerField()
    overdue_checklists = serializers.IntegerField()
    average_completion = serializers.FloatField()
