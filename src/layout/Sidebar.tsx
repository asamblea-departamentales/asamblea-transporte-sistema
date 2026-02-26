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

// ─── CSS Variables Injection ──────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  :root {
    --nav-bg: #0f172a;
    --nav-surface: rgba(255,255,255,0.04);
    --nav-surface-hover: rgba(255,255,255,0.08);
    --nav-active-bg: rgba(99,102,241,0.18);
    --nav-active-text: #a5b4fc;
    --nav-text: rgba(255,255,255,0.55);
    --nav-text-strong: rgba(255,255,255,0.9);
    --nav-border: rgba(255,255,255,0.07);
    --nav-accent: #6366f1;
    --nav-accent-glow: rgba(99,102,241,0.35);
    --nav-height: 64px;
    --nav-font: 'Plus Jakarta Sans', system-ui, sans-serif;
  }

  * { box-sizing: border-box; }

  body {
    font-family: var(--nav-font);
    padding-top: var(--nav-height);
  }

  @media (max-width: 1023px) {
    body { padding-top: var(--nav-height); padding-bottom: 64px; }
  }

  /* Glow keyframe */
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  /* Drawer slide */
  @keyframes drawerIn {
    from { transform: translateX(-100%); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }

  /* Active indicator pulse */
  @keyframes indicator-pop {
    0%   { transform: scaleY(0); }
    70%  { transform: scaleY(1.2); }
    100% { transform: scaleY(1); }
  }
`;

function GlobalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" />
    <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <path d="M10 4v12M4 10h12" />
  </svg>
);

const IconList = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 6h9M7 10h9M7 14h5" />
    <circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="14" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconMenu = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <path d="M3 5h14M3 10h10M3 15h7" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <path d="M15 5L5 15M5 5l10 10" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" />
    <path d="M13 14l4-4-4-4M17 10H7" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    style={{
      width: 14,
      height: 14,
      transition: "transform 200ms",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
    }}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
  >
    <path d="M4 6l4 4 4-4" />
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const sizes: Record<string, { box: string; font: string }> = {
    sm: { box: "28px", font: "11px" },
    md: { box: "34px", font: "13px" },
    lg: { box: "38px", font: "14px" },
  };
  const s = sizes[size];
  return (
    <div
      style={{
        width: s.box,
        height: s.box,
        fontSize: s.font,
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        borderRadius: 9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: "var(--nav-font)",
        letterSpacing: "0.02em",
        boxShadow: "0 0 0 1.5px rgba(99,102,241,0.4), 0 4px 12px rgba(99,102,241,0.25)",
        userSelect: "none",
      }}
    >
      {initial}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 18,
        minWidth: 18,
        padding: "0 5px",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff",
        boxShadow: "0 0 10px var(--nav-accent-glow)",
        animation: "pulse-glow 2.5s ease-in-out infinite",
      }}
    >
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
  if (variant === "bottom") {
    return (
      <NavLink
        to={to}
        end
        onClick={onNav}
        style={({ isActive }) => {
          const active = (forceActive ?? false) || isActive;
          return {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            minHeight: 56,
            padding: "8px 4px",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.03em",
            color: active ? "var(--nav-active-text)" : "rgba(255,255,255,0.35)",
            textDecoration: "none",
            position: "relative",
            transition: "color 150ms",
            fontFamily: "var(--nav-font)",
          };
        }}
      >
        {({ isActive }) => {
          const active = (forceActive ?? false) || isActive;
          return (
            <>
              <span
                style={{
                  width: 40,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  background: active ? "var(--nav-active-bg)" : "transparent",
                  color: active ? "var(--nav-active-text)" : "inherit",
                  transition: "background 150ms",
                  position: "relative",
                }}
              >
                {icon}
                {badge > 0 && (
                  <span style={{
                    position: "absolute", top: 1, right: 1,
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--nav-accent)",
                    boxShadow: "0 0 6px var(--nav-accent-glow)",
                  }} />
                )}
              </span>
              <span>{label}</span>
              {active && (
                <span style={{
                  position: "absolute",
                  top: 0,
                  left: "30%",
                  right: "30%",
                  height: 2,
                  borderRadius: "0 0 4px 4px",
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 0 8px var(--nav-accent-glow)",
                  animationName: "indicator-pop",
                  animationDuration: "300ms",
                  animationFillMode: "both",
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
      <NavLink
        to={to}
        end
        onClick={onNav}
        style={({ isActive }) => {
          const active = (forceActive ?? false) || isActive;
          return {
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 500,
            color: active ? "var(--nav-active-text)" : "var(--nav-text)",
            background: active ? "var(--nav-active-bg)" : "transparent",
            textDecoration: "none",
            transition: "all 150ms",
            outline: "none",
            fontFamily: "var(--nav-font)",
            boxShadow: active ? "inset 0 0 0 1px rgba(99,102,241,0.2)" : "none",
          };
        }}
      >
        {({ isActive }) => {
          const active = (forceActive ?? false) || isActive;
          return (
            <>
              <span
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  background: active ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                  color: active ? "var(--nav-active-text)" : "var(--nav-text)",
                  flexShrink: 0,
                  transition: "all 150ms",
                }}
              >
                {icon}
              </span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {label}
              </span>
              {badge > 0 && <Badge count={badge} />}
              {active && (
                <span style={{
                  width: 3,
                  height: 16,
                  borderRadius: 99,
                  background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 0 8px var(--nav-accent-glow)",
                }} />
              )}
            </>
          );
        }}
      </NavLink>
    );
  }

  // top
  return (
    <NavLink
      to={to}
      end
      onClick={onNav}
      style={({ isActive }) => {
        const active = (forceActive ?? false) || isActive;
        return {
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 14px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          color: active ? "var(--nav-active-text)" : "var(--nav-text)",
          background: active ? "var(--nav-active-bg)" : "transparent",
          textDecoration: "none",
          transition: "all 150ms",
          outline: "none",
          fontFamily: "var(--nav-font)",
          boxShadow: active ? "inset 0 0 0 1px rgba(99,102,241,0.25)" : "none",
          letterSpacing: "0.01em",
        };
      }}
    >
      {({ isActive }) => {
        const active = (forceActive ?? false) || isActive;
        return (
          <>
            <span style={{ color: active ? "var(--nav-active-text)" : "rgba(255,255,255,0.3)", transition: "color 150ms" }}>
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

  useEffect(() => { onClose(); setUserMenu(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { onClose(); setUserMenu(false); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-user-menu-root]")) setUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
    { to: "/nueva-solicitud", label: "Nueva solicitud", icon: <IconPlus />, forceActive: isNew },
    { to: "/mis-solicitudes", label: "Mis solicitudes", icon: <IconList />, badge: pending },
  ];

  return (
    <>
      <GlobalStyles />

      {/* ══════════════════════════════════════════
          MOBILE  (<lg)
      ══════════════════════════════════════════ */}

      {/* ── Top bar ── */}
      <header style={{
        position: "fixed",
        inset: "0 0 auto 0",
        zIndex: 50,
        display: "flex",
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--nav-border)",
        height: "var(--nav-height)",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontFamily: "var(--nav-font)",
      }}
        className="lg:hidden"
      >
        {/* Ambient glow line */}
        <div style={{
          position: "absolute",
          bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "40%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
        }} />

        <button
          type="button"
          onClick={() => (open ? onClose() : onOpen())}
          aria-label="Menú"
          style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 9,
            background: open ? "var(--nav-surface-hover)" : "transparent",
            color: "var(--nav-text)",
            border: "1px solid var(--nav-border)",
            cursor: "pointer",
            transition: "all 150ms",
          }}
        >
          {open ? <IconX /> : <IconMenu />}
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "transparent", border: "none", cursor: "pointer",
            padding: "6px 10px", borderRadius: 8,
            fontFamily: "var(--nav-font)",
          }}
        >
          <div style={{
            width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 8,
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}>
            <img src={logo} alt="" style={{ height: 18, width: "auto", opacity: 0.85, filter: "brightness(0) invert(1)" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--nav-text-strong)", letterSpacing: "0.02em" }}>
            Transporte
          </span>
        </button>

        <button
          type="button"
          onClick={() => (open ? onClose() : onOpen())}
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, borderRadius: 10 }}
          aria-label="Perfil"
        >
          <Avatar initial={initial} size="md" />
        </button>
      </header>

      {/* ── Backdrop ── */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          transition: "opacity 200ms",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer ── */}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="lg:hidden"
        style={{
          position: "fixed", left: 0, top: 0, zIndex: 50,
          height: "100%", width: 260,
          display: "flex", flexDirection: "column",
          background: "var(--nav-bg)",
          borderRight: "1px solid var(--nav-border)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
          fontFamily: "var(--nav-font)",
        }}
      >
        {/* Top accent */}
        <div style={{ height: 2, background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)", flexShrink: 0 }} />

        {/* Drawer header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--nav-border)",
          marginTop: "var(--nav-height)",
        }}>
          <div style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 9,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            flexShrink: 0,
          }}>
            <img src={logo} alt="" style={{ height: 20, width: "auto", opacity: 0.85, filter: "brightness(0) invert(1)" }} />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 1 }}>
              Asamblea Legislativa
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--nav-text-strong)" }}>
              Transporte
            </p>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--nav-border)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--nav-border)",
          }}>
            <Avatar initial={initial} size="lg" />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--nav-text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Usuario"}
              </p>
              <p style={{ fontSize: 11, color: "var(--nav-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          <p style={{ padding: "0 12px", marginBottom: 8, fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Navegación
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {nav.map((n) => (
              <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon} variant="drawer" onNav={onClose} forceActive={n.forceActive} badge={n.badge} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 12px max(12px, env(safe-area-inset-bottom))", borderTop: "1px solid var(--nav-border)" }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex", width: "100%", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 10,
              fontSize: 13, fontWeight: 500,
              color: "rgba(255,100,100,0.7)",
              background: "transparent",
              border: "1px solid transparent",
              cursor: "pointer",
              transition: "all 150ms",
              fontFamily: "var(--nav-font)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,100,100,0.7)";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            }}
          >
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Bottom nav bar ── */}
      <nav
        className="lg:hidden"
        style={{
          position: "fixed", inset: "auto 0 0 0", zIndex: 40,
          display: "flex",
          background: "var(--nav-bg)",
          borderTop: "1px solid var(--nav-border)",
          paddingBottom: "env(safe-area-inset-bottom)",
          fontFamily: "var(--nav-font)",
        }}
        aria-label="Navegación principal"
      >
        {nav.map((n) => (
          <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon} variant="bottom" forceActive={n.forceActive} badge={n.badge} />
        ))}
      </nav>

      {/* ══════════════════════════════════════════
          DESKTOP  (≥lg)
      ══════════════════════════════════════════ */}

      <header
        className="hidden lg:block"
        style={{
          position: "fixed", inset: "0 0 auto 0", zIndex: 50,
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--nav-border)",
          fontFamily: "var(--nav-font)",
        }}
      >
        {/* Gradient accent line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 70%, transparent 100%)" }} />

        {/* Subtle noise/texture overlay */}
        <div style={{
          position: "absolute", inset: 0, top: 2, pointerEvents: "none", zIndex: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
          opacity: 0.4,
        }} />

        <div style={{ maxWidth: 1800, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", height: 62, alignItems: "center", gap: 24 }}>

            {/* ── Brand ── */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
                background: "transparent", border: "none", cursor: "pointer",
                padding: "6px 10px", borderRadius: 10,
                transition: "background 150ms",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <div style={{
                width: 34, height: 34,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 9,
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.3)",
                boxShadow: "0 0 16px rgba(99,102,241,0.15)",
              }}>
                <img src={logo} alt="" style={{ height: 19, width: "auto", opacity: 0.9, filter: "brightness(0) invert(1)" }} />
              </div>
              <div style={{ paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 1 }}>
                  Asamblea Legislativa
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--nav-text-strong)", lineHeight: 1 }}>
                  Transporte
                </p>
              </div>
            </button>

            {/* ── Nav ── */}
            <nav style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Navegación principal">
              <div style={{
                display: "flex", alignItems: "center", gap: 2,
                borderRadius: 12,
                border: "1px solid var(--nav-border)",
                background: "rgba(255,255,255,0.03)",
                padding: 4,
                backdropFilter: "blur(8px)",
              }}>
                {nav.map((n) => (
                  <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon} variant="top" forceActive={n.forceActive} badge={n.badge} />
                ))}
              </div>
            </nav>

            {/* ── User menu ── */}
            <div style={{ position: "relative", flexShrink: 0 }} data-user-menu-root>
              <button
                type="button"
                onClick={() => setUserMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenu}
                aria-label="Menú de usuario"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 10px 6px 6px",
                  borderRadius: 10,
                  background: userMenu ? "rgba(255,255,255,0.08)" : "transparent",
                  border: `1px solid ${userMenu ? "var(--nav-border)" : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 150ms",
                  fontFamily: "var(--nav-font)",
                }}
                onMouseEnter={e => {
                  if (!userMenu) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={e => {
                  if (!userMenu) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Avatar initial={initial} size="md" />
                <div style={{ textAlign: "left", minWidth: 0, display: "flex", flexDirection: "column" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--nav-text-strong)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
                    {user?.name || "Usuario"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--nav-text)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.email || ""}
                  </p>
                </div>
                <span style={{ color: "var(--nav-text)" }}>
                  <IconChevron open={userMenu} />
                </span>
              </button>

              {/* Dropdown */}
              <div
                role="menu"
                aria-label="Opciones de usuario"
                style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)",
                  width: 220,
                  overflow: "hidden",
                  borderRadius: 12,
                  background: "#131c2e",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
                  transition: "opacity 150ms, transform 150ms",
                  opacity: userMenu ? 1 : 0,
                  transform: userMenu ? "scale(1) translateY(0)" : "scale(0.97) translateY(-4px)",
                  transformOrigin: "top right",
                  pointerEvents: userMenu ? "auto" : "none",
                  fontFamily: "var(--nav-font)",
                }}
              >
                <div style={{ height: 2, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />

                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--nav-border)" }}>
                  <Avatar initial={initial} size="lg" />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--nav-text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.name || "Usuario"}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--nav-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.email || ""}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "6px" }}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    style={{
                      display: "flex", width: "100%", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 8,
                      fontSize: 13, fontWeight: 500,
                      color: "rgba(255,100,100,0.75)",
                      background: "transparent", border: "none", cursor: "pointer",
                      transition: "all 150ms",
                      fontFamily: "var(--nav-font)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
                      (e.currentTarget as HTMLElement).style.color = "#f87171";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,100,100,0.75)";
                    }}
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