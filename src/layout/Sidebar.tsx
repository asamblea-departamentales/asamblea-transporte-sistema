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
  { id: 1, titulo: "Solicitud aprobada",       mensaje: "Tu solicitud de combustible #SOL-0042 fue aprobada.",    tiempo: "Hace 5 min",   leida: false, tipo: "aprobada"  },
  { id: 2, titulo: "Solicitud rechazada",       mensaje: "Tu solicitud de transporte #TRP-0018 fue rechazada.",   tiempo: "Hace 1 hora",  leida: false, tipo: "rechazada" },
  { id: 3, titulo: "Nuevo comentario",          mensaje: "El administrador comentó en tu solicitud #SOL-0039.",   tiempo: "Hace 3 horas", leida: true,  tipo: "info"      },
  { id: 4, titulo: "Pendiente de aprobación",   mensaje: "Tu solicitud #SOL-0041 está en revisión.",              tiempo: "Ayer",         leida: true,  tipo: "pendiente" },
];

const notiColor = {
  aprobada:  { dot: "#10B981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
  rechazada: { dot: "#EF4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)"  },
  pendiente: { dot: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  info:      { dot: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  ChevronDown: ({ open }: { open: boolean }) => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ transition: "transform 200ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
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

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const dim = { sm: 30, md: 36, lg: 42 };
  const fs  = { sm: 12, md: 14, lg: 16 };
  return (
    <div style={{
      width: dim[size], height: dim[size], fontSize: fs[size],
      background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)",
      borderRadius: size === "lg" ? 12 : 8,
      border: "1.5px solid rgba(96,165,250,0.3)",
      boxShadow: "0 2px 8px rgba(29,78,216,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, color: "#BFDBFE", fontFamily: "'Sora', sans-serif", flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}

function StatusDot() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
      borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 600,
      color: "#6EE7B7", letterSpacing: "0.04em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 4px #10B981", animation: "pulse 2s infinite" }} />
      En línea
    </span>
  );
}

// ─── NavLinkItem ──────────────────────────────────────────────────────────────
function NavLinkItem({ item, onClick, variant, pathname }: {
  item: NavItem; onClick?: () => void;
  variant: "desktop" | "drawer" | "bottom"; pathname: string;
}) {
  const { to, label, mobileLabel, icon: Icon, badge } = item;
  const isSpecialActive = to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/");

  if (variant === "bottom") {
    return (
      <NavLink to={to} end onClick={onClick}
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "10px 4px 8px", gap: 4,
          textDecoration: "none", position: "relative",
          transition: "all 150ms", minWidth: 0,
        }}
        className={({ isActive }) => (isActive || isSpecialActive) ? "nav-bottom-active" : "nav-bottom"}
      >
        {({ isActive }) => {
          const active = isActive || isSpecialActive;
          return (
            <>
              {/* Icono con fondo activo */}
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 28, borderRadius: 8,
                background: active ? "rgba(59,130,246,0.15)" : "transparent",
                color: active ? "#60A5FA" : "rgba(255,255,255,0.4)",
                transition: "all 150ms",
                position: "relative",
              }}>
                <Icon />
                {badge && !active && (
                  <span style={{
                    position: "absolute", top: 2, right: 2,
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#3B82F6", border: "1.5px solid #0A0F1E",
                  }} />
                )}
              </span>
              {/* Label */}
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? "#60A5FA" : "rgba(255,255,255,0.35)",
                transition: "all 150ms",
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}>
                {mobileLabel}
              </span>
              {/* Indicador activo */}
              {active && (
                <span style={{
                  position: "absolute", bottom: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: 20, height: 2,
                  background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
                  borderRadius: "2px 2px 0 0",
                }} />
              )}
            </>
          );
        }}
      </NavLink>
    );
  }

  if (variant === "drawer") {
    return (
      <NavLink to={to} end onClick={onClick}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, textDecoration: "none", transition: "all 150ms", marginBottom: 2 }}
        className={({ isActive }) => (isActive || isSpecialActive) ? "nav-drawer-active" : "nav-drawer"}
      >
        {({ isActive }) => {
          const active = isActive || isSpecialActive;
          return (
            <>
              <span style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)", color: active ? "#60A5FA" : "rgba(255,255,255,0.4)", border: active ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent", transition: "all 150ms" }}><Icon /></span>
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? "#F0F6FF" : "rgba(255,255,255,0.45)", flex: 1 }}>{label}</span>
              {badge && <span style={{ background: "rgba(59,130,246,0.2)", color: "#93C5FD", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)" }}>{badge}</span>}
            </>
          );
        }}
      </NavLink>
    );
  }

  // Desktop
  return (
    <NavLink to={to} end onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 8, textDecoration: "none", transition: "all 150ms", whiteSpace: "nowrap" }}
      className={({ isActive }) => (isActive || isSpecialActive) ? "nav-desktop-active" : "nav-desktop"}
    >
      {({ isActive }) => {
        const active = isActive || isSpecialActive;
        return (
          <>
            <span style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.4)" }}><Icon /></span>
            <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? "#EFF6FF" : "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}>{label}</span>
            {badge && <span style={{ background: "rgba(59,130,246,0.2)", color: "#93C5FD", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)" }}>{badge}</span>}
          </>
        );
      }}
    </NavLink>
  );
}

// ─── Panel Notificaciones ─────────────────────────────────────────────────────
function NotificacionesPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notificacion[]>(MOCK_NOTIFICACIONES);
  const marcarTodasLeidas   = () => setNotifs(n => n.map(x => ({ ...x, leida: true })));
  const marcarLeida         = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, leida: true } : x));
  const noLeidas            = notifs.filter(n => !n.leida).length;

  return (
    <div style={{
      width: "100%", maxHeight: "70vh",
      background: "#0D1425",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.08)",
      display: "flex", flexDirection: "column",
      animation: "slideDown 150ms ease",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Notificaciones</span>
          {noLeidas > 0 && (
            <span style={{ background: "#3B82F6", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>{noLeidas}</span>
          )}
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodasLeidas} style={{ fontSize: 11, fontWeight: 600, color: "#60A5FA", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <Icons.Check /> Marcar todas
          </button>
        )}
      </div>

      {/* Lista */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {notifs.map(n => {
          const cfg = notiColor[n.tipo];
          return (
            <div key={n.id} onClick={() => marcarLeida(n.id)}
              style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", background: n.leida ? "transparent" : "rgba(59,130,246,0.04)", transition: "background 150ms" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              onMouseLeave={e => (e.currentTarget.style.background = n.leida ? "transparent" : "rgba(59,130,246,0.04)")}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot, display: "block" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12.5, fontWeight: n.leida ? 500 : 700, color: n.leida ? "rgba(255,255,255,0.6)" : "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.titulo}</span>
                  {!n.leida && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{n.mensaje}</p>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4, display: "block" }}>{n.tiempo}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <button onClick={onClose}
          style={{ width: "100%", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)", cursor: "pointer", transition: "all 150ms", textAlign: "center" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"; }}
        >
          Ver todas las notificaciones
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notiOpen,     setNotiOpen]     = useState(false);
  const [notifs]                        = useState<Notificacion[]>(MOCK_NOTIFICACIONES);
  const menuRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  const initial  = (user?.name?.trim()?.[0] || "U").toUpperCase();
  const noLeidas = notifs.filter(n => !n.leida).length;

  const navItems: NavItem[] = [
    { to: "/dashboard",       label: "Dashboard",       mobileLabel: "Inicio",        icon: Icons.Dashboard },
    { to: "/nueva-solicitud", label: "Nueva solicitud", mobileLabel: "Nueva",         icon: Icons.Plus      },
    { to: "/mis-solicitudes", label: "Mis solicitudes", mobileLabel: "Solicitudes",   icon: Icons.List, badge: 3 },
  ];

  const handleLogout = async () => {
    onClose(); setUserMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => { onClose(); setUserMenuOpen(false); setNotiOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); setUserMenuOpen(false); setNotiOpen(false); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

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
      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <header
        className="lg-flex"
        style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: "rgba(7,12,24,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 40%, rgba(99,102,241,0.4) 70%, transparent 100%)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "0 28px", gap: 20 }}>

          {/* Logo */}
          <button onClick={() => navigate("/dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 10, transition: "background 150ms", flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, rgba(29,78,216,0.5) 0%, rgba(30,58,138,0.8) 100%)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(29,78,216,0.25)" }}>
              <img src={logo} alt="Logo" style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(147,197,253,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Asamblea</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>Transporte</div>
            </div>
          </button>

          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            {navItems.map(item => <NavLinkItem key={item.to} item={item} variant="desktop" pathname={location.pathname} />)}
          </nav>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Bell */}
            <div ref={notiRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
                style={{ width: 36, height: 36, borderRadius: 9, background: notiOpen ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.04)", border: notiOpen ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: notiOpen ? "#60A5FA" : "rgba(255,255,255,0.4)", position: "relative", transition: "all 150ms", cursor: "pointer" }}
                onMouseEnter={e => { if (!notiOpen) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; } }}
                onMouseLeave={e => { if (!notiOpen) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; } }}
              >
                <Icons.Bell />
                {noLeidas > 0 && <span style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", border: "1.5px solid #070C18" }} />}
              </button>
              {notiOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, zIndex: 200 }}>
                  <NotificacionesPanel onClose={() => setNotiOpen(false)} />
                </div>
              )}
            </div>

            {/* User menu */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotiOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 9, height: 40, padding: "0 10px 0 6px", borderRadius: 10, background: userMenuOpen ? "rgba(59,130,246,0.08)" : "transparent", border: userMenuOpen ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent", transition: "all 150ms", cursor: "pointer" }}
                onMouseEnter={e => { if (!userMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (!userMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <Avatar initial={initial} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.3, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Usuario"}</div>
                  <div style={{ fontSize: 10, color: "rgba(147,197,253,0.5)", lineHeight: 1.2 }}>Administrador</div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.25)", display: "flex" }}><Icons.ChevronDown open={userMenuOpen} /></span>
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 260, background: "#0D1425", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", padding: 6, zIndex: 200, animation: "slideDown 150ms ease" }}>
                  <div style={{ padding: "12px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <Avatar initial={initial} size="lg" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{user?.name || "Usuario"}</div>
                        <div style={{ fontSize: 11, color: "rgba(147,197,253,0.5)", marginTop: 1 }}>{user?.email || ""}</div>
                      </div>
                    </div>
                    <StatusDot />
                  </div>
                  <button onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 12px", borderRadius: 9, fontSize: 13, color: "rgba(255,255,255,0.4)", transition: "all 150ms", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#FCA5A5"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    <Icons.Logout /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE TOP BAR
      ══════════════════════════════════════════════════════════════════ */}
      <header
        className="mobile-only"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 60, background: "rgba(7,12,24,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 50%, transparent 100%)" }} />

        {/* Hamburger */}
        <button
          onClick={open ? onClose : onOpen}
          style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", flexShrink: 0 }}
        >
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>

        {/* Logo */}
        <button onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, rgba(29,78,216,0.5) 0%, rgba(30,58,138,0.8) 100%)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="" style={{ height: 15, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Transporte</span>
        </button>

        {/* Bell mobile */}
        <div ref={notiRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
            style={{ width: 38, height: 38, borderRadius: 9, background: notiOpen ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: notiOpen ? "#60A5FA" : "rgba(255,255,255,0.5)", position: "relative", cursor: "pointer" }}
          >
            <Icons.Bell />
            {noLeidas > 0 && <span style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", border: "1.5px solid #0A0F1E" }} />}
          </button>
        </div>
      </header>

      {/* Panel notificaciones mobile — fuera del header para z-index correcto */}
      {notiOpen && (
        <div style={{ position: "fixed", top: 68, right: 12, left: 12, zIndex: 150 }}>
          <NotificacionesPanel onClose={() => setNotiOpen(false)} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          BACKDROP
      ══════════════════════════════════════════════════════════════════ */}
      {(open || notiOpen) && (
        <div
          onClick={() => { onClose(); setNotiOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", animation: "fadeIn 200ms ease" }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DRAWER
      ══════════════════════════════════════════════════════════════════ */}
      <aside style={{ position: "fixed", top: 0, left: 0, zIndex: 120, width: 280, height: "100%", background: "#080E1E", borderRight: "1px solid rgba(255,255,255,0.07)", transform: open ? "translateX(0)" : "translateX(-100%)", transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.6) 0%, rgba(99,102,241,0.3) 100%)" }} />

        {/* Header drawer */}
        <div style={{ height: 60, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, rgba(29,78,216,0.5) 0%, rgba(30,58,138,0.8) 100%)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="" style={{ height: 17, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(147,197,253,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Asamblea</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>Transporte</div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: "14px 14px 10px", flexShrink: 0 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
              <Avatar initial={initial} size="lg" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Usuario"}</div>
                <div style={{ fontSize: 10.5, color: "rgba(147,197,253,0.45)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || ""}</div>
              </div>
            </div>
            <StatusDot />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "6px 14px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 4px 8px" }}>Menú principal</div>
          {navItems.map(item => <NavLinkItem key={item.to} item={item} onClick={onClose} variant="drawer" pathname={location.pathname} />)}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.35)", transition: "all 150ms", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#FCA5A5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"; }}
          >
            <Icons.Logout /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM NAV
      ══════════════════════════════════════════════════════════════════ */}
      <nav
        className="mobile-only"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
          background: "rgba(7,12,24,0.98)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Línea top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.4) 50%, transparent 100%)" }} />
        <div style={{ display: "flex", alignItems: "stretch", height: 58 }}>
          {navItems.map(item => (
            <NavLinkItem key={item.to} item={item} variant="bottom" pathname={location.pathname} />
          ))}
        </div>
      </nav>
    </>
  );
}