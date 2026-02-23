
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ── Íconos SVG propios (estilo consistente con el login) ──────────────────────

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconNewRequest() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function IconRequests() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconChevronDown({ rotated }: { rotated: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="h-4 w-4 text-white/40 transition-transform duration-200"
      style={{ transform: rotated ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────

function NavItem({
  to,
  label,
  icon,
  onNavigate,
  forceActive,
  variant = "topbar",
  badgeCount = 0,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  onNavigate?: () => void;
  forceActive?: boolean;
  variant?: "topbar" | "bottombar" | "drawer";
  badgeCount?: number;
}) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      className={({ isActive }) => {
        const active = (forceActive ?? false) || isActive;

        if (variant === "bottombar") {
          return cx(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5",
            "min-h-[56px] px-1 py-2 text-[11px] font-bold tracking-tight",
            "transition-colors duration-200 focus:outline-none",
            active ? "text-white" : "text-white/40"
          );
        }

        if (variant === "drawer") {
          return cx(
            "flex items-center gap-3 w-full px-3 py-3 rounded-xl",
            "text-sm font-semibold tracking-tight transition-all duration-200 focus:outline-none",
            active
              ? "bg-white text-[#070537]"
              : "text-white/70 hover:text-white hover:bg-white/10"
          );
        }

        // topbar
        return cx(
          "inline-flex items-center gap-2 h-10 px-4 rounded-xl",
          "text-sm font-semibold tracking-tight transition-all duration-200 focus:outline-none",
          active
            ? "bg-white text-[#070537]"
            : "text-white/70 hover:text-white hover:bg-white/10"
        );
      }}
    >
      {({ isActive }) => {
        const active = (forceActive ?? false) || isActive;

        if (variant === "bottombar") {
          return (
            <>
              <span className={cx(
                "relative grid size-8 place-items-center rounded-xl transition-all duration-200",
                active ? "bg-white/15 text-white" : "text-white/40"
              )}>
                {icon}
                {badgeCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#070537] ring-2 ring-[#070537]">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
              {active && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-white" />
              )}
            </>
          );
        }

        if (variant === "drawer") {
          return (
            <>
              <span className={cx(
                "grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-200",
                active ? "bg-[#070537] text-white" : "bg-white/8 text-white/60"
              )}>
                {icon}
              </span>
              <span className="flex-1 truncate">{label}</span>
              {badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#070537]">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </>
          );
        }

        // topbar
        return (
          <>
            <span className={cx(
              "grid size-6 place-items-center rounded-lg transition-all duration-200",
              active ? "text-[#070537]" : "text-white/60"
            )}>
              {icon}
            </span>
            <span>{label}</span>
            {badgeCount > 0 && (
              <span className={cx(
                "ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                active ? "bg-[#070537] text-white" : "bg-white text-[#070537]"
              )}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

// ── Sidebar principal ─────────────────────────────────────────────────────────

export default function Sidebar({ open, onClose, onOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingCount] = useState(3);

  const isNewRequestActive =
    location.pathname === "/nueva-solicitud" ||
    location.pathname.startsWith("/solicitudes/");

  const initials = useMemo(
    () => (user?.name?.trim()?.[0] || "U").toUpperCase(),
    [user?.name]
  );

  const handleLogout = async () => {
    onClose();
    setShowUserMenu(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const toggle = () => (open ? onClose() : onOpen());

  useEffect(() => {
    onClose();
    setShowUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); setShowUserMenu(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-user-menu-root]"))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* ══════════════ MÓVIL / TABLET (oculto en lg+) ══════════════ */}

      {/* Header superior móvil */}
      <header className="fixed left-0 right-0 top-0 z-50 lg:hidden">
        <div className="flex h-14 items-center justify-between bg-[#070537] border-b border-white/10 px-4">
          {/* Hamburguesa */}
          <button
            type="button"
            onClick={toggle}
            className="relative grid size-10 place-items-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-200 focus:outline-none"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{ opacity: open ? 1 : 0, transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
              <IconClose />
            </span>
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{ opacity: open ? 0 : 1, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
              <IconMenu />
            </span>
          </button>

          {/* Logo centrado */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 hover:bg-white/8 active:scale-95 transition-all duration-200"
          >
            <img src={logo} alt="Asamblea Legislativa" className="h-7 w-auto brightness-0 invert" />
            <span className="text-sm font-bold text-white tracking-widest uppercase">Transporte</span>
          </button>

          {/* Avatar */}
          <button
            type="button"
            onClick={toggle}
            className="grid size-10 place-items-center rounded-xl bg-white/10 text-white text-sm font-bold border border-white/20 active:scale-90 transition-all duration-200 focus:outline-none"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer móvil */}
      <aside
        id="mobile-drawer"
        className="fixed left-0 top-0 z-50 flex h-full w-[272px] flex-col lg:hidden bg-[#070537] border-r border-white/10 transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: open ? "8px 0 32px rgba(0,0,0,0.4)" : "none",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera drawer */}
        <div className="mt-14 flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <div className="rounded-xl bg-white/10 p-2 border border-white/15">
            <img src={logo} alt="Asamblea Legislativa" className="h-7 w-auto brightness-0 invert" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Gestión institucional</p>
            <p className="text-sm font-bold text-white">Transporte</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Menú principal
          </p>
          <div className="space-y-1">
            <NavItem to="/dashboard" label="Dashboard" variant="drawer" onNavigate={onClose} icon={<IconDashboard />} />
            <NavItem to="/nueva-solicitud" label="Nueva solicitud" variant="drawer" onNavigate={onClose} forceActive={isNewRequestActive} icon={<IconNewRequest />} />
            <NavItem to="/mis-solicitudes" label="Mis solicitudes" variant="drawer" onNavigate={onClose} badgeCount={pendingCount} icon={<IconRequests />} />
          </div>
        </nav>

        {/* Footer drawer: usuario + cerrar sesión */}
        <div className="border-t border-white/10 px-3 py-4 space-y-2"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          {/* Info usuario */}
          <div className="flex items-center gap-3 rounded-xl bg-white/8 px-3 py-3 border border-white/10">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#070537] text-sm font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{user?.name || "Usuario"}</p>
              <p className="truncate text-xs text-white/40">{user?.email || ""}</p>
            </div>
          </div>

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/8 px-4 py-3 text-sm font-semibold text-white/70 border border-white/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/20 active:scale-[0.98] transition-all duration-200 focus:outline-none"
          >
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex items-stretch bg-[#070537] border-t border-white/10"
        aria-label="Navegación principal"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <NavItem to="/dashboard" label="Dashboard" variant="bottombar" icon={<IconDashboard />} />
        <NavItem to="/nueva-solicitud" label="Solicitud" variant="bottombar" forceActive={isNewRequestActive} icon={<IconNewRequest />} />
        <NavItem to="/mis-solicitudes" label="Solicitudes" variant="bottombar" badgeCount={pendingCount} icon={<IconRequests />} />
      </nav>

      {/* ══════════════ DESKTOP (lg+) ══════════════ */}
      <header className="hidden lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-50 lg:block">
        <div className="bg-[#070537] border-b border-white/10">
          <div className="mx-auto max-w-[1800px] px-6 xl:px-10">
            <div className="flex h-[66px] items-center justify-between gap-6">

              {/* Brand */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/8 transition-all duration-200 focus:outline-none"
              >
                <img src={logo} alt="Asamblea Legislativa" className="h-8 w-auto brightness-0 invert" />
                <div className="hidden border-l border-white/15 pl-3 xl:block">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Gestión institucional</p>
                  <p className="text-sm font-bold text-white">Transporte</p>
                </div>
              </button>

              {/* Nav central */}
              <nav className="flex-1">
                <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-1">
                  <NavItem to="/dashboard" label="Dashboard" variant="topbar" icon={<IconDashboard />} />
                  <NavItem to="/nueva-solicitud" label="Nueva solicitud" variant="topbar" forceActive={isNewRequestActive} icon={<IconNewRequest />} />
                  <NavItem to="/mis-solicitudes" label="Mis solicitudes" variant="topbar" badgeCount={pendingCount} icon={<IconRequests />} />
                </div>
              </nav>

              {/* User menu */}
              <div className="relative shrink-0" data-user-menu-root>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-white/10 transition-all duration-200 focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                >
                  <div className="grid size-8 place-items-center rounded-lg bg-white text-[#070537] text-sm font-bold">
                    {initials}
                  </div>
                  <div className="hidden min-w-0 text-left sm:block">
                    <p className="max-w-[140px] truncate text-sm font-bold text-white">{user?.name || "Usuario"}</p>
                    <p className="max-w-[140px] truncate text-xs text-white/40">{user?.email || ""}</p>
                  </div>
                  <IconChevronDown rotated={showUserMenu} />
                </button>

                {/* Dropdown */}
                <div
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 shadow-2xl transition-all duration-200 origin-top-right"
                  style={{
                    opacity: showUserMenu ? 1 : 0,
                    transform: showUserMenu ? "scale(1) translateY(0)" : "scale(0.95) translateY(-6px)",
                    pointerEvents: showUserMenu ? "auto" : "none",
                  }}
                  role="menu"
                >
                  {/* Header del dropdown */}
                  <div className="bg-[#070537] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#070537] text-sm font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{user?.name || "Usuario"}</p>
                        <p className="truncate text-xs text-white/50">{user?.email || ""}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acción */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 focus:outline-none"
                      role="menuitem"
                    >
                      <IconLogout />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>
    </>
  );
}