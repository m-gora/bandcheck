import jwt from 'jsonwebtoken';
import JwksClient from 'jwks-rsa';

// Auth0 configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';

// JWKS client for getting Auth0 public keys
const client = JwksClient({
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

// Authorization middleware for standard Request
export const authorize = async (
    request: Request
): Promise<{ authorized: boolean; user?: AuthenticatedUser; response?: { status: number; body: any } }> => {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
            return {
                authorized: false,
                response: {
                    status: 401,
                    body: { 
                        error: 'Authorization header missing',
                        message: 'Please provide a valid access token' 
                    }
                }
            };
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return {
                authorized: false,
                response: {
                    status: 401,
                    body: { 
                        error: 'Invalid authorization header format',
                        message: 'Expected format: Bearer <token>' 
                    }
                }
            };
        }

        // Verify the JWT token
        const user = await verifyToken(token);
        
        console.log(`User authenticated: ${user.sub}`);
        
        return {
            authorized: true,
            user
        };

    } catch (error) {
        console.log(`Authorization failed: ${error}`);
        
        return {
            authorized: false,
            response: {
                status: 401,
                body: { 
                    error: 'Invalid or expired token',
                    message: 'Please log in again' 
                }
            }
        };
    }
};