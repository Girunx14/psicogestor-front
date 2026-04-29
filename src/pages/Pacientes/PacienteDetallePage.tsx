import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Edit, Plus, FileText, Trash2, User, GraduationCap, MapPin, Users, ClipboardList, Sparkles, GitBranch, RefreshCw, Brain, Video } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { CardEditorialHeader } from '@/components/ui/Card';
import GenogramaEditor from '@/components/genograma/GenogramaEditor';
import { usePaciente, useDeletePaciente } from '@/hooks/usePacientes';
import { useNotasPaciente } from '@/hooks/useNotas';
import { useResumenPaciente, useGenerarResumen } from '@/hooks/useResumenes';
import { useCatalogos } from '@/hooks/useCatalogos';
import { useCreateUrgencia } from '@/hooks/useCitas';

export default function PacienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pacienteId = id!;
  const { data: paciente, isLoading } = usePaciente(pacienteId);
  const { data: notasData } = useNotasPaciente(pacienteId);
  const deleteMutation = useDeletePaciente();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: resumen } = useResumenPaciente(pacienteId);
  const generarResumenMutation = useGenerarResumen();
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [showGenograma, setShowGenograma] = useState(false);

  const createUrgenciaMutation = useCreateUrgencia();
  const [showUrgenciaModal, setShowUrgenciaModal] = useState(false);
  const [urgenciaEnlace, setUrgenciaEnlace] = useState('');

  const { data: catalogos } = useCatalogos();
  const carreras = catalogos?.carreras ?? [];
  const religiones = catalogos?.religiones ?? [];

  const getCarreraNombre = (carreraId: number) => {
    return carreras.find(c => c.id === carreraId)?.nombre || '—';
  };

  const getReligionNombre = (religionId: number) => {
    return religiones.find(r => r.id === religionId)?.nombre || '—';
  };

  const handleGenerarResumen = () => {
    generarResumenMutation.mutate(pacienteId, {
      onSuccess: () => setShowResumenModal(true),
    });
  };

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date('');
    const [y, m, d] = dateStr.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  };

  const formatLocalDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const edad = (() => {
    if (!paciente?.fecha_nacimiento) return null;
    const now = new Date();
    const birth = parseLocalDate(paciente.fecha_nacimiento);
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  })();

  const notas = notasData?.items ?? [];

  const handleDelete = () => {
    deleteMutation.mutate(pacienteId, {
      onSuccess: () => navigate('/pacientes'),
    });
  };

  const getInitials = (nombres: string, ap: string, am: string) => {
    return `${nombres.charAt(0)}${ap.charAt(0)}${am ? am.charAt(0) : ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <>
        <Topbar title="Cargando..." />
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        </main>
      </>
    );
  }

  if (!paciente) {
    return (
      <>
        <Topbar title="Paciente no encontrado" />
        <main className="flex-1 p-6 lg:p-8">
          <EmptyState
            title="Paciente no encontrado"
            description="El paciente que buscas no existe o fue eliminado."
            action={<Button onClick={() => navigate('/pacientes')}>Volver a Pacientes</Button>}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={`${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`}
        subtitle={`No. Control: ${paciente.numero_control}`}
      />
      <main className="flex-1 p-6 lg:p-8 space-y-8">

        {/* Patient Header Hero */}
        <div className="patient-header page-enter page-enter-1">
          <div className="flex items-start gap-5">
            <div className="patient-avatar">
              {getInitials(paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="patient-name">{paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}</h1>
              <div className="patient-meta">
                {edad !== null && (
                  <>
                    <span className="patient-meta-item">
                      <User size={14} />
                      {edad} años
                    </span>
                    <span className="patient-meta-divider" />
                  </>
                )}
                <span className="patient-meta-item">
                  {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo}
                </span>
                <span className="patient-meta-divider" />
                <span className="patient-meta-item tag-editorial">
                  No. {paciente.numero_control}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#E5E4E2]">
            <button
              onClick={() => navigate(`/pacientes/${id}/editar`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit size={16} />
              Editar Paciente
            </button>
            <button
              onClick={() => {
                setShowGenograma(true);
                setTimeout(() => {
                  document.getElementById('genograma-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <GitBranch size={16} />
              Genograma
            </button>
            <button
              onClick={() => navigate(`/pacientes/${id}/notas/nueva`)}
              className="btn-action btn-action-primary"
            >
              <Plus size={16} />
              Nueva Nota
            </button>
            <button
              onClick={() => setShowUrgenciaModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors ml-auto"
            >
              <Video size={16} />
              Llamada de Urgencia
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-action btn-action-danger-outline"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        </div>

        {/* Data Sections Title */}
        <div className="page-enter page-enter-2">
          <h2 className="section-title">Información del Paciente</h2>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Datos personales */}
          <div className="card-editorial page-enter page-enter-2">
            <CardEditorialHeader
              icon={<User size={18} className="text-[#1B396A]" />}
              title="Datos Personales"
            />
            <div className="card-editorial-body">
              <dl className="space-y-0">
                <div className="info-row">
                  <dt className="info-row-label">Nombre completo</dt>
                  <dd className="info-row-value">{paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Fecha de nacimiento</dt>
                  <dd className="info-row-value">{formatLocalDate(paciente.fecha_nacimiento)}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Edad</dt>
                  <dd className="info-row-value">{edad !== null ? `${edad} años` : '—'}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Sexo</dt>
                  <dd className="info-row-value">{paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Datos académicos */}
          <div className="card-editorial page-enter page-enter-3">
            <CardEditorialHeader
              icon={<GraduationCap size={18} className="text-[#1B396A]" />}
              title="Datos Académicos"
            />
            <div className="card-editorial-body">
              <dl className="space-y-0">
                <div className="info-row">
                  <dt className="info-row-label">No. Control</dt>
                  <dd className="info-row-value">{paciente.numero_control}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Carrera</dt>
                  <dd className="info-row-value">{getCarreraNombre(paciente.carrera_id)}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Semestre</dt>
                  <dd className="info-row-value">{paciente.semestre}°</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Datos de origen */}
          <div className="card-editorial page-enter page-enter-4">
            <CardEditorialHeader
              icon={<MapPin size={18} className="text-[#1B396A]" />}
              title="Datos de Origen"
            />
            <div className="card-editorial-body">
              <dl className="space-y-0">
                <div className="info-row">
                  <dt className="info-row-label">Localidad</dt>
                  <dd className="info-row-value">{paciente.localidad}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Municipio</dt>
                  <dd className="info-row-value">{paciente.municipio}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Religión</dt>
                  <dd className="info-row-value">{getReligionNombre(paciente.religion_id)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Datos familiares */}
          <div className="card-editorial page-enter page-enter-5">
            <CardEditorialHeader
              icon={<Users size={18} className="text-[#1B396A]" />}
              title="Datos Familiares"
            />
            <div className="card-editorial-body">
              <dl className="space-y-0">
                <div className="info-row">
                  <dt className="info-row-label">Con quién vive</dt>
                  <dd className="info-row-value">{paciente.con_quien_vive}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Nombre del Padre</dt>
                  <dd className="info-row-value">{paciente.nombre_padre || '—'}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Nombre de la Madre</dt>
                  <dd className="info-row-value">{paciente.nombre_madre || '—'}</dd>
                </div>
                <div className="info-row">
                  <dt className="info-row-label">Padres separados</dt>
                  <dd className="info-row-value">
                    {paciente.padres_separados ? (
                      <span className="text-amber-600">Sí{paciente.anios_padres_separados ? ` (${paciente.anios_padres_separados} años)` : ''}</span>
                    ) : (
                      'No'
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Información del registro */}
          <div className="card-editorial page-enter page-enter-6 lg:col-span-2">
            <CardEditorialHeader
              icon={<ClipboardList size={18} className="text-[#1B396A]" />}
              title="Información del Registro"
            />
            <div className="card-editorial-body">
              <dl className="space-y-0">
                <div className="info-row">
                  <dt className="info-row-label">Fecha de registro</dt>
                  <dd className="info-row-value">{formatLocalDate(paciente.fecha_registro.split('T')[0])}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="separator-decorator">
          <div className="separator-line" />
          <div className="separator-dot" />
          <div className="separator-dot" />
          <div className="separator-dot" />
          <div className="separator-line" />
        </div>

        {/* Notas de evolución */}
        <div className="card-editorial page-enter page-enter-1">
          <div className="notes-section-header">
            <div className="notes-section-title">
              <div className="notes-section-icon">
                <FileText size={20} className="text-[#1B396A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2D2D2D]">Notas de Evolución</h3>
                <p className="text-xs text-[#6B6560] mt-0.5">{notasData?.total ?? 0} sesiones registradas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResumenModal(true)}
                className="btn-ai-glow inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                <Brain size={14} />
                <span>Resumen IA</span>
              </button>
            </div>
          </div>

          <div className="p-5">
            {notas.length === 0 ? (
              <EmptyState
                icon={<FileText size={28} />}
                title="Sin notas registradas"
                description="Crea una nueva nota de evolución para iniciar el expediente clínico."
              />
            ) : (
              <div className="space-y-4">
                {notas.map((nota, index) => (
                  <div
                    key={nota.id}
                    className="note-card"
                    onClick={() => navigate(`/pacientes/${id}/notas/nueva?nota_id=${nota.id}&view=true`)}
                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="note-session-badge">
                        {nota.numero_sesion}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-[#2D2D2D]">
                            Sesión {nota.numero_sesion}
                          </p>
                          <Badge variant="info">{nota.impresion_diagnostica || '—'}</Badge>
                        </div>
                        <p className="text-xs text-[#6B6560] flex items-center gap-1.5 mb-2">
                          <Calendar size={12} />
                          {new Date(nota.fecha_hora).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        {nota.nota_texto && (
                          <p className="text-sm text-[#6B6560] line-clamp-2 mb-2">
                            {nota.nota_texto}
                          </p>
                        )}
                        {nota.transcripcion_entrevista && (
                          <div className="mt-3 p-3 bg-[#FAFBFC] rounded-lg border border-[#E5E4E2]">
                            <p className="text-xs font-medium text-[#6B6560] mb-1.5">Transcripción:</p>
                            <p className="text-xs text-[#2D2D2D] line-clamp-3">
                              {nota.transcripcion_entrevista}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Genograma */}
        <div id="genograma-section" className="genogram-container page-enter page-enter-2">
          <div className="genogram-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(27,57,106,0.08) 0%, rgba(27,57,106,0.04) 100%)', border: '1px solid rgba(27,57,106,0.1)' }}>
                <GitBranch size={18} className="text-[#1B396A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2D2D2D]">Genograma Familiar</h3>
                <p className="text-xs text-[#6B6560] mt-0.5">Diagrama de relaciones familiares</p>
              </div>
            </div>
            <button
              onClick={() => setShowGenograma((v) => !v)}
              className="btn-action btn-action-outline text-xs py-1.5"
            >
              {showGenograma ? 'Contraer' : 'Expandir'}
            </button>
          </div>
          {showGenograma && (
            <div className="p-6">
              <GenogramaEditor
                pacienteId={pacienteId}
                pacienteNombre={`${paciente.nombres} ${paciente.apellido_paterno}`}
              />
            </div>
          )}
        </div>
      </main>

      {/* Urgencia modal */}
      <Modal
        isOpen={showUrgenciaModal}
        onClose={() => setShowUrgenciaModal(false)}
        title="Generar Llamada de Urgencia"
        size="md"
      >
        <div className="space-y-4">
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
            label="Enlace de Google Meet"
            placeholder="https://meet.google.com/..."
            value={urgenciaEnlace}
            onChange={(e) => setUrgenciaEnlace(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowUrgenciaModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!urgenciaEnlace) return;
                createUrgenciaMutation.mutate(
                  { paciente_id: pacienteId, enlace_videollamada: urgenciaEnlace },
                  {
                    onSuccess: () => {
                      setShowUrgenciaModal(false);
                      setUrgenciaEnlace('');
                    }
                  }
                );
              }}
              isLoading={createUrgenciaMutation.isPending}
              disabled={!urgenciaEnlace}
            >
              Iniciar Urgencia
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resumen IA modal */}
      <Modal
        isOpen={showResumenModal}
        onClose={() => setShowResumenModal(false)}
        title="Resumen Clínico con IA"
        size="lg"
        variant="ai-header"
      >
        <div className="space-y-5">
          {notas.length === 0 ? (
            <div className="ai-empty-state ai-animate-in">
              <div className="ai-icon-container">
                <FileText size={32} className="text-teal-600 relative z-10" />
              </div>
              <div className="ai-badge mb-4">
                <Brain size={10} />
                Sin datos suficientes
              </div>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">No hay sesiones registradas</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                Registra al menos una nota de evolución para que la inteligencia artificial pueda analizar el historial clínico del paciente.
              </p>
            </div>
          ) : (
            <>
              <div className="ai-animate-in ai-animate-in-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="ai-badge">
                    <Brain size={10} />
                    AI Powered
                  </div>
                  <span className="text-xs text-slate-500">
                    {notas.length} sesión{notas.length !== 1 ? 'es' : ''} analizada{notas.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {resumen?.contenido_resumen && (
                  <button
                    onClick={handleGenerarResumen}
                    disabled={generarResumenMutation.isPending}
                    className="btn-ai-regenerate inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    {generarResumenMutation.isPending ? (
                      <div className="neural-pulse">
                        <RefreshCw size={12} className="animate-spin" />
                      </div>
                    ) : (
                      <>
                        <RefreshCw size={12} />
                        Regenerar
                      </>
                    )}
                  </button>
                )}
              </div>

              {resumen?.contenido_resumen ? (
                <div className="ai-summary-card ai-animate-in ai-animate-in-2 rounded-xl p-6">
                  <div className="resumen-markdown text-sm">
                    <ReactMarkdown>{resumen.contenido_resumen}</ReactMarkdown>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-teal-500">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Generado el {new Date(resumen.ultima_actualizacion).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <button
                      onClick={handleGenerarResumen}
                      disabled={generarResumenMutation.isPending}
                      className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {generarResumenMutation.isPending ? (
                        <>
                          <div className="neural-pulse">
                            <RefreshCw size={11} className="animate-spin" />
                          </div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={11} />
                          Regenerar resumen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ai-animate-in ai-animate-in-2 text-center py-10">
                  <div className="ai-icon-container mb-5">
                    <Brain size={36} className="text-teal-600 relative z-10" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">Listo para analizar</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                    La inteligencia artificial analizará las {notas.length} sesión{notas.length !== 1 ? 'es' : ''} registrada{notas.length !== 1 ? 's' : ''} y generará un resumen clínico integral.
                  </p>
                  <button
                    onClick={handleGenerarResumen}
                    disabled={generarResumenMutation.isPending}
                    className="btn-ai-generate inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-70"
                  >
                    {generarResumenMutation.isPending ? (
                      <>
                        <div className="neural-pulse">
                          <Sparkles size={16} />
                        </div>
                        Analizando sesiones...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generar Resumen Clínico
                      </>
                    )}
                  </button>
                </div>
              )}

              {generarResumenMutation.isPending && resumen?.contenido_resumen && (
                <div className="ai-animate-in ai-animate-in-3 text-center py-6">
                  <div className="inline-flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-2 border-teal-200"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                        <Brain size={18} className="text-teal-600" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-700">Generando nuevo resumen...</p>
                    <p className="text-xs text-slate-400 mt-1">Analizando patrones y tendencias</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Eliminar Paciente" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          ¿Estás seguro de eliminar este paciente? Se eliminarán también todas sus citas, notas y datos asociados. Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}