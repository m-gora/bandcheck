import { authorize } from './auth.adapter';
import * as bandsController from './bands.controller';
import type { BandServiceImpl, ReviewServiceImpl } from '../../core/services/band.service';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function createApiRouter(bandService: BandServiceImpl, reviewService: ReviewServiceImpl) {
  return async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get('origin');
    
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    try {
      // Health check
      if (url.pathname === '/health' || url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      // GET /api/bands
      if (url.pathname === '/api/bands' && req.method === 'GET') {
        const response = await bandsController.getBands(bandService, req);
        return addCorsHeaders(response, origin);
      }
      
      // GET /api/bands/:id
      if (url.pathname.match(/^\/api\/bands\/[^\/]+$/) && req.method === 'GET') {
        const bandId = url.pathname.split('/')[3];
        const response = await bandsController.getBandDetails(bandService, req, bandId);
        return addCorsHeaders(response, origin);
      }
      
      // POST /api/bands (authenticated)
      if (url.pathname === '/api/bands' && req.method === 'POST') {
        const authResult = await authorize(req);
        if (!authResult.authorized || !authResult.user) {
          return new Response(JSON.stringify(authResult.response?.body || { error: 'Unauthorized' }), {
            status: authResult.response?.status || 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          });
        }
        const response = await bandsController.createBand(bandService, req, authResult.user);
        return addCorsHeaders(response, origin);
      }
      
      // POST /api/bands/:id/reviews (authenticated)
      if (url.pathname.match(/^\/api\/bands\/[^\/]+\/reviews$/) && req.method === 'POST') {
        const authResult = await authorize(req);
        if (!authResult.authorized || !authResult.user) {
          return new Response(JSON.stringify(authResult.response?.body || { error: 'Unauthorized' }), {
            status: authResult.response?.status || 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
          });
        }
        const bandId = url.pathname.split('/')[3];
        const response = await bandsController.createReview(reviewService, req, bandId, authResult.user);
        return addCorsHeaders(response, origin);
      }

      // GET /api/statistics
      if (url.pathname === '/api/statistics' && req.method === 'GET') {
        const response = await bandsController.getStatistics(bandService);
        return addCorsHeaders(response, origin);
      }

      // GET /api/bands/latest
      if (url.pathname === '/api/bands/latest' && req.method === 'GET') {
        const response = await bandsController.getLatestBands(bandService, req);
        return addCorsHeaders(response, origin);
      }

      // GET /api/reviews/latest
      if (url.pathname === '/api/reviews/latest' && req.method === 'GET') {
        const response = await bandsController.getLatestReviews(reviewService, req);
        return addCorsHeaders(response, origin);
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    } catch (error) {
      console.error('Server error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }
  };
}

function addCorsHeaders(response: Response, origin: string | null): Response {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(origin);
  Object.entries(cors).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
