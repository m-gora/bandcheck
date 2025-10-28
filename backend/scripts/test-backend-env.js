#!/usr/bin/env node

// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Now import our modules after environment is configured
import { Bands, Reviews } from '../dist/src/shared/Tables.js';
import { bandToEntity, reviewToEntity, generateId, entityToBand } from '../dist/src/shared/utils.js';

console.log('🧪 Testing Backend Functions with Proper Environment Loading');
console.log('============================================================');

console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Connection string set:', !!process.env.AZURE_STORAGE_CONNECTION_STRING);
console.log('');

async function testBackendFunctions() {
  try {
    // Wait for Azurite to be ready
    console.log('⏳ Waiting for Azurite to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('✅ Testing table creation and basic operations...');

    // Test 1: Create a test band
    console.log('\n1️⃣ Testing band creation...');
    const testBand = {
      id: 'test-' + generateId(),
      name: 'Test Backend Band',
      description: 'A test band for backend verification',
      genres: ['Test Rock', 'Backend Music'],
      location: 'Test City',
      formed: '2025',
      safetyStatus: 'pending',
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const bandEntity = bandToEntity(testBand);
    await Bands.createEntity(bandEntity);
    console.log('✅ Band created successfully:', testBand.name);

    // Test 2: Retrieve the band
    console.log('\n2️⃣ Testing band retrieval...');
    const retrievedBandEntity = await Bands.getEntity('band', testBand.id);
    const retrievedBand = entityToBand(retrievedBandEntity);
    console.log('✅ Band retrieved successfully:', retrievedBand.name);

    // Test 3: Create a review
    console.log('\n3️⃣ Testing review creation...');
    const testReview = {
      id: 'review-' + generateId(),
      bandId: testBand.id,
      userId: 'test-user-123',
      userDisplayName: 'Test User',
      safetyAssessment: 'safe',
      comment: 'This is a test review for backend verification',
      evidence: ['Backend test evidence 1', 'Backend test evidence 2'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const reviewEntity = reviewToEntity(testReview);
    await Reviews.createEntity(reviewEntity);
    console.log('✅ Review created successfully');

    // Test 4: List bands (simulate GetBands function)
    console.log('\n4️⃣ Testing band listing...');
    const entities = Bands.listEntities({
      queryOptions: {
        filter: `PartitionKey eq 'band'`
      }
    });

    let bandCount = 0;
    for await (const entity of entities) {
      const band = entityToBand(entity);
      console.log(`   📀 Found band: ${band.name}`);
      bandCount++;
    }
    console.log(`✅ Listed ${bandCount} band(s)`);

    // Test 5: List reviews for band (simulate GetBandDetails function)
    console.log('\n5️⃣ Testing review listing...');
    const reviewEntities = Reviews.listEntities({
      queryOptions: {
        filter: `PartitionKey eq '${testBand.id}'`
      }
    });

    let reviewCount = 0;
    for await (const entity of reviewEntities) {
      reviewCount++;
    }
    console.log(`✅ Listed ${reviewCount} review(s) for band`);

    console.log('\n🎉 All backend tests passed!');
    console.log('✨ Your backend functions are working correctly with Azurite');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Check if Azurite is running
async function checkAzurite() {
  try {
    const response = await fetch('http://localhost:10002/');
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const azuriteRunning = await checkAzurite();
  if (!azuriteRunning) {
    console.error('❌ Azurite is not running. Please start it first:');
    console.error('   npm run azurite:start');
    process.exit(1);
  }

  await testBackendFunctions();
}

main().catch(console.error);