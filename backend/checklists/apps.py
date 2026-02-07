"""
Checklists app configuration.

This file configures the checklists Django app.
"""

from django.apps import AppConfig


class ChecklistsConfig(AppConfig):
    """Configuration class for the checklists app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'checklists'
