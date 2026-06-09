import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileCheck, History, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../features/Auth/context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Verifica si estamos actualmente en una página de aprobación viendo un ID específico
  const isAprobando = location.pathname.includes('/aprobaciones/') || location.pathname.includes('/combustible/aprobaciones/');

  return (
    <aside className={`
      w-[260px] bg-[#182a4d] text-white fixed h-screen left-0 top-0 flex flex-col z-50
      transition-transform duration-300 ease-in-out border-r border-[#1e345f]
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Logo Section */}
      <div className="p-8 pb-6 flex flex-col items-center border-b border-white/5">
        <div className="w-full flex justify-center mb-3">
          <img 
            src="/logo.png" 
            alt="Logo Asamblea" 
            className="w-32 h-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('fallback-text');
            }}
          />
          <style>{`.fallback-text::after { content: 'ASAMBLEA LEGISLATIVA'; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-align: center; }`}</style>
        </div>
        <h2 className="font-title font-extrabold text-[13px] tracking-widest text-slate-300 text-center leading-tight">
          ASAMBLEA LEGISLATIVA<br />
          <span className="text-lg font-bold text-white tracking-normal mt-1 block">Transporte</span>
        </h2>
      </div>

      <div className="px-6 mt-6 mb-4">
        <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Menú Principal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          <li>
            <NavLink 
              to="/" 
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center gap-4 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-[#21355e] text-white shadow-inner border border-white/5' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#3b5998]' : 'opacity-70'}`}>
                    <LayoutDashboard size={18} strokeWidth={2.5} />
                  </div>
                  Dashboard
                </>
              )}
            </NavLink>
          </li>
          {user?.roles?.some(r => ['jefe', 'admin', 'ti', 'super_admin'].includes(r)) && isAprobando && (
            <li>
              <NavLink 
                to={location.pathname} 
                onClick={onClose}
                className={({ isActive }) => 
                  `flex items-center gap-4 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive 
                      ? 'bg-[#21355e] text-white shadow-inner border border-white/5' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#3b5998]' : 'opacity-70'}`}>
                      <FileCheck size={18} strokeWidth={2.5} />
                    </div>
                    Por Aprobar
                  </>
                )}
              </NavLink>
            </li>
          )}
          <li>
            <NavLink 
              to="/historial" 
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center gap-4 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-[#21355e] text-white shadow-inner border border-white/5' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#3b5998]' : 'opacity-70'}`}>
                    <History size={18} strokeWidth={2.5} />
                  </div>
                  Historial
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* User Profile Section (Matching Design) */}
      <div className="p-4 border-t border-[#1e345f] bg-[#142340]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#21355e] flex items-center justify-center font-title font-bold text-white shadow-inner shrink-0">
              {user?.name?.substring(0, 1).toUpperCase() || 'J'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate" title={user?.name}>
                {user?.name || 'Julian Solicitante'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.roles?.[0] || 'solicitante'}
              </p>
            </div>
          </div>
          <div className="relative cursor-pointer text-slate-300 hover:text-white transition-colors">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#142340] text-[8px] font-bold text-[#182a4d] flex items-center justify-center">
              9+
            </span>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2 text-slate-300 hover:text-white transition-colors text-sm font-bold"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
