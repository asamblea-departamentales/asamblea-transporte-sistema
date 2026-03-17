import type { FormData } from "../types";
import { Label, inputCls, SectionTitle, FieldError } from "./FormUI";
import { cn } from "../../../../lib/utils";

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
    <div className="space-y-6">
      <SectionTitle 
        label="Detalles de la Carga" 
        icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
      <div>
        <Label required>Destino / Actividad</Label>
        <input
          type="text"
          value={data.destino_actividad}
          onChange={(e) => update("destino_actividad", e.target.value)}
          placeholder="Ej: Visita a sede central, reparto zona norte..."
          className={inputCls(errors.destino_actividad)}
        />
        <FieldError msg={errors.destino_actividad} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label required>Fecha de solicitud</Label>
          <input
            type="date"
            value={data.fecha_solicitud}
            onChange={(e) => update("fecha_solicitud", e.target.value)}
            className={inputCls(errors.fecha_solicitud)}
          />
          <FieldError msg={errors.fecha_solicitud} />
        </div>
        <div>
          <Label required>Cantidad (galones)</Label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.cantidad_combustible}
            onChange={(e) => update("cantidad_combustible", e.target.value)}
            placeholder="0.00"
            className={inputCls(errors.cantidad_combustible)}
          />
          <FieldError msg={errors.cantidad_combustible} />
        </div>
      </div>

      {/* Período de uso (opcional) */}
      <div className="rounded-2xl border border-dashed border-slate-200 p-4">
        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
          Período de uso{" "}
          <span className="font-normal normal-case tracking-normal text-slate-400">(opcional)</span>
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Fecha inicio</Label>
            <input
              type="date"
              value={data.fecha_inicio_periodo}
              onChange={(e) => update("fecha_inicio_periodo", e.target.value)}
              className={inputCls(errors.fecha_inicio_periodo)}
            />
            <FieldError msg={errors.fecha_inicio_periodo} />
          </div>
          <div>
            <Label>Fecha fin</Label>
            <input
              type="date"
              value={data.fecha_fin_periodo}
              onChange={(e) => update("fecha_fin_periodo", e.target.value)}
              min={data.fecha_inicio_periodo || undefined}
              className={inputCls(errors.fecha_fin_periodo)}
            />
            <FieldError msg={errors.fecha_fin_periodo} />
          </div>
        </div>
      </div>


      {/* Observaciones */}
      <div>
        <Label>Observaciones adicionales</Label>
        <textarea
          value={data.observaciones}
          onChange={(e) => update("observaciones", e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Información adicional relevante (opcional)..."
          className={cn(inputCls(), "resize-none h-28")}
        />
        <p className="mt-1.5 text-right text-[10px] font-bold text-slate-400">
          {data.observaciones.length} / 2000 caracteres
        </p>
      </div>
    </div>
  );
}
