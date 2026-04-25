import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Card from '@/components/ui/Card';
import PacienteFormFields from '@/features/pacientes/PacienteFormFields';
import { useCreatePaciente } from '@/hooks/usePacientes';
import type { PacienteCreate } from '@/types';

export default function PacienteNuevoPage() {
  const navigate = useNavigate();
  const createMutation = useCreatePaciente();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (data: PacienteCreate) => {
    setErrorMessage(null);
    console.log('Datos enviados:', JSON.stringify(data, null, 2));
    createMutation.mutate(data, {
      onSuccess: (paciente) => {
        navigate(`/pacientes/${paciente.id}`);
      },
      onError: (error: unknown) => {
        console.error('Error al guardar:', error);
        const err = error as { response?: { data?: { detail?: string } } };
        setErrorMessage(err?.response?.data?.detail || 'Error al guardar el usuario');
      },
    });
  };

  return (
    <>
      <Topbar title="Nuevo Usuario" subtitle="Registro de expediente clínico" />
      <main className="flex-1 p-6 lg:p-8">
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {errorMessage}
          </div>
        )}
        <Card>
          <PacienteFormFields
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            submitLabel="Registrar Usuario"
          />
        </Card>
      </main>
    </>
  );
}
