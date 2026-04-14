import axiosClient from './axiosClient';
import type { Horario, HorarioCreate } from '@/types';

export const horariosApi = {
  getAll: async (params: Record<string, unknown> = {}): Promise<Horario[]> => {
    const response = await axiosClient.get('/horarios/', { params });
    return response.data;
  },

  getAllForPaciente: async (params: Record<string, unknown> = {}): Promise<Horario[]> => {
    const response = await axiosClient.get('/horarios/paciente/disponibles', { params });
    return response.data;
  },

  create: async (data: HorarioCreate): Promise<Horario> => {
    const response = await axiosClient.post('/horarios/', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/horarios/${id}`);
  },
};
