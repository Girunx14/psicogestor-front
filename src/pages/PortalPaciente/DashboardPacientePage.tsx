import { useState } from 'react';
import { Calendar, Plus, CalendarClock, Video, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useMisCitas, useCreateCitaPaciente, useUrgenciaActiva, useSolicitarUrgencia, useCancelarUrgencia } from '@/hooks/useCitas';
import { useHorariosPaciente } from '@/hooks/useHorarios';
import type { UrgenciaActiva } from '@/types';

const citaSchema = z.object({
  horario_id: z.coerce.number().min(1, 'Selecciona un horario'),
  motivo: z.string().min(5, 'Explica brevemente el motivo'),
});

type CitaSchemaType = z.infer<typeof citaSchema>;

const urgenciaSchema = z.object({
  motivo_consulta: z
    .string()
    .min(10, 'Describe el motivo con al menos 10 caracteres')
    .max(1000, 'Máximo 1000 caracteres'),
});

type UrgenciaSchemaType = z.infer<typeof urgenciaSchema>;

export default function DashboardPacientePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalidad, setModalidad] = useState<'presencial' | 'virtual'>('presencial');
  const [solicitudModalOpen, setSolicitudModalOpen] = useState(false);
  const { data: misCitas, isLoading: loadingCitas } = useMisCitas();
  const { data: horarios } = useHorariosPaciente();
  const createMutation = useCreateCitaPaciente();
  const { data: urgenciaActiva, isLoading: loadingUrgencia } = useUrgenciaActiva();
  const solicitarUrgenciaMutation = useSolicitarUrgencia();
  const cancelarUrgenciaMutation = useCancelarUrgencia();

  // Form de cita
  const {
    register: registerCita,
    handleSubmit: handleSubmitCita,
    reset: resetCita,
    formState: { errors: errorsCita },
  } = useForm<CitaSchemaType>({
    resolver: zodResolver(citaSchema) as any,
    defaultValues: {
      horario_id: 0,
      motivo: '',
    },
  });

  // Form de urgencia
  const {
    register: registerUrgencia,
    handleSubmit: handleSubmitUrgencia,
    reset: resetUrgencia,
    formState: { errors: errorsUrgencia },
  } = useForm<UrgenciaSchemaType>({
    resolver: zodResolver(urgenciaSchema) as any,
    defaultValues: {
      motivo_consulta: '',
    },
  });

  const availableHorarios = (horarios ?? []).filter((h) => h.disponible);

  const onSubmitCita = (data: CitaSchemaType) => {
    createMutation.mutate(
      { ...data, paciente_id: 'auto' },
      {
        onSuccess: () => {
          setModalOpen(false);
          resetCita();
        },
      },
    );
  };

  const onSubmitUrgencia = (data: UrgenciaSchemaType) => {
    solicitarUrgenciaMutation.mutate(data, {
      onSuccess: () => {
        setSolicitudModalOpen(false);
        resetUrgencia();
      },
    });
  };

  const handleCancelarUrgencia = () => {
    if (!urgenciaActiva?.id) return;
    cancelarUrgenciaMutation.mutate(urgenciaActiva.id);
  };

  const citas = Array.isArray(misCitas) ? misCitas : [];
  const proximasCitas = citas.filter((c) => c.estado === 'confirmada' || c.estado === 'pendiente');
  const pastCitas = citas.filter((c) => c.estado === 'completada' || c.estado === 'cancelada');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-secondary-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a tu Portal</h1>
          <p className="text-secondary-500 mt-1">Desde aquí puedes administrar tus citas y solicitar atención clínica.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {!urgenciaActiva && (
            <Button
              onClick={() => setSolicitudModalOpen(true)}
              variant="danger"
              className="w-full sm:w-auto shadow-md"
            >
              <AlertTriangle size={18} className="mr-1" />
              Solicitar Emergencia
            </Button>
          )}
          <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto shadow-md">
            <Plus size={18} className="mr-1" />
            Agendar Cita
          </Button>
        </div>
      </div>

      {/* ─── Sección de Emergencia ─── */}
      <EmergenciaSection
        urgencia={urgenciaActiva}
        isLoading={loadingUrgencia}
        onAbrirModal={() => setSolicitudModalOpen(true)}
        onCancelar={handleCancelarUrgencia}
        isCancelando={cancelarUrgenciaMutation.isPending}
        cancelarError={cancelarUrgenciaMutation.error}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="shadow-sm rounded-2xl border border-secondary-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarClock className="text-primary" size={20} />
            Próximas Citas
          </h2>

          {loadingCitas ? (
            <div className="p-8 text-center text-secondary-500">Cargando tus citas...</div>
          ) : proximasCitas.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="No tienes citas agendadas"
              description="Haz clic en Agendar Cita para separar un lugar con el psicólogo."
            />
          ) : (
            <div className="space-y-4">
              {proximasCitas.map((cita) => (
                <div key={cita.id} className="p-4 rounded-xl bg-secondary-50 border border-secondary-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{cita.fecha}</p>
                    <p className="text-secondary-600 font-medium">
                      {cita.hora_inicio?.slice(0, 5)} hrs
                    </p>
                    <p className="text-sm text-secondary-500 mt-1 bg-white inline-block px-2 py-0.5 rounded-md border border-secondary-200">
                      Modalidad: {cita.tipo}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${cita.estado === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {cita.estado === 'confirmada' ? 'Confirmada' : 'En espera'}
                    </span>
                    {cita.enlace_videollamada && (
                      <a href={cita.enlace_videollamada} target="_blank" rel="noreferrer" className="block mt-2 text-primary hover:underline text-sm font-medium">
                        Unirse a videollamada
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Historial de Atención */}
        <Card className="shadow-sm rounded-2xl border border-secondary-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            Historial de Atención
          </h2>
          {loadingCitas ? null : pastCitas.length === 0 ? (
            <div className="text-center py-12 text-secondary-400 text-sm">
              Tu historial de citas terminadas aparecerá aquí.
            </div>
          ) : (
            <div className="space-y-3">
              {pastCitas.slice(0, 5).map((cita) => (
                <div key={cita.id} className="flex justify-between items-center py-2 border-b border-secondary-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cita.fecha}</p>
                    <p className="text-xs text-secondary-500">Motivo: {cita.motivo?.slice(0, 30) ?? '—'}...</p>
                  </div>
                  <Badge variant={cita.estado === 'completada' ? 'success' : 'danger'}>
                    {cita.estado === 'completada' ? 'Asistió' : 'Cancelada'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal para agendar cita */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Agendar Nueva Cita" size="md">
        <form onSubmit={handleSubmitCita(onSubmitCita)} className="space-y-5">
          <p className="text-sm text-secondary-600 mb-4 bg-primary/10 p-3 rounded-lg text-primary-900 border border-primary/20">
            <strong>Instrucciones:</strong> Elige primero la modalidad (Presencial o Virtual), selecciona el horario disponible, y cuéntanos brevemente el motivo para que el psicólogo prepare la sesión.
          </p>

          <div className="grid grid-cols-1 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidad de Atención
            </label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setModalidad('presencial')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${modalidad === 'presencial' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Presencial
              </button>
              <button
                type="button"
                onClick={() => setModalidad('virtual')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${modalidad === 'virtual' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Virtual
              </button>
            </div>
          </div>

          <Select
            label="Horario Disponible"
            placeholder={`Selecciona un horario ${modalidad}`}
            error={errorsCita.horario_id?.message}
            options={availableHorarios
              .filter((h) => h.tipo === modalidad)
              .map((h) => ({
                value: h.id,
                label: `${h.fecha} — ${h.hora_inicio.slice(0, 5)} (${h.tipo})`,
              }))}
            {...registerCita('horario_id')}
          />

          <Textarea
            label="¿Cuál es el motivo de la consulta?"
            placeholder="Ejemplo: Necesito asesoría por temas de estrés escolar..."
            error={errorsCita.motivo?.message}
            rows={4}
            {...registerCita('motivo')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100 mt-6">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Solicitar Cita
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Solicitar Atención de Emergencia */}
      <Modal
        isOpen={solicitudModalOpen}
        onClose={() => setSolicitudModalOpen(false)}
        title="Solicitar Atención de Emergencia"
        size="md"
      >
        <form onSubmit={handleSubmitUrgencia(onSubmitUrgencia)} className="space-y-5">
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle size={24} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold mb-1 text-red-900">¿Estás en una situación de crisis?</h3>
              <p className="text-sm">
                Al confirmar, se enviará una alerta inmediata a los psicólogos del equipo para solicitar una videollamada de urgencia. Te pedimos que permanezcas en esta pantalla hasta que aparezca el enlace.
              </p>
            </div>
          </div>

          <Textarea
            label="Motivo de consulta"
            placeholder="Describe brevemente por qué necesitas atención urgente..."
            error={errorsUrgencia.motivo_consulta?.message}
            rows={5}
            {...registerUrgencia('motivo_consulta')}
          />

          {solicitarUrgenciaMutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {(solicitarUrgenciaMutation.error as { data?: { detail?: string } })?.data?.detail
                ?? 'Error al enviar la solicitud. Intenta de nuevo.'}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
            <Button variant="outline" type="button" onClick={() => setSolicitudModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={solicitarUrgenciaMutation.isPending}>
              Enviar solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Sección de Emergencia (integrada)
// ──────────────────────────────────────────────────

interface EmergenciaSectionProps {
  urgencia: UrgenciaActiva | null | undefined;
  isLoading: boolean;
  onAbrirModal: () => void;
  onCancelar: () => void;
  isCancelando: boolean;
  cancelarError: unknown;
}

function EmergenciaSection({ urgencia, isLoading, onAbrirModal, onCancelar, isCancelando, cancelarError }: EmergenciaSectionProps) {
  if (isLoading) {
    return (
      <div className="card-editorial p-6 border-l-4 border-l-red-400">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  // Sin urgencia activa
  if (!urgencia) {
    return (
      <div className="card-editorial p-6 border-l-4 border-l-red-400">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="section-title text-lg">¿Necesitas ayuda urgente?</h3>
            <p className="text-secondary-500 text-sm mt-1">
              Contacta a un psicólogo de inmediato para recibir atención.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Urgencia pendiente
  if (urgencia.estado === 'pendiente') {
    return (
      <div
        className="card-editorial p-6 border-l-4 border-l-amber-400"
        role="alert"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 animate-pulse">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="warning">En espera de respuesta</Badge>
            </div>
            <p className="text-secondary-700 text-sm font-medium">
              Tu solicitud está siendo revisada. Un psicólogo te contactará pronto.
            </p>
            {urgencia.motivo && (
              <blockquote className="mt-3 pl-3 border-l-2 border-amber-300 text-sm text-secondary-600 italic">
                &ldquo;{urgencia.motivo}&rdquo;
              </blockquote>
            )}
            {cancelarError != null && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                No se pudo cancelar la solicitud.
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelar}
                disabled={isCancelando}
              >
                {isCancelando ? 'Cancelando...' : 'Cancelar solicitud'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAbrirModal}
              >
                Modificar motivo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Urgencia confirmada
  if (urgencia.estado === 'confirmada' && urgencia.enlace_videollamada) {
    return (
      <div
        className="card-editorial p-6 border-l-4 border-l-green-500"
        role="alert"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <Video size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success">Sesión Confirmada</Badge>
            </div>
            <p className="text-secondary-700 text-sm font-medium">
              Tu sesión ha sido confirmada. Haz clic para unirte a la videollamada.
            </p>
            {urgencia.psicologo_nombre && (
              <p className="text-xs text-secondary-500 mt-1">
                Atendido por: <span className="font-medium">{urgencia.psicologo_nombre}</span>
              </p>
            )}
            <a
              href={urgencia.enlace_videollamada}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Video size={16} />
              Unirse a la videollamada
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Urgencia cancelada
  if (urgencia.estado === 'cancelada') {
    return (
      <div className="card-editorial p-6 border-l-4 border-l-red-400">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <XCircle size={24} className="text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="danger">Solicitud rechazada</Badge>
            </div>
            {urgencia.motivo_rechazo && (
              <p className="text-sm text-secondary-600 mt-1">
                <span className="font-medium">Motivo:</span> {urgencia.motivo_rechazo}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onAbrirModal}
              className="mt-3"
            >
              Enviar nueva solicitud
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}