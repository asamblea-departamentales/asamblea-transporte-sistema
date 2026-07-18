import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, X, Trash2, Check } from 'lucide-react';
import { NotificationItem } from '@/shared/notifications/types';

export type { NotificationItem } from '@/shared/notifications/types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearAll?: () => void;
  onMarkAllRead?: () => void;
  onDelete?: (id: string | number) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  isOpen, 
  onClose, 
  notifications,
  onClearAll,
  onMarkAllRead,
  onDelete
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 z-[101] h-screen w-full max-w-[380px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-bold text-slate-800 tracking-wide">Notificaciones</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-blue-600 px-2.5 text-[10px] font-bold text-white shadow-sm">
                {notifications.filter(n => !n.read).length} nuevas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onMarkAllRead}
              title="Marcar todo como leído"
              className="flex items-center justify-center w-8 h-8 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button 
              onClick={onClearAll}
              title="Eliminar todas las notificaciones"
              className="flex items-center justify-center w-8 h-8 rounded-full text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} strokeWidth={2} />
            </button>
            <button 
              onClick={onClose} 
              title="Cerrar"
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-white">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center min-h-[50vh]">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-700">No hay notificaciones</p>
                <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">Estás al día con tus solicitudes.</p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => {
                  navigate(notif.action_url);
                  onClose();
                }}
                className={`relative w-full flex items-start gap-4 px-6 py-5 text-left transition-colors border-b border-slate-50 group hover:bg-slate-50/80 cursor-pointer ${notif.read ? 'opacity-60 hover:opacity-100' : ''}`}
              >
                {/* Punto Azul de No Leído */}
                {!notif.read && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                )}
                
                {/* Icono (Simulado para hacer match con el estilo) */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 mt-0.5 bg-blue-50 ring-1 ring-blue-200">
                   <span className="w-2 h-2 rounded-full block bg-blue-500" />
                </div>
                
                <div className="flex-1 min-w-0 pr-6">
                  <span className={`block text-[14px] leading-tight tracking-wide mb-1.5 transition-colors ${notif.read ? 'text-slate-600 font-semibold' : 'text-slate-900 font-bold group-hover:text-blue-600'}`}>
                    {notif.title}
                  </span>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-2 line-clamp-3">
                    {notif.description}
                  </p>
                  <span className="text-[11px] font-medium text-slate-400">
                    {notif.time}
                  </span>
                </div>

                {/* Botón Flotante Eliminar */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onDelete) onDelete(notif.id);
                  }}
                  title="Eliminar Notificación"
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all translate-x-2 group-hover:translate-x-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-center mt-auto">
          <Link 
            to="/historial" 
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
