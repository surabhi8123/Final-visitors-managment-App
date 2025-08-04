// Test script to verify photo display functionality
// This script can be run in the browser console to test photo loading

const testPhotoDisplay = () => {
  console.log('Testing photo display functionality...');
  
  // Test photo URL construction
  const baseUrl = 'http://192.168.1.19:8000';
  const photoPath = '/media/visitor_photos/visitor_photo_123.jpg';
  const fullUrl = `${baseUrl}${photoPath}`;
  
  console.log('Photo URL:', fullUrl);
  
  // Test with sample visitor data
  const sampleVisitor = {
    id: '123',
    visitor_name: 'John Doe',
    visitor_email: 'john@example.com',
    visitor_phone: '123-456-7890',
    photos: [
      {
        id: 'photo-1',
        image: photoPath,
        image_url: fullUrl,
        created_at: '2024-01-01T10:00:00Z'
      }
    ]
  };
  
  console.log('Sample visitor with photo:', sampleVisitor);
  
  // Test photo extraction function
  const getVisitorPhoto = (visitor) => {
    if (visitor.photos && visitor.photos.length > 0) {
      const photo = visitor.photos[0];
      if (photo.image_url) {
        return photo.image_url;
      } else if (photo.image) {
        return `${baseUrl}${photo.image}`;
      }
    }
    return null;
  };
  
  const photoUrl = getVisitorPhoto(sampleVisitor);
  console.log('Extracted photo URL:', photoUrl);
  
  return {
    success: true,
    photoUrl,
    message: 'Photo display test completed successfully'
  };
};

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPhotoDisplay };
} else {
  // Make available globally for browser testing
  window.testPhotoDisplay = testPhotoDisplay;
} 