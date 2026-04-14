import axiosClient from './axiosClient';
import type { Cita, CitaCreate, CitaUpdateEstado } from '@/types';

export const citasApi = {
  getAll: async (params: Record<string, unknown> = {}): Promise<Cita[]> => {
    const response = await axiosClient.get('/citas/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Cita> => {
    const response = await axiosClient.get(`/citas/${id}`);
    return response.data;
  },

  createAsPsicologo: async (data: CitaCreate): Promise<Cita> => {
    const response = await axiosClient.post('/citas/psicologo', data);
    return response.data;
  },

  createAsPaciente: async (data: CitaCreate): Promise<Cita> => {
    const response = await axiosClient.post('/citas/paciente', data);
    return response.data;
  },

  updateEstado: async (id: number, data: CitaUpdateEstado): Promise<Cita> => {
    const response = await axiosClient.patch(`/citas/${id}/estado`, data);
    return response.data;
  },
};
