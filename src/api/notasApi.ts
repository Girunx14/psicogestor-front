import axiosClient from './axiosClient';
import type { NotaEvolucion, NotaEvolucionCreate, NotaEvolucionUpdate, PaginatedResponse } from '@/types';

export const notasApi = {
  getByPaciente: async (pacienteId: string, params: Record<string, unknown> = {}): Promise<PaginatedResponse<NotaEvolucion>> => {
    const response = await axiosClient.get(`/notas/paciente/${pacienteId}`, { params });
    return response.data;
  },

  create: async (data: NotaEvolucionCreate): Promise<NotaEvolucion> => {
    const response = await axiosClient.post('/notas/', data);
    return response.data;
  },

  update: async (id: number, data: NotaEvolucionUpdate): Promise<NotaEvolucion> => {
    const response = await axiosClient.patch(`/notas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/notas/${id}`);
  },
};
