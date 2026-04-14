import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useCatalogos } from '@/hooks/useCatalogos';
import type { PacienteCreate } from '@/types';

const pacienteSchema = z.object({
  nombres: z.string().min(1, 'El nombre es requerido'),
  apellido_paterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellido_materno: z.string().min(1, 'El apellido materno es requerido'),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  sexo: z.string().min(1, 'El sexo es requerido'),
  carrera_id: z.coerce.number().min(1, 'La carrera es requerida'),
  religion_id: z.coerce.number().min(1, 'La religión es requerida'),
  semestre: z.coerce.number().min(1, 'El semestre es requerido').max(12),
  numero_control: z.string().min(1, 'El número de control es requerido'),
  localidad: z.string().min(1, 'La localidad es requerida'),
  municipio: z.string().min(1, 'El municipio es requerido'),
  con_quien_vive: z.string().min(1, 'Este campo es requerido'),
  nombre_padre: z.string(),
  nombre_madre: z.string(),
  padres_separados: z.coerce.boolean(),
});

type PacienteSchemaType = z.infer<typeof pacienteSchema>;

interface PacienteFormFieldsProps {
  defaultValues?: Partial<PacienteCreate>;
  onSubmit: (data: PacienteCreate) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export default function PacienteFormFields({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Guardar Paciente',
}: PacienteFormFieldsProps) {
  const { data: catalogos, isLoading: catalogosLoading } = useCatalogos();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PacienteSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pacienteSchema) as any,
    defaultValues: {
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      sexo: 'M',
      carrera_id: 0,
      religion_id: 0,
      semestre: 1,
      numero_control: '',
      localidad: '',
      municipio: '',
      con_quien_vive: '',
      nombre_padre: '',
      nombre_madre: '',
      padres_separados: false,
      ...defaultValues,
    },
  });

  // Auto-calculate age
  const fechaNacimiento = watch('fecha_nacimiento');
  const edad = fechaNacimiento
    ? Math.floor(
        (Date.now() - new Date(fechaNacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;

  if (catalogosLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const carreras = catalogos?.carreras ?? [];
  const religiones = catalogos?.religiones ?? [];
  const sexos = catalogos?.sexos ?? [];
  const semestres = catalogos?.semestres ?? [];

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
      {/* Datos personales */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-secondary-100">
          Datos Personales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Nombre(s)" error={errors.nombres?.message} {...register('nombres')} />
          <Input label="Apellido Paterno" error={errors.apellido_paterno?.message} {...register('apellido_paterno')} />
          <Input label="Apellido Materno" error={errors.apellido_materno?.message} {...register('apellido_materno')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            label="Fecha de Nacimiento"
            type="date"
            error={errors.fecha_nacimiento?.message}
            {...register('fecha_nacimiento')}
          />
          <div>
            <label className="label-base">Edad</label>
            <div className="input-base bg-secondary-50 text-secondary-600">
              {edad !== null ? `${edad} años` : '—'}
            </div>
          </div>
          <Select
            label="Sexo"
            error={errors.sexo?.message}
            options={sexos.map((s) => ({ value: s.valor, label: s.etiqueta }))}
            {...register('sexo')}
          />
        </div>
      </section>

      {/* Datos académicos */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-secondary-100">
          Datos Académicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Número de Control"
            error={errors.numero_control?.message}
            {...register('numero_control')}
          />
          <Select
            label="Carrera"
            placeholder="Selecciona una carrera"
            error={errors.carrera_id?.message}
            options={carreras.filter(c => c.activa).map((c) => ({ value: c.id, label: c.nombre }))}
            {...register('carrera_id')}
          />
          <Select
            label="Semestre"
            error={errors.semestre?.message}
            options={semestres.map((s) => ({ value: s, label: `${s}° Semestre` }))}
            {...register('semestre')}
          />
        </div>
      </section>

      {/* Datos de origen */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-secondary-100">
          Datos de Origen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Localidad" error={errors.localidad?.message} {...register('localidad')} />
          <Input label="Municipio" error={errors.municipio?.message} {...register('municipio')} />
          <Select
            label="Religión"
            placeholder="Selecciona"
            error={errors.religion_id?.message}
            options={religiones.filter(r => r.activa).map((r) => ({ value: r.id, label: r.nombre }))}
            {...register('religion_id')}
          />
        </div>
      </section>

      {/* Datos familiares */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-secondary-100">
          Datos Familiares
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Con quién vive" error={errors.con_quien_vive?.message} {...register('con_quien_vive')} />
          <Select
            label="¿Padres separados?"
            options={[
              { value: 'false', label: 'No' },
              { value: 'true', label: 'Sí' },
            ]}
            {...register('padres_separados')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input label="Nombre del Padre" error={errors.nombre_padre?.message} {...register('nombre_padre')} />
          <Input label="Nombre de la Madre" error={errors.nombre_madre?.message} {...register('nombre_madre')} />
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t border-secondary-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-8"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
