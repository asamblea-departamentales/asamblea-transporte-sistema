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
  aprobada: { dot: "#10B981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
  rechazada: { dot: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  pendiente: { dot: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  info: { dot: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
};

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

// --- Avatar Cuadrado y Serio ---
function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const dim = { sm: 32, md: 36, lg: 44 };
  return (
    <div 
      className="flex items-center justify-center font-bold text-white bg-[#1e294b] border border-blue-400/20 rounded-none flex-shrink-0"
      style={{ width: dim[size], height: dim[size] }}
    >
      {initial}
    </div>
  );
}

function StatusDot() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
      En línea
    </span>
  );
}

// --- NavLinkItem Estilo Plano ---
function NavLinkItem({ item, onClick, variant, pathname }: { item: NavItem; onClick?: () => void; variant: "desktop" | "drawer" | "bottom"; pathname: string; }) {
  const { to, label, mobileLabel, icon: Icon } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  if (variant === "bottom") {
    return (
      <NavLink to={to} end onClick={onClick} className={`flex-1 flex flex-col items-center justify-center gap-1 border-t-2 transition-all ${active ? 'border-blue-400 text-blue-400 bg-white/5' : 'border-transparent text-slate-400'}`}>
        <Icon />
        <span className="text-[10px] font-bold uppercase tracking-tighter">{mobileLabel}</span>
      </NavLink>
    );
  }

  return (
    <NavLink 
      to={to} 
      end 
      className={`flex items-center gap-3 px-6 py-3 border-l-2 transition-all font-bold text-xs uppercase tracking-widest ${
        active 
          ? 'bg-white/10 text-white border-blue-400' 
          : 'text-slate-300 border-transparent hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon />
      <span>{label}</span>
    </NavLink>
  );
}

function NotificacionesPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notificacion[]>(MOCK_NOTIFICACIONES);
  const marcarTodasLeidas = () => setNotifs(n => n.map(x => ({ ...x, leida: true })));
  const marcarLeida = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, leida: true } : x));
  const noLeidas = notifs.filter(n => !n.leida).length;

  return (
    <div className="w-full max-h-[70vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">Notificaciones</span>
          {noLeidas > 0 && <span className="bg-blue-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">{noLeidas}</span>}
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodasLeidas} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5">
            <Icons.Check /> Marcar todo
          </button>
        )}
      </div>
      <div className="overflow-y-auto flex-1">
        {notifs.map(n => {
          const cfg = notiColor[n.tipo];
          return (
            <div key={n.id} onClick={() => marcarLeida(n.id)} className={`px-5 py-4 border-b border-white/5 flex gap-4 items-start cursor-pointer transition-all ${n.leida ? 'opacity-60 hover:bg-white/[0.02]' : 'bg-blue-500/5 hover:bg-blue-500/10'}`}>
              <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-sm truncate ${n.leida ? 'font-medium text-slate-300' : 'font-bold text-white'}`}>{n.titulo}</span>
                  {!n.leida && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{n.mensaje}</p>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1 block">{n.tiempo}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-white/5">
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">Cerrar</button>
      </div>
    </div>
  );
}

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

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
    DESKTOP HEADER - GLASS CORPORATIVO (BORDES RECTOS Y LOGO BLANCO)
    ══════════════════════════════════════════════════════════════════ */}
<header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 bg-[#2d3a61]/80 backdrop-blur-md border-b border-white/10 items-center">
  {/* Acento superior lineal para mayor elegancia */}
  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-blue-400/30" />
  
  <div className="max-w-[1600px] mx-auto w-full px-6 flex items-center justify-between h-full">
    
    <div className="flex items-center h-full">
      {/* Sección del Logo: Sin redondeos y con logo en blanco (invert) */}
      <button 
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-4 h-16 pr-8 border-r border-white/10 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center justify-center">
          {/* Aplicamos filter: brightness(0) invert(1) para que el logo sea blanco puro */}
          <img 
            src={logo} 
            alt="Asamblea" 
            className="h-10 w-auto object-contain filter brightness-0 invert" 
          />
        </div>
        <div className="text-left">
          <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.25em] block leading-none">Asamblea Legislativa</span>
          <span className="text-sm font-light text-white uppercase tracking-[0.15em] mt-1 block">Transporte</span>
        </div>
      </button>

      {/* Navegación: Estilo de pestañas técnicas planas */}
      <nav className="flex items-center h-full ml-4">
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

    {/* Sección Derecha: Acciones con bordes rectos */}
    <div className="flex items-center h-full">
      
      {/* Notificaciones */}
      <div ref={notiRef} className="relative h-full flex items-center">
        <button
          onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
          className={`w-14 h-full flex items-center justify-center transition-all border-l border-white/10 ${
            notiOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="relative">
            <Icons.Bell />
            {noLeidas > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 border border-[#2d3a61] shadow-sm" />
            )}
          </div>
        </button>
      </div>

      {/* Usuario: Avatar y Dropdown Rectos */}
      <div ref={menuRef} className="relative h-full flex items-center">
        <button
          onClick={() => { setUserMenuOpen(!userMenuOpen); setNotiOpen(false); }}
          className={`flex items-center gap-4 px-6 h-full transition-all border-l border-white/10 border-r border-white/10 ${
            userMenuOpen ? 'bg-white/10' : 'hover:bg-white/5'
          }`}
        >
          {/* Avatar Cuadrado */}
          <div className="w-10 h-10 bg-slate-800 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
            {initial}
          </div>
          
          <div className="hidden xl:block text-left">
            <p className="text-[11px] font-bold text-white uppercase tracking-widest leading-none">
              {user?.name || "Usuario"}
            </p>
            <p className="text-[9px] font-medium text-blue-300 uppercase tracking-tighter mt-1">
              Administrador
            </p>
          </div>
          <Icons.ChevronDown open={userMenuOpen} />
        </button>

        {/* Dropdown 100% Recto */}
        {userMenuOpen && (
          <div className="absolute right-0 top-16 w-64 bg-[#1a243d]/95 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in duration-150">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-slate-800 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
                  {initial}
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="p-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-3 border border-red-900/40 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all"
              >
                <Icons.Logout /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</header>

      {/* MOBILE TOP BAR */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/95 backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-4">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <button onClick={open ? onClose : onOpen} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 active:scale-95">
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-5 brightness-0 invert opacity-90" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">Transporte</span>
        </button>
        <div className="relative">
          <button onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${notiOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
            <Icons.Bell />
            {noLeidas > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900" />}
          </button>
        </div>
      </header>

      {/* MOBILE NOTIFICATIONS PANEL */}
      {notiOpen && (
        <div className="lg:hidden fixed top-20 right-4 left-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-200">
          <NotificacionesPanel onClose={() => setNotiOpen(false)} />
        </div>
      )}

      {/* BACKDROP */}
      {(open || notiOpen) && (
        <div onClick={() => { onClose(); setNotiOpen(false); }} className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" />
      )}

      {/* DRAWER */}
      <aside className={`fixed top-0 left-0 z-[70] w-72 h-full bg-slate-900 border-r border-white/5 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
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
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Menú principal</p>
          {navItems.map(item => <NavLinkItem key={item.to} item={item} onClick={onClose} variant="drawer" pathname={location.pathname} />)}
        </nav>
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group">
            <div className="text-slate-500 group-hover:text-red-400 transition-colors"><Icons.Logout /></div>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => <NavLinkItem key={item.to} item={item} variant="bottom" pathname={location.pathname} />)}
        </div>
      </nav>
    </>
  );
}