# Visitor Management System

A complete visitor management system built with React Native (Expo) frontend and Django backend with SQLite database.

## Features

### Frontend (React Native + Expo)
- ✅ **Responsive Design** - Works on phones and tablets
- ✅ **Check-in Visitor** - Register new visitors with photos
- ✅ **Active Visitors** - View currently checked-in visitors
- ✅ **Visit History** - Browse complete visit records with filters
- ✅ **Photo Capture** - Take and store visitor photos
- ✅ **Real-time Updates** - Pull-to-refresh functionality
- ✅ **Export Data** - Export visit history as CSV

### Backend (Django + SQLite)
- ✅ **RESTful API** - Complete CRUD operations
- ✅ **Visitor Management** - Store visitor information
- ✅ **Visit Tracking** - Track check-ins and check-outs
- ✅ **Photo Storage** - Handle visitor photo uploads
- ✅ **Search & Filter** - Advanced filtering capabilities
- ✅ **Data Export** - CSV export functionality

## Quick Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd VISITORS/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run migrations:**
```bash
   python manage.py migrate --settings=visitor_management.settings_sqlite
   ```

6. **Create superuser (optional):**
```bash
   python manage.py createsuperuser --settings=visitor_management.settings_sqlite
   ```

7. **Start the server:**
   ```bash
   python manage.py runserver --settings=visitor_management.settings_sqlite
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd VISITORS/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
```bash
   npx expo start
```

4. **Run on device/simulator:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### Visitor Management

#### Check-in Visitor
```http
POST /visitors/check_in/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "purpose": "Business meeting",
  "host_name": "Jane Smith",
  "photo_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "message": "Visitor checked in successfully",
  "visit": {
    "id": "uuid",
    "visitor_name": "John Doe",
    "visitor_email": "john@example.com",
    "visitor_phone": "+1234567890",
    "purpose": "Business meeting",
    "host_name": "Jane Smith",
    "check_in_time": "2024-01-15T10:30:00Z",
    "check_out_time": null,
    "duration_minutes": null,
    "duration_formatted": "N/A",
    "is_active": true,
    "status": "Checked In",
    "photos": []
  },
  "is_returning_visitor": false
}
```

#### Check-out Visitor
```http
POST /visitors/check_out/
Content-Type: application/json

{
  "visit_id": "uuid"
}
```

#### Get Active Visitors
```http
GET /visitors/active/
```

**Response:**
```json
{
  "active_visitors": [
    {
      "id": "uuid",
      "visitor_name": "John Doe",
      "visitor_email": "john@example.com",
      "visitor_phone": "+1234567890",
      "purpose": "Business meeting",
      "host_name": "Jane Smith",
      "check_in_time": "2024-01-15T10:30:00Z",
      "check_out_time": null,
      "duration_minutes": null,
      "duration_formatted": "N/A",
      "is_active": true,
      "status": "Checked In",
      "photos": []
    }
  ],
  "count": 1
}
```

#### Get Visit History
```http
GET /visitors/history/?name=John&email=john@example.com&date_from=2024-01-01&date_to=2024-01-31
```

**Query Parameters:**
- `name` - Filter by visitor name
- `email` - Filter by visitor email
- `phone` - Filter by visitor phone
- `date_from` - Filter from date (YYYY-MM-DD)
- `date_to` - Filter to date (YYYY-MM-DD)

#### Export Visit History
```http
GET /visitors/export/?name=John&date_from=2024-01-01
```

Returns CSV file with visit history.

#### Search Visitor
```http
GET /visitors/search/?email=john@example.com
GET /visitors/search/?phone=+1234567890
```

## Database Models

### Visitor
```python
class Visitor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Visit
```python
class Visit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE)
    purpose = models.TextField()
    host_name = models.CharField(max_length=200, blank=True)
    check_in_time = models.DateTimeField(auto_now_add=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
```

### VisitorPhoto
```python
class VisitorPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE)
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='visitor_photos/')
    created_at = models.DateTimeField(auto_now_add=True)
```

## Frontend Components

### Dashboard (`app/index.tsx`)
- Responsive grid layout with navigation cards
- Works on both phones and tablets
- Clean, modern UI design

### Check-in Screen (`app/check-in.tsx`)
- Form for visitor registration
- Photo capture functionality
- Auto-fill for returning visitors
- Host name tracking

### Active Visitors (`app/active-visitors.tsx`)
- Real-time list of checked-in visitors
- Photo display with fallback avatars
- Check-out functionality
- Status indicators

### Visit History (`app/history.tsx`)
- Complete visit records
- Advanced filtering options
- CSV export functionality
- Responsive design

## Responsive Design

The app uses responsive design principles:

- **Phone Layout**: Single column, stacked elements
- **Tablet Layout**: Multi-column, side-by-side elements
- **Breakpoint**: 768px width
- **Dynamic Sizing**: Font sizes and spacing adjust automatically

## Error Handling

### Frontend
- Network error handling with user-friendly messages
- Loading states for all API calls
- Form validation with clear error messages
- Graceful fallbacks for missing data

### Backend
- Comprehensive error responses
- Input validation
- Database constraint handling
- File upload error handling

## Development

### Running Tests
```bash
# Backend
cd backend
python manage.py test --settings=visitor_management.settings_sqlite

# Frontend
cd frontend
npm test
```

### Code Style
- Backend: Follows PEP 8
- Frontend: Uses TypeScript with strict mode
- Consistent naming conventions
- Comprehensive documentation

## Deployment

### Backend Deployment
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Set `DEBUG=False` in settings
4. Use production WSGI server (Gunicorn)

### Frontend Deployment
1. Build for production: `expo build`
2. Deploy to app stores or use EAS Build
3. Configure API endpoints for production

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all import paths are correct
2. **API Connection**: Check backend server is running
3. **Photo Upload**: Verify file permissions and storage
4. **Database Issues**: Run migrations and check SQLite file

### Debug Mode
- Backend: Set `DEBUG=True` in settings
- Frontend: Use React Native Debugger or Flipper

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License. 