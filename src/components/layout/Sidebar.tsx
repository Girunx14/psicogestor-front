import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Calendar, BarChart3, LogOut, Menu, X, Brain, Clock, UserCog, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();

  const isAdminUser = isAdmin();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { to: '/pacientes', label: 'Pacientes', icon: Users, visible: true },
    { to: '/citas', label: 'Citas', icon: Calendar, visible: true },
    { to: '/horarios', label: 'Horarios', icon: Clock, visible: true },
    { to: '/estadisticas', label: 'Estadísticas', icon: BarChart3, visible: true },
    { to: '/usuarios', label: 'Usuarios', icon: UserCog, visible: isAdminUser },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-secondary-200 text-secondary-600 hover:bg-secondary-50"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40',
          'w-64 bg-white border-r border-secondary-100',
          'flex flex-col',
          'transform transition-transform duration-200 ease-in-out',
          'lg:transform-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header / Branding */}
        <div className="px-6 py-6 border-b border-secondary-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary leading-tight">Servicio de Psicoterapia</h1>
              <p className="text-[11px] text-secondary-400 leading-tight">ITVH</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-1">
            {navItems
              .filter((item) => item.visible)
              .map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-secondary-600 hover:bg-surface hover:text-gray-900',
                      )
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>

        {/* User info + Logout */}
        <div className="px-3 py-4 border-t border-secondary-100">
          {user && (
            <div className="px-3 mb-3">
              <p className="text-xs font-medium text-gray-900">{user.username}</p>
              <p className="text-[11px] text-secondary-400 capitalize">{user.rol?.nombre}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-100"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
