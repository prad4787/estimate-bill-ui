import { create } from "zustand";
import { User, AuthState, LoginCredentials } from "../types";
import { api } from "../api/instance";

const AUTH_TOKEN_KEY = "billmanager-auth-token";
const AUTH_USER_KEY = "billmanager-auth-user";

// Remove mock user and credentials

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

// Add this type for the login response
interface LoginResponse {
  token: string;
  user: User;
}

// Generate a random token

// Load auth data from localStorage
const loadAuthData = (): { user: User | null; token: string | null } => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;

    // Validate token exists and user data is complete
    if (token && user && user.id && user.email && user.role) {
      return { user, token };
    }

    return { user: null, token: null };
  } catch (error) {
    console.error("Failed to load auth data from localStorage", error);
    return { user: null, token: null };
  }
};

// Save auth data to localStorage
const saveAuthData = (user: User, token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save auth data to localStorage", error);
  }
};

// Clear auth data from localStorage
const clearAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error("Failed to clear auth data from localStorage", error);
  }
};

export const useAuthStore = create<AuthStore>((set) => {
  // Initialize with data from localStorage
  const { user, token } = loadAuthData();

  return {
    user,
    token,
    isAuthenticated: !!(user && token),
    isLoading: false,

    login: async (credentials: LoginCredentials): Promise<boolean> => {
      set({ isLoading: true });
      try {
        const result = await api.post<LoginResponse, LoginCredentials>(
          "/auth/login",
          credentials
        );
        const { success, data } = result;
        if (success && data?.token && data?.user) {
          saveAuthData(data.user, data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } else {
          set({ isLoading: false });
          return false;
        }
      } catch {
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
        isLoading: false,
      });
    },

    checkAuth: () => {
      const { user, token } = loadAuthData();
      set({
        user,
        token,
        isAuthenticated: !!(user && token),
        isLoading: false,
      });
    },
  };
});
