import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Edit, Plus, FileText, Trash2, User, GraduationCap, MapPin, Users, ClipboardList, Sparkles, GitBranch, RefreshCw, Brain } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import GenogramaEditor from '@/components/genograma/GenogramaEditor';
import { usePaciente, useDeletePaciente } from '@/hooks/usePacientes';
import { useNotasPaciente } from '@/hooks/useNotas';
import { useResumenPaciente, useGenerarResumen } from '@/hooks/useResumenes';

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
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" onClick={() => navigate(`/pacientes/${id}/editar`)}>
            <Edit size={16} />
            Editar Datos
          </Button>
          <Button onClick={() => navigate(`/pacientes/${id}/notas/nueva`)}>
            <Plus size={16} />
            Nueva Nota
          </Button>
          <Button variant="outline" className="ml-auto text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={16} />
            Eliminar
          </Button>
        </div>

        {/* Patient info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos personales */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(37,99,235,0.08)] border border-gray-100 overflow-hidden border-l-4 border-l-primary">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-primary" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Datos Personales</h3>
            </div>
            <div className="p-5">
              <dl className="space-y-0 text-sm">
                <Row label="Nombre completo" value={`${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`} />
                <Row label="Fecha de nacimiento" value={formatLocalDate(paciente.fecha_nacimiento)} />
                <Row label="Edad" value={edad !== null ? `${edad} años` : '—'} />
                <Row label="Sexo" value={paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo} />
              </dl>
            </div>
          </section>

          {/* Datos académicos */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(37,99,235,0.08)] border border-gray-100 overflow-hidden border-l-4 border-l-primary">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4 h-4 text-primary" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Datos Académicos</h3>
            </div>
            <div className="p-5">
              <dl className="space-y-0 text-sm">
                <Row label="No. Control" value={paciente.numero_control} />
                <Row label="Carrera" value={paciente.carrera || '—'} />
                <Row label="Semestre" value={`${paciente.semestre}°`} />
              </dl>
            </div>
          </section>

          {/* Datos de origen */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(37,99,235,0.08)] border border-gray-100 overflow-hidden border-l-4 border-l-primary">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <MapPin className="w-4 h-4 text-primary" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Datos de Origen</h3>
            </div>
            <div className="p-5">
              <dl className="space-y-0 text-sm">
                <Row label="Localidad" value={paciente.localidad} />
                <Row label="Municipio" value={paciente.municipio} />
                <Row label="Religión" value={paciente.religion || '—'} />
              </dl>
            </div>
          </section>

          {/* Datos familiares */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(37,99,235,0.08)] border border-gray-100 overflow-hidden border-l-4 border-l-primary">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4 text-primary" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Datos Familiares</h3>
            </div>
            <div className="p-5">
              <dl className="space-y-0 text-sm">
                <Row label="Con quién vive" value={paciente.con_quien_vive} />
                <Row label="Nombre del Padre" value={paciente.nombre_padre || '—'} />
                <Row label="Nombre de la Madre" value={paciente.nombre_madre || '—'} />
                <Row label="Padres separados" value={paciente.padres_separados ? 'Sí' : 'No'} />
                {paciente.padres_separados && paciente.anios_padres_separados && (
                  <Row label="Años de separación" value={`${paciente.anios_padres_separados} años`} />
                )}
              </dl>
            </div>
          </section>

          {/* Información del registro */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(37,99,235,0.08)] border border-gray-100 overflow-hidden border-l-4 border-l-primary lg:col-span-2">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <ClipboardList className="w-4 h-4 text-primary" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Información del Registro</h3>
            </div>
            <div className="p-5">
              <dl className="space-y-0 text-sm">
                <Row label="Fecha de registro" value={formatLocalDate(paciente.fecha_registro.split('T')[0])} />
              </dl>
            </div>
          </section>
        </div>

        {/* Notas de evolución */}
        <section className="bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(37,99,235,0.08)] border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Notas de Evolución</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResumenModal(true)}
                className="btn-ai-glow inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                <Brain size={14} />
                <span>Resumen IA</span>
              </button>
              <span className="text-xs text-secondary-400 bg-secondary-50 px-2 py-1 rounded-full">{notasData?.total ?? 0} notas</span>
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
                {notas.map((nota) => (
                  <div
                    key={nota.id}
                    className="p-4 rounded-lg hover:bg-surface transition-colors cursor-pointer border border-gray-100"
                    onClick={() => navigate(`/pacientes/${id}/notas/nueva?nota_id=${nota.id}&view=true`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                        {nota.numero_sesion}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">
                            Sesión {nota.numero_sesion}
                          </p>
                          <Badge variant="info">{nota.impresion_diagnostica || '—'}</Badge>
                        </div>
                        <p className="text-xs text-secondary-400 flex items-center gap-1 mb-2">
                          <Calendar size={12} />
                          {new Date(nota.fecha_hora).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        {nota.nota_texto && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {nota.nota_texto}
                          </p>
                        )}
                        {nota.transcripcion_entrevista && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-1">Transcripción:</p>
                            <p className="text-xs text-gray-600 line-clamp-3">
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
        </section>

        {/* Genograma */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            onClick={() => setShowGenograma((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <GitBranch size={16} className="text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Genograma Familiar</h3>
            </div>
            <span className="text-xs text-gray-400">{showGenograma ? '▲ Contraer' : '▼ Expandir'}</span>
          </button>
          {showGenograma && (
            <div className="px-6 pb-6">
              <GenogramaEditor
                pacienteId={pacienteId}
                pacienteNombre={`${paciente.nombres} ${paciente.apellido_paterno}`}
              />
            </div>
          )}
        </section>
      </main>

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <dt className="text-secondary-500 text-sm">{label}</dt>
      <dd className="text-gray-900 font-medium text-sm text-right">{value}</dd>
    </div>
  );
}