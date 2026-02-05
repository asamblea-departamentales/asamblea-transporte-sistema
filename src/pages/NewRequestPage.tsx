import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type ModuleCard = {
  key: "transporte" | "combustible" | "mantenimiento";
  title: string;
  description: string;
  href: string;
  accent: "blue" | "amber" | "emerald";
  icon: React.ReactNode;
};

function AccentIcon({
  accent,
  icon,
}: {
  accent: ModuleCard["accent"];
  icon: React.ReactNode;
}) {
  const styles =
    accent === "blue"
      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
      : accent === "amber"
      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
      : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30";

  return (
    <div className={`inline-flex rounded-2xl p-4 transition-all duration-300 group-hover:scale-110 ${styles}`}>
      <span className="grid h-8 w-8 place-items-center">{icon}</span>
    </div>
  );
}

function ActionLink({ accent }: { accent: ModuleCard["accent"] }) {
  const styles =
    accent === "blue"
      ? "text-blue-600 group-hover:text-blue-700"
      : accent === "amber"
      ? "text-amber-600 group-hover:text-amber-700"
      : "text-emerald-600 group-hover:text-emerald-700";

  return (
    <span className={`inline-flex items-center gap-2 text-sm font-bold transition-all ${styles}`}>
      Iniciar solicitud
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="transition-transform group-hover:translate-x-1"
      >
        <path d="M5 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function NewRequestPage() {
  const navigate = useNavigate();

  const modules: ModuleCard[] = useMemo(
    () => [
      {
        key: "transporte",
        title: "Transporte",
        description:
          "Solicitudes de transporte institucional, asignación de vehículos y seguimiento en tiempo real.",
        href: "/solicitudes/transporte/paso-1",
        accent: "blue",
        icon: (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M6.5 15.5h11M7.5 6.5h9l1.6 4.8c.26.78.4 1.6.4 2.42V17a2 2 0 0 1-2 2h-.5a2 2 0 0 1-4 0h-4a2 2 0 0 1-4 0H5a2 2 0 0 1-2-2v-3.28c0-.82.14-1.64.4-2.42L5 6.5h2.5Z"
              strokeLinejoin="round"
            />
            <path d="M6 11.5h12" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        key: "combustible",
        title: "Combustible",
        description: "Solicitudes de combustible, control de consumo y validación de entregas institucionales.",
        href: "/solicitudes/combustible/nueva",
        accent: "amber",
        icon: (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 3h8v18H7V3Z" strokeLinejoin="round" />
            <path d="M15 7h2l2 2v10a2 2 0 0 1-2 2h-2" strokeLinejoin="round" />
            <path d="M9 7h4" strokeLinecap="round" />
            <path d="M9 11h4" strokeLinecap="round" opacity="0.7" />
          </svg>
        ),
      },
      {
        key: "mantenimiento",
        title: "Mantenimiento",
        description: "Registro de mantenimientos preventivos y correctivos, historial completo y control de aprobaciones.",
        href: "/solicitudes/mantenimiento/nueva",
        accent: "emerald",
        icon: (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-7 7-4-4 7-7 4 4Z" strokeLinejoin="round" />
            <path d="M3 21l6-2 10-10-4-4L5 15l-2 6Z" strokeLinejoin="round" />
            <path d="M14 6l4 4" strokeLinecap="round" opacity="0.75" />
          </svg>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Nueva Solicitud
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Seleccione el módulo que desea utilizar para crear su solicitud
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="group inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-all hover:bg-slate-200"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </button>
      </div>

      {/* Info Banner */}
      <div className="overflow-hidden rounded-3xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 shadow-lg shadow-blue-100/50">
        <div className="flex items-start gap-4 p-6">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900">Información importante</h3>
            <p className="mt-1 text-sm font-semibold text-blue-700 leading-relaxed">
              Cada solicitud requiere aprobación del supervisor correspondiente. Asegúrese de completar todos los datos requeridos para agilizar el proceso.
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {modules.map((m) => (
          <button
            key={m.key}
            onClick={() => navigate(m.href)}
            className={[
              "group relative overflow-hidden text-left rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-8 shadow-lg shadow-slate-200/50",
              "transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/50",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/20",
            ].join(" ")}
          >
            {/* Decorative gradient background */}
            <div className={[
              "absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20",
              m.accent === "blue" ? "bg-blue-500" : m.accent === "amber" ? "bg-amber-500" : "bg-emerald-500"
            ].join(" ")} />

            <div className="relative">
              <div className="flex items-start justify-between">
                <AccentIcon accent={m.accent} icon={m.icon} />

                {/* Decorative corner element */}
                <div className="h-12 w-12 rounded-2xl bg-slate-50 ring-1 ring-slate-200/60 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:rotate-12" />
              </div>

              <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
                {m.title}
              </h3>

              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                {m.description}
              </p>

              <div className="mt-8 flex items-center justify-between">
                <ActionLink accent={m.accent} />
                
                {/* Status indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500">Disponible</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Help Section */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-200/50">
        <div className="p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm">
                <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900">¿Necesitas ayuda?</h3>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Si tienes dudas sobre qué módulo seleccionar o cómo completar una solicitud, contacta al departamento de soporte técnico.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="mailto:soporte@transporte.gob"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar correo
                </a>
                <a
                  href="tel:+50312345678"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Llamar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}