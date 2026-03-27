// src/components/layout/Sidebar.tsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GlobalLoading } from "../GlobalLoading";
import logo from "../../assets/asamble.png";

// Utils
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Icons
export const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  MenuToggle: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

export type NavItem = {
  to: string;
  label: string;
  icon: () => React.ReactElement;
  badge?: number;
};

export type SidebarProps = {
  items: NavItem[];
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({ items, collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const initial = (user?.name?.trim()?.[0] || "M").toUpperCase();

  return (
    <>
      <style>{`
        /* Import Plus Jakarta Sans for internal use if needed */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
      `}</style>
      {loggingOut && <GlobalLoading message="Cerrando Sesión Segura" isClosing={true} />}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen flex flex-col bg-[#0f2548] text-slate-200 transition-all duration-300 ease-in-out border-r border-white/5 shadow-2xl overflow-y-auto no-scrollbar",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top Header / Logo Area */}
        <div className={cn("flex items-center px-5 py-6", collapsed ? "justify-center" : "justify-between")}>
          <div className={cn("flex items-center overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-full opacity-100")}>
            <img src={logo} alt="Logo" className="h-8 brightness-0 invert mr-3 shrink-0" />
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#86a8e7] font-black leading-none mb-1">Asamblea</span>
              <span className="text-[15px] font-extrabold text-white leading-none">Transporte</span>
            </div>
          </div>
          {/* Menu Toggle */}
          <button 
            onClick={onToggle}
            className={cn(
              "p-1.5 flex items-center justify-center shrink-0 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors",
            )}
            title="Contraer/Expandir"
          >
            <Icons.MenuToggle />
          </button>
        </div>

        {/* Separator */}
        <div className="border-t border-white/10 mx-4 mb-4" />

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => cn(
                "group relative flex items-center py-3 rounded-xl transition-all duration-200",
                collapsed ? "justify-center px-0 mx-1" : "px-4",
                isActive 
                  ? "bg-white/10 border-l-[3px] border-white text-white font-medium shadow-sm" 
                  : "text-slate-300 border-l-[3px] border-transparent hover:bg-white/5 hover:text-white font-medium"
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Tooltip on collapse */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs whitespace-nowrap rounded font-medium shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-slate-700 pointer-events-none">
                      {item.label}
                    </div>
                  )}

                  <div className={cn("flex shrink-0 transition-opacity", collapsed ? "" : "mr-3 w-5", isActive ? "opacity-100 text-white" : "opacity-70 group-hover:opacity-100 text-slate-300 group-hover:text-white")}>
                    <item.icon />
                  </div>
                  
                  {!collapsed && (
                    <span 
                      className="whitespace-nowrap flex-1 truncate font-medium text-[14px]"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {item.label}
                    </span>
                  )}

                  {!collapsed && item.badge && (
                    <span className="ml-auto flex items-center justify-center px-1.5 min-w-[20px] h-[20px] rounded bg-white/20 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/10 p-3 flex flex-col gap-2 mt-auto bg-black/10">
          {!collapsed && (
            <div className="flex items-center px-2 pt-2 pb-3 truncate">
               <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[13px] font-bold text-white shadow-lg border border-white/10"
                    style={{ background: "linear-gradient(135deg, #2354b4 0%, #0f2548 100%)" }}>
                 {initial}
               </div>
               <div className="ml-3 truncate">
                 <p className="text-[13px] font-bold text-white truncate leading-tight tracking-wide">{user?.name || "Motorista"}</p>
                 <p className="text-[11px] font-medium text-[#86a8e7] mt-0.5 truncate">
                    {(user as any)?.role || "Motorista"}
                 </p>
               </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
            className={cn(
              "group relative flex items-center py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200",
              collapsed ? "justify-center px-0 mx-1" : "px-3"
            )}
           >
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs whitespace-nowrap rounded font-medium shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-slate-700 pointer-events-none">
                Cerrar sesión
              </div>
            )}
            <div className={cn("flex shrink-0 transition-opacity", collapsed ? "" : "mr-3", "opacity-70 group-hover:opacity-100 text-red-400 group-hover:text-red-300")}>
               <Icons.Logout />
            </div>
            {!collapsed && <span className="font-semibold text-[13.5px] whitespace-nowrap text-red-400 group-hover:text-red-300">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
