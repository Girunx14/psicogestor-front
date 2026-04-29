import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { tiempoTranscurrido } from '@/lib/utils';
import type { UrgenciaPendiente } from '@/types';

interface UrgenciasPanelProps {
  urgencias: UrgenciaPendiente[] | undefined;
  isLoading: boolean;
  hasError: boolean;
  onAceptar: (urgencia: UrgenciaPendiente) => void;
  onRechazar: (urgencia: UrgenciaPendiente) => void;
  isAceptando: boolean;
  isRechazando: boolean;
}

export default function UrgenciasPanel({ 
  urgencias, 
  isLoading, 
  hasError, 
  onAceptar, 
  onRechazar, 
  isAceptando, 
  isRechazando 
}: UrgenciasPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 border-l-4 border-l-red-400">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Urgencias Pendientes</h3>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (hasError) return null;

  const lista = urgencias ?? [];
  if (lista.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-red-200 overflow-hidden border-l-4 border-l-red-500 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header */}
      <div className="px-5 py-3 border-b border-red-100 bg-red-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Llamadas de Emergencia Solicitadas</h3>
        </div>
        <Badge variant="danger">{lista.length} activa{lista.length !== 1 ? 's' : ''}</Badge>
      </div>

      {/* Grid de tarjetas */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lista.map((urgencia) => (
          <div
            key={urgencia.id}
            className="card-editorial p-4 border-l-4 border-l-red-400 flex flex-col gap-3 bg-red-50/30 hover:bg-red-50/50 transition-colors"
          >
            {/* Header paciente */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">
                  {urgencia.paciente_nombre}
                </p>
                {urgencia.paciente_numero_control && (
                  <p className="text-xs text-secondary-500 font-mono mt-0.5">
                    {urgencia.paciente_numero_control}
                  </p>
                )}
              </div>
              <Badge variant="danger" className="shrink-0 shadow-sm">URGENTE</Badge>
            </div>

            {/* Motivo */}
            {urgencia.motivo && (
              <blockquote className="mt-1 pl-3 border-l-2 border-red-300 text-xs text-secondary-700 italic">
                &ldquo;{urgencia.motivo}&rdquo;
              </blockquote>
            )}

            {/* Tiempo */}
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-red-600">
              <Clock size={12} />
              <span>{tiempoTranscurrido(urgencia.creado_en)}</span>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2 border-t border-red-100">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAceptar(urgencia)}
                disabled={isAceptando || isRechazando}
                className="flex-1 bg-red-600 hover:bg-red-700 border-red-600"
              >
                <CheckCircle size={14} className="mr-1" />
                Atender
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRechazar(urgencia)}
                disabled={isAceptando || isRechazando}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle size={14} className="mr-1" />
                Rechazar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
