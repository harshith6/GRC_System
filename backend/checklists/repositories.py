from django.db.models import QuerySet, Count, Q, Prefetch
from datetime import datetime
from django.utils import timezone

from .models import Checklist, ChecklistItem


class ChecklistRepository:
    
    def get_all(self):

        return Checklist.objects.select_related('created_by').prefetch_related('items').all()
    
    def get_by_id(self, checklist_id):

        try:
            return Checklist.objects.select_related('created_by').prefetch_related('items').get(id=checklist_id)
        except Checklist.DoesNotExist:
            return None
    
    def get_by_user(self, user):
        
        return Checklist.objects.filter(created_by=user).select_related('created_by').prefetch_related('items')
    
    def get_by_status(self, status):
        
        return Checklist.objects.filter(status=status).select_related('created_by').prefetch_related('items')
    
    def search(self, query):
        
        return Checklist.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        ).select_related('created_by').prefetch_related('items')
    
    def create(self, **kwargs):
       
        return Checklist.objects.create(**kwargs)
    
    def update(self, checklist, **kwargs):

        for key, value in kwargs.items():
            setattr(checklist, key, value)
        checklist.save()
        return checklist
    
    def delete(self, checklist_id):
        
        try:
            checklist = Checklist.objects.get(id=checklist_id)
            checklist.delete()
            return True
        except Checklist.DoesNotExist:
            return False
    
    def get_with_items_count(self):
        
        return Checklist.objects.annotate(
            item_count=Count('items')
        ).select_related('created_by')
    
    def get_overdue(self):

        return Checklist.objects.filter(
            due_date__lt=timezone.now().date(),
            status__in=['draft', 'active']
        ).select_related('created_by').prefetch_related('items')


class ChecklistItemRepository:
    
    def get_all(self):

        return ChecklistItem.objects.select_related('checklist', 'checklist__created_by').all()
    
    def get_by_id(self, item_id):
        
        try:
            return ChecklistItem.objects.select_related('checklist').get(id=item_id)
        except ChecklistItem.DoesNotExist:
            return None
    
    def get_by_checklist(self, checklist_id):
       
        return ChecklistItem.objects.filter(checklist_id=checklist_id).select_related('checklist')
    
    def get_by_status(self, status):
        
        return ChecklistItem.objects.filter(status=status).select_related('checklist')
    
    def get_by_assigned_owner(self, owner):
        
        return ChecklistItem.objects.filter(assigned_owner=owner).select_related('checklist')
    
    def get_incomplete_items_for_checklist(self, checklist_id):

        return ChecklistItem.objects.filter(
            checklist_id=checklist_id
        ).exclude(status='completed').select_related('checklist')
    
    def get_completed_items_for_checklist(self, checklist_id):
       
        return ChecklistItem.objects.filter(
            checklist_id=checklist_id,
            status='completed'
        ).select_related('checklist')
    
    def create(self, **kwargs):
    
        return ChecklistItem.objects.create(**kwargs)
    
    def update(self, item, **kwargs):
        
        for key, value in kwargs.items():
            setattr(item, key, value)
        item.save()
        return item
    
    def delete(self, item_id):
    
        try:
            item = ChecklistItem.objects.get(id=item_id)
            item.delete()
            return True
        except ChecklistItem.DoesNotExist:
            return False
    
    def delete_by_checklist(self, checklist_id):
        
        deleted_count, _ = ChecklistItem.objects.filter(checklist_id=checklist_id).delete()
        return deleted_count
    
    def search(self, query):
       
        return ChecklistItem.objects.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query) | 
            Q(evidence_notes__icontains=query)
        ).select_related('checklist')
    
    def get_overdue_items(self):
        
        return ChecklistItem.objects.filter(
            checklist__due_date__lt=timezone.now().date(),
            status__in=['pending', 'in-progress']
        ).select_related('checklist')
