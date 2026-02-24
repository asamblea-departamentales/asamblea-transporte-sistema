import { useState } from "react";
import type { Request } from "../../services/requests.service";

interface AsignacionBloqueProps {
  request: Request;
}

/**
 * Muestra el vehículo y motorista asignados a una solicitud.
 * Solo se renderiza para estados: aprobada, en_ejecucion, completada, finalizada.
 */
export default function AsignacionBloque({ request }: AsignacionBloqueProps) {
  const [imgError, setImgError] = useState(false);
  const { vehiculo, motorista } = request;

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
      {/* Encabezado */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
          Asignación confirmada
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Foto del vehículo */}
        <div className="flex-shrink-0">
          {vehiculo?.fotografia_url && !imgError ? (
            <img
              src={vehiculo.fotografia_url}
              alt={`${vehiculo.marca} ${vehiculo.modelo}`}
              onError={() => setImgError(true)}
              className="h-32 w-full rounded-xl object-cover shadow ring-2 ring-white sm:h-24 sm:w-44"
            />
          ) : (
            <div className="flex h-32 w-full items-center justify-center rounded-xl bg-slate-100 shadow-inner ring-2 ring-white sm:h-24 sm:w-44">
              <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 9l-1-4H6L5 9M3 9h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM7 15h2v2H7v-2zm8 0h2v2h-2v-2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:gap-5">
          {/* Vehículo */}
          <div className="flex-1">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Vehículo asignado
            </p>
            {vehiculo ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    {vehiculo.placa}
                  </span>
                  {vehiculo.tipo && (
                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {vehiculo.tipo}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">Sin vehículo asignado</p>
            )}
          </div>

          {/* Divisores */}
          <div className="hidden w-px self-stretch bg-emerald-100 sm:block" />
          <div className="h-px w-full bg-emerald-100 sm:hidden" />

          {/* Motorista */}
          <div className="flex-1">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Motorista asignado
            </p>
            {motorista ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow">
                  {motorista.nombre?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {motorista.nombre ?? "Sin nombre"}
                  </p>
                  {motorista.telefono ? (
                    <a
                      href={`tel:${motorista.telefono}`}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {motorista.telefono}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400">Sin teléfono registrado</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">Sin motorista asignado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}