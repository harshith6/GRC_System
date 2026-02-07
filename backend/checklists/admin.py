from django.contrib import admin
from .models import Checklist, ChecklistItem


class ChecklistItemInline(admin.TabularInline):
    
    model = ChecklistItem
    extra = 1  # Show 1 empty form for adding new items
    fields = ['title', 'status', 'assigned_owner', 'completed_at']
    readonly_fields = ['completed_at']


@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    
    # Display these fields in the list view
    list_display = [
        'name',
        'status',
        'due_date',
        'created_by',
        'created_at',
        'item_count',
        'completion_display'
    ]
    
    # Add filters in the right sidebar
    list_filter = ['status', 'due_date', 'created_at']
    
    # Enable search
    search_fields = ['name', 'description']
    
    # Fields that are read-only (can't be edited)
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    
    # How to organize fields in the detail view
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'status')
        }),
        ('Timeline', {
            'fields': ('due_date', 'created_at', 'updated_at')
        }),
        ('Ownership', {
            'fields': ('created_by',)
        }),
    )
    
    # Show checklist items inline
    inlines = [ChecklistItemInline]
    
    def item_count(self, obj):
        
        return obj.items.count()
    item_count.short_description = 'Items'
    
    def completion_display(self, obj):
        
        return f"{obj.get_completion_percentage():.1f}%"
    completion_display.short_description = 'Completion'
    
    def save_model(self, request, obj, form, change):
        
        if not change:  # If creating a new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    
    # Display these fields in the list view
    list_display = [
        'title',
        'checklist',
        'status',
        'assigned_owner',
        'completed_at',
        'created_at'
    ]
    
    # Add filters
    list_filter = ['status', 'checklist', 'created_at']
    
    # Enable search
    search_fields = ['title', 'description', 'assigned_owner']
    
    # Read-only fields
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    
    # Organize fields in the detail view
    fieldsets = (
        ('Item Information', {
            'fields': ('checklist', 'title', 'description')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'assigned_owner', 'completed_at')
        }),
        ('Evidence', {
            'fields': ('evidence_notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)  # Collapse this section by default
        }),
    )
