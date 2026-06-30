import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, X } from 'lucide-react';

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
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-[100] bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 z-[101] h-screen w-full max-w-[380px] bg-[#182a4d] shadow-[-10px_0_40px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-300 ease-in-out border-l border-[#1e345f] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#1e345f] bg-[#142340]">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-bold text-white tracking-wide">Notificaciones</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-amber-500 px-2.5 text-[10px] font-bold text-[#142340] shadow-sm">
                {notifications.filter(n => !n.read).length} nuevas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose} 
              title="Cerrar"
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-[#21355e] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#182a4d]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center min-h-[50vh]">
              <div className="w-16 h-16 rounded-full bg-[#142340] flex items-center justify-center text-slate-500">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-300">No tienes notificaciones nuevas</p>
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
                className="p-5 border-b border-[#1e345f] hover:bg-[#21355e] transition-colors cursor-pointer flex gap-4 group relative"
              >
                {/* Indicador Unread */}
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'}`}></div>
                
                <div className="flex-1">
                  <p className={`text-[14px] font-bold ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                    {notif.title}
                  </p>
                  <p className="text-[13px] text-slate-300 mt-1 leading-relaxed line-clamp-2">
                    {notif.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5 text-slate-400">
                    <Clock size={12} />
                    <p className="text-[11px] font-medium tracking-wide uppercase">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-[#142340] text-center border-t border-[#1e345f]">
          <Link 
            to="/historial" 
            onClick={onClose}
            className="text-[13px] font-bold text-slate-300 hover:text-white transition-colors"
          >
            Ver historial de aprobaciones completo
          </Link>
        </div>
      </div>
    </>
  );
};
