import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import React, { useState, useRef, useEffect } from "react";

// --- Tipos y Mocks ---
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

// --- Iconos Minimalistas ---
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="0" /><rect x="13" y="3" width="8" height="8" rx="0" />
      <rect x="3" y="13" width="8" height="8" rx="0" /><rect x="13" y="13" width="8" height="8" rx="0" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="0" /><path d="M12 8v8M8 12h8" />
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M9 6h11M9 12h11M9 18h6" />
      <rect x="4" y="5" width="2" height="2" fill="currentColor" />
      <rect x="4" y="11" width="2" height="2" fill="currentColor" />
      <rect x="4" y="17" width="2" height="2" fill="currentColor" />
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5V5h4" /><path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  ChevronDown: ({ open }: { open: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ transition: "transform 200ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
};

// --- Componentes de Apoyo ---
function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const dim = { sm: 30, md: 32, lg: 50 };
  return (
    <div 
      className="flex items-center justify-center font-bold text-white bg-white/[0.03] border border-white/[0.08] rounded-none flex-shrink-0"
      style={{ width: dim[size], height: dim[size], fontSize: size === 'lg' ? 18 : 11 }}
    >
      {initial}
    </div>
  );
}

function StatusDot() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-white/[0.03] border border-white/[0.05] text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em]">
      <span className="w-1 h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
      En línea
    </span>
  );
}

function NavLinkItem({ item, onClick, variant, pathname }: { item: NavItem; onClick?: () => void; variant: "desktop" | "drawer" | "bottom"; pathname: string; }) {
  const { to, label, mobileLabel, icon: Icon } = item;
  const active = pathname === to || (to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/"));

  if (variant === "bottom") {
    return (
      <NavLink to={to} end onClick={onClick} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative ${active ? 'text-white' : 'text-slate-500'}`}>
        <Icon />
        <span className="text-[9px] font-bold uppercase tracking-wider">{mobileLabel}</span>
        {active && <div className="absolute top-0 left-0 right-0 h-[1px] bg-blue-500" />}
      </NavLink>
    );
  }

  if (variant === "drawer") {
    return (
      <NavLink to={to} end onClick={onClick} className={`flex items-center gap-4 px-6 py-4 transition-all border-l-2 ${active ? 'bg-white/[0.03] text-white border-blue-500' : 'text-slate-400 border-transparent hover:bg-white/[0.01]'}`}>
        <Icon />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{label}</span>
      </NavLink>
    );
  }

  return (
    <NavLink to={to} end className={`flex items-center gap-3 px-8 h-16 transition-all font-bold text-[10px] uppercase tracking-[0.3em] relative ${active ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
      <Icon />
      <span>{label}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />}
    </NavLink>
  );
}

function NotificacionesPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notificacion[]>(MOCK_NOTIFICACIONES);
  const marcarTodasLeidas = () => setNotifs(n => n.map(x => ({ ...x, leida: true })));
  const marcarLeida = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, leida: true } : x));
  const noLeidas = notifs.filter(n => !n.leida).length;

  return (
    <div className="w-full max-h-[70vh] bg-[#1e293b]/90 backdrop-blur-3xl border border-white/[0.05] rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Notificaciones</span>
        <div className="flex gap-4">
          {noLeidas > 0 && (
            <button onClick={marcarTodasLeidas} className="text-[9px] font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-colors">
              Marcar todo
            </button>
          )}
          <button onClick={onClose} className="text-[9px] font-bold text-slate-500 uppercase hover:text-white transition-colors">
            Cerrar
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {notifs.map(n => {
          const cfg = notiColor[n.tipo];
          return (
            <div key={n.id} onClick={() => marcarLeida(n.id)} className={`px-6 py-5 border-b border-white/[0.03] flex gap-5 items-start cursor-pointer transition-all ${n.leida ? 'opacity-40' : 'bg-white/[0.02]'}`}>
              <div className="w-1.5 h-1.5 mt-1.5 flex-shrink-0" style={{ backgroundColor: cfg.dot }} />
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] uppercase tracking-wider mb-1 ${n.leida ? 'text-slate-400' : 'font-bold text-white'}`}>{n.titulo}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed truncate">{n.mensaje}</p>
                <span className="text-[8px] text-slate-600 uppercase mt-2 block tracking-tighter">{n.tiempo}</span>
              </div>
            </div>
          );
        })}
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

  useEffect(() => { onClose(); setUserMenuOpen(false); setNotiOpen(false); }, [location.pathname, onClose]);

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
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 bg-[#1e293b]/60 backdrop-blur-2xl border-b border-white/[0.05] items-center">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-blue-500/20" />
        <div className="max-w-[1600px] mx-auto w-full px-10 flex items-center justify-between h-full">
          
          <div className="flex items-center h-full">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-6 h-16 pr-10 border-r border-white/[0.05] hover:bg-white/[0.02] transition-all">
              <img src={logo} alt="Asamblea" className="h-10 w-auto object-contain brightness-0 invert opacity-80" />
              <div className="text-left">
                <span className="text-[9px] font-bold text-blue-400/40 uppercase tracking-[0.4em] block leading-none">Asamblea Legislativa</span>
                <span className="text-sm font-light text-slate-100 uppercase tracking-[0.25em] mt-1.5 block leading-none">Transporte</span>
              </div>
            </button>

            <nav className="flex items-center h-full ml-4">
              {navItems.map(item => <NavLinkItem key={item.to} item={item} variant="desktop" pathname={location.pathname} />)}
            </nav>
          </div>

          <div className="flex items-center h-full">
            <div ref={notiRef} className="relative h-full flex items-center">
              <button onClick={() => { setNotiOpen(!notiOpen); setUserMenuOpen(false); }}
                className={`w-16 h-full flex items-center justify-center transition-all border-l border-white/[0.05] ${notiOpen ? 'bg-white/[0.05] text-white' : 'text-slate-500 hover:text-slate-200'}`}>
                <div className="relative">
                  <Icons.Bell />
                  {noLeidas > 0 && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 shadow-[0_0_12px_#3b82f6]" />}
                </div>
              </button>
              {notiOpen && <div className="absolute right-0 top-16 w-80 shadow-2xl"><NotificacionesPanel onClose={() => setNotiOpen(false)} /></div>}
            </div>

            <div ref={menuRef} className="relative h-full flex items-center">
              <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotiOpen(false); }}
                className={`flex items-center gap-4 px-8 h-full transition-all border-l border-white/[0.05] border-r border-white/[0.05] ${userMenuOpen ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}>
                <Avatar initial={initial} />
                <div className="hidden xl:block text-left">
                  <p className="text-[10px] font-bold text-slate-100 uppercase tracking-[0.2em] leading-none">{user?.name || "Usuario"}</p>
                  <p className="text-[8px] font-bold text-blue-500/60 uppercase tracking-tighter mt-1.5">Administrador</p>
                </div>
                <Icons.ChevronDown open={userMenuOpen} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 top-16 w-64 bg-[#1e293b]/90 backdrop-blur-3xl border border-white/[0.05] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-10 border-b border-white/[0.05] flex flex-col items-center text-center gap-5">
                    <Avatar initial={initial} size="lg" />
                    <div>
                      <p className="text-[11px] font-bold text-white uppercase tracking-[0.3em]">{user?.name}</p>
                      <p className="text-[9px] text-slate-500 mt-2 tracking-tighter font-mono">{user?.email}</p>
                    </div>
                    <StatusDot />
                  </div>
                  <div className="p-3">
                    <button onClick={handleLogout} className="w-full py-4 border border-red-500/10 text-red-500/60 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all">
                      <Icons.Logout /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-white/[0.05] flex items-center justify-between px-6">
        <button onClick={onOpen} className="text-slate-400 active:scale-90 transition-transform"><Icons.X /></button>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-6 brightness-0 invert opacity-80" />
          <span className="text-sm font-bold text-white uppercase tracking-widest">Transporte</span>
        </button>
        <div className="relative">
          <button onClick={() => setNotiOpen(!notiOpen)} className="text-slate-400"><Icons.Bell /></button>
          {notiOpen && <div className="absolute right-0 top-12 w-[calc(100vw-3rem)] z-[100]"><NotificacionesPanel onClose={() => setNotiOpen(false)} /></div>}
        </div>
      </header>

      <aside className={`fixed top-0 left-0 z-[70] w-72 h-full bg-[#1e293b] border-r border-white/5 transition-transform duration-300 ease-out flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-10 border-b border-white/[0.05] flex flex-col gap-8">
          <img src={logo} alt="Logo" className="h-10 w-auto self-start brightness-0 invert opacity-80" />
          <div className="flex items-center gap-4">
            <Avatar initial={initial} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{user?.name}</p>
              <StatusDot />
            </div>
          </div>
        </div>
        <nav className="flex-1 py-6 flex flex-col">
          {navItems.map(item => <NavLinkItem key={item.to} item={item} onClick={onClose} variant="drawer" pathname={location.pathname} />)}
        </nav>
        <div className="p-6 border-t border-white/[0.05]">
          <button onClick={handleLogout} className="w-full py-4 border border-white/[0.05] text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] hover:text-white transition-all">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {(open || notiOpen) && <div onClick={() => { onClose(); setNotiOpen(false); }} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#1e293b]/80 backdrop-blur-xl border-t border-white/[0.05] flex items-center justify-around">
        {navItems.map(item => <NavLinkItem key={item.to} item={item} variant="bottom" pathname={location.pathname} />)}
      </nav>
    </>
  );
}