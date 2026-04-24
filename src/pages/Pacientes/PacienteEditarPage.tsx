import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '@/components/layout/Topbar';
import PacienteFormFields from '@/features/pacientes/PacienteFormFields';
import { usePaciente, useUpdatePaciente } from '@/hooks/usePacientes';
import type { PacienteCreate } from '@/types';

export default function PacienteEditarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pacienteId = id!;
  const { data: paciente, isLoading } = usePaciente(pacienteId);
  const updateMutation = useUpdatePaciente(pacienteId);

  const handleSubmit = (data: PacienteCreate) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        navigate(`/pacientes/${id}`);
      },
    });
  };

  if (isLoading || !paciente) {
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

  return (
    <>
      <Topbar
        title="Editar Paciente"
        subtitle={`${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`}
      />
      <main className="flex-1 p-6 lg:p-8">
        <PacienteFormFields
          title="Editar Paciente"
          defaultValues={{
            nombres: paciente.nombres,
            apellido_paterno: paciente.apellido_paterno,
            apellido_materno: paciente.apellido_materno,
            fecha_nacimiento: paciente.fecha_nacimiento,
            sexo: paciente.sexo,
            carrera_id: paciente.carrera_id,
            religion_id: paciente.religion_id,
            semestre: paciente.semestre,
            numero_control: paciente.numero_control,
            localidad: paciente.localidad,
            municipio: paciente.municipio,
            con_quien_vive: paciente.con_quien_vive,
            nombre_padre: paciente.nombre_padre,
            nombre_madre: paciente.nombre_madre,
            padres_separados: paciente.padres_separados,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          submitLabel="Actualizar Paciente"
        />
      </main>
    </>
  );
}
