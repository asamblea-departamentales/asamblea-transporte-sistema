import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
            "min-h-[56px] px-1 py-2 text-[10px] font-semibold tracking-tight",
            "transition-colors duration-200 focus:outline-none",
            active ? "text-sky-400" : "text-slate-400"
          );
        }

        if (variant === "drawer") {
          return cx(
            "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl",
            "text-[15px] font-semibold tracking-tight transition-all duration-200 focus:outline-none",
            active
              ? "bg-white/15 text-white ring-1 ring-white/20"
              : "text-slate-300/85 hover:text-white hover:bg-white/8"
          );
        }

        return cx(
          "inline-flex items-center gap-2 h-11 px-4 rounded-full",
          "text-[14px] font-semibold tracking-tight transition-all duration-200 focus:outline-none",
          active
            ? "bg-white/15 text-white ring-1 ring-white/20"
            : "text-slate-200/85 hover:text-white hover:bg-white/8 ring-1 ring-transparent hover:ring-white/15"
        );
      }}
    >
      {({ isActive }) => {
        const active = (forceActive ?? false) || isActive;

        if (variant === "bottombar") {
          return (
            <>
              <span className={cx("relative grid size-8 place-items-center rounded-xl transition-all duration-200", active ? "bg-sky-500/15 text-sky-400" : "text-slate-400")}>
                <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
                {badgeCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-white ring-2 ring-[#0A1424]">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </span>
              <span className="leading-none">{label}</span>
              {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-sky-400" />}
            </>
          );
        }

        if (variant === "drawer") {
          return (
            <>
              <span className={cx("grid size-10 shrink-0 place-items-center rounded-2xl transition-all duration-200", active ? "bg-white/15 text-white" : "bg-white/5 text-slate-300/90")}>
                <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
              </span>
              <span className="flex-1 truncate">{label}</span>
              {badgeCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </>
          );
        }

        return (
          <>
            <span className={cx("grid size-8 place-items-center rounded-full transition-all duration-200", active ? "bg-white/15 text-white" : "bg-white/5 text-slate-200/90")}>
              <span className="[&>svg]:h-[16px] [&>svg]:w-[16px]">{icon}</span>
            </span>
            <span className="truncate">{label}</span>
            {badgeCount > 0 && (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

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

  // Cierra al cambiar ruta
  useEffect(() => {
    onClose();
    setShowUserMenu(false);
  }, [location.pathname]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        setShowUserMenu(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Click fuera del user menu (desktop)
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
      {/* ══════════════════════════════════════════════════════
          MÓVIL + TABLET  (oculto en lg+)
      ══════════════════════════════════════════════════════ */}

      {/* Header fijo superior */}
      <header className="fixed left-0 right-0 top-0 z-50 lg:hidden">
        <div className="flex h-14 items-center justify-between bg-gradient-to-b from-[#0B1220] to-[#0A1424] border-b border-white/10 backdrop-blur-xl px-4">

          {/* ★ Botón hamburguesa — toggle real del drawer */}
          <button
            type="button"
            onClick={toggle}
            className="relative inline-flex items-center justify-center size-11 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 active:scale-90 transition-all duration-200 focus:outline-none"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{ opacity: open ? 1 : 0, transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
            >
              <X className="h-5 w-5" />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{ opacity: open ? 0 : 1, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              <Menu className="h-5 w-5" />
            </span>
          </button>

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-white/8 active:scale-95 transition-all duration-200"
          >
            <img src={logo} alt="Asamblea Legislativa" className="h-8 w-auto opacity-95" />
            <span className="text-[13px] font-bold text-white tracking-tight">Transporte</span>
          </button>

          {/* Avatar — también abre el drawer */}
          <button
            type="button"
            onClick={toggle}
            className="grid size-11 place-items-center rounded-xl bg-sky-500/20 text-sky-300 text-sm font-bold active:scale-90 transition-all duration-200 focus:outline-none"
            aria-label="Abrir menú de usuario"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ★ Drawer — incluye cerrar sesión al fondo */}
      <aside
        id="mobile-drawer"
        className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col lg:hidden bg-[#0A1424] border-r border-white/10 transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: open ? "4px 0 40px rgba(0,0,0,0.5)" : "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        {/* Cabecera del drawer */}
        <div className="mt-14 flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/8 p-2">
              <img src={logo} alt="Asamblea Legislativa" className="h-8 w-auto opacity-95" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Gestión institucional
              </p>
              <p className="text-[14px] font-bold text-white">Transporte</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-slate-400 hover:text-white hover:bg-white/8 active:scale-90 transition-all duration-200 focus:outline-none"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Menú
          </p>
          <div className="space-y-1">
            <NavItem to="/dashboard" label="Dashboard" variant="drawer" onNavigate={onClose} icon={<LayoutDashboard />} />
            <NavItem to="/nueva-solicitud" label="Nueva solicitud" variant="drawer" onNavigate={onClose} forceActive={isNewRequestActive} icon={<FilePlus2 />} />
            <NavItem to="/mis-solicitudes" label="Mis solicitudes" variant="drawer" onNavigate={onClose} badgeCount={pendingCount} icon={<ClipboardList />} />
          </div>
        </nav>

        {/* ★ Footer: usuario + cerrar sesión */}
        <div
          className="border-t border-white/10 px-3 py-4 space-y-2"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {/* Info usuario */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/6 px-4 py-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/20 text-sky-300 text-sm font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-white">{user?.name || "Usuario"}</p>
              <p className="truncate text-[11px] text-slate-400">{user?.email || ""}</p>
            </div>
          </div>

          {/* ★ Cerrar sesión — en el drawer, accesible en móvil, tablet y desktop pequeño */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3.5 text-[14px] font-bold text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 hover:ring-red-500/40 active:scale-[0.98] transition-all duration-200 focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex items-stretch bg-gradient-to-t from-[#0B1220] to-[#0A1424] border-t border-white/10 backdrop-blur-xl"
        aria-label="Navegación principal"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <NavItem to="/dashboard" label="Dashboard" variant="bottombar" icon={<LayoutDashboard />} />
        <NavItem to="/nueva-solicitud" label="Solicitud" variant="bottombar" forceActive={isNewRequestActive} icon={<FilePlus2 />} />
        <NavItem to="/mis-solicitudes" label="Solicitudes" variant="bottombar" badgeCount={pendingCount} icon={<ClipboardList />} />
      </nav>


      {/* ══════════════════════════════════════════════════════
          DESKTOP  (lg+)
      ══════════════════════════════════════════════════════ */}
      <header className="hidden lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-50 lg:block">
        <div className="bg-gradient-to-b from-[#0B1220] to-[#0A1424] backdrop-blur-xl border-b border-white/10">
          <div className="mx-auto max-w-[1800px] px-6 xl:px-10">
            <div className="flex h-[68px] items-center justify-between gap-6">

              {/* Brand */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex shrink-0 items-center gap-4 rounded-2xl px-3 py-2 hover:bg-white/8 transition-all duration-200 hover:scale-[1.02] focus:outline-none"
              >
                <img src={logo} alt="Asamblea Legislativa" className="h-9 w-auto opacity-95" />
                <div className="hidden border-l border-white/12 pl-4 xl:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gestión institucional</p>
                  <p className="text-[13px] font-bold text-white">Transporte</p>
                </div>
              </button>

              {/* Nav central */}
              <nav className="flex-1">
                <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-1.5">
                  <NavItem to="/dashboard" label="Dashboard" variant="topbar" icon={<LayoutDashboard />} />
                  <NavItem to="/nueva-solicitud" label="Nueva solicitud" variant="topbar" forceActive={isNewRequestActive} icon={<FilePlus2 />} />
                  <NavItem to="/mis-solicitudes" label="Mis solicitudes" variant="topbar" badgeCount={pendingCount} icon={<ClipboardList />} />
                </div>
              </nav>

              {/* User menu */}
              <div className="relative shrink-0" data-user-menu-root>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2 text-slate-200/90 hover:bg-white/8 hover:text-white transition-all duration-200 hover:scale-[1.02] focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                >
                  <div className="grid size-9 place-items-center rounded-xl bg-sky-500/20 text-sky-300 text-sm font-bold">
                    {initials}
                  </div>
                  <div className="hidden min-w-0 text-left sm:block">
                    <p className="max-w-[160px] truncate text-[13px] font-bold text-white">{user?.name || "Usuario"}</p>
                    <p className="max-w-[160px] truncate text-[11px] text-slate-400">{user?.email || ""}</p>
                  </div>
                  <ChevronDown
                    className="h-4 w-4 text-slate-400 transition-transform duration-200"
                    style={{ transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl ring-1 ring-black/10 shadow-xl transition-all duration-200 origin-top-right"
                  style={{
                    opacity: showUserMenu ? 1 : 0,
                    transform: showUserMenu ? "scale(1) translateY(0)" : "scale(0.95) translateY(-4px)",
                    pointerEvents: showUserMenu ? "auto" : "none",
                  }}
                  role="menu"
                >
                  <div className="px-4 py-3.5">
                    <p className="truncate text-[14px] font-bold text-slate-900">{user?.name || "Usuario"}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email || ""}</p>
                  </div>
                  <div className="border-t border-black/8 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 focus:outline-none"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4 opacity-80" />
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