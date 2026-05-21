import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LogOut, CalendarHeart } from 'lucide-react';

export default function PatientLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Double check protection
  if (!user || user.rol?.nombre !== 'paciente') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      {/* Patient Navbar */}
      <nav className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CalendarHeart size={20} className="stroke-[2.5]" />
              </div>
              <span className="font-semibold text-lg text-gray-900 tracking-tight">Servicio de Psicoterapia</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700 hidden sm:block">
                Hola, {user.nombre || user.username}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium hidden sm:block">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
