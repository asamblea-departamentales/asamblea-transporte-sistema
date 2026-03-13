// src/layout/Sidebar.tsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import React, { useState, useRef, useEffect } from "react";
import { useNotifications, type Notification, type NotiTipo } from "../notifications/NotificationContext";
import { cn } from "../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props   = { open: boolean; onClose: () => void; onOpen: () => void };
type NavItem = { to: string; label: string; mobileLabel: string; icon: () => React.ReactElement; badge?: number };

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  headerBg:    "linear-gradient(135deg, #0f2548 0%, #1a3a75 100%)",
  bottomNavBg: "linear-gradient(180deg, #163166 0%, #0f2548 100%)",
  goldenLine:  "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.85) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)",
  drawerGlow:  "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.4) 40%, rgba(251,191,36,0.4) 60%, transparent 100%)",
};

// ─── Notification config ──────────────────────────────────────────────────────

const notiCfg: Record<NotiTipo, { dot: string; iconBg: string; iconBorder: string }> = {
  aprobada:     { dot: "bg-emerald-500", iconBg: "bg-emerald-50",  iconBorder: "ring-emerald-200" },
  rechazada:    { dot: "bg-red-500",     iconBg: "bg-red-50",      iconBorder: "ring-red-200"     },
  observada:    { dot: "bg-blue-500",    iconBg: "bg-blue-50",     iconBorder: "ring-blue-200"    },
  finalizada:   { dot: "bg-slate-400",   iconBg: "bg-slate-50",    iconBorder: "ring-slate-200"   },
  recordatorio: { dot: "bg-amber-400",   iconBg: "bg-amber-50",    iconBorder: "ring-amber-200"   },
  info:         { dot: "bg-blue-400",    iconBg: "bg-blue-50",     iconBorder: "ring-blue-200"    },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const avatarDim = {
  sm: "w-8 h-8 text-[12px] rounded-md",
  md: "w-10 h-10 text-[14px] rounded-lg",
  lg: "w-12 h-12 text-[16px] rounded-xl",
};

function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn("flex items-center justify-center font-bold text-white flex-shrink-0", avatarDim[size])}
      style={{
        background: "linear-gradient(135deg, #2354b4 0%, #0f2548 100%)",
        boxShadow: "0 2px 8px rgba(35,84,180,0.35)",
      }}
    >
      {initial}
    </div>
  );
}

// ─── NavLink Desktop (Sidebar Style) ──────────────────────────────────────────

function NavLinkDesktop({ item, pathname }: { item: NavItem; pathname: string }) {
  const { to, label, icon: Icon, badge } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  return (
    <NavLink to={to} end
      className={cn(
        "group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200",
        active
          ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/10"
          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent",
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all",
        active ? "bg-blue-500/20 text-blue-400" : "text-white/30 group-hover:text-white/70"
      )}>
        <Icon />
      </div>
      <span className="tracking-wide">{label}</span>
      {badge && (
        <span className="ml-auto flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-blue-900 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

// ─── NavLink Bottom (Mobile) ──────────────────────────────────────────────────

function NavLinkBottom({ item }: { item: NavItem }) {
  const { to, mobileLabel, icon: Icon } = item;
  return (
    <NavLink to={to} end
      className={({ isActive }) => cn(
        "flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-150",
        isActive ? "text-white bg-white/10" : "text-white/50 hover:text-white/80",
      )}
    >
      <Icon />
      <span className="text-[10px] font-bold uppercase tracking-wider">{mobileLabel}</span>
    </NavLink>
  );
}

// ─── NavLink Drawer (Mobile Sidebar) ──────────────────────────────────────────

function NavLinkDrawer({ item, onClick, pathname }: { item: NavItem; onClick?: () => void; pathname: string }) {
  const { to, label, icon: Icon, badge } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  return (
    <NavLink to={to} end onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150",
        active
          ? "bg-white/15 text-white border border-white/20"
          : "text-white/60 hover:text-white hover:bg-white/10",
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0",
        active ? "bg-white/20 text-white" : "text-white/40",
      )}>
        <Icon />
      </div>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-blue-900">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

// ─── timeAgo ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "Ahora";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

// ─── Notifications Panel ──────────────────────────────────────────────────────

function NotificacionesPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const navigate  = useNavigate();
  const recientes = notifications.slice(0, 10);

  return (
    <div className="w-full max-h-[72vh] flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-dropdown-lg">
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%)", borderBottom: "1px solid #e8f0fe" }}>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-slate-900 tracking-wide">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #1e44be, #0f2548)" }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            <Icons.Check /> Marcar todo
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
        {recientes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 grid place-items-center text-slate-300">
              <Icons.Bell />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Sin notificaciones</p>
              <p className="text-[12px] text-slate-400 mt-0.5">La actividad aparecerá aquí.</p>
            </div>
          </div>
        ) : (
          recientes.map((n: Notification) => {
            const cfg = notiCfg[n.tipo];
            return (
              <button key={n.id} onClick={() => markAsRead(n.id)}
                className={cn("w-full flex gap-3 px-4 py-3 border-l-2 text-left transition-colors hover:bg-slate-50", n.leida ? "opacity-50 border-transparent" : "border-blue-500 bg-blue-50/30")}>
                <div className={cn("w-8 h-8 rounded-lg flex-shrink-0 grid place-items-center ring-1 mt-0.5", cfg.iconBg, cfg.iconBorder)}>
                  <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("text-[13px] leading-snug tracking-wide", n.leida ? "text-slate-600 font-medium" : "text-slate-900 font-bold")}>
                      {n.titulo}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">{n.mensaje}</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="p-2 flex gap-1.5 border-t border-slate-100 bg-slate-50/50">
        <button onClick={() => { onClose(); navigate("/notificaciones"); }}
          className="flex-1 py-2 text-[12px] font-bold text-blue-700 hover:bg-blue-100 rounded-lg transition-colors">
          Ver todas
        </button>
        <button onClick={onClose}
          className="flex-1 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Sidebar({ open, onClose, onOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount }  = useNotifications();

  const [notiOpen, setNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  const initial = (user?.name?.trim()?.[0] || "U").toUpperCase();

  const navItems: NavItem[] = [
    { to: "/dashboard",       label: "Dashboard",       mobileLabel: "Inicio",      icon: Icons.Dashboard },
    { to: "/nueva-solicitud", label: "Nueva solicitud", mobileLabel: "Nueva",       icon: Icons.Plus      },
    { to: "/mis-solicitudes", label: "Mis solicitudes", mobileLabel: "Solicitudes", icon: Icons.List      },
  ];

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    onClose(); setNotiOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const iconBtnClass = (active: boolean) => cn(
    "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all",
    active
      ? "bg-white/20 border border-white/25 text-white"
      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/15 hover:text-white",
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (Permanent Left) ────────────────────────────────── */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 z-50 w-[280px] h-screen flex-col border-r border-[#1a2d54]"
        style={{ background: T.headerBg, boxShadow: "4px 0 30px rgba(15,37,72,0.15)" }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-[2px]" style={{ background: T.goldenLine, opacity: 0.6 }} />

        {/* Brand / Logo Area */}
        <div className="flex flex-col gap-4 px-6 pt-8 pb-6 border-b border-white/5 mx-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
              <img src={logo} alt="Asamblea" className="h-6 brightness-0 invert opacity-90 drop-shadow-sm" />
            </div>
            <div>
              <span className="block text-[9.5px] font-black uppercase tracking-[.18em] text-[#86a8e7] leading-tight">
                Asamblea Legislativa
              </span>
              <span className="block text-[17px] font-extrabold text-white leading-tight mt-0.5">
                Transporte
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 pt-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-[.25em] text-white/30">
            Menú Principal
          </p>
          {navItems.map(item => (
            <NavLinkDesktop key={item.to} item={item} pathname={location.pathname} />
          ))}
        </nav>

        {/* Bottom Section: Profile & Logout */}
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-5 shadow-inner">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar initial={initial} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-white truncate leading-tight tracking-wide">{user?.name || "Usuario"}</p>
                  <p className="text-[11px] font-medium text-[#86a8e7] truncate mt-0.5">
                    {(user as any)?.role || "Administrador"}
                  </p>
                </div>
              </div>
              
              <div ref={notiRef} className="relative flex-shrink-0">
                <button onClick={() => setNotiOpen(v => !v)} className={iconBtnClass(notiOpen)} title="Notificaciones">
                  <Icons.Bell />
                  {unreadCount > 0 && (
                    <span className="absolute -top-[5px] -right-[5px] flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-black text-[#0f2548] bg-amber-400 border-[2px] border-[#0f2548] shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {notiOpen && (
                  <div className="absolute bottom-[52px] -left-2 w-[340px] origin-bottom-left animate-slide-down">
                    <NotificacionesPanel onClose={() => setNotiOpen(false)} />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[12.5px] font-bold tracking-wide text-white/70 hover:text-red-300 bg-white/5 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-200"
            >
              <Icons.Logout /> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ────────────────────────────────────────────────── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-4"
        style={{ background: T.headerBg, boxShadow: "0 2px 10px rgba(15,37,72,0.22)" }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: T.goldenLine }} />

        <button onClick={open ? onClose : onOpen} className="flex items-center justify-center w-10 h-10 rounded-xl text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all" aria-label="Menú">
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-[32px] h-[32px] rounded-lg shadow-sm" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <img src={logo} alt="Logo" className="h-[16px] brightness-0 invert opacity-90" />
          </div>
          <span className="text-[15px] font-extrabold text-white tracking-wide">Transporte</span>
        </button>

        <div ref={notiRef} className="relative">
          <button onClick={() => setNotiOpen(v => !v)} className={iconBtnClass(notiOpen)}>
            <Icons.Bell />
            {unreadCount > 0 && (
              <span className="absolute -top-[5px] -right-[5px] flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-black text-[#0f2548] bg-amber-400 border-[2px] border-[#0f2548]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <div className="fixed top-[68px] right-4 left-4 z-[100] lg:hidden">
            {notiOpen && <div className="animate-slide-down"><NotificacionesPanel onClose={() => setNotiOpen(false)} /></div>}
          </div>
        </div>
      </header>

      {/* ── DRAWER (Mobile) ───────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-[70] w-[280px] h-full flex flex-col border-r lg:hidden",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ background: T.headerBg, borderColor: "rgba(255,255,255,0.08)", boxShadow: open ? "6px 0 32px rgba(15,37,72,0.35)" : "none", transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
      >
        <div className="absolute top-0 right-0 bottom-0 w-[2px]" style={{ background: T.drawerGlow }} />

        <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <img src={logo} alt="Logo" className="h-[22px] brightness-0 invert opacity-90" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#86a8e7] leading-none mb-1">Asamblea</p>
              <p className="text-[15px] font-extrabold text-white leading-none">Transporte</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
            <Avatar initial={initial} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white truncate leading-none mb-1.5">{user?.name || "Usuario"}</p>
              <p className="text-[11px] truncate text-white/50 leading-none">{user?.email || ""}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-[.25em] text-white/30">Navegación</p>
          {navItems.map(item => <NavLinkDrawer key={item.to} item={item} onClick={onClose} pathname={location.pathname} />)}
        </nav>

        <div className="p-4 bg-white/5 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all hover:bg-red-500/20 text-white/60 hover:text-red-300">
            <Icons.Logout /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── BACKDROPS ─────────────────────────────────────────────────────── */}
      {open && <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden" />}
      {notiOpen && <div onClick={() => setNotiOpen(false)} className="lg:hidden fixed inset-0 z-[90] bg-transparent" />}

      {/* ── BOTTOM NAV (Mobile) ───────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2"
        style={{ height: "64px", background: T.bottomNavBg, borderTop: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 -4px 20px rgba(15,37,72,0.28)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.35) 50%, transparent 100%)" }} />
        {navItems.map(item => <NavLinkBottom key={item.to} item={item} />)}
        <button className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all text-white/50" onClick={onOpen}>
          <Icons.User />
          <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
        </button>
      </nav>
    </>
  );
}