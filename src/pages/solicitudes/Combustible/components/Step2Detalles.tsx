import type { Prioridad } from "../../../../services/combustible.service";
import type { FormData } from "../types";
import { FieldLabel, inputCls, PrioridadButton } from "./FormUI";

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Detalles de la carga
// ══════════════════════════════════════════════════════════════════════════════

export function Step2({
  data, update, errors,
}: {
  data: FormData;
  update: (k: keyof FormData, v: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Destino / Actividad</FieldLabel>
        <input
          type="text"
          value={data.destino_actividad}
          onChange={(e) => update("destino_actividad", e.target.value)}
          placeholder="Ej: Visita a sede central, reparto zona norte..."
          className={inputCls(!!errors.destino_actividad)}
        />
        {errors.destino_actividad && (
          <p className="mt-1 text-xs font-semibold text-red-500">{errors.destino_actividad}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel required>Fecha de solicitud</FieldLabel>
          <input
            type="date"
            value={data.fecha_solicitud}
            onChange={(e) => update("fecha_solicitud", e.target.value)}
            className={inputCls(!!errors.fecha_solicitud)}
          />
          {errors.fecha_solicitud && (
            <p className="mt-1 text-xs font-semibold text-red-500">{errors.fecha_solicitud}</p>
          )}
        </div>
        <div>
          <FieldLabel required>Cantidad (galones)</FieldLabel>
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.cantidad_combustible}
            onChange={(e) => update("cantidad_combustible", e.target.value)}
            placeholder="0.00"
            className={inputCls(!!errors.cantidad_combustible)}
          />
          {errors.cantidad_combustible && (
            <p className="mt-1 text-xs font-semibold text-red-500">{errors.cantidad_combustible}</p>
          )}
        </div>
      </div>

      {/* Período de uso (opcional) */}
      <div className="rounded-2xl border border-dashed border-slate-200 p-4">
        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
          Período de uso{" "}
          <span className="font-normal normal-case tracking-normal text-slate-400">(opcional)</span>
        </p>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Fecha inicio</FieldLabel>
            <input
              type="date"
              value={data.fecha_inicio_periodo}
              onChange={(e) => update("fecha_inicio_periodo", e.target.value)}
              className={inputCls(!!errors.fecha_inicio_periodo)}
            />
            {errors.fecha_inicio_periodo && (
              <p className="mt-1 text-xs font-semibold text-red-500">{errors.fecha_inicio_periodo}</p>
            )}
          </div>
          <div>
            <FieldLabel>Fecha fin</FieldLabel>
            <input
              type="date"
              value={data.fecha_fin_periodo}
              onChange={(e) => update("fecha_fin_periodo", e.target.value)}
              min={data.fecha_inicio_periodo || undefined}
              className={inputCls(!!errors.fecha_fin_periodo)}
            />
            {errors.fecha_fin_periodo && (
              <p className="mt-1 text-xs font-semibold text-red-500">{errors.fecha_fin_periodo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Prioridad */}
      <div>
        <FieldLabel required>Prioridad</FieldLabel>
        <div className="flex flex-wrap gap-3">
          {(["baja", "media", "alta"] as Prioridad[]).map((p) => (
            <PrioridadButton
              key={p}
              value={p}
              current={data.prioridad}
              onClick={() => update("prioridad", p)}
            />
          ))}
        </div>
        {errors.prioridad && (
          <p className="mt-1 text-xs font-semibold text-red-500">{errors.prioridad}</p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <FieldLabel>Observaciones adicionales</FieldLabel>
        <textarea
          value={data.observaciones}
          onChange={(e) => update("observaciones", e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Información adicional relevante (opcional)..."
          className={inputCls() + " resize-none"}
        />
        <p className="mt-1 text-right text-[10px] font-semibold text-slate-400">
          {data.observaciones.length}/2000
        </p>
      </div>
    </div>
  );
}
