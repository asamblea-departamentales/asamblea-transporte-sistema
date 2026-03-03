import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/asamble.png";
import { useAuth } from "../auth/AuthContext";
import React, { useState, useRef, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
type Props = { open: boolean; onClose: () => void; onOpen: () => void };

type NavItem = {
  to: string;
  label: string;
  icon: () => React.ReactElement;
  badge?: number;
};

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M9 6h11M9 12h11M9 18h6" />
      <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  ChevronDown: ({ open }: { open: boolean }) => (
    <svg
      width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ transition: "transform 200ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const dim = { sm: 30, md: 36, lg: 42 };
  const fs = { sm: 12, md: 14, lg: 16 };
  return (
    <div
      style={{
        width: dim[size],
        height: dim[size],
        fontSize: fs[size],
        background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)",
        borderRadius: size === "lg" ? 12 : 8,
        border: "1.5px solid rgba(96,165,250,0.3)",
        boxShadow: "0 2px 8px rgba(29,78,216,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: "#BFDBFE",
        fontFamily: "'Sora', sans-serif",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusDot() {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: "rgba(16,185,129,0.1)",
      border: "1px solid rgba(16,185,129,0.25)",
      borderRadius: 20,
      padding: "2px 8px",
      fontSize: 10,
      fontWeight: 600,
      color: "#6EE7B7",
      letterSpacing: "0.04em",
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: "#10B981",
        boxShadow: "0 0 4px #10B981",
        animation: "pulse 2s infinite",
      }} />
      En línea
    </span>
  );
}

// ─── NavItem Component ────────────────────────────────────────────────────────
function NavLinkItem({
  item,
  onClick,
  variant,
  pathname,
}: {
  item: NavItem;
  onClick?: () => void;
  variant: "desktop" | "drawer" | "bottom";
  pathname: string;
}) {
  const { to, label, icon: Icon, badge } = item;
  const isSpecialActive = to === "/nueva-solicitud" && pathname.startsWith("/solicitudes/");

  if (variant === "bottom") {
    return (
      <NavLink
        to={to}
        end
        onClick={onClick}
        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px 8px", gap: 4, textDecoration: "none", position: "relative", transition: "all 150ms" }}
        className={({ isActive }) => (isActive || isSpecialActive) ? "nav-bottom-active" : "nav-bottom"}
      >
        {({ isActive }) => {
          const active = isActive || isSpecialActive;
          return (
            <>
              <span style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.3)", transition: "color 150ms" }}>
                <Icon />
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? "#60A5FA" : "rgba(255,255,255,0.3)", transition: "color 150ms", letterSpacing: "0.01em" }}>
                {label}
              </span>
              {badge && (
                <span style={{
                  position: "absolute", top: 8, right: "calc(50% - 14px)",
                  width: 7, height: 7, borderRadius: "50%", background: "#3B82F6",
                  border: "1.5px solid #0A0F1E",
                }} />
              )}
              {active && (
                <span style={{
                  position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                  width: 24, height: 2, background: "#3B82F6", borderRadius: "2px 2px 0 0",
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
        onClick={onClick}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, textDecoration: "none", transition: "all 150ms", marginBottom: 2 }}
        className={({ isActive }) => (isActive || isSpecialActive) ? "nav-drawer-active" : "nav-drawer"}
      >
        {({ isActive }) => {
          const active = isActive || isSpecialActive;
          return (
            <>
              <span style={{
                width: 34, height: 34, borderRadius: 9,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                color: active ? "#60A5FA" : "rgba(255,255,255,0.4)",
                border: active ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                transition: "all 150ms",
              }}>
                <Icon />
              </span>
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? "#F0F6FF" : "rgba(255,255,255,0.45)", transition: "color 150ms", flex: 1 }}>
                {label}
              </span>
              {badge && (
                <span style={{
                  background: "rgba(59,130,246,0.2)", color: "#93C5FD",
                  fontSize: 11, fontWeight: 700, padding: "1px 7px",
                  borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {badge}
                </span>
              )}
            </>
          );
        }}
      </NavLink>
    );
  }

  // Desktop
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 8, textDecoration: "none", transition: "all 150ms", position: "relative", whiteSpace: "nowrap" }}
      className={({ isActive }) => (isActive || isSpecialActive) ? "nav-desktop-active" : "nav-desktop"}
    >
      {({ isActive }) => {
        const active = isActive || isSpecialActive;
        return (
          <>
            <span style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.4)", transition: "color 150ms" }}>
              <Icon />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? "#EFF6FF" : "rgba(255,255,255,0.45)", transition: "color 150ms", letterSpacing: "-0.01em" }}>
              {label}
            </span>
            {badge && (
              <span style={{
                background: "rgba(59,130,246,0.2)", color: "#93C5FD",
                fontSize: 10, fontWeight: 700, padding: "1px 6px",
                borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.02em",
              }}>
                {badge}
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Sidebar({ open, onClose, onOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pending = 3;

  const initial = (user?.name?.trim()?.[0] || "U").toUpperCase();

  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { to: "/nueva-solicitud", label: "Nueva solicitud", icon: Icons.Plus },
    { to: "/mis-solicitudes", label: "Mis solicitudes", icon: Icons.List, badge: pending },
  ];

  const handleLogout = async () => {
    onClose();
    setUserMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    onClose();
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); setUserMenuOpen(false); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      {/* ── Global Styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #070C18;
          color: white;
          font-family: 'Sora', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        button { font-family: inherit; cursor: pointer; border: none; background: none; }

        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px #10B981; }
          50% { opacity: 0.6; box-shadow: 0 0 8px #10B981; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }

        /* Desktop nav states */
        .nav-desktop {
          background: transparent;
        }
        .nav-desktop:hover {
          background: rgba(255,255,255,0.04);
        }
        .nav-desktop-active {
          background: rgba(59,130,246,0.1);
          box-shadow: inset 0 0 0 1px rgba(59,130,246,0.18);
        }

        /* Drawer nav states */
        .nav-drawer { background: transparent; }
        .nav-drawer:hover { background: rgba(255,255,255,0.04); }
        .nav-drawer-active { background: rgba(59,130,246,0.08); }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        /* Mobile page offset */
        @media (min-width: 1024px) {
          .page-content { padding-top: 68px; }
        }
        @media (max-width: 1023px) {
          .page-content { padding-top: 64px; padding-bottom: 72px; }
        }

        /* Search input */
        input[type="search"]::-webkit-search-cancel-button { display: none; }
        input[type="search"] { -webkit-appearance: none; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  DESKTOP HEADER                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header style={{
        display: "none",
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: 64,
        background: "rgba(7,12,24,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
        className="lg-flex"
      >
        {/* Accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 40%, rgba(99,102,241,0.4) 70%, transparent 100%)",
        }} />

        <div style={{
          maxWidth: 1280, margin: "0 auto", width: "100%",
          height: "100%", display: "flex", alignItems: "center",
          padding: "0 28px", gap: 20,
        }}>
          {/* Logo */}
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 10px", borderRadius: 10,
              transition: "background 150ms",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, rgba(29,78,216,0.5) 0%, rgba(30,58,138,0.8) 100%)",
              border: "1px solid rgba(59,130,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(29,78,216,0.25)",
            }}>
              <img src={logo} alt="Logo" style={{ height: 18, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(147,197,253,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Asamblea</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>Transporte</div>
            </div>
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            {navItems.map(item => (
              <NavLinkItem key={item.to} item={item} variant="desktop" pathname={location.pathname} />
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              height: 36, width: 200, padding: "0 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 9,
              transition: "all 150ms",
            }}
              onFocus={e => {
                (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(59,130,246,0.4)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)";
              }}
              onBlur={e => {
                (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.2)", display: "flex" }}>
                <Icons.Search />
              </span>
              <input
                type="search"
                placeholder="Buscar solicitud..."
                style={{
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 12.5, color: "white", width: "100%",
                  fontFamily: "'Sora', sans-serif",
                }}
              />
            </div>

            {/* Bell */}
            <button style={{
              width: 36, height: 36, borderRadius: 9,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.4)",
              position: "relative",
              transition: "all 150ms",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
              }}
            >
              <Icons.Bell />
              <span style={{
                position: "absolute", top: 7, right: 7,
                width: 6, height: 6, borderRadius: "50%",
                background: "#3B82F6", border: "1.5px solid #070C18",
              }} />
            </button>

            {/* User Menu */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  height: 40, padding: "0 10px 0 6px", borderRadius: 10,
                  background: userMenuOpen ? "rgba(59,130,246,0.08)" : "transparent",
                  border: userMenuOpen ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                  transition: "all 150ms",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  if (!userMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={e => {
                  if (!userMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <Avatar initial={initial} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.3, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.name || "Usuario"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(147,197,253,0.5)", lineHeight: 1.2 }}>Administrador</div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.25)", display: "flex" }}>
                  <Icons.ChevronDown open={userMenuOpen} />
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  width: 260,
                  background: "#0D1425",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)",
                  padding: 6,
                  zIndex: 200,
                  animation: "slideDown 150ms ease",
                }}>
                  {/* User info */}
                  <div style={{
                    padding: "12px 14px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: 4,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <Avatar initial={initial} size="lg" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{user?.name || "Usuario"}</div>
                        <div style={{ fontSize: 11, color: "rgba(147,197,253,0.5)", marginTop: 1 }}>{user?.email || ""}</div>
                      </div>
                    </div>
                    <StatusDot />
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      width: "100%", padding: "9px 12px", borderRadius: 9,
                      fontSize: 13, color: "rgba(255,255,255,0.4)",
                      transition: "all 150ms",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#FCA5A5";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
                    }}
                  >
                    <Icons.Logout />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Helper CSS for desktop flex (Tailwind alternative) */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
          .mobile-only { display: none !important; }
        }
        @media (max-width: 1023px) {
          .lg-flex { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MOBILE TOP BAR                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header
        className="mobile-only"
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          zIndex: 100, height: 60,
          background: "rgba(7,12,24,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        {/* Accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 50%, transparent 100%)",
        }} />

        {/* Hamburger */}
        <button
          onClick={open ? onClose : onOpen}
          style={{
            width: 38, height: 38, borderRadius: 9,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.6)",
            transition: "all 150ms",
          }}
        >
          {open ? <Icons.X /> : <Icons.Menu />}
        </button>

        {/* Logo center */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, rgba(29,78,216,0.5) 0%, rgba(30,58,138,0.8) 100%)",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={logo} alt="" style={{ height: 15, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Transporte</span>
        </button>

        {/* Avatar */}
        <button onClick={open ? onClose : onOpen}>
          <Avatar initial={initial} size="sm" />
        </button>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MOBILE DRAWER                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 110,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 200ms ease",
          }}
        />
      )}

      {/* Drawer panel */}
      <aside style={{
        position: "fixed", top: 0, left: 0,
        zIndex: 120, width: 280, height: "100%",
        background: "#080E1E",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Drawer top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, rgba(59,130,246,0.6) 0%, rgba(99,102,241,0.3) 100%)",
        }} />

        {/* Drawer header */}
        <div style={{
          height: 60, display: "flex", alignItems: "center", gap: 10, padding: "0 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, rgba(29,78,216,0.5) 0%, rgba(30,58,138,0.8) 100%)",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={logo} alt="" style={{ height: 17, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(147,197,253,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Asamblea</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>Transporte</div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: "14px 14px 10px", flexShrink: 0 }}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
              <Avatar initial={initial} size="lg" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name || "Usuario"}
                </div>
                <div style={{ fontSize: 10.5, color: "rgba(147,197,253,0.45)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email || ""}
                </div>
              </div>
            </div>
            <StatusDot />
          </div>
        </div>

        {/* Nav section */}
        <nav style={{ padding: "6px 14px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 4px 8px" }}>
            Menú principal
          </div>
          {navItems.map(item => (
            <NavLinkItem key={item.to} item={item} onClick={onClose} variant="drawer" pathname={location.pathname} />
          ))}
        </nav>

        {/* Drawer footer */}
        <div style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "10px 14px", borderRadius: 10,
              fontSize: 13, color: "rgba(255,255,255,0.35)",
              transition: "all 150ms", cursor: "pointer",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#FCA5A5";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
            }}
          >
            <Icons.Logout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MOBILE BOTTOM NAV                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <nav
        className="mobile-only"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 90,
          background: "rgba(7,12,24,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {navItems.map(item => (
            <NavLinkItem key={item.to} item={item} variant="bottom" pathname={location.pathname} />
          ))}
        </div>
      </nav>
    </>
  );
}