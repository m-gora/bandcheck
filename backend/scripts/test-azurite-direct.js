#!/usr/bin/env node

// Direct Azurite test without module initialization issues

import { TableClient } from '@azure/data-tables';

async function testAzuriteDirectly() {
  console.log('🧪 Direct Azurite Connection Test');
  console.log('================================');

  const connectionString = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://localhost:10002/devstoreaccount1;';
  
  console.log('✅ Creating Table Client with connection string...');
  const tableClient = TableClient.fromConnectionString(connectionString, 'testbands', {
    allowInsecureConnection: true
  });
  
  try {
    console.log('✅ Testing table creation...');
    await tableClient.createTable();
    console.log('✅ Table created successfully');
    
    console.log('✅ Testing entity creation...');
    const testEntity = {
      partitionKey: 'test',
      rowKey: 'test-band-1',
      name: 'Test Band',
      description: 'A test band for direct Azurite testing',
      genres: JSON.stringify(['Test Rock']),
      safetyStatus: 'pending',
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await tableClient.createEntity(testEntity);
    console.log('✅ Entity created successfully');
    
    console.log('✅ Testing entity retrieval...');
    const retrievedEntity = await tableClient.getEntity('test', 'test-band-1');
    console.log('✅ Entity retrieved successfully:', retrievedEntity.name);
    
    console.log('✅ Testing entity listing...');
    const entities = tableClient.listEntities();
    let count = 0;
    for await (const entity of entities) {
      count++;
      console.log(`   📀 Found entity: ${entity.name}`);
    }
    console.log(`✅ Listed ${count} entity(ies)`);
    
    console.log('\n🎉 All direct Azurite tests passed!');
    console.log('✨ Backend can successfully connect to Azurite!');
    
  } catch (error) {
    if (error.statusCode === 409) {
      console.log('⚠️  Table already exists, continuing with existing table...');
      
      // Try to create entity anyway
      try {
        const testEntity = {
          partitionKey: 'test',
          rowKey: 'direct-test-' + Date.now(),
          name: 'Direct Test Band',
          description: 'A test band for direct Azurite testing',
          genres: JSON.stringify(['Test Rock']),
          safetyStatus: 'pending',
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await tableClient.createEntity(testEntity);
        console.log('✅ Entity created in existing table');
        console.log('\n🎉 Direct Azurite connection works!');
        
      } catch (entityError) {
        console.error('❌ Entity creation failed:', entityError.message);
      }
    } else {
      console.error('❌ Test failed:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Check if Azurite is running first
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

  await testAzuriteDirectly();
}

main().catch(console.error);