import { apiClient } from '@/utils/apiClient';
import { LoginRequest, LoginResponseData } from '@/types/api';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponseData> => {
    return apiClient.post<LoginResponseData>('/user/login', data);
  },

  register: async (data: { account: string; password: string }): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/user/register', data);
  },

  logout: async (): Promise<void> => {
    return apiClient.post('/user/logout');
  },

  getProfile: async (): Promise<LoginResponseData['user']> => {
    return apiClient.get<LoginResponseData['user']>('/user/profile');
  }
};
