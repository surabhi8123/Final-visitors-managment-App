// Test script to verify visit history endpoint
const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.19:8000/api';

async function testVisitHistory() {
  try {
    console.log('🔍 Testing visit history endpoint...');
    console.log('API Base URL:', API_BASE_URL);
    
    // Test the visit history endpoint
    const historyResponse = await axios.get(`${API_BASE_URL}/visitors/history/`);
    console.log('✅ Visit history endpoint accessible:', historyResponse.status);
    console.log('📊 Response data:', JSON.stringify(historyResponse.data, null, 2));
    
    if (historyResponse.data && historyResponse.data.visits) {
      console.log(`📈 Found ${historyResponse.data.visits.length} visits`);
      
      if (historyResponse.data.visits.length > 0) {
        const firstVisit = historyResponse.data.visits[0];
        console.log('👤 Sample visit data:', {
          id: firstVisit.id,
          visitor_name: firstVisit.visitor_name,
          visitor_email: firstVisit.visitor_email,
          visitor_phone: firstVisit.visitor_phone,
          purpose: firstVisit.purpose,
          check_in_time: firstVisit.check_in_time,
          check_out_time: firstVisit.check_out_time,
          is_active: firstVisit.is_active,
          status: firstVisit.status,
          photos_count: firstVisit.photos ? firstVisit.photos.length : 0
        });
      }
    } else {
      console.log('⚠️ No visits data in response');
    }
    
    console.log('🎉 Visit history test successful!');
    
  } catch (error) {
    console.error('❌ Visit history test failed:');
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

testVisitHistory(); 