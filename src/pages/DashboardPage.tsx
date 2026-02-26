import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardSummary,
  getRecentRequests,
  type DashboardSummary,
  type RecentRequest,
} from "../services/dashboard.service";

// ─── Skeleton Components ──────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 12, width: 80, borderRadius: 6, background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 32, width: 60, borderRadius: 8, background: "#e2e8f0", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
      <div style={{ height: 10, width: 100, borderRadius: 6, background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
      {[80, 100, 120, 70].map((w, i) => (
        <td key={i} style={{ padding: "14px 20px" }}>
          <div style={{ height: 12, width: w, borderRadius: 6, background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  let bg: string, color: string, dot: string;

  if (s.includes("aprob") || s.includes("aceptad")) {
    bg = "#f0fdf4"; color = "#15803d"; dot = "#22c55e";
  } else if (s.includes("pend")) {
    bg = "#fffbeb"; color = "#b45309"; dot = "#f59e0b";
  } else if (s.includes("progres")) {
    bg = "#eff6ff"; color = "#1d4ed8"; dot = "#3b82f6";
  } else if (s.includes("finaliz") || s.includes("complet")) {
    bg = "#f8fafc"; color = "#475569"; dot = "#94a3b8";
  } else {
    bg = "#f8fafc"; color = "#475569"; dot = "#94a3b8";
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: bg, color,
      fontSize: 12, fontWeight: 600,
      fontFamily: "var(--font)",
      whiteSpace: "nowrap",
      border: `1px solid ${dot}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title, value, tag, icon, accent, loading,
}: {
  title: string;
  value: number | null;
  tag: string;
  icon: React.ReactNode;
  accent: { bg: string; icon: string; text: string; dot: string };
  loading: boolean;
}) {
  if (loading) return <SkeletonCard />;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 4,
      transition: "box-shadow 180ms, border-color 180ms",
      cursor: "default",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
        (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font)" }}>
            {title}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            {value ?? 0}
          </p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: accent.bg, color: accent.icon,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Tag */}
      <div style={{ marginTop: 12 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11.5, fontWeight: 600, color: accent.text,
          fontFamily: "var(--font)",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent.dot }} />
          {tag}
        </span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<RecentRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const [s, r] = await Promise.all([getDashboardSummary(), getRecentRequests()]);
        if (!alive) return;
        setSummary(s); setRecent(r);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudo cargar el dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const cards = useMemo(() => [
    {
      title: "Pendientes",
      value: summary?.pending ?? null,
      tag: "Por aprobar",
      accent: { bg: "#fffbeb", icon: "#b45309", text: "#b45309", dot: "#f59e0b" },
      icon: (
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "En Progreso",
      value: summary?.in_progress ?? null,
      tag: "En proceso",
      accent: { bg: "#eff6ff", icon: "#1d4ed8", text: "#1d4ed8", dot: "#3b82f6" },
      icon: (
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Aceptadas",
      value: summary?.accepted ?? null,
      tag: "Aprobadas",
      accent: { bg: "#f0fdf4", icon: "#15803d", text: "#15803d", dot: "#22c55e" },
      icon: (
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Finalizadas",
      value: summary?.completed ?? null,
      tag: "Completadas",
      accent: { bg: "#f8fafc", icon: "#475569", text: "#475569", dot: "#94a3b8" },
      icon: (
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ], [summary]);

  const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root { --font: ${FONT}; }
        * { box-sizing: border-box; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .dash-table tr:last-child td { border-bottom: none !important; }
        .dash-table tbody tr:hover td { background: #f9fafb; }
        .dash-table tbody tr { transition: background 120ms; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: FONT,
        padding: "32px 24px 60px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            marginBottom: 32, gap: 16, flexWrap: "wrap",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Asamblea Legislativa · Transporte
              </p>
              <h1 style={{ margin: "4px 0 6px", fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: "#6b7280", fontWeight: 400 }}>
                Resumen general de solicitudes de transporte
              </p>
            </div>

            <button
              onClick={() => navigate("/nueva-solicitud")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 8,
                background: "#0f172a", color: "#fff",
                fontSize: 13.5, fontWeight: 600,
                border: "none", cursor: "pointer",
                transition: "background 150ms",
                fontFamily: FONT, letterSpacing: "-0.01em",
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#1e293b"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#0f172a"}
            >
              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva solicitud
            </button>
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px", borderRadius: 10,
              background: "#fef2f2", border: "1px solid #fecaca",
              marginBottom: 28,
            }}>
              <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p style={{ margin: 0, fontSize: 13.5, color: "#991b1b", fontWeight: 500, fontFamily: FONT }}>{error}</p>
            </div>
          )}

          {/* ── Stat Cards ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}>
            {cards.map((c) => (
              <StatCard key={c.title} {...c} loading={loading} />
            ))}
          </div>

          {/* ── Recent Requests Table ── */}
          <div style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1px solid #f1f5f9",
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                  Solicitudes recientes
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#9ca3af", fontWeight: 400 }}>
                  Últimas solicitudes registradas en el sistema
                </p>
              </div>

              {!loading && recent.length > 0 && (
                <button
                  onClick={() => navigate("/mis-solicitudes")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 7,
                    background: "transparent",
                    border: "1px solid #e5e7eb",
                    color: "#374151", fontSize: 12.5, fontWeight: 600,
                    cursor: "pointer", transition: "all 130ms",
                    fontFamily: FONT,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "#f9fafb";
                    (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                  }}
                >
                  Ver todas
                  <svg width={12} height={12} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
              )}
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="dash-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Código", "Fecha", "Tipo", "Estado"].map((h, i) => (
                      <th key={h} style={{
                        padding: "10px 20px",
                        textAlign: i === 3 ? "right" : "left",
                        fontSize: 11, fontWeight: 700,
                        color: "#9ca3af",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #f1f5f9",
                        fontFamily: FONT,
                        whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                  ) : recent.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "56px 24px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: "#f1f5f9",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#374151", fontFamily: FONT }}>
                              Sin solicitudes recientes
                            </p>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af", fontFamily: FONT }}>
                              Crea tu primera solicitud para comenzar.
                            </p>
                          </div>
                          <button
                            onClick={() => navigate("/nueva-solicitud")}
                            style={{
                              marginTop: 4,
                              display: "inline-flex", alignItems: "center", gap: 7,
                              padding: "8px 16px", borderRadius: 8,
                              background: "#0f172a", color: "#fff",
                              fontSize: 13, fontWeight: 600,
                              border: "none", cursor: "pointer",
                              fontFamily: FONT,
                            }}
                          >
                            <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva solicitud
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recent.map((r) => (
                      <tr key={r.code} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        {/* Código */}
                        <td style={{ padding: "13px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", fontFamily: FONT }}>
                              {r.code}
                            </span>
                          </div>
                        </td>

                        {/* Fecha */}
                        <td style={{ padding: "13px 20px" }}>
                          <span style={{ fontSize: 13.5, color: "#6b7280", fontFamily: FONT }}>{r.date}</span>
                        </td>

                        {/* Tipo */}
                        <td style={{ padding: "13px 20px" }}>
                          <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 500, fontFamily: FONT }}>{r.type}</span>
                        </td>

                        {/* Estado */}
                        <td style={{ padding: "13px 20px", textAlign: "right" }}>
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile footer */}
            {!loading && recent.length > 0 && (
              <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
                <button
                  onClick={() => navigate("/mis-solicitudes")}
                  style={{
                    display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px", borderRadius: 8,
                    background: "transparent", border: "1px solid #e5e7eb",
                    fontSize: 13.5, fontWeight: 600, color: "#374151",
                    cursor: "pointer", fontFamily: FONT,
                  }}
                >
                  Ver todas las solicitudes
                  <svg width={13} height={13} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}