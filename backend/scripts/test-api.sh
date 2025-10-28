#!/bin/bash

# Simple script to test backend functions using curl

BASE_URL="http://localhost:7071"

echo "🧪 Testing BandCheck Backend Functions"
echo "======================================"

echo ""
echo "1. Testing GetBands endpoint..."
curl -s -X GET "${BASE_URL}/api/bands" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ GetBands failed"

echo ""
echo "2. Testing GetBands with search..."
curl -s -X GET "${BASE_URL}/api/bands?search=arctic" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ GetBands search failed"

echo ""
echo "3. Testing GetBandDetails..."
curl -s -X GET "${BASE_URL}/api/bands/test-band-1" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ GetBandDetails failed"

echo ""
echo "4. Testing SubmitBand..."
curl -s -X POST "${BASE_URL}/api/bands" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test New Band",
    "description": "A brand new test band for API testing",
    "genres": ["Test Rock", "Alternative"],
    "location": "Test City, TC",
    "formed": "2024"
  }' | jq '.' || echo "❌ SubmitBand failed"

echo ""
echo "5. Testing ReviewBand..."
curl -s -X POST "${BASE_URL}/api/bands/test-band-1/review" \
  -H "Content-Type: application/json" \
  -d '{
    "safetyAssessment": "safe",
    "comment": "This is a test review for API testing",
    "evidence": ["API test evidence 1", "API test evidence 2"],
    "userId": "test-api-user",
    "userDisplayName": "API Test User"
  }' | jq '.' || echo "❌ ReviewBand failed"

echo ""
echo "✅ Backend API testing completed!"