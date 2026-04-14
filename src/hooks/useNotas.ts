import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notasApi } from '@/api/notasApi';
import type { NotaEvolucionCreate, NotaEvolucionUpdate } from '@/types';

export function useNotasPaciente(pacienteId: string, params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['notas', pacienteId, params],
    queryFn: () => notasApi.getByPaciente(pacienteId, params),
    enabled: !!pacienteId,
  });
}

export function useCreateNota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NotaEvolucionCreate) => notasApi.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notas', variables.paciente_id] });
    },
  });
}

export function useUpdateNota(notaId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NotaEvolucionUpdate) => notasApi.update(notaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
    },
  });
}

export function useDeleteNota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
    },
  });
}
