import { useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Topbar from '@/components/layout/Topbar';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { useUsuarios, useCreateUsuario } from '@/hooks/useUsuarios';
import type { User } from '@/types';

const createSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  rol_id: z.coerce.number().min(1, 'Selecciona un rol'),
});

type CreateSchemaType = z.infer<typeof createSchema>;

export default function UsuariosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsuarios({ page, per_page: 20 });
  const createMutation = useCreateUsuario();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSchema) as any,
    defaultValues: { nombre: '', username: '', password: '', rol_id: 2 },
  });

  const onSubmit = (formData: CreateSchemaType) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      },
    });
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (u: User) => <span className="font-medium text-gray-900">{u.id}</span>,
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (u: User) => <span className="font-medium text-gray-900">{u.nombre || '—'}</span>,
    },
    {
      key: 'username',
      header: 'Usuario',
      render: (u: User) => <span className="font-medium text-gray-900">{u.username}</span>,
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (u: User) => (
        <Badge variant={u.rol?.nombre === 'administrador' ? 'info' : u.rol?.nombre === 'psicologo' ? 'success' : 'warning'}>
          {u.rol?.nombre === 'desarrollo_academico' ? 'Desarrollo Académico' : u.rol?.nombre === 'asistente' ? 'Asistente' : u.rol?.nombre || '—'}
        </Badge>
      ),
    },
    {
      key: 'creado_en',
      header: 'Creado',
      render: (u: User) =>
        new Date(u.creado_en).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
  ];

  return (
    <>
      <Topbar title="Usuarios" subtitle="Gestión de cuentas del sistema" />
      <main className="flex-1 p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-secondary-500">
            <Shield size={16} />
            Solo administradores
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            Nuevo Usuario
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyExtractor={(u) => u.id}
          isLoading={isLoading}
          emptyMessage="No hay usuarios registrados"
        />

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-secondary-500">
              Página {data.page} de {data.total_pages} ({data.total} usuarios)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Create modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Usuario" size="md">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <Input label="Nombre completo / Título" error={errors.nombre?.message} {...register('nombre')} />
            <Input label="Usuario" error={errors.username?.message} {...register('username')} />
            <Input label="Contraseña" type="password" error={errors.password?.message} {...register('password')} />
            <Select
              label="Rol"
              error={errors.rol_id?.message}
              options={[
                { value: 1, label: 'Administrador' },
                { value: 2, label: 'Psicólogo' },
                { value: 3, label: 'Asistente' },
                { value: 4, label: 'Desarrollo Académico' },
              ]}
              {...register('rol_id')}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Crear Usuario
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}
