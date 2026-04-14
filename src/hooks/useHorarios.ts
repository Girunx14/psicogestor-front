import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { horariosApi } from '@/api/horariosApi';
import type { HorarioCreate } from '@/types';

export function useHorarios(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['horarios', params],
    queryFn: () => horariosApi.getAll(params),
  });
}

export function useCreateHorario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HorarioCreate) => horariosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
    },
  });
}

export function useDeleteHorario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => horariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
    },
  });
}
