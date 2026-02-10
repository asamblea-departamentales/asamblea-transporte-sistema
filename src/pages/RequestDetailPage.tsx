// src/pages/RequestDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { finalizeRequest, getRequestByCode, type TransportRequest } from "../services/transport-requests.service";

function statusKind(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("final")) return "finalizada";
  if (s.includes("aprob") || s.includes("acept")) return "aprobada";
  if (s.includes("rechaz")) return "rechazada";
  return "pendiente";
}

function StatusPill({ status }: { status: string }) {
  const kind = statusKind(status);

  const ui =
    kind === "aprobada"
      ? { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500", label: "aprobada" }
      : kind === "rechazada"
      ? { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200", dot: "bg-slate-500", label: "rechazada" }
      : kind === "finalizada"
      ? { cls: "bg-slate-900 text-white ring-1 ring-slate-800", dot: "bg-white", label: "finalizada" }
      : { cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500", label: "pendiente" };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${ui.cls}`}>
      <span className={`h-2 w-2 rounded-full ${ui.dot}`} />
      {ui.label}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div className="rounded-2xl bg-white/90 ring-1 ring-slate-200/70 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value ?? "—"}</p>
    </div>
  );
}

export default function RequestDetailPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<TransportRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        if (!code) throw new Error("Código inválido.");
        const data = await getRequestByCode(code);
        if (!alive) return;
        setItem(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudo cargar el detalle.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [code]);

  const canFinalize = useMemo(() => {
    if (!item) return false;
    return statusKind(item.status) === "aprobada";
  }, [item]);

  const handleFinalize = async () => {
    if (!item) return;
    setFinalizeError(null);

    // confirm simple
    const ok = window.confirm(`¿Marcar como finalizada la solicitud ${item.code}?`);
    if (!ok) return;

    try {
      setFinalizing(true);

      // ✅ si tu backend tiene endpoint, esto funciona.
      // ❌ si aún no existe, te tirará error y te lo muestro abajo.
      await finalizeRequest(item.code);

      // Recargar detalle para ver nuevo estado
      const refreshed = await getRequestByCode(item.code);
      setItem(refreshed);
    } catch (e: any) {
      setFinalizeError(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudo finalizar. (Probablemente falta el endpoint en el backend)."
      );
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/mis-solicitudes")}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-700"
          >
            <span className="text-lg leading-none">‹</span> Volver
          </button>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {loading ? "Cargando..." : item?.code ?? "Solicitud"}
          </h1>

          {!loading && item && (
            <div className="mt-2 flex items-center gap-3">
              <StatusPill status={item.status} />
              <span className="text-sm font-semibold text-slate-600">{item.type}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        {!loading && item && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleFinalize}
              disabled={!canFinalize || finalizing}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold shadow-lg transition-all",
                canFinalize
                  ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed",
              ].join(" ")}
              title={!canFinalize ? "Solo se puede finalizar cuando está aprobada." : "Finalizar solicitud"}
            >
              {finalizing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Finalizando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Marcar como finalizada
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error de carga */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-5 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Error al finalizar */}
      {!loading && !error && finalizeError && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 text-sm font-semibold text-amber-800">
          {finalizeError}
        </div>
      )}

      {/* Contenido */}
      {!loading && item && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Código" value={item.code} />
            <Field label="Fecha" value={item.date} />
            <Field label="Tipo" value={item.type} />
            <Field label="Estado" value={statusKind(item.status)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Datos de la solicitud</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Origen" value={item.origin} />
                <Field label="Pasajeros" value={item.pasajeros} />
                <Field label="Encargado" value={item.encargado} />
                <Field label="Subencargado" value={item.subencargado} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Destinos</h2>

              <div className="rounded-2xl bg-white/90 ring-1 ring-slate-200/70 p-4">
                {item.destinos && item.destinos.length > 0 ? (
                  <ul className="space-y-2">
                    {item.destinos.map((d, idx) => (
                      <li key={d.id ?? idx} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-semibold text-slate-900">{d.address}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm font-semibold text-slate-500">No hay destinos registrados.</p>
                )}
              </div>

              {/* 🚧 Evidencias (aún no) */}
              <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-4">
                <p className="text-sm font-black text-slate-900">Evidencias</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Aún no disponible (pendiente de backend para subir imágenes).
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
