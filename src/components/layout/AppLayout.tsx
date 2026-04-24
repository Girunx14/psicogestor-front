import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';

export default function AppLayout() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        sidebarOpen ? "lg:pl-64" : "lg:pl-0"
      )}>
        <Outlet />
      </div>
    </div>
  );
}
