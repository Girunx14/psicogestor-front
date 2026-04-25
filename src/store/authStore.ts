import { create } from 'zustand';
import type { User, UserRole } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
  isAdmin: () => boolean;
  isPsicologo: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  isAdmin: () => {
    const { user } = get();
    return user?.rol?.nombre === 'administrador';
  },

  isPsicologo: () => {
    const { user } = get();
    if (!user) return false;
    return user.rol?.nombre === 'psicologo' || user.rol?.nombre === 'administrador' || user.rol?.nombre === 'desarrollo_academico';
  },

  hasRole: (role: UserRole) => {
    const { user } = get();
    if (!user) return false;
    if (user.rol?.nombre === 'administrador') return true;
    if (role === 'psicologo') {
      return user.rol?.nombre === 'psicologo' || user.rol?.nombre === 'desarrollo_academico' || user.rol?.nombre === 'asistente';
    }
    return user.rol?.nombre === role;
  },
}));
