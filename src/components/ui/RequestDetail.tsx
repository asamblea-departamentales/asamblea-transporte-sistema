import { useState } from "react";
import type { Request } from "../../services/requests.service";
import { ESTADOS_CON_ASIGNACION } from "../../constants/requests.constants";
import { formatFecha } from "../../lib/format";
import AsignacionBloque from "./AsignacionBloque";
import RequestMap from "./RequestMap";

interface RequestDetailProps {
  request: Request;
  onComplete: (id: number) => Promise<void>;
}

export default function RequestDetail({ request, onComplete }: RequestDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCompleteClick = async () => {
    if (!confirm("¿Confirmas que el viaje ha finalizado?")) return;
    setIsUpdating(true);
    try {
      await onComplete(request.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const puedeFinalizarse   = request.estado?.toLowerCase() === "en_ejecucion";
  const mostrarAsignacion  = ESTADOS_CON_ASIGNACION.includes(request.estado?.toLowerCase());

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-5">

        {/* Cabecera */}
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-bold text-slate-800 sm:text-lg">
            Detalle #{request.codigo}
          </h3>
          {puedeFinalizarse && (
            <button
              onClick={handleCompleteClick}
              disabled={isUpdating}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all sm:w-auto
                ${isUpdating
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-slate-800 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
                }`}
            >
              {isUpdating ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Finalizar Viaje
                </>
              )}
            </button>
          )}
        </div>

        {/* Asignación */}
        {mostrarAsignacion && <AsignacionBloque request={request} />}

        {/* Info general */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Ruta</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                <div>
                  <span className="block text-xs text-slate-400">Origen</span>
                  <span className="text-sm font-medium text-slate-900">{request.origen}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                <div>
                  <span className="block text-xs text-slate-400">Destino</span>
                  <span className="text-sm font-medium text-slate-900">{request.destino}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Datos Generales</h4>
            <div className="space-y-1.5 text-sm">
              <p>
                <span className="font-semibold text-slate-600">Pasajeros:</span>{" "}
                <span className="text-slate-900">{request.cantidad_personas}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-600">Motivo:</span>{" "}
                <span className="text-slate-900">{request.motivo_actividad}</span>
              </p>
              {request.unidad && (
                <p>
                  <span className="font-semibold text-slate-600">Unidad:</span>{" "}
                  <span className="text-slate-900">{request.unidad.nombre}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mapa */}
        {request.origen && request.destino && (
          <RequestMap origen={request.origen} destino={request.destino} />
        )}

        <div className="text-right text-xs text-slate-400">
          Creado el {formatFecha(request.created_at)}
        </div>
      </div>
    </div>
  );
}