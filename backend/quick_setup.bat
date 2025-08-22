@echo off
echo ========================================
echo Quick Django Backend Setup
echo ========================================
echo.

echo Step 1: Testing PostgreSQL...
psql --version
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL not found. Please restart your terminal after installation.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating database...
psql -U postgres -c "CREATE DATABASE visitor_management;"
if %errorlevel% neq 0 (
    echo ERROR: Could not create database. Check your PostgreSQL password.
    pause
    exit /b 1
)

echo.
echo Step 3: Setting up Python environment...
if not exist "venv" (
    python -m venv venv
)

call venv\Scripts\activate.bat

echo.
echo Step 4: Installing dependencies...
pip install -r requirements.txt

echo.
echo Step 5: Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Step 6: Starting server...
echo Server will be available at: http://localhost:8000
echo API endpoint: http://localhost:8000/api/visitors/active/
echo.
python manage.py runserver 0.0.0.0:8000

pause 