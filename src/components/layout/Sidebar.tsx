// src/components/layout/Sidebar.tsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { GlobalLoading } from "../GlobalLoading";
import logo from "../../assets/asamble.png";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props   = { open: boolean; onClose: () => void; onOpen: () => void };
type NavItem = { to: string; label: string; mobileLabel: string; icon: () => React.ReactElement; badge?: number };

// ─── Design tokens (Reverted to Original Gradient) ────────────────────────────

const T = {
  headerBg:    "linear-gradient(135deg, #0f2548 0%, #1a3a75 100%)",
  bottomNavBg: "linear-gradient(180deg, #163166 0%, #0f2548 100%)",
  goldenLine:  "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.85) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)",
  drawerGlow:  "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.4) 40%, rgba(251,191,36,0.4) 60%, transparent 100%)",
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
  const active = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <NavLink to={to} end
      className={cn(
        "group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200",
        active
          ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-t border-white-[0.15]"
          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent",
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all",
        active ? "bg-blue-500/15 text-blue-300 shadow-[inset_0_0_8px_rgba(59,130,246,0.2)]" : "text-white/30 group-hover:text-white/70"
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
  const active = pathname === to || pathname.startsWith(`${to}/`);

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
        "flex items-center justify-center w-8 h-8 flex-shrink-0",
        active ? "text-white" : "text-white/40",
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

// ─── Assembly Logo Placeholder ────────────────────────────────────────────────

function AssemblyLogo({ className = "h-[80px] brightness-0 invert opacity-100 drop-shadow-lg mb-1" }: { className?: string }) {
  return (
    <img src={logo} alt="Asamblea" className={className} />
  );
}


// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Sidebar({ open, onClose, onOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  const initial = (user?.name?.trim()?.[0] || "M").toUpperCase();

  const navItems: NavItem[] = [
    { to: "/dashboard",   label: "Mis Viajes",           mobileLabel: "Viajes",      icon: Icons.Dashboard },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    onClose();
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const iconBtnClass = (active: boolean) => cn(
    "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all",
    active
      ? "bg-white/10 text-white"
      : "text-white/60 hover:bg-white/5 hover:text-white",
  );

  return (
    <>
      {loggingOut && <GlobalLoading message="Cerrando Sesión Segura" isClosing={true} />}

      {/* ── DESKTOP SIDEBAR (Permanent Left) ────────────────────────────────── */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 z-50 w-[280px] h-screen flex-col border-r border-[#1a2d54]"
        style={{ background: T.headerBg, boxShadow: "4px 0 30px rgba(15,37,72,0.15)" }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-[2px]" style={{ background: T.goldenLine, opacity: 0.6 }} />

        {/* Brand / Logo Area */}
        <div className="flex flex-col items-center justify-center gap-4 px-5 pt-10 pb-8 border-b border-white/5 relative text-center">
          <AssemblyLogo />
          <div className="flex flex-col items-center">
            <span className="block text-[10px] font-black uppercase tracking-[.2em] text-[#86a8e7] leading-tight mb-0.5">
              Asamblea Legislativa
            </span>
            <span className="block text-[18px] font-extrabold text-white leading-tight">
              Transporte
            </span>
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
        <div className="px-6 py-5 pb-8 mt-auto flex flex-col gap-5 border-t border-white/5 bg-black/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar initial={initial} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-white truncate leading-tight tracking-wide">{user?.name || "Motorista"}</p>
                  <p className="text-[11px] font-medium text-[#86a8e7] truncate mt-0.5">
                    {(user as any)?.role || "Motorista"}
                  </p>
                </div>
              </div>
              
              <div className="relative flex-shrink-0">
                <button className={iconBtnClass(false)} title="Notificaciones">
                  <Icons.Bell />
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[12.5px] font-bold tracking-wide text-white/70 hover:text-red-300 hover:bg-white/5 transition-all duration-200 border border-transparent"
            >
              <Icons.Logout /> Cerrar Sesión
            </button>
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

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3">
          <AssemblyLogo className="h-[28px] brightness-0 invert opacity-100 drop-shadow-md" />
          <span className="text-[16px] font-extrabold text-white tracking-wide">Transporte</span>
        </button>

        <div className="relative">
          <button className={iconBtnClass(false)}>
            <Icons.Bell />
          </button>
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
          <div className="flex flex-col items-center gap-3 mb-6 px-1 pt-4 text-center">
            <AssemblyLogo className="h-[60px] brightness-0 invert opacity-100 drop-shadow-lg mb-1" />
            <div className="flex flex-col justify-center mt-2">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#86a8e7] leading-none mb-1">Asamblea</p>
              <p className="text-[15px] font-extrabold text-white leading-none">Transporte</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
            <Avatar initial={initial} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white truncate leading-none mb-1.5">{user?.name || "Motorista"}</p>
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
