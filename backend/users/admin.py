"""
Admin configuration for users app.

The Django admin is a built-in web interface for managing data.
Since we're using Django's built-in User model, it's already registered
in the admin. We don't need to add anything here.

If we had custom models (like UserProfile), we would register them here.
"""

from django.contrib import admin

# Register your models here.
# The User model is already registered by Django
