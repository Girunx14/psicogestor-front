import { Users, Calendar, ClipboardList, Clock } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import { usePacientes } from '@/hooks/usePacientes';
import { useCitas, useUrgenciasPendientes, useUpdateEstadoCita } from '@/hooks/useCitas';
import UrgenciasPanel from '@/components/Citas/UrgenciasPanel';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { data: pacientesData, isLoading: loadingPacientes } = usePacientes({ page: 1, per_page: 1 });
  const { data: citasData, isLoading: loadingCitas } = useCitas();

  const totalPacientes = pacientesData?.total ?? 0;
  const citasList = Array.isArray(citasData) ? citasData : [];
  const citasPendientes = citasList.filter((c) => c.estado === 'pendiente').length;
  const citasConfirmadas = citasList.filter((c) => c.estado === 'confirmada').length;
  const citasCompletadas = citasList.filter((c) => c.estado === 'completada').length;

  const navigate = useNavigate();
  const { data: urgenciasPendientes, isLoading: loadingUrgencias, isError: hasUrgenciasError } = useUrgenciasPendientes();
  const updateEstadoMutation = useUpdateEstadoCita();

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
              onAceptar={() => navigate('/citas')}
              onRechazar={() => navigate('/citas')}
              onFinalizar={handleFinalizarUrgencia}
              isAceptando={false}
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
          </>
        )}
      </main>
    </>
  );
}
