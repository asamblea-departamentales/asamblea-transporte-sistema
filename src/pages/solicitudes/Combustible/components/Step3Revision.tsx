import type { FormData, CatalogosState } from "../types";
import { ReviewRow, SectionTitle } from "./FormUI";

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Revisión + confirmación
// ══════════════════════════════════════════════════════════════════════════════

export function Step3({ data, catalogos }: { data: FormData; catalogos: CatalogosState }) {
  const vehiculo  = catalogos.vehiculos.find((v) => String(v.id) === data.vehiculo_id);
  const vehiculoLabel = vehiculo?.label ?? "";

  // Resolver nombre del motorista: primero en la lista de motoristas,
  // si no, desde el campo motorista_nombre del vehículo (asignación vigente)
  const motoristaNombre =
    catalogos.motoristas.find((m) => String(m.id) === data.motorista_id)?.nombre
    ?? vehiculo?.motorista_nombre
    ?? (data.motorista_id ? "Motorista asignado" : "Sin asignar");

  const solTransporte = catalogos.solicitudesTransporte.find(
    (s) => String(s.id) === data.solicitud_transporte_id
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle 
          label="Resumen de solicitud" 
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />

        <div>
          {solTransporte && <ReviewRow label="Solicitud transporte" value={solTransporte.codigo} />}
          <ReviewRow label="Vehículo"       value={vehiculoLabel} />
          <ReviewRow label="Motorista"       value={motoristaNombre} />
          <ReviewRow label="Destino"         value={data.destino_actividad} />
          <ReviewRow label="Fecha solicitud" value={data.fecha_solicitud} />
          <ReviewRow
            label="Efectivo"
            value={data.cantidad_combustible
              ? `${parseInt(data.cantidad_combustible, 10)} Efectivo`
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
