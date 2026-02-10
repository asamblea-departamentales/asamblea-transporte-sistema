// src/pages/MyRequestsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequests, type SolicitudTransporte } from "../services/transport-requests.service";

function StatusPill({ status }: { status: string }) {
  const s = status.toUpperCase();

  const ui =
    s.includes("APROB")
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : s.includes("RECHAZ")
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      : s.includes("FINAL")
      ? "bg-slate-900 text-white ring-1 ring-slate-800"
      : s.includes("PEND")
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${ui}`}>
      {status}
    </span>
  );
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
        const data = await getMyRequests();
        if (!alive) return;
        setItems(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudieron cargar las solicitudes.");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Mis Solicitudes</h1>

        <button
          onClick={() => navigate("/nueva-solicitud")}
          className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow hover:bg-blue-700"
        >
          Nueva Solicitud
        </button>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">Código</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">Tipo</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase text-slate-600">Estado</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  Cargando solicitudes…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  No tienes solicitudes registradas
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr
                  key={r.code}
                  onClick={() => navigate(`/mis-solicitudes/${encodeURIComponent(r.code)}`)}
                  className="cursor-pointer border-t border-slate-200 hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-5 font-extrabold text-slate-900">
                    {r.code}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-700">
                    {r.fecha_salida ?? r.created_at ?? "—"}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900">
                    Solicitud de Transporte
                  </td>
                  <td className="px-6 py-5 text-right">
                    <StatusPill status={r.estado} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
