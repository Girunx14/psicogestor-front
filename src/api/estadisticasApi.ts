import axiosClient from './axiosClient';
import type { EstadisticasPaciente } from '@/types';

export const estadisticasApi = {
  getByPaciente: async (pacienteId: string): Promise<EstadisticasPaciente> => {
    const response = await axiosClient.get(`/estadisticas/paciente/${pacienteId}`);
    return response.data;
  },
};
