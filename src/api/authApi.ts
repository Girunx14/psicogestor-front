import axiosClient from './axiosClient';
import type { LoginResponse } from '@/types';

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await axiosClient.post('/auth/login', { username, password });
    return response.data;
  },
  loginPaciente: async (numero_control: string, fecha_nacimiento: string): Promise<LoginResponse> => {
    const response = await axiosClient.post('/auth/paciente/login', { numero_control, fecha_nacimiento });
    return response.data;
  },
};
