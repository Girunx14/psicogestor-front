import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCitas } from '@/hooks/useCitas';
import { usePacientes } from '@/hooks/usePacientes';
import { useUIStore } from '@/store/uiStore';
import { Calendar, ChevronRight, User, MoreVertical, Play, LogOut, Menu } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BienvenidaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { data: citas, isLoading: loadingCitas } = useCitas();
  const { data: pacientesData } = usePacientes({ page: 1, per_page: 1000 });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const today = new Date().toISOString().split('T')[0];
  
  const agendaHoy = useMemo(() => {
    if (!citas || !Array.isArray(citas)) return [];
    
    const patients = pacientesData?.items || [];
    
    return citas
      .filter((c) => c.fecha === today)
      .sort((a, b) => a.hora.localeCompare(b.hora))
      .map((cita) => {
        const paciente = patients.find((p) => p.id === cita.paciente_id);
        return {
          ...cita,
          pacienteNombre: paciente ? `${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}` : 'Paciente no encontrado',
          pacienteCarrera: paciente?.carrera || 'No especificada',
          pacienteSemestre: paciente?.semestre || 'N/A',
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
              {user?.username === 'admin' ? 'Dr. Roberto Sánchez' : user?.username}
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
      <main className="max-w-5xl mx-auto p-8 -mt-6">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
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
                  className={`flex items-center gap-6 p-6 rounded-2xl transition-all group border-2 ${
                    cita.estado === 'confirmada' ? 'border-[#1B396A] bg-[#F8FAFC]' : 'border-transparent bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  {/* Time Section */}
                  <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-gray-200 pr-6">
                    <span className="text-2xl font-bold text-[#1B396A]">
                      {cita.hora.slice(0, 5)}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {parseInt(cita.hora.split(':')[0]) >= 12 ? 'PM' : 'AM'}
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
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      cita.estado === 'confirmada' 
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Navigation Cards (Alternative to just the agenda) */}
        {user?.rol?.nombre !== 'desarrollo_academico' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <button
            onClick={() => navigate('/pacientes')}
            className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <User size={24} />
            </div>
            <h6 className="font-bold text-[#1B396A] mb-1">Expedientes</h6>
            <p className="text-xs text-gray-400">Gestión de pacientes y notas</p>
          </button>

          <button
            onClick={() => navigate('/estadisticas')}
            className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Calendar size={24} />
            </div>
            <h6 className="font-bold text-[#1B396A] mb-1">Reportes</h6>
            <p className="text-xs text-gray-400">Análisis y estadísticas mensuales</p>
          </button>

          <button
            onClick={() => navigate('/horarios')}
            className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <MoreVertical size={24} />
            </div>
            <h6 className="font-bold text-[#1B396A] mb-1">Configuración</h6>
            <p className="text-xs text-gray-400">Gestión de horarios y perfiles</p>
          </button>
        </div>
        )}
      </main>
    </div>
  );
}