import { useQuery } from '@tanstack/react-query';
import { estadisticasApi } from '@/api/estadisticasApi';

export function useEstadisticasPaciente(pacienteId: string) {
  return useQuery({
    queryKey: ['estadisticas', pacienteId],
    queryFn: () => estadisticasApi.getByPaciente(pacienteId),
    enabled: !!pacienteId,
  });
}
