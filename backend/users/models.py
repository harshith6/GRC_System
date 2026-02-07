"""
User models.

We're using Django's built-in User model, so we don't need to define
custom models here. If we needed to extend the User model with additional
fields (like phone number, company name, etc.), we would create them here.

For this project, the default User model provides:
- username
- email
- password (hashed)
- first_name
- last_name
- is_active
- is_staff
- is_superuser
- date_joined
- last_login
"""

from django.contrib.auth.models import User

# We can add custom models here if needed in the future
# For example:
# class UserProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     phone_number = models.CharField(max_length=20)
#     company = models.CharField(max_length=100)
