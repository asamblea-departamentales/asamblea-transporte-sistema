import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { ModuloBadge } from "./ModuloBadge";
import { MODULO_CONFIG, formatFechaLinda, canUserCancel } from "../../../constants/modulo.config";
import type { CombinedRequest } from "../../../hooks/useCombinedRequests";

import { getRequestDetailPath, getRequestKey } from "../../../lib/requestIdentity";
export function RequestTable({ requests, expandedId, onToggleExpand, onCancelTarget }: {
  requests: CombinedRequest[];
  expandedId: string | null;
  onToggleExpand: (request: CombinedRequest) => void;
  onCancelTarget: (req: CombinedRequest) => void;
}) {
  const navigate = useNavigate();

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-200 bg-white text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
          <th scope="col" className="px-6 py-5">Código</th>
          <th scope="col" className="px-6 py-5">Módulo</th>
          <th scope="col" className="px-6 py-5">Fecha</th>
          <th scope="col" className="px-6 py-5">Descripción</th>
          <th scope="col" className="px-6 py-5">Estado</th>
          <th scope="col" className="px-6 py-5 text-right">Acción</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((req) => {
          const cfg = MODULO_CONFIG[req.modulo];
          const isExpanded = expandedId === getRequestKey(req);
          return (
            <React.Fragment key={`${req.modulo}-${req.id}`}>
              <tr
                onClick={() => onToggleExpand(req)}
                className={`group cursor-pointer border-b border-slate-100 transition-colors duration-200
                    ${isExpanded ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
              >
                <td className="px-6 py-4.5">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-1.5 flex-shrink-0 rounded-full ${cfg.dotClass}`} />
                    <span className="font-black tracking-tight text-slate-900">{req.codigo}</span>
                  </div>
                </td>
                <td className="px-6 py-4.5">
                  <ModuloBadge modulo={req.modulo} />
                </td>
                <td className="px-6 py-4.5 text-sm font-medium text-slate-500">
                  {formatFechaLinda(req.fecha_salida)}
                </td>
                <td className="max-w-[240px] px-6 py-4.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                      <span className="truncate" title={req.origen}>{req.origen}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-800" />
                      <span className="truncate" title={req.destino}>{req.destino}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4.5">
                  <StatusBadge estado={req.estado} />
                </td>
                <td className="px-6 py-4.5 text-right">
                  <div className="flex justify-end items-center gap-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold transition-colors
                        ${isExpanded ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                    >
                      {isExpanded ? "Ocultar" : "Detalles"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180 text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                      strokeWidth={3}
                    />
                  </div>
                </td>
              </tr>

              {isExpanded && (
                <tr className="border-b border-slate-200">
                  <td colSpan={6} className="bg-slate-50/80 px-8 py-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Unidad Solicitante</span>
                          <span className="font-bold text-slate-800">{req.unidad?.nombre ?? "—"}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Usuario</span>
                          <span className="font-bold text-slate-800">{req.solicitante?.name ?? "—"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        {canUserCancel(req.estado) && (
                          <button
                            onClick={() => onCancelTarget(req)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-95"
                          >
                            Cancelar solicitud
                          </button>
                        )}
                        <button
                          onClick={() => navigate(getRequestDetailPath(req))}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-md shadow-slate-200 transition hover:bg-slate-800 hover:shadow-lg active:scale-95"
                        >
                          Ver información completa
                          <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
