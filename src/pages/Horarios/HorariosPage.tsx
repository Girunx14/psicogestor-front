import { useState } from 'react';
import { Plus, Trash2, Clock, Video, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Topbar from '@/components/layout/Topbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { useHorarios, useCreateHorario, useDeleteHorario } from '@/hooks/useHorarios';

const horarioSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().min(1, 'La hora es requerida'),
  tipo: z.enum(['presencial', 'virtual']),
});

type HorarioSchemaType = z.infer<typeof horarioSchema>;

export default function HorariosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: horarios, isLoading } = useHorarios();
  const createMutation = useCreateHorario();
  const deleteMutation = useDeleteHorario();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HorarioSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(horarioSchema) as any,
    defaultValues: {
      fecha: '',
      hora: '',
      tipo: 'presencial',
    },
  });

  const onSubmit = (data: HorarioSchemaType) => {
    // Calculamos hora_fin como 1 hora después de hora_inicio
    const [hours, minutes] = data.hora.split(':');
    const startHour = parseInt(hours, 10);
    const endHour = (startHour + 1) % 24;
    const hora_fin = `${endHour.toString().padStart(2, '0')}:${minutes}:00`;
    const hora_inicio = data.hora + ':00';

    console.log('Submitting horario:', {
      fecha: data.fecha,
      hora_inicio,
      hora_fin,
      tipo: data.tipo,
    });
    createMutation.mutate(
      {
        fecha: data.fecha,
        hora_inicio,
        hora_fin,
        tipo: data.tipo,
      },
      {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
        onError: (err) => {
          console.error('Error al crear horario:', err);
          alert('Error al crear horario: ' + (err?.message || JSON.stringify(err)));
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar este horario?')) {
      deleteMutation.mutate(id);
    }
  };

  const horariosList = horarios ?? [];

  // Group by date
  const byDate: Record<string, typeof horariosList> = {};
  horariosList.forEach((h) => {
    if (!byDate[h.fecha]) byDate[h.fecha] = [];
    byDate[h.fecha].push(h);
  });
  const sortedDates = Object.keys(byDate).sort();

  return (
    <>
      <Topbar title="Horarios Disponibles" subtitle="Gestión de disponibilidad" />
      <main className="flex-1 p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-secondary-500">{horariosList.length} horarios registrados</p>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            Nuevo Horario
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : horariosList.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Clock size={28} />}
              title="Sin horarios disponibles"
              description="Agrega horarios para que los pacientes puedan agendar citas."
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((fecha) => (
              <Card key={fecha}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <div className="space-y-2">
                  {byDate[fecha]
                    .sort((a, b) => {
                      const horaA = a.hora_inicio || (a as any).hora || '';
                      const horaB = b.hora_inicio || (b as any).hora || '';
                      return horaA.localeCompare(horaB);
                    })
                    .map((h) => (
                      <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface">
                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            {(h.hora_inicio || (h as any).hora)?.slice(0, 5) || '--:--'} 
                            {h.hora_fin ? ` - ${h.hora_fin.slice(0, 5)}` : ''}
                          </span>
                          <span className="text-xs text-secondary-400 flex items-center gap-1">
                            {h.tipo === 'virtual' ? <Video size={12} /> : <MapPin size={12} />}
                            {h.tipo}
                          </span>
                          <Badge variant={h.disponible ? 'success' : 'danger'}>
                            {h.disponible ? 'Disponible' : 'Ocupado'}
                          </Badge>
                        </div>
                        {h.disponible && (
                          <button
                            onClick={() => handleDelete(h.id)}
                            className="p-1.5 rounded-lg text-secondary-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Horario" size="md">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <Input label="Fecha" type="date" error={errors.fecha?.message} {...register('fecha')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Hora" type="time" error={errors.hora?.message} {...register('hora')} />
            </div>
            <Select
              label="Tipo"
              error={errors.tipo?.message}
              options={[
                { value: 'presencial', label: 'Presencial' },
                { value: 'virtual', label: 'Virtual' },
              ]}
              {...register('tipo')}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={createMutation.isPending} disabled={createMutation.isPending}>
                Crear Horario
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}
