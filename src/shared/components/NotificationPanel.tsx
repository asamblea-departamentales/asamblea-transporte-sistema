import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';

export interface NotificationItem {
  id: string | number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  action_url: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Evitar que el clic en la campana cierre el panel inmediatamente si están empalmados
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Hacemos que un click outside solo ocurra si no se hizo click en algo con el id "notif-bell"
        if (!(event.target as Element).closest('#notif-bell')) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="absolute bottom-14 left-0 w-80 bg-[#182a4d] border border-[#1e345f] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-[100] animate-in slide-in-from-bottom-2 fade-in duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#1e345f] flex justify-between items-center bg-[#142340]">
        <h3 className="text-white font-bold text-sm">Notificaciones</h3>
        <button 
          onClick={onClose} 
          className="text-xs text-[#859BFF] hover:text-white transition-colors"
        >
          Cerrar
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle size={32} className="text-slate-500 mb-3 opacity-50" />
            <p className="text-slate-400 text-sm font-medium">No tienes notificaciones nuevas.</p>
            <p className="text-slate-500 text-xs mt-1">Estás al día.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => {
                navigate(notif.action_url);
                onClose();
              }}
              className="p-3.5 border-b border-[#1e345f] hover:bg-[#21355e] transition-colors cursor-pointer flex gap-3 group relative"
            >
              {/* Indicador Unread */}
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'}`}></div>
              
              <div className="flex-1">
                <p className={`text-sm font-bold ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                  {notif.description}
                </p>
                <div className="flex items-center gap-1 mt-2 text-slate-400">
                  <Clock size={10} />
                  <p className="text-[10px] font-medium">{notif.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-[#142340] text-center border-t border-[#1e345f]">
        <Link 
          to="/historial" 
          onClick={onClose}
          className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          Ver historial completo
        </Link>
      </div>
    </div>
  );
};
