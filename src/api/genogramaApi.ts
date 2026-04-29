import axiosClient from './axiosClient';

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

export const genogramaApi = {
  get: async (pacienteId: string): Promise<GenogramaResponse> => {
    const { data } = await axiosClient.get(`/genogramas/paciente/${pacienteId}`);
    return data;
  },

  save: async (pacienteId: string, datos: GenogramaDatos): Promise<GenogramaResponse> => {
    const { data } = await axiosClient.put(
      `/genogramas/paciente/${pacienteId}`,
      datos,
    );
    return data;
  },
};
