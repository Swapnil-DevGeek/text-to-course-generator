import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Local interface to avoid import issues
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private client: AxiosInstance;
  private tokenRefreshPromise: Promise<any> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const tokens = this.getStoredTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          error.response?.data?.error?.code === 'TOKEN_EXPIRED' &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            // If already refreshing, wait for it
            if (this.tokenRefreshPromise) {
              await this.tokenRefreshPromise;
              return this.client(originalRequest);
            }

            // Start token refresh
            this.tokenRefreshPromise = this.refreshTokens();
            await this.tokenRefreshPromise;
            this.tokenRefreshPromise = null;

            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getStoredTokens(): AuthTokens | null {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.tokens || null;
      }
    } catch (error) {
      console.error('Error reading auth tokens:', error);
    }
    return null;
  }

  private async refreshTokens(): Promise<void> {
    const tokens = this.getStoredTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken: tokens.refreshToken,
    });

    if (response.data.success && response.data.data?.tokens) {
      // Update stored tokens
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        parsed.state.tokens = response.data.data.tokens;
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
    } else {
      throw new Error('Token refresh failed');
    }
  }

  private handleAuthFailure() {
    // Clear auth storage
    localStorage.removeItem('auth-storage');
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Public methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.success === true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();