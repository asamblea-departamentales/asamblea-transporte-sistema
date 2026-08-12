import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, CheckCircle, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useNotifications, resolveNotificationPath } from '@/shared/notifications';
import { NotificationItem } from '@/shared/notifications/types';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    pendingCount,
    isLoading,
    error,
    notificationActionError,
    pushEnabled,
    refreshNotifications,
    markAsRead,
    markAllRead,
    dismissNotification,
    dismissAllNotifications,
    retryNotificationAction,
    enablePush
  } = useNotifications();

  const handleNotificationClick = async (notification: NotificationItem) => {
    const canNavigate = notification.read || await markAsRead(notification.id);
    if (!canNavigate) return;

    navigate(resolveNotificationPath({
      url: notification.action_url,
      module: notification.module,
      requestCode: notification.requestCode
    }));
  };

  const handleClearAll = () => {
    if (notifications.length > 0 &&
      window.confirm('¿Deseas ocultar todas las notificaciones de este usuario?')) {
      dismissAllNotifications();
    }
  };

  return (
    <section className="min-h-screen bg-bgMain px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Centro</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-800">Notificaciones</h1>
            <p className="mt-1 text-sm text-slate-500">
              {pendingCount > 0 ? pendingCount + ' pendientes de lectura' : 'Estás al día'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refreshNotifications()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:text-blue-700"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={pendingCount === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-40"
            >
              Marcar leídas
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-40"
            >
              <Trash2 size={15} />
              Limpiar
            </button>
          </div>
        </div>

        {!pushEnabled && (
          <button
            type="button"
            onClick={() => void enablePush()}
            className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"
          >
            Activar avisos del sistema
          </button>
        )}

        {(error || notificationActionError) && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{notificationActionError ?? error}</p>
            {notificationActionError ? (
              <button type="button" onClick={() => void retryNotificationAction()} className="mt-2 font-bold underline">
                Reintentar acción
              </button>
            ) : (
              <button type="button" onClick={() => void refreshNotifications()} className="mt-2 font-bold underline">
                Reintentar consulta
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500" role="status">
            <LoaderCircle size={16} className="animate-spin" />
            Actualizando…
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {notifications.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
              <CheckCircle size={42} className="text-slate-300" />
              <p className="font-semibold text-slate-700">No hay notificaciones visibles</p>
              <p className="text-sm text-slate-500">Las nuevas solicitudes aparecerán aquí.</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => void handleNotificationClick(notification)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      void handleNotificationClick(notification);
                    }
                  }}
                  className="flex cursor-pointer items-start gap-4 border-b border-slate-100 px-5 py-5 text-left last:border-b-0 hover:bg-slate-50 focus:bg-blue-50 focus:outline-none"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <BellRing size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-500" aria-label="No leída" />}
                      <h2 className={'text-sm ' + (notification.read ? 'font-semibold text-slate-600' : 'font-bold text-slate-900')}>
                        {notification.title}
                      </h2>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{notification.description}</p>
                    <p className="mt-2 text-xs font-medium text-slate-400">{notification.time}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Ocultar notificación"
                    title="Ocultar notificación"
                    onClick={event => {
                      event.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                    className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;
