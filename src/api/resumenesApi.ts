import axiosClient from './axiosClient';
import type { ResumenPaciente } from '@/types';

export const resumenesApi = {
  getByPaciente: async (pacienteId: string): Promise<ResumenPaciente> => {
    const response = await axiosClient.get(`/resumenes/paciente/${pacienteId}`);
    return response.data;
  },

  generate: async (pacienteId: string): Promise<ResumenPaciente> => {
    const response = await axiosClient.post(`/resumenes/paciente/${pacienteId}/ai-generar`);
    return response.data;
  },
};
