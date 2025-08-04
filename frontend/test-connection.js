// Simple test script to verify backend connection
const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.19:8000/api';

async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    console.log('API Base URL:', API_BASE_URL);
    
    // Test the home endpoint
    const homeResponse = await axios.get('http://192.168.1.19:8000/');
    console.log('✅ Home endpoint accessible:', homeResponse.status);
    
    // Test the API active visitors endpoint
    const apiResponse = await axios.get(`${API_BASE_URL}/visitors/active/`);
    console.log('✅ API endpoint accessible:', apiResponse.status);
    console.log('Response data:', apiResponse.data);
    
    console.log('🎉 Backend connection successful!');
    
  } catch (error) {
    console.error('❌ Backend connection failed:');
    if (error.code === 'ECONNREFUSED') {
      console.error('   - Backend server is not running');
      console.error('   - Make sure to run: python manage.py runserver --settings=visitor_management.settings_sqlite');
    } else if (error.response) {
      console.error('   - Server responded with error:', error.response.status);
      console.error('   - Error data:', error.response.data);
    } else {
      console.error('   - Network error:', error.message);
    }
  }
}

testBackendConnection(); 