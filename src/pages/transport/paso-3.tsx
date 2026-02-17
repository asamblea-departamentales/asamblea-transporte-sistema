import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────
// Tipos — deben coincidir exactamente con lo que guardas en pasos 1 y 2
// ─────────────────────────────────────────────────────────────────
type VehiculoId = "sedan" | "microbus" | "camion";

type DestinationPoint = {
  id: string;
  address: string;
};

export type SolicitudWizard = {
  // Paso 1
  tipoVehiculo?: VehiculoId;
  fecha?: string;
  hora?: string;
  encargado?: string;
  subencargado?: string;
  pasajeros?: string;
  // Paso 2
  origen?: string;
  destinos?: DestinationPoint[];
};

export const STORAGE_KEY = "solicitud_transporte";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function getWizardData(): SolicitudWizard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function clearWizardData() {
  localStorage.removeItem(STORAGE_KEY);
}

const VEHICULO_LABELS: Record<VehiculoId, string> = {
  sedan:    "Sedán",
  microbus: "Microbús",
  camion:   "Camión pesado",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function formatTime(timeStr?: string) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  if (!h) return timeStr;
  const hour = parseInt(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
}

const API_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────
// Sub-componentes de resumen
// ─────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-xs font-medium text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800">{value || "—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────
export default function TransportStep3Page() {
  const navigate = useNavigate();

  const [data, setData]         = useState<SolicitudWizard>({});
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess]   = useState<{ open: boolean; solicitudId?: string }>({ open: false });

  // ── Cargar y validar datos del wizard ──
  useEffect(() => {
    const saved = getWizardData();

    const valid =
      !!saved.tipoVehiculo &&
      !!saved.fecha &&
      !!saved.hora &&
      !!saved.encargado &&
      !!saved.pasajeros &&
      !!saved.origen &&
      Array.isArray(saved.destinos) &&
      saved.destinos.length > 0 &&
      !!saved.destinos[0]?.address?.trim();

    if (!valid) {
      navigate("/solicitudes/transporte/paso-1", { replace: true });
      return;
    }

    setData(saved);
    setLoading(false);
  }, [navigate]);

  const destinosValidos = useMemo(
    () => (data.destinos || []).filter((d) => d.address?.trim()),
    [data.destinos]
  );
  const mainDestino  = destinosValidos[0]?.address || "";
  const extraDestinos = destinosValidos.slice(1);

  // URL embed Google Maps
  const mapUrl = useMemo(() => {
    if (!data.origen?.trim() || !mainDestino.trim()) return null;
    const o = encodeURIComponent(data.origen.trim());
    const d = encodeURIComponent(mainDestino.trim());
    return `https://www.google.com/maps?saddr=${o}&daddr=${d}&output=embed`;
  }, [data.origen, mainDestino]);

  // ── Submit al backend ──
  async function handleSubmit() {
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");

      // Payload completo con TODOS los datos del wizard
      const payload = {
        // Paso 1
        tipo_vehiculo:     data.tipoVehiculo,
        fecha_salida:      data.fecha,
        hora_salida:       data.hora,
        encargado:         data.encargado,
        subencargado:      data.subencargado?.trim() || null,
        cantidad_personas: parseInt(data.pasajeros || "1"),
        // Paso 2
        origen:   data.origen,
        destinos: destinosValidos.map((d, i) => ({
          orden:     i + 1,
          direccion: d.address,
        })),
        // Extra calculados
        destino_principal: mainDestino,
        prioridad:         "media",
      };

      const res = await fetch(`${API_BASE}/api/transport-requests`, {
        method: "POST",
        headers: {
          "Content-Type":              "application/json",
          "Accept":                    "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      let json: any = null;
      try { json = await res.json(); } catch { /* ignore */ }

      if (!res.ok) {
        throw new Error(json?.message || `Error ${res.status}: No se pudo enviar la solicitud.`);
      }

      clearWizardData();
      setSuccess({ open: true, solicitudId: json?.id || json?.data?.id });
    } catch (e: any) {
      setErrorMsg(e?.message || "Ocurrió un error inesperado.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Skeleton de carga ──
  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ── Progreso ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Paso 3 de 3
            </span>
            <span className="text-xs font-semibold text-indigo-600">Confirmación</span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                  s <= 3 ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "bg-slate-100 text-slate-400",
                ].join(" ")}>
                  {s < 3 ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5 6-6" />
                    </svg>
                  ) : s}
                </div>
                {s < 3 && <div className="h-px flex-1 bg-indigo-200" />}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span className="text-indigo-400">Datos del viaje</span>
            <span className="text-indigo-400">Ruta</span>
            <span className="font-semibold text-indigo-600">Confirmación</span>
          </div>
        </div>

        {/* ── Encabezado ── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Confirmación
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Revise los datos antes de enviar. Si algo está incorrecto regrese al paso anterior.
          </p>
        </div>

        {/* ── Error de envío ── */}
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <svg className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">No se pudo enviar</p>
              <p className="mt-0.5 text-sm text-red-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ── Layout: Resumen + Mapa ── */}
        <div className="grid gap-5 lg:grid-cols-5">

          {/* ═══════════ RESUMEN COMPLETO ═══════════ */}
          <div className="space-y-4 lg:col-span-3">

            {/* Vehículo + viaje */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <SectionLabel>Vehículo y viaje</SectionLabel>
                <div className="divide-y divide-slate-100">
                  <DataRow
                    label="Tipo de vehículo"
                    value={data.tipoVehiculo ? VEHICULO_LABELS[data.tipoVehiculo] : "—"}
                  />
                  <DataRow label="Fecha de salida" value={formatDate(data.fecha)} />
                  <DataRow label="Hora de salida"  value={formatTime(data.hora)} />
                  <DataRow label="Pasajeros"       value={`${data.pasajeros} persona${parseInt(data.pasajeros || "1") !== 1 ? "s" : ""}`} />
                </div>
              </div>
            </div>

            {/* Responsables */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="px-5 py-4 sm:px-6">
                <SectionLabel>Responsables</SectionLabel>
                <div className="divide-y divide-slate-100">
                  <DataRow label="Encargado"    value={data.encargado} />
                  <DataRow
                    label="Subencargado"
                    value={data.subencargado?.trim() || <span className="font-normal text-slate-400 text-xs">No asignado</span>}
                  />
                </div>
              </div>
            </div>

            {/* Ruta */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="px-5 py-4 sm:px-6">
                <SectionLabel>Ruta</SectionLabel>

                {/* Origen */}
                <div className="flex items-start gap-3 py-2.5">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Origen</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 break-words">{data.origen || "—"}</p>
                  </div>
                </div>

                {/* Línea conectora */}
                <div className="ml-3 w-px self-stretch border-l-2 border-dashed border-slate-200 py-1 h-4" />

                {/* Destinos */}
                {destinosValidos.map((d, idx) => (
                  <div key={d.id}>
                    <div className="flex items-start gap-3 py-2.5">
                      <div className={[
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1",
                        idx === destinosValidos.length - 1
                          ? "bg-red-100 ring-red-200"
                          : "bg-amber-50 ring-amber-200",
                      ].join(" ")}>
                        {idx === destinosValidos.length - 1 ? (
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {idx === destinosValidos.length - 1 && destinosValidos.length === 1
                            ? "Destino"
                            : idx === destinosValidos.length - 1
                            ? "Destino final"
                            : `Parada ${idx + 1}`}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-800 break-words">{d.address}</p>
                      </div>
                    </div>
                    {idx < destinosValidos.length - 1 && (
                      <div className="ml-3 h-4 w-px border-l-2 border-dashed border-slate-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => navigate("/solicitudes/transporte/paso-2")}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 active:scale-[0.98]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Anterior
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60 active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Enviando…
                  </>
                ) : (
                  <>
                    Enviar solicitud
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ═══════════ MAPA ═══════════ */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">Vista de ruta</p>
                <p className="mt-0.5 text-xs text-slate-400">Origen → Destino principal</p>
              </div>

              <div className="h-64 bg-slate-50 sm:h-80 lg:h-[420px]">
                {mapUrl ? (
                  <iframe
                    title="Mapa de ruta"
                    className="h-full w-full"
                    src={mapUrl}
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="grid h-full place-items-center p-6 text-center">
                    <div>
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-600">Sin datos de ruta</p>
                      <p className="mt-1 text-xs text-slate-400">Regrese al paso 2 para agregar origen y destino.</p>
                    </div>
                  </div>
                )}
              </div>

              {data.origen && mainDestino && (
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-3.5">
                  <div className="space-y-1 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-700">Desde:</span> {data.origen}</p>
                    <p><span className="font-semibold text-slate-700">Hacia:</span> {mainDestino}</p>
                    {extraDestinos.length > 0 && (
                      <p className="text-slate-400">+{extraDestinos.length} parada{extraDestinos.length > 1 ? "s" : ""} adicional{extraDestinos.length > 1 ? "es" : ""}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="pb-2 text-center text-[11px] text-slate-300">
          © 2026 Sistema de Transporte Institucional
        </p>
      </div>

      {/* ═══════════ MODAL ÉXITO ═══════════ */}
      {success.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSuccess({ open: false })}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Header verde */}
            <div className="bg-emerald-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-200">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Solicitud enviada</h3>
                  <p className="text-xs text-slate-500">Se registró correctamente</p>
                </div>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-5">
              {success.solicitudId && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Número de solicitud</p>
                  <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
                    {success.solicitudId}
                  </p>
                </div>
              )}
              <p className="text-sm text-slate-600">
                Su solicitud de transporte fue registrada. El encargado de transporte
                la revisará y le notificará la confirmación.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setSuccess({ open: false })}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => { setSuccess({ open: false }); navigate("/dashboard"); }}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Ir al dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}