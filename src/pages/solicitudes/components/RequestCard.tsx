import { ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { ModuloBadge } from "./ModuloBadge";
import { MODULO_CONFIG, formatFechaLinda, canUserCancel } from "../../../constants/modulo.config";
import type { CombinedRequest } from "../../../hooks/useCombinedRequests";
import { getRequestDetailPath, getRequestKey } from "../../../lib/requestIdentity";

export function RequestCard({ req, isExpanded, onToggle, onCancel }: {
  req: CombinedRequest;
  isExpanded: boolean;
  onToggle: () => void;
  onCancel?: (req: CombinedRequest) => void;
}) {
  const navigate = useNavigate();
  const cfg = MODULO_CONFIG[req.modulo];
  const detailsId = `request-actions-${getRequestKey(req).replace(":", "-")}`;

  return (
    <div className={`overflow-hidden rounded-2xl border-l-4 bg-white shadow-sm ring-1 transition-all duration-300
      ${cfg.borderClass}
      ${isExpanded ? "ring-indigo-200 shadow-md translate-y-[-2px]" : "ring-slate-200/60 hover:shadow-md hover:ring-slate-300"}
    `}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        className="w-full px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[15px] font-black tracking-tight text-slate-900">{req.codigo}</span>
          <StatusBadge estado={req.estado} />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <ModuloBadge modulo={req.modulo} />
          <span className="text-xs font-medium text-slate-400">{formatFechaLinda(req.fecha_salida)}</span>
        </div>

        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
            <span className="truncate">{req.origen}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-900" aria-hidden="true" />
            <span className="truncate">{req.destino}</span>
          </div>
        </div>

        <span className={`mt-4 ml-auto flex w-fit items-center gap-1 text-xs font-bold transition-colors ${isExpanded ? "text-indigo-600" : "text-slate-400"}`}>
          {isExpanded ? "Ocultar" : "Detalles"}
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} strokeWidth={3} aria-hidden="true" />
        </span>
      </button>

      {isExpanded && (
        <div id={detailsId} className="flex gap-2 px-5 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            type="button"
            onClick={() => navigate(getRequestDetailPath(req))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Ver detalle
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          </button>
          {canUserCancel(req.estado) && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(req)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}