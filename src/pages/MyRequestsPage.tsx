import { useEffect, useMemo, useState } from "react";
import {
  finalizarSolicitudById,
  getMyRequestsPaginated,
  getSolicitudById,
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
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ${ui.cls}`}>
      <span className={`h-2 w-2 rounded-full ${ui.dot}`} />
      {k}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div className="rounded-2xl bg-white/90 ring-1 ring-slate-200/70 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 whitespace-pre-wrap">{value ?? "—"}</p>
    </div>
  );
}

function fmtDate(v?: string | null) {
  if (!v) return "—";
  return String(v).slice(0, 10);
}

export default function MyRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SolicitudTransporte[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    current_page?: number;
    last_page?: number;
    total?: number;
    per_page?: number;
  }>({});

  const lastPage = meta?.last_page ?? 1;

  // Detalle desplegable
  const [openId, setOpenId] = useState<string | number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<SolicitudTransporte | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [finalizing, setFinalizing] = useState(false);
  const [actionOk, setActionOk] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getMyRequestsPaginated(page);

        if (!alive) return;
        setItems(res.data ?? []);
        setMeta(res.meta ?? {});

        // si cambias de página, cerramos detalle
        setOpenId(null);
        setDetail(null);
        setDetailError(null);
        setActionOk(null);
        setActionError(null);
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
  }, [page]);

  const canFinalize = useMemo(() => {
    const e = kind(detail?.estado ?? "");
    return e === "APROBADA";
  }, [detail]);

  async function toggleDetail(row: SolicitudTransporte) {
    const id = row.id;
    if (!id) return;

    // Si está abierto, lo cerramos
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      setDetailError(null);
      setActionOk(null);
      setActionError(null);
      return;
    }

    // Abrir y cargar detalle real
    setOpenId(id);
    setDetail(null);
    setDetailError(null);
    setActionOk(null);
    setActionError(null);

    try {
      setDetailLoading(true);
      const data = await getSolicitudById(id);
      setDetail(data);
    } catch (e: any) {
      setDetailError(e?.response?.data?.message ?? e?.message ?? "No se pudo cargar el detalle.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleFinalize() {
    if (!detail?.id) return;

    setActionOk(null);
    setActionError(null);

    const ok = window.confirm(`¿Marcar como FINALIZADA la solicitud ${detail.code ?? detail.id}?`);
    if (!ok) return;

    try {
      setFinalizing(true);
      await finalizarSolicitudById(detail.id);

      // recargar detalle
      const refreshed = await getSolicitudById(detail.id);
      setDetail(refreshed);
      setActionOk("Solicitud finalizada correctamente.");

      // opcional: refrescar lista actual (para ver estado actualizado en card)
      const res = await getMyRequestsPaginated(page);
      setItems(res.data ?? []);
      setMeta(res.meta ?? {});
    } catch (e: any) {
      setActionError(e?.response?.data?.message ?? e?.message ?? "No se pudo finalizar.");
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Mis solicitudes</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Haz click en una tarjeta para ver el detalle abajo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-extrabold ring-1 transition",
              loading || page <= 1
                ? "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
                : "bg-white text-slate-900 ring-slate-200 hover:bg-slate-50",
            ].join(" ")}
          >
            ← Anterior
          </button>

          <div className="rounded-2xl bg-white px-4 py-2 text-sm font-extrabold ring-1 ring-slate-200">
            Página {page} de {lastPage}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={loading || page >= lastPage}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-extrabold ring-1 transition",
              loading || page >= lastPage
                ? "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
                : "bg-white text-slate-900 ring-slate-200 hover:bg-slate-50",
            ].join(" ")}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-5 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-6 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="mt-5 h-10 w-full animate-pulse rounded-2xl bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => {
            const isOpen = openId === row.id;
            return (
              <button
                key={String(row.id ?? row.code)}
                onClick={() => toggleDetail(row)}
                className={[
                  "text-left rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 shadow-sm transition",
                  isOpen ? "ring-slate-900/30 shadow-md" : "hover:bg-slate-50",
                ].join(" ")}
                disabled={!row.id}
                title={!row.id ? "Sin ID (backend requerido)." : "Ver detalle"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Código</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{row.code ?? "—"}</p>
                  </div>
                  <StatusPill estado={row.estado} />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm font-semibold text-slate-700">
                    <span className="text-slate-500 font-extrabold">Motivo:</span>{" "}
                    {row.motivo_actividad ?? "—"}
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    <span className="text-slate-500 font-extrabold">Ruta:</span>{" "}
                    {row.origen ?? "—"} → {row.destino ?? "—"}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-slate-500">
                  <span>Salida: {fmtDate(row.fecha_salida)}</span>
                  <span className="inline-flex items-center gap-1">
                    {isOpen ? "Ocultar" : "Ver detalle"} <span className="text-base leading-none">{isOpen ? "▴" : "▾"}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== DETALLE ABAJO (UNA SOLA PÁGINA) ===== */}
      {openId && (
        <div className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Detalle de solicitud</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {detail?.code ? `Código: ${detail.code}` : "Cargando código..."}
              </p>
            </div>

            {!!detail && (
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

          {/* Alerts detalle */}
          {detailLoading && (
            <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-5 text-sm font-semibold text-slate-700">
              Cargando detalle...
            </div>
          )}

          {!detailLoading && detailError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-5 text-sm font-semibold text-red-700">
              {detailError}
            </div>
          )}

          {!detailLoading && !detailError && actionError && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 text-sm font-semibold text-amber-800">
              {actionError}
            </div>
          )}

          {!detailLoading && !detailError && actionOk && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 text-sm font-semibold text-emerald-800">
              {actionOk}
            </div>
          )}

          {/* Contenido detalle */}
          {!detailLoading && detail && !detailError && (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill estado={detail.estado} />
                <span className="text-sm font-semibold text-slate-600">Solicitud de Transporte</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Código" value={detail.code} />
                <Field label="Estado" value={kind(detail.estado)} />
                <Field label="Prioridad" value={detail.prioridad} />
                <Field label="Personas" value={detail.cantidad_personas} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Información de la actividad</h3>
                  <Field label="Motivo / Actividad" value={detail.motivo_actividad} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Fecha salida" value={detail.fecha_salida} />
                    <Field label="Fecha retorno" value={detail.fecha_retorno ?? "—"} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Ruta</h3>
                  <Field label="Origen" value={detail.origen} />
                  <Field label="Destino" value={detail.destino} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Solicitante</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre" value={detail.solicitante?.name} />
                    <Field label="Email" value={detail.solicitante?.email} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Unidad solicitante</h3>
                  <Field label="Unidad" value={detail.unidad?.nombre} />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-4">
                <p className="text-sm font-black text-slate-900">Evidencias</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Aún no disponible (pendiente backend para subir imágenes).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer meta */}
      {!loading && !error && (
        <div className="text-xs font-bold text-slate-500">
          Total: {meta?.total ?? "—"} · Por página: {meta?.per_page ?? "—"}
        </div>
      )}
    </div>
  );
}
