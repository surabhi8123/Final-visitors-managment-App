# Network Troubleshooting Guide

## Quick Fix Steps

### 1. **Start the Backend Server Properly**
```bash
cd VISITORS/backend
python start_server.py
```

This will start the server on `0.0.0.0:8000` (all interfaces) instead of just `127.0.0.1:8000`.

### 2. **Find Your Computer's Actual IP Address**

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

### 3. **Update the Frontend Configuration**
Edit `frontend/app/config/api.ts` and update the IP address:
```typescript
base: 'http://YOUR_ACTUAL_IP:8000/api',
```

### 4. **Test the Connection**
- Open your browser and go to: `http://YOUR_IP:8000/api/visitors/active/`
- You should see JSON data if the server is accessible

## Common Issues & Solutions

### ❌ **"Network Error" on Mobile Device**

**Cause:** Mobile device can't reach your computer's IP address

**Solutions:**
1. **Check WiFi Network**: Ensure both devices are on the same WiFi network
2. **Find Correct IP**: Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to get your actual IP
3. **Update Configuration**: Change the IP in `frontend/app/config/api.ts`
4. **Test in Browser**: Try accessing `http://YOUR_IP:8000` in your computer's browser

### ❌ **"Connection Refused"**

**Cause:** Django server not running or not accessible

**Solutions:**
1. **Start Server Properly**: Use `python start_server.py` instead of `manage.py runserver`
2. **Check Port**: Make sure port 8000 is not blocked by firewall
3. **Check Server Logs**: Look for any error messages in the Django console

### ❌ **"CORS Error"**

**Cause:** Browser blocking cross-origin requests

**Solutions:**
1. **CORS is Already Configured**: The backend has CORS settings for mobile development
2. **Check Network**: This is usually a network connectivity issue, not CORS
3. **Use Mobile App**: CORS doesn't apply to React Native apps

### ❌ **"Timeout Error"**

**Cause:** Network is slow or server is overloaded

**Solutions:**
1. **Reduce Timeout**: Already set to 10 seconds for mobile
2. **Check Network Speed**: Ensure stable WiFi connection
3. **Restart Server**: Sometimes helps with performance issues

## Step-by-Step Debugging

### Step 1: Verify Backend is Running
```bash
cd VISITORS/backend
python start_server.py
```

You should see:
```
🚀 Starting Django server for mobile development...
📍 Server will be accessible at:
   - Local: http://127.0.0.1:8000
   - Network: http://192.168.1.38:8000
```

### Step 2: Test Local Access
Open your computer's browser and go to:
- `http://127.0.0.1:8000/api/visitors/active/`
- `http://192.168.1.38:8000/api/visitors/active/`

Both should return JSON data.

### Step 3: Find Your IP Address
**Windows:**
```cmd
ipconfig | findstr "IPv4"
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Step 4: Update Frontend Configuration
Edit `frontend/app/config/api.ts`:
```typescript
development: {
  base: 'http://YOUR_ACTUAL_IP:8000/api',
  // ...
}
```

### Step 5: Test Mobile Connection
1. Open the app
2. Login with `admin` / `admin123`
3. Tap "Test Connection" if you see errors
4. Check console logs for detailed error messages

## Firewall Configuration

### Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings"
4. Find Python or add a new rule for port 8000
5. Allow on both Private and Public networks

### Mac Firewall
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Add Python and allow incoming connections

### Linux Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 8000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## Alternative Solutions

### Option 1: Use ngrok (Temporary)
```bash
# Install ngrok
npm install -g ngrok

# Start Django server
python start_server.py

# In another terminal, create tunnel
ngrok http 8000

# Use the ngrok URL in your app
```

### Option 2: Use Expo Development Build
```bash
# Create development build
expo run:android --device

# This allows better network access
```

### Option 3: Use Android Emulator
- Android emulator can access `10.0.2.2:8000` (maps to host's localhost)
- Update config to use `http://10.0.2.2:8000/api`

## Testing Commands

### Test Backend API
```bash
# Option 1: Test with localhost (if testing from same machine)
curl http://localhost:8000/api/visitors/active/

# Option 2: Test with your actual IP (replace with your IP)
curl http://192.168.1.19:8000/api/visitors/active/

# Option 3: Test with verbose output to see what's happening
curl -v http://192.168.1.19:8000/api/visitors/active/

# Option 4: Test with timeout and error handling
curl --connect-timeout 10 --max-time 30 http://192.168.1.19:8000/api/visitors/active/

# Option 5: Test if server is running at all
curl http://192.168.1.19:8000/

# Option 6: Test with different endpoints
curl http://192.168.1.19:8000/api/visitors/
curl http://192.168.1.19:8000/api/visits/
```

### Quick Fix Commands
```bash
# 1. Start the Django server (if not running)
cd backend
python start_server.py

# 2. Check if port 8000 is in use
# Windows
netstat -an | findstr :8000

# Mac/Linux
lsof -i :8000

# 3. Kill any process using port 8000 (if needed)
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9

# 4. Test with curl using different methods
curl -X GET http://192.168.1.19:8000/api/visitors/active/
curl -H "Accept: application/json" http://192.168.1.19:8000/api/visitors/active/
```

## Success Indicators

✅ **Backend Server Running:**
```
Starting development server at http://0.0.0.0:8000/
```

✅ **Browser Test Successful:**
```
{"active_visitors":[],"count":0}
```

✅ **Mobile App Connected:**
```
✅ API connection successful: http://192.168.1.19:8000/api
```

✅ **Dashboard Loading:**
No connection errors, data loads properly 