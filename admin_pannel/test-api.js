// Simple test script to verify Next.js API routes
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Next.js Backend API Routes\n');

  // Test basic route
  try {
    console.log('1. Testing basic route...');
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    console.log('✅ Basic route:', data);
  } catch (error) {
    console.log('❌ Basic route failed:', error.message);
  }

  // Test users route
  try {
    console.log('\n2. Testing users route...');
    const response = await fetch(`${BASE_URL}/users`);
    const data = await response.json();
    console.log('✅ Users route:', data.success ? 'Success' : 'Failed');
  } catch (error) {
    console.log('❌ Users route failed:', error.message);
  }

  // Test cars route
  try {
    console.log('\n3. Testing cars route...');
    const response = await fetch(`${BASE_URL}/cars`);
    const data = await response.json();
    console.log('✅ Cars route:', data.success ? 'Success' : 'Failed');
  } catch (error) {
    console.log('❌ Cars route failed:', error.message);
  }

  // Test pending cars route
  try {
    console.log('\n4. Testing pending cars route...');
    const response = await fetch(`${BASE_URL}/cars/pending`);
    const data = await response.json();
    console.log('✅ Pending cars route:', data.success ? 'Success' : 'Failed');
  } catch (error) {
    console.log('❌ Pending cars route failed:', error.message);
  }

  console.log('\n🎉 API testing completed!');
  console.log('\n📝 To run this test:');
  console.log('1. Start the Next.js server: npm run dev');
  console.log('2. Run this script: node test-api.js');
}

// Only run if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
