#!/usr/bin/env node

// Simple HTTP server test for our backend functions
// This bypasses Azure Functions runtime and tests our logic directly via HTTP

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Load environment first
dotenv.config();

// Import our backend functions
import { GetBands } from '../dist/src/functions/GetBands.js';
import { GetBandDetails } from '../dist/src/functions/GetBandDetails.js';
import { SubmitBand } from '../dist/src/functions/SubmitBand.js';
import { ReviewBand } from '../dist/src/functions/ReviewBand.js';

const app = express();
const PORT = 7071;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Azure Functions context
function createMockContext() {
  return {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
}

// Mock Azure Functions request
function createMockRequest(req) {
  return {
    method: req.method,
    url: req.url,
    query: new URLSearchParams(req.query),
    params: req.params,
    headers: req.headers,
    json: () => Promise.resolve(req.body),
    text: () => Promise.resolve(JSON.stringify(req.body))
  };
}

// Routes that mimic Azure Functions HTTP triggers
app.get('/api/bands', async (req, res) => {
  console.log('🔍 GET /api/bands called');
  try {
    const mockReq = createMockRequest(req);
    const mockContext = createMockContext();
    const result = await GetBands(mockReq, mockContext);
    res.status(result.status || 200).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Error in GetBands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bands/:bandId', async (req, res) => {
  console.log('🔍 GET /api/bands/:bandId called');
  try {
    const mockReq = createMockRequest(req);
    const mockContext = createMockContext();
    const result = await GetBandDetails(mockReq, mockContext);
    res.status(result.status || 200).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Error in GetBandDetails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bands', async (req, res) => {
  console.log('🔍 POST /api/bands called');
  try {
    const mockReq = createMockRequest(req);
    const mockContext = createMockContext();
    const result = await SubmitBand(mockReq, mockContext);
    res.status(result.status || 200).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Error in SubmitBand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bands/:bandId/review', async (req, res) => {
  console.log('🔍 POST /api/bands/:bandId/review called');
  try {
    const mockReq = createMockRequest(req);
    const mockContext = createMockContext();
    const result = await ReviewBand(mockReq, mockContext);
    res.status(result.status || 200).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Error in ReviewBand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

async function startServer() {
  // Check if Azurite is running
  try {
    const response = await fetch('http://localhost:10002/');
    console.log('✅ Azurite is running');
  } catch (error) {
    console.error('❌ Azurite is not running. Please start it first:');
    console.error('   npm run azurite:start');
    process.exit(1);
  }

  app.listen(PORT, 'localhost', () => {
    console.log('🚀 BandCheck Backend Test Server');
    console.log('================================');
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   GET  /api/bands - List all bands');
    console.log('   GET  /api/bands/:id - Get band details');
    console.log('   POST /api/bands - Submit new band');
    console.log('   POST /api/bands/:id/review - Submit review');
    console.log('   GET  /api/health - Health check');
    console.log('');
    console.log('🧪 Test with: ./scripts/test-api.sh');
    console.log('🛑 Stop with: Ctrl+C');
  });
}

startServer().catch(console.error);