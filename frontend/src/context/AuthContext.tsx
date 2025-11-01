import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth0, User } from '@auth0/auth0-react';
import { setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithRedirect: () => void;
  logout: () => void;
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
          const token = await getAccessTokenSilently();
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

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: globalThis.location.origin,
      },
    });
  };

  const handleLogin = () => {
    void loginWithRedirect();
  };

  const value: AuthContextType = React.useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect: handleLogin,
    logout,
  }), [user, isAuthenticated, isLoading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};