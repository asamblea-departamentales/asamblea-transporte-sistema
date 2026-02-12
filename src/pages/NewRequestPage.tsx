// src/pages/NewRequestPage.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type ModuleCard = {
  key: "transporte" | "combustible" | "mantenimiento";
  title: string;
  description: string;
  href: string;
  accent: "blue" | "amber" | "emerald";
  icon: React.ReactNode;
  allowedRoles: string[];
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
    <div
      className={`inline-flex rounded-xl p-3 transition-all duration-300 group-hover:scale-110 sm:rounded-2xl sm:p-4 ${styles}`}
    >
      <span className="grid h-7 w-7 place-items-center sm:h-8 sm:w-8">{icon}</span>
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
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all sm:gap-2 sm:text-sm ${styles}`}
    >
      Iniciar solicitud
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4"
      >
        <path
          d="M5 12h12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
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
  const { user } = useAuth();

  // Roles del usuario (vienen del backend: roles: string[])
  const userRoles = user?.roles ?? [];

  const modules: ModuleCard[] = useMemo(
    () => [
      {
        key: "transporte",
        title: "Transporte",
        description:
          "Solicitudes de transporte institucional, asignación de vehículos y seguimiento en tiempo real.",
        href: "/solicitudes/transporte/paso-1",
        accent: "blue",
        allowedRoles: ["solicitante", "admin", "supervisor", "jefe"],
        icon: (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
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
        description:
          "Solicitudes de combustible, control de consumo y validación de entregas institucionales.",
        href: "/solicitudes/combustible/nueva",
        accent: "amber",
        allowedRoles: ["admin", "supervisor", "jefe"],
        icon: (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 3h8v18H7V3Z" strokeLinejoin="round" />
            <path
              d="M15 7h2l2 2v10a2 2 0 0 1-2 2h-2"
              strokeLinejoin="round"
            />
            <path d="M9 7h4" strokeLinecap="round" />
            <path d="M9 11h4" strokeLinecap="round" opacity="0.7" />
          </svg>
        ),
      },
      {
        key: "mantenimiento",
        title: "Mantenimiento",
        description:
          "Registro de mantenimientos preventivos y correctivos, historial completo y control de aprobaciones.",
        href: "/solicitudes/mantenimiento/nueva",
        accent: "emerald",
        allowedRoles: ["admin", "supervisor", "jefe"],
        icon: (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 7l-7 7-4-4 7-7 4 4Z" strokeLinejoin="round" />
            <path
              d="M3 21l6-2 10-10-4-4L5 15l-2 6Z"
              strokeLinejoin="round"
            />
            <path d="M14 6l4 4" strokeLinecap="round" opacity="0.75" />
          </svg>
        ),
      },
    ],
    []
  );

  // Filtra por roles
  const visibleModules = useMemo(() => {
    if (!user || userRoles.length === 0) return [];
    return modules.filter((m) =>
      m.allowedRoles.some((r) => userRoles.includes(r))
    );
  }, [modules, user, userRoles]);

  return (
    <div className="space-y-6 pb-8 sm:space-y-10">
      {/* ============================================ */}
      {/* MOBILE FIRST: Header                         */}
      {/* ============================================ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Nueva Solicitud
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:mt-2 sm:text-base">
            Seleccione el módulo que desea utilizar para crear su solicitud
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 sm:rounded-2xl sm:px-5"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Volver</span>
        </button>
      </div>

      {/* ============================================ */}
      {/* MOBILE FIRST: Info Banner                    */}
      {/* ============================================ */}
      <div className="overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 shadow-md shadow-blue-100/50 sm:rounded-3xl sm:shadow-lg">
        <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-6">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl">
              <svg
                className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-900 sm:text-base">
              Información importante
            </h3>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-blue-700 sm:text-sm">
              Cada solicitud requiere aprobación del supervisor correspondiente.
              Asegúrese de completar todos los datos requeridos para agilizar el
              proceso.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MOBILE FIRST: Cards Grid                     */}
      {/* ============================================ */}
      <div
        className={[
          "grid gap-4 sm:gap-6",
          // 1 tarjeta => centrada con max-width
          visibleModules.length === 1
            ? "grid-cols-1 place-items-center"
            : // 2 tarjetas => 1 col móvil, 2 cols tablet+
            visibleModules.length === 2
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
            : // 3 o más => 1 col móvil, 2 cols tablet, 3 cols desktop
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        ].join(" ")}
      >
        {visibleModules.map((m) => (
          <button
            key={m.key}
            onClick={() => navigate(m.href)}
            className={[
              "group relative overflow-hidden text-left rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-5 shadow-md shadow-slate-200/50",
              "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/50",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/20",
              "active:scale-[0.98]", // Feedback táctil móvil
              "sm:rounded-3xl sm:p-8 sm:hover:-translate-y-2 sm:shadow-lg sm:hover:shadow-2xl",
              // Si solo hay 1 tarjeta: ancho máximo bonito
              visibleModules.length === 1 ? "w-full max-w-xl" : "w-full",
            ].join(" ")}
          >
            {/* Decorative gradient background */}
            <div
              className={[
                "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20",
                "sm:-right-8 sm:-top-8 sm:h-32 sm:w-32",
                m.accent === "blue"
                  ? "bg-blue-500"
                  : m.accent === "amber"
                  ? "bg-amber-500"
                  : "bg-emerald-500",
              ].join(" ")}
            />

            <div className="relative">
              <div className="flex items-start justify-between">
                <AccentIcon accent={m.accent} icon={m.icon} />

                <div className="h-10 w-10 rounded-xl bg-slate-50 opacity-0 ring-1 ring-slate-200/60 transition-all duration-300 group-hover:rotate-12 group-hover:opacity-100 sm:h-12 sm:w-12 sm:rounded-2xl" />
              </div>

              <h3 className="mt-4 text-xl font-black tracking-tight text-slate-900 sm:mt-6 sm:text-2xl">
                {m.title}
              </h3>

              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600 sm:mt-3 sm:text-sm">
                {m.description}
              </p>

              <div className="mt-5 flex items-center justify-between sm:mt-8">
                <ActionLink accent={m.accent} />

                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
                  <span className="text-[10px] font-bold text-slate-500 sm:text-xs">
                    Disponible
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* Empty State (si no hay módulos visibles)     */}
      {/* ============================================ */}
      {visibleModules.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md sm:rounded-3xl sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 sm:h-20 sm:w-20">
            <svg
              className="h-8 w-8 text-slate-400 sm:h-10 sm:w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
            No hay módulos disponibles
          </h3>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            No tienes permisos para acceder a ningún módulo de solicitudes.
            Contacta al administrador del sistema.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      )}
    </div>
  );
}