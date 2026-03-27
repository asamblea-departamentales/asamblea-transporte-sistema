// src/components/layout/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GlobalLoading } from "../GlobalLoading";
import logo from "../../assets/asamble.png";

// ─── Utils ────────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types & Interfaces ─────────────────────────────────────────────────────────

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export interface NavItem {
  to: string;
  label: string;
  mobileLabel: string;
  icon: React.ElementType;
  badge?: number;
}

// ─── Design tokens (Premium Gradient & PWA Aesthetic) ────────────────────────

const Design = {
  headerBg:    "linear-gradient(135deg, #0f2548 0%, #1a3a75 100%)",
  bottomNavBg: "linear-gradient(180deg, #163166 0%, #0f2548 100%)",
  goldenLine:  "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.85) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)",
  drawerGlow:  "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.4) 40%, rgba(251,191,36,0.4) 60%, transparent 100%)",
  // Fuente secundaria usada para énfasis en la aplicación, complementaria a 'Inter':
  fontJakarta: "font-['Plus_Jakarta_Sans',system-ui,sans-serif]" 
};

// ─── Icons ────────────────────────────────────────────────────────────────────

export const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  List: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M9 6h11M9 12h11M9 18h6" />
      <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M4 7h16M4 12h10M4 17h13" />
    </svg>
  ),
  X: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  initial: string;
  size?: "sm" | "md" | "lg";
}

const avatarDim = {
  sm: "w-8 h-8 text-[12px] rounded-md",
  md: "w-10 h-10 text-[14px] rounded-lg",
  lg: "w-12 h-12 text-[16px] rounded-xl",
};

function Avatar({ initial, size = "md" }: AvatarProps) {
  return (
    <div
      className={cn("flex items-center justify-center font-black text-white flex-shrink-0 shadow-sm border border-white/10", avatarDim[size], Design.fontJakarta)}
      style={{
        background: "linear-gradient(135deg, #2563eb 0%, #0f2548 100%)",
        boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
      }}
    >
      {initial}
    </div>
  );
}

// ─── Nav Links ────────────────────────────────────────────────────────────────

function NavLinkDesktop({ item, pathname }: { item: NavItem; pathname: string }) {
  const { to, label, icon: Icon, badge } = item;
  const active = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <NavLink to={to} end
      className={cn(
        "group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200 shadow-sm",
        Design.fontJakarta,
        active
          ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-t border-white/[0.12] ring-1 ring-white/5"
          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent",
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200",
        active ? "bg-blue-500/15 text-blue-300 shadow-[inset_0_0_8px_rgba(59,130,246,0.2)]" : "text-white/30 group-hover:text-white/70"
      )}>
        <Icon />
      </div>
      <span className="tracking-wide leading-none pt-[1px]">{label}</span>
      {badge && (
        <span className="ml-auto flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-blue-900 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function NavLinkBottom({ item }: { item: NavItem }) {
  const { to, mobileLabel, icon: Icon } = item;
  return (
    <NavLink to={to} end
      className={({ isActive }) => cn(
        "flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-150 relative",
        Design.fontJakarta,
        isActive ? "text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" : "text-white/50 hover:text-white/80",
      )}
    >
      <Icon />
      <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{mobileLabel}</span>
    </NavLink>
  );
}

function NavLinkDrawer({ item, onClick, pathname }: { item: NavItem; onClick: () => void; pathname: string }) {
  const { to, label, icon: Icon, badge } = item;
  const active = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <NavLink to={to} end onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-150",
        Design.fontJakarta,
        active
          ? "bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] shadow-inner"
          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent",
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 flex-shrink-0 transition-colors",
        active ? "text-blue-300 bg-blue-500/10 rounded-lg" : "text-white/40",
      )}>
        <Icon />
      </div>
      <span className="tracking-wide">{label}</span>
      {badge && (
        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-blue-900">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Sidebar({ open, onClose, onOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Derive initials softly
  const initial = typeof user?.name === "string" ? (user.name.trim()[0] || "M").toUpperCase() : "M";

  // Configuration del menú
  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Mis Viajes", mobileLabel: "Viajes", icon: Icons.Dashboard },
  ];

  // Logic Handlers
  const handleLogout = async () => {
    setLoggingOut(true);
    onClose();
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    onClose(); // Cerrar drawer automáticamente al cambiar de ruta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const btnSecondaryClass = cn(
    "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
    "text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
  );

  return (
    <>
      {/* Precargar tipografías necesarias inline para asegurar rendimiento inmediato */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
      `}</style>
      
      {loggingOut && <GlobalLoading message="Cerrando Sesión Segura" isClosing={true} />}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── DESKTOP SIDEBAR (Fijo a la izquierda)                             ── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 z-50 w-[280px] h-screen flex-col border-r border-[#1a3a75]/40"
        style={{ background: Design.headerBg, boxShadow: "4px 0 32px rgba(15,37,72,0.18)" }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-[2px]" style={{ background: Design.goldenLine, opacity: 0.7 }} />

        {/* Brand / Logo Area */}
        <div className="flex flex-col items-center justify-center gap-4 px-5 pt-10 pb-8 relative text-center">
          <img src={logo} alt="Asamblea Logo" className="h-[90px] brightness-0 invert opacity-100 drop-shadow-xl mb-1" />
          <div className={cn("flex flex-col items-center", Design.fontJakarta)}>
            <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#86a8e7] leading-tight mb-0.5">
              Asamblea Legislativa
            </span>
            <span className="block text-[20px] font-extrabold text-white leading-tight tracking-tight">
              Transporte
            </span>
          </div>
        </div>

        {/* Separator sutil */}
        <div className="border-t border-white/10 mx-6 mb-3 opacity-60" />

        {/* Navigation Links */}
        <nav className="flex-1 px-4 pt-4 space-y-1.5 overflow-y-auto no-scrollbar">
          <p className={cn("px-4 pb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40", Design.fontJakarta)}>
            Menú Principal
          </p>
          {navItems.map((item) => (
            <NavLinkDesktop key={item.to} item={item} pathname={location.pathname} />
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="px-6 py-5 pb-8 mt-auto flex flex-col gap-4 bg-black/10 border-t border-white/5 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initial={initial} size="md" />
              <div className={cn("min-w-0 flex-1", Design.fontJakarta)}>
                <p className="text-[13px] font-bold text-white truncate leading-tight tracking-wide">{user?.name || "Motorista"}</p>
                <p className="text-[11px] font-semibold tracking-wide text-[#86a8e7] truncate mt-0.5">
                  {(user as any)?.role || "Perfil de Acceso"}
                </p>
              </div>
            </div>
            
            <button className={btnSecondaryClass} title="Notificaciones del Sistema">
              <Icons.Bell />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-200",
              "text-red-300 hover:text-red-200 hover:bg-white/10 bg-white/5 border border-white/10 shadow-sm",
              Design.fontJakarta
            )}
            title="Desconectarse del sistema"
          >
            <Icons.Logout /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── MOBILE TOP BAR (Barra de encabezado PWA en móvil)                 ── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-3"
        style={{ background: Design.headerBg, boxShadow: "0 2px 12px rgba(15,37,72,0.25)" }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: Design.goldenLine }} />

        <button 
          onClick={open ? onClose : onOpen} 
          className="flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white bg-white/10 active:bg-white/20 transition-all focus:outline-none" 
          aria-label="Abrir Menú"
        >
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 active:scale-95 transition-transform">
          <img src={logo} alt="Asamblea" className="h-[26px] brightness-0 invert drop-shadow" />
          <span className={cn("text-[16px] font-extrabold text-white tracking-wide", Design.fontJakarta)}>Transporte</span>
        </button>

        <button className="flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all focus:outline-none relative">
          <Icons.Bell />
          {/* Badge indicator hipotético */}
          <span className="absolute top-[8px] right-[10px] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] border border-white/20" />
        </button>
      </header>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── DRAWER (Lateral Móvil / Menú Extendido Mobile)                    ── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-[70] w-[280px] h-full flex flex-col border-r lg:hidden outline-none",
          "transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ background: Design.headerBg, borderColor: "rgba(255,255,255,0.06)", boxShadow: open ? "6px 0 36px rgba(15,37,72,0.45)" : "none" }}
      >
        {/* Adorno dorado suave a la derecha del drawer */}
        <div className="absolute top-0 right-0 bottom-0 w-[2px]" style={{ background: Design.drawerGlow }} />

        <div className="p-5 border-b border-white/[0.08] relative">
          <div className="flex flex-col items-center gap-2 mb-6 pt-4 text-center">
             <img src={logo} alt="Asamblea Logo" className="h-[60px] brightness-0 invert drop-shadow-lg mb-1" />
             <div className={cn("flex flex-col justify-center", Design.fontJakarta)}>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86a8e7] leading-none mb-1">Asamblea</p>
               <p className="text-[16px] font-extrabold text-white leading-none tracking-tight">Transporte Web</p>
             </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner">
            <Avatar initial={initial} size="md" />
            <div className={cn("min-w-0 flex-1", Design.fontJakarta)}>
              <p className="text-[13px] font-bold text-white truncate leading-none mb-1.5">{user?.name || "Motorista"}</p>
              <p className="text-[11px] font-medium text-white/60 truncate leading-none">{user?.email || "motorista@asamblea.gob.sv"}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.7)] border border-emerald-200" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 no-scrollbar">
          <p className={cn("px-4 pb-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/40", Design.fontJakarta)}>Navegación Móvil</p>
          {navItems.map((item) => (
            <NavLinkDrawer key={item.to} item={item} onClick={onClose} pathname={location.pathname} />
          ))}
        </nav>

        <div className="p-4 bg-white/5 border-t border-white/10">
          <button onClick={handleLogout} className={cn(
            "w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-[13.5px] font-bold transition-all duration-200",
            "hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-transparent hover:border-red-500/30",
            Design.fontJakarta
          )}>
            <Icons.Logout /> Cerrar Sesión Exit
          </button>
        </div>
      </aside>

      {/* Overlay oscuro móvil cuando Drawer está abierto */}
      {open && (
        <div 
           onClick={onClose} 
           className="fixed inset-0 z-[60] bg-[#0f172a]/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden"
           aria-hidden="true" 
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── BOTTOM NAV (Pestañas nativas inferiores flotantes)                ── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2"
        style={{ 
           height: "64px", 
           background: Design.bottomNavBg, 
           borderTop: "1px solid rgba(255,255,255,0.06)", 
           boxShadow: "0 -4px 24px rgba(15,37,72,0.35)", 
           paddingBottom: "env(safe-area-inset-bottom, 0px)" // Soporte iPhone Notch
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.35) 50%, transparent 100%)" }} />
        {navItems.map((item) => <NavLinkBottom key={item.to} item={item} />)}
        
        {/* Simulamos un botón de Perfil en la barra para más ergonomia */}
        <button 
           className={cn("flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all text-white/50 hover:text-white/80 active:scale-95", Design.fontJakarta)} 
           onClick={onOpen}
        >
          <Icons.User />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Config</span>
        </button>
      </nav>
    </>
  );
}
