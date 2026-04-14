import axiosClient from './axiosClient';
import type { CatalogosResponse, Carrera, Religion } from '@/types';

export const catalogosApi = {
  getAll: async (): Promise<CatalogosResponse> => {
    const response = await axiosClient.get('/catalogos/');
    return response.data;
  },

  getCarreras: async (): Promise<Carrera[]> => {
    const response = await axiosClient.get('/catalogos/carreras');
    return response.data;
  },

  createCarrera: async (data: { nombre: string; clave: string }): Promise<Carrera> => {
    const response = await axiosClient.post('/catalogos/carreras', data);
    return response.data;
  },

  getReligiones: async (): Promise<Religion[]> => {
    const response = await axiosClient.get('/catalogos/religiones');
    return response.data;
  },

  createReligion: async (data: { nombre: string }): Promise<Religion> => {
    const response = await axiosClient.post('/catalogos/religiones', data);
    return response.data;
  },
};
