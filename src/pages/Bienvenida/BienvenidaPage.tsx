import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCitas, useUrgenciasPendientes, useUpdateEstadoCita, useAceptarUrgencia } from '@/hooks/useCitas';
import { usePacientes } from '@/hooks/usePacientes';
import { useUIStore } from '@/store/uiStore';
import { Calendar, ChevronRight, User, MoreVertical, LogOut, Menu, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import UrgenciasPanel from '@/components/Citas/UrgenciasPanel';
import type { UrgenciaPendiente } from '@/types';

export default function BienvenidaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { data: citas, isLoading: loadingCitas } = useCitas();
  const { data: pacientesData } = usePacientes({ page: 1, per_page: 1000 });
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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const today = useMemo(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, []);

  const agendaHoy = useMemo(() => {
    if (!citas || !Array.isArray(citas)) return [];

    const patients = pacientesData?.items || [];

    return citas
      .filter((c) => {
        if (!c.fecha) return false;
        const normalizedFecha = c.fecha.split('T')[0];
        return normalizedFecha === today;
      })
      .sort((a, b) => {
        const timeA = a.hora_inicio || (a as any).hora || '';
        const timeB = b.hora_inicio || (b as any).hora || '';
        return timeA.localeCompare(timeB);
      })
      .map((cita) => {
        const paciente = patients.find((p) => p.id === cita.paciente_id);

        const h = cita.hora_inicio || (cita as any).hora || '00:00:00';
        const [hourStr, minStr] = h.split(':');
        const hourNum = parseInt(hourStr, 10) || 0;
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = hourNum % 12 || 12;
        const horaFormateada = `${hour12}:${minStr || '00'}`;

        return {
          ...cita,
          pacienteNombre: paciente ? `${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}` : 'Paciente no encontrado',
          pacienteCarrera: paciente?.carrera || 'No especificada',
          pacienteSemestre: paciente?.semestre || 'N/A',
          horaFormateada,
          ampm
        };
      });
  }, [citas, today, pacientesData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Superior */}
      <header className="w-full bg-white px-8 py-4 flex justify-between items-center relative z-10 border-b border-gray-100">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-[#1B396A] hover:bg-gray-50 rounded-lg transition-all"
          title="Alternar Menú"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-sm font-bold text-[#1B396A]">
              {user?.nombre || user?.username}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.rol?.nombre || 'Psicólogo Clínico'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1B396A] flex items-center justify-center text-white border-2 border-gray-100 overflow-hidden">
            <User size={20} />
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Hero Section / Institutional Header */}
      <section className="bg-white py-12 px-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo Izquierdo - TecNM */}
          <div className="hidden md:block flex-shrink-0">
            <div className="w-40 h-auto flex items-center justify-center">
              <img src="/images/logo-tecnm.png" alt="Logo TecNM" className="w-full h-auto object-contain" />
            </div>
          </div>

          {/* Texto Central */}
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B396A] tracking-tight mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              INSTITUTO TECNOLÓGICO DE VILLAHERMOSA
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-[#1B396A]/80 tracking-wide mb-1">
              SUBDIRECCIÓN ACADÉMICA
            </h2>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em] mb-6">
              DEPARTAMENTO DE DESARROLLO ACADÉMICO
            </p>

            <div className="w-24 h-1 bg-[#1B396A] mx-auto mb-8 rounded-full"></div>

            <h3 className="text-2xl md:text-3xl font-bold text-[#1B396A]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Programa de Psicoterapia a la Población Estudiantil
            </h3>
          </div>

          {/* Logo Derecho - ITVH */}
          <div className="hidden md:block flex-shrink-0">
            <div className="w-32 h-auto flex items-center justify-center">
              <img src="/images/logo-itvh.webp" alt="Logo ITVH" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-8 -mt-6 space-y-8">
        
        {/* Panel de Urgencias (Solo para psicólogos) */}
        {user?.rol?.nombre !== 'paciente' && (
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
        )}

        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
          {/* Agenda Header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
            <h4 className="text-xl font-bold text-[#1B396A]">Agenda del Día</h4>
            <button
              onClick={() => navigate('/citas')}
              className="flex items-center gap-2 text-sm font-semibold text-[#1B396A] hover:gap-3 transition-all"
            >
              Ver Calendario <ChevronRight size={18} />
            </button>
          </div>

          {/* Agenda List */}
          <div className="p-8 space-y-4">
            {loadingCitas ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1B396A] border-t-transparent" />
              </div>
            ) : agendaHoy.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">No hay citas programadas para hoy.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/citas')}
                >
                  Programar Nueva Cita
                </Button>
              </div>
            ) : (
              agendaHoy.map((cita) => (
                <div
                  key={cita.id}
                  className={`flex items-center gap-6 p-6 rounded-2xl transition-all group border-2 ${cita.estado === 'confirmada' ? 'border-[#1B396A] bg-[#F8FAFC]' : 'border-transparent bg-gray-50/50 hover:bg-gray-50'
                    }`}
                >
                  {/* Time Section */}
                  <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-gray-200 pr-6">
                    <span className="text-2xl font-bold text-[#1B396A]">
                      {cita.horaFormateada}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {cita.ampm}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-[#1B396A] mb-0.5">
                      {cita.pacienteNombre}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {cita.pacienteCarrera} • {cita.pacienteSemestre}º Semestre
                    </p>
                  </div>

                  {/* Status & Actions */}
                  {/*<div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${cita.estado === 'confirmada'
                      ? 'bg-emerald-100 text-emerald-700'
                      : cita.estado === 'completada'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-[#E8EDF4] text-[#1B396A]'
                      }`}>
                      {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                    </span>

                    {cita.estado === 'confirmada' ? (
                      <button className="w-10 h-10 rounded-full bg-[#1B396A] text-white flex items-center justify-center shadow-lg shadow-[#1B396A]/20 hover:scale-110 transition-transform">
                        <Play size={18} fill="currentColor" />
                      </button>
                    ) : (
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    )}
                  </div> */}

                  <div className="relative inline-block text-left">

                    {/* Botón de 3 puntitos */}
                    <button className="flex items-center p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 peer">
                      <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                      </svg>
                    </button>

                    {/* Menú de opciones */}
                    <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none hidden peer-focus:block hover:block border border-gray-100">
                      <div className="py-2" role="none">
                        <button
                          onClick={() => navigate(`/pacientes?search=${cita.paciente_id}`)}
                          className="w-full text-left block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Ver Expediente
                        </button>
                        <button
                          onClick={() => navigate(`/citas`)}
                          className="w-full text-left block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Ir a Calendario
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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

        {/* Bottom Navigation Cards */}
        {user?.rol?.nombre !== 'desarrollo_academico' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <button
              onClick={() => navigate('/pacientes')}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mb-4">
                <User size={24} />
              </div>
              <h6 className="text-xl font-bold text-[#1B396A] mb-1">Expedientes</h6>
              <p className="text-xs text-gray-400">Gestión de pacientes y notas</p>
            </button>

            <button
              onClick={() => navigate('/estadisticas')}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mb-4">
                <Calendar size={24} />
              </div>
              <h6 className="font-bold text-[#1B396A] mb-1">Estadísticas</h6>
              <p className="text-xs text-gray-400">Análisis y estadísticas mensuales</p>
            </button>

            <button
              onClick={() => navigate('/horarios')}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mb-4">
                <MoreVertical size={24} />
              </div>
              <h6 className="font-bold text-[#1B396A] mb-1">Configuración de Horarios</h6>
              <p className="text-xs text-gray-400">Gestión de horarios y perfiles</p>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-8 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
          <div className="space-y-2">
            <h2 className="text-gray-900 text-2xl font-bold">PsicoGestor</h2>
            <p className="text-sm max-w-xs mx-auto leading-relaxed text-gray-500">
              Gestión de citas y pacientes para psicólogos.
            </p>
          </div>
          <div className="border-t border-gray-100 w-full max-w-xs mt-6 pt-4 text-xs text-gray-400">
            &copy; 2026 PsicpoGestor. Por Gerardo Segura Navarro y Marcos Cardenas Magaña
          </div>
        </div>
      </footer>
    </div>
  );
}