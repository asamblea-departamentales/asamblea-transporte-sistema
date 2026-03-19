import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardSummary,
  getRecentRequests,
  type DashboardSummary,
  type RecentRequest,
} from "../services/dashboard.service";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
      padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 11, width: 70, borderRadius: 6, background: "#f1f5f9", animation: "skpulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: 34, width: 55, borderRadius: 8, background: "#e2e8f0", animation: "skpulse 1.4s ease-in-out infinite" }} />
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: "#f1f5f9", animation: "skpulse 1.4s ease-in-out infinite" }} />
      </div>
      <div style={{ height: 10, width: 90, borderRadius: 6, background: "#f1f5f9", animation: "skpulse 1.4s ease-in-out infinite" }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[90, 110, 100, 72].map((w, i) => (
        <td key={i} style={{ padding: "15px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ height: 12, width: w, borderRadius: 6, background: "#f1f5f9", animation: "skpulse 1.4s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let bg: string, color: string, dot: string;
  if (s.includes("aprob") || s.includes("aceptad") || s.includes("pre_apro")) {
    bg = "#f0fdf4"; color = "#15803d"; dot = "#22c55e";
  } else if (s.includes("pend")) {
    bg = "#fffbeb"; color = "#b45309"; dot = "#f59e0b";
  } else if (s.includes("rechaz")) {
    bg = "#fef2f2"; color = "#b91c1c"; dot = "#ef4444";
  } else if (s.includes("progres")) {
    bg = "#eff6ff"; color = "#1d4ed8"; dot = "#3b82f6";
  } else {
    bg = "#f8fafc"; color = "#475569"; dot = "#94a3b8";
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 11px", borderRadius: 999,
      background: bg, color, fontSize: 12, fontWeight: 600,
      border: `1px solid ${dot}28`, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Stat Card with top-border hover effect ───────────────────────────────────

function StatCard({ title, value, tag, icon, accent, loading }: {
  title: string; value: number | null; tag: string;
  icon: React.ReactNode;
  accent: { bg: string; iconColor: string; text: string; dot: string; line: string };
  loading: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  if (loading) return <SkeletonCard />;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "#fff",
        border: "1px solid",
        borderColor: hovered ? "#d1d5db" : "#e5e7eb",
        borderRadius: 14,
        padding: "22px 24px 20px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 200ms, box-shadow 200ms, transform 200ms",
        boxShadow: hovered ? "0 8px 30px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        cursor: "default",
      }}
    >
      {/* Top color line on hover */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: accent.line,
        borderRadius: "14px 14px 0 0",
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 250ms cubic-bezier(0.4,0,0.2,1)",
      }} />

      {/* Corner glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 80, height: 80, borderRadius: "50%",
        background: accent.line,
        opacity: hovered ? 0.08 : 0,
        transition: "opacity 250ms",
        filter: "blur(20px)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            {title}
          </p>
          <p style={{ margin: "7px 0 0", fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {value ?? 0}
          </p>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: hovered ? accent.bg : "#f8fafc",
          color: accent.iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 200ms",
        }}>
          {icon}
        </div>
      </div>

      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11.5, fontWeight: 600, color: accent.text,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent.dot }} />
        {tag}
      </span>
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

  const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

  const cards = useMemo(() => [
    {
      title: "Pendientes",
      value: summary?.pending ?? null,
      tag: "Por aprobar",
      accent: { bg: "#fffbeb", iconColor: "#d97706", text: "#b45309", dot: "#f59e0b", line: "#f59e0b" },
      icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      title: "En Progreso",
      value: summary?.in_progress ?? null,
      tag: "En proceso",
      accent: { bg: "#eff6ff", iconColor: "#2563eb", text: "#1d4ed8", dot: "#3b82f6", line: "#3b82f6" },
      icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      title: "Aceptadas",
      value: summary?.accepted ?? null,
      tag: "Aprobadas",
      accent: { bg: "#f0fdf4", iconColor: "#16a34a", text: "#15803d", dot: "#22c55e", line: "#22c55e" },
      icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      title: "Finalizadas",
      value: summary?.completed ?? null,
      tag: "Completadas",
      accent: { bg: "#f1f5f9", iconColor: "#64748b", text: "#475569", dot: "#94a3b8", line: "#94a3b8" },
      icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
  ], [summary]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .dtable tbody tr { transition: background 120ms; }
        .dtable tbody tr:hover td { background: #fafafa !important; }
        .dtable tbody tr:last-child td { border-bottom: none !important; }
        .dtable th, .dtable td { font-family: ${FONT}; }
      `}</style>

      {/* NO minHeight, NO extra bg — layout handles that */}
      <div style={{ fontFamily: FONT, paddingTop: 4 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            marginBottom: 28, gap: 16, flexWrap: "wrap",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Asamblea Legislativa · Transporte
              </p>
              <h1 style={{ margin: "4px 0 5px", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.035em", lineHeight: 1.1 }}>
                Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: "#6b7280" }}>
                Resumen general de solicitudes de transporte
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => navigate("/nueva-solicitud")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "9px 18px", borderRadius: 9,
                  background: "#0f172a", color: "#fff",
                  fontSize: 13.5, fontWeight: 600,
                  border: "none", cursor: "pointer",
                  transition: "background 150ms, transform 150ms",
                  fontFamily: FONT, flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1e293b"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0f172a"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Nueva solicitud
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "13px 16px", borderRadius: 10,
              background: "#fef2f2", border: "1px solid #fecaca", marginBottom: 24,
            }}>
              <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p style={{ margin: 0, fontSize: 13.5, color: "#991b1b", fontWeight: 500 }}>{error}</p>
            </div>
          )}

          {/* ── Cards ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: 14, marginBottom: 28,
          }}>
            {cards.map(c => <StatCard key={c.title} {...c} loading={loading} />)}
          </div>

          {/* ── Table ── */}
          <div style={{
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 14, overflow: "hidden",
          }}>
            {/* Table top */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: "1px solid #f1f5f9",
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                  Solicitudes recientes
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#9ca3af" }}>
                  Últimas solicitudes registradas en el sistema
                </p>
              </div>
              {!loading && recent.length > 0 && (
                <button
                  onClick={() => navigate("/mis-solicitudes")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "6px 13px", borderRadius: 8,
                    background: "transparent", border: "1px solid #e5e7eb",
                    color: "#374151", fontSize: 12.5, fontWeight: 600,
                    cursor: "pointer", transition: "all 130ms", fontFamily: FONT,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; }}
                >
                  Ver todas
                  <svg width={12} height={12} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </button>
              )}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="dtable" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f1f5f9" }}>
                    {(["Código", "Fecha", "Tipo", "Estado"] as const).map((h, i) => (
                      <th key={h} style={{
                        padding: "10px 20px", textAlign: i === 3 ? "right" : "left",
                        fontSize: 10.5, fontWeight: 700, color: "#9ca3af",
                        letterSpacing: "0.07em", textTransform: "uppercase",
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
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#374151" }}>Sin solicitudes recientes</p>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>Crea tu primera solicitud para comenzar.</p>
                          </div>
                          <button onClick={() => navigate("/nueva-solicitud")} style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: FONT }}>
                            <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            Nueva solicitud
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recent.map(r => (
                      <tr key={r.code} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>{r.code}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: 13.5, color: "#6b7280" }}>{r.date}</span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 500 }}>{r.type}</span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && recent.length > 0 && (
              <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
                <button
                  onClick={() => navigate("/mis-solicitudes")}
                  style={{
                    display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px", borderRadius: 8, background: "transparent",
                    border: "1px solid #e5e7eb", fontSize: 13.5, fontWeight: 600,
                    color: "#374151", cursor: "pointer", fontFamily: FONT,
                  }}
                >
                  Ver todas las solicitudes
                  <svg width={13} height={13} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}