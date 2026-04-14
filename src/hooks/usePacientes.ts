import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientesApi } from '@/api/pacientesApi';
import type { PacienteCreate, PacienteUpdate } from '@/types';

export function usePacientes(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['pacientes', params],
    queryFn: () => pacientesApi.getAll(params),
  });
}

export function usePaciente(id: string) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn: () => pacientesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PacienteCreate) => pacientesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}

export function useUpdatePaciente(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PacienteUpdate) => pacientesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      queryClient.invalidateQueries({ queryKey: ['paciente', id] });
    },
  });
}

export function useDeletePaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pacientesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}
