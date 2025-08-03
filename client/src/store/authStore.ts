import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/auth';
import { authApi, type LoginCredentials, type RegisterCredentials } from '@/services/auth';

// Local interfaces to avoid import issues
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  
  // User actions
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Google OAuth actions
  loginWithGoogle: (token: string) => void;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
  
  // State management
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Initialize auth state
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Authentication actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.login(credentials);
          
          if (response.success && response.data) {
            const { user, tokens } = response.data;
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.error?.message || 'Login failed');
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.register(credentials);
          
          if (response.success && response.data) {
            const { user, tokens } = response.data;
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.error?.message || 'Registration failed');
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Call logout API (optional since JWT is stateless)
        authApi.logout().catch(console.error);
        
        // Clear state
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshToken: async () => {
        try {
          const { tokens } = get();
          if (!tokens?.refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authApi.refreshToken(tokens.refreshToken);
          
          if (response.success && response.data) {
            set({
              tokens: response.data.tokens,
              error: null,
            });
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      // User actions
      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.updateProfile(data);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isLoading: false,
            });
          } else {
            throw new Error(response.error?.message || 'Profile update failed');
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Profile update failed',
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set({ isLoading: true, error: null });
          
          await authApi.changePassword(currentPassword, newPassword);
          
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Password change failed',
          });
          throw error;
        }
      },

      // Google OAuth actions
      loginWithGoogle: () => {
        // This will be handled via redirect in the backend
        // The frontend will receive tokens via URL params
        window.location.href = `${import.meta.env.VITE_API_URL || (
          import.meta.env.PROD ? '/api' : 'http://localhost:3000/api'
        )}/auth/google`;
      },

      linkGoogleAccount: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.linkGoogleAccount();
          
          if (response.success) {
            // Handle redirect to Google OAuth
            if (response.data?.authUrl) {
              window.location.href = response.data.authUrl;
            }
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Google account linking failed',
          });
          throw error;
        }
      },

      unlinkGoogleAccount: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.unlinkGoogleAccount();
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Google account unlinking failed',
          });
          throw error;
        }
      },

      // State management
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setTokens: (tokens: AuthTokens | null) => {
        set({ tokens });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Initialize auth state
      initializeAuth: async () => {
        try {
          const { tokens, user, isLoading } = get();
          
          // If already loading or user already exists, don't initialize again
          if (isLoading || user) {
            return;
          }
          
          if (!tokens?.accessToken) {
            return;
          }

          set({ isLoading: true });
          
          const response = await authApi.getProfile();
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token might be expired, try to refresh once
            try {
              await get().refreshToken();
              // Try to get profile again after refresh
              const retryResponse = await authApi.getProfile();
              if (retryResponse.success && retryResponse.data) {
                set({
                  user: retryResponse.data.user,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } else {
                throw new Error('Failed to get profile after token refresh');
              }
            } catch (refreshError) {
              // If refresh fails, clear auth state
              set({
                user: null,
                tokens: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          }
        } catch (error) {
          // If initialization fails, clear auth state
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);