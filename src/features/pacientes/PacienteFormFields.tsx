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
  apellido_materno: z.string().optional().default(''),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  sexo: z.string().min(1, 'El sexo es requerido'),
  carrera_id: z.coerce.number().min(1, 'La carrera es requerida'),
  religion_id: z.coerce.number().min(1, 'La religión es requerida'),
  semestre: z.coerce.number().min(1, 'El semestre es requerido').max(12),
  numero_control: z.string().min(1, 'El número de control es requerido'),
  localidad: z.string().min(1, 'La localidad es requerida'),
  municipio: z.string().min(1, 'El municipio es requerido'),
  con_quien_vive: z.string().min(1, 'Este campo es requerido'),
  nombre_padre: z.string().optional().default(''),
  nombre_madre: z.string().optional().default(''),
  padres_separados: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
  anios_padres_separados: z.preprocess((val) => val === '' || val === undefined ? null : Number(val), z.number().nullable().optional()),
});

type PacienteSchemaType = z.infer<typeof pacienteSchema>;

interface PacienteFormFieldsProps {
  defaultValues?: Partial<PacienteCreate>;
  onSubmit: (data: PacienteCreate) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  title?: string;
}

export default function PacienteFormFields({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Guardar Paciente',
  title = 'Registro de Nuevo Paciente',
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
      anios_padres_separados: null,
      ...defaultValues,
    },
  });

  // Auto-calculate age
  const fechaNacimiento = watch('fecha_nacimiento');
  const edad = fechaNacimiento
    ? (() => {
        const [y, m, d] = fechaNacimiento.split('-');
        const birth = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const mo = now.getMonth() - birth.getMonth();
        if (mo < 0 || (mo === 0 && now.getDate() < birth.getDate())) age--;
        return age;
      })()
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
    <form onSubmit={handleSubmit(onSubmit as any)} className="bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(37,99,235,0.08)] border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">Completa todos los campos requeridos</p>
        </div>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Datos personales */}
        <section className="bg-gray-50/50 rounded-lg p-5 border border-gray-100 border-l-4 border-l-primary">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
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
              <div className="input-base bg-white text-gray-600 font-medium">
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
        <section className="bg-gray-50/50 rounded-lg p-5 border border-gray-100 border-l-4 border-l-primary">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </span>
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
              options={carreras.map((c) => ({ value: c.id, label: c.nombre }))}
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
        <section className="bg-gray-50/50 rounded-lg p-5 border border-gray-100 border-l-4 border-l-primary">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Datos de Origen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Localidad" error={errors.localidad?.message} {...register('localidad')} />
            <Input label="Municipio" error={errors.municipio?.message} {...register('municipio')} />
            <Select
              label="Religión"
              placeholder="Selecciona"
              error={errors.religion_id?.message}
              options={religiones.map((r) => ({ value: r.id, label: r.nombre }))}
              {...register('religion_id')}
            />
          </div>
        </section>

        {/* Datos familiares */}
        <section className="bg-gray-50/50 rounded-lg p-5 border border-gray-100 border-l-4 border-l-primary">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
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
          {String(watch('padres_separados')) === 'true' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="¿Cuántos años llevan separados?"
                type="number"
                min="0"
                error={errors.anios_padres_separados?.message}
                {...register('anios_padres_separados')}
                placeholder="Ej: 3"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input label="Nombre del Padre" error={errors.nombre_padre?.message} {...register('nombre_padre')} />
            <Input label="Nombre de la Madre" error={errors.nombre_madre?.message} {...register('nombre_madre')} />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-6 py-2 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
