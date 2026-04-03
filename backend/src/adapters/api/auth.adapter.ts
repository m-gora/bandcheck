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
    roles?: string[]; // User roles from Auth0 (e.g., ['moderator', 'admin'])
    [key: string]: unknown;
}

// Get signing key for JWT verification
function getKey(header: jwt.JwtHeader, callback: (err: Error | null, key?: string) => void) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
            return;
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

// Verify JWT token - This performs AUTHENTICATION
// - Validates token signature using Auth0 public keys (JWKS)
// - Checks token expiration
// - Verifies issuer and audience claims
const verifyToken = (token: string): Promise<AuthenticatedUser> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            audience: AUTH0_AUDIENCE,
            issuer: `https://${AUTH0_DOMAIN}/`,
            algorithms: ['RS256'],
            clockTolerance: 10, // Allow 10 seconds clock skew
        }, (err, decoded) => {
            if (err) {
                // Log specific authentication failures
                if (err.name === 'TokenExpiredError') {
                    console.error('Token expired:', err.message);
                } else if (err.name === 'JsonWebTokenError') {
                    console.error('Invalid token:', err.message);
                } else if (err.name === 'NotBeforeError') {
                    console.error('Token not yet valid:', err.message);
                }
                reject(err);
                return;
            }
            
            const user = decoded as AuthenticatedUser;
            
            // Additional authentication checks
            if (!user.sub) {
                reject(new Error('Token missing subject (sub) claim'));
                return;
            }
            
            resolve(user);
        });
    });
};

// Authentication middleware - Verifies JWT token validity
// This is AUTHENTICATION: validates user identity via token verification
export const authorize = async (
    request: Request
): Promise<{ authorized: boolean; user?: AuthenticatedUser; response?: { status: number; body: Record<string, string> } }> => {
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

        // Verify the JWT token (AUTHENTICATION - checks signature, expiration, claims)
        const user = await verifyToken(token);
        
        const userInfo = user.email ? `${user.sub} (${user.email})` : user.sub;
        console.log(`User authenticated: ${userInfo}`);
        
        return {
            authorized: true,
            user
        };

    } catch (error) {
        console.log(`Authentication failed: ${error}`);
        
        // Provide specific error messages for different auth failures
        let errorMessage = 'Please log in again';
        let errorType = 'Invalid or expired token';
        
        if (error instanceof Error) {
            if (error.name === 'TokenExpiredError') {
                errorType = 'Token expired';
                errorMessage = 'Your session has expired. Please log in again.';
            } else if (error.name === 'JsonWebTokenError') {
                errorType = 'Invalid token';
                errorMessage = 'Invalid authentication token. Please log in again.';
            } else if (error.name === 'NotBeforeError') {
                errorType = 'Token not yet valid';
                errorMessage = 'Authentication token is not yet valid. Please try again.';
            }
        }
        
        return {
            authorized: false,
            response: {
                status: 401,
                body: { 
                    error: errorType,
                    message: errorMessage
                }
            }
        };
    }
};

// Authorization middleware - Checks for moderator/admin role
// This is AUTHORIZATION: validates user permissions after authentication
export const authorizeModerator = async (
    request: Request
): Promise<{ authorized: boolean; user?: AuthenticatedUser; response?: { status: number; body: Record<string, string> } }> => {
    // First authenticate the user (verify token)
    const authResult = await authorize(request);
    
    if (!authResult.authorized || !authResult.user) {
        return authResult;
    }

    // Extract roles from token - they may be in different locations depending on Auth0 configuration
    const user = authResult.user;
    const namespace = 'https://bandcheck.marcodoes.tech';
    const rolesFromNamespace = user[`${namespace}/roles`] as string[] | undefined;
    const rolesFromClaim = user.roles;
    const userRoles = rolesFromNamespace || rolesFromClaim || [];
    
    console.log(`Checking moderator access for user ${user.sub}, roles:`, userRoles);
    
    const hasModeratorAccess = userRoles.includes('moderator') || userRoles.includes('admin');

    if (!hasModeratorAccess) {
        return {
            authorized: false,
            response: {
                status: 403,
                body: {
                    error: 'Forbidden',
                    message: 'You do not have permission to perform this action. Moderator access required.'
                }
            }
        };
    }

    return authResult;
};