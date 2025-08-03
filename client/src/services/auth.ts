import { apiService } from './api';
import type { User } from '@/types/auth';

// Local interfaces to avoid import issues
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  message?: string;
}

interface ApiErrorResponse {
  message: string;
  code: string;
  details?: any;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/auth/register', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/auth/refresh-token', { refreshToken });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ success: boolean; data?: { user: User }; error?: ApiErrorResponse }> {
    try {
      const response = await apiService.get('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Failed to get profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<{ success: boolean; data?: { user: User }; error?: ApiErrorResponse }> {
    try {
      const response = await apiService.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Profile update failed');
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: ApiErrorResponse }> {
    try {
      const response = await apiService.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Password change failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await apiService.post('/auth/logout');
      return response.data;
    } catch (error: any) {
      // Even if logout fails on server, consider it successful on client
      return { success: true };
    }
  }

  /**
   * Link Google account
   */
  async linkGoogleAccount(): Promise<{ success: boolean; data?: { authUrl: string }; error?: ApiErrorResponse }> {
    try {
      const response = await apiService.post('/auth/google/link');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Google account linking failed');
    }
  }

  /**
   * Unlink Google account
   */
  async unlinkGoogleAccount(): Promise<{ success: boolean; data?: { user: User }; error?: ApiErrorResponse }> {
    try {
      const response = await apiService.delete('/auth/google/unlink');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Google account unlinking failed');
    }
  }

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl(): string {
    const baseUrl = import.meta.env.VITE_API_URL || (
      // Check if we're on the production domain
      typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
        ? '/api' 
        : import.meta.env.PROD 
          ? '/api' 
          : 'http://localhost:3000/api'
    );
    return `${baseUrl}/auth/google`;
  }

  /**
   * Handle Google OAuth callback (for manual token processing)
   */
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/auth/google/callback', { code });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Google OAuth callback failed');
    }
  }

  /**
   * Validate token (check if still valid)
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.getProfile();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if API is healthy
   */
  async isApiHealthy(): Promise<boolean> {
    return apiService.healthCheck();
  }
}

// Export singleton instance
export const authApi = new AuthService();