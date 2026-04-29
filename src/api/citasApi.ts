import axiosClient from './axiosClient';
import type { Cita, CitaCreate, CitaUpdateEstado, CitaUrgenciaCreate } from '@/types';

export const citasApi = {
  getAll: async (params: Record<string, unknown> = {}): Promise<Cita[]> => {
    const response = await axiosClient.get('/citas/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Cita> => {
    const response = await axiosClient.get(`/citas/${id}`);
    return response.data;
  },

  getMisCitas: async (): Promise<Cita[]> => {
    const response = await axiosClient.get('/citas/mis-citas');
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

  createUrgencia: async (data: CitaUrgenciaCreate): Promise<Cita> => {
    const response = await axiosClient.post('/citas/urgencia', data);
    return response.data;
  },

  getUrgenciaActiva: async (): Promise<Cita | null> => {
    const response = await axiosClient.get('/citas/paciente/urgencia-activa');
    return response.data;
  },

  solicitarEmergencia: async (): Promise<Cita> => {
    const response = await axiosClient.post('/citas/paciente/solicitar-urgencia');
    return response.data;
  },
};
