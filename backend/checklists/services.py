from django.db import transaction
from django.utils import timezone
from django.db.models import Count, Q, Avg
from typing import List, Dict, Optional
from datetime import datetime

from .models import Checklist, ChecklistItem
from .repositories import ChecklistRepository, ChecklistItemRepository
from .exceptions import ValidationError


class ChecklistService:
    
    def __init__(self):
        self.checklist_repo = ChecklistRepository()
        self.item_repo = ChecklistItemRepository()
    
    def get_all_checklists(self):
        
        return self.checklist_repo.get_all()
    
    def get_user_checklists(self, user):
        
        return self.checklist_repo.get_by_user(user)
    
    def get_checklist_by_id(self, checklist_id: int) -> Optional[Checklist]:
        
        return self.checklist_repo.get_by_id(checklist_id)
    
    def get_checklist_by_id_for_user(self, checklist_id: int, user) -> Optional[Checklist]:
       
        checklist = self.checklist_repo.get_by_id(checklist_id)
        if not checklist:
            return None
        
        if checklist.created_by != user:
            raise ValidationError("You don't have permission to access this checklist")
        
        return checklist
    
    def get_checklist_items(self, checklist_id):
        
        checklist = self.checklist_repo.get_by_id(checklist_id)
        if not checklist:
            raise ValidationError("Checklist not found")
        
        return self.item_repo.get_by_checklist(checklist_id)
    
    def create_checklist(self, user, data):
       
        # Business rule: Validate due date is not in the past
        due_date = data.get('due_date')
        if due_date:
            due_date_obj = datetime.strptime(due_date, '%Y-%m-%d').date() if isinstance(due_date, str) else due_date
            if due_date_obj < timezone.now().date():
                raise ValidationError("Due date cannot be in the past")
        
        # Create checklist through repository
        with transaction.atomic():
            checklist = self.checklist_repo.create(
                name=data['name'],
                description=data.get('description', ''),
                due_date=due_date,
                status=data.get('status', 'draft'),
                created_by=user
            )
        
        return checklist
    
    def update_checklist(self, checklist_id, data, user):
        
        checklist = self.get_checklist_by_id_for_user(checklist_id, user)
        
        if not checklist:
            raise ValidationError("Checklist not found")
        
        # Business rule: Validate due date
        due_date = data.get('due_date')
        if due_date:
            due_date_obj = datetime.strptime(due_date, '%Y-%m-%d').date() if isinstance(due_date, str) else due_date
            if due_date_obj < timezone.now().date():
                raise ValidationError("Due date cannot be in the past")
        
        # Business rule: Auto-update status based on items completion
        new_status = data.get('status')
        if new_status == 'completed':
            incomplete_items = self.item_repo.get_incomplete_items_for_checklist(checklist_id)
            if incomplete_items.exists():
                raise ValidationError("Cannot mark checklist as completed while items are incomplete")
        
        # Update through repository
        with transaction.atomic():
            updated_checklist = self.checklist_repo.update(
                checklist,
                **{k: v for k, v in data.items() if k in ['name', 'description', 'due_date', 'status']}
            )
        
        return updated_checklist
    
    def delete_checklist(self, checklist_id: int, user) -> bool:
        
        checklist = self.get_checklist_by_id_for_user(checklist_id, user)
        
        if not checklist:
            raise ValidationError("Checklist not found")
        
        with transaction.atomic():
            # Delete all items first (cascade should handle this, but being explicit)
            self.item_repo.delete_by_checklist(checklist_id)
            # Delete the checklist
            return self.checklist_repo.delete(checklist_id)
    
    def get_checklist_stats(self, checklist_id: int) -> Dict:
        
        checklist = self.checklist_repo.get_by_id(checklist_id)
        if not checklist:
            raise ValidationError("Checklist not found")
        
        items = self.item_repo.get_by_checklist(checklist_id)
        total_items = items.count()
        
        if total_items == 0:
            return {
                'total_items': 0,
                'completed_items': 0,
                'pending_items': 0,
                'in_progress_items': 0,
                'completion_percentage': 0.0
            }
        
        completed = items.filter(status='completed').count()
        pending = items.filter(status='pending').count()
        in_progress = items.filter(status='in-progress').count()
        
        return {
            'total_items': total_items,
            'completed_items': completed,
            'pending_items': pending,
            'in_progress_items': in_progress,
            'completion_percentage': round((completed / total_items) * 100, 2)
        }
    
    def get_dashboard_stats(self, user):
        
        checklists = self.checklist_repo.get_by_user(user)
        
        # Get only items from user's checklists
        user_checklist_ids = checklists.values_list('id', flat=True)
        user_items = ChecklistItem.objects.filter(checklist_id__in=user_checklist_ids)
        
        total_checklists = checklists.count()
        active_checklists = checklists.filter(status='active').count()
        completed_checklists = checklists.filter(status='completed').count()
        draft_checklists = checklists.filter(status='draft').count()
        
        total_items = user_items.count()
        completed_items = user_items.filter(status='completed').count()
        pending_items = user_items.filter(status='pending').count()
        in_progress_items = user_items.filter(status='in-progress').count()
        
        # Get overdue checklists for this user only
        from django.utils import timezone
        today = timezone.now().date()
        overdue_checklists = checklists.filter(
            due_date__lt=today,
            status__in=['draft', 'active']
        ).count()
        
        # Calculate average completion percentage for user's checklists
        if total_items > 0:
            avg_completion = round((completed_items / total_items) * 100, 2)
        else:
            avg_completion = 0.0
        
        return {
            'total_checklists': total_checklists,
            'active_checklists': active_checklists,
            'completed_checklists': completed_checklists,
            'draft_checklists': draft_checklists,
            'total_items': total_items,
            'completed_items': completed_items,
            'pending_items': pending_items,
            'in_progress_items': in_progress_items,
            'overdue_checklists': overdue_checklists,
            'average_completion': avg_completion
        }


class ChecklistItemService:
    
    def __init__(self):
        self.item_repo = ChecklistItemRepository()
        self.checklist_repo = ChecklistRepository()
    
    def get_all_items(self):
        
        return self.item_repo.get_all()
    
    def get_item_by_id(self, item_id: int) -> Optional[ChecklistItem]:
       
        return self.item_repo.get_by_id(item_id)
    
    def get_items_by_checklist(self, checklist_id: int):
        
        checklist = self.checklist_repo.get_by_id(checklist_id)
        if not checklist:
            raise ValidationError("Checklist not found")
        
        return self.item_repo.get_by_checklist(checklist_id)
    
    def create_item(self, checklist_id, data):
        
        checklist = self.checklist_repo.get_by_id(checklist_id)
        if not checklist:
            raise ValidationError("Checklist not found")
        
        # Business rule: Cannot add items to completed checklists
        if checklist.status == 'completed':
            raise ValidationError("Cannot add items to a completed checklist")
        
        with transaction.atomic():
            item = self.item_repo.create(
                checklist=checklist,
                title=data['title'],
                description=data.get('description', ''),
                status=data.get('status', 'pending'),
                assigned_owner=data.get('assigned_owner', ''),
                evidence_notes=data.get('evidence_notes', '')
            )
        
        return item
    
    def update_item(self, item_id: int, data: Dict) -> ChecklistItem:
        
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise ValidationError("Item not found")
        
        # Business rule: Set completed_at when status changes to completed
        new_status = data.get('status')
        if new_status == 'completed' and item.status != 'completed':
            data['completed_at'] = timezone.now()
        elif new_status and new_status != 'completed':
            data['completed_at'] = None
        
        with transaction.atomic():
            updated_item = self.item_repo.update(
                item,
                **{k: v for k, v in data.items() if k in [
                    'title', 'description', 'status', 'assigned_owner', 
                    'evidence_notes', 'completed_at'
                ]}
            )
        
        return updated_item
    
    def update_item_status(self, item_id, status):
       
        return self.update_item(item_id, {'status': status})
    
    def delete_item(self, item_id):
        
        return self.item_repo.delete(item_id)
