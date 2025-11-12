import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import jwt from 'jsonwebtoken';
import JwksClient from 'jwks-client';

// Auth0 configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';

// JWKS client for getting Auth0 public keys
const client = new JwksClient({
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
});

// Interface for decoded JWT payload
export interface AuthenticatedUser {
    sub: string; // User ID
    email?: string;
    name?: string;
    picture?: string;
    [key: string]: any;
}

// Interface for authenticated request
export interface AuthenticatedRequest extends HttpRequest {
    authenticatedUser?: AuthenticatedUser;
}

// Get signing key for JWT verification
function getKey(header: any, callback: any) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
            return;
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

// Verify JWT token
const verifyToken = (token: string): Promise<AuthenticatedUser> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            audience: AUTH0_AUDIENCE,
            issuer: `https://${AUTH0_DOMAIN}/`,
            algorithms: ['RS256']
        }, (err, decoded) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(decoded as AuthenticatedUser);
        });
    });
};

// Authorization middleware
export const authorize = async (
    request: HttpRequest, 
    context: InvocationContext
): Promise<{ authorized: boolean; user?: AuthenticatedUser; response?: HttpResponseInit }> => {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
            return {
                authorized: false,
                response: {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Authorization header missing',
                        message: 'Please provide a valid access token' 
                    })
                }
            };
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return {
                authorized: false,
                response: {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Invalid authorization header format',
                        message: 'Expected format: Bearer <token>' 
                    })
                }
            };
        }

        // Verify the JWT token
        const user = await verifyToken(token);
        
        context.log(`User authenticated: ${user.sub}`);
        
        return {
            authorized: true,
            user
        };

    } catch (error) {
        context.log(`Authorization failed: ${error}`);
        
        return {
            authorized: false,
            response: {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Invalid or expired token',
                    message: 'Please log in again' 
                })
            }
        };
    }
};

// Convenience wrapper for protected functions
export const withAuth = (
    handler: (request: AuthenticatedRequest, context: InvocationContext, user: AuthenticatedUser) => Promise<HttpResponseInit>
) => {
    return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const authResult = await authorize(request, context);
        
        if (!authResult.authorized) {
            return authResult.response || {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Authentication error' })
            };
        }

        if (!authResult.user) {
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'User information not available' })
            };
        }

        // Add user to request object
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.authenticatedUser = authResult.user;

        // Call the protected handler
        return handler(authenticatedRequest, context, authResult.user);
    };
};