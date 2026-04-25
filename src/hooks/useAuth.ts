import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { usuariosApi } from '@/api/usuariosApi';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, User, UserRole } from '@/types';

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      // 1. Login → get token
      const { access_token } = await authApi.login(data.username, data.password);
      // 2. Store token temporarily so the next request has it
      localStorage.setItem('token', access_token);
      
      // 3. Decode token to get user data
      const payloadBase64 = access_token.split('.')[1];
      const payloadDecoded = JSON.parse(atob(payloadBase64));
      const userId = parseInt(payloadDecoded.sub, 10);

      // 4. Try to fetch full user info, fallback to JWT payload if unauthorized (e.g., non-admin)
      const rolMap: Record<string, number> = {
        administrador: 1,
        psicologo: 2,
        asistente: 3,
        desarrollo_academico: 4,
        paciente: 5,
      };
      let user: User;
      try {
        user = await usuariosApi.getById(userId);
      } catch {
        const rolNombre = payloadDecoded.rol as string;
        const rolId = rolMap[rolNombre] || 2;
        user = {
          id: userId,
          username: payloadDecoded.username,
          rol_id: rolId,
          creado_en: new Date().toISOString(),
          rol: {
            id: rolId,
            nombre: rolNombre as UserRole,
          },
        };
      }
      
      return { access_token, user };
    },
    onSuccess: ({ access_token, user }) => {
      login(access_token, user);
    },
    onError: () => {
      // Clean up if login flow fails midway
      localStorage.removeItem('token');
    },
  });
}

export function useLoginPaciente() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (data: { numero_control: string; fecha_nacimiento: string }) => {
      const { access_token } = await authApi.loginPaciente(data.numero_control, data.fecha_nacimiento);
      localStorage.setItem('token', access_token);
      
      const payloadBase64 = access_token.split('.')[1];
      const payloadDecoded = JSON.parse(atob(payloadBase64));
      const userId = payloadDecoded.sub; // For patient it's UUID string, not int

      // Mock User structure for Paciente using token payload
      const user: User = {
        id: userId,
        username: payloadDecoded.username,
        rol_id: 3, // Assuming 3 is Paciente
        creado_en: new Date().toISOString(),
        rol: {
          id: 3,
          nombre: 'paciente',
        },
      };
      
      return { access_token, user };
    },
    onSuccess: ({ access_token, user }) => {
      login(access_token, user);
    },
    onError: () => {
      localStorage.removeItem('token');
    },
  });
}
