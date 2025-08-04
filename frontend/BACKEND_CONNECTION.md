# Backend Connection Guide

This guide explains how to connect your React Native frontend to your Django backend.

## Current Configuration

Your frontend is configured to connect to your Django backend at:
- **IP Address**: `192.168.1.19`
- **Port**: `8000`
- **API Base URL**: `http://192.168.1.19:8000/api`

## Setup Instructions

### 1. Start Your Django Backend

Make sure your Django backend is running:

```bash
cd VISITORS/backend
python manage.py runserver 0.0.0.0:8000
```

**Important**: Use `0.0.0.0:8000` instead of `localhost:8000` to allow external connections.

### 2. Verify Backend is Accessible

Test if your backend is accessible from your computer:

```bash
curl http://192.168.1.19:8000/api/visitors/active/
```

You should see a JSON response with visitor data.

### 3. Start Your Frontend

```bash
cd VISITORS/frontend
npx expo start
```

### 4. Test the Connection

1. **Login** to the app with credentials: `admin` / `admin123`
2. **Check the Dashboard** - you should see connection status in the header
3. **Use the Test Connection button** if you see connection errors
4. **Check the console logs** for connection details

## Connection Status Indicators

The app shows connection status in the header:

- 🟢 **Green WiFi icon**: Connected to backend
- 🟡 **Yellow WiFi icon**: Checking connection
- 🔴 **Red WiFi icon**: Disconnected from backend

## Troubleshooting

### If Connection Fails:

1. **Check if backend is running**:
   ```bash
   curl http://192.168.1.19:8000/api/visitors/active/
   ```

2. **Check your IP address**:
   ```bash
   ipconfig
   ```
   Update the IP in `app/config/api.ts` if it changed.

3. **Check firewall settings**:
   - Make sure port 8000 is not blocked
   - Allow Django through Windows Firewall

4. **Check CORS settings**:
   - Ensure Django CORS is configured for your device's IP
   - Check `backend/visitor_management/settings.py`

### For Different Environments:

- **Simulator/Emulator**: Uses `127.0.0.1:8000`
- **Physical Device**: Uses `192.168.1.19:8000`
- **Production**: Uses your production URL

## API Endpoints

The frontend connects to these Django endpoints:

- `GET /api/visitors/active/` - Get active visitors
- `POST /api/visitors/check_in/` - Check in a visitor
- `POST /api/visitors/check_out/` - Check out a visitor
- `GET /api/visitors/history/` - Get visit history

## Configuration Files

- **API Config**: `app/config/api.ts`
- **API Service**: `app/services/api.ts`
- **Connection Test**: Available in dashboard

## Testing the Connection

1. Start both backend and frontend
2. Login to the app
3. Check the dashboard for connection status
4. Try the "Test Connection" button if needed
5. Check console logs for detailed connection info

The app will automatically test the connection when you load the dashboard and show the status in the header. 