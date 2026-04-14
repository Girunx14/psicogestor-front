import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citasApi } from '@/api/citasApi';
import type { CitaCreate, CitaUpdateEstado } from '@/types';

export function useCitas(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['citas', params],
    queryFn: () => citasApi.getAll(params),
  });
}

export function useCita(id: number) {
  return useQuery({
    queryKey: ['cita', id],
    queryFn: () => citasApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CitaCreate) => citasApi.createAsPsicologo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
    },
  });
}

export function useUpdateEstadoCita() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CitaUpdateEstado }) =>
      citasApi.updateEstado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
    },
  });
}
