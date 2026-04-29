import { AlertTriangle } from 'lucide-react';
import { useUrgenciasPendientes } from '@/hooks/useCitas';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';

export default function UrgenciaNotification() {
  const user = useAuthStore((s) => s.user);
  const { data: urgencias } = useUrgenciasPendientes();

  // Solo mostrar para psicólogos y administradores
  if (!user || (user.rol?.nombre !== 'psicologo' && user.rol?.nombre !== 'administrador')) {
    return null;
  }

  const count = urgencias?.length ?? 0;

  if (count === 0) return null;

  return (
    <Link
      to="/citas"
      className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-all animate-pulse"
      title="Hay urgencias pendientes de atención"
    >
      <AlertTriangle size={16} className="text-red-600" />
      <span className="text-xs font-bold text-red-700 hidden sm:inline">
        {count} Solicitud{count !== 1 ? 'es' : ''} de Urgencia
      </span>
      <Badge variant="danger" className="sm:hidden">{count}</Badge>
    </Link>
  );
}
