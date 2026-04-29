// ──────────────────────────────────────────────────
// Domain Types — Aligned with Backend API
// ──────────────────────────────────────────────────

export type UserRole = 'administrador' | 'psicologo' | 'paciente' | 'desarrollo_academico' | 'asistente';

export interface Rol {
  id: number;
  nombre: UserRole;
}

export interface User {
  id: number;
  username: string;
  rol_id: number;
  creado_en: string; // ISO datetime
  rol: Rol;
}

// ──────────────────────────────────────────────────
// Catálogos
// ──────────────────────────────────────────────────

export interface Carrera {
  id: number;
  nombre: string;
  clave: string;
  activa: boolean;
}

export interface Religion {
  id: number;
  nombre: string;
  activa: boolean;
}

export interface SexoOption {
  valor: string;
  etiqueta: string;
}

export interface CatalogosResponse {
  carreras: Carrera[];
  religiones: Religion[];
  sexos: SexoOption[];
  semestres: number[];
}

// ──────────────────────────────────────────────────
// Pacientes
// ──────────────────────────────────────────────────

/** Paciente en listado (campos reducidos) */
export interface PacienteListItem {
  id: string; // UUID
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  numero_control: string;
  carrera: string | null;
  carrera_id: number;
  semestre: number;
  sexo: string;
  fecha_registro: string; // ISO datetime
  fecha_nacimiento: string | null;
}

/** Paciente detalle completo */
export interface Paciente {
  id: string; // UUID
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string; // ISO date
  sexo: string;
  religion: string | null;
  carrera: string | null;
  carrera_id: number;
  religion_id: number;
  semestre: number;
  numero_control: string;
  localidad: string;
  municipio: string;
  con_quien_vive: string;
  nombre_padre: string;
  nombre_madre: string;
  padres_separados: boolean;
  anios_padres_separados: number | null;
  fecha_registro: string; // ISO datetime
}

export interface PacienteCreate {
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  sexo: string;
  carrera_id: number;
  religion_id: number;
  semestre: number;
  numero_control: string;
  localidad: string;
  municipio: string;
  con_quien_vive: string;
  nombre_padre?: string;
  nombre_madre?: string;
  padres_separados: boolean;
  anios_padres_separados?: number | null;
}

export type PacienteUpdate = Partial<PacienteCreate>;

// ──────────────────────────────────────────────────
// Horarios Disponibles
// ──────────────────────────────────────────────────

export type TipoHorario = 'presencial' | 'virtual';

export interface Horario {
  id: number;
  psicologo_id: number;
  fecha: string; // ISO date
  hora_inicio: string; // HH:MM:SS
  hora_fin: string; // HH:MM:SS
  tipo: TipoHorario;
  disponible: boolean;
  creado_en: string;
}

export interface HorarioCreate {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: TipoHorario;
}

// ──────────────────────────────────────────────────
// Citas
// ──────────────────────────────────────────────────

export type TipoCita = 'presencial' | 'virtual';
export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
export type AgendadaPor = 'psicologo' | 'paciente';

export interface Cita {
  id: number;
  horario_id: number;
  paciente_id: string; // UUID
  psicologo_id: number;
  tipo: TipoCita;
  estado: EstadoCita;
  agendada_por: AgendadaPor;
  motivo: string | null;
  notas_cancelacion: string | null;
  enlace_videollamada: string | null;
  notas_sesion_online: string | null;
  creado_en: string;
  actualizado_en: string;
  // Enriched from horario
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface CitaCreate {
  horario_id: number;
  paciente_id: string;
  motivo?: string;
  enlace_videollamada?: string;
}

export interface CitaUrgenciaCreate {
  paciente_id: string;
  enlace_videollamada: string;
}

export interface CitaUpdateEstado {
  estado: EstadoCita;
  notas_cancelacion?: string;
  enlace_videollamada?: string;
  notas_sesion_online?: string;
}

// ──────────────────────────────────────────────────
// Notas de Evolución
// ──────────────────────────────────────────────────

export interface NotaEvolucion {
  id: number;
  paciente_id: string;
  psicologo_id: number;
  numero_sesion: number;
  impresion_diagnostica: string;
  fecha_hora: string;
  nota_texto: string | null;
  transcripcion_entrevista: string | null;
  creado_en: string;
}

export interface NotaEvolucionCreate {
  paciente_id: string;
  numero_sesion: number;
  impresion_diagnostica: string;
  fecha_hora: string;
  nota_texto: string;
  transcripcion_entrevista?: string;
}

export interface NotaEvolucionUpdate {
  impresion_diagnostica?: string;
  nota_texto?: string;
  transcripcion_entrevista?: string;
  fecha_hora?: string;
}

// ──────────────────────────────────────────────────
// Usuarios
// ──────────────────────────────────────────────────

export interface UsuarioCreate {
  username: string;
  password: string;
  rol_id: number;
}

export interface UsuarioUpdate {
  username?: string;
  password?: string;
  rol_id?: number;
}

// ──────────────────────────────────────────────────
// Estadísticas (por paciente)
// ──────────────────────────────────────────────────

export interface DiagnosticoHistorial {
  numero_sesion: number;
  fecha: string;
  diagnostico: string | null;
}

export interface EstadisticasCitas {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
  proxima_cita_fecha: string | null;
  proxima_cita_tipo: string | null;
}

export interface EstadisticasPaciente {
  paciente_id: string;
  total_sesiones: number;
  fecha_primera_sesion: string | null;
  fecha_ultima_sesion: string | null;
  dias_desde_ultima_sesion: number | null;
  frecuencia_promedio_dias: number | null;
  historial_diagnosticos: DiagnosticoHistorial[];
  diagnostico_mas_frecuente: string | null;
  citas: EstadisticasCitas;
}

// ──────────────────────────────────────────────────
// Urgencias
// ──────────────────────────────────────────────────

/** Urgencia vista por el paciente */
export interface UrgenciaActiva {
  id: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  motivo: string | null;
  enlace_videollamada: string | null;
  motivo_rechazo: string | null;
  creado_en: string;
  psicologo_nombre: string | null;
}

/** Urgencia vista por el psicólogo */
export interface UrgenciaPendiente {
  id: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  motivo: string | null;
  creado_en: string;
  paciente_nombre: string;
  paciente_numero_control: string | null;
}

/** Request para solicitar urgencia */
export interface SolicitarUrgenciaRequest {
  motivo_consulta: string;
}

/** Request para aceptar urgencia */
export interface AceptarUrgenciaRequest {
  enlace_videollamada: string;
}

/** Request para rechazar urgencia */
export interface RechazarUrgenciaRequest {
  motivo_rechazo: string;
}

// ──────────────────────────────────────────────────
// Psiquiatría
// ──────────────────────────────────────────────────

export interface DiagnosticoCatalogo {
  id: number;
  codigo: string;
  descripcion: string;
  tipo_sistema: string;
}

export interface MedicamentoCatalogo {
  id: number;
  nombre_generico: string;
  forma_farmaceutica: string;
  presentacion: string;
}

export interface EvaluacionPsiquiatricaCreate {
  paciente_id: string;
  cita_id: number;
  motivo_consulta: string;
  antecedentes_personales: string;
  antecedentes_familiares: string;
  examen_mental: string;
  plan_tratamiento: string;
  diagnostico_ids: number[];
}

export interface DetallePrescripcion {
  medicamento_id: number;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones_especificas: string;
}

export interface PrescripcionCreate {
  paciente_id: string;
  cita_id: number;
  indicaciones_generales: string;
  detalles: DetallePrescripcion[];
}

export interface SeguimientoPsiquiatricoCreate {
  paciente_id: string;
  cita_id: number;
  evolucion: string;
  ajuste_medicamentos: string;
  respuesta_tratamiento: string;
  efectos_secundarios: string;
}

// ──────────────────────────────────────────────────
// Resúmenes Clínicos
// ──────────────────────────────────────────────────

export interface ResumenPaciente {
  id: number;
  paciente_id: string;
  contenido_resumen: string;
  ultima_actualizacion: string;
}

// ──────────────────────────────────────────────────
// API Response Wrappers
// ──────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ──────────────────────────────────────────────────
// Error types
// ──────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  code?: string;
  status_code?: number;
}
