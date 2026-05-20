import { useEffect } from 'react';
import { Video, X, ExternalLink, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';

interface VideoCallOverlayProps {
  meetUrl: string;
  displayName?: string;
  onClose: () => void;
  onFinalizar?: () => void;
}

export default function VideoCallOverlay({ meetUrl, onClose, onFinalizar }: VideoCallOverlayProps) {

  useEffect(() => {
    const newTab = window.open(meetUrl, '_blank');
    if (!newTab) {
      console.warn('El navegador bloqueó la apertura de la nueva pestaña de videollamada.');
    }
  }, [meetUrl]);

  const handleOpenCall = () => {
    window.open(meetUrl, '_blank');
  };

  const isGoogleMeet = meetUrl.includes('meet.google.com');

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 animate-fade-in font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Videollamada Activa
        </div>

        <div className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-inner">
          <Video className="text-red-500 animate-bounce" size={40} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Atención de Emergencia
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-4">
          La sesión de videollamada se ha abierto en una nueva pestaña de
          <span className="font-semibold text-white"> {isGoogleMeet ? 'Google Meet' : 'Jitsi Meet'}</span>.
        </p>

        <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-500 font-mono mb-8 max-w-lg mx-auto truncate select-all">
          {meetUrl}
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-left mb-8 space-y-4 max-w-lg mx-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-slate-400" />
            Recomendaciones importantes
          </h3>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-amber-500 mt-0.5">🎙️</span>
              <span>Permite el acceso a la <strong>cámara y micrófono</strong> en la pestaña de la llamada.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-sky-500 mt-0.5">🌐</span>
              <span><strong>No cierres</strong> esta ventana de la plataforma para mantener activa la sesión.</span>
            </li>
            <li className="flex items-start gap-2.5">
              {onFinalizar ? (
                <>
                  <span className="text-red-500 mt-0.5">⏱️</span>
                  <span>Al finalizar el encuentro, presiona <strong>"Finalizar llamada"</strong> aquí para cerrar la urgencia.</span>
                </>
              ) : (
                <>
                  <span className="text-green-500 mt-0.5">⏱️</span>
                  <span>La sesión se completará automáticamente una vez que el psicólogo la finalice.</span>
                </>
              )}
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
          <Button
            onClick={handleOpenCall}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-800 text-white font-medium shadow-md transition-all active:scale-95"
          >
            <ExternalLink size={18} />
            Reabrir videollamada
          </Button>

          {onFinalizar ? (
            <Button
              onClick={onFinalizar}
              variant="danger"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold shadow-lg shadow-red-950/30 transition-all hover:scale-105 active:scale-95"
            >
              <X size={18} />
              Finalizar llamada
            </Button>
          ) : (
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-md transition-all active:scale-95"
            >
              Regresar al Panel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}