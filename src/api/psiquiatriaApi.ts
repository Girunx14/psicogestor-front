import axiosClient from './axiosClient';
import type {
  DiagnosticoCatalogo,
  MedicamentoCatalogo,
  EvaluacionPsiquiatricaCreate,
  PrescripcionCreate,
  SeguimientoPsiquiatricoCreate,
} from '@/types';

export const psiquiatriaApi = {
  getDiagnosticos: async (): Promise<DiagnosticoCatalogo[]> => {
    const response = await axiosClient.get('/psiquiatria/catalogos/diagnosticos');
    return response.data;
  },

  getMedicamentos: async (): Promise<MedicamentoCatalogo[]> => {
    const response = await axiosClient.get('/psiquiatria/catalogos/medicamentos');
    return response.data;
  },

  createEvaluacion: async (data: EvaluacionPsiquiatricaCreate) => {
    const response = await axiosClient.post('/psiquiatria/evaluaciones', data);
    return response.data;
  },

  createPrescripcion: async (data: PrescripcionCreate) => {
    const response = await axiosClient.post('/psiquiatria/prescripciones', data);
    return response.data;
  },

  createSeguimiento: async (data: SeguimientoPsiquiatricoCreate) => {
    const response = await axiosClient.post('/psiquiatria/seguimientos', data);
    return response.data;
  },

  getHistorial: async (pacienteId: string) => {
    const response = await axiosClient.get(`/psiquiatria/historial/${pacienteId}`);
    return response.data;
  },
};
