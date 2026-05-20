import { createContext } from 'react';
import { User } from '@auth0/auth0-react';

export interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithRedirect: () => void;
  logout: () => void;
  roles: string[];
  isModerator: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);