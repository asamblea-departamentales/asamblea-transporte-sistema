import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type VehiculoId = "sedan" | "microbus" | "camion";

type FormState = {
  fecha: string;
  hora: string;
  encargado: string;
  subencargado: string;
  pasajeros: string;
  tipoVehiculo: VehiculoId | "";
};

const STORAGE_KEY = "solicitud_transporte";

const VEHICULOS: {
  id: VehiculoId;
  label: string;
  description: string;
  capacity: string;
  emoji: string;
}[] = [
  {
    id: "sedan",
    label: "Sedán",
    description: "Viajes cortos y ejecutivos",
    capacity: "Hasta 4 pasajeros",
    emoji: "🚗",
  },
  {
    id: "microbus",
    label: "Microbús",
    description: "Grupos medianos",
    capacity: "Hasta 20 pasajeros",
    emoji: "🚐",
  },
  {
    id: "camion",
    label: "Camión pesado",
    description: "Carga o grupos grandes",
    capacity: "Más de 40 pasajeros",
    emoji: "🚛",
  },
];

export default function TransportStep1Page() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    fecha: "",
    hora: "",
    encargado: "",
    subencargado: "",
    pasajeros: "",
    tipoVehiculo: "",
  });

  const [error, setError] = useState(false);

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
    const { fecha, hora, encargado, pasajeros, tipoVehiculo } = form;
    if (!fecha || !hora || !encargado.trim() || !pasajeros || !tipoVehiculo) {
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

  const inputBase =
    "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-background-light px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-7">

        {/* PROGRESO */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                Progreso de la Solicitud
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Paso 1 de 3
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/3 rounded-full bg-indigo-600 transition-all duration-500" />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600">
                Actual:{" "}
                <span className="font-semibold text-indigo-700">Datos del Viaje</span>
              </span>
              <span className="hidden italic text-slate-400 sm:inline">
                Siguiente: Puntos en el mapa
              </span>
            </div>
          </div>
        </div>

        {/* TÍTULO */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Datos del Viaje
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Complete la información requerida para iniciar su solicitud de transporte institucional.
          </p>
        </div>

        {/* ALERTA */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-red-900">Atención</p>
                <p className="mt-0.5 text-red-700">
                  Complete todos los campos obligatorios (*) antes de continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FORM CARD */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">

            {/* ══ SECCIÓN 1: Tipo de vehículo ══ */}
            <section className="p-5 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 sm:h-10 sm:w-10">
                  <svg className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Tipo de vehículo <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-xs text-slate-400">Seleccione el vehículo que necesita</p>
                </div>
              </div>

              {/* Tarjetas — horizontal en móvil, grid en sm+ */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {VEHICULOS.map((v) => {
                  const selected = form.tipoVehiculo === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => updateField("tipoVehiculo", v.id)}
                      className={[
                        // Móvil: fila horizontal
                        "flex flex-row items-center gap-4 rounded-2xl border-2 p-4 text-left",
                        // sm+: columna vertical
                        "sm:flex-col sm:items-start sm:gap-2 sm:p-5",
                        "relative transition-all duration-200 active:scale-[0.98]",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
                        selected
                          ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50/80",
                      ].join(" ")}
                      aria-pressed={selected}
                    >
                      {/* Check indicator */}
                      <span
                        className={[
                          "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
                          selected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white",
                        ].join(" ")}
                      >
                        {selected && (
                          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>

                      {/* Emoji / icono */}
                      <div
                        className={[
                          "flex shrink-0 items-center justify-center rounded-2xl text-3xl",
                          "h-14 w-14 sm:h-16 sm:w-full sm:rounded-xl",
                          selected ? "bg-indigo-100" : "bg-slate-100",
                        ].join(" ")}
                      >
                        {v.emoji}
                      </div>

                      {/* Texto */}
                      <div className="min-w-0 flex-1 sm:w-full">
                        <p className={[
                          "text-[15px] font-bold leading-snug",
                          selected ? "text-indigo-700" : "text-slate-800",
                        ].join(" ")}>
                          {v.label}
                        </p>
                        <p className={[
                          "mt-0.5 text-xs leading-snug",
                          selected ? "text-indigo-500" : "text-slate-400",
                        ].join(" ")}>
                          {v.description}
                        </p>
                        <span className={[
                          "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          selected ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500",
                        ].join(" ")}>
                          👤 {v.capacity}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && !form.tipoVehiculo && (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                  Seleccione un tipo de vehículo para continuar
                </p>
              )}
            </section>

            {/* ══ SECCIÓN 2: Fecha y hora ══ */}
            <section className="p-5 sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 sm:h-10 sm:w-10">
                  <svg className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Fecha y hora del viaje
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Fecha de salida <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => updateField("fecha", e.target.value)}
                    className={`${inputBase} ${error && !form.fecha ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Hora de salida <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={(e) => updateField("hora", e.target.value)}
                    className={`${inputBase} ${error && !form.hora ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                  />
                </div>
              </div>
            </section>

            {/* ══ SECCIÓN 3: Responsables ══ */}
            <section className="p-5 sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 sm:h-10 sm:w-10">
                  <svg className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Información del responsable
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Nombre del Encargado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.encargado}
                    onChange={(e) => updateField("encargado", e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className={`${inputBase} ${error && !form.encargado.trim() ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Subencargado{" "}
                    <span className="ml-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      Opcional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.subencargado}
                    onChange={(e) => updateField("subencargado", e.target.value)}
                    placeholder="Ej: María López"
                    className={`${inputBase} border-slate-200`}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Total de Pasajeros <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={form.pasajeros}
                      onChange={(e) => updateField("pasajeros", e.target.value)}
                      placeholder="0"
                      className={`${inputBase} pr-11 ${error && !form.pasajeros ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Hint de capacidad según el vehículo seleccionado */}
                  {form.tipoVehiculo && (
                    <p className="mt-1.5 text-xs text-indigo-500">
                      {form.tipoVehiculo === "sedan" && "💡 Sedán — máximo 4 pasajeros"}
                      {form.tipoVehiculo === "microbus" && "💡 Microbús — máximo 20 pasajeros"}
                      {form.tipoVehiculo === "camion" && "💡 Camión — más de 40 pasajeros"}
                    </p>
                  )}
                </div>
              </div>
            </section>

          </div>

          {/* Botones de acción */}
          <div className="border-t border-slate-100 p-5 sm:p-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => navigate("/nueva-solicitud")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 active:scale-[0.98]"
              >
                Siguiente paso
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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