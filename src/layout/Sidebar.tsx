import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import React, { useState, useRef, useEffect } from "react";

type Props = { open: boolean; onClose: () => void; onOpen: () => void };
type NavItem = { to: string; label: string; mobileLabel: string; icon: () => React.ReactElement; badge?: number; };

interface Notificacion {
  id: number; titulo: string; mensaje: string; tiempo: string;
  leida: boolean; tipo: "aprobada" | "rechazada" | "pendiente" | "info";
}

const MOCK_NOTIFICACIONES: Notificacion[] = [
  { id: 1, titulo: "Solicitud aprobada", mensaje: "Tu solicitud de combustible #SOL-0042 fue aprobada.", tiempo: "Hace 5 min", leida: false, tipo: "aprobada" },
  { id: 2, titulo: "Solicitud rechazada", mensaje: "Tu solicitud de transporte #TRP-0018 fue rechazada.", tiempo: "Hace 1 hora", leida: false, tipo: "rechazada" },
  { id: 3, titulo: "Nuevo comentario", mensaje: "El administrador comentó en tu solicitud #SOL-0039.", tiempo: "Hace 3 horas", leida: true, tipo: "info" },
  { id: 4, titulo: "Pendiente de aprobación", mensaje: "Tu solicitud #SOL-0041 está en revisión.", tiempo: "Ayer", leida: true, tipo: "pendiente" },
];

const notiColor = {
  aprobada: { dot: "#10B981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)" },
  rechazada: { dot: "#EF4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)" },
  pendiente: { dot: "#F59E0B", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
  info: { dot: "#60A5FA", bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.3)" },
};

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
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ transition: "transform 250ms cubic-bezier(.34,1.56,.64,1)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
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

// --- Avatar orgánico con glow azul ---
function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const dim = { sm: 30, md: 36, lg: 46 };
  const font = { sm: "11px", md: "13px", lg: "17px" };
  return (
    <div
      style={{
        width: dim[size],
        height: dim[size],
        fontSize: font[size],
        background: "radial-gradient(135deg at 30% 30%, #2563eb 0%, #1e3a8a 60%, #0f172a 100%)",
        boxShadow: "0 0 18px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
        borderRadius: "50%",
      }}
      className="flex items-center justify-center font-bold text-white flex-shrink-0"
    >
      {initial}
    </div>
  );
}

// --- Punto de estado online ---
function StatusDot() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider"
      style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "20px" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: "0 0 6px #10b981" }} />
      En línea
    </span>
  );
}

// --- NavLink con glow azul y forma orgánica ---
function NavLinkItem({ item, onClick, variant, pathname }: { item: NavItem; onClick?: () => void; variant: "desktop" | "drawer" | "bottom"; pathname: string; }) {
  const { to, label, mobileLabel, icon: Icon, badge } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  if (variant === "bottom") {
    return (
      <NavLink to={to} end onClick={onClick}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-all"
        style={({ isActive }) => isActive ? { color: "#60a5fa" } : { color: "#64748b" }}>
        <Icon />
        <span className="text-[10px] font-bold uppercase tracking-tight">{mobileLabel}</span>
      </NavLink>
    );
  }

  if (variant === "desktop") {
    return (
      <NavLink to={to} end
        style={active
          ? { color: "#fff", background: "rgba(59,130,246,0.15)", borderRadius: "12px", boxShadow: "0 0 20px rgba(59,130,246,0.2)" }
          : { color: "#64748b" }}
        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:text-slate-200 mx-1"
      >
        <span style={active ? { color: "#60a5fa" } : {}}><Icon /></span>
        <span>{label}</span>
        {badge && <span className="ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.25)", color: "#93c5fd" }}>{badge}</span>}
      </NavLink>
    );
  }

  // drawer
  return (
    <NavLink to={to} end onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-3.5 transition-all duration-200 group"
      style={active
        ? { background: "rgba(59,130,246,0.12)", borderRadius: "16px", color: "#fff", boxShadow: "0 0 24px rgba(59,130,246,0.15)" }
        : { color: "#64748b", borderRadius: "16px" }}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={active
          ? { background: "rgba(59,130,246,0.2)", color: "#60a5fa", boxShadow: "0 0 14px rgba(59,130,246,0.3)" }
          : { background: "rgba(255,255,255,0.04)", color: "#475569" }}>
        <Icon />
      </div>
      <span className="text-sm font-semibold">{label}</span>
      {badge && <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}>{badge}</span>}
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" style={{ boxShadow: "0 0 8px #60a5fa" }} />}
    </NavLink>
  );
}

// --- Panel de notificaciones ---
function NotificacionesPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notificacion[]>(MOCK_NOTIFICACIONES);
  const marcarTodasLeidas = () => setNotifs(n => n.map(x => ({ ...x, leida: true })));
  const marcarLeida = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, leida: true } : x));
  const noLeidas = notifs.filter(n => !n.leida).length;

  return (
    <div className="w-full max-h-[70vh] flex flex-col overflow-hidden"
      style={{
        background: "rgba(10,15,30,0.97)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.08)",
        backdropFilter: "blur(24px)",
      }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-white">Notificaciones</span>
          {noLeidas > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 0 12px rgba(59,130,246,0.4)" }}>
              {noLeidas}
            </span>
          )}
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodasLeidas} className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
            <Icons.Check /> Marcar todo
          </button>
        )}
      </div>
      <div className="overflow-y-auto flex-1">
        {notifs.map(n => {
          const cfg = notiColor[n.tipo];
          return (
            <div key={n.id} onClick={() => marcarLeida(n.id)}
              className="px-5 py-4 flex gap-3.5 items-start cursor-pointer transition-all"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: n.leida ? 0.5 : 1 }}>
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}` }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-sm truncate ${n.leida ? 'font-medium text-slate-400' : 'font-bold text-white'}`}>{n.titulo}</span>
                  {!n.leida && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" style={{ boxShadow: "0 0 8px #60a5fa" }} />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{n.mensaje}</p>
                <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider mt-1 block">{n.tiempo}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={onClose}
          className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          style={{ borderRadius: "12px" }}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN SIDEBAR COMPONENT
// ══════════════════════════════════════════════════════
export default function Sidebar({ open, onClose, onOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  const initial = (user?.name?.trim()?.[0] || "U").toUpperCase();
  const noLeidas = MOCK_NOTIFICACIONES.filter(n => !n.leida).length;

  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", mobileLabel: "Inicio", icon: Icons.Dashboard },
    { to: "/nueva-solicitud", label: "Nueva solicitud", mobileLabel: "Nueva", icon: Icons.Plus },
    { to: "/mis-solicitudes", label: "Mis solicitudes", mobileLabel: "Solicitudes", icon: Icons.List, badge: 3 },
  ];

  const handleLogout = async () => {
    onClose(); setUserMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => { onClose(); setUserMenuOpen(false); setNotiOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const headerStyle: React.CSSProperties = {
    background: "rgba(7,11,22,0.85)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP HEADER — ORGÁNICO & GLASSY
      ══════════════════════════════════════ */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 items-center" style={headerStyle}>
        {/* Línea superior con glow azul */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 40%, rgba(96,165,250,0.4) 60%, transparent 100%)" }} />

        {/* Glow ambiental sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-12 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-[1600px] mx-auto w-full px-6 flex items-center justify-between h-full">

          {/* Logo */}
          <div className="flex items-center gap-6 h-full">
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center gap-4 h-full pr-8 transition-all group"
              style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ background: "radial-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(37,99,235,0.15) 100%)", border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 20px rgba(59,130,246,0.2)" }}>
                <img src={logo} alt="Asamblea" className="h-5 w-auto object-contain filter brightness-0 invert opacity-90" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-blue-400/60 uppercase tracking-[0.3em] block leading-none">Asamblea Legislativa</span>
                <span className="text-sm font-semibold text-slate-200 tracking-wider mt-1.5 block leading-none">Transporte</span>
              </div>
            </button>

            {/* Nav links */}
            <nav className="flex items-center gap-1 h-full">
              {navItems.map(item => (
                <NavLinkItem key={item.to} item={item} variant="desktop" pathname={location.pathname} />
              ))}
            </nav>
          </div>

          {/* Derecha: notificaciones + usuario */}
          <div className="flex items-center gap-3">

            {/* Campana */}
            <div ref={notiRef} className="relative">
              <button onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
                className="relative flex items-center justify-center w-10 h-10 transition-all"
                style={{
                  borderRadius: "12px",
                  background: notiOpen ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                  border: notiOpen ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  color: notiOpen ? "#60a5fa" : "#64748b",
                  boxShadow: notiOpen ? "0 0 20px rgba(59,130,246,0.2)" : "none",
                }}>
                <Icons.Bell />
                {noLeidas > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"
                    style={{ boxShadow: "0 0 8px rgba(59,130,246,0.8)" }} />
                )}
              </button>

              {/* Dropdown notificaciones desktop */}
              {notiOpen && (
                <div className="absolute right-0 top-12 w-80 z-50">
                  <NotificacionesPanel onClose={() => setNotiOpen(false)} />
                </div>
              )}
            </div>

            {/* Usuario */}
            <div ref={menuRef} className="relative">
              <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotiOpen(false); }}
                className="flex items-center gap-3 px-4 py-2 transition-all"
                style={{
                  borderRadius: "14px",
                  background: userMenuOpen ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
                  border: userMenuOpen ? "1px solid rgba(59,130,246,0.25)" : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: userMenuOpen ? "0 0 24px rgba(59,130,246,0.15)" : "none",
                }}>
                <Avatar initial={initial} size="sm" />
                <div className="hidden xl:block text-left">
                  <p className="text-[11px] font-bold text-white leading-none">{user?.name || "Usuario"}</p>
                  <p className="text-[9px] font-semibold text-blue-400/70 uppercase tracking-tight mt-0.5">Admin</p>
                </div>
                <span className="text-slate-500"><Icons.ChevronDown open={userMenuOpen} /></span>
              </button>

              {/* Dropdown usuario */}
              {userMenuOpen && (
                <div className="absolute right-0 top-14 w-60 z-50"
                  style={{
                    background: "rgba(8,12,24,0.97)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "20px",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.07)",
                    backdropFilter: "blur(24px)",
                    overflow: "hidden",
                  }}>
                  <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Glow de fondo */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none"
                      style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />
                    <div className="relative flex flex-col items-center gap-3 text-center">
                      <Avatar initial={initial} size="lg" />
                      <div>
                        <p className="text-sm font-bold text-white">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{user?.email}</p>
                      </div>
                      <StatusDot />
                    </div>
                  </div>
                  <div className="p-3">
                    <button onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all"
                      style={{
                        borderRadius: "12px",
                        color: "#f87171",
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.15)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(239,68,68,0.1)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.07)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                      }}>
                      <Icons.Logout /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MOBILE TOP BAR
      ══════════════════════════════════════ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4"
        style={{ background: "rgba(7,11,22,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 50%, transparent 100%)" }} />

        <button onClick={open ? onClose : onOpen}
          className="w-10 h-10 flex items-center justify-center text-slate-400"
          style={{ borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center"
            style={{ borderRadius: "10px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 14px rgba(59,130,246,0.2)" }}>
            <img src={logo} alt="Logo" className="h-4 brightness-0 invert opacity-90" />
          </div>
          <span className="text-base font-semibold text-white">Transporte</span>
        </button>

        <div className="relative">
          <button onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
            className="w-10 h-10 flex items-center justify-center transition-all"
            style={{
              borderRadius: "12px",
              background: notiOpen ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
              border: notiOpen ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.08)",
              color: notiOpen ? "#60a5fa" : "#64748b",
            }}>
            <Icons.Bell />
            {noLeidas > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 border-2"
              style={{ borderColor: "#070b16", boxShadow: "0 0 8px rgba(59,130,246,0.7)" }} />}
          </button>
        </div>
      </header>

      {/* MOBILE NOTIFICATIONS PANEL */}
      {notiOpen && (
        <div className="lg:hidden fixed top-20 right-4 left-4 z-[100]"
          style={{ animation: "slideDown 200ms cubic-bezier(.34,1.56,.64,1) both" }}>
          <NotificacionesPanel onClose={() => setNotiOpen(false)} />
        </div>
      )}

      {/* BACKDROP */}
      {(open || notiOpen) && (
        <div onClick={() => { onClose(); setNotiOpen(false); }}
          className="fixed inset-0 z-[60]"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} />
      )}

      {/* ══════════════════════════════════════
          DRAWER MÓVIL — GLASS ORGÁNICO
      ══════════════════════════════════════ */}
      <aside
        className="fixed top-0 left-0 z-[70] w-72 h-full flex flex-col"
        style={{
          background: "rgba(7,11,22,0.97)",
          backdropFilter: "blur(32px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          boxShadow: open ? "4px 0 40px rgba(0,0,0,0.4), 0 0 60px rgba(59,130,246,0.06)" : "none",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms cubic-bezier(.34,1.56,.64,1)",
          overflow: "hidden",
        }}>
        
        {/* Glow decorativo interior */}
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
          style={{ background: "radial-gradient(circle at top right, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none"
          style={{ background: "radial-gradient(circle at bottom left, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />

        {/* Header del drawer */}
        <div className="relative p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 flex items-center justify-center"
              style={{ borderRadius: "12px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 16px rgba(59,130,246,0.2)" }}>
              <img src={logo} alt="Logo" className="h-5 brightness-0 invert opacity-90" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-blue-400/50 uppercase tracking-widest leading-none">Asamblea</p>
              <p className="text-sm font-semibold text-white tracking-wide mt-0.5">Transporte</p>
            </div>
          </div>

          {/* Tarjeta de usuario */}
          <div className="p-3.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px" }}>
            <div className="flex items-center gap-3 mb-2.5">
              <Avatar initial={initial} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || "Usuario"}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email || ""}</p>
              </div>
            </div>
            <StatusDot />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-4 py-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em]">Menú principal</p>
          {navItems.map(item => (
            <NavLinkItem key={item.to} item={item} onClick={onClose} variant="drawer" pathname={location.pathname} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all"
            style={{ borderRadius: "14px", color: "#94a3b8" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            }}>
            <Icons.Logout /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          BOTTOM NAV MOBILE
      ══════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "rgba(7,11,22,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.25) 50%, transparent 100%)" }} />
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => (
            <NavLinkItem key={item.to} item={item} variant="bottom" pathname={location.pathname} />
          ))}
        </div>
      </nav>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}