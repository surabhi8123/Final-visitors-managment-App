@echo off
echo ========================================
echo PostgreSQL Installation Helper
echo ========================================
echo.

echo Step 1: Download PostgreSQL
echo Please download PostgreSQL from:
echo https://www.postgresql.org/download/windows/
echo.
echo Choose PostgreSQL 16 for Windows x86-64
echo.

echo Step 2: Install PostgreSQL
echo 1. Run the downloaded installer
echo 2. Use default port: 5432
echo 3. Set password for postgres user (remember this!)
echo 4. Keep all default components
echo.

echo Step 3: After installation, press any key to continue...
pause

echo.
echo Step 4: Testing PostgreSQL installation...
psql --version
if %errorlevel% neq 0 (
    echo.
    echo ERROR: PostgreSQL not found in PATH
    echo Please restart your terminal/command prompt after installation
    echo.
    pause
    exit /b 1
)

echo.
echo Step 5: Creating database...
psql -U postgres -c "CREATE DATABASE visitor_management;"
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Could not create database
    echo Please check your PostgreSQL installation
    echo.
    pause
    exit /b 1
)

echo.
echo Step 6: Setting up Python environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 7: Running Django setup...
python manage.py makemigrations
python manage.py migrate

echo.
echo Step 8: Creating superuser...
echo You can skip this by pressing Ctrl+C
python manage.py createsuperuser

echo.
echo Step 9: Starting Django server...
echo The server will start on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver 0.0.0.0:8000

pause 