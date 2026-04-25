import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumenesApi } from '@/api/resumenesApi';

export function useResumenPaciente(pacienteId: string) {
  return useQuery({
    queryKey: ['resumenes', pacienteId],
    queryFn: () => resumenesApi.getByPaciente(pacienteId),
    enabled: !!pacienteId,
  });
}

export function useGenerarResumen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pacienteId: string) => resumenesApi.generate(pacienteId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resumenes', variables] });
    },
  });
}