import axiosClient from './axiosClient';
import type { LoginResponse, User } from '@/types';

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await axiosClient.post('/auth/login', { username, password });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};
