import { create } from 'zustand';
import { User, AuthState, LoginCredentials } from '../types';

const AUTH_TOKEN_KEY = 'billmanager-auth-token';
const AUTH_USER_KEY = 'billmanager-auth-user';

// Mock user data
const MOCK_USER: User = {
  id: 'user_1',
  email: 'admin@billmanager.com',
  name: 'Admin User',
  role: 'Administrator'
};

// Mock credentials
const MOCK_CREDENTIALS = {
  email: 'admin@billmanager.com',
  password: 'admin123'
};

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  generateToken: () => string;
}

// Generate a random token
const generateRandomToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Load auth data from localStorage
const loadAuthData = (): { user: User | null; token: string | null } => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Validate token exists and user data is complete
    if (token && user && user.id && user.email && user.name) {
      return { user, token };
    }
    
    return { user: null, token: null };
  } catch (error) {
    console.error('Failed to load auth data from localStorage', error);
    return { user: null, token: null };
  }
};

// Save auth data to localStorage
const saveAuthData = (user: User, token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save auth data to localStorage', error);
  }
};

// Clear auth data from localStorage
const clearAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Failed to clear auth data from localStorage', error);
  }
};

export const useAuthStore = create<AuthStore>((set, get) => {
  // Initialize with data from localStorage
  const { user, token } = loadAuthData();
  
  return {
    user,
    token,
    isAuthenticated: !!(user && token),
    isLoading: false,

    generateToken: () => {
      return generateRandomToken();
    },

    login: async (credentials: LoginCredentials): Promise<boolean> => {
      set({ isLoading: true });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Mock authentication - check credentials
        if (credentials.email === MOCK_CREDENTIALS.email && 
            credentials.password === MOCK_CREDENTIALS.password) {
          
          const token = generateRandomToken();
          const user = { ...MOCK_USER };
          
          // Save to localStorage
          saveAuthData(user, token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          return true;
        } else {
          set({ isLoading: false });
          return false;
        }
      } catch (error) {
        console.error('Login error:', error);
        set({ isLoading: false });
        return false;
      }
    },

    logout: () => {
      clearAuthData();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    },

    checkAuth: () => {
      const { user, token } = loadAuthData();
      set({
        user,
        token,
        isAuthenticated: !!(user && token),
        isLoading: false
      });
    }
  };
});