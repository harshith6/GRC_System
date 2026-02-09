from django.contrib.auth.models import User

# Create default superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123'
    )
    print("Default superuser created: admin / admin123")
else:
    print("Superuser 'admin' already exists")
