import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = { open: boolean; onClose: () => void; onOpen: () => void };
type Variant = "top" | "drawer" | "bottom";

// ─── Utility ─────────────────────────────────────────────────────────────────

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="7" height="7" rx="1.5" />
    <rect x="11" y="2" width="7" height="7" rx="1.5" />
    <rect x="2" y="11" width="7" height="7" rx="1.5" />
    <rect x="11" y="11" width="7" height="7" rx="1.5" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 4v12M4 10h12" />
  </svg>
);

const IconList = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 6h9M7 10h9M7 14h5" />
    <circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="14" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconMenu = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
    <path d="M3 5h14M3 10h10M3 15h7" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
    <path d="M15 5L5 15M5 5l10 10" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" />
    <path d="M13 14l4-4-4-4M17 10H7" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    className={cx("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
  >
    <path d="M4 6l4 4 4-4" />
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-9 h-9 text-sm",
  };
  return (
    <div
      className={cx(
        "rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center shrink-0 select-none font-['IBM_Plex_Sans',system-ui]",
        sizes[size]
      )}
    >
      {initial}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  to,
  label,
  icon,
  badge = 0,
  forceActive,
  variant = "top",
  onNav,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  forceActive?: boolean;
  variant?: Variant;
  onNav?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNav}
      className={({ isActive }) => {
        const active = (forceActive ?? false) || isActive;

        if (variant === "bottom") {
          return cx(
            "relative flex flex-1 flex-col items-center justify-center gap-1 min-h-[56px] px-1 py-2 text-[10px] font-medium tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset",
            active ? "text-blue-600" : "text-slate-400"
          );
        }

        if (variant === "drawer") {
          return cx(
            "group flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13.5px] font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
            active
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          );
        }

        // top
        return cx(
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
          active
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        );
      }}
    >
      {({ isActive }) => {
        const active = (forceActive ?? false) || isActive;

        if (variant === "bottom") {
          return (
            <>
              <span
                className={cx(
                  "flex w-10 h-8 items-center justify-center rounded-md transition-colors duration-150",
                  active ? "bg-blue-50 text-blue-600" : "text-slate-400"
                )}
              >
                {icon}
              </span>
              <span>{label}</span>
              {active && (
                <span className="absolute bottom-0 inset-x-4 h-[2px] rounded-t-full bg-blue-600" />
              )}
            </>
          );
        }

        if (variant === "drawer") {
          return (
            <>
              <span
                className={cx(
                  "grid w-8 h-8 shrink-0 place-items-center rounded-md transition-colors duration-150",
                  active ? "bg-blue-100 text-blue-700" : "text-slate-400 group-hover:text-slate-600"
                )}
              >
                {icon}
              </span>
              <span className="flex-1 truncate">{label}</span>
              {badge > 0 && <Badge count={badge} />}
              {active && <span className="h-4 w-0.5 rounded-full bg-blue-600 ml-1" />}
            </>
          );
        }

        // top
        return (
          <>
            <span className={cx("transition-colors duration-150", active ? "text-blue-700" : "text-slate-400")}>
              {icon}
            </span>
            <span>{label}</span>
            {badge > 0 && <Badge count={badge} />}
          </>
        );
      }}
    </NavLink>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

//const Divider = () => <div className="border-t border-slate-200" />;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Sidebar({ open, onClose, onOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenu, setUserMenu] = useState(false);
  const [pending] = useState(3);

  const isNew =
    location.pathname === "/nueva-solicitud" ||
    location.pathname.startsWith("/solicitudes/");

  const initial = useMemo(
    () => (user?.name?.trim()?.[0] || "U").toUpperCase(),
    [user?.name]
  );

  const handleLogout = async () => {
    onClose();
    setUserMenu(false);
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    onClose();
    setUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        setUserMenu(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-user-menu-root]")) {
        setUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
    {
      to: "/nueva-solicitud",
      label: "Nueva solicitud",
      icon: <IconPlus />,
      forceActive: isNew,
    },
    {
      to: "/mis-solicitudes",
      label: "Mis solicitudes",
      icon: <IconList />,
      badge: pending,
    },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════
          MOBILE  (<lg)
      ══════════════════════════════════════════ */}

      {/* ── Top bar ── */}
      <header className="fixed inset-x-0 top-0 z-50 lg:hidden bg-white border-b border-slate-200">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => (open ? onClose() : onOpen())}
            aria-label="Menú"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            className="grid size-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {open ? <IconX /> : <IconMenu />}
          </button>

          {/* Brand */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors hover:bg-slate-50"
          >
            <img src={logo} alt="" className="h-5 w-auto opacity-70" />
            <span className="text-[13px] font-semibold text-slate-700 tracking-wide uppercase">
              Transporte
            </span>
          </button>

          {/* Avatar trigger */}
          <button
            type="button"
            onClick={() => (open ? onClose() : onOpen())}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
            aria-label="Perfil"
          >
            <Avatar initial={initial} size="md" />
          </button>
        </div>
      </header>

      {/* ── Backdrop ── */}
      <div
        className={cx(
          "fixed inset-0 z-40 lg:hidden bg-slate-900/40 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer ── */}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={cx(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-white border-r border-slate-200 lg:hidden transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Blue accent strip */}
        <div className="h-[3px] bg-blue-600 shrink-0" />

        {/* Drawer header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200 mt-14">
          <div className="grid w-9 h-9 shrink-0 place-items-center rounded-md bg-slate-100">
            <img src={logo} alt="" className="h-5 w-auto opacity-70" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              Asamblea Legislativa
            </p>
            <p className="text-[14px] font-semibold text-slate-800 leading-tight">
              Transporte
            </p>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-slate-50">
            <Avatar initial={initial} size="lg" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">
                {user?.name || "Usuario"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Navegación
          </p>
          <div className="space-y-0.5">
            {nav.map((n) => (
              <NavItem
                key={n.to}
                to={n.to}
                label={n.label}
                icon={n.icon}
                variant="drawer"
                onNav={onClose}
                forceActive={n.forceActive}
                badge={n.badge}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-200" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Bottom nav bar ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden flex bg-white border-t border-slate-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navegación principal"
      >
        {nav.map((n) => (
          <NavItem
            key={n.to}
            to={n.to}
            label={n.label}
            icon={n.icon}
            variant="bottom"
            forceActive={n.forceActive}
            badge={n.badge}
          />
        ))}
      </nav>

      {/* ══════════════════════════════════════════
          DESKTOP  (≥lg)
      ══════════════════════════════════════════ */}

      <header className="hidden lg:block fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200">
        {/* Blue institutional accent strip */}
        <div className="h-[3px] bg-blue-600" />

        <div className="mx-auto max-w-[1800px] px-6 xl:px-10">
          <div className="flex h-[58px] items-center gap-6">

            {/* ── Brand ── */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex shrink-0 items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <div className="grid w-8 h-8 shrink-0 place-items-center rounded-md bg-slate-100">
                <img src={logo} alt="" className="h-5 w-auto opacity-70" />
              </div>
              <div className="hidden xl:block pl-3 border-l border-slate-200">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                  Asamblea Legislativa
                </p>
                <p className="text-[14px] font-semibold text-slate-800 leading-tight">
                  Transporte
                </p>
              </div>
            </button>

            {/* ── Nav ── */}
            <nav className="flex-1 flex items-center justify-center" aria-label="Navegación principal">
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-1">
                {nav.map((n) => (
                  <NavItem
                    key={n.to}
                    to={n.to}
                    label={n.label}
                    icon={n.icon}
                    variant="top"
                    forceActive={n.forceActive}
                    badge={n.badge}
                  />
                ))}
              </div>
            </nav>

            {/* ── User menu ── */}
            <div className="relative shrink-0" data-user-menu-root>
              <button
                type="button"
                onClick={() => setUserMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenu}
                aria-label="Menú de usuario"
                className={cx(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  userMenu
                    ? "bg-slate-100 text-slate-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Avatar initial={initial} size="md" />
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 max-w-[140px] truncate">
                    {user?.name || "Usuario"}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-[140px] truncate">
                    {user?.email || ""}
                  </p>
                </div>
                <IconChevron open={userMenu} />
              </button>

              {/* Dropdown */}
              <div
                role="menu"
                aria-label="Opciones de usuario"
                className={cx(
                  "absolute right-0 top-full mt-1.5 w-[220px] overflow-hidden rounded-lg bg-white border border-slate-200 shadow-md transition-all duration-150 origin-top-right",
                  userMenu
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                )}
              >
                <div className="h-[3px] bg-blue-600" />

                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
                  <Avatar initial={initial} size="lg" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {user?.name || "Usuario"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <IconLogout />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}