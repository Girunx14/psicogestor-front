import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, Edit, Plus, FileText, Trash2 } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { usePaciente, useDeletePaciente } from '@/hooks/usePacientes';
import { useNotasPaciente } from '@/hooks/useNotas';

export default function PacienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pacienteId = id!;
  const { data: paciente, isLoading } = usePaciente(pacienteId);
  const { data: notasData } = useNotasPaciente(pacienteId);
  const deleteMutation = useDeletePaciente();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const edad = (() => {
    if (!paciente?.fecha_nacimiento) return null;
    const now = new Date();
    const birth = new Date(paciente.fecha_nacimiento);
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
        <div className="flex gap-3">
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
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Datos Personales</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Nombre completo" value={`${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`} />
              <Row label="Fecha de nacimiento" value={new Date(paciente.fecha_nacimiento).toLocaleDateString('es-MX')} />
              <Row label="Edad" value={edad !== null ? `${edad} años` : '—'} />
              <Row label="Sexo" value={paciente.sexo} />
            </dl>
          </Card>

          {/* Datos académicos */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Datos Académicos</h3>
            <dl className="space-y-3 text-sm">
              <Row label="No. Control" value={paciente.numero_control} />
              <Row label="Carrera" value={paciente.carrera || '—'} />
              <Row label="Semestre" value={`${paciente.semestre}°`} />
              <Row label="Localidad" value={paciente.localidad} />
              <Row label="Municipio" value={paciente.municipio} />
              <Row label="Religión" value={paciente.religion || '—'} />
            </dl>
          </Card>

          {/* Datos familiares */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Datos Familiares</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Con quién vive" value={paciente.con_quien_vive} />
              <Row label="Nombre del Padre" value={paciente.nombre_padre || '—'} />
              <Row label="Nombre de la Madre" value={paciente.nombre_madre || '—'} />
              <Row label="Padres separados" value={paciente.padres_separados ? 'Sí' : 'No'} />
            </dl>
          </Card>

          {/* Registro */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Información del Registro</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Fecha de registro" value={new Date(paciente.fecha_registro).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })} />
            </dl>
          </Card>
        </div>

        {/* Notas de evolución */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Notas de Evolución</h3>
            <span className="text-xs text-secondary-400">{notasData?.total ?? 0} notas</span>
          </div>

          {notas.length === 0 ? (
            <EmptyState
              icon={<FileText size={28} />}
              title="Sin notas registradas"
              description="Crea una nueva nota de evolución para iniciar el expediente clínico."
            />
          ) : (
            <div className="space-y-3">
              {notas.map((nota) => (
                <div
                  key={nota.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                  onClick={() => navigate(`/pacientes/${id}/notas/nueva?nota_id=${nota.id}`)}
                >
                  <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                    {nota.numero_sesion}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Sesión {nota.numero_sesion}
                    </p>
                    <p className="text-xs text-secondary-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(nota.fecha_hora).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge variant="info">{nota.impresion_diagnostica || '—'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

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
    <div className="flex justify-between">
      <dt className="text-secondary-500">{label}</dt>
      <dd className="text-gray-900 font-medium text-right">{value}</dd>
    </div>
  );
}
