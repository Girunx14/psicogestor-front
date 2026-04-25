import { useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import VoiceDictation from '@/features/sesiones/VoiceDictation';
import { useCreateNota, useNotasPaciente, useUpdateNota } from '@/hooks/useNotas';
import type { NotaEvolucion } from '@/types';

const notaSchema = z.object({
  numero_sesion: z.coerce.number().min(1, 'El número de sesión es requerido'),
  impresion_diagnostica: z.string().min(1, 'La impresión diagnóstica es requerida'),
  fecha_hora: z.string().min(1, 'La fecha es requerida'),
  nota_texto: z.string().min(1, 'El contenido de la nota es requerido'),
  transcripcion_entrevista: z.string().optional(),
});

type NotaSchemaType = z.infer<typeof notaSchema>;

export default function NuevaSesionPage() {
  const { id: pacienteId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notaId = searchParams.get('nota_id');
  const viewOnly = searchParams.get('view') === 'true';

  const { data: notasData } = useNotasPaciente(pacienteId!);
  const updateNotaMutation = useUpdateNota(Number(notaId));
  const totalNotas = notasData?.total ?? 0;
  const siguienteSesion = totalNotas + 1;

  const createNotaMutation = useCreateNota();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<NotaSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(notaSchema) as any,
    defaultValues: {
      numero_sesion: totalNotas + 1,
      impresion_diagnostica: '',
      fecha_hora: new Date().toISOString().slice(0, 10),
      nota_texto: '',
      transcripcion_entrevista: '',
    },
  });

  // Load existing nota data when nota_id is present
  useEffect(() => {
    if (!notaId || !notasData?.items?.length) return;

    const nota = notasData.items.find((n: NotaEvolucion) => n.id === Number(notaId));
    if (nota) {
      reset({
        numero_sesion: nota.numero_sesion,
        impresion_diagnostica: nota.impresion_diagnostica || '',
        fecha_hora: nota.fecha_hora.split('T')[0],
        nota_texto: nota.nota_texto || '',
        transcripcion_entrevista: nota.transcripcion_entrevista || '',
      });
    }
  }, [notaId, notasData, reset]);

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
  const errorMessage = (createNotaMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;

  // Submit handler
  const onSubmit = async (data: NotaSchemaType) => {
    if (notaId) {
      updateNotaMutation.mutate(
        {
          impresion_diagnostica: data.impresion_diagnostica,
          fecha_hora: `${data.fecha_hora}T00:00:00`,
          nota_texto: data.nota_texto,
          transcripcion_entrevista: data.transcripcion_entrevista || undefined,
        },
        {
          onSuccess: () => {
            navigate(`/pacientes/${pacienteId}`);
          },
        },
      );
    } else {
      createNotaMutation.mutate(
        {
          paciente_id: pacienteId!,
          numero_sesion: data.numero_sesion,
          impresion_diagnostica: data.impresion_diagnostica,
          fecha_hora: `${data.fecha_hora}T00:00:00`,
          nota_texto: data.nota_texto,
          transcripcion_entrevista: data.transcripcion_entrevista || undefined,
        },
        {
          onSuccess: () => {
            navigate(`/pacientes/${pacienteId}`);
          },
        },
      );
    }
  };

  return (
    <>
      <Topbar
            title={viewOnly ? `Nota - Sesión ${getValues('numero_sesion') || ''}` : (notaId ? `Editar Nota - Sesión ${getValues('numero_sesion') || ''}` : 'Nueva Nota de Evolución')}
            subtitle={viewOnly ? 'Modo solo lectura' : (notaId ? 'Editando sesión existente' : `Sesión ${siguienteSesion}`)}
          />
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
          <form onSubmit={handleSubmit(viewOnly ? () => {} : onSubmit as any)} className="p-6 space-y-5">
            {/* Número de sesión y fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Sesión"
                type="number"
                disabled={viewOnly}
                error={errors.numero_sesion?.message}
                {...register('numero_sesion')}
              />
              <Input
                label="Fecha"
                type="date"
                disabled={viewOnly}
                error={errors.fecha_hora?.message}
                {...register('fecha_hora')}
              />
            </div>

            {/* Impresión diagnóstica */}
            <Input
              label="Impresión Diagnóstica"
              placeholder="Ej: Ansiedad por evaluaciones académicas"
              disabled={viewOnly}
              error={errors.impresion_diagnostica?.message}
              {...register('impresion_diagnostica')}
            />

            {/* Contenido de la nota */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label-base mb-0">Contenido de la Nota</label>
                {!viewOnly && (
                  <VoiceDictation
                    onTranscript={handleVoiceTranscript('nota_texto')}
                    targetFieldLabel="Nota"
                  />
                )}
              </div>
              <Textarea
                placeholder="Describe el contenido de la sesión, observaciones, y plan de trabajo..."
                disabled={viewOnly}
                error={errors.nota_texto?.message}
                className="min-h-[200px]"
                {...register('nota_texto')}
              />
              <p className="text-xs text-secondary-400 mt-1 text-right">
                {notaTexto?.length ?? 0} caracteres
              </p>
            </div>

            {/* Transcripción de la entrevista */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label-base mb-0">Transcripción de la Entrevista</label>
                {!viewOnly && (
                  <VoiceDictation
                    onTranscript={handleVoiceTranscript('transcripcion_entrevista')}
                    targetFieldLabel="Transcripción"
                  />
                )}
              </div>
              <Textarea
                placeholder="Registra la transcripción completa de la entrevista o sesión..."
                disabled={viewOnly}
                error={errors.transcripcion_entrevista?.message}
                className="min-h-[150px]"
                {...register('transcripcion_entrevista')}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`/pacientes/${pacienteId}`)}
              >
                {viewOnly ? 'Volver' : 'Cancelar'}
              </Button>
              {!viewOnly && (
                <Button
                  type="submit"
                  isLoading={createNotaMutation.isPending || updateNotaMutation.isPending}
                >
                  <Save size={16} />
                  {notaId ? 'Actualizar Nota' : 'Guardar Nota'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </>
  );
}