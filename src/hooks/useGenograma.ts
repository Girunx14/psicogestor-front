import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { genogramaApi } from '@/api/genogramaApi';
import type { GenogramaDatos } from '@/api/genogramaApi';

export function useGenograma(pacienteId: string) {
  return useQuery({
    queryKey: ['genograma', pacienteId],
    queryFn: () => genogramaApi.get(pacienteId),
    enabled: !!pacienteId,
  });
}

export function useSaveGenograma(pacienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: GenogramaDatos) => genogramaApi.save(pacienteId, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genograma', pacienteId] });
    },
  });
}
