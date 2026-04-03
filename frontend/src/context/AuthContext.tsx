import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth0, User } from '@auth0/auth0-react';
import { setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithRedirect: () => void;
  logout: () => void;
  roles: string[];
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Update API token when authentication status changes
  useEffect(() => {
    const updateToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: 'https://api.bandcheck.marcodoes.tech',
              scope: 'openid profile email'
            }
          });
          setAuthToken(token);
        } catch (error) {
          console.error('Failed to get access token:', error);
          setAuthToken(null);
        }
      } else {
        setAuthToken(null);
      }
    };

    updateToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const logout = useCallback(() => {
    auth0Logout({
      logoutParams: {
        returnTo: globalThis.location.origin,
      },
    });
  }, [auth0Logout]);

  const handleLogin = useCallback(() => {
    void loginWithRedirect();
  }, [loginWithRedirect]);

  // Extract roles from user metadata
  const roles = React.useMemo(() => {
    if (!user) return [];
    // Auth0 roles can be in different places depending on configuration
    const namespace = 'https://bandcheck.marcodoes.tech';
    const rolesFromNamespace = user[`${namespace}/roles`] as string[] | undefined;
    const rolesFromMeta = (user as Record<string, unknown>)?.roles as string[] | undefined;
    return rolesFromNamespace || rolesFromMeta || [];
  }, [user]);

  const isModerator = React.useMemo(() => {
    return roles.includes('moderator') || roles.includes('admin');
  }, [roles]);

  const value: AuthContextType = React.useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect: handleLogin,
    logout,
    roles,
    isModerator,
  }), [user, isAuthenticated, isLoading, handleLogin, logout, roles, isModerator]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};