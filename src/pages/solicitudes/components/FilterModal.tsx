import { X, Check, CarFront, Wrench, Fuel } from "lucide-react";
import { ESTADOS } from "../../../constants/requests.constants";
import { getDotColor, MODULO_CONFIG } from "../../../constants/modulo.config";
import type { RequestStatus } from "../../../services/requests.service";
import type { Modulo } from "../../../hooks/useCombinedRequests";
import { FocusTrap } from "../../../components/ui/FocusTrap";

const MODULOS_FILTER: { value: Modulo | ""; label: string }[] = [
  { value: "", label: "Todos los módulos" },
  { value: "transporte", label: "Transporte" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "combustible", label: "Combustible" },
];

export function FilterModal({ open, onClose, currentEstado, currentModulo, onEstadoChange, onModuloChange, onClear }: {
  open: boolean;
  onClose: () => void;
  currentEstado: RequestStatus | "";
  currentModulo: Modulo | "";
  onEstadoChange: (e: RequestStatus | "") => void;
  onModuloChange: (m: Modulo | "") => void;
  onClear: () => void;
}) {
  if (!open) return null;
  const hasFilters = currentEstado !== "" || currentModulo !== "";

  return (
    <FocusTrap onEscape={onClose}>
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] bg-white p-6 shadow-2xl sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl" role="dialog" aria-modal="true" aria-label="Filtrar solicitudes">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Filtrar solicitudes</h2>
            <p className="text-sm text-slate-500">Por módulo y estado</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Módulo</p>
        <div className="mb-5 grid grid-cols-2 gap-2">
          {MODULOS_FILTER.map((opt) => {
            const active = currentModulo === opt.value;
            const cfg = opt.value ? MODULO_CONFIG[opt.value] : null;
            const Icon = opt.value === "transporte" ? CarFront : opt.value === "mantenimiento" ? Wrench : opt.value === "combustible" ? Fuel : null;
            return (
              <button
                key={opt.value}
                onClick={() => onModuloChange(opt.value)}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-semibold transition-all duration-200
                  ${active
                    ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {cfg && Icon && (
                    <span className={active ? "text-white" : `text-${opt.value === "transporte" ? "blue" : opt.value === "mantenimiento" ? "emerald" : "amber"}-500`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                  )}
                  {opt.label}
                </div>
                {active && <Check className="h-4 w-4 flex-shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Estado</p>
        <div className="grid grid-cols-2 gap-2">
          {ESTADOS.map((opt) => {
            const active = currentEstado === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onEstadoChange(opt.value as RequestStatus | "")}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-semibold transition-all duration-200
                  ${active
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {opt.value && (
                    <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${active ? "bg-white" : getDotColor(opt.value)}`} />
                  )}
                  {opt.label}
                </div>
                {active && <Check className="h-4 w-4 flex-shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button
            onClick={() => { onClear(); onClose(); }}
            className="mt-6 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            Limpiar todos los filtros
          </button>
        )}
      </div>
    </FocusTrap>
  );
}
