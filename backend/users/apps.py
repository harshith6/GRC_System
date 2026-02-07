from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Configuration class for the users app."""
    
    # Use BigAutoField for primary keys (can handle large numbers of users)
    default_auto_field = 'django.db.models.BigAutoField'
    
    # Name of the app - must match the app directory name
    name = 'users'
