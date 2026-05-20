import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citasApi } from '@/api/citasApi';
import type {
  CitaCreate,
  CitaUpdateEstado,
  CitaUrgenciaCreate,
  SolicitarUrgenciaRequest,
  AceptarUrgenciaRequest,
  RechazarUrgenciaRequest,
} from '@/types';

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

export function useMisCitas() {
  return useQuery({
    queryKey: ['mis-citas'],
    queryFn: () => citasApi.getMisCitas(),
  });
}

export function useCreateCitaPaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CitaCreate) => citasApi.createAsPaciente(data),
onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      queryClient.invalidateQueries({ queryKey: ['urgencias-pendientes'] });
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

export function useCreateUrgencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CitaUrgenciaCreate) => citasApi.createUrgencia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
    },
  });
}

// ──────────────────────────────────────────────────
// Urgencias (nuevos)
// ──────────────────────────────────────────────────

/** Hook para el paciente: poll urgencia activa cada 15 segundos */
export function useUrgenciaActiva() {
  return useQuery({
    queryKey: ['urgencia-activa'],
    queryFn: () => citasApi.obtenerUrgenciaActiva(),
    refetchInterval: 15000,
    staleTime: 0,
  });
}

/** Hook para solicitar urgencia (mutación del paciente) */
export function useSolicitarUrgencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SolicitarUrgenciaRequest) => citasApi.solicitarUrgencia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urgencia-activa'] });
    },
  });
}

/** Hook para el psicólogo: listar urgencias pendientes con polling */
export function useUrgenciasPendientes() {
  return useQuery({
    queryKey: ['urgencias-pendientes'],
    queryFn: () => citasApi.listarUrgenciasPendientes(),
    refetchInterval: 15000,
    staleTime: 0,
    retry: false,
  });
}

/** Hook para aceptar urgencia */
export function useAceptarUrgencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ citaId, data }: { citaId: number; data: AceptarUrgenciaRequest }) =>
      citasApi.aceptarUrgencia(citaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urgencias-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
  });
}

/** Hook para rechazar urgencia */
export function useRechazarUrgencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ citaId, data }: { citaId: number; data: RechazarUrgenciaRequest }) =>
      citasApi.rechazarUrgencia(citaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urgencias-pendientes'] });
    },
  });
}

/** Hook para que el paciente cancele su propia urgencia */
export function useCancelarUrgencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (citaId: number) => citasApi.cancelarUrgenciaPaciente(citaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urgencia-activa'] });
    },
  });
}