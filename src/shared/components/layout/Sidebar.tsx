import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { useNotification } from "../../../shared/contexts/NotificationContext";
import { getDisponibilidad } from "../../../disponibilidad/disponibilidad.service";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GlobalLoading } from "../../../shared/components/GlobalLoading";
import logo from "../../../shared/assets/asamble.png";

// ─── Utils ────────────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}// 

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

// ─── Design tokens ──────────────────────────────────────────────────────────────
const Design = {
  headerBg: "linear-gradient(135deg, #0f2548 0%, #1a3a75 100%)",
  bottomNavBg: "linear-gradient(180deg, #163166 0%, #0f2548 100%)",
  goldenLine: "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.85) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)",
  drawerGlow: "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.4) 40%, rgba(251,191,36,0.4) 60%, transparent 100%)",
  fontJakarta: "font-['Plus_Jakarta_Sans',system-ui,sans-serif]"
};

// ─── Icons ────────────────────────────────────────────────────────────────────
export const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  List: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M9 6h11M9 12h11M9 18h6" /><circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" /></svg>,
  Menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4 7h16M4 12h10M4 17h13" /></svg>,
  X: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
  UploadContent: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  RouteActive: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const avatarDim = { sm: "w-8 h-8 text-[12px] rounded-md", md: "w-10 h-10 text-[14px] rounded-lg", lg: "w-12 h-12 text-[16px] rounded-xl" };
  return (
    <div className={cn("flex items-center justify-center font-black text-white flex-shrink-0 shadow-sm border border-white/10", avatarDim[size], Design.fontJakarta)}
      style={{ background: "linear-gradient(135deg, #2563eb 0%, #0f2548 100%)", boxShadow: "0 2px 8px rgba(37,99,235,0.35)" }}>
      {initial}
    </div>
  );
}

// ─── Nav Links ────────────────────────────────────────────────────────────────
function NavLinkDesktop({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
  return (
    <NavLink to={item.to} end className={cn("group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200 shadow-sm", Design.fontJakarta, active ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-t border-white/[0.12] ring-1 ring-white/5" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent")}>
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200", active ? "bg-blue-500/15 text-blue-300 shadow-[inset_0_0_8px_rgba(59,130,246,0.2)]" : "text-white/30 group-hover:text-white/70")}><item.icon /></div>
      <span className="tracking-wide leading-none pt-[1px]">{item.label}</span>
    </NavLink>
  );
}

function NavLinkBottom({ item }: { item: NavItem }) {
  return (
    <NavLink to={item.to} end className={({ isActive }) => cn("flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-150 relative", Design.fontJakarta, isActive ? "text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" : "text-white/50 hover:text-white/80")}>
      <item.icon />
      <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{item.mobileLabel}</span>
    </NavLink>
  );
}

function NavLinkDrawer({ item, onClick, pathname }: { item: NavItem; onClick: () => void; pathname: string }) {
  const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
  return (
    <NavLink to={item.to} end onClick={onClick} className={cn("flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-150", Design.fontJakarta, active ? "bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] shadow-inner" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent")}>
      <div className={cn("flex items-center justify-center w-8 h-8 flex-shrink-0 transition-colors", active ? "text-blue-300 bg-blue-500/10 rounded-lg" : "text-white/40")}><item.icon /></div>
      <span className="tracking-wide">{item.label}</span>
    </NavLink>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Sidebar({ open, onClose, onOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { permission, requestPermission, notifications, markAsRead, unreadCount } = useNotification();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Estados de Disponibilidad Globales
  const [activo, setActivo] = useState<boolean | null>(null);
  
  // Buscar si hay algún viaje activo guardado en LocalStorage
  const [viajeActivoId, setViajeActivoId] = useState<string | null>(null);

  useEffect(() => {
    const keys = Object.keys(localStorage);
    const activeKey = keys.find(k => k.startsWith("viaje_fase_"));
    if (activeKey) {
      const id = activeKey.replace("viaje_fase_", "");
      setViajeActivoId(id);
    } else {
      setViajeActivoId(null);
    }
  }, [location.pathname]);

  // Inicializar estado del motorista
  useEffect(() => {
    getDisponibilidad()
      .then((d) => setActivo(d.activo))
      .catch((_) => setActivo(null));
  }, [location.pathname]); // Refrescar cuando cambie de ruta

  // Logic Handlers
  const handleBellClick = () => {
    setShowNotifications(true);
    if (permission === 'default') {
      requestPermission();
    }
  };

  const initial = typeof user?.name === "string" ? (user.name.trim()[0] || "M").toUpperCase() : "M";

  const navItems = useMemo((): NavItem[] => {
    const baseItems: NavItem[] = [
      { to: "/dashboard", label: "Panel Principal", mobileLabel: "Panel", icon: Icons.Dashboard },
    ];
    if (viajeActivoId) {
      baseItems.push({
        to: `/viajes/${viajeActivoId}/activo`,
        label: "Ruta Activa 🚗",
        mobileLabel: "Ruta",
        icon: Icons.RouteActive
      });
    }
    baseItems.push(
      { to: "/historial", label: "Historial Viajes", mobileLabel: "Historial", icon: Icons.List },
      { to: "/incapacidad", label: "Disponibilidad", mobileLabel: "Estatus", icon: Icons.Alert }
    );
    return baseItems;
  }, [viajeActivoId]);

  const handleLogout = async () => {
    setLoggingOut(true);
    onClose();
    try { await logout(); } catch { } finally { navigate("/login", { replace: true }); }
  };

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const btnSecondaryClass = cn(
    "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
    "text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
      `}</style>

      {loggingOut && <GlobalLoading message="Cerrando Sesión Segura" isClosing={true} />}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-50 w-[280px] h-screen flex-col border-r border-[#1a3a75]/40" style={{ background: Design.headerBg, boxShadow: "4px 0 32px rgba(15,37,72,0.18)" }}>
        <div className="absolute right-0 top-0 bottom-0 w-[2px]" style={{ background: Design.goldenLine, opacity: 0.7 }} />

        <div className="flex flex-col items-center justify-center gap-4 px-5 pt-10 pb-8 relative text-center">
          <img src={logo} alt="Asamblea Logo" className="h-[90px] brightness-0 invert opacity-100 drop-shadow-xl mb-1" />
          <div className={cn("flex flex-col items-center", Design.fontJakarta)}>
            <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#86a8e7] leading-tight mb-0.5">Asamblea Legislativa</span>
            <span className="block text-[20px] font-extrabold text-white leading-tight tracking-tight">Transporte</span>
          </div>
        </div>

        <div className="border-t border-white/10 mx-6 mb-3 opacity-60" />

        <nav className="flex-1 px-4 pt-4 space-y-1.5 overflow-y-auto no-scrollbar">
          <p className={cn("px-4 pb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40", Design.fontJakarta)}>Menú Principal</p>
          {navItems.map((item) => <NavLinkDesktop key={item.to} item={item} pathname={location.pathname} />)}
        </nav>



        <div className="px-6 py-5 pb-8 mt-4 flex flex-col gap-4 bg-black/10 border-t border-white/5 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initial={initial} size="md" />
              <div className={cn("min-w-0 flex-1", Design.fontJakarta)}>
                <p className="text-[13px] font-bold text-white truncate leading-tight tracking-wide">{user?.name || "Motorista"}</p>
                <p className="text-[11px] font-semibold tracking-wide text-[#86a8e7] truncate mt-0.5">{(user as any)?.role || "Perfil de Acceso"}</p>
              </div>
            </div>
            <button onClick={handleBellClick} className={btnSecondaryClass} title="Notificaciones del Sistema">
              <Icons.Bell />
              {unreadCount > 0 && <span className="absolute top-[8px] right-[10px] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] border border-white/20 animate-pulse" title="Notificaciones nuevas" />}
              {permission === 'default' && unreadCount === 0 && <span className="absolute top-[8px] right-[10px] w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] border border-white/20" title="Requiere permisos" />}
            </button>
          </div>
          <button onClick={handleLogout} className={cn("w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-200 text-red-300 hover:text-red-200 hover:bg-white/10 bg-white/5 border border-white/10 shadow-sm", Design.fontJakarta)} title="Desconectarse del sistema"><Icons.Logout /> Cerrar Sesión</button>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── MOBILE TOP BAR ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-3" style={{ background: Design.headerBg, boxShadow: "0 2px 12px rgba(15,37,72,0.25)" }}>
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: Design.goldenLine }} />
        <button onClick={open ? onClose : onOpen} className="flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white bg-white/10 active:bg-white/20 transition-all focus:outline-none" aria-label="Abrir Menú">
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 active:scale-95 transition-transform">
          <img src={logo} alt="Asamblea" className="h-[26px] brightness-0 invert drop-shadow" />
          <span className={cn("text-[16px] font-extrabold text-white tracking-wide", Design.fontJakarta)}>Transporte</span>
        </button>
        <button onClick={handleBellClick} className="flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all focus:outline-none relative">
          <Icons.Bell />
          {unreadCount > 0 && <span className="absolute top-[8px] right-[10px] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] border border-white/20 animate-pulse" />}
          {permission === 'default' && unreadCount === 0 && <span className="absolute top-[8px] right-[10px] w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] border border-white/20" />}
        </button>
      </header>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── DRAWER (Móvil) ── */}
      <aside className={cn("fixed top-0 left-0 z-[70] w-[280px] h-full flex flex-col border-r lg:hidden outline-none transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]", open ? "translate-x-0" : "-translate-x-full")} style={{ background: Design.headerBg, borderColor: "rgba(255,255,255,0.06)", boxShadow: open ? "6px 0 36px rgba(15,37,72,0.45)" : "none" }}>
        <div className="absolute top-0 right-0 bottom-0 w-[2px]" style={{ background: Design.drawerGlow }} />
        <div className="p-5 border-b border-white/[0.08] relative">
          <div className="flex flex-col items-center gap-2 mb-6 pt-4 text-center">
            <img src={logo} alt="Asamblea Logo" className="h-[60px] brightness-0 invert drop-shadow-lg mb-1" />
            <div className={cn("flex flex-col justify-center", Design.fontJakarta)}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86a8e7] leading-none mb-1">Asamblea</p>
              <p className="text-[16px] font-extrabold text-white leading-none tracking-tight">Transporte Web</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner mb-4">
            <Avatar initial={initial} size="md" />
            <div className={cn("min-w-0 flex-1", Design.fontJakarta)}>
              <p className="text-[13px] font-bold text-white truncate leading-none mb-1.5">{user?.name || "Motorista"}</p>
              <p className="text-[11px] font-medium text-white/60 truncate leading-none">{user?.email || "motorista@asamblea.gob.sv"}</p>
            </div>
            {activo !== null && <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 border ${activo ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-red-400 border-red-200 shadow-[0_0_8px_rgba(248,113,113,0.7)]'}`} />}
          </div>



        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 no-scrollbar">
          <p className={cn("px-4 pb-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/40", Design.fontJakarta)}>Navegación Móvil</p>
          {navItems.map((item) => <NavLinkDrawer key={item.to} item={item} onClick={onClose} pathname={location.pathname} />)}
        </nav>
        <div className="p-4 bg-white/5 border-t border-white/10">
          <button onClick={handleLogout} className={cn("w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-[13.5px] font-bold transition-all duration-200 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-transparent hover:border-red-500/30", Design.fontJakarta)}><Icons.Logout /> Cerrar Sesión Exit</button>
        </div>
      </aside>

      {open && <div onClick={onClose} className="fixed inset-0 z-[60] bg-[#0f172a]/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden" aria-hidden="true" />}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── NOTIFICATIONS DRAWER ── */}
      <aside className={cn("fixed top-0 right-0 z-[80] w-full sm:w-[320px] h-full bg-white flex flex-col border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]", showNotifications ? "translate-x-0" : "translate-x-full")} style={{ fontFamily: Design.fontJakarta }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Icons.Bell />
             </div>
             <h2 className="text-[16px] font-extrabold text-slate-800 tracking-tight">Notificaciones</h2>
          </div>
          <button onClick={() => setShowNotifications(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-500 transition-colors">
            <Icons.X />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2 bg-slate-50/30">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
               <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-slate-400 mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
               <p className="text-[14px] font-bold text-slate-600">Nada por aquí</p>
               <p className="text-[13px] text-slate-400 mt-1 leading-tight">Te avisaremos cuando tengas asignaciones nuevas.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} onClick={() => markAsRead(notif.id)} className={cn("p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden", notif.read ? "bg-white border-slate-100" : "bg-blue-50/50 border-blue-100 shadow-sm")}>
                 {!notif.read && <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-500" />}
                 <div className="flex justify-between items-start gap-2 mb-1.5 pl-1">
                   <h4 className={cn("text-[13.5px] font-bold leading-tight", notif.read ? "text-slate-700" : "text-blue-900")}>{notif.title}</h4>
                   <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase shrink-0 mt-0.5">
                      {notif.date.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </div>
                 <p className={cn("text-[13px] leading-relaxed pl-1", notif.read ? "text-slate-500" : "text-slate-600")}>{notif.body}</p>
              </div>
            ))
          )}
        </div>
      </aside>
      
      {showNotifications && <div onClick={() => setShowNotifications(false)} className="fixed inset-0 z-[75] bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300" aria-hidden="true" />}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2" style={{ height: "64px", background: Design.bottomNavBg, borderTop: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 -4px 24px rgba(15,37,72,0.35)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.35) 50%, transparent 100%)" }} />
        {navItems.map((item) => <NavLinkBottom key={item.to} item={item} />)}
        <button className={cn("flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all text-white/50 hover:text-white/80 active:scale-95", Design.fontJakarta)} onClick={onOpen}>
          <Icons.User />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Menu</span>
        </button>
      </nav>

    </>
  );
}
