import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type DestinationPoint = {
  id: string;
  address: string;
};

type WizardData = {
  // Paso 1
  fecha?: string;
  hora?: string;
  encargado?: string;
  subencargado?: string;
  pasajeros?: string;

  // Paso 2
  origen?: string;
  destinos?: DestinationPoint[];
};

const STORAGE_KEY = "solicitud_transporte";

function safeParse(json: string | null): any {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

function enc(s: string) {
  return encodeURIComponent(String(s || "").trim());
}

// ✅ ÚNICO lugar a cambiar cuando tengas backend real:
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000"; // Laravel local

type ApiSubmitResponse = {
  ok: boolean;
  solicitudId?: string;
  message?: string;
};

export default function TransportStep3Page() {
  const navigate = useNavigate();

  const [data, setData] = useState<WizardData>({});
  const [loading, setLoading] = useState(true);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    open: boolean;
    solicitudId?: string;
  }>({ open: false });

  // Cargar datos desde localStorage
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY)) as WizardData;

    // Validar que estén los campos mínimos (Paso1 + Paso2)
    const hasBasics =
      !!saved.fecha &&
      !!saved.hora &&
      !!saved.encargado &&
      !!saved.pasajeros &&
      !!saved.origen &&
      Array.isArray(saved.destinos) &&
      saved.destinos.length > 0 &&
      !!saved.destinos[0]?.address?.trim();

    if (!hasBasics) {
      navigate("/solicitudes/transporte/paso-1", { replace: true });
      return;
    }

    setData(saved);
    setLoading(false);
  }, [navigate]);

  const destinosValidos = useMemo(() => {
    return (data.destinos || []).filter((d) => d.address?.trim());
  }, [data.destinos]);

  const mainDestino = destinosValidos[0]?.address || "";
  const extraDestinos = destinosValidos.slice(1);

  // URL para “vista previa” (Google Maps sin API key)
  const mapUrl = useMemo(() => {
    if (!data.origen?.trim() || !mainDestino.trim()) return null;
    // Origen -> primer destino (vista simple)
    return `https://www.google.com/maps?saddr=${enc(data.origen)}&daddr=${enc(
      mainDestino
    )}&output=embed`;
  }, [data.origen, mainDestino]);

  const mapFooterText = useMemo(() => {
    if (!data.origen?.trim() || !mainDestino.trim()) return null;
    return {
      origen: data.origen!,
      destino: mainDestino,
      extras: extraDestinos.map((d) => d.address),
    };
  }, [data.origen, mainDestino, extraDestinos]);



  function handleBack() {
    // no tocamos nada, solo volvemos
    navigate("/solicitudes/transporte/paso-2");
  }

  // ✅ Preparado para backend Laravel:
  // - POST /api/transport-requests (ejemplo)
  // - Mandamos JSON con la estructura del wizard
  // - credentials por si usas cookies / Sanctum (el backend lo decidirá)
  async function submitToBackend(payload: WizardData): Promise<ApiSubmitResponse> {
    // 1. Recuperar el token del almacenamiento (ajusta 'token' si usas otro nombre)
    const token = localStorage.getItem('auth_token'); 

    const res = await fetch(`${API_BASE}/api/transport-requests`, {
      method: "POST",
      // Eliminamos credentials: "include" porque estamos usando Bearer Token manual
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // ✅ ENVIAR EL TOKEN
        "Authorization": `Bearer ${token}`, 
        // ✅ SALTAR ADVERTENCIA DE NGROK
        "ngrok-skip-browser-warning": "true", 
      },
      body: JSON.stringify({
        fecha_salida: payload.fecha, // Asegúrate que el nombre coincida con tu validación en Laravel
        // Laravel espera 'unidad_solicitante_id', 'motivo_actividad', etc. según tu controlador
        unidad_solicitante_id: 1, // ⚠️ Ajusta esto para que sea dinámico o un ID real
        motivo_actividad: "Actividad de transporte", 
        origen: payload.origen,
        destino: (payload.destinos || [])[0]?.address || "Sin destino",
        fecha_retorno: payload.fecha,
        cantidad_personas: parseInt(payload.pasajeros || "1"),
        prioridad: "media",
        // Aquí puedes mapear el resto de tus campos...
      }),
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch { /* ignore */ }

    if (!res.ok) {
      const msg = json?.message || "No se pudo enviar la solicitud.";
      throw new Error(msg);
    }

    return {
      ok: true,
      solicitudId: json?.id || json?.data?.id,
      message: json?.message,
    };
  }

  async function handleSubmit() {
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const resp = await submitToBackend(data);

      // limpiar wizard local
      localStorage.removeItem(STORAGE_KEY);

      setSuccess({ open: true, solicitudId: resp.solicitudId });
    } catch (e: any) {
      setErrorMsg(e?.message || "Ocurrió un error al enviar la solicitud.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setSuccess({ open: false, solicitudId: success.solicitudId });
  }

  function goHome() {
    closeModal();
    navigate("/"); // ajusta tu ruta de inicio
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-2 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
              <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* PROGRESO */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-slate-900">
                Progreso de la Solicitud
              </h3>

              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Paso 3 de 3
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-indigo-600" />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Actual:{" "}
                <span className="font-semibold text-indigo-700">
                  Confirmación
                </span>
              </span>
              <span className="italic text-slate-400">Listo para enviar</span>
            </div>
          </div>
        </div>

        {/* TITULO */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Confirmación de Solicitud
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Verifique la información antes de enviar. Si algo está incorrecto,
            regrese al paso anterior.
          </p>
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-bold text-red-900">No se pudo enviar</p>
                <p className="mt-0.5">{errorMsg}</p>
                <p className="mt-2 text-xs text-red-700/80">
                  Si aún no tienes backend conectado, es normal. Cuando tu API
                  esté lista, este botón enviará la solicitud.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* RESUMEN */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8 space-y-8">
                {/* bloque: datos viaje */}
                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-extrabold tracking-wider text-slate-500">
                    DATOS DEL VIAJE
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">
                        Fecha:
                      </span>{" "}
                      {data.fecha}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">Hora:</span>{" "}
                      {data.hora}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">
                        Pasajeros:
                      </span>{" "}
                      {data.pasajeros}
                    </p>
                  </div>
                </section>

                {/* bloque: encargados */}
                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-extrabold tracking-wider text-slate-500">
                    ENCARGADOS
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">
                        Encargado:
                      </span>{" "}
                      {data.encargado}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">
                        Subencargado:
                      </span>{" "}
                      {data.subencargado?.trim() ? data.subencargado : "—"}
                    </p>
                  </div>
                </section>

                {/* bloque: ruta */}
                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-extrabold tracking-wider text-slate-500">
                    RUTA
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">
                        Origen:
                      </span>{" "}
                      {data.origen}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-900">
                        Destino 1:
                      </span>{" "}
                      {mainDestino}
                    </p>

                    {extraDestinos.length > 0 && (
                      <div className="pt-2">
                        <p className="mb-2 text-xs font-bold text-slate-500">
                          DESTINOS ADICIONALES
                        </p>
                        <ul className="space-y-2">
                          {extraDestinos.map((d, idx) => (
                            <li
                              key={d.id}
                              className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                            >
                              <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-extrabold text-indigo-700 ring-1 ring-indigo-100">
                                {idx + 2}
                              </span>
                              <span className="text-slate-700">{d.address}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>

                {/* acciones */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleBack}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Anterior
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? "Enviando..." : "Enviar solicitud"}
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Al enviar, esta pantalla intentará registrar la solicitud en tu
                  API de Laravel. Si tu API aún no está lista, verás un mensaje
                  de error (normal en esta etapa).
                </p>
              </div>
            </div>
          </div>

          {/* MAPA */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Vista previa del mapa
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Se muestra la ruta Origen → Destino 1.
                  </p>
                </div>

                <div className="h-[520px] bg-slate-50">
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
                    <div className="grid h-full w-full place-items-center p-6 text-center">
                      <div className="max-w-xs">
                        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                          <svg
                            className="h-6 w-6 text-indigo-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          No hay datos para el mapa
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Regresa al paso 2 y completa origen y destino.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {mapFooterText && (
                  <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Origen:</span>{" "}
                      {mapFooterText.origen}
                      <br />
                      <span className="font-semibold">Destino:</span>{" "}
                      {mapFooterText.destino}
                      {mapFooterText.extras.length > 0 && (
                        <>
                          <br />
                          <span className="font-semibold">Adicionales:</span>{" "}
                          {mapFooterText.extras.join(" • ")}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-xs text-slate-600 shadow-sm">
                <span className="font-semibold">💡 Tip:</span> cuando tu backend
                esté listo, devuelve un identificador (ej: <b>ST-2026-001</b>) y
                aquí lo mostraremos en el modal de éxito.
              </div>
            </div>
          </div>
        </div>

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>

        {/* MODAL ÉXITO */}
        {success.open && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeModal}
            />
            <div className="relative mx-auto mt-24 max-w-lg px-4 sm:px-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                    <svg
                      className="h-6 w-6 text-indigo-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Solicitud enviada
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Se registró correctamente la solicitud.
                      {success.solicitudId ? (
                        <>
                          {" "}
                          ID:{" "}
                          <span className="font-bold text-slate-900">
                            {success.solicitudId}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cerrar
                  </button>

                  <button
                    onClick={goHome}
                    className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-primary/90"
                  >
                    Ir a Inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
