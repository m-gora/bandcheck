#!/usr/bin/env node

// Test data seeding script for local development
import { Bands, Reviews } from '../src/shared/Tables.js';
import { bandToEntity, reviewToEntity, generateId } from '../src/shared/utils.js';

const testBands = [
  {
    id: 'test-band-1',
    name: 'Arctic Monkeys',
    description: 'English rock band formed in Sheffield in 2002.',
    genres: ['Indie Rock', 'Alternative Rock'],
    location: 'Sheffield, UK',
    formed: '2002',
    website: 'https://arcticmonkeys.com',
    members: ['Alex Turner', 'Matt Helders', 'Jamie Cook', 'Nick O\'Malley'],
    safetyStatus: 'safe',
    reviewCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-band-2', 
    name: 'The Beatles',
    description: 'English rock band that became internationally famous.',
    genres: ['Rock', 'Pop', 'Psychedelic Rock'],
    location: 'Liverpool, UK',
    formed: '1960',
    website: 'https://thebeatles.com',
    members: ['John Lennon', 'Paul McCartney', 'George Harrison', 'Ringo Starr'],
    safetyStatus: 'safe',
    reviewCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-band-3',
    name: 'Test Pending Band',
    description: 'A band with few reviews to test pending status.',
    genres: ['Test Genre'],
    location: 'Test City',
    formed: '2023',
    safetyStatus: 'pending',
    reviewCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const testReviews = [
  {
    id: generateId(),
    bandId: 'test-band-1',
    userId: 'user-1',
    userDisplayName: 'Test User 1',
    safetyAssessment: 'safe',
    comment: 'Great family-friendly rock music. Clean lyrics and positive messages.',
    evidence: ['Reviewed entire discography', 'No explicit content found', 'Positive fan community'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    bandId: 'test-band-2',
    userId: 'user-2', 
    userDisplayName: 'Test User 2',
    safetyAssessment: 'safe',
    comment: 'Classic rock legends with timeless, appropriate content.',
    evidence: ['Analyzed top 50 songs', 'Family-friendly themes', 'Historical significance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  try {
    // Wait a bit for Azurite to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Seed bands
    console.log('📀 Adding test bands...');
    for (const band of testBands) {
      try {
        const entity = bandToEntity(band);
        await Bands.createEntity(entity);
        console.log(`✅ Added band: ${band.name}`);
      } catch (error) {
        if (error.statusCode === 409) {
          console.log(`⚠️  Band ${band.name} already exists`);
        } else {
          console.error(`❌ Error adding band ${band.name}:`, error.message);
        }
      }
    }
    
    // Seed reviews
    console.log('📝 Adding test reviews...');
    for (const review of testReviews) {
      try {
        const entity = reviewToEntity(review);
        await Reviews.createEntity(entity);
        console.log(`✅ Added review for band: ${review.bandId}`);
      } catch (error) {
        if (error.statusCode === 409) {
          console.log(`⚠️  Review already exists`);
        } else {
          console.error(`❌ Error adding review:`, error.message);
        }
      }
    }
    
    console.log('🎉 Test data seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestData();
}

export { seedTestData };