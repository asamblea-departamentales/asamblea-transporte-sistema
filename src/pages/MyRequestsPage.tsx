// src/pages/MyRequestsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequests, type SolicitudTransporte } from "../services/transport-requests.service";

function kind(estado: string) {
  const s = (estado || "").toUpperCase();
  if (s.includes("APROB")) return "APROBADA";
  if (s.includes("RECHAZ")) return "RECHAZADA";
  if (s.includes("FINAL")) return "FINALIZADA";
  if (s.includes("PEND")) return "PENDIENTE";
  if (s.includes("BORR")) return "BORRADOR";
  return s || "—";
}

function StatusPill({ estado }: { estado: string }) {
  const k = kind(estado);
  const cls =
    k === "APROBADA"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : k === "RECHAZADA"
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      : k === "FINALIZADA"
      ? "bg-slate-900 text-white ring-1 ring-slate-800"
      : k === "PENDIENTE"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${cls}`}>{k}</span>;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-SV", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SolicitudTransporte[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyRequests();
        if (!alive) return;

        setItems(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? "No se pudieron cargar tus solicitudes.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-white/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/70 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-3 px-8 py-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Mis Solicitudes</h2>
            <p className="mt-1 text-sm text-slate-600">
              Aquí puedes ver y abrir el detalle de cada solicitud
            </p>
          </div>

          <button
            onClick={() => navigate("/nueva-solicitud")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Solicitud
          </button>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="px-8 py-6">
            <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Código</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Fecha salida</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Prioridad</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Estado</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-semibold">
                    Cargando solicitudes…
                  </td>
                </tr>
              ) : items.length === 0 && !error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="font-bold text-slate-900">No hay solicitudes todavía</p>
                    <p className="mt-1 text-sm text-slate-500">Crea tu primera solicitud para comenzar</p>
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr
                    key={r.code}
                    onClick={() => navigate(`/mis-solicitudes/${encodeURIComponent(r.code)}`)}
                    className="border-t border-slate-200/70 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    title="Click para ver el detalle"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="font-extrabold text-slate-900">{r.code}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-semibold text-slate-700">{formatDate(r.fecha_salida)}</span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900">{r.prioridad ?? "—"}</span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <StatusPill estado={r.estado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-8 py-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-700"
            >
              Volver al Dashboard
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
