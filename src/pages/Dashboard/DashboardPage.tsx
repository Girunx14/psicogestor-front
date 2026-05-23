import { useState } from 'react';
import { Users, Calendar, ClipboardList, Clock, FileText } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { usePacientes } from '@/hooks/usePacientes';
import { useCitas, useUrgenciasPendientes, useUpdateEstadoCita, useAceptarUrgencia } from '@/hooks/useCitas';
import UrgenciasPanel from '@/components/Citas/UrgenciasPanel';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UrgenciaPendiente } from '@/types';

export default function DashboardPage() {
  const { data: pacientesData, isLoading: loadingPacientes } = usePacientes({ page: 1, per_page: 1 });
  const { data: citasData, isLoading: loadingCitas } = useCitas();

  const totalPacientes = pacientesData?.total ?? 0;
  const citasList = Array.isArray(citasData) ? citasData : [];
  const citasPendientes = citasList.filter((c) => c.estado === 'pendiente').length;
  const citasConfirmadas = citasList.filter((c) => c.estado === 'confirmada').length;
  const citasCompletadas = citasList.filter((c) => c.estado === 'completada').length;

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: urgenciasPendientes, isLoading: loadingUrgencias, isError: hasUrgenciasError } = useUrgenciasPendientes();
  const updateEstadoMutation = useUpdateEstadoCita();
  const aceptarUrgenciaMutation = useAceptarUrgencia();

  const [enlaceModalOpen, setEnlaceModalOpen] = useState(false);
  const [urgenciaSeleccionada, setUrgenciaSeleccionada] = useState<UrgenciaPendiente | null>(null);
  const [enlaceInput, setEnlaceInput] = useState('');

  const handleAceptarUrgencia = (urgencia: UrgenciaPendiente) => {
    setUrgenciaSeleccionada(urgencia);
    setEnlaceInput('');
    setEnlaceModalOpen(true);
  };

  const handleSubmitEnlace = () => {
    if (!urgenciaSeleccionada || !enlaceInput.trim()) return;
    aceptarUrgenciaMutation.mutate(
      { citaId: urgenciaSeleccionada.id, data: { enlace_videollamada: enlaceInput.trim() } },
      {
        onSuccess: (data) => {
          if (data.enlace_videollamada) {
            window.open(data.enlace_videollamada, '_blank');
          }
          setEnlaceModalOpen(false);
          setUrgenciaSeleccionada(null);
        },
      },
    );
  };

  const handleFinalizarUrgencia = (urgencia: any) => {
    updateEstadoMutation.mutate({
      id: urgencia.id,
      data: { estado: 'completada' }
    });
  };

  const isLoading = loadingPacientes || loadingCitas || loadingUrgencias;

  return (
    <>
      <Topbar title="Dashboard" subtitle="Panel general del servicio" />
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Urgencias */}
            <UrgenciasPanel
              urgencias={urgenciasPendientes}
              isLoading={loadingUrgencias}
              hasError={hasUrgenciasError}
              onAceptar={handleAceptarUrgencia}
              onRechazar={() => navigate('/citas')}
              onFinalizar={handleFinalizarUrgencia}
              isAceptando={aceptarUrgenciaMutation.isPending}
              isRechazando={false}
              isFinalizando={updateEstadoMutation.isPending}
            />
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users size={20} />}
                label="Total Pacientes"
                value={totalPacientes}
              />
              <StatCard
                icon={<Clock size={20} />}
                label="Citas Pendientes"
                value={citasPendientes}
              />
              <StatCard
                icon={<Calendar size={20} />}
                label="Citas Confirmadas"
                value={citasConfirmadas}
              />
              <StatCard
                icon={<ClipboardList size={20} />}
                label="Citas Completadas"
                value={citasCompletadas}
              />
            </div>

            {/* Próximas citas */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Próximas Citas</h3>
              {citasList.filter((c) => c.estado === 'confirmada' || c.estado === 'pendiente').length === 0 ? (
                <p className="text-sm text-secondary-400 text-center py-8">
                  No hay citas próximas programadas.
                </p>
              ) : (
                <div className="space-y-3">
                  {citasList
                    .filter((c) => c.estado === 'confirmada' || c.estado === 'pendiente')
                    .sort((a, b) => a.fecha.localeCompare(b.fecha))
                    .slice(0, 10)
                    .map((cita) => (
                      <div key={cita.id} className="flex items-center gap-4 p-3 rounded-lg bg-surface">
                        <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                          <Calendar size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {cita.fecha} — {cita.hora_inicio?.slice(0, 5)}
                          </p>
                          <p className="text-xs text-secondary-400">
                            {cita.tipo} · {cita.motivo || 'Sin motivo especificado'}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${cita.estado === 'confirmada'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                          }`}>
                          {cita.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </Card>
            {/* Modal Enlace de Videollamada */}
            <Modal
              isOpen={enlaceModalOpen}
              onClose={() => {
                setEnlaceModalOpen(false);
                setUrgenciaSeleccionada(null);
                setEnlaceInput('');
              }}
              title="Videollamada de Urgencia"
              size="md"
            >
              <div className="space-y-4">
                {urgenciaSeleccionada && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-center">
                    <div className="mb-2">
                      <span className="font-medium text-slate-500">Paciente:</span>{' '}
                      <span className="text-slate-900 font-bold text-lg">{urgenciaSeleccionada.paciente_nombre}</span>
                      <button
                        onClick={() => navigate(`/pacientes/${urgenciaSeleccionada.paciente_id}`)}
                        className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <FileText size={16} />
                        Ver Expediente
                      </button>
                    </div>
                    {urgenciaSeleccionada.motivo && (
                      <div className="border-t border-slate-200 pt-2 mt-2">
                        <span className="font-medium text-slate-500">Motivo:</span>{' '}
                        <span className="text-slate-700 italic">"{urgenciaSeleccionada.motivo}"</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-3">Instrucciones:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>
                      <a
                        href="https://meet.google.com/new"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Abre meet.google.com/new
                      </a>{' '}
                      en una nueva pestaña
                    </li>
                    <li>Copia el enlace de la sala creada (ej. https://meet.google.com/abc-defg-hij)</li>
                    <li>Pégalo en el campo de abajo</li>
                    <li>Da click en "Iniciar Llamada"</li>
                  </ol>
                </div>
                <Input
                  label="Enlace de Google Meet"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={enlaceInput}
                  onChange={(e) => setEnlaceInput(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEnlaceModalOpen(false);
                      setUrgenciaSeleccionada(null);
                      setEnlaceInput('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitEnlace}
                    isLoading={aceptarUrgenciaMutation.isPending}
                    disabled={!enlaceInput.trim()}
                  >
                    Iniciar Llamada
                  </Button>
                </div>
              </div>
            </Modal>

            </Modal>
          </>
        )}
      </main>
    </>
  );
}
