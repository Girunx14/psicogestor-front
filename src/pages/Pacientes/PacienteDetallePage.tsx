import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Edit, Plus, FileText, Trash2, User, GraduationCap, MapPin, Users, ClipboardList, Sparkles, GitBranch, RefreshCw, Brain, Video, Volume2, Square } from 'lucide-react';
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
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!resumen?.contenido_resumen) return;

    const plainText = resumen.contenido_resumen
      .replace(/[#*`~>-]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n/g, '. ');

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'es-MX';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!showResumenModal && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [showResumenModal, isSpeaking]);

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
                className="btn-ai-glow inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                <Brain size={15} />
                <span>Resumen Clínico IA</span>
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
        <div className="space-y-6">
          {notas.length === 0 ? (
            <div className="text-center py-16 ai-animate-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText size={32} className="text-slate-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Sin datos para analizar</h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Registra al menos una nota de evolución para que la IA pueda generar un resumen clínico del paciente.
              </p>
            </div>
          ) : (
            <>
              {resumen?.contenido_resumen ? (
                <div className="ai-animate-in ai-animate-in-1">
                  {/* Status bar */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1a365d] bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                        <Brain size={12} />
                        Resumen generado
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {notas.length} sesión{notas.length !== 1 ? 'es' : ''} analizada{notas.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Summary content card */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm ai-animate-in ai-animate-in-2">
                    <div className="p-8 lg:p-10">
                      <div className="resumen-markdown">
                        <ReactMarkdown>{resumen.contenido_resumen}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ai-animate-in ai-animate-in-3">
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <RefreshCw size={11} className={generarResumenMutation.isPending ? "animate-spin text-[#1a365d]" : "text-slate-300"} />
                      Sincronizado: {new Date(resumen.ultima_actualizacion).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSpeak}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isSpeaking
                          ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        {isSpeaking ? (
                          <>
                            <Square size={13} fill="currentColor" />
                            Detener
                          </>
                        ) : (
                          <>
                            <Volume2 size={13} />
                            Escuchar
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleGenerarResumen}
                        disabled={generarResumenMutation.isPending}
                        className="btn-ai-premium inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                      >
                        {generarResumenMutation.isPending ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            Regenerando...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={13} />
                            Regenerar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ai-animate-in ai-animate-in-1 text-center py-14">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 flex items-center justify-center">
                    <Brain size={32} className="text-[#1a365d]" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Listo para analizar</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                    La IA analizará {notas.length} sesión{notas.length !== 1 ? 'es' : ''} y generará un resumen clínico consolidado.
                  </p>
                  <button
                    onClick={handleGenerarResumen}
                    disabled={generarResumenMutation.isPending}
                    className="btn-ai-premium inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-60"
                  >
                    {generarResumenMutation.isPending ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
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
                <div className="ai-animate-in ai-animate-in-3 text-center py-8">
                  <div className="inline-flex flex-col items-center">
                    <div className="relative w-14 h-14 mb-4">
                      <div className="absolute inset-0 rounded-full border-2 border-slate-200"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-[#1a365d] border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2.5 rounded-full bg-blue-50 flex items-center justify-center">
                        <Brain size={16} className="text-[#1a365d]" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Regenerando resumen...</p>
                    <p className="text-xs text-slate-400 mt-1">Analizando patrones clínicos</p>
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