import { useEffect, useState, useMemo } from "react";
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

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function safeParse(json: string | null): any {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

export default function TransportStep2Page() {
  const navigate = useNavigate();

  const [origen, setOrigen] = useState("");
  const [destinos, setDestinos] = useState<DestinationPoint[]>([
    { id: uid(), address: "" },
  ]);
  const [error, setError] = useState(false);

  // Cargar desde localStorage
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY)) as WizardData;

    if (saved.origen) {
      setOrigen(saved.origen);
    }

    if (Array.isArray(saved.destinos) && saved.destinos.length > 0) {
      setDestinos(saved.destinos);
    }
  }, []);

  function addDestination() {
    setDestinos((prev) => [...prev, { id: uid(), address: "" }]);
  }

  function updateDestination(id: string, address: string) {
    setDestinos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, address } : d))
    );
    setError(false);
  }

  function removeDestination(id: string) {
    if (destinos.length > 1) {
      setDestinos((prev) => prev.filter((d) => d.id !== id));
    }
  }

  function saveToStorage() {
    const current = safeParse(localStorage.getItem(STORAGE_KEY)) as WizardData;
    const next: WizardData = {
      ...current,
      origen: origen.trim(),
      destinos,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function handleContinue() {
    // Validar origen y al menos un destino
    if (!origen.trim() || !destinos[0]?.address.trim()) {
      setError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    saveToStorage();
    navigate("/solicitudes/transporte/paso-3");
  }

  function handleBack() {
    saveToStorage();
    navigate("/solicitudes/transporte/paso-1");
  }

  // Construir URL del mapa usando OpenStreetMap (no requiere API key)
  const mapUrl = useMemo(() => {
    if (!origen.trim()) return null;

    const validDestinos = destinos.filter((d) => d.address.trim());
    if (validDestinos.length === 0) return null;

    // Usar Nominatim para geocodificar y luego mostrar en OSM
    // Para simplicidad, mostramos un mapa centrado en El Salvador
    const lat = 13.7942;
    const lng = -88.8965;
    //const zoom = 9;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 1},${lat - 1},${lng + 1},${lat + 1}&layer=mapnik&marker=${lat},${lng}`;
  }, [origen, destinos]);

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
                Paso 2 de 3
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-indigo-600" />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Actual:{" "}
                <span className="font-semibold text-indigo-700">
                  Puntos de Ruta
                </span>
              </span>
              <span className="italic text-slate-400">Siguiente: Confirmación</span>
            </div>
          </div>
        </div>

        {/* TITULO */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Puntos de Ruta
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Indique el origen y destino(s) de su viaje. El mapa se actualizará automáticamente.
          </p>
        </div>

        {/* ALERTA */}
        {error && (
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
                <p className="font-bold text-red-900">Atención</p>
                <p className="mt-0.5">
                  Complete el origen y al menos un destino antes de continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT: Formulario + Mapa */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* FORMULARIO */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8 space-y-8">
                {/* Sección: Origen */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                      <svg
                        className="h-5 w-5 text-indigo-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      Punto de origen
                    </h2>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Origen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={origen}
                      onChange={(e) => {
                        setOrigen(e.target.value);
                        setError(false);
                      }}
                      placeholder="Ej: Asamblea Legislativa, San Salvador, El Salvador"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Ingrese la dirección completa del punto de partida.
                    </p>
                  </div>
                </section>

                <div className="h-px w-full bg-slate-200/70" />

                {/* Sección: Destinos */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                      <svg
                        className="h-5 w-5 text-indigo-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      Punto(s) de destino
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {destinos.map((dest, index) => (
                      <div key={dest.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">
                            Destino {index + 1}{" "}
                            {index === 0 && <span className="text-red-500">*</span>}
                          </label>
                          {destinos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDestination(dest.id)}
                              className="text-xs font-medium text-red-600 transition hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={dest.address}
                          onChange={(e) =>
                            updateDestination(dest.id, e.target.value)
                          }
                          placeholder="Ej: Santa Ana, El Salvador"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                    ))}

                    {/* Botón agregar destino */}
                    <button
                      type="button"
                      onClick={addDestination}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Agregar destino adicional
                    </button>

                    <p className="text-xs text-slate-500">
                      Puede agregar múltiples destinos para su ruta.
                    </p>
                  </div>
                </section>

                {/* Acciones */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
                    onClick={handleContinue}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-primary/90 active:scale-[0.99]"
                  >
                    Continuar
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAPA */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    Vista previa del mapa
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Se muestra la ubicación aproximada de su ruta.
                  </p>
                </div>

                <div className="h-[500px] bg-slate-50">
                  {mapUrl ? (
                    <iframe
                      title="Mapa de ruta"
                      className="h-full w-full"
                      src={mapUrl}
                      style={{ border: 0 }}
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center p-6 text-center">
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
                          Complete origen y destino para ver el mapa
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          La ruta se mostrará automáticamente al ingresar las ubicaciones.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info adicional */}
                {mapUrl && (
                  <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">💡 Sugerencia:</span> Escriba direcciones completas como "Asamblea Legislativa, San Salvador" o "Santa Ana, El Salvador" para mejores resultados.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>
      </div>
    </div>
  );
}