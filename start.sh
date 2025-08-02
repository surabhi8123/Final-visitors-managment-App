#!/bin/bash

# Visitor Management System - Quick Start Script

echo "🚀 Starting Visitor Management System..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    echo "   On Windows: Start PostgreSQL service"
fi

echo "📦 Setting up backend..."

# Backend setup
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your PostgreSQL 16 credentials"
fi

# Setup PostgreSQL database
echo "Setting up PostgreSQL database..."
python setup_postgres.py

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Start backend server in background
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

echo "📱 Setting up frontend..."

# Frontend setup
cd ../frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Start frontend server
echo "Starting Expo development server..."
npx expo start

# Cleanup function
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "✅ Visitor Management System is running!"
echo "📱 Frontend: Expo development server"
echo "🔧 Backend: http://localhost:8000"
echo "🔧 Admin: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait 