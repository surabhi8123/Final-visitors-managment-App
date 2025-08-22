# Camera Feature Implementation

## Overview
This document describes the camera feature implementation for the Visitor Management System, allowing users to take photos during visitor check-in.

## Features Implemented

### Frontend (React Native/Expo)
- ✅ **Camera Integration**: Uses `expo-image-picker` for camera access
- ✅ **Photo Capture**: "Take Photo" button launches camera
- ✅ **Gallery Selection**: "Choose from Gallery" option
- ✅ **Photo Preview**: Shows captured/selected photo with retake option
- ✅ **Photo Removal**: Remove button to clear selected photo
- ✅ **Responsive Design**: Works on phones and tablets
- ✅ **Permission Handling**: Requests camera permissions with user-friendly alerts
- ✅ **Error Handling**: Graceful error handling for camera/gallery operations

### Backend (Django)
- ✅ **Multipart Upload**: Handles `multipart/form-data` for photo uploads
- ✅ **File Storage**: Saves photos to `media/visitor_photos/` directory
- ✅ **Database Integration**: Links photos to visitor and visit records
- ✅ **Media Serving**: Serves uploaded photos via Django media URLs
- ✅ **Validation**: Validates photo uploads and file types

## Technical Implementation

### Frontend Components
1. **Camera Functions**:
   - `takePhoto()`: Launches camera with permission check
   - `pickImage()`: Opens gallery for photo selection
   - `removePhoto()`: Clears selected photo
   - `requestCameraPermission()`: Handles camera permissions

2. **UI Components**:
   - Photo preview with remove button overlay
   - Responsive button layout (Take Photo / Choose from Gallery)
   - Retake and Choose Different options when photo is selected

3. **API Integration**:
   - Uses `FormData` for multipart uploads
   - Handles both photo and non-photo check-ins
   - Proper error handling and user feedback

### Backend Components
1. **Model Updates**:
   - `VisitorPhoto` model already exists and handles photo storage
   - Links photos to both visitor and visit records

2. **Serializer Updates**:
   - `CheckInSerializer` now accepts `photo` field for file uploads
   - Maintains backward compatibility with `photo_data` field

3. **View Updates**:
   - `check_in` action handles `request.FILES.get('photo')`
   - Creates `VisitorPhoto` records for uploaded photos
   - Returns proper response with visit details

4. **Settings**:
   - Media files configured in Django settings
   - Development media serving enabled
   - CORS configured for photo uploads

## Usage

### Taking a Photo
1. Tap "Take Photo" button
2. Grant camera permission if prompted
3. Take photo using device camera
4. Crop/edit photo if needed
5. Confirm photo selection

### Selecting from Gallery
1. Tap "Choose from Gallery" button
2. Select photo from device gallery
3. Crop/edit photo if needed
4. Confirm photo selection

### Managing Photos
- **Remove**: Tap the X button on photo preview
- **Retake**: Tap "Retake Photo" to use camera again
- **Choose Different**: Tap "Choose Different" to select from gallery

## File Structure
```
VISITORS/
├── frontend/
│   ├── app/
│   │   ├── check-in.tsx          # Updated with camera functionality
│   │   └── services/
│   │       └── api.ts            # Updated for multipart uploads
│   └── src/
│       └── types/
│           └── index.ts          # CheckInData interface
└── backend/
    ├── visitors/
    │   ├── models.py             # VisitorPhoto model
    │   ├── serializers.py        # Updated CheckInSerializer
    │   └── views.py              # Updated check_in action
    └── visitor_management/
        ├── settings_sqlite.py    # Media configuration
        └── urls.py               # Media serving
```

## Dependencies
- **Frontend**: `expo-image-picker` (already installed)
- **Backend**: `Pillow` for image processing (Django default)

## Testing
1. **Camera Permission**: Test on device (not simulator)
2. **Photo Upload**: Verify photos are saved to `media/visitor_photos/`
3. **Database**: Check `VisitorPhoto` records are created
4. **Responsive**: Test on different screen sizes
5. **Error Handling**: Test with invalid files, network issues

## Security Considerations
- File type validation (images only)
- File size limits (handled by Django)
- Secure file storage in `media/` directory
- CORS configuration for uploads

## Future Enhancements
- Photo compression for better performance
- Multiple photo uploads per visit
- Photo editing features (filters, cropping)
- Photo backup and sync
- Photo search and filtering in history 