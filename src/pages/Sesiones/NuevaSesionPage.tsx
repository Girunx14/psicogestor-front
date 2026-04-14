import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import VoiceDictation from '@/features/sesiones/VoiceDictation';
import { useCreateNota } from '@/hooks/useNotas';

const notaSchema = z.object({
  numero_sesion: z.coerce.number().min(1, 'El número de sesión es requerido'),
  impresion_diagnostica: z.string().min(1, 'La impresión diagnóstica es requerida'),
  fecha_hora: z.string().min(1, 'La fecha y hora son requeridas'),
  nota_texto: z.string().min(1, 'El contenido de la nota es requerido'),
});

type NotaSchemaType = z.infer<typeof notaSchema>;

export default function NuevaSesionPage() {
  const { id: pacienteId } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
      numero_sesion: 1,
      impresion_diagnostica: '',
      fecha_hora: new Date().toISOString().slice(0, 16),
      nota_texto: '',
    },
  });

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

  // Submit handler
  const onSubmit = async (data: NotaSchemaType) => {
    createNotaMutation.mutate(
      {
        paciente_id: pacienteId!,
        numero_sesion: data.numero_sesion,
        impresion_diagnostica: data.impresion_diagnostica,
        fecha_hora: data.fecha_hora,
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
      <Topbar title="Nueva Nota de Evolución" subtitle="Sesión de psicoterapia" />
      <main className="flex-1 p-6 lg:p-8">
        {/* Back */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(`/pacientes/${pacienteId}`)}>
            <ArrowLeft size={16} />
            Volver al expediente
          </Button>
        </div>

        <Card>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            {/* Número de sesión y fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Sesión"
                type="number"
                error={errors.numero_sesion?.message}
                {...register('numero_sesion')}
              />
              <Input
                label="Fecha y Hora"
                type="datetime-local"
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
            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
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
        </Card>
      </main>
    </>
  );
}
