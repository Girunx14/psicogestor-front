import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '@/api/usuariosApi';
import type { UsuarioCreate, UsuarioUpdate } from '@/types';

export function useUsuarios(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['usuarios', params],
    queryFn: () => usuariosApi.getAll(params),
  });
}

export function useUsuario(id: number) {
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: () => usuariosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UsuarioCreate) => usuariosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useUpdateUsuario(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UsuarioUpdate) => usuariosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario', id] });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
