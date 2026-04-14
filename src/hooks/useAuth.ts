import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest } from '@/types';

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      // 1. Login → get token
      const { access_token } = await authApi.login(data.username, data.password);
      // 2. Store token temporarily so the next request has it
      localStorage.setItem('token', access_token);
      // 3. Fetch current user data
      const user = await authApi.getMe();
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
