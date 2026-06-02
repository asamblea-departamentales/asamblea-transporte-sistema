import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileCheck, History, LogOut } from 'lucide-react';
import { useAuth } from '../../features/Auth/context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-[260px] bg-[#182645] text-white fixed h-screen left-0 top-0 flex flex-col shadow-xl z-20">
      {/* Logo Section */}
      <div className="p-6 pb-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-3 overflow-hidden p-2">
          {/* Aquí el usuario colocará su logo en la carpeta public/logo.png */}
          <img 
            src="/logo.png" 
            alt="Logo Empresa" 
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback visual si no encuentra la imagen
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('fallback-icon');
            }}
          />
          <style>{`.fallback-icon::after { content: '🏢'; font-size: 24px; }`}</style>
        </div>
        <h2 className="font-title font-extrabold text-[15px] tracking-widest text-white text-center leading-tight">
          ASAMBLEA LEGISLATIVA<br />
          <span className="text-xs font-medium text-slate-300 tracking-normal">Transporte</span>
        </h2>
      </div>

      <div className="px-6 mb-2">
        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Menú Principal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="flex flex-col gap-1.5">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive 
                    ? 'bg-[#2a3c6b] text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/aprobaciones" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive 
                    ? 'bg-[#2a3c6b] text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <FileCheck size={18} /> Por Aprobar
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/historial" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive 
                    ? 'bg-[#2a3c6b] text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <History size={18} /> Historial
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/10 mt-auto flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#859BFF] to-[#5b75f0] flex items-center justify-center font-title font-bold text-white shadow-lg shrink-0">
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-white truncate" title={user?.name}>
              {user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.roles?.[0] || 'Aprobador'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium border border-white/10"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
