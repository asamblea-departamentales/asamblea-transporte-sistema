import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

function NavItem({
  to,
  label,
  icon,
  onNavigateMobile,
  forceActive,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  onNavigateMobile: () => void;
  forceActive?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigateMobile}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-2.5 rounded-2xl px-5 py-2.5 font-semibold transition-all duration-300",
          (forceActive ?? false) || isActive
            ? "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white shadow-xl shadow-blue-500/30"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative z-10 flex items-center gap-2.5">
            <span className={[
              "grid h-9 w-9 place-items-center rounded-xl transition-all duration-300",
              (forceActive ?? false) || isActive 
                ? "bg-white/20 text-white backdrop-blur-sm" 
                : "bg-white text-slate-600 shadow-sm"
            ].join(" ")}>
              {icon}
            </span>
            <span className="text-[15px]">{label}</span>
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const onNavigateMobile = () => onClose();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isNewRequestActive =
    location.pathname === "/nueva-solicitud" ||
    location.pathname.startsWith("/solicitudes/");

  return (
    <>
      {/* Overlay móvil */}
      <div
        className={[
          "fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Top Navbar - Horizontal */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-2xl shadow-sm">
        <div className="mx-auto max-w-[1800px]">
          <div className="flex h-20 items-center justify-between gap-6 px-6 lg:px-10">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-5">
              {/* Mobile Menu Button */}
              <button
                onClick={() => onClose()}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 shadow-sm transition-all hover:shadow-md lg:hidden"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-2 shadow-sm">
                  <img
                    src={logo}
                    alt="Asamblea Legislativa"
                    className="h-11 w-auto object-contain"
                  />
                </div>
                
                <div className="hidden border-l-2 border-slate-200 pl-4 md:block">
                  <p className="font-extrabold text-[11px] uppercase tracking-[0.15em] text-blue-600">
                    Sistema de
                  </p>
                  <p className="font-black text-[17px] tracking-tight text-slate-900 leading-tight">
                    Transporte
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:block flex-1">
              <div className="flex items-center justify-center gap-2">
                <NavItem
                  to="/dashboard"
                  label="Inicio"
                  onNavigateMobile={onNavigateMobile}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"/>
                    </svg>
                  }
                />

                <NavItem
                  to="/nueva-solicitud"
                  label="Nueva Solicitud"
                  onNavigateMobile={onNavigateMobile}
                  forceActive={isNewRequestActive}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  }
                />

                <NavItem
                  to="/mis-solicitudes"
                  label="Mis Solicitudes"
                  onNavigateMobile={onNavigateMobile}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M7 7h10M7 12h10M7 17h10"/>
                    </svg>
                  }
                />
              </div>
            </nav>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 p-2 pr-4 shadow-md ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-xl hover:ring-slate-300/80"
              >
                {/* Avatar */}
                <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-lg shadow-blue-500/30">
                  <div className="absolute inset-0 flex items-center justify-center font-black text-[16px] text-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>

                {/* User Info */}
                <div className="hidden min-w-0 text-left sm:block">
                  {user?.name && (
                    <p className="truncate font-bold text-[14px] text-slate-900">
                      {user.name}
                    </p>
                  )}
                  {user?.email && (
                    <p className="truncate font-semibold text-[12px] text-slate-500">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Chevron */}
                <svg 
                  className={[
                    "h-4 w-4 text-slate-400 transition-all duration-300",
                    showUserMenu ? "rotate-180" : ""
                  ].join(" ")}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={[
                  "absolute right-0 top-full mt-3 w-72 origin-top-right overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-300",
                  showUserMenu
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-95 opacity-0",
                ].join(" ")}
              >
                {/* User Info Section */}
                <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-xl shadow-blue-500/30">
                      <div className="flex h-full items-center justify-center font-black text-[20px] text-white">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      {user?.name && (
                        <p className="truncate font-bold text-[15px] text-slate-900">
                          {user.name}
                        </p>
                      )}
                      {user?.email && (
                        <p className="truncate font-semibold text-[13px] text-slate-600">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="p-3">
                  <button
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-3 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 px-4 py-3.5 font-bold text-[14px] text-red-600 shadow-sm transition-all hover:shadow-lg hover:shadow-red-500/20"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm transition-all group-hover:shadow-md">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 7l-5 5 5 5"/>
                        <path strokeLinecap="round" d="M5 12h12"/>
                        <path strokeLinecap="round" d="M17 21h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-2"/>
                      </svg>
                    </span>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <aside
        className={[
          "fixed left-0 top-0 z-50 h-full w-80 bg-white shadow-2xl",
          "transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Header */}
          <div className="border-b border-slate-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 shadow-md">
                  <img
                    src={logo}
                    alt="Asamblea Legislativa"
                    className="h-11 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="font-extrabold text-[11px] uppercase tracking-[0.15em] text-blue-600">
                    Sistema de
                  </p>
                  <p className="font-black text-[16px] tracking-tight text-slate-900 leading-tight">
                    Transporte
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-700 shadow-md transition-all hover:shadow-lg"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-2">
              <NavItem
                to="/dashboard"
                label="Inicio"
                onNavigateMobile={onNavigateMobile}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"/>
                  </svg>
                }
              />

              <NavItem
                to="/nueva-solicitud"
                label="Nueva Solicitud"
                onNavigateMobile={onNavigateMobile}
                forceActive={isNewRequestActive}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                }
              />

              <NavItem
                to="/mis-solicitudes"
                label="Mis Solicitudes"
                onNavigateMobile={onNavigateMobile}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 7h10M7 12h10M7 17h10"/>
                  </svg>
                }
              />
            </div>
          </nav>

          {/* Mobile Footer */}
          <div className="border-t border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-md">
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <div className="flex h-full items-center justify-center font-black text-[18px] text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                {user?.name && (
                  <p className="truncate font-bold text-[14px] text-slate-900">
                    {user.name}
                  </p>
                )}
                {user?.email && (
                  <p className="truncate font-semibold text-[12px] text-slate-500">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 px-4 py-4 font-bold text-[14px] text-red-600 shadow-md transition-all hover:shadow-xl hover:shadow-red-500/20"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 7l-5 5 5 5"/>
                  <path strokeLinecap="round" d="M5 12h12"/>
                  <path strokeLinecap="round" d="M17 21h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-2"/>
                </svg>
              </span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: -0.01em;
        }
      `}</style>
    </>
  );
}