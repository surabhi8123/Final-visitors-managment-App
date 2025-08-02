# Visitor Management System - Setup Instructions

This guide will help you set up the complete Visitor Management System with Django backend, React Native frontend, and PostgreSQL database.

## Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 12+
- Expo CLI (`npm install -g @expo/cli`)

## Backend Setup

### 1. Database Setup

First, create a PostgreSQL database:

```sql
CREATE DATABASE visitor_management;
CREATE USER visitor_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE visitor_management TO visitor_user;
```

### 2. Backend Installation

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env file with your database credentials
# Update DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

# Run setup script
python setup.py

# Start the development server
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### 3. Admin Interface

Access the Django admin at `http://localhost:8000/admin`
- Username: `admin`
- Password: `admin123`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### 2. Running on Device/Simulator

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## API Endpoints

### Visitor Management
- `POST /api/visitors/check_in/` - Check in a new visitor
- `POST /api/visitors/check_out/` - Check out a visitor
- `GET /api/visitors/active/` - Get active visitors
- `GET /api/visitors/history/` - Get visit history
- `GET /api/visitors/search/` - Search for existing visitors
- `GET /api/visitors/export/` - Export visit history as CSV

### Request Examples

#### Check In Visitor
```json
POST /api/visitors/check_in/
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "purpose": "Business meeting",
  "photo_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

#### Check Out Visitor
```json
POST /api/visitors/check_out/
{
  "visit_id": "uuid-here"
}
```

## Features

### Backend Features
- ✅ Visitor registration with photo capture
- ✅ Auto-fill for returning visitors
- ✅ Check-in/check-out functionality
- ✅ Duration calculation
- ✅ Search and filter capabilities
- ✅ CSV export functionality
- ✅ RESTful API design
- ✅ PostgreSQL database
- ✅ Django admin interface

### Frontend Features
- ✅ Tablet-optimized UI
- ✅ Camera integration for photo capture
- ✅ Real-time visitor recognition
- ✅ Active visitors management
- ✅ Visit history with search/filter
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Expo Router navigation

## Development

### Backend Development
```bash
cd backend
python manage.py runserver
```

### Frontend Development
```bash
cd frontend
npx expo start
```

### Database Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Production Deployment

### Backend
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up static file serving
4. Use Gunicorn or uWSGI

### Frontend
1. Build for production: `npx expo build`
2. Deploy to app stores or internal distribution

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Camera Permission Error**
   - Grant camera permissions in device settings
   - Restart the app

3. **API Connection Error**
   - Verify backend server is running
   - Check API base URL in frontend
   - Ensure CORS is properly configured

## Support

For issues or questions, please check:
1. Django documentation
2. Expo documentation
3. React Native documentation 