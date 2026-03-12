import { PRIORIDAD_CONFIG } from "../../../../services/combustible.service";
import type { Prioridad } from "../../../../services/combustible.service";
import type { FormData, CatalogosState } from "../types";
import { ReviewRow } from "./FormUI";

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Revisión + confirmación
// ══════════════════════════════════════════════════════════════════════════════

export function Step3({ data, catalogos }: { data: FormData; catalogos: CatalogosState }) {
  const vehiculo  = catalogos.vehiculos.find((v) => String(v.id) === data.vehiculo_id)?.label ?? "";
  const motorista = catalogos.motoristas.find((m) => String(m.id) === data.motorista_id)?.nombre ?? "Sin asignar";
  const prioCfg   = data.prioridad ? PRIORIDAD_CONFIG[data.prioridad as Prioridad] : null;
  const solTransporte = catalogos.solicitudesTransporte.find(
    (s) => String(s.id) === data.solicitud_transporte_id
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">Resumen de solicitud</p>
            <p className="text-xs font-semibold text-slate-400">Verifique los datos antes de enviar</p>
          </div>
          {prioCfg && (
            <span className={[
              "ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ring-1",
              prioCfg.badge,
            ].join(" ")}>
              <span className={["h-2 w-2 rounded-full", prioCfg.dot].join(" ")} />
              {prioCfg.label}
            </span>
          )}
        </div>

        <div>
          {solTransporte && <ReviewRow label="Solicitud transporte" value={solTransporte.codigo} />}
          <ReviewRow label="Vehículo"       value={vehiculo} />
          <ReviewRow label="Motorista"       value={motorista} />
          <ReviewRow label="Destino"         value={data.destino_actividad} />
          <ReviewRow label="Fecha solicitud" value={data.fecha_solicitud} />
          <ReviewRow
            label="Cantidad"
            value={data.cantidad_combustible
              ? `${parseFloat(data.cantidad_combustible).toFixed(2)} gal`
              : ""}
          />
          {data.fecha_inicio_periodo && (
            <ReviewRow label="Período inicio" value={data.fecha_inicio_periodo} />
          )}
          {data.fecha_fin_periodo && (
            <ReviewRow label="Período fin" value={data.fecha_fin_periodo} />
          )}
          {data.observaciones && (
            <ReviewRow label="Observaciones" value={data.observaciones} />
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-xs font-semibold text-amber-700">
          Al confirmar, la solicitud será enviada automáticamente para aprobación.
          No podrá editarse una vez enviada.
        </p>
      </div>
    </div>
  );
}
