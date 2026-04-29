import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { User, Menu } from 'lucide-react';
import UrgenciaNotification from './UrgenciaNotification';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="bg-white border-b border-secondary-100 px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 text-secondary-400 hover:text-primary hover:bg-surface rounded-lg transition-all"
            title="Alternar Menú"
          >
            <Menu size={20} />
          </button>
          {/* Page title */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-secondary-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* User info & Notifications */}
        <div className="flex items-center gap-4">
          <UrgenciaNotification />
          
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.username}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
