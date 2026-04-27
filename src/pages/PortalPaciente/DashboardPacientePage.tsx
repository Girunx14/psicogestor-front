import { useState } from 'react';
import { Calendar, Plus, CalendarClock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import EmptyState from '@/components/ui/EmptyState';
import { useMisCitas, useCreateCitaPaciente } from '@/hooks/useCitas';
import { useHorariosPaciente } from '@/hooks/useHorarios';

const citaSchema = z.object({
  horario_id: z.coerce.number().min(1, 'Selecciona un horario'),
  motivo: z.string().min(5, 'Explica brevemente el motivo'),
});

type CitaSchemaType = z.infer<typeof citaSchema>;

export default function DashboardPacientePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalidad, setModalidad] = useState<'presencial' | 'virtual'>('presencial');
  const { data: misCitas, isLoading: loadingCitas } = useMisCitas();
  const { data: horarios } = useHorariosPaciente();
  const createMutation = useCreateCitaPaciente();

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CitaSchemaType>({
    resolver: zodResolver(citaSchema) as any,
    defaultValues: {
      horario_id: 0,
      motivo: '',
    },
  });

  const availableHorarios = (horarios ?? []).filter((h) => h.disponible);

  const onSubmit = (data: CitaSchemaType) => {
    // The backend infers the paciente_id automatically and sets it to pending
    createMutation.mutate(
      { ...data, paciente_id: 'auto' }, // paciente_id string is required by type but ignored by backend schema mapping
      {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
      }
    );
  };

  const citas = Array.isArray(misCitas) ? misCitas : [];
  const proximasCitas = citas.filter((c) => c.estado === 'confirmada' || c.estado === 'pendiente');
  const pastCitas = citas.filter((c) => c.estado === 'completada' || c.estado === 'cancelada');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-secondary-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a tu Portal</h1>
          <p className="text-secondary-500 mt-1">Desde aquí puedes administrar tus citas y solicitar atención clínica.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto shadow-md">
          <Plus size={20} className="mr-1" />
          Agendar Cita
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="shadow-sm rounded-2xl border border-secondary-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarClock className="text-primary" size={20} />
            Próximas Citas
          </h2>

          {loadingCitas ? (
            <div className="p-8 text-center text-secondary-500">Cargando tus citas...</div>
          ) : proximasCitas.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="No tienes citas agendadas"
              description="Haz clic en Agendar Cita para separar un lugar con el psicólogo."
            />
          ) : (
            <div className="space-y-4">
              {proximasCitas.map((cita) => (
                <div key={cita.id} className="p-4 rounded-xl bg-secondary-50 border border-secondary-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{cita.fecha}</p>
                    <p className="text-secondary-600 font-medium">
                      {cita.hora_inicio?.slice(0, 5)} hrs
                    </p>
                    <p className="text-sm text-secondary-500 mt-1 bg-white inline-block px-2 py-0.5 rounded-md border border-secondary-200">
                      Modalidad: {cita.tipo}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${cita.estado === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {cita.estado === 'confirmada' ? 'Confirmada' : 'En espera'}
                    </span>
                    {cita.enlace_videollamada && (
                      <a href={cita.enlace_videollamada} target="_blank" rel="noreferrer" className="block mt-2 text-primary hover:underline text-sm font-medium">
                        Unirse a videollamada
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Historial o Información extra */}
        <Card className="shadow-sm rounded-2xl border border-secondary-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-secondary-600">
            Historial de Atención
          </h2>
          {loadingCitas ? null : pastCitas.length === 0 ? (
            <div className="text-center py-12 text-secondary-400 text-sm">
              Tu historial de citas terminadas aparecerá aquí.
            </div>
          ) : (
            <div className="space-y-3">
              {pastCitas.slice(0, 5).map(cita => (
                <div key={cita.id} className="flex justify-between items-center py-2 border-b border-secondary-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cita.fecha}</p>
                    <p className="text-xs text-secondary-500">Motivo: {cita.motivo?.slice(0, 30)}...</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md ${cita.estado === 'completada' ? 'bg-secondary-100 text-secondary-700' : 'bg-red-50 text-red-600'}`}>
                    {cita.estado === 'completada' ? 'Asistió' : 'Cancelada'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal para agendar cita */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Agendar Nueva Cita" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <p className="text-sm text-secondary-600 mb-4 bg-primary/10 p-3 rounded-lg text-primary-900 border border-primary/20">
            <strong>Instrucciones:</strong> Elige primero la modalidad (Presencial o Virtual), selecciona el horario disponible, y cuéntanos brevemente el motivo para que el psicólogo prepare la sesión.
          </p>

          <div className="grid grid-cols-1 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidad de Atención
            </label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setModalidad('presencial')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${modalidad === 'presencial' ? 'bg-white shadow text-[#1A365D]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Presencial
              </button>
              <button
                type="button"
                onClick={() => setModalidad('virtual')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${modalidad === 'virtual' ? 'bg-white shadow text-[#1A365D]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Virtual
              </button>
            </div>
          </div>

          <Select
            label="Horario Disponible"
            placeholder={`Selecciona un horario ${modalidad}`}
            error={errors.horario_id?.message}
            options={availableHorarios
              .filter(h => h.tipo === modalidad)
              .map((h) => ({
                value: h.id,
                label: `${h.fecha} — ${h.hora_inicio.slice(0, 5)} (${h.tipo})`,
              }))}
            {...register('horario_id')}
          />

          <Textarea
            label="¿Cuál es el motivo de la consulta?"
            placeholder="Ejemplo: Necesito asesoría por temas de estrés escolar..."
            error={errors.motivo?.message}
            rows={4}
            {...register('motivo')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100 mt-6">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Solicitar Cita
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
