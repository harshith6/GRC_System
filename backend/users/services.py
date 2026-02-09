from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.authtoken.models import Token

from .repositories import UserRepository, TokenRepository
from checklists.exceptions import ValidationError, PermissionDeniedException


class UserService:
    
    def __init__(self):
        self.user_repo = UserRepository()
        self.token_repo = TokenRepository()
    
    def register_user(self, data):
       
        # Business rule: Check username length
        username = data.get('username', '')
        if len(username) < 3:
            raise ValidationError("Username must be at least 3 characters long")
        
        if len(username) > 150:
            raise ValidationError("Username cannot exceed 150 characters")
        
        # Business rule: Check if username already exists
        if self.user_repo.exists_by_username(username):
            raise ValidationError("Username is already taken")
        
        # Business rule: Validate email
        email = data.get('email', '')
        if not email or '@' not in email:
            raise ValidationError("Valid email address is required")
        
        if self.user_repo.exists_by_email(email):
            raise ValidationError("Email is already registered")
        
        # Business rule: Validate password strength
        password = data.get('password', '')
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long")
        
        # Create user within transaction
        with transaction.atomic():
            user = self.user_repo.create_user(
                username=username,
                email=email,
                password=password,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )
            
            # Generate authentication token
            token = self.token_repo.get_or_create_token(user)
        
        return user, token.key
    
    def update_user_profile(self, user_id, data):
        
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValidationError("User not found")
        
        # Business rule: Email must be unique if being updated
        new_email = data.get('email')
        if new_email and new_email != user.email:
            if self.user_repo.exists_by_email(new_email):
                raise ValidationError("Email is already registered")
        
        # Update allowed fields
        allowed_fields = ['email', 'first_name', 'last_name']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        with transaction.atomic():
            updated_user = self.user_repo.update(user, **update_data)
        
        return updated_user
    
    def change_password(self, user_id, old_password, new_password):
       
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValidationError("User not found")
        
        # Business rule: Verify old password
        if not user.check_password(old_password):
            raise ValidationError("Current password is incorrect")
        
        # Business rule: Validate new password
        if len(new_password) < 8:
            raise ValidationError("New password must be at least 8 characters long")
        
        if new_password == old_password:
            raise ValidationError("New password must be different from old password")
        
        # Change password
        with transaction.atomic():
            user.set_password(new_password)
            user.save()
            
            # Invalidate existing token to force re-login
            self.token_repo.delete_token(user)
        
        return True
    
    def deactivate_user(self, user_id):
        
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValidationError("User not found")
        
        with transaction.atomic():
            user.is_active = False
            user.save()
            # Delete authentication token
            self.token_repo.delete_token(user)
        
        return True
    
    def activate_user(self, user_id):
        
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValidationError("User not found")
        
        user.is_active = True
        user.save()
        
        return True
    
    def get_user_stats(self, user_id):
        
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValidationError("User not found")
        
        from checklists.repositories import ChecklistRepository
        checklist_repo = ChecklistRepository()
        
        checklists = checklist_repo.get_by_user(user)
        
        return {
            'username': user.username,
            'email': user.email,
            'date_joined': user.date_joined,
            'total_checklists': checklists.count(),
            'active_checklists': checklists.filter(status='active').count(),
            'completed_checklists': checklists.filter(status='completed').count()
        }


class AuthenticationService:
    
    def __init__(self):
        self.user_repo = UserRepository()
        self.token_repo = TokenRepository()
    
    def authenticate_user(self, username, password):
        
        # Business rule: Check required fields
        if not username or not password:
            raise ValidationError("Username and password are required")
        
        # Authenticate using Django's authenticate
        user = authenticate(username=username, password=password)
        
        if user is None:
            # Authentication failed
            raise ValidationError("Invalid username or password")
        
        # Business rule: Check if account is active
        if not user.is_active:
            raise PermissionDeniedException("Account is disabled. Please contact support.")
        
        # Get or create authentication token
        token = self.token_repo.get_or_create_token(user)
        
        return user, token.key
    
    def logout_user(self, user):
        
        return self.token_repo.delete_token(user)
    
    def validate_token(self, token_key):
        
        token = self.token_repo.get_by_key(token_key)
        if token:
            return token.user
        return None
    
    def refresh_token(self, user):
        
        with transaction.atomic():
            # Delete old token
            self.token_repo.delete_token(user)
            # Create new token
            token = self.token_repo.get_or_create_token(user)
        
        return token.key
    
    def get_active_sessions(self, user):
        
        token = self.token_repo.get_by_user(user)
        
        return {
            'has_active_session': token is not None,
            'token_created': token.created if token else None,
            'last_login': user.last_login
        }
