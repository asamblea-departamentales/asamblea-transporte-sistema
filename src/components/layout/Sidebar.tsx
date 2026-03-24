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
        {/* Franja superior */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600" />

        {/* Perfil */}
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/30 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight truncate">{user?.name}</p>
              <p className="text-blue-300 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-all"
          >
            <LogoutIcon />
            Cerrar Sesión
          </button>
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
