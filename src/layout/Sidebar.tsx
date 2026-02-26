import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = { open: boolean; onClose: () => void; onOpen: () => void };

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg viewBox="0 0 20 20" fill="none" width={16} height={16} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" />
    <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 20 20" fill="none" width={16} height={16} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <path d="M10 4v12M4 10h12" />
  </svg>
);

const IconList = () => (
  <svg viewBox="0 0 20 20" fill="none" width={16} height={16} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 6h9M7 10h9M7 14h5" />
    <circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="14" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 20 20" fill="none" width={15} height={15} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
    <circle cx="9" cy="9" r="5.5" />
    <path d="M13.5 13.5L17 17" />
  </svg>
);

const IconMenu = () => (
  <svg viewBox="0 0 20 20" fill="none" width={20} height={20} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <path d="M3 5h14M3 10h10M3 15h7" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 20 20" fill="none" width={20} height={20} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <path d="M15 5L5 15M5 5l10 10" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 20 20" fill="none" width={15} height={15} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" />
    <path d="M13 14l4-4-4-4M17 10H7" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" width={13} height={13}
    style={{ transition: "transform 200ms", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M4 6l4 4 4-4" />
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: 28, md: 32, lg: 36 }[size];
  return (
    <div style={{
      width: s, height: s, borderRadius: 8,
      background: "#1e293b",
      border: "1px solid rgba(255,255,255,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#e2e8f0", fontWeight: 600, fontSize: size === "lg" ? 14 : 12,
      flexShrink: 0, userSelect: "none",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {initial}
    </div>
  );
}

// ─── Badge dot ────────────────────────────────────────────────────────────────
function Dot() {
  return (
    <span style={{
      width: 7, height: 7, borderRadius: "50%",
      background: "#6366f1",
      display: "inline-block", flexShrink: 0,
    }} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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

  const NAV_BG = "#0f172a";
  const NAV_H = 60;
  const FONT = "'Inter', system-ui, sans-serif";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: ${FONT}; padding-top: ${NAV_H}px; }
        @media (max-width: 1023px) { body { padding-bottom: 62px; } }
        button { font-family: inherit; cursor: pointer; }

        /* Desktop */
        .snav-desktop { display: none !important; }
        @media (min-width: 1024px) { .snav-desktop { display: flex !important; } }

        /* Mobile only */
        .snav-mobile { display: flex !important; }
        @media (min-width: 1024px) { .snav-mobile { display: none !important; } }

        /* Nav link hover */
        a.snav-link:hover { color: rgba(255,255,255,0.9) !important; background: rgba(255,255,255,0.06) !important; }
        a.snav-link.active { color: #fff !important; }

        /* Drawer link */
        a.drawer-link:hover { color: rgba(255,255,255,0.9) !important; background: rgba(255,255,255,0.06) !important; }
        a.drawer-link.active { color: #fff !important; background: rgba(255,255,255,0.08) !important; }

        /* Bottom link */
        a.bottom-link.active .bl-icon { color: #fff !important; }
        a.bottom-link.active .bl-label { color: #fff !important; }
        a.bottom-link:hover .bl-icon { color: rgba(255,255,255,0.7) !important; }
        a.bottom-link:hover .bl-label { color: rgba(255,255,255,0.7) !important; }

        /* User btn */
        button.user-btn:hover { background: rgba(255,255,255,0.07) !important; }

        /* Logout */
        button.logout-btn:hover { color: #f87171 !important; background: rgba(239,68,68,0.08) !important; }

        /* Search */
        .search-box:focus-within { border-color: rgba(255,255,255,0.22) !important; }
        .search-box input { outline: none; background: transparent; border: none; color: #fff; font-size: 13.5px; width: 100%; font-family: ${FONT}; }
        .search-box input::placeholder { color: rgba(255,255,255,0.28); }
      `}</style>

      {/* ═══════════════════════════════════════
          DESKTOP NAVBAR (≥1024px)
      ═══════════════════════════════════════ */}
      <header
        className="snav-desktop"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: NAV_H, background: NAV_BG,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          alignItems: "center",
        }}
      >
        <div style={{
          width: "100%", maxWidth: 1440, margin: "0 auto",
          padding: "0 28px", display: "flex", alignItems: "center", gap: 0,
        }}>

          {/* Brand */}
          <button type="button" onClick={() => navigate("/dashboard")} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "none", border: "none",
            padding: "5px 8px 5px 4px", borderRadius: 8, flexShrink: 0,
            marginRight: 28,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={logo} alt="" style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", fontFamily: FONT }}>
              Transporte
            </span>
          </button>

          {/* Nav links — left-aligned like the reference image */}
          <nav style={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            {nav.map((n) => (
              <NavLink
                key={n.to} to={n.to} end
                className={({ isActive }) => `snav-link${(n.forceActive || isActive) ? " active" : ""}`}
                style={({ isActive }) => ({
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "7px 14px", borderRadius: 7,
                  fontSize: 14, fontWeight: 450,
                  color: (n.forceActive || isActive) ? "#fff" : "rgba(255,255,255,0.48)",
                  textDecoration: "none",
                  transition: "color 120ms, background 120ms",
                  fontFamily: FONT, letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                })}
              >
                <span style={{ opacity: 0.65 }}>{n.icon}</span>
                {n.label}
                {n.badge ? <Dot /> : null}
              </NavLink>
            ))}
          </nav>

          {/* Right: search + user */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Search bar */}
            <div className="search-box" style={{
              display: "flex", alignItems: "center", gap: 8,
              height: 36, width: 210, padding: "0 12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8, transition: "border-color 150ms",
            }}>
              <span style={{ color: "rgba(255,255,255,0.28)", display: "flex", flexShrink: 0 }}>
                <IconSearch />
              </span>
              <input placeholder="Buscar…" />
            </div>

            {/* User menu */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button type="button" className="user-btn" onClick={() => setUserMenu(v => !v)} style={{
                display: "flex", alignItems: "center", gap: 8,
                height: 38, padding: "0 10px 0 6px",
                background: userMenu ? "rgba(255,255,255,0.07)" : "transparent",
                border: `1px solid ${userMenu ? "rgba(255,255,255,0.1)" : "transparent"}`,
                borderRadius: 8, transition: "all 150ms",
              }}>
                <Avatar initial={initial} />
                <span style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.78)", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>
                  {user?.name || "Usuario"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.28)", display: "flex" }}>
                  <IconChevron open={userMenu} />
                </span>
              </button>

              {/* Dropdown */}
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)",
                width: 210, borderRadius: 10,
                background: "#0d1526",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
                padding: 6,
                transition: "opacity 150ms, transform 150ms",
                opacity: userMenu ? 1 : 0,
                transform: userMenu ? "translateY(0) scale(1)" : "translateY(-5px) scale(0.97)",
                transformOrigin: "top right",
                pointerEvents: userMenu ? "auto" : "none",
                zIndex: 10,
              }}>
                <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 5 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#fff", fontFamily: FONT }}>{user?.name || "Usuario"}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.32)", fontFamily: FONT }}>{user?.email || ""}</p>
                </div>
                <button type="button" onClick={handleLogout} className="logout-btn" style={{
                  display: "flex", alignItems: "center", gap: 9, width: "100%",
                  padding: "8px 12px", borderRadius: 7,
                  fontSize: 13.5, fontWeight: 450,
                  color: "rgba(255,255,255,0.42)",
                  background: "none", border: "none", transition: "all 130ms",
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
          MOBILE TOP BAR (<1024px)
      ═══════════════════════════════════════ */}
      <header
        className="snav-mobile"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          height: NAV_H, background: NAV_BG,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <button type="button" onClick={() => open ? onClose() : onOpen()} style={{
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, color: "rgba(255,255,255,0.6)",
        }}>
          {open ? <IconX /> : <IconMenu />}
        </button>

        <button type="button" onClick={() => navigate("/dashboard")} style={{
          display: "flex", alignItems: "center", gap: 9,
          background: "none", border: "none",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={logo} alt="" style={{ height: 16, filter: "brightness(0) invert(1)", opacity: 0.85 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: FONT }}>Transporte</span>
        </button>

        <button type="button" onClick={() => open ? onClose() : onOpen()} style={{ background: "none", border: "none", padding: 2 }}>
          <Avatar initial={initial} />
        </button>
      </header>

      {/* ── Backdrop ── */}
      <div
        className="snav-mobile"
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)",
          transition: "opacity 200ms",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* ── Drawer ── */}
      <aside
        className="snav-mobile"
        role="dialog" aria-modal="true" aria-label="Menú de navegación"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 50,
          width: 260, height: "100%", flexDirection: "column",
          background: NAV_BG,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 270ms cubic-bezier(0.32,0.72,0,1)",
          fontFamily: FONT,
        }}
      >
        {/* Top */}
        <div style={{
          height: NAV_H, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="" style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.85 }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Asamblea Legislativa</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>Transporte</p>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 9,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <Avatar initial={initial} size="lg" />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Usuario"}</p>
              <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.32)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          <p style={{ margin: "0 0 8px 10px", fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Menú</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {nav.map((n) => (
              <NavLink
                key={n.to} to={n.to} end onClick={onClose}
                className={({ isActive }) => `drawer-link${(n.forceActive || isActive) ? " active" : ""}`}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "9px 12px", borderRadius: 9,
                  fontSize: 14, fontWeight: 450,
                  color: (n.forceActive || isActive) ? "#fff" : "rgba(255,255,255,0.42)",
                  background: (n.forceActive || isActive) ? "rgba(255,255,255,0.07)" : "transparent",
                  textDecoration: "none", transition: "all 130ms",
                  fontFamily: FONT,
                })}
              >
                {n.icon}
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge ? <Dot /> : null}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" onClick={handleLogout} className="logout-btn" style={{
            display: "flex", alignItems: "center", gap: 9, width: "100%",
            padding: "9px 12px", borderRadius: 9,
            fontSize: 13.5, fontWeight: 450, color: "rgba(255,255,255,0.38)",
            background: "none", border: "none", transition: "all 130ms", fontFamily: FONT,
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
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "env(safe-area-inset-bottom)",
          fontFamily: FONT,
        }}
      >
        {nav.map((n) => (
          <NavLink
            key={n.to} to={n.to} end
            className={({ isActive }) => `bottom-link${(n.forceActive || isActive) ? " active" : ""}`}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 58, textDecoration: "none", padding: "6px 4px" }}
          >
            {({ isActive }) => {
              const active = (n.forceActive || isActive);
              return (
                <>
                  <span className="bl-icon" style={{ display: "flex", position: "relative", color: active ? "#fff" : "rgba(255,255,255,0.28)" }}>
                    {n.icon}
                    {n.badge ? (
                      <span style={{ position: "absolute", top: -2, right: -4, width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />
                    ) : null}
                  </span>
                  <span className="bl-label" style={{ fontSize: 10.5, fontWeight: 500, color: active ? "#fff" : "rgba(255,255,255,0.28)" }}>
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
}