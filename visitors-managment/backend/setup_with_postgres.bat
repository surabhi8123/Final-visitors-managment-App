@echo off
echo ========================================
echo Django Backend Setup with PostgreSQL
echo ========================================
echo.

echo Step 1: Starting PostgreSQL service...
net start postgresql-x64-16
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Could not start PostgreSQL service automatically.
    echo Please start it manually:
    echo 1. Open Services (services.msc)
    echo 2. Find "postgresql-x64-16"
    echo 3. Right-click and select "Start"
    echo.
    echo Press any key after starting the service...
    pause
)

echo.
echo Step 2: Creating database...
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE visitor_management;"
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Could not create database.
    echo Please check if PostgreSQL is running and your password is correct.
    echo.
    pause
    exit /b 1
)

echo.
echo Step 3: Setting up Python environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Step 4: Installing dependencies...
pip install -r requirements.txt

echo.
echo Step 5: Creating .env file...
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Database Configuration
        echo DB_NAME=visitor_management
        echo DB_USER=postgres
        echo DB_PASSWORD=your_postgres_password_here
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo.
        echo # Django Configuration
        echo SECRET_KEY=7c42b91109e6bf35d04fcf5be4b9607080e0bd4e722ad32aa1e805162816d548
        echo DEBUG=True
        echo CORS_ALLOW_ALL_ORIGINS=True
    ) > .env
    echo.
    echo IMPORTANT: Please edit .env file and set your PostgreSQL password!
    echo.
)

echo.
echo Step 6: Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Step 7: Creating superuser (optional)...
echo You can skip this by pressing Ctrl+C
python manage.py createsuperuser

echo.
echo Step 8: Starting Django server...
echo.
echo Server will be available at: http://localhost:8000
echo API endpoint: http://localhost:8000/api/visitors/active/
echo Admin panel: http://localhost:8000/admin/
echo.
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver 0.0.0.0:8000

pause 