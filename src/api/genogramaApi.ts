import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export interface GenogramaNode {
  id: string;
  tipo: 'paciente' | 'padre' | 'madre' | 'hermano' | 'hermana' |
        'abuelo_paterno' | 'abuela_paterna' | 'abuelo_materno' | 'abuela_materna' |
        'hijo' | 'hija' | 'pareja' | 'otro';
  nombre: string;
  sexo?: 'M' | 'F' | 'NB' | 'NE';
  edad?: number;
  fallecido?: boolean;
  enfermedad?: string;
  notas?: string;
  position: { x: number; y: number };
}

export interface GenogramaEdge {
  id: string;
  source: string;
  target: string;
  tipo: 'matrimonio' | 'union_libre' | 'separacion' | 'divorcio' |
        'hijo' | 'conflicto' | 'distante' | 'cercano';
}

export interface GenogramaDatos {
  nodes: GenogramaNode[];
  edges: GenogramaEdge[];
}

export interface GenogramaResponse {
  id: number;
  paciente_id: string;
  datos: GenogramaDatos;
  actualizado_en: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function authHeaders() {
  const token = useAuthStore.getState().token;
  return { Authorization: `Bearer ${token}` };
}

export const genogramaApi = {
  get: async (pacienteId: string): Promise<GenogramaResponse> => {
    const { data } = await axios.get(
      `${API_BASE}/api/v1/genogramas/paciente/${pacienteId}`,
      { headers: authHeaders() }
    );
    return data;
  },

  save: async (pacienteId: string, datos: GenogramaDatos): Promise<GenogramaResponse> => {
    const { data } = await axios.put(
      `${API_BASE}/api/v1/genogramas/paciente/${pacienteId}`,
      datos,
      { headers: authHeaders() }
    );
    return data;
  },
};
