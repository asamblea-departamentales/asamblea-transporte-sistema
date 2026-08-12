import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, CheckCircle, LoaderCircle, RefreshCw, Trash2, X, Check } from 'lucide-react';
import { NotificationItem } from '@/shared/notifications/types';

export type { NotificationItem } from '@/shared/notifications/types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  isLoading: boolean;
  error: string | null;
  actionError: string | null;
  pushEnabled: boolean;
  onRefresh: () => Promise<void>;
  onRetryAction: () => Promise<boolean>;
  onEnablePush: () => Promise<boolean>;
  onClearAll: () => void;
  onMarkAllRead: () => Promise<boolean>;
  onDelete: (id: string) => void;
  onNotificationClick: (notification: NotificationItem) => Promise<void>;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  isLoading,
  error,
  actionError,
  pushEnabled,
  onRefresh,
  onRetryAction,
  onEnablePush,
  onClearAll,
  onMarkAllRead,
  onDelete,
  onNotificationClick
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    void onRefresh();
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onRefresh]);

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (window.confirm('¿Deseas ocultar todas las notificaciones de este usuario?')) {
      onClearAll();
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={onClose}
        className={'fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ' +
          (isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-panel-title"
        tabIndex={-1}
        className={'fixed top-0 right-0 z-[101] h-screen w-full max-w-[380px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 ease-in-out outline-none ' +
          (isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none')}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <span id="notification-panel-title" className="text-[16px] font-bold text-slate-800 tracking-wide">
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-blue-600 px-2.5 text-[10px] font-bold text-white shadow-sm">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void onRefresh()}
              aria-label="Actualizar notificaciones"
              title="Actualizar"
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => void onMarkAllRead()}
              disabled={unreadCount === 0}
              aria-label="Marcar todas como leídas"
              title="Marcar todo como leído"
              className="flex items-center justify-center w-8 h-8 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-40 transition-colors"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              aria-label="Ocultar todas las notificaciones"
              title="Ocultar todas"
              className="flex items-center justify-center w-8 h-8 rounded-full text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
            >
              <Trash2 size={15} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar notificaciones"
              title="Cerrar"
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {(error || actionError) && (
            <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p>{actionError ?? error}</p>
              {actionError ? (
                <button
                  type="button"
                  onClick={() => void onRetryAction()}
                  className="mt-2 inline-flex items-center gap-1 font-bold underline"
                >
                  Reintentar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void onRefresh()}
                  className="mt-2 inline-flex items-center gap-1 font-bold underline"
                >
                  <RefreshCw size={13} /> Reintentar consulta
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 px-6 py-3 text-xs text-slate-500" role="status">
              <LoaderCircle size={15} className="animate-spin" />
              Actualizando notificaciones…
            </div>
          )}

          {!isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center min-h-[50vh]">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-700">No hay notificaciones</p>
                <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                  Las nuevas solicitudes aparecerán aquí.
                </p>
              </div>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                aria-label={notification.title}
                onClick={() => void onNotificationClick(notification)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    void onNotificationClick(notification);
                  }
                }}
                className={'relative w-full flex items-start gap-4 px-6 py-5 text-left transition-colors border-b border-slate-50 group hover:bg-slate-50/80 cursor-pointer focus:bg-blue-50 focus:outline-none ' +
                  (notification.read ? 'opacity-60 hover:opacity-100' : '')}
              >
                {!notification.read && (
                  <span
                    aria-label="No leída"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                  />
                )}

                <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 mt-0.5 bg-blue-50 ring-1 ring-blue-200">
                  <BellRing size={17} className="text-blue-600" />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <span className={'block text-[14px] leading-tight tracking-wide mb-1.5 transition-colors ' +
                    (notification.read
                      ? 'text-slate-600 font-semibold'
                      : 'text-slate-900 font-bold group-hover:text-blue-600')}>
                    {notification.title}
                  </span>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-2 line-clamp-3">
                    {notification.description}
                  </p>
                  <span className="text-[11px] font-medium text-slate-400">
                    {notification.time}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    onDelete(notification.id);
                  }}
                  aria-label="Ocultar notificación"
                  title="Ocultar notificación"
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2 mt-auto">
          {!pushEnabled && (
            <button
              type="button"
              onClick={() => void onEnablePush()}
              className="w-full text-center text-xs font-semibold text-blue-700 hover:text-blue-900 py-2"
            >
              Activar avisos del sistema
            </button>
          )}
          <Link
            to="/notificaciones"
            onClick={onClose}
            className="w-full text-center text-[13px] font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:shadow hover:text-blue-600 transition-all py-2.5 rounded-xl block"
          >
            Ir al Centro de Notificaciones
          </Link>
        </div>
      </div>
    </>
  );
};
