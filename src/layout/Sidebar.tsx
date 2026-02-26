import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState, useRef } from "react";

type Props = { open: boolean; onClose: () => void; onOpen: () => void };

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6h11M9 12h11M9 18h6" />
    <circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" width={16} height={16} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L20 20" />
  </svg>
);

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" width={22} height={22} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M4 6h16M4 12h12M4 18h8" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" width={22} height={22} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" width={17} height={17} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" width={14} height={14}
    style={{ transition: "transform 220ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M4 6l4 4 4-4" />
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: 32, md: 38, lg: 44 }[size];
  const fs = { sm: 13, md: 15, lg: 17 }[size];
  return (
    <div style={{
      width: s, height: s, borderRadius: 10,
      background: "linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)",
      border: "1.5px solid rgba(99,102,241,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#a5b4fc", fontWeight: 700, fontSize: fs,
      flexShrink: 0, userSelect: "none",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      boxShadow: "0 2px 8px rgba(99,102,241,0.2)",
    }}>
      {initial}
    </div>
  );
}

export default function Sidebar({ open, onClose, onOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenu, setUserMenu] = useState(false);
  const [pending] = useState(3);
  const menuRef = useRef<HTMLDivElement>(null);

  const isNew =
    location.pathname === "/nueva-solicitud" ||
    location.pathname.startsWith("/solicitudes/");

  const initial = useMemo(
    () => (user?.name?.trim()?.[0] || "U").toUpperCase(),
    [user?.name]
  );

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
    { to: "/nueva-solicitud", label: "Nueva solicitud", icon: <IconPlus />, forceActive: isNew },
    { to: "/mis-solicitudes", label: "Mis solicitudes", icon: <IconList />, badge: pending },
  ];

  const NAV_BG = "#0b1120";
  const NAV_H = 72;
  const FONT = "'DM Sans', system-ui, sans-serif";
  const ACCENT = "#6366f1";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: ${FONT};
          padding-top: ${NAV_H}px;
        }
        @media (max-width: 1023px) { body { padding-bottom: 70px; } }
        button { font-family: inherit; cursor: pointer; }

        .snav-desktop { display: none !important; }
        @media (min-width: 1024px) { .snav-desktop { display: flex !important; } }

        .snav-mobile { display: flex !important; }
        @media (min-width: 1024px) { .snav-mobile { display: none !important; } }

        /* Desktop nav link */
        a.snav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.42);
          text-decoration: none;
          transition: color 150ms, background 150ms;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        a.snav-link:hover {
          color: rgba(255,255,255,0.85) !important;
          background: rgba(255,255,255,0.06) !important;
        }
        a.snav-link.active {
          color: #fff !important;
          background: rgba(99,102,241,0.12) !important;
        }
        a.snav-link.active::before {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: ${ACCENT};
          border-radius: 2px;
        }

        /* Drawer link */
        a.drawer-link {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          transition: all 150ms;
          letter-spacing: -0.01em;
        }
        a.drawer-link:hover {
          color: rgba(255,255,255,0.85) !important;
          background: rgba(255,255,255,0.05) !important;
        }
        a.drawer-link.active {
          color: #fff !important;
          background: rgba(99,102,241,0.14) !important;
          box-shadow: inset 3px 0 0 ${ACCENT};
        }

        /* Bottom nav */
        a.bottom-link {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: 66px;
          text-decoration: none;
          padding: 8px 4px;
          transition: all 150ms;
        }
        a.bottom-link.active .bl-icon { color: ${ACCENT} !important; }
        a.bottom-link.active .bl-label { color: ${ACCENT} !important; }
        a.bottom-link:hover .bl-icon { color: rgba(255,255,255,0.65) !important; }
        a.bottom-link:hover .bl-label { color: rgba(255,255,255,0.65) !important; }

        /* User btn */
        button.user-btn:hover { background: rgba(255,255,255,0.06) !important; }

        /* Logout btn */
        button.logout-btn:hover {
          color: #fca5a5 !important;
          background: rgba(239,68,68,0.1) !important;
        }

        /* Search input */
        .search-box:focus-within {
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }
        .search-box input {
          outline: none;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 14px;
          width: 100%;
          font-family: ${FONT};
        }
        .search-box input::placeholder { color: rgba(255,255,255,0.22); }

        /* Badge pill */
        .badge-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 20px;
          background: rgba(99,102,241,0.2);
          color: #a5b4fc;
          font-size: 11.5px;
          font-weight: 600;
          font-family: 'DM Mono', monospace;
        }
      `}</style>

      {/* ═══════════════════════════════════════
          DESKTOP NAVBAR (≥1024px)
      ═══════════════════════════════════════ */}
      <header
        className="snav-desktop"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: NAV_H,
          background: `linear-gradient(180deg, ${NAV_BG} 0%, #0d1526 100%)`,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          alignItems: "center",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Subtle top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 30%, #818cf8 60%, transparent 100%)`,
          opacity: 0.6,
        }} />

        <div style={{
          width: "100%", maxWidth: 1480, margin: "0 auto",
          padding: "0 32px", display: "flex", alignItems: "center", gap: 0,
        }}>

          {/* Brand */}
          <button type="button" onClick={() => navigate("/dashboard")} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "none", border: "none",
            padding: "6px 14px 6px 0px", borderRadius: 10, flexShrink: 0,
            marginRight: 32,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.08) 100%)",
              border: "1px solid rgba(99,102,241,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,0.15)",
            }}>
              <img src={logo} alt="" style={{ height: 22, filter: "brightness(0) invert(1)", opacity: 0.92 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: "rgba(165,180,252,0.6)",
                textTransform: "uppercase", letterSpacing: "0.1em",
                lineHeight: 1, fontFamily: FONT,
              }}>
                Asamblea
              </span>
              <span style={{
                fontSize: 16, fontWeight: 700,
                color: "#fff", letterSpacing: "-0.03em",
                lineHeight: 1.2, fontFamily: FONT,
              }}>
                Transporte
              </span>
            </div>
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", marginRight: 28 }} />

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            {nav.map((n) => (
              <NavLink
                key={n.to} to={n.to} end
                className={({ isActive }) => `snav-link${(n.forceActive || isActive) ? " active" : ""}`}
              >
                <span style={{ display: "flex", opacity: 0.7 }}>{n.icon}</span>
                {n.label}
                {n.badge ? <span className="badge-pill">{n.badge}</span> : null}
              </NavLink>
            ))}
          </nav>

          {/* Right: search + user */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* Search */}
            <div className="search-box" style={{
              display: "flex", alignItems: "center", gap: 9,
              height: 40, width: 230, padding: "0 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, transition: "border-color 150ms, box-shadow 150ms",
            }}>
              <span style={{ color: "rgba(255,255,255,0.22)", display: "flex", flexShrink: 0 }}>
                <IconSearch />
              </span>
              <input placeholder="Buscar…" />
            </div>

            {/* User menu */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button type="button" className="user-btn" onClick={() => setUserMenu(v => !v)} style={{
                display: "flex", alignItems: "center", gap: 10,
                height: 44, padding: "0 12px 0 8px",
                background: userMenu ? "rgba(255,255,255,0.06)" : "transparent",
                border: `1px solid ${userMenu ? "rgba(99,102,241,0.3)" : "transparent"}`,
                borderRadius: 12, transition: "all 180ms",
              }}>
                <Avatar initial={initial} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{
                    fontSize: 13.5, fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                    maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontFamily: FONT, lineHeight: 1.2,
                  }}>
                    {user?.name || "Usuario"}
                  </span>
                  <span style={{ fontSize: 11.5, color: "rgba(165,180,252,0.5)", fontFamily: FONT, lineHeight: 1.2 }}>
                    En línea
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.25)", display: "flex", marginLeft: 2 }}>
                  <IconChevron open={userMenu} />
                </span>
              </button>

              {/* Dropdown */}
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                width: 230, borderRadius: 14,
                background: "#0d1526",
                border: "1px solid rgba(99,102,241,0.15)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
                padding: 8,
                transition: "opacity 170ms ease, transform 170ms ease",
                opacity: userMenu ? 1 : 0,
                transform: userMenu ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.97)",
                transformOrigin: "top right",
                pointerEvents: userMenu ? "auto" : "none",
                zIndex: 10,
              }}>
                <div style={{
                  padding: "12px 14px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  marginBottom: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
                    <Avatar initial={initial} size="lg" />
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: FONT }}>{user?.name || "Usuario"}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(165,180,252,0.45)", fontFamily: FONT }}>{user?.email || ""}</p>
                    </div>
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 20,
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                    <span style={{ fontSize: 11.5, color: "#a5b4fc", fontWeight: 600, fontFamily: FONT }}>Sesión activa</span>
                  </div>
                </div>
                <button type="button" onClick={handleLogout} className="logout-btn" style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "10px 14px", borderRadius: 9,
                  fontSize: 14, fontWeight: 500,
                  color: "rgba(255,255,255,0.38)",
                  background: "none", border: "none", transition: "all 140ms",
                  fontFamily: FONT,
                }}>
                  <IconLogout />
                  Cerrar sesión
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          MOBILE TOP BAR
      ═══════════════════════════════════════ */}
      <header
        className="snav-mobile"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: NAV_H, background: NAV_BG,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}, #818cf8, transparent)`, opacity: 0.6 }} />

        <button type="button" onClick={() => open ? onClose() : onOpen()} style={{
          width: 40, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, color: "rgba(255,255,255,0.65)",
          transition: "all 150ms",
        }}>
          {open ? <IconX /> : <IconMenu />}
        </button>

        <button type="button" onClick={() => navigate("/dashboard")} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "none",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={logo} alt="" style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: FONT, letterSpacing: "-0.02em" }}>Transporte</span>
        </button>

        <button type="button" onClick={() => open ? onClose() : onOpen()} style={{ background: "none", border: "none", padding: 2 }}>
          <Avatar initial={initial} size="sm" />
        </button>
      </header>

      {/* ── Backdrop ── */}
      <div
        className="snav-mobile"
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
          transition: "opacity 220ms",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* ── Drawer ── */}
      <aside
        className="snav-mobile"
        role="dialog" aria-modal="true" aria-label="Menú de navegación"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 50,
          width: 280, height: "100%", flexDirection: "column",
          background: NAV_BG,
          borderRight: "1px solid rgba(99,102,241,0.1)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.32,0.72,0,1)",
          fontFamily: FONT,
        }}
      >
        {/* Top */}
        <div style={{
          height: NAV_H, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 12,
          padding: "0 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${ACCENT}, #818cf8)`, opacity: 0.7 }} />
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="" style={{ height: 20, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, color: "rgba(165,180,252,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Asamblea Legislativa</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Transporte</p>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 12,
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.12)",
          }}>
            <Avatar initial={initial} size="lg" />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Usuario"}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(165,180,252,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          <p style={{ margin: "0 0 10px 12px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.16)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Navegación</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {nav.map((n) => (
              <NavLink
                key={n.to} to={n.to} end onClick={onClose}
                className={({ isActive }) => `drawer-link${(n.forceActive || isActive) ? " active" : ""}`}
              >
                <span style={{ display: "flex", opacity: 0.75 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge ? <span className="badge-pill">{n.badge}</span> : null}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={handleLogout} className="logout-btn" style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "11px 16px", borderRadius: 12,
            fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.35)",
            background: "none", border: "none", transition: "all 140ms", fontFamily: FONT,
          }}>
            <IconLogout /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Bottom bar ── */}
      <nav
        className="snav-mobile"
        aria-label="Navegación principal"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
          background: NAV_BG,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingBottom: "env(safe-area-inset-bottom)",
          fontFamily: FONT,
        }}
      >
        {nav.map((n) => (
          <NavLink
            key={n.to} to={n.to} end
            className={({ isActive }) => `bottom-link${(n.forceActive || isActive) ? " active" : ""}`}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, minHeight: 66, textDecoration: "none", padding: "8px 4px" }}
          >
            {({ isActive }) => {
              const active = (n.forceActive || isActive);
              return (
                <>
                  <span className="bl-icon" style={{ display: "flex", position: "relative", color: active ? ACCENT : "rgba(255,255,255,0.25)" }}>
                    {n.icon}
                    {n.badge ? (
                      <span style={{ position: "absolute", top: -3, right: -5, width: 8, height: 8, borderRadius: "50%", background: ACCENT, border: "2px solid #0b1120" }} />
                    ) : null}
                  </span>
                  <span className="bl-label" style={{ fontSize: 11, fontWeight: 600, color: active ? ACCENT : "rgba(255,255,255,0.25)", letterSpacing: "-0.01em" }}>
                    {n.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>
    </>
  );
}//HE