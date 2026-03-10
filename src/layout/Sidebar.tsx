// src/layout/Sidebar.tsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import React, { useState, useRef, useEffect } from "react";
import { useNotifications, type Notification, type NotiTipo } from "../notifications/NotificationContext";

type Props = { open: boolean; onClose: () => void; onOpen: () => void };
type NavItem = { to: string; label: string; mobileLabel: string; icon: () => React.ReactElement; badge?: number };

// ─── Mapa de clases Tailwind por tipo de notificación ─────────────────────────
// Antes: objeto con strings rgba hardcodeados en el componente
// Ahora: clases de Tailwind usando los tokens del config
const notiClasses: Record<NotiTipo, { dot: string; bg: string; border: string }> = {
  aprobada:     { dot: "bg-noti-approved-dot",  bg: "bg-noti-approved-bg",  border: "border-noti-approved-border"  },
  rechazada:    { dot: "bg-noti-rejected-dot",  bg: "bg-noti-rejected-bg",  border: "border-noti-rejected-border"  },
  observada:    { dot: "bg-noti-info-dot",      bg: "bg-noti-info-bg",      border: "border-noti-info-border"      },
  finalizada:   { dot: "bg-noti-done-dot",      bg: "bg-noti-done-bg",      border: "border-noti-done-border"      },
  recordatorio: { dot: "bg-noti-reminder-dot",  bg: "bg-noti-reminder-bg",  border: "border-noti-reminder-border"  },
  info:         { dot: "bg-noti-info-dot",      bg: "bg-noti-info-bg",      border: "border-noti-info-border"      },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="2.5" /><rect x="13" y="3" width="8" height="8" rx="2.5" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" /><rect x="13" y="13" width="8" height="8" rx="2.5" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M9 6h11M9 12h11M9 18h6" />
      <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M4 7h16M4 12h10M4 17h13" />
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  ChevronDown: ({ open }: { open: boolean }) => (
    <svg
      width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      // Solo este transform inline es inevitable — es un valor dinámico en runtime
      className="transition-transform duration-250"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
};

// ─── Avatar ────────────────────────────────────────────────────────────────────

const avatarSize = {
  sm: "w-[30px] h-[30px] text-[11px]",
  md: "w-[36px] h-[36px] text-[13px]",
  lg: "w-[46px] h-[46px] text-[17px]",
};

function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={`
        ${avatarSize[size]}
        flex items-center justify-center font-bold text-white flex-shrink-0 rounded-full
        shadow-avatar
      `}
      style={{
        // Gradiente radial complejo — no existe en Tailwind sin plugin
        background: "radial-gradient(135deg at 30% 30%, #2563eb 0%, #1e3a8a 60%, #0f172a 100%)",
      }}
    >
      {initial}
    </div>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────

function StatusDot() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-online-bg border border-online-border rounded-badge">
      <span className="w-1.5 h-1.5 rounded-full bg-online-dot animate-pulse shadow-online-dot" />
      En línea
    </span>
  );
}

// ─── NavLinkBottom ────────────────────────────────────────────────────────────
// Separado en su propia función — antes era un if dentro de NavLinkItem

function NavLinkBottom({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const { to, mobileLabel, icon: Icon } = item;
  return (
    <NavLink
      to={to} end onClick={onClick}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-1 transition-all
        ${isActive ? "text-blue-light" : "text-ink-muted"}`
      }
    >
      <Icon />
      <span className="text-[10px] font-bold uppercase tracking-tight">{mobileLabel}</span>
    </NavLink>
  );
}

// ─── NavLinkDesktop ───────────────────────────────────────────────────────────

function NavLinkDesktop({ item, pathname }: { item: NavItem; pathname: string }) {
  const { to, label, icon: Icon, badge } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  return (
    <NavLink
      to={to} end
      className={`
        flex items-center gap-2.5 px-4 py-2.5 mx-1
        text-xs font-semibold uppercase tracking-widest
        transition-all duration-200 rounded-nav
        ${active
          ? "text-white bg-blue-glass shadow-nav-active"
          : "text-ink-muted hover:text-slate-200"
        }
      `}
    >
      <span className={active ? "text-blue-light" : ""}><Icon /></span>
      <span>{label}</span>
      {badge && (
        <span className="ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-badge text-blue-300">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

// ─── NavLinkDrawer ────────────────────────────────────────────────────────────

function NavLinkDrawer({ item, onClick, pathname }: { item: NavItem; onClick?: () => void; pathname: string }) {
  const { to, label, icon: Icon, badge } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  return (
    <NavLink
      to={to} end onClick={onClick}
      className={`
        flex items-center gap-3.5 px-4 py-3.5
        transition-all duration-200 rounded-2xl group
        ${active
          ? "bg-blue-glass text-white shadow-blue-glow-lg"
          : "text-ink-muted"
        }
      `}
    >
      <div className={`
        flex items-center justify-center w-9 h-9 rounded-xl transition-all
        ${active
          ? "bg-blue-muted text-blue-light shadow-blue-glow"
          : "bg-surface-subtle text-ink-disabled"
        }
      `}>
        <Icon />
      </div>
      <span className="text-sm font-semibold">{label}</span>
      {badge && (
        <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-glass text-blue-300">
          {badge}
        </span>
      )}
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-light shadow-blue-dot" />
      )}
    </NavLink>
  );
}

// ─── timeAgo ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "Hace un momento";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

// ─── NotificacionesPanel ──────────────────────────────────────────────────────
// Antes: vivía dentro de Sidebar.tsx
// Ahora: debería moverse a src/notifications/NotificacionesPanel.tsx
// pero lo dejamos aquí como paso intermedio

function NotificacionesPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const recientes = notifications.slice(0, 10);

  return (
    <div className="w-full max-h-[70vh] flex flex-col overflow-hidden rounded-card bg-surface-card border border-surface-border-strong shadow-dropdown-lg backdrop-blur-card">

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-ink-primary">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-blue-badge"
              style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-blue-light hover:text-blue-300 flex items-center gap-1.5 transition-colors"
          >
            <Icons.Check /> Marcar todo
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="overflow-y-auto flex-1">
        {recientes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-subtle border border-surface-border">
              <Icons.Bell />
            </div>
            <p className="text-sm font-semibold text-ink-secondary">Sin notificaciones</p>
            <p className="text-xs text-ink-muted">Cuando haya actividad en tus solicitudes aparecerá aquí.</p>
          </div>
        ) : (
          recientes.map((n: Notification) => {
            const cfg = notiClasses[n.tipo];
            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`
                  px-5 py-4 flex gap-3.5 items-start cursor-pointer
                  transition-all hover:bg-surface-subtle
                  border-b border-surface-border
                  ${n.leida ? "opacity-50" : "opacity-100"}
                `}
              >
                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center border ${cfg.bg} ${cfg.border}`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-sm truncate ${n.leida ? "font-medium text-ink-secondary" : "font-bold text-ink-primary"}`}>
                      {n.titulo}
                    </span>
                    {!n.leida && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-light flex-shrink-0 shadow-blue-dot" />
                    )}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">{n.mensaje}</p>
                  <span className="text-[10px] font-medium text-ink-disabled uppercase tracking-wider mt-1 block">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 flex gap-2 border-t border-surface-border">
        <button
          onClick={() => { onClose(); navigate("/notificaciones"); }}
          className="flex-1 py-2.5 text-xs font-semibold text-blue-light hover:text-blue-300 transition-colors rounded-nav bg-blue-glass"
        >
          Ver todas
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 text-xs font-semibold text-ink-muted hover:text-slate-300 transition-colors rounded-nav"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ─── MAIN SIDEBAR ─────────────────────────────────────────────────────────────

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

  // Cierra todo al cambiar de ruta
  useEffect(() => {
    onClose();
    setUserMenuOpen(false);
    setNotiOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Click fuera cierra dropdowns
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <>
      {/* ── DESKTOP HEADER ────────────────────────────────────────────────── */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 items-center bg-surface-overlay backdrop-blur-card border-b border-surface-border">

        {/* Línea superior decorativa */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 40%, rgba(96,165,250,0.4) 60%, transparent 100%)" }} />

        {/* Glow central */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-12 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-[1600px] mx-auto w-full px-6 flex items-center justify-between h-full">

          {/* Logo + Nav */}
          <div className="flex items-center gap-6 h-full">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-4 h-full pr-8 transition-all group border-r border-surface-border"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-glass border border-blue-border shadow-blue-glow">
                <img src={logo} alt="Asamblea" className="h-5 w-auto object-contain brightness-0 invert opacity-90" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-blue-400/60 uppercase tracking-ultrawide block leading-none">
                  Asamblea Legislativa
                </span>
                <span className="text-sm font-semibold text-slate-200 tracking-wider mt-1.5 block leading-none">
                  Transporte
                </span>
              </div>
            </button>

            <nav className="flex items-center gap-1 h-full">
              {navItems.map(item => (
                <NavLinkDesktop key={item.to} item={item} pathname={location.pathname} />
              ))}
            </nav>
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-3">

            {/* ── Campana ── */}
            <div ref={notiRef} className="relative">
              <button
                onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-nav transition-all
                  ${notiOpen
                    ? "bg-blue-glass border border-blue-border text-blue-light shadow-blue-glow"
                    : "bg-surface-subtle border border-surface-border text-ink-muted"
                  }
                `}
              >
                <Icons.Bell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white bg-blue-solid shadow-blue-badge border-2 border-surface-base">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notiOpen && (
                <div className="absolute right-0 top-12 w-80 z-50">
                  <NotificacionesPanel onClose={() => setNotiOpen(false)} />
                </div>
              )}
            </div>

            {/* ── Usuario ── */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotiOpen(false); }}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-[14px] transition-all
                  ${userMenuOpen
                    ? "bg-blue-glass border border-blue-border shadow-blue-glow-lg"
                    : "bg-surface-subtle border border-surface-border"
                  }
                `}
              >
                <Avatar initial={initial} size="sm" />
                <div className="hidden xl:block text-left">
                  <p className="text-[11px] font-bold text-ink-primary leading-none">{user?.name || "Usuario"}</p>
                  <p className="text-[9px] font-semibold text-blue-400/70 uppercase tracking-tight mt-0.5">Admin</p>
                </div>
                <span className="text-ink-muted">
                  <Icons.ChevronDown open={userMenuOpen} />
                </span>
              </button>

              {/* Dropdown usuario */}
              {userMenuOpen && (
                <div className="absolute right-0 top-14 w-60 z-50 overflow-hidden rounded-card bg-surface-card border border-surface-border-strong shadow-dropdown backdrop-blur-card">
                  {/* Glow top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />

                  <div className="relative p-5 border-b border-surface-border flex flex-col items-center gap-3 text-center">
                    <Avatar initial={initial} size="lg" />
                    <div>
                      <p className="text-sm font-bold text-ink-primary">{user?.name}</p>
                      <p className="text-[10px] text-ink-muted mt-0.5">{user?.email}</p>
                    </div>
                    <StatusDot />
                  </div>

                  <div className="p-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-nav text-danger-text bg-danger-glass border border-danger-border hover:bg-danger-glass-hover transition-colors"
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
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 bg-surface-base/90 backdrop-blur-card border-b border-surface-border">
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 50%, transparent 100%)" }} />

        {/* Hamburguesa */}
        <button
          onClick={open ? onClose : onOpen}
          className="w-10 h-10 flex items-center justify-center text-ink-secondary rounded-nav bg-surface-subtle border border-surface-border"
        >
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>

        {/* Logo */}
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-blue-glass border border-blue-border shadow-blue-glow">
            <img src={logo} alt="Logo" className="h-4 brightness-0 invert opacity-90" />
          </div>
          <span className="text-base font-semibold text-ink-primary">Transporte</span>
        </button>

        {/* Campana móvil */}
        <button
          onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
          className={`
            relative w-10 h-10 flex items-center justify-center rounded-nav transition-all
            ${notiOpen
              ? "bg-blue-glass border border-blue-border text-blue-light"
              : "bg-surface-subtle border border-surface-border text-ink-muted"
            }
          `}
        >
          <Icons.Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white bg-blue-solid shadow-blue-badge border-2 border-surface-base">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* ── NOTIFICACIONES MÓVIL ──────────────────────────────────────────── */}
      {notiOpen && (
        <div className="lg:hidden fixed top-20 right-4 left-4 z-[100] animate-slide-down">
          <NotificacionesPanel onClose={() => setNotiOpen(false)} />
        </div>
      )}

      {/* ── BACKDROP ──────────────────────────────────────────────────────── */}
      {/* Separado: drawer backdrop vs noti backdrop para no acoplar lógica */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs"
        />
      )}
      {notiOpen && (
        <div
          onClick={() => setNotiOpen(false)}
          className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs"
        />
      )}

      {/* ── DRAWER MÓVIL ──────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-[70] w-72 h-full flex flex-col
          bg-surface-base backdrop-blur-drawer
          border-r border-surface-border
          transition-transform duration-300
          ${open ? "translate-x-0 shadow-drawer" : "-translate-x-full"}
        `}
        style={{ transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
      >
        {/* Destellos de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
          style={{ background: "radial-gradient(circle at top right, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none"
          style={{ background: "radial-gradient(circle at bottom left, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />

        {/* Header del drawer */}
        <div className="relative p-5 border-b border-surface-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-glass border border-blue-border shadow-blue-glow">
              <img src={logo} alt="Logo" className="h-5 brightness-0 invert opacity-90" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-blue-400/50 uppercase tracking-widest leading-none">Asamblea</p>
              <p className="text-sm font-semibold text-ink-primary tracking-wide mt-0.5">Transporte</p>
            </div>
          </div>

          {/* User card */}
          <div className="p-3.5 bg-surface-subtle border border-surface-border rounded-2xl">
            <div className="flex items-center gap-3 mb-2.5">
              <Avatar initial={initial} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-primary truncate">{user?.name || "Usuario"}</p>
                <p className="text-[10px] text-ink-muted truncate mt-0.5">{user?.email || ""}</p>
              </div>
            </div>
            <StatusDot />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-4 py-2 text-[9px] font-bold text-ink-disabled uppercase tracking-megawide">
            Menú principal
          </p>
          {navItems.map(item => (
            <NavLinkDrawer key={item.to} item={item} onClick={onClose} pathname={location.pathname} />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-surface-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-[14px] text-ink-secondary hover:bg-danger-glass hover:text-danger-text transition-all"
          >
            <Icons.Logout /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── BOTTOM NAV ────────────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-base/95 backdrop-blur-card border-t border-surface-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.25) 50%, transparent 100%)" }} />
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => (
            <NavLinkBottom key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </>
  );
}