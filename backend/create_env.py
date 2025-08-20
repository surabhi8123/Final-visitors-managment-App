import os

# Create .env file with the required variables
with open('.env', 'w') as f:
    f.write('''SECRET_KEY=7c42b91109e6bf35d04fcf5be4b9607080e0bd4e722ad32aa1e805162816d548
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.38,0.0.0.0
DATABASE_URL=postgresql://postgres:uEutQJRqyRbgOlzwhsGGgczYXaeBqgxI@yamabiko.proxy.rlwy.net:14599/railway
CORS_ALLOW_ALL_ORIGINS=True
''')

print("Created .env file with the required settings.")
print("Now you can run: python manage.py migrate")
