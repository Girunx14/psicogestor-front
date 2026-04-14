import { useNavigate } from 'react-router-dom';
import Topbar from '@/components/layout/Topbar';
import Card from '@/components/ui/Card';
import PacienteFormFields from '@/features/pacientes/PacienteFormFields';
import { useCreatePaciente } from '@/hooks/usePacientes';
import type { PacienteCreate } from '@/types';

export default function PacienteNuevoPage() {
  const navigate = useNavigate();
  const createMutation = useCreatePaciente();

  const handleSubmit = (data: PacienteCreate) => {
    createMutation.mutate(data, {
      onSuccess: (paciente) => {
        navigate(`/pacientes/${paciente.id}`);
      },
    });
  };

  return (
    <>
      <Topbar title="Nuevo Paciente" subtitle="Registro de expediente clínico" />
      <main className="flex-1 p-6 lg:p-8">
        <Card>
          <PacienteFormFields
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            submitLabel="Registrar Paciente"
          />
        </Card>
      </main>
    </>
  );
}
