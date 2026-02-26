import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SETUP — agrega en index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Geist:wght@400;500;600&display=swap" rel="stylesheet" />
// index.css → body { font-family: 'Geist', sans-serif; }
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  dark:      "#0f172a",
  darkMid:   "#1e293b",
  darkSub:   "#334155",
  cyan:      "#22d3ee",
  cyanDim:   "#06b6d4",
  cyanGlow:  "rgba(34,211,238,0.16)",
  cyanPill:  "rgba(34,211,238,0.10)",
  white:     "#f8fafc",
  whiteM:    "rgba(248,250,252,0.55)",
  whiteS:    "rgba(248,250,252,0.22)",
  red:       "#f43f5e",
  redBg:     "rgba(244,63,94,0.10)",
};

type Props = { open: boolean; onClose: () => void; onOpen: () => void };

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-[17px] h-[17px]" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="7" height="7" rx="2"/>
    <rect x="11" y="2" width="7" height="7" rx="2"/>
    <rect x="2" y="11" width="7" height="7" rx="2"/>
    <rect x="11" y="11" width="7" height="7" rx="2"/>
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-[17px] h-[17px]" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 4v12M4 10h12"/>
    <rect x="2" y="2" width="16" height="16" rx="4" strokeOpacity="0.4"/>
  </svg>
);

const IconList = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-[17px] h-[17px]" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 6h9M7 10h9M7 14h5"/>
    <circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none"/>
    <circle cx="3.5" cy="10" r="1" fill="currentColor" stroke="none"/>
    <circle cx="3.5" cy="14" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const IconMenu = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M3 5h14M3 10h10M3 15h7"/>
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M15 5L5 15M5 5l10 10"/>
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3"/>
    <path d="M13 14l4-4-4-4M17 10H7"/>
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 transition-transform duration-300"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M4 6l4 4 4-4"/>
  </svg>
);

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ i, size = 32 }: { i: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.35),
      background: `linear-gradient(135deg, ${T.cyan} 0%, #818cf8 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Syne', sans-serif", fontWeight: 700,
      fontSize: Math.round(size * 0.38), color: T.dark, flexShrink: 0,
      boxShadow: `0 0 0 1.5px rgba(255,255,255,0.08), 0 4px 14px rgba(34,211,238,0.28)`,
      userSelect: "none",
    }}>
      {i}
    </div>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────

type Variant = "top" | "drawer" | "bottom";

function NavItem({ to, label, icon, badge = 0, forceActive, variant = "top", onNav }: {
  to: string; label: string; icon: React.ReactNode; badge?: number;
  forceActive?: boolean; variant?: Variant; onNav?: () => void;
}) {
  return (
    <NavLink to={to} end onClick={onNav}
      className={({ isActive }) => {
        const a = (forceActive ?? false) || isActive;
        if (variant === "bottom") return cx(
          "relative flex flex-1 flex-col items-center justify-center gap-[3px] min-h-[56px] px-1 py-2",
          "text-[10.5px] font-semibold tracking-wide transition-colors duration-200 focus:outline-none select-none",
          a ? "text-cyan-300" : "text-slate-500"
        );
        if (variant === "drawer") return cx(
          "group flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl",
          "text-[13.5px] font-medium transition-all duration-150 focus:outline-none",
          a ? "text-white" : "text-slate-400 hover:text-slate-200"
        );
        return cx(
          "group inline-flex items-center gap-2 px-3.5 py-[9px] rounded-xl",
          "text-[13px] font-medium transition-all duration-150 focus:outline-none",
          a ? "text-white" : "text-slate-400 hover:text-slate-200"
        );
      }}
    >
      {({ isActive }) => {
        const a = (forceActive ?? false) || isActive;

        if (variant === "bottom") return (
          <>
            <span className="relative">
              <span className={cx(
                "flex size-10 items-center justify-center rounded-2xl transition-all duration-200",
              )} style={a ? { background: T.cyanPill, color: T.cyan } : { color: "#64748b" }}>
                {icon}
              </span>
              {badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold px-1 ring-2"
                  style={{ background: T.cyan, color: T.dark, boxShadow: `0 0 0 2px ${T.dark}` }}>
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </span>
            <span>{label}</span>
            {a && <span className="absolute bottom-0 inset-x-5 h-[2px] rounded-full" style={{ background: T.cyan }} />}
          </>
        );

        if (variant === "drawer") return (
          <>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-150"
              style={a
                ? { background: T.cyanGlow, color: T.cyan }
                : { background: "rgba(255,255,255,0.04)", color: "#475569" }}>
              {icon}
            </span>
            <span className="flex-1 truncate">{label}</span>
            {badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                style={{ background: a ? T.cyan : T.cyanPill, color: a ? T.dark : T.cyan }}>
                {badge > 99 ? "99+" : badge}
              </span>
            )}
            {a && <span className="h-4 w-[3px] rounded-full" style={{ background: T.cyan }} />}
          </>
        );

        // top
        return (
          <>
            <span className="grid size-[26px] shrink-0 place-items-center rounded-lg transition-all duration-150"
              style={a ? { background: T.cyanGlow, color: T.cyan } : { color: "#475569" }}>
              {icon}
            </span>
            <span>{label}</span>
            {badge > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold"
                style={{ background: a ? T.cyan : T.cyanPill, color: a ? T.dark : T.cyan }}>
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Sidebar({ open, onClose, onOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenu, setUserMenu] = useState(false);
  const [pending] = useState(3);

  const isNew    = location.pathname === "/nueva-solicitud" || location.pathname.startsWith("/solicitudes/");
  const initials = useMemo(() => (user?.name?.trim()?.[0] || "U").toUpperCase(), [user?.name]);

  const handleLogout = async () => {
    onClose(); setUserMenu(false);
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => { onClose(); setUserMenu(false); }, [location.pathname]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { onClose(); setUserMenu(false); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-umr]")) setUserMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const nav = [
    { to: "/dashboard",       label: "Dashboard",       icon: <IconDashboard /> },
    { to: "/nueva-solicitud", label: "Nueva solicitud", icon: <IconPlus />, forceActive: isNew },
    { to: "/mis-solicitudes", label: "Mis solicitudes", icon: <IconList />, badge: pending },
  ];

  const FONT         = "'Geist', 'DM Sans', system-ui, sans-serif";
  const FONT_DISPLAY = "'Syne', sans-serif";

  return (
    <>
      {/* ══════════ MOBILE (<lg) ══════════ */}

      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-50 lg:hidden" style={{ fontFamily: FONT }}>
        <div className="flex h-14 items-center justify-between px-4"
          style={{ background: T.dark, borderBottom: `1px solid ${T.darkSub}` }}>

          <button type="button" onClick={() => (open ? onClose() : onOpen())}
            aria-label="Menú" aria-expanded={open}
            className="relative grid size-10 place-items-center rounded-2xl transition-all duration-200 active:scale-90 focus:outline-none"
            style={{
              background: open ? T.cyanGlow : "rgba(255,255,255,0.05)",
              border: `1px solid ${open ? "rgba(34,211,238,0.25)" : T.darkSub}`,
              color: open ? T.cyan : T.whiteM,
            }}>
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-250"
              style={{ opacity: open ? 1 : 0, transform: open ? "scale(1)" : "scale(0.5) rotate(45deg)" }}>
              <IconX />
            </span>
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-250"
              style={{ opacity: open ? 0 : 1, transform: open ? "scale(0.5) rotate(-45deg)" : "scale(1)" }}>
              <IconMenu />
            </span>
          </button>

          <button type="button" onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 focus:outline-none active:scale-95 transition-transform">
            <img src={logo} alt="" className="h-6 w-auto brightness-0 invert opacity-80" />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 13.5, letterSpacing: "0.1em", color: T.white, textTransform: "uppercase" }}>
              Transporte
            </span>
          </button>

          <button type="button" onClick={() => (open ? onClose() : onOpen())}
            className="focus:outline-none active:scale-90 transition-transform">
            <Avatar i={initials} size={36} />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose} aria-hidden
        style={{
          background: "rgba(2,6,23,0.72)", backdropFilter: "blur(6px)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }} />

      {/* Drawer */}
      <aside id="mobile-drawer" role="dialog" aria-modal="true"
        className="fixed left-0 top-0 z-50 flex h-full w-[270px] flex-col lg:hidden"
        style={{
          background: T.dark,
          borderRight: `1px solid ${T.darkSub}`,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: open ? "24px 0 80px rgba(2,6,23,0.65)" : "none",
          fontFamily: FONT,
        }}>

        {/* Cyan accent top */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${T.cyan}, #818cf8 60%, transparent)` }} />

        {/* Header */}
        <div className="mt-14 px-5 pt-5 pb-5" style={{ borderBottom: `1px solid ${T.darkSub}` }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.darkSub}` }}>
              <img src={logo} alt="" className="h-7 w-auto brightness-0 invert opacity-80" />
            </div>
            <div>
              <p style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 800, color: T.white, lineHeight: 1.15 }}>
                Transporte
              </p>
              <p style={{ fontSize: 10, fontWeight: 500, color: T.whiteS, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>
                Asamblea Legislativa
              </p>
            </div>
          </div>

          {/* User card */}
          <div className="flex items-center gap-3 rounded-2xl px-3 py-3"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.darkSub}` }}>
            <Avatar i={initials} />
            <div className="min-w-0">
              <p style={{ fontSize: 13, fontWeight: 600, color: T.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Usuario"}
              </p>
              <p style={{ fontSize: 11, color: T.whiteS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p style={{ fontSize: 10, fontWeight: 600, color: T.whiteS, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8, paddingLeft: 4 }}>
            Navegación
          </p>
          <div className="space-y-1">
            {nav.map(n => (
              <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon}
                variant="drawer" onNav={onClose} forceActive={n.forceActive} badge={n.badge} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4" style={{ borderTop: `1px solid ${T.darkSub}`, paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button type="button" onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-2.5 text-[13px] font-medium transition-all duration-150 focus:outline-none active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.04)", color: T.whiteM, border: `1px solid ${T.darkSub}` }}
            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: T.redBg, color: T.red, borderColor: "rgba(244,63,94,0.2)" })}
            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: "rgba(255,255,255,0.04)", color: T.whiteM, borderColor: T.darkSub })}>
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden flex"
        style={{
          background: T.dark,
          borderTop: `1px solid ${T.darkSub}`,
          paddingBottom: "env(safe-area-inset-bottom)",
          fontFamily: FONT,
          boxShadow: "0 -8px 40px rgba(2,6,23,0.6)",
        }}>
        {nav.map(n => (
          <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon}
            variant="bottom" forceActive={n.forceActive} badge={n.badge} />
        ))}
      </nav>

      {/* ══════════ DESKTOP (≥lg) ══════════ */}

      <header className="hidden lg:fixed lg:inset-x-0 lg:top-0 lg:z-50 lg:block" style={{ fontFamily: FONT }}>
        {/* Gradient accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${T.cyan} 0%, #818cf8 50%, transparent 100%)` }} />

        <div style={{ background: T.dark, borderBottom: `1px solid ${T.darkSub}`, boxShadow: "0 8px 40px rgba(2,6,23,0.5)" }}>
          <div className="mx-auto max-w-[1800px] px-6 xl:px-10">
            <div className="flex h-[60px] items-center gap-6">

              {/* Brand */}
              <button type="button" onClick={() => navigate("/dashboard")}
                className="flex shrink-0 items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-150 focus:outline-none"
                style={{ color: T.white }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <div className="grid size-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.darkSub}` }}>
                  <img src={logo} alt="" className="h-5 w-auto brightness-0 invert opacity-80" />
                </div>
                <div className="hidden xl:block pl-3" style={{ borderLeft: `1px solid ${T.darkSub}` }}>
                  <p style={{ fontSize: 10, fontWeight: 500, color: T.whiteS, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    Asamblea Legislativa
                  </p>
                  <p style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 800, color: T.white, lineHeight: 1.2 }}>
                    Transporte
                  </p>
                </div>
              </button>

              {/* Nav pill */}
              <nav className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-0.5 rounded-2xl p-1"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.darkSub}` }}>
                  {nav.map(n => (
                    <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon}
                      variant="top" forceActive={n.forceActive} badge={n.badge} />
                  ))}
                </div>
              </nav>

              {/* User */}
              <div className="relative shrink-0" data-umr>
                <button type="button" onClick={() => setUserMenu(v => !v)}
                  aria-haspopup="menu" aria-expanded={userMenu}
                  className="flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 transition-all duration-150 focus:outline-none"
                  style={{
                    background: userMenu ? "rgba(255,255,255,0.07)" : "transparent",
                    border: `1px solid ${userMenu ? T.darkSub : "transparent"}`,
                    color: T.whiteS,
                  }}
                  onMouseEnter={e => { if (!userMenu) Object.assign((e.currentTarget as HTMLElement).style, { background: "rgba(255,255,255,0.05)", borderColor: T.darkSub }); }}
                  onMouseLeave={e => { if (!userMenu) Object.assign((e.currentTarget as HTMLElement).style, { background: "transparent", borderColor: "transparent" }); }}>
                  <Avatar i={initials} size={30} />
                  <div className="hidden sm:block text-left min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.white, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.name || "Usuario"}
                    </p>
                    <p style={{ fontSize: 11, color: T.whiteS, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.email || ""}
                    </p>
                  </div>
                  <IconChevron open={userMenu} />
                </button>

                {/* Dropdown */}
                <div role="menu" className="absolute right-0 top-full mt-2 w-[220px] overflow-hidden rounded-2xl"
                  style={{
                    background: T.darkMid,
                    border: `1px solid ${T.darkSub}`,
                    boxShadow: "0 24px 60px rgba(2,6,23,0.8), 0 4px 16px rgba(2,6,23,0.5)",
                    opacity: userMenu ? 1 : 0,
                    transform: userMenu ? "scale(1) translateY(0)" : "scale(0.94) translateY(-10px)",
                    pointerEvents: userMenu ? "auto" : "none",
                    transition: "opacity 0.16s ease, transform 0.16s cubic-bezier(0.22,1,0.36,1)",
                    transformOrigin: "top right",
                  }}>
                  <div style={{ height: 2, background: `linear-gradient(90deg, ${T.cyan}, #818cf8)` }} />
                  <div className="px-4 py-4" style={{ borderBottom: `1px solid ${T.darkSub}` }}>
                    <div className="flex items-center gap-3">
                      <Avatar i={initials} size={38} />
                      <div className="min-w-0">
                        <p style={{ fontSize: 13, fontWeight: 600, color: T.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user?.name || "Usuario"}
                        </p>
                        <p style={{ fontSize: 11, color: T.whiteS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button type="button" onClick={handleLogout} role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 focus:outline-none"
                      style={{ color: T.red }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.redBg}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
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