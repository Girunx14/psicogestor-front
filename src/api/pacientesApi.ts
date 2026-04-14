import axiosClient from './axiosClient';
import type { Paciente, PacienteListItem, PacienteCreate, PacienteUpdate, PaginatedResponse } from '@/types';

export const pacientesApi = {
  getAll: async (params: Record<string, unknown> = {}): Promise<PaginatedResponse<PacienteListItem>> => {
    const response = await axiosClient.get('/pacientes/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Paciente> => {
    const response = await axiosClient.get(`/pacientes/${id}`);
    return response.data;
  },

  create: async (data: PacienteCreate): Promise<Paciente> => {
    const response = await axiosClient.post('/pacientes/', data);
    return response.data;
  },

  update: async (id: string, data: PacienteUpdate): Promise<Paciente> => {
    const response = await axiosClient.patch(`/pacientes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/pacientes/${id}`);
  },
};
