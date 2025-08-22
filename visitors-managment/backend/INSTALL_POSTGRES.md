# PostgreSQL Installation Guide

## Step 1: Install PostgreSQL

### Option A: Download from Official Website (Recommended)
1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 for Windows
3. Run the installer
4. **Important**: Remember the password you set for the `postgres` user
5. Keep the default port (5432)

### Option B: Using Chocolatey (if you have it installed)
```bash
choco install postgresql
```

### Option C: Using winget (Windows 10/11)
```bash
winget install PostgreSQL.PostgreSQL
```

## Step 2: Verify PostgreSQL Installation

After installation, verify PostgreSQL is running:
```bash
psql --version
```

## Step 3: Install Python Dependencies

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Step 4: Set Up Database

1. Run the setup script:
   ```bash
   python setup_postgres.py
   ```

2. Or manually create the database:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE visitor_management;
   
   # Exit psql
   \q
   ```

## Step 5: Configure Environment

1. Create `.env` file in the backend directory:
   ```
   # Database Configuration
   DB_NAME=visitor_management
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   
   # Django Configuration
   SECRET_KEY=7c42b91109e6bf35d04fcf5be4b9607080e0bd4e722ad32aa1e805162816d548
   DEBUG=True
   CORS_ALLOW_ALL_ORIGINS=True
   ```

## Step 6: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Step 7: Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

## Step 8: Start the Server

```bash
python manage.py runserver 0.0.0.0:8000
```

## Step 9: Test the API

1. Open your browser and go to: `http://localhost:8000/api/visitors/active/`
2. You should see a JSON response (empty array if no visitors)

## Troubleshooting

### Common Issues:

1. **"pg_config executable not found"**
   - PostgreSQL is not installed or not in PATH
   - Reinstall PostgreSQL and ensure it's added to PATH

2. **"Connection refused"**
   - PostgreSQL service is not running
   - Start PostgreSQL service: `net start postgresql-x64-16`

3. **"Authentication failed"**
   - Wrong password in .env file
   - Check your PostgreSQL password

4. **"Database does not exist"**
   - Run: `python setup_postgres.py` to create the database

### Check PostgreSQL Status:

```bash
# Check if PostgreSQL is running
net start | findstr postgresql

# Start PostgreSQL service (if not running)
net start postgresql-x64-16
```

### Reset Database (if needed):

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS visitor_management;"
psql -U postgres -c "CREATE DATABASE visitor_management;"

# Run migrations again
python manage.py migrate
``` 