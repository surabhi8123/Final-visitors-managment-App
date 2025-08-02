# Camera Troubleshooting Guide

## 🎯 **Camera Not Showing Face - Quick Fixes**

### **1. Camera Permissions**
- **Check Settings**: Go to your device Settings → Apps → Expo Go → Permissions
- **Enable Camera**: Make sure camera permission is enabled
- **Enable Microphone**: Some devices require microphone permission for camera

### **2. Camera Type**
- **Front Camera**: The app now defaults to front camera (selfie mode)
- **Toggle Camera**: Use the "Front/Back Camera" button to switch
- **Try Both**: Some devices work better with back camera

### **3. Device-Specific Issues**

#### **Android Devices**
- **Clear Cache**: Settings → Apps → Expo Go → Storage → Clear Cache
- **Force Stop**: Settings → Apps → Expo Go → Force Stop, then restart
- **Update Expo Go**: Get the latest version from Google Play Store

#### **iOS Devices**
- **Privacy Settings**: Settings → Privacy & Security → Camera → Expo Go
- **Reset Permissions**: Settings → General → Reset → Reset Location & Privacy
- **Update Expo Go**: Get the latest version from App Store

### **4. App-Specific Solutions**

#### **If Camera Opens But No Preview**
1. **Close and Reopen**: Close Expo Go completely and restart
2. **Restart Device**: Sometimes a device restart helps
3. **Try Gallery First**: Use "Choose from Gallery" to test if the app works

#### **If Camera Doesn't Open**
1. **Check Internet**: Ensure stable internet connection
2. **Restart Expo Server**: Stop and restart the development server
3. **Clear App Data**: Uninstall and reinstall Expo Go

### **5. Development Server Commands**

```bash
# Restart the development server
cd VISITORS/frontend
npx expo start --clear

# If that doesn't work, try:
npx expo start --tunnel
```

### **6. Testing Steps**

1. **Test on Physical Device** (not simulator)
2. **Grant All Permissions** when prompted
3. **Try Both Camera Types** (front and back)
4. **Test Gallery Selection** as backup
5. **Check Photo Preview** after capture

## 🔧 **Responsiveness Issues - Fixed**

### **What's Been Improved:**
- ✅ **Better Button Layout**: Camera options are now properly arranged
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Touch Targets**: Minimum 48px height for easy tapping
- ✅ **Proper Spacing**: Consistent gaps and margins
- ✅ **Camera Toggle**: Easy switch between front/back cameras

### **Screen Size Support:**
- **Small Phones** (< 375px): Compact layout with smaller elements
- **Regular Phones** (375-768px): Standard layout
- **Tablets** (> 768px): Expanded layout with side-by-side elements

## 🚀 **Quick Test Commands**

```bash
# Backend (Terminal 1)
cd VISITORS/backend
python manage.py runserver 0.0.0.0:8000 --settings=visitor_management.settings_sqlite

# Frontend (Terminal 2)
cd VISITORS/frontend
npx expo start --clear
```

## 📱 **Expected Behavior**

1. **Camera Opens**: Should show camera preview immediately
2. **Face Detection**: Front camera should show your face clearly
3. **Photo Capture**: Tap shutter button to take photo
4. **Photo Preview**: Shows captured photo with retake option
5. **Upload Success**: Photo uploads with visitor data

## ⚠️ **If Still Not Working**

1. **Try Different Device**: Test on another phone/tablet
2. **Check Expo Version**: Ensure latest Expo Go app
3. **Network Issues**: Try using tunnel mode: `npx expo start --tunnel`
4. **Backend Connection**: Verify backend is running and accessible

## 🎯 **Success Indicators**

- ✅ Camera preview shows your face
- ✅ Photo captures successfully
- ✅ Photo preview displays correctly
- ✅ Upload completes without errors
- ✅ Photo appears in visit history

**The camera feature is fully functional and responsive. If you're still having issues, try the troubleshooting steps above!** 🚀 