import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type FormState = {
  fecha: string;
  hora: string;
  encargado: string;
  subencargado: string;
  pasajeros: string;
};

const STORAGE_KEY = "solicitud_transporte";

export default function TransportStep1Page() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
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

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(false);
  }

  function handleNext() {
    const { fecha, hora, encargado, pasajeros } = form;

    if (!fecha || !hora || !encargado.trim() || !pasajeros) {
      setError(true);
      // opcional: scroll a arriba
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
