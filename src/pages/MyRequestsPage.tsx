import { useEffect, useMemo, useRef, useState } from "react";
import {
  finalizarRequestById,
  getRequestById,
  getRequestsPaginated,
  type SolicitudTransporte,
} from "../services/transport-requests.service";

function kind(estado: string) {
  const s = (estado || "").toUpperCase();
  if (s.includes("APROB") || s.includes("ACEPT")) return "APROBADA";
  if (s.includes("RECHAZ")) return "RECHAZADA";
  if (s.includes("FINAL")) return "FINALIZADA";
  if (s.includes("PEND")) return "PENDIENTE";
  if (s.includes("BORR")) return "BORRADOR";
  if (s.includes("PROG")) return "PROGRAMADA";
  return s || "—";
}

function StatusPill({ estado }: { estado: string }) {
  const k = kind(estado);

  const ui =
    k === "APROBADA"
      ? { cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" }
      : k === "RECHAZADA"
      ? { cls: "bg-rose-100 text-rose-700 ring-1 ring-rose-200", dot: "bg-rose-500" }
      : k === "FINALIZADA"
      ? { cls: "bg-slate-900 text-white ring-1 ring-slate-800", dot: "bg-white" }
      : k === "PENDIENTE"
      ? { cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500" }
      : k === "PROGRAMADA"
      ? { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200", dot: "bg-slate-500" }
      : { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200", dot: "bg-slate-500" };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${ui.cls}`}>
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

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-6 shadow-lg shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-28 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-10 w-20 rounded-xl bg-slate-300 animate-pulse" />
          <div className="h-3 w-48 rounded-lg bg-slate-200 animate-pulse" />
        </div>
        <div className="h-10 w-24 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="mt-6 h-10 w-32 rounded-xl bg-slate-200 animate-pulse" />
    </div>
  );
}

export default function MyRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SolicitudTransporte[]>([]);
  const [error, setError] = useState<string | null>(null);

  // paginación (Laravel)
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ current_page?: number; last_page?: number; total?: number; per_page?: number }>({});
  const lastPage = meta?.last_page ?? 1;

  // detalle inline
  const [openId, setOpenId] = useState<string | number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<SolicitudTransporte | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [finalizing, setFinalizing] = useState(false);
  const [actionOk, setActionOk] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // ✅ cache para no repetir requests
  const cacheRef = useRef<Record<string, SolicitudTransporte>>({});
  const blockedRef = useRef<Set<string>>(new Set()); // ids con 403

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getRequestsPaginated(page);
        if (!alive) return;

        setItems(res.data ?? []);
        setMeta(res.meta ?? {});

        // al cambiar página, cerramos detalle
        setOpenId(null);
        setDetail(null);
        setDetailError(null);
        setActionOk(null);
        setActionError(null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? "No se pudieron cargar las solicitudes.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [page]);

  const canFinalize = useMemo(() => kind(detail?.estado ?? "") === "APROBADA", [detail]);

  async function toggleDetail(row: SolicitudTransporte) {
    const id = row.id;
    if (!id) return;

    const key = String(id);

    // cerrar
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      setDetailError(null);
      setActionOk(null);
      setActionError(null);
      return;
    }

    setOpenId(id);
    setDetail(null);
    setDetailError(null);
    setActionOk(null);
    setActionError(null);

    // bloqueado por 403 antes
    if (blockedRef.current.has(key)) {
      setDetailError("No tienes permiso para ver el detalle de esta solicitud.");
      return;
    }

    // cache
    const cached = cacheRef.current[key];
    if (cached) {
      setDetail(cached);
      return;
    }

    try {
      setDetailLoading(true);
      const data = await getRequestById(id);
      cacheRef.current[key] = data;
      setDetail(data);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 403) {
        blockedRef.current.add(key);
        setDetailError("No tienes permiso para ver el detalle de esta solicitud.");
      } else {
        setDetailError(e?.response?.data?.message ?? e?.message ?? "No se pudo cargar el detalle.");
      }
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

      const updated = await finalizarRequestById(detail.id);

      // actualizar detalle + cache
      const key = String(detail.id);
      cacheRef.current[key] = updated;
      setDetail(updated);

      // refrescar card en lista sin volver a pedir todo
      setItems((prev) =>
        prev.map((x) => (String(x.id) === key ? { ...x, estado: updated.estado, code: updated.code ?? x.code } : x))
      );

      setActionOk("Solicitud finalizada correctamente.");
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 403) {
        setActionError("No tienes permiso para finalizar esta solicitud.");
      } else {
        setActionError(e?.response?.data?.message ?? e?.message ?? "No se pudo finalizar.");
      }
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Mis solicitudes</h1>
          <p className="mt-1.5 text-base text-slate-600">Haz click en “Ver detalle” para desplegar la información abajo.</p>
        </div>

        {/* Paginación */}
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

      {/* Error general */}
      {!loading && error && (
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm">
          <div className="flex items-start gap-3 p-5">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-bold text-red-900">Error</h4>
              <p className="mt-1 text-sm font-semibold text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((row) => {
              const isOpen = openId === row.id;
              return (
                <div
                  key={String(row.id ?? row.code ?? Math.random())}
                  className="group overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-6 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-300/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Código</p>
                      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                        {row.code ?? "—"}
                      </p>
                    </div>
                    <StatusPill estado={row.estado} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-semibold text-slate-700">
                      <span className="font-black text-slate-500">Motivo:</span>{" "}
                      {row.motivo_actividad ?? "—"}
                    </p>
                    <p className="font-semibold text-slate-700">
                      <span className="font-black text-slate-500">Ruta:</span>{" "}
                      {row.origen ?? "—"} → {row.destino ?? "—"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>
                      <span className="font-black text-slate-500">Salida:</span>{" "}
                      {fmtDate(row.fecha_salida)}
                    </span>

                    <button
                      onClick={() => toggleDetail(row)}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-extrabold text-blue-600 hover:bg-blue-50"
                    >
                      {isOpen ? "Ocultar" : "Ver detalle"} <span className="text-base">{isOpen ? "▴" : "▾"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Detalle inline abajo */}
      {openId && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Detalle</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {detail?.code ? `Código: ${detail.code}` : `ID: ${openId}`}
                </p>
              </div>

              {!!detail && (
                <button
                  onClick={handleFinalize}
                  disabled={!canFinalize || finalizing}
                  title={!canFinalize ? "Solo se puede finalizar cuando está APROBADA." : "Finalizar solicitud"}
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold shadow-lg transition-all",
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
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Marcar como finalizada
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* estado carga */}
            {detailLoading && (
              <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-5 text-sm font-semibold text-slate-700">
                Cargando detalle...
              </div>
            )}

            {/* errores */}
            {!detailLoading && detailError && (
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 text-sm font-semibold text-amber-800">
                {detailError}
              </div>
            )}

            {!detailLoading && !detailError && actionError && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 text-sm font-semibold text-amber-800">
                {actionError}
              </div>
            )}

            {!detailLoading && !detailError && actionOk && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 text-sm font-semibold text-emerald-800">
                {actionOk}
              </div>
            )}

            {/* contenido */}
            {!detailLoading && detail && !detailError && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill estado={detail.estado} />
                  <span className="text-sm font-semibold text-slate-600">Solicitud de transporte</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Código" value={detail.code ?? "—"} />
                  <Field label="Estado" value={kind(detail.estado)} />
                  <Field label="Prioridad" value={detail.prioridad ?? "—"} />
                  <Field label="Personas" value={detail.cantidad_personas ?? "—"} />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900">Información</h3>
                    <Field label="Motivo / Actividad" value={detail.motivo_actividad ?? "—"} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Fecha salida" value={detail.fecha_salida ?? "—"} />
                      <Field label="Fecha retorno" value={detail.fecha_retorno ?? "—"} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900">Ruta</h3>
                    <Field label="Origen" value={detail.origen ?? "—"} />
                    <Field label="Destino" value={detail.destino ?? "—"} />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900">Solicitante</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nombre" value={detail.solicitante?.name ?? "—"} />
                      <Field label="Email" value={detail.solicitante?.email ?? "—"} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900">Unidad</h3>
                    <Field label="Unidad solicitante" value={detail.unidad?.nombre ?? "—"} />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-4">
                  <p className="text-sm font-black text-slate-900">Evidencias</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Aún no disponible (pendiente backend).
                  </p>
                </div>
              </div>
            )}
          </div>

          {!loading && (
            <div className="border-t border-slate-200 bg-slate-50/50 px-8 py-4 text-xs font-bold text-slate-500">
              Total: {meta?.total ?? "—"} · Por página: {meta?.per_page ?? "—"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
