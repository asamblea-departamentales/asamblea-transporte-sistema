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
  const marcarTodasLeidas = () => setNotifs(n => n.map(x => ({ ...x, leida: true })));
  const marcarLeida = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, leida: true } : x));
  const noLeidas = notifs.filter(n => !n.leida).length;

  return (
    <div className="w-full max-h-[70vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Header del Panel */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">Notificaciones</span>
          {noLeidas > 0 && (
            <span className="bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg shadow-primary/20">
              {noLeidas}
            </span>
          )}
        </div>
        {noLeidas > 0 && (
          <button 
            onClick={marcarTodasLeidas} 
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
          >
            <Icons.Check /> 
            <span>Marcar todo</span>
          </button>
        )}
      </div>

      {/* Lista de Notificaciones */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {notifs.length > 0 ? (
          notifs.map(n => {
            const cfg = notiColor[n.tipo];
            return (
              <div 
                key={n.id} 
                onClick={() => marcarLeida(n.id)}
                className={`px-5 py-4 border-b border-white/5 flex gap-4 items-start cursor-pointer transition-all duration-200 ${
                  n.leida ? 'opacity-60 hover:bg-white/[0.02]' : 'bg-primary/5 hover:bg-primary/10'
                }`}
              >
                {/* Icono de Estado */}
                <div 
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border"
                  style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-sm truncate ${n.leida ? 'font-medium text-slate-300' : 'font-bold text-white'}`}>
                      {n.titulo}
                    </span>
                    {!n.leida && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">
                    {n.mensaje}
                  </p>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    {n.tiempo}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm">
            No tienes notificaciones nuevas
          </div>
        )}
      </div>

      {/* Footer del Panel */}
      <div className="p-3 bg-white/[0.01] border-t border-white/5">
        <button 
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          Ver historial completo
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
    DESKTOP HEADER - REFACTORIZADO
    ══════════════════════════════════════════════════════════════════ */}
<header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/95 backdrop-blur-md border-b border-white/5 items-center">
  {/* Línea de acento superior institucional */}
  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
  
  <div className="max-w-7xl mx-auto w-full px-8 flex items-center justify-between">
    
    {/* Sección Izquierda: Logo y Marca */}
    <div className="flex items-center gap-8">
      <button 
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-3 group transition-all duration-200"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5 group-hover:bg-primary/20">
          <img src={logo} alt="Asamblea" className="h-6 w-6 object-contain brightness-0 invert opacity-90" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest leading-none">Asamblea</span>
          <span className="text-lg font-extrabold text-white tracking-tight leading-none">Transporte</span>
        </div>
      </button>

      <div className="h-8 w-px bg-white/10" />

      {/* Navegación Principal */}
      <nav className="flex items-center gap-1">
        {navItems.map(item => (
          <NavLinkItem 
            key={item.to} 
            item={item} 
            variant="desktop" 
            pathname={location.pathname} 
          />
        ))}
      </nav>
    </div>

    {/* Sección Derecha: Notificaciones y Usuario */}
    <div className="flex items-center gap-4">
      
      {/* Botón de Notificaciones */}
      <div ref={notiRef} className="relative">
        <button
          onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            notiOpen 
              ? 'bg-primary/20 text-blue-400 border border-primary/30' 
              : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-slate-200'
          }`}
        >
          <Icons.Bell />
          {noLeidas > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900" />
          )}
        </button>
        {notiOpen && (
          <div className="absolute right-0 top-full mt-3 w-80">
            <NotificacionesPanel onClose={() => setNotiOpen(false)} />
          </div>
        )}
      </div>

      {/* Menú de Usuario */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => { setUserMenuOpen(!userMenuOpen); setNotiOpen(false); }}
          className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
        >
          <Avatar initial={initial} size="md" />
          <div className="hidden xl:block text-left">
            <p className="text-sm font-semibold text-slate-200 leading-none">{user?.name || "Usuario"}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Administrador</p>
          </div>
          <Icons.ChevronDown open={userMenuOpen} />
        </button>
        
        {/* Aquí iría el dropdown del usuario refactorizado en el siguiente paso */}
        {/* Menú de Usuario - Refactorizado */}
<div ref={menuRef} className="relative">
  <button
    onClick={() => { setUserMenuOpen(!userMenuOpen); setNotiOpen(false); }}
    className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 border ${
      userMenuOpen 
        ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' 
        : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
    }`}
  >
    <Avatar initial={initial} size="md" />
    <div className="hidden xl:block text-left">
      <p className="text-sm font-bold text-slate-100 leading-tight">
        {user?.name || "Usuario"}
      </p>
      <p className="text-[10px] font-semibold text-blue-400/60 uppercase tracking-wider mt-0.5">
        Administrador
      </p>
    </div>
    <div className={`text-slate-500 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}>
      <Icons.ChevronDown open={userMenuOpen} />
    </div>
  </button>

  {/* Dropdown del Usuario */}
  {userMenuOpen && (
    <div className="absolute right-0 top-full mt-3 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
      {/* Header del Dropdown */}
      <div className="p-5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4 mb-4">
          <Avatar initial={initial} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-white truncate">
              {user?.name || "Usuario"}
            </p>
            <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
              {user?.email || "correo@asamblea.gob.sv"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <StatusDot />
          <span className="text-[10px] font-bold text-slate-600 uppercase">ID: 4021</span>
        </div>
      </div>

      {/* Cuerpo del Dropdown / Acciones */}
      <div className="p-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
            <Icons.Logout />
          </div>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )}
</div>
      </div>
    </div>
  </div>
</header>

     {/* ══════════════════════════════════════════════════════════════════
          MOBILE TOP BAR - REFACTORIZADO
          ══════════════════════════════════════════════════════════════════ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/95 backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-4">
        {/* Línea de acento superior */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        {/* Botón Hamburger */}
        <button
          onClick={open ? onClose : onOpen}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 active:scale-95 transition-all"
        >
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>

        {/* Logo Central */}
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
            <img src={logo} alt="Logo" className="h-5 brightness-0 invert opacity-90" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">Transporte</span>
        </button>

        {/* Notificaciones Mobile */}
        <div ref={notiRef} className="relative">
          <button
            onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              notiOpen ? 'bg-primary/20 text-blue-400' : 'bg-white/5 text-slate-400'
            }`}
          >
            <Icons.Bell />
            {noLeidas > 0 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900" />
            )}
          </button>
        </div>
      </header>

      {/* Panel notificaciones mobile - Posicionamiento corregido */}
      {notiOpen && (
        <div className="lg:hidden fixed top-20 right-4 left-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-200">
          <NotificacionesPanel onClose={() => setNotiOpen(false)} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          BACKDROP (Capa de desenfoque)
          ══════════════════════════════════════════════════════════════════ */}
      {(open || notiOpen) && (
        <div
          onClick={() => { onClose(); setNotiOpen(false); }}
          className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DRAWER (Menú lateral)
          ══════════════════════════════════════════════════════════════════ */}
      <aside 
        className={`fixed top-0 left-0 z-[70] w-72 h-full bg-slate-900 border-r border-white/5 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brillo superior del Drawer */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/60 to-indigo-500/30" />

        {/* Header del Drawer / Perfil */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-6 brightness-0 invert opacity-90" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest leading-none">Asamblea</p>
              <p className="text-sm font-extrabold text-white tracking-tight">Transporte</p>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <Avatar initial={initial} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name || "Usuario"}</p>
                <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email || ""}</p>
              </div>
            </div>
            <StatusDot />
          </div>
        </div>

        {/* Navegación del Drawer */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Menú principal</p>
          {navItems.map(item => (
            <NavLinkItem 
              key={item.to} 
              item={item} 
              onClick={onClose} 
              variant="drawer" 
              pathname={location.pathname} 
            />
          ))}
        </nav>

        {/* Footer del Drawer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <div className="text-slate-500 group-hover:text-red-400 transition-colors">
              <Icons.Logout />
            </div>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM NAV (Navegación inferior)
          ══════════════════════════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => (
            <NavLinkItem 
              key={item.to} 
              item={item} 
              variant="bottom" 
              pathname={location.pathname} 
            />
          ))}
        </div>
      </nav>
    </>
  );
}