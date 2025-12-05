// Test script to check if the API is working
require('dotenv').config();
const { getRealTimeData } = require('../services/marketApiService');

const testAPI = async () => {
  console.log('🧪 Testing Real-Time Market API...\n');
  
  try {
    // Test 1: Fetch without filters
    console.log('Test 1: Fetching data without filters...');
    const data1 = await getRealTimeData({ limit: 10 });
    console.log(`✅ Received ${data1.length} records\n`);
    if (data1.length > 0) {
      console.log('Sample record:', JSON.stringify(data1[0], null, 2));
    }
    
    // Test 2: Fetch with state filter
    console.log('\nTest 2: Fetching data for Punjab...');
    const data2 = await getRealTimeData({ state: 'Punjab', limit: 5 });
    console.log(`✅ Received ${data2.length} records\n`);
    if (data2.length > 0) {
      console.log('Sample record:', JSON.stringify(data2[0], null, 2));
    }
    
    // Test 3: Fetch with crop filter
    console.log('\nTest 3: Fetching data for Wheat...');
    const data3 = await getRealTimeData({ crop: 'Wheat', limit: 5 });
    console.log(`✅ Received ${data3.length} records\n`);
    if (data3.length > 0) {
      console.log('Sample record:', JSON.stringify(data3[0], null, 2));
    }
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
  
  process.exit(0);
};

testAPI();

