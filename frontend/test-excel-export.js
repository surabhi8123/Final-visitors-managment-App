// Test script to verify Excel export functionality
const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://192.168.1.33:8000/api';

async function testExcelExport() {
  try {
    console.log('🔍 Testing Excel export functionality...');
    console.log('API Base URL:', API_BASE_URL);
    
    // Test the export endpoint
    const exportResponse = await axios.get(`${API_BASE_URL}/visitors/export/`);
    console.log('✅ Export endpoint accessible:', exportResponse.status);
    
    if (exportResponse.data) {
      console.log('📊 Export response data:', {
        message: exportResponse.data.message,
        filename: exportResponse.data.filename,
        count: exportResponse.data.count,
        hasData: !!exportResponse.data.data,
        dataLength: exportResponse.data.data ? exportResponse.data.data.length : 0
      });
      
      // Check if filename has .xlsx extension
      if (exportResponse.data.filename && exportResponse.data.filename.endsWith('.xlsx')) {
        console.log('✅ Filename has correct .xlsx extension');
      } else {
        console.log('❌ Filename does not have .xlsx extension:', exportResponse.data.filename);
      }
      
      // Check if data is base64 encoded
      if (exportResponse.data.data) {
        try {
          // Try to decode base64 to verify it's valid
          const decoded = Buffer.from(exportResponse.data.data, 'base64');
          console.log('✅ Data is valid base64 encoded');
          console.log('📏 Decoded data size:', decoded.length, 'bytes');
          
          // Save the Excel file for testing
          const filename = `test_${exportResponse.data.filename}`;
          fs.writeFileSync(filename, decoded);
          console.log('💾 Excel file saved as:', filename);
          
        } catch (error) {
          console.log('❌ Data is not valid base64:', error.message);
        }
      } else {
        console.log('❌ No data received in response');
      }
      
      console.log('🎉 Excel export test successful!');
      
    } else {
      console.log('⚠️ No response data received');
    }
    
  } catch (error) {
    console.error('❌ Excel export test failed:');
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

testExcelExport(); 