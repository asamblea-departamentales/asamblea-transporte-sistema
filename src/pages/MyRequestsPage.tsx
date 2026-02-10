// src/pages/MyRequestsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequests, type TransportRequest } from "../services/transport-requests.service";

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-t border-slate-200/70">
      <td className="px-5 py-4">
        <div className="h-4 w-44 rounded-lg bg-slate-200" />
      </td>
      <td className="px-5 py-4">
        <div className="h-4 w-36 rounded-lg bg-slate-200" />
      </td>
      <td className="px-5 py-4">
        <div className="h-4 w-28 rounded-lg bg-slate-200" />
      </td>
      <td className="px-5 py-4 text-right">
        <div className="ml-auto h-7 w-28 rounded-full bg-slate-200" />
      </td>
    </tr>
  );
}

function statusUi(status: string) {
  const s = (status || "").toLowerCase();

  if (s.includes("aprob") || s.includes("acept")) {
    return {
      label: "aprobada",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dot: "bg-emerald-500",
    };
  }
  if (s.includes("rechaz")) {
    return {
      label: "rechazada",
      cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      dot: "bg-slate-500",
    };
  }
  // default pendiente
  return {
    label: "pendiente",
    cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  };
}

function StatusPill({ status }: { status: string }) {
  const ui = statusUi(status);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${ui.cls}`}>
      <span className={`h-2 w-2 rounded-full ${ui.dot}`} />
      {ui.label}
    </span>
  );
}

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TransportRequest[]>([]);
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
        setError(e?.message ?? "No se pudieron cargar tus solicitudes.");
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
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Solicitudes Recientes</h2>
            <p className="mt-1 text-sm text-slate-600">Últimas solicitudes registradas en el sistema</p>
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
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tipo de Solicitud
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Estado</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : items.length === 0 && !error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="font-bold text-slate-900">No hay solicitudes todavía</p>
                    <p className="mt-1 text-sm text-slate-500">Crea tu primera solicitud para comenzar</p>
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.code} className="border-t border-slate-200/70 hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="font-extrabold text-slate-900">{r.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-semibold text-slate-700">{r.date}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-extrabold text-slate-900">{r.type}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <StatusPill status={r.status} />
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
