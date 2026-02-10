// src/pages/SolicitudDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  finalizarSolicitud,
  getSolicitudByCode,
  type SolicitudTransporte,
} from "../services/transport-requests.service";

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

  const ui =
    k === "APROBADA"
      ? { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" }
      : k === "RECHAZADA"
      ? { cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", dot: "bg-rose-500" }
      : k === "FINALIZADA"
      ? { cls: "bg-slate-900 text-white ring-1 ring-slate-800", dot: "bg-white" }
      : k === "PENDIENTE"
      ? { cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500" }
      : { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200", dot: "bg-slate-500" };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${ui.cls}`}>
      <span className={`h-2 w-2 rounded-full ${ui.dot}`} />
      {k}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div className="rounded-2xl bg-white/90 ring-1 ring-slate-200/70 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 whitespace-pre-wrap">
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function SolicitudDetailPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<SolicitudTransporte | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [finalizing, setFinalizing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionOk, setActionOk] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setActionError(null);
        setActionOk(null);

        if (!code) throw new Error("Código inválido.");
        const data = await getSolicitudByCode(code);

        if (!alive) return;
        setItem(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? "No se pudo cargar el detalle.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [code]);

  const canFinalize = useMemo(() => kind(item?.estado ?? "") === "APROBADA", [item]);

  async function handleFinalize() {
    if (!item?.code) return;

    setActionError(null);
    setActionOk(null);

    const ok = window.confirm(`¿Marcar como FINALIZADA la solicitud ${item.code}?`);
    if (!ok) return;

    try {
      setFinalizing(true);
      await finalizarSolicitud(item.code);

      const refreshed = await getSolicitudByCode(item.code);
      setItem(refreshed);
      setActionOk("Solicitud finalizada correctamente.");
    } catch (e: any) {
      setActionError(e?.response?.data?.message ?? e?.message ?? "No se pudo finalizar.");
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <div className="space-y-6 pb-8">
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
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusPill estado={item.estado} />
              <span className="text-sm font-semibold text-slate-600">Solicitud de Transporte</span>
            </div>
          )}
        </div>

        {!loading && item && (
          <button
            onClick={handleFinalize}
            disabled={!canFinalize || finalizing}
            title={!canFinalize ? "Solo se puede finalizar cuando está APROBADA." : "Finalizar solicitud"}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold shadow-lg transition-all",
              canFinalize
                ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed",
            ].join(" ")}
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
        )}
      </div>

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-5 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && actionError && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 text-sm font-semibold text-amber-800">
          {actionError}
        </div>
      )}

      {!loading && !error && actionOk && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 text-sm font-semibold text-emerald-800">
          {actionOk}
        </div>
      )}

      {!loading && item && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Código" value={item.code} />
            <Field label="Estado" value={kind(item.estado)} />
            <Field label="Prioridad" value={item.prioridad} />
            <Field label="Personas" value={item.cantidad_personas} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Información de la actividad</h2>
              <Field label="Motivo / Actividad" value={item.motivo_actividad} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fecha salida" value={item.fecha_salida} />
                <Field label="Fecha retorno" value={item.fecha_retorno ?? "—"} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Ruta</h2>
              <Field label="Origen" value={item.origen} />
              <Field label="Destino" value={item.destino} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Solicitante</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" value={item.solicitante?.name} />
                <Field label="Email" value={item.solicitante?.email} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Unidad solicitante</h2>
              <Field label="Unidad" value={item.unidad?.nombre} />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-4">
            <p className="text-sm font-black text-slate-900">Evidencias</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Aún no disponible (pendiente backend para subir imágenes).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
