import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { GlobalLoading } from "../GlobalLoading";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Mis Viajes", icon: <CalendarIcon /> },
  { to: "/incapacidad", label: "Reportar Incapacidad", icon: <HealthIcon /> },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "M";

  return (
    <>
      {loggingOut && <GlobalLoading message="Cerrando Sesión Segura" isClosing />}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#0f2548] shadow-xl shadow-slate-900/30">
        
        {/* Logo / Cabecera */}
        <div className="px-6 pt-10 pb-8 flex flex-col items-center">
          <div className="w-[100px] h-[60px] mb-4 relative flex items-center justify-center">
            {/* Mock de arco de asamblea */}
            <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full" fill="none" stroke="currentColor">
              <path d="M 10 50 A 40 40 0 0 1 90 50" strokeWidth="2" strokeDasharray="3 4" stroke="white" opacity="0.8" />
              <path d="M 20 50 A 30 30 0 0 1 80 50" strokeWidth="2" strokeDasharray="2 3" stroke="white" opacity="0.6" />
              <path d="M 30 50 A 20 20 0 0 1 70 50" strokeWidth="2" strokeDasharray="1 2" stroke="white" opacity="0.4" />
            </svg>
            <span className="text-[6px] text-white absolute bottom-1 text-center font-bold tracking-widest break-words leading-tight shadow-sm">
              ASAMBLEA<br/>LEGISLATIVA
            </span>
          </div>
          <div className="text-center mt-2">
            <h2 className="text-[10px] font-black tracking-[0.2em] text-blue-200/80 uppercase">
              Asamblea Legislativa
            </h2>
            <h1 className="text-lg font-bold text-white tracking-widest mt-0.5">
              Transporte
            </h1>
          </div>
        </div>

        {/* Navegación Título */}
        <div className="px-8 mb-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-blue-300/50">
            Menú Principal
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner border border-white/5"
                    : "text-blue-200/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Perfil (Fondo inferior) */}
        <div className="mt-auto bg-black/10 border-t border-white/5 p-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg border border-white/10">
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white font-bold text-sm leading-tight truncate">{user?.name}</p>
              <p className="text-blue-300/80 text-[11px] truncate uppercase font-semibold mt-0.5">{(user as any)?.role || "Motorista"}</p>
            </div>
            <button className="text-blue-300 hover:text-white transition flex-shrink-0 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
          
          <div className="px-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-blue-200/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <LogoutIcon />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f2548] border-t border-white/10 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all ${
                isActive ? "text-white" : "text-blue-300"
              }`
            }
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold text-red-300"
        >
          <LogoutIcon />
          <span className="text-[10px]">Salir</span>
        </button>
      </nav>
    </>
  );
}
