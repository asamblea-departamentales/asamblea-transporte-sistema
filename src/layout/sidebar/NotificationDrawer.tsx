import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, type Notification } from "../../notifications/NotificationContext";
import { getNotificationTargetPath } from "../../notifications/notification-routing";
import { cn } from "../../lib/utils";
import { Icons, timeAgo, notiCfg } from "./sidebar.constants";

export function NotificacionesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllRead,
    dismissNotification,
    dismissAllNotifications,
    permission,
    requestPermission,
  } = useNotifications();
  const navigate = useNavigate();
  const recientes = notifications.slice(0, 20);

  useEffect(() => {
    if (open) void refreshNotifications().catch(() => undefined);
  }, [open, refreshNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    onClose();
    navigate(getNotificationTargetPath({
      modulo: notification.modulo,
      solicitudId: notification.reqId,
      url: notification.url,
    }));
  };

  const handleDismissAll = () => {
    if (window.confirm("¿Limpiar todas las notificaciones de este navegador?")) {
      dismissAllNotifications();
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notificaciones"
        className={cn(
          "fixed right-0 top-0 z-[101] flex h-screen w-full max-w-[380px] flex-col bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-custom-cubic",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-bold tracking-wide text-slate-800">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-blue-600 px-2.5 text-[10px] font-bold text-white shadow-sm">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={() => void markAllRead()} title="Marcar todo como leído" className="flex h-8 w-8 items-center justify-center rounded-full text-blue-600 transition-colors hover:bg-blue-50">
                <Icons.Check />
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={handleDismissAll} title="Limpiar todas las notificaciones" className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50">
                <Icons.Trash />
              </button>
            )}
            <button onClick={onClose} title="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <Icons.X />
            </button>
          </div>
        </div>

        {permission === "default" && (
          <div className="mx-4 mt-4 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Icons.Bell />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold leading-tight text-blue-900">Activar notificaciones</p>
                <p className="mt-0.5 text-[12px] leading-snug text-blue-700">Recibe alertas de tus solicitudes en tu dispositivo.</p>
              </div>
            </div>
            <button onClick={() => void requestPermission()} className="w-full rounded-xl bg-blue-600 py-2 text-[12.5px] font-bold text-white shadow-sm shadow-blue-200 transition-all active:scale-95">
              Habilitar ahora
            </button>
          </div>
        )}

        {error && (
          <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800" role="alert">
            <p>No se pudieron actualizar. Se conserva el historial disponible.</p>
            <button onClick={() => void refreshNotifications().catch(() => undefined)} className="mt-1 font-bold underline">
              Reintentar
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-white">
          {isLoading && recientes.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-8 text-center" role="status" aria-live="polite">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
              <p className="text-sm font-semibold text-slate-600">Cargando notificaciones…</p>
            </div>
          ) : recientes.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <Icons.Bell />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-700">No hay notificaciones</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">Estás al día con tus solicitudes.</p>
              </div>
            </div>
          ) : (
            recientes.map((notification) => {
              const cfg = notiCfg[notification.tipo] ?? notiCfg.info;
              const isUnread = !notification.leida;
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative flex w-full cursor-pointer items-start gap-4 border-b border-slate-50 px-6 py-5 text-left transition-colors hover:bg-slate-50/80",
                    !isUnread && "opacity-60 hover:opacity-100",
                  )}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest(".btn-dismiss")) return;
                    void handleNotificationClick(notification);
                  }}
                >
                  {isUnread && <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                  <div className={cn("mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full", cfg.iconBg, cfg.dot.replace("bg-", "text-"))}>
                    <span className={cn("block h-2 w-2 rounded-full", cfg.dot)} />
                  </div>
                  <div className="min-w-0 flex-1 pr-6">
                    <span className={cn("mb-1.5 block text-[14px] leading-tight tracking-wide transition-colors", isUnread ? "font-bold text-slate-900 group-hover:text-blue-600" : "font-semibold text-slate-600")}>
                      {notification.titulo}
                    </span>
                    <p className="mb-2 line-clamp-3 text-[13px] leading-relaxed text-slate-500">{notification.mensaje}</p>
                    <span className="text-[11px] font-medium text-slate-400">{timeAgo(notification.createdAt)}</span>
                  </div>
                  <button
                    onClick={(event) => { event.stopPropagation(); dismissNotification(notification.id); }}
                    title="Limpiar notificación"
                    aria-label={`Limpiar ${notification.titulo}`}
                    className="btn-dismiss absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 translate-x-2 items-center justify-center rounded-full text-slate-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-auto flex items-center justify-center border-t border-slate-100 bg-slate-50 p-4">
          <button onClick={() => { onClose(); navigate("/notificaciones"); }} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-bold text-slate-700 shadow-sm transition-all hover:text-blue-600 hover:shadow">
            Ir al Centro de Notificaciones
          </button>
        </div>
      </div>
    </>
  );
}
