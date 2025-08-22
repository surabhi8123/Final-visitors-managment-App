# Backend-Frontend Connection Guide

## Quick Setup

### 1. Start the Backend Server

Make sure your backend is running:

```bash
cd VISITORS/backend
python manage.py runserver --settings=visitor_management.settings_sqlite
```

The backend should be accessible at: `http://127.0.0.1:8000` (localhost) and `http://192.168.1.19:8000` (network)

### 2. Frontend Configuration

The frontend is configured to connect to the backend at:
- **Mobile Devices**: `http://192.168.1.19:8000/api` (your computer's IP)
- **Simulator/Emulator**: `http://127.0.0.1:8000/api` (localhost)

### 3. Test the Connection

#### Option A: Using the Frontend App
1. Open the app
2. Login with `admin` / `admin123`
3. If you see a connection error, tap "Test Connection"
4. Check the console logs for detailed connection info

#### Option B: Using the Test Script
```bash
cd VISITORS/frontend
node test-connection.js
```

#### Option C: Browser Test
- Localhost: `http://127.0.0.1:8000/api/visitors/active/`
- Network: `http://192.168.1.19:8000/api/visitors/active/`

### 4. Available API Endpoints

The backend provides these endpoints:

- `GET /api/visitors/active/` - Get active visitors
- `POST /api/visitors/check_in/` - Check in a visitor
- `POST /api/visitors/check_out/` - Check out a visitor
- `GET /api/visitors/history/` - Get visit history
- `GET /api/visitors/export/` - Export visit history as CSV
- `GET /api/visitors/search/` - Search for existing visitors

## Troubleshooting

### Connection Issues

1. **Backend not running**
   - Make sure you're in the correct directory: `VISITORS/backend`
   - Run: `python manage.py runserver --settings=visitor_management.settings_sqlite`
   - Check that it shows: `Starting development server at http://127.0.0.1:8000/`

2. **Network connectivity issues**
   - **For mobile devices**: Use `http://192.168.1.19:8000` (your computer's IP)
   - **For simulators**: Use `http://127.0.0.1:8000` (localhost)
   - Make sure your mobile device and computer are on the same WiFi network

3. **CORS errors**
   - The backend is configured to allow all origins in development
   - Check that `CORS_ALLOW_ALL_ORIGINS = True` in settings

4. **IP Address Issues**
   - If `192.168.1.19` doesn't work, find your computer's actual IP:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr`
   - Update the IP in `frontend/app/config/api.ts`

### Testing the Connection

1. **Browser test**: Open `http://192.168.1.19:8000/api/visitors/active/` in your browser
2. **Frontend test**: Use the "Test Connection" button in the app
3. **Script test**: Run `node test-connection.js`

## API Configuration

The frontend API configuration is in: `frontend/app/config/api.ts`

Key settings:
- `base`: Main API URL for mobile devices (`http://192.168.1.19:8000/api`)
- `localhost`: Fallback URL for simulators (`http://127.0.0.1:8000/api`)
- `API_TIMEOUT`: Request timeout (15 seconds)

## Login

The app uses hardcoded credentials:
- **Username**: `admin`
- **Password**: `admin123`

No backend authentication is required - the login is handled client-side.

## Common Issues & Solutions

### "Network Error" on Mobile Device
- **Cause**: Mobile device can't reach `127.0.0.1` (that's the device's own localhost)
- **Solution**: Use your computer's IP address (`192.168.1.19`)

### "Connection Refused"
- **Cause**: Backend server not running
- **Solution**: Start the Django server

### "CORS Error"
- **Cause**: Browser blocking cross-origin requests
- **Solution**: Backend CORS is already configured, check network connectivity

### "Timeout Error"
- **Cause**: Network is slow or server is overloaded
- **Solution**: Check network connection and server status 