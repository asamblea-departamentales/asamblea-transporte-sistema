import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type VehiculoId = "sedan" | "microbus" | "camion";

type FormState = {
  tipoVehiculo: VehiculoId | "";
  fecha: string;
  hora: string;
  encargado: string;
  subencargado: string;
  pasajeros: string;
};

const STORAGE_KEY = "solicitud_transporte";

const VEHICULOS: {
  id: VehiculoId;
  label: string;
  sub: string;
  capacity: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "sedan",
    label: "Sedán",
    sub: "Viajes ejecutivos y cortos",
    capacity: "1 – 4 pasajeros",
    icon: (
      <svg viewBox="0 0 80 36" fill="none" className="h-full w-full">
        <path d="M8 24 C8 24 14 13 24 11 L36 10 L44 10 C54 11 68 21 72 24 L72 28 C72 30 70 31 68 31 L12 31 C10 31 8 30 8 28 Z" fill="currentColor" opacity="0.18"/>
        <path d="M22 24 C22 24 26 14 34 12 L46 12 C54 14 58 22 58 24 Z" fill="currentColor" opacity="0.28"/>
        <path d="M8 26 L8 22 C8 18 12 17 16 17 L64 17 C68 17 72 19 72 22 L72 26 C72 28 70 29 68 29 L12 29 C10 29 8 28 8 26 Z" fill="currentColor" opacity="0.55"/>
        <rect x="22" y="13" width="14" height="9" rx="2" fill="white" opacity="0.45"/>
        <rect x="38" y="13" width="14" height="9" rx="2" fill="white" opacity="0.45"/>
        <circle cx="22" cy="30" r="5.5" fill="currentColor" opacity="0.85"/>
        <circle cx="22" cy="30" r="2.5" fill="white" opacity="0.6"/>
        <circle cx="58" cy="30" r="5.5" fill="currentColor" opacity="0.85"/>
        <circle cx="58" cy="30" r="2.5" fill="white" opacity="0.6"/>
        <rect x="68" y="21" width="6" height="2.5" rx="1" fill="currentColor" opacity="0.35"/>
        <rect x="6"  y="21" width="5" height="2.5" rx="1" fill="currentColor" opacity="0.25"/>
      </svg>
    ),
  },
  {
    id: "microbus",
    label: "Microbús",
    sub: "Grupos medianos",
    capacity: "5 – 20 pasajeros",
    icon: (
      <svg viewBox="0 0 80 36" fill="none" className="h-full w-full">
        <path d="M4 9 C4 6 6 4 9 4 L71 4 C74 4 76 6 76 9 L76 28 C76 30 74 31 71 31 L9 31 C6 31 4 30 4 28 Z" fill="currentColor" opacity="0.18"/>
        <rect x="4" y="4" width="72" height="6" rx="2" fill="currentColor" opacity="0.10"/>
        <rect x="8"  y="10" width="10" height="8" rx="1.5" fill="white" opacity="0.50"/>
        <rect x="22" y="10" width="10" height="8" rx="1.5" fill="white" opacity="0.50"/>
        <rect x="36" y="10" width="10" height="8" rx="1.5" fill="white" opacity="0.50"/>
        <rect x="50" y="10" width="10" height="8" rx="1.5" fill="white" opacity="0.50"/>
        <rect x="53" y="19" width="12" height="10" rx="1.5" fill="white" opacity="0.22"/>
        <circle cx="54" cy="24" r="1" fill="currentColor" opacity="0.45"/>
        <circle cx="18" cy="31" r="5.5" fill="currentColor" opacity="0.85"/>
        <circle cx="18" cy="31" r="2.5" fill="white" opacity="0.6"/>
        <circle cx="62" cy="31" r="5.5" fill="currentColor" opacity="0.85"/>
        <circle cx="62" cy="31" r="2.5" fill="white" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: "camion",
    label: "Camión",
    sub: "Transporte de carga",
    capacity: "Carga pesada",
    icon: (
      <svg viewBox="0 0 90 38" fill="none" className="h-full w-full">
        <rect x="2" y="8" width="50" height="22" rx="2.5" fill="currentColor" opacity="0.15"/>
        <rect x="2" y="8" width="50" height="6" fill="currentColor" opacity="0.08"/>
        <rect x="6"  y="11" width="9" height="7" rx="1.5" fill="white" opacity="0.38"/>
        <rect x="18" y="11" width="9" height="7" rx="1.5" fill="white" opacity="0.38"/>
        <rect x="30" y="11" width="9" height="7" rx="1.5" fill="white" opacity="0.38"/>
        <rect x="52" y="19" width="2" height="9" rx="1" fill="currentColor" opacity="0.25"/>
        <path d="M54 13 L54 30 C54 31 55 32 56 32 L84 32 C86 32 88 30 88 28 L88 21 C88 13 82 13 78 13 Z" fill="currentColor" opacity="0.48"/>
        <rect x="55" y="14" width="13" height="8" rx="1.5" fill="white" opacity="0.45"/>
        <path d="M68 14 L77 14 C82 14 87 18 87 21 L87 23 L68 23 Z" fill="white" opacity="0.30"/>
        <circle cx="16" cy="32" r="5.5" fill="currentColor" opacity="0.85"/>
        <circle cx="16" cy="32" r="2.5" fill="white" opacity="0.6"/>
        <circle cx="37" cy="32" r="5.5" fill="currentColor" opacity="0.85"/>
        <circle cx="37" cy="32" r="2.5" fill="white" opacity="0.6"/>
        <circle cx="70" cy="32" r="5.5" fill="currentColor" opacity="0.85"/>
        <circle cx="70" cy="32" r="2.5" fill="white" opacity="0.6"/>
        <circle cx="81" cy="32" r="4" fill="currentColor" opacity="0.85"/>
        <circle cx="81" cy="32" r="2" fill="white" opacity="0.6"/>
      </svg>
    ),
  },
];

export default function TransportStep1Page() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    tipoVehiculo: "",
    fecha: "",
    hora: "",
    encargado: "",
    subencargado: "",
    pasajeros: "",
  });

  const [error, setError] = useState(false);

  // Restore wizard data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(false);
  }

  function handleNext() {
    const { tipoVehiculo, fecha, hora, encargado, pasajeros } = form;

    if (!tipoVehiculo || !fecha || !hora || !encargado.trim() || !pasajeros) {
      setError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        encargado: form.encargado.trim(),
        subencargado: form.subencargado.trim(),
      })
    );

    navigate("/solicitudes/transporte/paso-2");
  }

  return (
    <div className="min-h-screen bg-background-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-7">

        {/* PROGRESO */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-slate-900">
                Progreso de la Solicitud
              </h3>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Paso 1 de 3
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/3 rounded-full bg-indigo-600" />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Actual:{" "}
                <span className="font-semibold text-indigo-700">
                  Datos del Viaje
                </span>
              </span>
              <span className="italic text-slate-400">
                Siguiente: Puntos en el mapa
              </span>
            </div>
          </div>
        </div>

        {/* TITULO */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Datos del Viaje
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Complete la información requerida para iniciar su solicitud de
            transporte institucional.
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
                  Complete los campos obligatorios (*) antes de continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FORM CARD */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8 space-y-8">

            {/* ── Sección: Tipo de vehículo ── */}
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
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Tipo de vehículo <span className="text-red-500">*</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {VEHICULOS.map((v) => {
                  const sel = form.tipoVehiculo === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => updateField("tipoVehiculo", v.id)}
                      className={[
                        "group relative flex flex-row items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left",
                        "sm:flex-col sm:items-start sm:gap-3 sm:px-5 sm:py-4",
                        "transition-all duration-200 active:scale-[0.98]",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
                        sel
                          ? "border-indigo-500 bg-indigo-50/60 shadow-sm shadow-indigo-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                        error && !form.tipoVehiculo ? "border-red-200" : "",
                      ].join(" ")}
                      aria-pressed={sel}
                    >
                      {/* Radio indicator */}
                      <span
                        className={[
                          "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
                          sel
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-slate-300 bg-white",
                        ].join(" ")}
                      >
                        {sel && (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </span>

                      {/* Ilustración SVG */}
                      <div
                        className={[
                          "shrink-0 transition-colors duration-200",
                          "h-11 w-20 sm:h-10 sm:w-full",
                          sel
                            ? "text-indigo-600"
                            : "text-slate-400 group-hover:text-slate-500",
                        ].join(" ")}
                      >
                        {v.icon}
                      </div>

                      {/* Texto */}
                      <div className="min-w-0">
                        <p
                          className={[
                            "text-[14px] font-bold leading-tight transition-colors",
                            sel ? "text-indigo-700" : "text-slate-800",
                          ].join(" ")}
                        >
                          {v.label}
                        </p>
                        <p
                          className={[
                            "mt-0.5 text-xs transition-colors",
                            sel ? "text-indigo-500" : "text-slate-400",
                          ].join(" ")}
                        >
                          {v.sub}
                        </p>
                        <span
                          className={[
                            "mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            sel
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {v.capacity}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && !form.tipoVehiculo && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  Seleccione un tipo de vehículo para continuar.
                </p>
              )}
            </section>

            <div className="h-px w-full bg-slate-200/70" />

            {/* Sección: Fecha y hora */}
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Fecha y hora del viaje
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Fecha de salida <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.fecha}
                      onChange={(e) => updateField("fecha", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
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
                          d="M8 7V3m8 4V3m-9 8h10"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Hora de salida <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={(e) => updateField("hora", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-slate-200/70" />

            {/* Sección: Responsables */}
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Información del responsable
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Nombre del Encargado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.encargado}
                    onChange={(e) => updateField("encargado", e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Subencargado{" "}
                    <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      Opcional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.subencargado}
                    onChange={(e) => updateField("subencargado", e.target.value)}
                    placeholder="Ej: María López"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Total de Pasajeros <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={form.pasajeros}
                      onChange={(e) => updateField("pasajeros", e.target.value)}
                      placeholder="0"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block" />
              </div>
            </section>

            {/* Acciones */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => navigate("/nueva-solicitud")}
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
                Cancelar
              </button>

              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-primary/90 active:scale-[0.99]"
              >
                Siguiente
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

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>
      </div>
    </div>
  );
}