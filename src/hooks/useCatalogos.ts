import { useQuery } from '@tanstack/react-query';
import { catalogosApi } from '@/api/catalogosApi';

/**
 * Loads all catalogs at once (carreras, religiones, sexos, semestres).
 * Ideal for forms that need multiple selects.
 * Uses a 10-minute stale time since catalogs change rarely.
 */
export function useCatalogos() {
  return useQuery({
    queryKey: ['catalogos'],
    queryFn: () => catalogosApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 min
  });
}

export function useCarreras() {
  return useQuery({
    queryKey: ['catalogos', 'carreras'],
    queryFn: () => catalogosApi.getCarreras(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useReligiones() {
  return useQuery({
    queryKey: ['catalogos', 'religiones'],
    queryFn: () => catalogosApi.getReligiones(),
    staleTime: 10 * 60 * 1000,
  });
}
