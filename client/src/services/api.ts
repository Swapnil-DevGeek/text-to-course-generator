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

// Course API functions
export const courseAPI = {
  // Generate course with AI
  generateCourse: async (data: { topic: string; difficulty?: string; duration?: string }) => {
    const response = await apiService.post('/courses/generate', data, { timeout: 60000 }); // 60 second timeout for AI generation
    return response.data;
  },

  // Get user's courses
  getCourses: async (params?: { page?: number; limit?: number; search?: string; difficulty?: string }) => {
    const response = await apiService.get('/courses', { params });
    return response.data;
  },

  // Get specific course
  getCourse: async (courseId: string) => {
    const response = await apiService.get(`/courses/${courseId}`);
    return response.data;
  },

  // Update course
  updateCourse: async (courseId: string, data: any) => {
    const response = await apiService.put(`/courses/${courseId}`, data);
    return response.data;
  },

  // Delete course
  deleteCourse: async (courseId: string) => {
    const response = await apiService.delete(`/courses/${courseId}`);
    return response.data;
  }
};

// Lesson API functions
export const lessonAPI = {
  // Get lesson content
  getLesson: async (courseId: string, moduleIndex: number, lessonIndex: number) => {
    const response = await apiService.get(`/lessons/course/${courseId}/module/${moduleIndex}/lesson/${lessonIndex}`, { timeout: 60000 }); // 60 second timeout for lesson with AI generation
    return response.data;
  },

  // Generate lesson content with AI
  generateLessonContent: async (lessonId: string) => {
    const response = await apiService.post(`/lessons/${lessonId}/generate`, {}, { timeout: 45000 }); // 45 second timeout for lesson generation
    return response.data;
  },

  // Update lesson
  updateLesson: async (lessonId: string, data: any) => {
    const response = await apiService.put(`/lessons/${lessonId}`, data);
    return response.data;
  },

  // Get lessons for module
  getModuleLessons: async (moduleId: string) => {
    const response = await apiService.get(`/lessons/module/${moduleId}`);
    return response.data;
  }
};

// Module API functions
export const moduleAPI = {
  // Get module
  getModule: async (moduleId: string) => {
    const response = await apiService.get(`/modules/${moduleId}`);
    return response.data;
  },

  // Update module
  updateModule: async (moduleId: string, data: any) => {
    const response = await apiService.put(`/modules/${moduleId}`, data);
    return response.data;
  },

  // Get course modules
  getCourseModules: async (courseId: string) => {
    const response = await apiService.get(`/modules/course/${courseId}`);
    return response.data;
  }
};

// Progress API functions
export const progressAPI = {
  // Get all user's course progress
  getUserProgress: async () => {
    const response = await apiService.get('/progress');
    return response.data;
  },

  // Get progress for a specific course
  getCourseProgress: async (courseId: string) => {
    const response = await apiService.get(`/progress/course/${courseId}`);
    return response.data;
  },

  // Get detailed progress for a course
  getDetailedCourseProgress: async (courseId: string) => {
    const response = await apiService.get(`/progress/course/${courseId}/detailed`);
    return response.data;
  },

  // Mark a lesson as completed
  completeLesson: async (courseId: string, lessonId: string, timeSpent?: number) => {
    const response = await apiService.post(`/progress/course/${courseId}/lesson/${lessonId}/complete`, { timeSpent });
    return response.data;
  },

  // Update current position in course
  updateCurrentPosition: async (courseId: string, moduleIndex: number, lessonIndex: number) => {
    const response = await apiService.put(`/progress/course/${courseId}/position`, { moduleIndex, lessonIndex });
    return response.data;
  }
};

// YouTube API functions
export const youtubeAPI = {
  // Search for videos
  searchVideos: async (query: string, options: { maxResults?: number; duration?: string; language?: string } = {}) => {
    const params = new URLSearchParams({
      query,
      ...options
    });
    const response = await apiService.get(`/youtube/search?${params.toString()}`);
    return response.data;
  },

  // Get video details by ID
  getVideoDetails: async (videoId: string) => {
    const response = await apiService.get(`/youtube/video/${videoId}`);
    return response.data;
  },

  // Get cache statistics (for debugging)
  getCacheStats: async () => {
    const response = await apiService.get('/youtube/cache/stats');
    return response.data;
  },

  // Clear cache (for debugging)
  clearCache: async () => {
    const response = await apiService.delete('/youtube/cache');
    return response.data;
  }
};

// Export singleton instance
export const apiService = new ApiService();