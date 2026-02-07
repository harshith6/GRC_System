from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Checklist(models.Model):
   
    # Status choices - using a tuple of tuples format
    STATUS_CHOICES = [
        ('draft', 'Draft'),  # Checklist is being created/edited
        ('active', 'Active'),  # Checklist is in use
        ('completed', 'Completed'),  # All items are done
    ]
    
    # Name of the checklist (e.g., "Q1 2026 Compliance Review")
    name = models.CharField(max_length=200)
    
    # Detailed description of what this checklist is for
    # blank=True allows this field to be optional
    description = models.TextField(blank=True)
    
    # When the checklist should be completed by
    # null=True, blank=True makes this optional
    due_date = models.DateField(null=True, blank=True)
    
    # Current status of the checklist
    # default='draft' means new checklists start as draft
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    
    # Who created this checklist
    # on_delete=models.CASCADE means if the user is deleted, delete their checklists too
    # related_name allows us to access user.checklists.all()
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='checklists'
    )
    
    # When this checklist was created
    # auto_now_add=True automatically sets this to the current time on creation
    created_at = models.DateTimeField(auto_now_add=True)
    
    # When this checklist was last updated
    # auto_now=True automatically updates this whenever the model is saved
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:

        # Default ordering - newest checklists first
        ordering = ['-created_at']
        
        # Verbose names for the admin interface
        verbose_name = 'Checklist'
        verbose_name_plural = 'Checklists'
        
        # Database indexes for faster queries
        # We often query by status and due_date
        indexes = [
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['created_by', 'status']),
        ]
    
    def __str__(self):

        return self.name
    
    def is_overdue(self):

        if self.due_date and self.status != 'completed':
            # Compare due_date with today's date
            return self.due_date < timezone.now().date()
        return False
    
    def get_completion_percentage(self):

        # Get all items for this checklist
        total_items = self.items.count()
        
        if total_items == 0:
            return 0.0
        
        # Count items that are completed or not applicable
        completed_items = self.items.filter(
            status__in=['completed', 'not-applicable']
        ).count()
        
        # Calculate percentage
        return (completed_items / total_items) * 100


class ChecklistItem(models.Model):
    
    # Status choices for checklist items
    STATUS_CHOICES = [
        ('pending', 'Pending'),  
        ('in-progress', 'In Progress'), 
        ('completed', 'Completed'),  
        ('not-applicable', 'Not Applicable'), 
    ]
    
    # Which checklist this item belongs to
    # on_delete=models.CASCADE means if the checklist is deleted, delete all its items
    # related_name='items' allows us to access checklist.items.all()
    checklist = models.ForeignKey(
        Checklist,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    # Title of the item (e.g., "Review data retention policy")
    title = models.CharField(max_length=200)
    
    # Detailed description of what needs to be done
    description = models.TextField(blank=True)
    
    # Current status of this item
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True
    )
    
    assigned_owner = models.CharField(max_length=100, blank=True)
    
    # Evidence or notes about completion
    evidence_notes = models.TextField(blank=True)
    
    # When this item was marked as completed
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # When this item was created
    created_at = models.DateTimeField(auto_now_add=True)
    
    # When this item was last updated
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:

        # Default ordering - oldest items first (order they were added)
        ordering = ['created_at']
        
        verbose_name = 'Checklist Item'
        verbose_name_plural = 'Checklist Items'
        
        # Indexes for faster queries
        indexes = [
            models.Index(fields=['checklist', 'status']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.checklist.name} - {self.title}"
    
    def mark_completed(self):

        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
    
    def is_completed(self):
        
        return self.status in ['completed', 'not-applicable']
