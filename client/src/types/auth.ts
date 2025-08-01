export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  authProvider: 'local' | 'google';
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  googleId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
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

export interface ApiError {
  success: boolean;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}