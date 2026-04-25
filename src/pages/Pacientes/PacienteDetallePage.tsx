import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Edit, Plus, FileText, Trash2, User, GraduationCap, MapPin, Users, ClipboardList, Sparkles, RefreshCw } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResumenModal(true)}
                className="text-xs bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:bg-purple-50"
              >
                <Sparkles size={14} />
                Resumen IA
              </Button>
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
      </main>

      {/* Resumen IA modal */}
      <Modal
        isOpen={showResumenModal}
        onClose={() => setShowResumenModal(false)}
        title="Resumen Clínico con IA"
        size="lg"
      >
        <div className="space-y-4">
          {notas.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-purple-300" />
              </div>
              <p className="text-gray-500 mb-4">No hay suficientes sesiones para generar un resumen.</p>
              <p className="text-sm text-gray-400">Registra al menos una nota de evolución para que la IA pueda analizar el historial del paciente.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Resumen generado por IA</p>
                    <p className="text-xs text-gray-500">Basado en {notas.length} sesión{notas.length !== 1 ? 'es' : ''} registrada{notas.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={generarResumenMutation.isPending}
                  onClick={handleGenerarResumen}
                >
                  <RefreshCw size={14} />
                  Regenerar
                </Button>
              </div>

              {resumen?.contenido_resumen ? (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 overflow-y-auto max-h-[50vh]">
                  <div className="resumen-markdown text-sm text-gray-700">
                    <ReactMarkdown>{resumen.contenido_resumen}</ReactMarkdown>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Generado: {new Date(resumen.ultima_actualizacion).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={generarResumenMutation.isPending}
                      onClick={handleGenerarResumen}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      <RefreshCw size={12} className="mr-1" />
                      Regenerar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={24} className="text-purple-300" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">Aún no hay resumen generado</p>
                  <p className="text-sm text-gray-400 mb-6">La IA analizará todas las sesiones registradas y生成ará un resumen clínico.</p>
                  <Button
                    isLoading={generarResumenMutation.isPending}
                    onClick={handleGenerarResumen}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Sparkles size={16} />
                    Generar Resumen con IA
                  </Button>
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