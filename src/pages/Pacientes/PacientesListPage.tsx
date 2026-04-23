import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
      key: 'nombre_completo',
      header: <span className="text-xs font-bold tracking-widest text-[#1A365D]">NOMBRE COMPLETO</span>,
      render: (p: PacienteListItem) => {
        // Initials avatar
        const init = (p.nombres?.[0] || '') + (p.apellido_paterno?.[0] || '');
        return (
          <div className="flex items-center gap-4 py-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#1A365D]">{init.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">
                {p.nombres} {p.apellido_paterno}
              </p>
              <p className="text-sm text-gray-700 leading-tight mt-0.5">{p.apellido_materno}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'numero_control',
      header: <span className="text-xs font-bold tracking-widest text-[#1A365D]">NO. CONTROL</span>,
      render: (p: PacienteListItem) => (
        <span className="font-medium text-gray-600 font-mono">{p.numero_control}</span>
      ),
    },
    {
      key: 'carrera',
      header: <span className="text-xs font-bold tracking-widest text-[#1A365D]">CARRERA</span>,
      render: (p: PacienteListItem) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-100/50 text-[#1A365D] text-xs font-medium border border-blue-200">
          {p.carrera || 'No registrada'}
        </span>
      ),
    },
    {
      key: 'semestre',
      header: <span className="text-xs font-bold tracking-widest text-[#1A365D]">SEMESTRE</span>,
      render: (p: PacienteListItem) => <span className="font-semibold text-gray-800">{p.semestre}°</span>,
    },
    {
      key: 'fecha',
      header: <span className="text-xs font-bold tracking-widest text-[#1A365D]">FECHA CREACIÓN</span>,
      render: (p: PacienteListItem) => (
        <span className="text-sm text-gray-500">
          {new Date(p.fecha_registro).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* Custom Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A365D] tracking-tight">Pacientes</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-lg">
            Gestión del padrón de alumnos atendidos por el servicio psicopedagógico del ITVH.
          </p>
        </div>
        <Button onClick={() => navigate('/pacientes/nuevo')} className="bg-[#1A365D] hover:bg-[#122643] shrink-0 shadow-md">
          <Plus size={18} className="mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      <main className="flex-1 p-6 lg:p-8 bg-gray-50/50 space-y-6">

        {/* Toolbar & Table Card */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-t-4 border-t-[#1A365D] border-x border-b border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Listado General</h2>
            </div>
            <div className="w-full sm:w-64">
              <SearchInput
                onChange={handleSearch}
                placeholder="Buscar por nombre o No. Control..."
              />
            </div>
          </div>

          <div className="bg-white">
            <DataTable
              columns={columns}
              data={data?.items ?? []}
              keyExtractor={(p) => p.id}
              onRowClick={(p) => navigate(`/pacientes/${p.id}`)}
              isLoading={isLoading}
              emptyMessage="No se encontraron pacientes"
            />
          </div>

          {/* Pagination Matches mockup */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Mostrando página {data?.page || 1} de {data?.total_pages || 1} ({data?.total || 0} pacientes)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs font-bold text-[#1A365D] tracking-widest uppercase hover:bg-gray-200 px-3 py-1.5 rounded disabled:opacity-50 transition-colors"
              >
                Anterior
              </button>
              <button
                disabled={page >= (data?.total_pages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs font-bold bg-[#1A365D] text-white tracking-widest uppercase hover:bg-[#122643] px-3 py-1.5 rounded disabled:opacity-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
