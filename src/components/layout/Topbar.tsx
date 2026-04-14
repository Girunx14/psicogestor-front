import { useAuthStore } from '@/store/authStore';
import { User } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="bg-white border-b border-secondary-100 px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page title */}
        <div className="pl-12 lg:pl-0">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-secondary-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* User info */}
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
    </header>
  );
}
