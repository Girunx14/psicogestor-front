import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import VoiceDictation from '@/features/sesiones/VoiceDictation';
import { useCreateNota, useNotasPaciente } from '@/hooks/useNotas';

const notaSchema = z.object({
  numero_sesion: z.coerce.number().min(1, 'El número de sesión es requerido'),
  impresion_diagnostica: z.string().min(1, 'La impresión diagnóstica es requerida'),
  fecha_hora: z.string().min(1, 'La fecha es requerida'),
  nota_texto: z.string().min(1, 'El contenido de la nota es requerido'),
});

type NotaSchemaType = z.infer<typeof notaSchema>;

export default function NuevaSesionPage() {
  const { id: pacienteId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: notasData } = useNotasPaciente(pacienteId!);
  const totalNotas = notasData?.total ?? 0;
  const siguienteSesion = totalNotas + 1;

  const createNotaMutation = useCreateNota();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<NotaSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(notaSchema) as any,
    defaultValues: {
      numero_sesion: totalNotas + 1,
      impresion_diagnostica: '',
      fecha_hora: new Date().toISOString().slice(0, 10),
      nota_texto: '',
    },
  });

  // Update session number when notas data loads
  if (getValues('numero_sesion') === 1 && totalNotas > 0) {
    setValue('numero_sesion', totalNotas + 1);
  }

  // Voice dictation handler
  const handleVoiceTranscript = useCallback(
    (field: keyof NotaSchemaType) => (text: string) => {
      const current = getValues(field) || '';
      setValue(field, current + (current ? ' ' : '') + text, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  // Form fields watch for character count
  const notaTexto = watch('nota_texto');
  const errorMessage = createNotaMutation.error?.response?.data?.detail;

  // Submit handler
  const onSubmit = async (data: NotaSchemaType) => {
    createNotaMutation.mutate(
      {
        paciente_id: pacienteId!,
        numero_sesion: data.numero_sesion,
        impresion_diagnostica: data.impresion_diagnostica,
        fecha_hora: `${data.fecha_hora}T00:00:00`,
        nota_texto: data.nota_texto,
      },
      {
        onSuccess: () => {
          navigate(`/pacientes/${pacienteId}`);
        },
      },
    );
  };

  return (
    <>
      <Topbar title="Nueva Nota de Evolución" subtitle={`Sesión ${siguienteSesion}`} />
      <main className="flex-1 p-6 lg:p-8">
        {/* Back */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(`/pacientes/${pacienteId}`)}>
            <ArrowLeft size={16} />
            Volver al expediente
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(37,99,235,0.08)] border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Nueva Nota de Evolución</h2>
            <p className="text-sm text-gray-500 mt-0.5">Completa todos los campos requeridos</p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-5">
            {/* Número de sesión y fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Sesión"
                type="number"
                error={errors.numero_sesion?.message}
                {...register('numero_sesion')}
              />
              <Input
                label="Fecha"
                type="date"
                error={errors.fecha_hora?.message}
                {...register('fecha_hora')}
              />
            </div>

            {/* Impresión diagnóstica */}
            <Input
              label="Impresión Diagnóstica"
              placeholder="Ej: Ansiedad por evaluaciones académicas"
              error={errors.impresion_diagnostica?.message}
              {...register('impresion_diagnostica')}
            />

            {/* Contenido de la nota */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label-base mb-0">Contenido de la Nota</label>
                <VoiceDictation
                  onTranscript={handleVoiceTranscript('nota_texto')}
                  targetFieldLabel="Nota"
                />
              </div>
              <Textarea
                placeholder="Describe el contenido de la sesión, observaciones, y plan de trabajo..."
                error={errors.nota_texto?.message}
                className="min-h-[200px]"
                {...register('nota_texto')}
              />
              <p className="text-xs text-secondary-400 mt-1 text-right">
                {notaTexto?.length ?? 0} caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`/pacientes/${pacienteId}`)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={createNotaMutation.isPending}
              >
                <Save size={16} />
                Guardar Nota
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}