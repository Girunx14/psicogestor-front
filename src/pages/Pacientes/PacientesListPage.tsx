import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import SearchInput from '@/components/ui/SearchInput';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { usePacientes } from '@/hooks/usePacientes';
import type { PacienteListItem } from '@/types';

export default function PacientesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePacientes({
    page,
    per_page: 20,
    ...(search ? { buscar: search } : {}),
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const columns = [
    {
      key: 'numero_control',
      header: 'No. Control',
      render: (p: PacienteListItem) => (
        <span className="font-medium text-gray-900">{p.numero_control}</span>
      ),
    },
    {
      key: 'nombre_completo',
      header: 'Nombre',
      render: (p: PacienteListItem) => (
        <div>
          <p className="font-medium text-gray-900">
            {p.nombres} {p.apellido_paterno} {p.apellido_materno}
          </p>
          <p className="text-xs text-secondary-400">{p.carrera || '—'}</p>
        </div>
      ),
    },
    {
      key: 'semestre',
      header: 'Semestre',
      render: (p: PacienteListItem) => `${p.semestre}°`,
    },
    {
      key: 'sexo',
      header: 'Sexo',
      render: (p: PacienteListItem) => p.sexo,
    },
    {
      key: 'fecha',
      header: 'Registro',
      render: (p: PacienteListItem) =>
        new Date(p.fecha_registro).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
  ];

  return (
    <>
      <Topbar title="Pacientes" subtitle="Gestión de expedientes clínicos" />
      <main className="flex-1 p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-80">
            <SearchInput
              onChange={handleSearch}
              placeholder="Buscar por nombre o No. Control..."
            />
          </div>
          <Button onClick={() => navigate('/pacientes/nuevo')}>
            <Plus size={18} />
            Nuevo Paciente
          </Button>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyExtractor={(p) => p.id}
          onRowClick={(p) => navigate(`/pacientes/${p.id}`)}
          isLoading={isLoading}
          emptyMessage="No se encontraron pacientes"
        />

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-secondary-500">
              Mostrando página {data.page} de {data.total_pages} ({data.total} pacientes)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
