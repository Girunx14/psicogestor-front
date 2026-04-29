import axiosClient from './axiosClient';
import type {
  Cita,
  CitaCreate,
  CitaUpdateEstado,
  CitaUrgenciaCreate,
  SolicitarUrgenciaRequest,
  AceptarUrgenciaRequest,
  RechazarUrgenciaRequest,
  UrgenciaActiva,
  UrgenciaPendiente,
} from '@/types';

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

  solicitarUrgencia: async (data: SolicitarUrgenciaRequest): Promise<UrgenciaActiva> => {
    const response = await axiosClient.post('/citas/paciente/solicitar-urgencia', data);
    return response.data;
  },

  obtenerUrgenciaActiva: async (): Promise<UrgenciaActiva | null> => {
    const response = await axiosClient.get('/citas/paciente/urgencia-activa');
    return response.data?.data ?? response.data ?? null;
  },

  listarUrgenciasPendientes: async (): Promise<UrgenciaPendiente[]> => {
    const response = await axiosClient.get('/citas/urgencias/pendientes');
    return response.data;
  },

  aceptarUrgencia: async (citaId: number, data: AceptarUrgenciaRequest): Promise<UrgenciaActiva> => {
    const response = await axiosClient.post(`/citas/urgencias/${citaId}/aceptar`, data);
    return response.data;
  },

  rechazarUrgencia: async (citaId: number, data: RechazarUrgenciaRequest): Promise<void> => {
    await axiosClient.post(`/citas/urgencias/${citaId}/rechazar`, data);
  },

  cancelarUrgenciaPaciente: async (citaId: number): Promise<UrgenciaActiva> => {
    const response = await axiosClient.post(`/citas/paciente/urgencia/${citaId}/cancelar`);
    return response.data;
  },
};
