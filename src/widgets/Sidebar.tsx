import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileCheck, History, LogOut, Bell, CheckCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/features/Auth/context/useAuth';
import { useNotifications } from '@/shared/notifications';
import { hasJefaturaAccess } from '@/shared/auth/roles';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenNotifications?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenNotifications
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { pendingCount } = useNotifications();

  const isAprobando =
    location.pathname.includes('/aprobaciones/') ||
    location.pathname.includes('/combustible/aprobaciones/') ||
    location.pathname.includes('/mantenimiento/aprobaciones/');

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { to: '/pre-aprobadas', icon: CheckCircle, label: 'Pre-Aprobadas', show: hasJefaturaAccess(user?.roles) },
    { to: '/en-ejecucion', icon: MapPin, label: 'En Ruta', show: true },
    {
      to: location.pathname,
      icon: FileCheck,
      label: 'Por Aprobar',
      show: hasJefaturaAccess(user?.roles) && isAprobando
    },
    { to: '/historial', icon: History, label: 'Historial', show: true }
  ];

  return (
    <aside
      className={
        'fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] border-r border-[#1a2d54] bg-gradient-header shadow-sidebar ' +
        'transition-transform duration-300 ease-in-out md:translate-x-0 ' +
        (isOpen ? 'translate-x-0' : '-translate-x-full')
      }
    >
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-golden-v opacity-60" />

      <div className="p-8 pb-6 flex flex-col items-center border-b border-white/5 relative">
        <div className="w-full flex justify-center mb-4 relative">
          <img
            src="/logo.png"
            alt="Logo Asamblea"
            className="w-28 h-auto object-contain brightness-0 invert drop-shadow-md relative z-10"
            onError={event => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <h2 className="font-display font-extrabold text-[11px] tracking-[0.25em] text-[#86a8e7] text-center uppercase">
          Asamblea Legislativa
          <span className="block text-base font-bold text-white tracking-wide mt-1.5 drop-shadow-sm">
            Logística
          </span>
        </h2>
      </div>

      <div className="px-6 mt-8 mb-3">
        <p className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase">Navegación</p>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto space-y-1.5 scrollbar-hide">
        {navItems.filter(item => item.show).map(item => (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              'group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200 ' +
              (isActive
                ? 'bg-white/[0.08] text-white border-t border-white/[0.15]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent')
            }
          >
            {({ isActive }) => (
              <>
                <div className={
                  'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all ' +
                  (isActive
                    ? 'bg-blue-500/15 text-blue-300 shadow-[inset_0_0_8px_rgba(59,130,246,0.2)]'
                    : 'text-white/30 group-hover:text-white/70')
                }>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="hidden md:block px-6 py-5 pb-8 mt-auto flex flex-col gap-5 border-t border-white/5 bg-black/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex items-center justify-center font-bold text-white flex-shrink-0 rounded-lg bg-gradient-profile shadow-profile">
              {user?.name?.substring(0, 1).toUpperCase() || 'J'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold text-white truncate" title={user?.name}>
                {user?.name || 'Usuario'}
              </p>
              <p className="text-[11px] text-[#86a8e7] truncate tracking-wide">
                {user?.roles?.[0] || 'operativo'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Abrir notificaciones"
            className="relative text-white/60 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
          >
            <Bell size={18} strokeWidth={2} />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-black text-[#0f2548] bg-amber-400 border-[2px] border-[#0f2548] shadow-sm">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[12.5px] font-bold tracking-wide text-white/70 hover:text-red-300 hover:bg-white/5 transition-all duration-200 border border-transparent"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 h-16 bg-gradient-bottom-nav border-t border-white/5 shadow-bottom-nav"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-golden-h" />

        <ul className="flex items-center justify-around px-2 py-2 w-full">
          {navItems.filter(item => item.show).map(item => (
            <li key={item.label} className="flex-1">
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ' +
                  (isActive ? 'text-white bg-white/10' : 'text-white/50 hover:text-white/80')
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={
                      'relative mb-1 transition-transform duration-200 ' +
                      (isActive ? 'scale-110' : 'scale-100')
                    }>
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      {isActive && (
                        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-blue-dot" />
                      )}
                    </div>
                    <span className={
                      'text-[10px] font-medium mt-1 ' + (isActive ? 'opacity-100' : 'opacity-70')
                    }>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}

          <li className="flex-1">
            <button
              type="button"
              onClick={() => void logout()}
              className="w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl text-white/50 hover:text-red-300 transition-colors"
            >
              <LogOut size={22} strokeWidth={2} className="mb-1" />
              <span className="text-[10px] font-medium opacity-70 mt-1">Salir</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};
