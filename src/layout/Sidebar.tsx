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
// Un solo lugar para cambiar el esquema de color completo del nav

const T = {
  headerBg:    "linear-gradient(135deg, #0f2548 0%, #1a3a75 100%)",
  bottomNavBg: "linear-gradient(180deg, #163166 0%, #0f2548 100%)",
  goldenLine:  "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.55) 30%, rgba(251,191,36,0.85) 50%, rgba(251,191,36,0.55) 70%, transparent 100%)",
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
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Plus: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
    </svg>
  ),
  List: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M9 6h11M9 12h11M9 18h6" />
      <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  Menu: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M4 7h16M4 12h10M4 17h13" />
    </svg>
  ),
  X: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  Bell: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  ChevronDown: ({ open }: { open: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      className="transition-transform duration-200"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  ),
  User: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const avatarDim = {
  sm: "w-7 h-7 text-[11px] rounded-md",
  md: "w-9 h-9 text-[13px] rounded-lg",
  lg: "w-11 h-11 text-[16px] rounded-xl",
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

// ─── NavLink Desktop ──────────────────────────────────────────────────────────

function NavLinkDesktop({ item, pathname }: { item: NavItem; pathname: string }) {
  const { to, label, icon: Icon, badge } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  return (
    <NavLink to={to} end
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150",
        active
          ? "bg-white/15 text-white border border-white/20"
          : "text-white/60 hover:text-white hover:bg-white/10",
      )}
    >
      <Icon />
      {label}
      {badge && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-blue-900">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

// ─── NavLink Bottom ───────────────────────────────────────────────────────────

function NavLinkBottom({ item }: { item: NavItem }) {
  const { to, mobileLabel, icon: Icon } = item;
  return (
    <NavLink to={to} end
      className={({ isActive }) => cn(
        "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-150",
        isActive ? "text-white bg-white/12" : "text-white/50 hover:text-white/80",
      )}
    >
      <Icon />
      <span className="text-[9.5px] font-bold uppercase tracking-wider">{mobileLabel}</span>
    </NavLink>
  );
}

// ─── NavLink Drawer ───────────────────────────────────────────────────────────

function NavLinkDrawer({ item, onClick, pathname }: { item: NavItem; onClick?: () => void; pathname: string }) {
  const { to, label, icon: Icon, badge } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  return (
    <NavLink to={to} end onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150",
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
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
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
    <div className="w-full max-h-[72vh] flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,37,72,0.13),0_4px_12px_rgba(15,37,72,0.06)]">

      {/* Header panel */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%)", borderBottom: "1px solid #e8f0fe" }}>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-slate-900">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #1e44be, #0f2548)" }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 hover:text-blue-900 transition-colors">
            <Icons.Check /> Marcar todo
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
        {recientes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 grid place-items-center text-slate-300">
              <Icons.Bell />
            </div>
            <p className="text-sm font-semibold text-slate-500">Sin notificaciones</p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[20ch]">
              La actividad de tus solicitudes aparecerá aquí.
            </p>
          </div>
        ) : (
          recientes.map((n: Notification) => {
            const cfg = notiCfg[n.tipo];
            return (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "w-full flex gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50",
                  n.leida && "opacity-50",
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex-shrink-0 grid place-items-center ring-1 mt-0.5", cfg.iconBg, cfg.iconBorder)}>
                  <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <span className={cn("text-[12px] leading-snug", n.leida ? "text-slate-500 font-medium" : "text-slate-900 font-semibold")}>
                      {n.titulo}
                    </span>
                    {!n.leida && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{n.mensaje}</p>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1 block">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer panel */}
      <div className="p-2 flex gap-1.5 border-t border-slate-100">
        <button
          onClick={() => { onClose(); navigate("/notificaciones"); }}
          className="flex-1 py-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Ver todas
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 text-[11px] font-semibold text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
        >
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

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notiOpen,     setNotiOpen]     = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  const initial = (user?.name?.trim()?.[0] || "U").toUpperCase();

  const navItems: NavItem[] = [
    { to: "/dashboard",       label: "Dashboard",       mobileLabel: "Inicio",      icon: Icons.Dashboard },
    { to: "/nueva-solicitud", label: "Nueva solicitud", mobileLabel: "Nueva",       icon: Icons.Plus      },
    { to: "/mis-solicitudes", label: "Mis solicitudes", mobileLabel: "Solicitudes", icon: Icons.List      },
  ];

  const handleLogout = async () => {
    onClose(); setUserMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    onClose(); setUserMenuOpen(false); setNotiOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const iconBtnClass = (active: boolean) => cn(
    "relative flex items-center justify-center w-9 h-9 rounded-lg transition-all",
    active
      ? "bg-white/20 border border-white/25 text-white"
      : "bg-white/10 border border-white/12 text-white/65 hover:bg-white/18 hover:text-white",
  );

  return (
    <>
      {/* ── DESKTOP HEADER ────────────────────────────────────────────────── */}
      <header
        className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-[60px] items-center"
        style={{ background: T.headerBg, boxShadow: "0 2px 14px rgba(15,37,72,0.22)" }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: T.goldenLine }} />

        <div className="max-w-[1400px] mx-auto w-full px-6 flex items-center justify-between h-full gap-4">

          {/* Brand */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 h-full pr-6 flex-shrink-0 hover:opacity-80 transition-opacity"
            style={{ borderRight: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-lg"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <img src={logo} alt="Asamblea" className="h-[18px] w-auto object-contain brightness-0 invert opacity-90" />
            </div>
            <div className="text-left">
              <span className="block text-[9px] font-semibold uppercase tracking-[.14em] leading-none"
                style={{ color: "rgba(179,205,245,0.8)" }}>
                Asamblea Legislativa
              </span>
              <span className="block text-[13px] font-bold text-white leading-none mt-[4px]">
                Transporte
              </span>
            </div>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-1 flex-1">
            {navItems.map(item => (
              <NavLinkDesktop key={item.to} item={item} pathname={location.pathname} />
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Campana */}
            <div ref={notiRef} className="relative">
              <button
                onClick={() => { setNotiOpen(v => !v); setUserMenuOpen(false); }}
                className={iconBtnClass(notiOpen)}
                aria-label="Notificaciones"
              >
                <Icons.Bell />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-[5px] -right-[5px] flex h-[18px] w-[18px] items-center justify-center rounded-full text-[8px] font-black text-blue-900 bg-amber-400"
                    style={{ border: "2px solid #0f2548" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notiOpen && (
                <div className="absolute right-0 top-11 w-80 z-50 animate-slide-down">
                  <NotificacionesPanel onClose={() => setNotiOpen(false)} />
                </div>
              )}
            </div>

            {/* Separador */}
            <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.12)" }} />

            {/* Usuario */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => { setUserMenuOpen(v => !v); setNotiOpen(false); }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all",
                  userMenuOpen
                    ? "bg-white/20 border border-white/25"
                    : "bg-white/10 border border-white/12 hover:bg-white/18",
                )}
              >
                <Avatar initial={initial} size="sm" />
                <div className="hidden xl:block text-left">
                  <p className="text-[12px] font-bold text-white leading-none">{user?.name || "Usuario"}</p>
                  <p className="text-[9px] font-semibold leading-none mt-[3px]"
                    style={{ color: "rgba(179,205,245,0.75)" }}>
                    {(user as any)?.role || "Administrador"}
                  </p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Icons.ChevronDown open={userMenuOpen} />
                </span>
              </button>

              {/* Dropdown usuario — light */}
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-56 z-50 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,37,72,0.14),0_4px_12px_rgba(15,37,72,0.06)] animate-slide-down">
                  <div
                    className="flex flex-col items-center gap-2.5 px-5 pt-5 pb-4 text-center"
                    style={{ background: "linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%)", borderBottom: "1px solid #e8f0fe" }}
                  >
                    <Avatar initial={initial} size="lg" />
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      En línea
                    </span>
                  </div>
                  <div className="p-2.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                    >
                      <Icons.Logout /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE TOP BAR ────────────────────────────────────────────────── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-4"
        style={{ background: T.headerBg, boxShadow: "0 2px 10px rgba(15,37,72,0.22)" }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: T.goldenLine }} />

        <button
          onClick={open ? onClose : onOpen}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-white/65 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)" }}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
          <div className="flex items-center justify-center w-[30px] h-[30px] rounded-lg"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <img src={logo} alt="Logo" className="h-[15px] brightness-0 invert opacity-90" />
          </div>
          <span className="text-[14px] font-bold text-white">Transporte</span>
        </button>

        <button
          onClick={() => { setNotiOpen(v => !v); setUserMenuOpen(false); }}
          className={iconBtnClass(notiOpen)}
          aria-label="Notificaciones"
        >
          <Icons.Bell />
          {unreadCount > 0 && (
            <span
              className="absolute -top-[5px] -right-[5px] flex h-[18px] w-[18px] items-center justify-center rounded-full text-[8px] font-black text-blue-900 bg-amber-400"
              style={{ border: "2px solid #0f2548" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* ── NOTIFICACIONES MÓVIL ──────────────────────────────────────────── */}
      {notiOpen && (
        <div className="lg:hidden fixed top-[68px] right-4 left-4 z-[100] animate-slide-down">
          <NotificacionesPanel onClose={() => setNotiOpen(false)} />
        </div>
      )}

      {/* ── DRAWER ────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-[70] w-72 h-full flex flex-col border-r",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: T.headerBg,
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: open ? "6px 0 32px rgba(15,37,72,0.35)" : "none",
          transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <div className="absolute top-0 right-0 bottom-0 w-[2px]" style={{ background: T.drawerGlow }} />

        {/* Header drawer */}
        <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <img src={logo} alt="Logo" className="h-5 brightness-0 invert opacity-90" />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.14em] leading-none"
                style={{ color: "rgba(179,205,245,0.7)" }}>
                Asamblea Legislativa
              </p>
              <p className="text-[13px] font-bold text-white leading-none mt-[4px]">Transporte</p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <Avatar initial={initial} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate leading-none">{user?.name || "Usuario"}</p>
              <p className="text-[10px] truncate mt-[3px] leading-none" style={{ color: "rgba(179,205,245,0.6)" }}>
                {user?.email || ""}
              </p>
            </div>
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
              style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-4 py-2 text-[9px] font-bold uppercase tracking-[.2em]"
            style={{ color: "rgba(255,255,255,0.28)" }}>
            Menú principal
          </p>
          {navItems.map(item => (
            <NavLinkDrawer key={item.to} item={item} onClick={onClose} pathname={location.pathname} />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-red-500/15 hover:text-red-300 text-white/40"
          >
            <Icons.Logout /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── BACKDROPS ─────────────────────────────────────────────────────── */}
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
      )}
      {notiOpen && (
        <div onClick={() => setNotiOpen(false)} className="lg:hidden fixed inset-0 z-[90] bg-transparent" />
      )}

      {/* ── BOTTOM NAV ────────────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2"
        style={{
          height: "60px",
          background: T.bottomNavBg,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -4px 20px rgba(15,37,72,0.28)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.35) 50%, transparent 100%)" }} />
        {navItems.map(item => <NavLinkBottom key={item.to} item={item} />)}
        <button
          onClick={() => setUserMenuOpen(v => !v)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all text-white/50 hover:text-white/80"
        >
          <Icons.User />
          <span className="text-[9.5px] font-bold uppercase tracking-wider">Perfil</span>
        </button>
      </nav>
    </>
  );
}