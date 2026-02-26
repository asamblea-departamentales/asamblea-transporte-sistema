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
      ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_14px_35px_-18px_rgba(37,99,235,.75)]"
      : accent === "amber"
      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_14px_35px_-18px_rgba(245,158,11,.75)]"
      : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_14px_35px_-18px_rgba(16,185,129,.75)]";

  return (
    <div
      className={[
        "inline-flex rounded-2xl p-3 sm:p-4",
        "transition-all duration-300",
        "group-hover:scale-[1.07] group-hover:-rotate-1",
        styles,
      ].join(" ")}
    >
      <span className="grid h-7 w-7 place-items-center sm:h-8 sm:w-8">{icon}</span>
    </div>
  );
}

function ActionLink({ accent }: { accent: ModuleCard["accent"] }) {
  const styles =
    accent === "blue"
      ? "text-blue-700 group-hover:text-blue-800"
      : accent === "amber"
      ? "text-amber-700 group-hover:text-amber-800"
      : "text-emerald-700 group-hover:text-emerald-800";

  return (
    <span
      className={[
        "inline-flex items-center gap-2",
        "text-[12px] sm:text-sm font-extrabold tracking-tight",
        "transition-all",
        styles,
      ].join(" ")}
    >
      Iniciar solicitud
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="transition-transform group-hover:translate-x-1.5"
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

function StatusBadge({ accent }: { accent: ModuleCard["accent"] }) {
  const dot =
    accent === "blue"
      ? "bg-blue-500"
      : accent === "amber"
      ? "bg-amber-500"
      : "bg-emerald-500";

  const pill =
    accent === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200/70"
      : accent === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200/70"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200/70";

  return (
    <span
      className={[
        "inline-flex items-center gap-2",
        "rounded-full px-3 py-1",
        "text-[11px] font-extrabold",
        "ring-1",
        pill,
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", dot].join(" ")} />
      Disponible
    </span>
  );
}

export default function NewRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        allowedRoles: ["solicitante", "admin", "supervisor", "jefe"],//Comentario: Se agregó "solicitante" para que los usuarios con ese rol también puedan ver el módulo de transporte.
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
        description:
          "Solicitudes de combustible, control de consumo y validación de entregas institucionales.",
        href: "/solicitudes/combustible/nueva",
        accent: "amber",
        allowedRoles: ["admin", "supervisor", "jefe"],
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
        description:
          "Registro de mantenimientos preventivos y correctivos, historial completo y control de aprobaciones.",
        href: "/solicitudes/mantenimiento/nueva",
        accent: "emerald",
        allowedRoles: ["admin", "supervisor", "jefe","solicitante"],
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

  const visibleModules = useMemo(() => {
    if (!user || userRoles.length === 0) return [];
    return modules.filter((m) => m.allowedRoles.some((r) => userRoles.includes(r)));
  }, [modules, user, userRoles]);

  return (
    <div className="pb-10">
      {/* Fondo moderno + contenedor */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white">
        {/* Mesh gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,.25)_1px,transparent_0)] [background-size:18px_18px] opacity-60" />
        </div>

        <div className="relative mx-auto max-w-6xl space-y-7 px-4 py-8 sm:space-y-10 sm:px-8 sm:py-10">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Nueva Solicitud
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                Seleccione el módulo que desea utilizar para crear su solicitud.
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className={[
                "group inline-flex items-center justify-center gap-2",
                "rounded-2xl bg-white/80 px-4 py-2.5 text-sm font-extrabold text-slate-700",
                "ring-1 ring-slate-200/70 shadow-sm backdrop-blur",
                "transition-all hover:bg-white hover:shadow-md active:scale-95",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
              ].join(" ")}
            >
              <svg
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </button>
          </div>

          {/* Info banner modernizado */}
          <div className="overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 backdrop-blur shadow-sm">
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100/80 ring-1 ring-blue-200/60">
                <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-900 sm:text-base">Información importante</h3>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600 sm:text-sm">
                  Cada solicitud requiere aprobación del supervisor correspondiente. Complete todos los datos requeridos
                  para agilizar el proceso.
                </p>
              </div>
            </div>
          </div>

          {/* Cards grid */}
          <div
            className={[
              "grid gap-4 sm:gap-6",
              visibleModules.length === 1
                ? "grid-cols-1 place-items-center"
                : visibleModules.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            ].join(" ")}
          >
            {visibleModules.map((m) => (
              <button
                key={m.key}
                onClick={() => navigate(m.href)}
                className={[
                  "group relative w-full text-left",
                  "overflow-hidden rounded-3xl",
                  "border border-slate-200/60 bg-white/75 backdrop-blur",
                  "p-5 sm:p-7",
                  "shadow-[0_18px_40px_-28px_rgba(15,23,42,.45)]",
                  "transition-all duration-300",
                  "hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_26px_60px_-38px_rgba(15,23,42,.55)]",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
                  "active:scale-[0.99]",
                  visibleModules.length === 1 ? "max-w-xl" : "",
                ].join(" ")}
              >
                {/* Glow por accent */}
                <div
                  className={[
                    "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-25",
                    m.accent === "blue"
                      ? "bg-blue-500"
                      : m.accent === "amber"
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                  ].join(" ")}
                />

                {/* borde interior sutil */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <AccentIcon accent={m.accent} icon={m.icon} />
                    <StatusBadge accent={m.accent} />
                  </div>

                  <h3 className="mt-4 text-lg font-black tracking-tight text-slate-900 sm:mt-6 sm:text-xl">
                    {m.title}
                  </h3>

                  <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600 sm:text-sm">
                    {m.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between sm:mt-7">
                    <ActionLink accent={m.accent} />
                    <span className="text-[11px] font-extrabold text-slate-400">
                      {/* microcopy pro */}
                      Acceso según rol
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {visibleModules.length === 0 && (
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-10 text-center shadow-sm backdrop-blur">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200/70">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">No hay módulos disponibles</h3>
              <p className="mt-2 text-sm font-medium text-slate-600">
                No tienes permisos para acceder a ningún módulo. Contacta al administrador del sistema.
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className={[
                  "mt-6 inline-flex items-center gap-2",
                  "rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white",
                  "shadow-sm transition-all hover:opacity-95 active:scale-95",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
                ].join(" ")}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
