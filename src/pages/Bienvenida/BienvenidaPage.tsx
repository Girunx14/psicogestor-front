import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Topbar from '@/components/layout/Topbar';
import Button from '@/components/ui/Button';
import { LogOut, Users, Calendar, BarChart3 } from 'lucide-react';

export default function BienvenidaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>

      <main className="flex-1 p-6 lg:p-8 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          {/* Header institucional */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-[#1A365D] px-8 py-6 text-center">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Instituto Tecnológico de Villahermosa
              </h2>
            </div>
            <div className="px-8 py-6 space-y-3 text-center border-b border-gray-100">
              <p className="text-sm font-medium text-[#1A365D] uppercase tracking-wider">
                Subdirección Académica
              </p>
              <p className="text-sm font-medium text-[#1A365D] uppercase tracking-wider">
                Departamento de Desarrollo Académico
              </p>
              <div className="bg-[#1A365D]/5 inline-block px-4 py-2 rounded-lg mt-2">
                <p className="text-sm font-semibold text-[#1A365D]">
                  Programa de Psicoterapia a la Población Estudiantil
                </p>
              </div>
            </div>

          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/pacientes')}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Users size={24} className="text-[#1A365D]" />
              </div>
              <h3 className="font-bold text-[#1A365D] mb-1">Pacientes</h3>
              <p className="text-sm text-gray-500">Ver y gestionar expedientes clínicos</p>
            </button>

            <button
              onClick={() => navigate('/citas')}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <Calendar size={24} className="text-[#1A365D]" />
              </div>
              <h3 className="font-bold text-[#1A365D] mb-1">Citas</h3>
              <p className="text-sm text-gray-500">Administrar citas y horarios</p>
            </button>

            <button
              onClick={() => navigate('/estadisticas')}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <BarChart3 size={24} className="text-[#1A365D]" />
              </div>
              <h3 className="font-bold text-[#1A365D] mb-1">Estadísticas</h3>
              <p className="text-sm text-gray-500">Ver reportes y análisis de datos</p>
            </button>
          </div>

          {/* Info del usuario */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-[#1A365D] mb-3">Información de Sesión</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Usuario:</span>
                <p className="font-medium text-gray-800">{user?.username}</p>
              </div>
              <div>
                <span className="text-gray-500">Rol:</span>
                <p className="font-medium text-gray-800">{user?.rol?.nombre}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}