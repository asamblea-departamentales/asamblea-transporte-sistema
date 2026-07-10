import { useNavigate } from "react-router-dom";
import { useNotifications, type Notification } from "../../notifications/NotificationContext";
import { cn } from "../../lib/utils";
import { Icons, timeAgo, notiCfg } from "./sidebar.constants";

export function NotificacionesDrawer({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification, deleteAllNotifications, permission, requestPermission } = useNotifications();
  const navigate  = useNavigate();
  const recientes = notifications.slice(0, 20);

  return (
    <>
      <div 
        onClick={onClose} 
        className={cn(
          "fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
      />
      <div 
        className={cn(
          "fixed top-0 right-0 z-[101] h-screen w-full max-w-[380px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 ease-custom-cubic",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-bold text-slate-800 tracking-wide">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-blue-600 px-2.5 text-[10px] font-bold text-white shadow-sm">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} title="Marcar todo como leído" className="flex items-center justify-center w-8 h-8 rounded-full text-blue-600 hover:bg-blue-50 transition-colors">
                <Icons.Check />
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={deleteAllNotifications} title="Eliminar todas las notificaciones" className="flex items-center justify-center w-8 h-8 rounded-full text-red-600 hover:bg-red-50 transition-colors">
                <Icons.Trash />
              </button>
            )}
            <button onClick={onClose} title="Cerrar" className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <Icons.X />
            </button>
          </div>
        </div>

        {permission === "default" && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Icons.Bell />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-blue-900 leading-tight">Activar Notificaciones</p>
                <p className="text-[12px] text-blue-700 mt-0.5 leading-snug">Recibe alertas de tus solicitudes en tu dispositivo.</p>
              </div>
            </div>
            <button onClick={requestPermission} className="w-full py-2 bg-blue-600 text-white rounded-xl text-[12.5px] font-bold shadow-sm shadow-blue-200 active:scale-95 transition-all">
              Habilitar ahora
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 bg-white">
          {recientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center h-[50vh]">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <Icons.Bell />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-700">No hay notificaciones</p>
                <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">Estás al día con tus solicitudes.</p>
              </div>
            </div>
          ) : (
            recientes.map((n: Notification) => {
              const cfg = notiCfg[n.tipo as keyof typeof notiCfg] || notiCfg.info;
              const isUnread = !n.leida;
              return (
                <div key={n.id} 
                  className={cn("relative w-full flex items-start gap-4 px-6 py-5 text-left transition-colors border-b border-slate-50 group hover:bg-slate-50/80 cursor-pointer", !isUnread && "opacity-60 hover:opacity-100")}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.btn-delete')) return;
                    if(isUnread) markAsRead(n.id);
                    navigate(`/solicitudes/${n.modulo}/${n.reqId}`);
                    onClose();
                  }}
                >
                  {isUnread && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 mt-0.5", cfg.iconBg, cfg.dot.replace('bg-', 'text-'))}>
                     <span className={cn("w-2 h-2 rounded-full block", cfg.dot)} />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <span className={cn("block text-[14px] leading-tight tracking-wide mb-1.5 transition-colors", isUnread ? "text-slate-900 font-bold group-hover:text-blue-600" : "text-slate-600 font-semibold")}>
                      {n.titulo}
                    </span>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-2 line-clamp-3">{n.mensaje}</p>
                    <span className="text-[11px] font-medium text-slate-400">{timeAgo(n.createdAt)}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    title="Eliminar Notificación"
                    className="btn-delete absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all translate-x-2 group-hover:translate-x-0"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-center mt-auto">
          <button onClick={() => { onClose(); navigate("/notificaciones"); }} className="w-full text-[13px] font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:shadow hover:text-blue-600 transition-all py-2.5 rounded-xl">
            Ir al Centro de Notificaciones
          </button>
        </div>
      </div>
    </>
  );
}
