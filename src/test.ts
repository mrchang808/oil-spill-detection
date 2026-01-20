/**
 * Copernicus API Test Script
 * Tests authentication and fetches real satellite imagery
 * 
 * Run this in your browser console or create a test component
 */

import { CopernicusAuth } from './services/copernicus/copernicusAuth';
import { CopernicusService } from './services/copernicus/copernicusAPI';

/**
 * Test 1: Check Authentication
 */
export async function testCopernicusAuth() {
  console.log('🧪 Testing Copernicus Authentication...');
  
  try {
    const token = await CopernicusAuth.getAccessToken();
    console.log('✅ Authentication successful!');
    console.log(`📝 Token: ${token.substring(0, 20)}...`);
    console.log(`⏰ Expires in: ${CopernicusAuth.getTimeUntilExpiry()} seconds`);
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    console.error('💡 Make sure your .env file has:');
    console.error('   VITE_COPERNICUS_CLIENT_ID=your_client_id');
    console.error('   VITE_COPERNICUS_CLIENT_SECRET=your_client_secret');
    return false;
  }
}

/**
 * Test 2: Fetch SAR Imagery for a Location
 */
export async function testFetchSARImagery() {
  console.log('🧪 Testing SAR Imagery Fetch...');
  
  // Test with one of your oil spill locations
  const testLocation = {
    latitude: 25.0343,  // One of your detections
    longitude: -71.2847,
    date: new Date('2025-10-30')
  };
  
  try {
    const startDate = new Date(testLocation.date);
    startDate.setDate(startDate.getDate() - 3); // 3 days before
    
    const endDate = new Date(testLocation.date);
    endDate.setDate(endDate.getDate() + 3); // 3 days after
    
    console.log(`📍 Searching for imagery near ${testLocation.latitude}, ${testLocation.longitude}`);
    console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const sarProducts = await CopernicusService.searchSentinel1SAR({
      latitude: testLocation.latitude,
      longitude: testLocation.longitude,
      startDate,
      endDate,
      bufferKm: 50
    });
    
    console.log(`✅ Found ${sarProducts.length} SAR products`);
    
    if (sarProducts.length > 0) {
      console.log('📊 First product details:');
      console.log(sarProducts[0]);
      return sarProducts;
    } else {
      console.warn('⚠️ No SAR products found. Try adjusting date range or location.');
      return [];
    }
  } catch (error) {
    console.error('❌ SAR imagery fetch failed:', error);
    return [];
  }
}

/**
 * Test 3: Fetch Optical Imagery
 */
export async function testFetchOpticalImagery() {
  console.log('🧪 Testing Optical Imagery Fetch...');
  
  const testLocation = {
    latitude: 25.0343,
    longitude: -71.2847,
    date: new Date('2025-10-30')
  };
  
  try {
    const startDate = new Date(testLocation.date);
    startDate.setDate(startDate.getDate() - 3);
    
    const endDate = new Date(testLocation.date);
    endDate.setDate(endDate.getDate() + 3);
    
    console.log(`📍 Searching for optical imagery near ${testLocation.latitude}, ${testLocation.longitude}`);
    
    const opticalProducts = await CopernicusService.searchSentinel2MSI({
      latitude: testLocation.latitude,
      longitude: testLocation.longitude,
      startDate,
      endDate,
      bufferKm: 50,
      maxCloudCoverage: 20
    });
    
    console.log(`✅ Found ${opticalProducts.length} optical products`);
    
    if (opticalProducts.length > 0) {
      console.log('📊 First product details:');
      console.log(opticalProducts[0]);
      return opticalProducts;
    } else {
      console.warn('⚠️ No optical products found. Try adjusting cloud coverage or date range.');
      return [];
    }
  } catch (error) {
    console.error('❌ Optical imagery fetch failed:', error);
    return [];
  }
}

/**
 * Run All Tests
 */
export async function runAllCopernicusTests() {
  console.log('🚀 Running all Copernicus tests...\n');
  
  // Test 1: Authentication
  const authSuccess = await testCopernicusAuth();
  if (!authSuccess) {
    console.error('❌ Cannot continue - authentication failed');
    return;
  }
  
  console.log('\n---\n');
  
  // Test 2: SAR Imagery
  const sarProducts = await testFetchSARImagery();
  
  console.log('\n---\n');
  
  // Test 3: Optical Imagery
  const opticalProducts = await testFetchOpticalImagery();
  
  console.log('\n---\n');
  console.log('🎉 All tests complete!');
  console.log(`📊 Summary:`);
  console.log(`   - SAR products found: ${sarProducts.length}`);
  console.log(`   - Optical products found: ${opticalProducts.length}`);
  
  return {
    authSuccess,
    sarProducts,
    opticalProducts
  };
}

/**
 * Quick Test Function - Paste in Browser Console
 */
export const quickTest = `
// Quick Copernicus Test - Paste this in your browser console:
(async () => {
  const { CopernicusAuth } = await import('./services/copernicus/copernicusAuth');
  const { CopernicusService } = await import('./services/copernicus/copernicusAPI');
  
  console.log('🧪 Testing Copernicus...');
  
  try {
    const token = await CopernicusAuth.getAccessToken();
    console.log('✅ Auth successful! Token:', token.substring(0, 20) + '...');
    
    const products = await CopernicusService.searchSentinel1SAR({
      latitude: 25.0343,
      longitude: -71.2847,
      startDate: new Date('2025-10-27'),
      endDate: new Date('2025-11-02'),
      bufferKm: 50
    });
    
    console.log(\`✅ Found \${products.length} SAR products\`);
    console.table(products.map(p => ({
      title: p.title,
      date: new Date(p.acquisition_date).toLocaleDateString(),
      platform: p.platform
    })));
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
`;