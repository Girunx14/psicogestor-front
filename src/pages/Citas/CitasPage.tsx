import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Video, MapPin, CheckCircle, XCircle, FileText } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useCitas, useCreateCita, useUpdateEstadoCita, useUrgenciasPendientes, useAceptarUrgencia, useRechazarUrgencia } from '@/hooks/useCitas';
import { useHorarios } from '@/hooks/useHorarios';
import { usePacientes } from '@/hooks/usePacientes';
import type { Cita, EstadoCita, UrgenciaPendiente } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import UrgenciasPanel from '@/components/Citas/UrgenciasPanel';
import { formatDate } from '@/lib/utils';

const citaSchema = z.object({
  horario_id: z.coerce.number().min(1, 'Selecciona un horario'),
  paciente_id: z.string().min(1, 'Ingresa el ID del paciente'),
  motivo: z.string(),
  enlace_videollamada: z.string(),
});

type CitaSchemaType = z.infer<typeof citaSchema>;

const aceptarUrgenciaSchema = z.object({
  enlace_videollamada: z.string().min(1, 'El enlace es requerido').url('Ingresa una URL válida'),
});

type AceptarUrgenciaSchemaType = z.infer<typeof aceptarUrgenciaSchema>;

const rechazarUrgenciaSchema = z.object({
  motivo_rechazo: z.string().min(5, 'Ingresa el motivo del rechazo'),
});

type RechazarUrgenciaSchemaType = z.infer<typeof rechazarUrgenciaSchema>;

const estadoBadge: Record<EstadoCita, { label: string; variant: 'info' | 'success' | 'danger' | 'warning' }> = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  confirmada: { label: 'Confirmada', variant: 'info' },
  completada: { label: 'Completada', variant: 'success' },
  cancelada: { label: 'Cancelada', variant: 'danger' },
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7:00 - 18:00
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}



export default function CitasPage() {
  const [currentWeek, setCurrentWeek] = useState(() => getWeekStart(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [aceptarModalOpen, setAceptarModalOpen] = useState(false);
  const [rechazarModalOpen, setRechazarModalOpen] = useState(false);
  const [urgenciaSeleccionada, setUrgenciaSeleccionada] = useState<UrgenciaPendiente | null>(null);
  const navigate = useNavigate();

  const { data: citas, isLoading } = useCitas();
  const { data: horarios } = useHorarios();
  const { data: pacientesData } = usePacientes({ page: 1, per_page: 1000 });
  const { data: urgenciasPendientes, isLoading: loadingUrgencias, isError: hasUrgenciasError } = useUrgenciasPendientes();
  const createMutation = useCreateCita();
  const updateEstadoMutation = useUpdateEstadoCita();
  const aceptarUrgenciaMutation = useAceptarUrgencia();
  const rechazarUrgenciaMutation = useRechazarUrgencia();

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(currentWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeek]);

  const prevWeek = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() - 7);
    setCurrentWeek(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + 7);
    setCurrentWeek(d);
  };

  const goToToday = () => setCurrentWeek(getWeekStart(new Date()));

  const citasBySlot = useMemo(() => {
    const map: Record<string, Cita[]> = {};
    const citasList = Array.isArray(citas) ? citas : [];
    citasList.forEach((c) => {
      const horaReal = c.hora_inicio || (c as any).hora;
      if (!c.fecha || !horaReal) return;
      const hour = parseInt(horaReal.split(':')[0], 10);
      const key = `${c.fecha}-${hour}`;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [citas]);

  const availableHorarios = (horarios ?? []).filter((h) => h.disponible);

  // Form nueva cita
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CitaSchemaType>({
    resolver: zodResolver(citaSchema) as any,
    defaultValues: {
      horario_id: 0,
      paciente_id: '',
      motivo: '',
      enlace_videollamada: '',
    },
  });

  // Form aceptar urgencia
  const {
    register: registerAceptar,
    handleSubmit: handleSubmitAceptar,
    reset: resetAceptar,
    formState: { errors: errorsAceptar },
  } = useForm<AceptarUrgenciaSchemaType>({
    resolver: zodResolver(aceptarUrgenciaSchema) as any,
    defaultValues: {
      enlace_videollamada: '',
    },
  });

  // Form rechazar urgencia
  const {
    register: registerRechazar,
    handleSubmit: handleSubmitRechazar,
    reset: resetRechazar,
    formState: { errors: errorsRechazar },
  } = useForm<RechazarUrgenciaSchemaType>({
    resolver: zodResolver(rechazarUrgenciaSchema) as any,
    defaultValues: {
      motivo_rechazo: '',
    },
  });

  const onSubmit = useCallback(
    (data: CitaSchemaType) => {
      createMutation.mutate(data, {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
      });
    },
    [createMutation, reset],
  );

  const onSubmitAceptar = (data: AceptarUrgenciaSchemaType) => {
    if (!urgenciaSeleccionada) return;
    aceptarUrgenciaMutation.mutate(
      { citaId: urgenciaSeleccionada.id, data },
      {
        onSuccess: () => {
          setAceptarModalOpen(false);
          setUrgenciaSeleccionada(null);
          resetAceptar();
        },
      },
    );
  };

  const onSubmitRechazar = (data: RechazarUrgenciaSchemaType) => {
    if (!urgenciaSeleccionada) return;
    rechazarUrgenciaMutation.mutate(
      { citaId: urgenciaSeleccionada.id, data },
      {
        onSuccess: () => {
          setRechazarModalOpen(false);
          setUrgenciaSeleccionada(null);
          resetRechazar();
        },
      },
    );
  };

  const abrirAceptarModal = (urgencia: UrgenciaPendiente) => {
    setUrgenciaSeleccionada(urgencia);
    setAceptarModalOpen(true);
  };

  const abrirRechazarModal = (urgencia: UrgenciaPendiente) => {
    setUrgenciaSeleccionada(urgencia);
    setRechazarModalOpen(true);
  };

  const monthLabel = currentWeek.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Topbar title="Agenda de Citas" subtitle="Vista semanal" />
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        {/* ─── Panel de Urgencias Pendientes ─── */}
        <UrgenciasPanel
          urgencias={urgenciasPendientes}
          isLoading={loadingUrgencias}
          hasError={hasUrgenciasError}
          onAceptar={abrirAceptarModal}
          onRechazar={abrirRechazarModal}
          isAceptando={aceptarUrgenciaMutation.isPending}
          isRechazando={rechazarUrgenciaMutation.isPending}
        />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevWeek}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <Button variant="ghost" size="sm" onClick={nextWeek}>
              <ChevronRight size={18} />
            </Button>
            <span className="text-sm font-medium text-gray-700 capitalize ml-2">{monthLabel}</span>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            Nueva Cita
          </Button>
        </div>

        {/* Weekly grid */}
        <div className="bg-white rounded-xl border border-secondary-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-secondary-100">
                    <th className="w-16 px-3 py-3 text-xs font-medium text-secondary-400" />
                    {weekDays.map((day, i) => {
                      const isToday = formatDate(day) === formatDate(new Date());
                      return (
                        <th
                          key={i}
                          className={`px-3 py-3 text-center ${isToday ? 'bg-primary-50' : ''}`}
                        >
                          <p className="text-xs font-medium text-secondary-400">{DAYS[i]}</p>
                          <p
                            className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-gray-900'
                              }`}
                          >
                            {day.getDate()}
                          </p>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hour) => (
                    <tr key={hour} className="border-b border-secondary-50">
                      <td className="px-3 py-2 text-xs text-secondary-400 text-right align-top">
                        {hour}:00
                      </td>
                      {weekDays.map((day, i) => {
                        const key = `${formatDate(day)}-${hour}`;
                        const slotCitas = citasBySlot[key] || [];
                        return (
                          <td
                            key={i}
                            className="px-1.5 py-1.5 align-top min-h-[60px] border-l border-secondary-50"
                          >
                            {slotCitas.map((cita) => {
                              const badge = estadoBadge[cita.estado];
                              return (
                                <div
                                  key={cita.id}
                                  className="mb-1 p-2 rounded-lg bg-primary-50 border border-primary-100 text-xs group relative"
                                >
                                  <p className="font-medium text-primary truncate">
                                    Paciente
                                  </p>
                                  <p className="text-primary-400 flex items-center gap-1 mt-0.5">
                                    {cita.tipo === 'virtual' ? <Video size={10} /> : <MapPin size={10} />}
                                    {(cita.hora_inicio || (cita as any).hora)?.slice(0, 5)} · {cita.tipo}
                                  </p>
                                  {cita.motivo && (
                                    <p className="text-primary-300 truncate mt-0.5">{cita.motivo}</p>
                                  )}
                                  <Badge variant={badge.variant} className="mt-1">
                                    {badge.label}
                                  </Badge>
                                  {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                                    <div className="hidden group-hover:flex gap-1 mt-1.5">
                                      {cita.estado === 'pendiente' && (
                                        <button
                                          onClick={() =>
                                            updateEstadoMutation.mutate({
                                              id: cita.id,
                                              data: { estado: 'confirmada' },
                                            })
                                          }
                                          className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        >
                                          Confirmar
                                        </button>
                                      )}
                                      {cita.estado === 'confirmada' && (
                                        <button
                                          onClick={() =>
                                            updateEstadoMutation.mutate({
                                              id: cita.id,
                                              data: { estado: 'completada' },
                                            })
                                          }
                                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        >
                                          Completar
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          updateEstadoMutation.mutate({
                                            id: cita.id,
                                            data: { estado: 'cancelada' },
                                          })
                                        }
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New appointment modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Cita" size="lg">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <Select
              label="Horario Disponible"
              placeholder="Selecciona un horario"
              error={errors.horario_id?.message}
              options={availableHorarios.map((h) => ({
                value: h.id,
                label: `${h.fecha} — ${(h.hora_inicio || (h as any).hora)?.slice(0, 5)} (${h.tipo})`,
              }))}
              {...register('horario_id')}
            />
            <Select
              label="Paciente"
              placeholder="Selecciona un paciente"
              error={errors.paciente_id?.message}
              options={(pacientesData?.items ?? []).map((p) => ({
                value: p.id,
                label: `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno || ''} - ${p.numero_control}`,
              }))}
              {...register('paciente_id')}
            />
            <Textarea
              label="Motivo de la cita"
              placeholder="Describe brevemente el motivo..."
              {...register('motivo')}
            />
            <Input
              label="Enlace de videollamada (opcional)"
              placeholder="https://meet.google.com/..."
              {...register('enlace_videollamada')}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Crear Cita
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Aceptar Urgencia */}
        <Modal
          isOpen={aceptarModalOpen}
          onClose={() => {
            setAceptarModalOpen(false);
            setUrgenciaSeleccionada(null);
            resetAceptar();
          }}
          title="Aceptar Solicitud de Urgencia"
          size="md"
        >
          <form onSubmit={handleSubmitAceptar(onSubmitAceptar)} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  Paciente: <span className="font-semibold">{urgenciaSeleccionada?.paciente_nombre}</span>
                </p>
                {urgenciaSeleccionada?.paciente_id && (
                  <button
                    type="button"
                    onClick={() => navigate(`/pacientes/${urgenciaSeleccionada.paciente_id}`)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    <FileText size={16} />
                    Ver Expediente
                  </button>
                )}
              </div>

              {urgenciaSeleccionada?.motivo && (
                <p className="mt-2 text-blue-700 italic">&ldquo;{urgenciaSeleccionada.motivo}&rdquo;</p>
              )}
            </div>


            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-4 rounded-lg">
              <p className="font-semibold mb-2">Instrucciones:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Haz clic en el siguiente botón para abrir Google Meet y crear una sala instantánea.</li>
                <li>Copia el enlace de la sala (ej. <code>https://meet.google.com/abc-defg-hij</code>).</li>
                <li>Pega el enlace en el campo de abajo y guarda. El paciente recibirá la alerta de inmediato.</li>
              </ol>
              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-medium text-blue-600 hover:text-blue-800 underline"
              >
                Abrir meet.google.com/new en nueva pestaña
              </a>
            </div>

            <Input
              label="Enlace de videollamada (Google Meet u otro)"
              placeholder="https://meet.google.com/abc-defg-hij"
              error={errorsAceptar.enlace_videollamada?.message}
              {...registerAceptar('enlace_videollamada')}
            />

            {aceptarUrgenciaMutation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {(aceptarUrgenciaMutation.error as { data?: { detail?: string } })?.data?.detail
                  ?? 'Error al aceptar la urgencia. Intenta de nuevo.'}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setAceptarModalOpen(false);
                  setUrgenciaSeleccionada(null);
                  resetAceptar();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={aceptarUrgenciaMutation.isPending}>
                <CheckCircle size={16} className="mr-1" />
                Aceptar y enviar enlace
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Rechazar Urgencia */}
        <Modal
          isOpen={rechazarModalOpen}
          onClose={() => {
            setRechazarModalOpen(false);
            setUrgenciaSeleccionada(null);
            resetRechazar();
          }}
          title="Rechazar Solicitud de Urgencia"
          size="md"
        >
          <form onSubmit={handleSubmitRechazar(onSubmitRechazar)} className="space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
              <p className="font-medium mb-1">Paciente: <span className="font-semibold">{urgenciaSeleccionada?.paciente_nombre}</span></p>
              {urgenciaSeleccionada?.motivo && (
                <p className="mt-2 text-red-700 italic">&ldquo;{urgenciaSeleccionada.motivo}&rdquo;</p>
              )}
            </div>

            <Textarea
              label="Motivo del rechazo"
              placeholder="Explica por qué no se puede atender esta solicitud de urgencia..."
              error={errorsRechazar.motivo_rechazo?.message}
              rows={4}
              {...registerRechazar('motivo_rechazo')}
            />

            {rechazarUrgenciaMutation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {(rechazarUrgenciaMutation.error as { data?: { detail?: string } })?.data?.detail
                  ?? 'Error al rechazar la urgencia. Intenta de nuevo.'}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setRechazarModalOpen(false);
                  setUrgenciaSeleccionada(null);
                  resetRechazar();
                }}
              >
                Cancelar
              </Button>
              <Button variant="danger" type="submit" isLoading={rechazarUrgenciaMutation.isPending}>
                <XCircle size={16} className="mr-1" />
                Rechazar solicitud
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}
