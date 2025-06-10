import { apiClient } from '@/utils/apiClient';

// Types
export interface LoginRequest {
  account: string;
  password: string;
}

export interface UserProfile {
  id: string | number;
  account: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  token?: string;
}

export interface LoginResponseData {
  user: UserProfile;
  token: string;
}

/**
 * Authentication service for handling user authentication
 */
export const authService = {
  /**
   * User login
   * @param data Login credentials
   * @returns User data with authentication token
   */
  login: async (data: LoginRequest): Promise<LoginResponseData> => {
    try {
      console.log(`[AuthService] Attempting login for user: ${data.account}`);
      const response = await apiClient.post<LoginResponseData>('/user/login', data);
      console.log(`[AuthService] Login successful for user: ${data.account}`);
      return response.data!;
    } catch (error) {
      console.error(`[AuthService] Login failed for user ${data.account}:`, error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param data User registration data
   * @returns Success message
   */
  register: async (data: { account: string; password: string }): Promise<{ message: string }> => {
    try {
      console.log(`[AuthService] Registering new user: ${data.account}`);
      const response = await apiClient.post<{ message: string }>('/user/register', data);
      console.log(`[AuthService] Registration successful for user: ${data.account}`);
      return response.data!;
    } catch (error) {
      console.error(`[AuthService] Registration failed for user ${data.account}:`, error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    try {
      console.log('[AuthService] Logging out user');
      await apiClient.post('/user/logout');
      console.log('[AuthService] Logout successful');
    } catch (error) {
      console.error('[AuthService] Logout failed:', error);
      throw error;
    }
  },

  /**
   * Get current user's profile
   * @returns User profile data
   */
  getProfile: async (): Promise<UserProfile> => {
    try {
      console.log('[AuthService] Fetching user profile');
      const response = await apiClient.get<UserProfile>('/user/profile');
      console.log('[AuthService] Successfully fetched user profile');
      return response.data!;
    } catch (error) {
      console.error('[AuthService] Failed to fetch user profile:', error);
      throw error;
    }
  }
};
