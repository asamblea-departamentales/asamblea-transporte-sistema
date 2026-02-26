import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// NORDIC FROST — Sidebar redesign
//
// 1. En tu index.html <head>:
//    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
//
// 2. En tu globals.css / index.css:
//    :root { font-family: 'Instrument Sans', sans-serif; }
//
// 3. En tailwind.config.ts → theme.extend.colors:
//    frost: {
//      bg:         '#f0f4f8',
//      surface:    '#ffffff',
//      border:     '#dce6f0',
//      navy:       '#0f172a',
//      cyan:       '#06b6d4',
//      cyanLight:  '#22d3ee',
//      cyanBg:     '#e0f7fa',
//      slate:      '#64748b',
//      slateLight: '#94a3b8',
//    }
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:         "#f0f4f8",
  surface:    "#ffffff",
  border:     "#dce6f0",
  navy:       "#0f172a",
  navyMid:    "#1e293b",
  cyan:       "#06b6d4",
  cyanLight:  "#22d3ee",
  cyanBg:     "#e0f7fa",
  slate:      "#64748b",
  slateLight: "#94a3b8",
  white:      "#ffffff",
  red:        "#ef4444",
  redBg:      "#fef2f2",
} as const;

const FONT_DISPLAY = "'Sora', sans-serif";
const FONT_BODY    = "'Instrument Sans', sans-serif";

type Props   = { open: boolean; onClose: () => void; onOpen: () => void };
type Variant = "topbar" | "bottombar" | "drawer";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ── Íconos ────────────────────────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}
function IconNewRequest() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}
function IconRequests() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconChevronDown({ rotated }: { rotated: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      className="h-4 w-4 transition-transform duration-300"
      style={{ transform: rotated ? "rotate(180deg)" : "rotate(0deg)", color: C.slateLight }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 8 }: { initials: string; size?: number }) {
  const sz = `${size * 4}px`;
  return (
    <span className="flex shrink-0 items-center justify-center rounded-xl font-bold select-none"
      style={{
        width: sz, height: sz, fontSize: "0.8rem",
        background: `linear-gradient(135deg, ${C.cyan} 0%, #0891b2 100%)`,
        color: C.white, fontFamily: FONT_DISPLAY,
        boxShadow: `0 0 0 2.5px ${C.cyanBg}`,
      }}>
      {initials}
    </span>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums"
      style={{ background: C.cyan, color: C.white, fontFamily: FONT_BODY }}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
  to, label, icon, onNavigate, forceActive, variant = "topbar", badgeCount = 0,
}: {
  to: string; label: string; icon: React.ReactNode; onNavigate?: () => void;
  forceActive?: boolean; variant?: Variant; badgeCount?: number;
}) {
  return (
    <NavLink to={to} end onClick={onNavigate}
      className={({ isActive }) => {
        const active = (forceActive ?? false) || isActive;
        if (variant === "bottombar") return cx(
          "relative flex flex-1 flex-col items-center justify-center gap-1 min-h-[60px] px-1 py-2 text-[10.5px] font-semibold tracking-wide transition-colors duration-200 focus:outline-none select-none",
          active ? "text-[#06b6d4]" : "text-[#94a3b8]"
        );
        if (variant === "drawer") return cx(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13.5px] font-semibold tracking-wide transition-all duration-200 focus:outline-none",
          active ? "bg-[#e0f7fa]" : "hover:bg-[#f0f4f8]"
        );
        return cx(
          "inline-flex items-center gap-2.5 h-9 px-4 rounded-xl text-[13px] font-semibold tracking-wide transition-all duration-200 focus:outline-none",
          active ? "bg-[#e0f7fa]" : "hover:bg-[#f0f4f8]"
        );
      }}>
      {({ isActive }) => {
        const active = (forceActive ?? false) || isActive;

        if (variant === "bottombar") return (
          <>
            {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full" style={{ background: C.cyan }} />}
            <span className="relative grid size-9 place-items-center rounded-xl transition-all duration-200"
              style={{ background: active ? C.cyanBg : "transparent", color: active ? C.cyan : C.slateLight }}>
              {icon}
              {badgeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{ background: C.cyan, color: C.white }}>
                  {badgeCount > 99 ? "+" : badgeCount}
                </span>
              )}
            </span>
            <span style={{ fontFamily: FONT_BODY }}>{label}</span>
          </>
        );

        if (variant === "drawer") return (
          <>
            <span className="grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-200"
              style={{ background: active ? `${C.cyan}22` : "#f1f5f9", color: active ? C.cyan : C.slate }}>
              {icon}
            </span>
            <span className="flex-1 truncate" style={{ fontFamily: FONT_BODY, color: active ? C.navy : C.slate }}>{label}</span>
            {active
              ? <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: C.cyan }} />
              : <Badge count={badgeCount} />}
          </>
        );

        return (
          <>
            <span className="grid size-5 place-items-center transition-all duration-200" style={{ color: active ? C.cyan : C.slate }}>{icon}</span>
            <span style={{ fontFamily: FONT_BODY, color: active ? C.navy : C.slate }}>{label}</span>
            {!active && <Badge count={badgeCount} />}
            {active && <span className="ml-0.5 h-1.5 w-1.5 rounded-full" style={{ background: C.cyan }} />}
          </>
        );
      }}
    </NavLink>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
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
    onClose(); setShowUserMenu(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const toggle = () => (open ? onClose() : onOpen());

  useEffect(() => { onClose(); setShowUserMenu(false); }, [location.pathname]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { onClose(); setShowUserMenu(false); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-user-menu-root]")) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ──── Shared logo filter (navy tint) ──── */
  const logoFilter = "brightness(0) saturate(100%) invert(8%) sepia(71%) saturate(2000%) hue-rotate(210deg) brightness(97%) contrast(100%)";

  return (
    <>
      {/* ══════════════ MÓVIL ══════════════ */}

      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-50 lg:hidden" style={{ fontFamily: FONT_BODY }}>
        <div className="flex h-14 items-center justify-between px-4"
          style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, boxShadow: "0 1px 12px rgba(15,23,42,0.06)" }}>

          <button type="button" onClick={toggle}
            className="relative grid size-10 place-items-center rounded-xl transition-all duration-200 focus:outline-none active:scale-90"
            style={{ color: open ? C.cyan : C.slate, background: open ? C.cyanBg : "transparent" }}
            aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{ opacity: open ? 1 : 0, transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
              <IconClose />
            </span>
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{ opacity: open ? 0 : 1, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
              <IconMenu />
            </span>
          </button>

          <button type="button" onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-all duration-200 focus:outline-none active:scale-95">
            <img src={logo} alt="Asamblea Legislativa" className="h-7 w-auto" style={{ filter: logoFilter }} />
            <span className="text-[13.5px] font-bold tracking-[0.1em] uppercase"
              style={{ color: C.navy, fontFamily: FONT_DISPLAY }}>
              Transporte
            </span>
          </button>

          <button type="button" onClick={toggle} className="transition-all duration-200 active:scale-90">
            <Avatar initials={initials} size={10} />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
        style={{ background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <aside id="mobile-drawer" role="dialog" aria-modal="true"
        className="fixed left-0 top-0 z-50 flex h-full flex-col lg:hidden"
        style={{
          width: "272px", background: C.surface, borderRight: `1px solid ${C.border}`,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: open ? "16px 0 48px rgba(15,23,42,0.10)" : "none",
          transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1), box-shadow 0.3s ease",
          fontFamily: FONT_BODY,
        }}>

        {/* Header */}
        <div className="mt-14 flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="rounded-xl p-2.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
            <img src={logo} alt="" className="h-7 w-auto" style={{ filter: logoFilter }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.slateLight }}>
              Gestión institucional
            </p>
            <p className="text-sm font-bold" style={{ color: C.navy, fontFamily: FONT_DISPLAY }}>Transporte</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.slateLight }}>
            Menú principal
          </p>
          <div className="space-y-1">
            <NavItem to="/dashboard" label="Dashboard" variant="drawer" onNavigate={onClose} icon={<IconDashboard />} />
            <NavItem to="/nueva-solicitud" label="Nueva solicitud" variant="drawer" onNavigate={onClose} forceActive={isNewRequestActive} icon={<IconNewRequest />} />
            <NavItem to="/mis-solicitudes" label="Mis solicitudes" variant="drawer" onNavigate={onClose} badgeCount={pendingCount} icon={<IconRequests />} />
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 space-y-2"
          style={{ borderTop: `1px solid ${C.border}`, paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <div className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
            <Avatar initials={initials} size={9} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold" style={{ color: C.navy, fontFamily: FONT_DISPLAY }}>
                {user?.name || "Usuario"}
              </p>
              <p className="truncate text-[11px]" style={{ color: C.slateLight }}>{user?.email || ""}</p>
            </div>
          </div>

          <button type="button" onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold active:scale-[0.98] transition-all duration-200 focus:outline-none"
            style={{ background: C.bg, color: C.slate, border: `1px solid ${C.border}` }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.redBg; el.style.color = C.red; el.style.borderColor = "#fecaca"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.bg; el.style.color = C.slate; el.style.borderColor = C.border; }}>
            <IconLogout />Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex items-stretch"
        style={{ background: C.surface, borderTop: `1px solid ${C.border}`, paddingBottom: "env(safe-area-inset-bottom)", boxShadow: "0 -2px 16px rgba(15,23,42,0.06)", fontFamily: FONT_BODY }}
        aria-label="Navegación principal">
        <NavItem to="/dashboard" label="Dashboard" variant="bottombar" icon={<IconDashboard />} />
        <NavItem to="/nueva-solicitud" label="Solicitud" variant="bottombar" forceActive={isNewRequestActive} icon={<IconNewRequest />} />
        <NavItem to="/mis-solicitudes" label="Solicitudes" variant="bottombar" badgeCount={pendingCount} icon={<IconRequests />} />
      </nav>

      {/* ══════════════ DESKTOP ══════════════ */}
      <header className="hidden lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-50 lg:block">
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, boxShadow: "0 1px 16px rgba(15,23,42,0.07)", fontFamily: FONT_BODY }}>
          <div className="mx-auto max-w-[1800px] px-6 xl:px-10">
            <div className="flex h-[66px] items-center justify-between gap-6">

              {/* Brand */}
              <button type="button" onClick={() => navigate("/dashboard")}
                className="flex shrink-0 items-center gap-3.5 rounded-xl px-3 py-2 hover:bg-[#f0f4f8] transition-all duration-200 focus:outline-none">
                <img src={logo} alt="Asamblea Legislativa" className="h-8 w-auto" style={{ filter: logoFilter }} />
                <div className="hidden xl:block pl-3.5" style={{ borderLeft: `2px solid ${C.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: C.slateLight }}>
                    Gestión institucional
                  </p>
                  <p className="text-[14px] font-bold" style={{ color: C.navy, fontFamily: FONT_DISPLAY, letterSpacing: "0.02em" }}>
                    Transporte
                  </p>
                </div>
              </button>

              <div className="hidden xl:block h-8 w-px shrink-0" style={{ background: C.border }} />

              {/* Nav */}
              <nav className="flex-1">
                <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-1.5">
                  <NavItem to="/dashboard" label="Dashboard" variant="topbar" icon={<IconDashboard />} />
                  <NavItem to="/nueva-solicitud" label="Nueva solicitud" variant="topbar" forceActive={isNewRequestActive} icon={<IconNewRequest />} />
                  <NavItem to="/mis-solicitudes" label="Mis solicitudes" variant="topbar" badgeCount={pendingCount} icon={<IconRequests />} />
                </div>
              </nav>

              <div className="hidden xl:block h-8 w-px shrink-0" style={{ background: C.border }} />

              {/* User dropdown */}
              <div className="relative shrink-0" data-user-menu-root>
                <button type="button" onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-[#f0f4f8] transition-all duration-200 focus:outline-none"
                  aria-haspopup="menu" aria-expanded={showUserMenu}>
                  <Avatar initials={initials} size={9} />
                  <div className="hidden min-w-0 text-left sm:block">
                    <p className="max-w-[140px] truncate text-[13px] font-semibold" style={{ color: C.navy, fontFamily: FONT_DISPLAY }}>
                      {user?.name || "Usuario"}
                    </p>
                    <p className="max-w-[140px] truncate text-[11px]" style={{ color: C.slateLight }}>
                      {user?.email || ""}
                    </p>
                  </div>
                  <IconChevronDown rotated={showUserMenu} />
                </button>

                {/* Dropdown */}
                <div role="menu"
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl transition-all duration-200 origin-top-right"
                  style={{
                    background: C.surface,
                    boxShadow: "0 16px 48px rgba(15,23,42,0.12), 0 4px 16px rgba(15,23,42,0.06)",
                    border: `1px solid ${C.border}`,
                    opacity: showUserMenu ? 1 : 0,
                    transform: showUserMenu ? "scale(1) translateY(0)" : "scale(0.96) translateY(-8px)",
                    pointerEvents: showUserMenu ? "auto" : "none",
                    fontFamily: FONT_BODY,
                  }}>
                  {/* Header dark gradient */}
                  <div className="flex items-center gap-3 px-4 py-4"
                    style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)` }}>
                    <Avatar initials={initials} size={10} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-white" style={{ fontFamily: FONT_DISPLAY }}>
                        {user?.name || "Usuario"}
                      </p>
                      <p className="truncate text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                  {/* Cyan accent line */}
                  <div style={{ height: "3px", background: `linear-gradient(90deg, ${C.cyan}, ${C.cyanLight})` }} />

                  <div className="p-2">
                    <button type="button" onClick={handleLogout} role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 focus:outline-none hover:bg-[#fef2f2]"
                      style={{ color: C.red }}>
                      <IconLogout />Cerrar sesión
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