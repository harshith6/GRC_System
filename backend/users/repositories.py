from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.authtoken.models import Token


class UserRepository:

    def get_all(self):
        return User.objects.all()
    
    def get_by_id(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
    
    def get_by_username(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
    
    def get_by_email(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None
    
    def exists_by_username(self, username):
        return User.objects.filter(username=username).exists()
    
    def exists_by_email(self, email):
        return User.objects.filter(email=email).exists()
    
    def get_active_users(self):
        return User.objects.filter(is_active=True)
    
    def get_inactive_users(self):
        return User.objects.filter(is_active=False)
    
    def search(self, query):
        return User.objects.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )
    
    def create_user(self, username, email, password, first_name='', last_name=''):
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        return user
    
    def create_superuser(self, username, email, password):
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        return user
    
    def update(self, user, **kwargs):
        for key, value in kwargs.items():
            setattr(user, key, value)
        user.save()
        return user
    
    def delete(self, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return True
        except User.DoesNotExist:
            return False
    
    def set_active_status(self, user, is_active):
        user.is_active = is_active
        user.save()
        return user
    
    def count_users(self):
        return User.objects.count()
    
    def count_active_users(self):
        return User.objects.filter(is_active=True).count()
    
    def get_recently_joined(self, limit=10):
        return User.objects.order_by('-date_joined')[:limit]


class TokenRepository:

    def get_by_key(self, key):
        try:
            return Token.objects.select_related('user').get(key=key)
        except Token.DoesNotExist:
            return None
    
    def get_by_user(self, user):
        try:
            return Token.objects.get(user=user)
        except Token.DoesNotExist:
            return None
    
    def get_or_create_token(self, user):
        token, created = Token.objects.get_or_create(user=user)
        return token
    
    def create_token(self, user):
        return Token.objects.create(user=user)
    
    def delete_token(self, user):
        try:
            token = Token.objects.get(user=user)
            token.delete()
            return True
        except Token.DoesNotExist:
            return False
    
    def refresh_token(self, user):
        self.delete_token(user)
        return Token.objects.create(user=user)
    
    def get_all_tokens(self):
        return Token.objects.select_related('user').all()
    
    def count_active_tokens(self):
        return Token.objects.count()
    
    def delete_expired_tokens(self):
        deleted_count, _ = Token.objects.filter(user__is_active=False).delete()
        return deleted_count
