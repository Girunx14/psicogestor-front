import { useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, CalendarIcon, Hash } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import VoiceDictation from '@/features/sesiones/VoiceDictation';
import { useCreateNota, useNotasPaciente, useUpdateNota } from '@/hooks/useNotas';
import { usePaciente } from '@/hooks/usePacientes';
import type { NotaEvolucion } from '@/types';

const notaSchema = z.object({
  impresion_diagnostica: z.string().min(1, 'La impresión diagnóstica es requerida'),
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

  const { data: paciente } = usePaciente(pacienteId!);
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
    resolver: zodResolver(notaSchema) as never,
    defaultValues: {
      impresion_diagnostica: '',
      nota_texto: '',
      transcripcion_entrevista: '',
    },
  });

  useEffect(() => {
    if (!notaId || !notasData?.items?.length) return;

    const nota = notasData.items.find((n: NotaEvolucion) => n.id === Number(notaId));
    if (nota) {
      reset({
        impresion_diagnostica: nota.impresion_diagnostica || '',
        nota_texto: nota.nota_texto || '',
        transcripcion_entrevista: nota.transcripcion_entrevista || '',
      });
    }
  }, [notaId, notasData, reset]);

  const handleVoiceTranscript = useCallback(
    (field: keyof NotaSchemaType) => (text: string) => {
      const current = getValues(field) || '';
      setValue(field, current + (current ? ' ' : '') + text, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  const notaTexto = watch('nota_texto');
  const errorMessage = (createNotaMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;

  const onSubmit = async (data: NotaSchemaType) => {
    const fechaHoraISO = new Date().toISOString();

    if (notaId) {
      updateNotaMutation.mutate(
        {
          impresion_diagnostica: data.impresion_diagnostica,
          fecha_hora: fechaHoraISO,
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
          numero_sesion: totalNotas + 1,
          impresion_diagnostica: data.impresion_diagnostica,
          fecha_hora: fechaHoraISO,
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

  const getIniciales = (nombres: string, apellidoP: string, apellidoM: string) => {
    return `${nombres?.[0] || ''}${apellidoP?.[0] || ''}${apellidoM?.[0] || ''}`.toUpperCase();
  };

  const getNumeroSesion = () => {
    if (viewOnly && notaId) {
      return notasData?.items?.find((n: NotaEvolucion) => n.id === Number(notaId))?.numero_sesion ?? siguienteSesion;
    }
    return notaId ? (notasData?.items?.find((n: NotaEvolucion) => n.id === Number(notaId))?.numero_sesion ?? siguienteSesion) : siguienteSesion;
  };

  return (
    <>
      <Topbar
        title={viewOnly ? `Nota - Sesión ${getNumeroSesion()}` : (notaId ? `Editar Nota - Sesión ${getNumeroSesion()}` : 'Nueva Nota de Evolución')}
        subtitle={viewOnly ? 'Modo solo lectura' : (notaId ? 'Editando sesión existente' : `Sesión ${siguienteSesion}`)}
      />
      <main className="flex-1 p-6 lg:p-8">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(`/pacientes/${pacienteId}`)}
            className="flex items-center gap-2 text-sm text-secondary-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a Expediente
          </button>



          {/* Tarjeta paciente */}
          {paciente && (
            <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(26,54,93,0.04)] border border-[#c4c6cf] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#e5eeff] flex items-center justify-center text-primary font-semibold text-lg">
                {getIniciales(paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno)}
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900">
                  {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
                </p>
                <p className="text-sm text-secondary-500">No. Control: {paciente.numero_control}</p>
              </div>

            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(26,54,93,0.04)] border border-[#c4c6cf] overflow-hidden">
            {/* Grid metadatos */}
            <div className="p-6 border-b border-[#e5eeff]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-secondary-500 mb-1.5">Fecha</label>
                  <div className="relative">
                    <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                    <input
                      type="text"
                      value={new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                      disabled
                      className="w-full pl-9 pr-3 py-2.5 border border-[#c4c6cf] rounded-lg text-sm bg-[#f8f9ff] text-secondary-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-secondary-500 mb-1.5">No. Sesión</label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                    <input
                      type="text"
                      value={getNumeroSesion()}
                      disabled
                      className="w-full pl-9 pr-3 py-2.5 border border-[#c4c6cf] rounded-lg text-sm bg-[#f8f9ff] text-secondary-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(viewOnly ? () => { } : onSubmit)} className="p-6 space-y-6">
              {/* Card contenido clínico */}
              <div className="bg-[#f8f9ff] rounded-xl border border-[#c4c6cf] p-5 space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a365d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1a365d]">Contenido de la Nota</h3>
                </div>

                {/* Contenido de la Nota */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-secondary-500">Contenido de la Nota</label>
                    {!viewOnly && (
                      <VoiceDictation
                        onTranscript={handleVoiceTranscript('nota_texto')}
                        targetFieldLabel="Nota"
                      />
                    )}
                  </div>
                  <textarea
                    placeholder="Registra el contenido de la sesión: motivo de consulta, observaciones clínicas, desarrollo de la sesión..."
                    disabled={viewOnly}
                    rows={6}
                    className="w-full px-3.5 py-2.5 border border-[#c4c6cf] rounded-lg text-sm resize-y focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:bg-white disabled:cursor-not-allowed"
                    {...register('nota_texto')}
                  />
                  <p className="text-xs text-secondary-400 mt-1 text-right">
                    {notaTexto?.length ?? 0} caracteres
                  </p>
                </div>

                {/* Transcripción */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-secondary-500">Transcripción de la entrevista</label>
                    {!viewOnly && (
                      <VoiceDictation
                        onTranscript={handleVoiceTranscript('transcripcion_entrevista')}
                        targetFieldLabel="Transcripción"
                      />
                    )}
                  </div>
                  <textarea
                    placeholder="Registra la transcripción completa de la entrevista o sesión..."
                    disabled={viewOnly}
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-[#c4c6cf] rounded-lg text-sm resize-y focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:bg-white disabled:cursor-not-allowed"
                    {...register('transcripcion_entrevista')}
                  />
                </div>
              </div>

              {/* Grid 2 columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Impresión Diagnóstica */}
                <div className="bg-[#f8f9ff] rounded-xl border border-[#c4c6cf] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a365d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1a365d]">Impresión Diagnóstica</h3>
                  </div>
                  <textarea
                    placeholder="Describe la impresión diagnóstica..."
                    disabled={viewOnly}
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-[#c4c6cf] rounded-lg text-sm resize-y focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:bg-white disabled:cursor-not-allowed"
                    {...register('impresion_diagnostica')}
                  />
                  {errors.impresion_diagnostica && <p className="mt-1 text-xs text-red-600">{errors.impresion_diagnostica.message}</p>}
                </div>

                {/* Tareas/Recomendaciones */}
                <div className="bg-[#f8f9ff] rounded-xl border border-[#c4c6cf] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a365d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1a365d]">Tareas/Recomendaciones</h3>
                  </div>
                  <textarea
                    placeholder="Registra las tareas o recomendaciones para el paciente..."
                    disabled={viewOnly}
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-[#c4c6cf] rounded-lg text-sm resize-y focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:bg-white disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Barra acciones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e5eeff]">
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
                    className="bg-[#1a365d] hover:bg-[#162d54] text-white"
                  >
                    <Save size={16} />
                    {notaId ? 'Actualizar Nota' : 'Guardar Nota'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}