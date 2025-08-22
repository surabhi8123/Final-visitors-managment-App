# Troubleshooting Guide

## Network and API Connection Issues

### 1. Axios Network Error

If you're getting "Network Error" from Axios, follow these steps:

#### Check Backend Server
1. Ensure your Django backend is running:
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. Test the API endpoint in your browser:
   ```
   http://localhost:8000/api/visitors/active/
   ```
   
   **Note**: `0.0.0.0:8000` is not a valid URL to access in a browser. Use `localhost:8000` instead.

#### Check IP Address Configuration
1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig` or `ip addr` in Terminal

2. Update the IP address in `app/config/api.ts`:
   ```typescript
   lan: 'http://YOUR_IP_ADDRESS:8000/api',
   ```

#### CORS Issues
If you're getting CORS errors, ensure your Django backend has the correct CORS settings:

1. Check `backend/visitor_management/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:19006",
       "http://127.0.0.1:19006",
       "http://localhost:3000",
       "http://127.0.0.1:3000",
       "http://YOUR_IP_ADDRESS:19006",
       "http://YOUR_IP_ADDRESS:8081",
       "http://YOUR_IP_ADDRESS:3000",
   ]
   ```

2. Add your device's IP address to the list if needed.

### 2. Development vs Production API URLs

The app automatically switches between different API URLs:

- **Development (Simulator/Emulator)**: `http://localhost:8000/api`
- **Development (Physical Device)**: `http://YOUR_IP_ADDRESS:8000/api`
- **Production**: Configure in `app/config/api.ts`

### 3. Testing API Connection

You can test the API connection by:

1. Opening the app
2. Going to the "Active Visitors" screen
3. Checking the console logs for any error messages

### 4. Common Solutions

#### Solution 1: Use Localhost for Development
If you're testing on a simulator/emulator, the app should automatically use localhost.

#### Solution 2: Use LAN IP for Physical Devices
1. Make sure your phone and computer are on the same WiFi network
2. Update the IP address in `app/config/api.ts`
3. Restart the Expo development server

#### Solution 3: Check Firewall Settings
Ensure your computer's firewall allows connections on port 8000.

#### Solution 4: Use Expo Tunnel
If LAN connection doesn't work, try using Expo tunnel:
```bash
npx expo start --tunnel
```

### 5. Debugging Tips

1. **Check Console Logs**: Look for detailed error messages in the console
2. **Test API Manually**: Use Postman or curl to test API endpoints
3. **Check Network Tab**: Use browser dev tools to see network requests
4. **Verify Backend**: Ensure Django server is running and accessible

### 6. Environment Variables

You can also use environment variables to configure the API URL:

1. Create a `.env` file in the frontend directory:
   ```
   API_BASE_URL=http://your-ip-address:8000/api
   ```

2. Update `app/config/api.ts` to use the environment variable:
   ```typescript
   const API_BASE_URL = process.env.API_BASE_URL || getApiBaseUrl();
   ```

## Expo Router Issues

### 1. Missing Default Export Warning

This has been fixed by adding a default export to `app/types/index.ts`.

### 2. Linking Scheme Warning

This has been fixed by adding the `scheme` property to both `app.json` and `expo.json`.

## Database Issues

### PostgreSQL Connection

If you're having database connection issues:

1. Ensure PostgreSQL is running
2. Check the database settings in `backend/visitor_management/settings.py`
3. Verify the database credentials in your `.env` file
4. Run migrations: `python manage.py migrate` 