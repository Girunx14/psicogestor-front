import axiosClient from './axiosClient';
import type { User, UsuarioCreate, UsuarioUpdate, PaginatedResponse } from '@/types';

export const usuariosApi = {
  getAll: async (params: Record<string, unknown> = {}): Promise<PaginatedResponse<User>> => {
    const response = await axiosClient.get('/usuarios/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await axiosClient.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (data: UsuarioCreate): Promise<User> => {
    const response = await axiosClient.post('/usuarios/', data);
    return response.data;
  },

  update: async (id: number, data: UsuarioUpdate): Promise<User> => {
    const response = await axiosClient.patch(`/usuarios/${id}`, data);
    return response.data;
  },
};
