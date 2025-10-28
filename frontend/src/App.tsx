import { Auth0Provider } from '@auth0/auth0-react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;

  if (!domain || !clientId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Auth0 Configuration Missing</h2>
        <p>Please configure your Auth0 environment variables:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>VITE_AUTH0_DOMAIN</li>
          <li>VITE_AUTH0_CLIENT_ID</li>
          <li>VITE_AUTH0_REDIRECT_URI (optional)</li>
        </ul>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Auth0Provider>
  );
}
