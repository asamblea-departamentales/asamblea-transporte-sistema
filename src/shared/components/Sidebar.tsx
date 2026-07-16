import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileCheck, History, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../features/Auth/context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { notifications, pendingCount, markAllAsRead, clearNotifications, deleteNotification } = useNotifications(user);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isAprobando = location.pathname.includes('/aprobaciones/') || location.pathname.includes('/combustible/aprobaciones/') || location.pathname.includes('/mantenimiento/aprobaciones/');

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { 
      to: location.pathname, 
      icon: FileCheck, 
      label: 'Por Aprobar', 
      show: user?.roles?.some(r => ['jefe', 'admin', 'ti', 'super_admin'].includes(r)) && isAprobando 
    },
    { to: '/historial', icon: History, label: 'Historial', show: true },
  ];

  return (
    <>
      {/* ── DESKTOP SIDEBAR & MOBILE DRAWER ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] bg-surface-base border-r border-surface-border
        transition-transform duration-300 ease-in-out shadow-drawer
        md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Logo Section */}
        <div className="p-8 pb-6 flex flex-col items-center border-b border-surface-border relative">
          {/* Subtle Glow */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-glow to-transparent opacity-50"></div>
          
          <div className="w-full flex justify-center mb-4 relative">
            <div className="absolute inset-0 bg-blue-glow rounded-full blur-2xl opacity-20"></div>
            <img 
              src="/logo.png" 
              alt="Logo Asamblea" 
              className="w-28 h-auto object-contain brightness-0 invert drop-shadow-md relative z-10"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h2 className="font-display font-extrabold text-[11px] tracking-[0.25em] text-ink-muted text-center uppercase">
            Asamblea Legislativa
            <span className="block text-base font-bold text-white tracking-wide mt-1.5 drop-shadow-sm">Logística</span>
          </h2>
        </div>

        <div className="px-6 mt-8 mb-3">
          <p className="text-[10px] font-bold text-ink-disabled tracking-[0.2em] uppercase">Navegación</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 overflow-y-auto space-y-1.5 scrollbar-hide">
          {navItems.filter(item => item.show).map((item) => (
            <NavLink 
              key={item.label}
              to={item.to} 
              onClick={onClose}
              className={({ isActive }) => `
                group flex items-center gap-3.5 px-3 py-3 rounded-xl text-[13.5px] font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-blue-glass/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-white/5' 
                  : 'text-ink-secondary hover:bg-surface-subtle hover:text-white'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    isActive 
                      ? 'bg-blue-500/15 text-blue-300 shadow-[inset_0_0_8px_rgba(59,130,246,0.2)]' 
                      : 'text-ink-muted group-hover:text-ink-primary'
                  }`}>
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Profile Section */}
        <div className="hidden md:block p-4 border-t border-surface-border bg-surface-overlay backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-blue-glass/20 border border-blue-border/30 flex items-center justify-center font-display font-bold text-blue-300 shadow-blue-glow shrink-0">
                {user?.name?.substring(0, 1).toUpperCase() || 'J'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-white truncate" title={user?.name}>
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-[11px] text-ink-muted truncate tracking-wide uppercase">
                  {user?.roles?.[0] || 'operativo'}
                </p>
              </div>
            </div>
            
            {/* Desktop Bell */}
            <div 
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (pendingCount > 0) markAllAsRead();
              }}
              className="relative cursor-pointer text-ink-muted hover:text-white transition-colors p-2 rounded-lg hover:bg-surface-subtle"
            >
              <Bell size={18} strokeWidth={2} />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full shadow-blue-dot animate-pulse"></span>
              )}
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-danger-text hover:bg-danger-glass transition-colors text-[13px] font-semibold border border-transparent hover:border-danger-border/30"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAVIGATION (App-like feel) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-overlay/95 backdrop-blur-xl border-t border-surface-border z-40 pb-safe">
        <ul className="flex items-center justify-around px-2 py-2">
          {navItems.filter(item => item.show).map((item) => (
            <li key={item.label} className="flex-1">
              <NavLink 
                to={item.to} 
                onClick={onClose}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200
                  ${isActive ? 'text-blue-400' : 'text-ink-muted hover:text-ink-primary'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      {isActive && (
                        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-blue-dot"></span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium mt-1 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          
          {/* Mobile Profile / Logout Action */}
          <li className="flex-1">
            <button 
              onClick={logout}
              className="w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl text-ink-muted hover:text-danger-text transition-colors"
            >
              <LogOut size={22} strokeWidth={2} className="mb-1" />
              <span className="text-[10px] font-medium opacity-70 mt-1">Salir</span>
            </button>
          </li>
        </ul>
      </nav>

      <NotificationPanel 
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onClearAll={clearNotifications}
        onMarkAllRead={markAllAsRead}
        onDelete={deleteNotification}
      />
    </>
  );
};
