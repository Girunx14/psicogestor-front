import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { usuariosApi } from '@/api/usuariosApi';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, User } from '@/types';

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
      let user: User;
      try {
        user = await usuariosApi.getById(userId);
      } catch (error) {
        user = {
          id: userId,
          username: payloadDecoded.username,
          rol_id: payloadDecoded.rol === 'administrador' ? 1 : 2,
          creado_en: new Date().toISOString(),
          rol: {
            id: payloadDecoded.rol === 'administrador' ? 1 : 2,
            nombre: payloadDecoded.rol,
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
