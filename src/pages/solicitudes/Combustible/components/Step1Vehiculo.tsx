import { useState } from "react";
import type { FormData, CatalogosState } from "../types";
import { estadoTransporteColor } from "../types";
import { FieldLabel, SelectInput, Spinner } from "./FormUI";

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Vehículo + asociación a transporte
// ══════════════════════════════════════════════════════════════════════════════

export function Step1({
  data, update, updateMultiple, errors, catalogos,
}: {
  data: FormData;
  update: (k: keyof FormData, v: string) => void;
  updateMultiple: (fields: Partial<FormData>) => void;
  errors: Partial<Record<keyof FormData, string>>;
  catalogos: CatalogosState;
}) {
  const [asociarTransporte, setAsociarTransporte] = useState(!!data.solicitud_transporte_id);

  const vehiculoSeleccionado = catalogos.vehiculos.find(
    (v) => String(v.id) === data.vehiculo_id
  );

  const solicitudTransporteSeleccionada = catalogos.solicitudesTransporte.find(
    (s) => String(s.id) === data.solicitud_transporte_id
  );

  // Pre-carga campos al seleccionar una solicitud de transporte
  const handleSelectTransporte = (solicitudId: string) => {
    if (!solicitudId) {
      updateMultiple({ solicitud_transporte_id: "" });
      return;
    }

    const sol = catalogos.solicitudesTransporte.find((s) => String(s.id) === solicitudId);
    if (!sol) return;

    const fields: Partial<FormData> = { solicitud_transporte_id: solicitudId };

    if (sol.vehiculo?.id)   fields.vehiculo_id        = String(sol.vehiculo.id);
    if (sol.motorista?.id)  fields.motorista_id       = String(sol.motorista.id);
    if (sol.destino)         fields.destino_actividad  = sol.destino;
    if (sol.fecha_salida)    fields.fecha_inicio_periodo = sol.fecha_salida.split("T")[0].split(" ")[0];
    if (sol.fecha_retorno)   fields.fecha_fin_periodo    = sol.fecha_retorno.split("T")[0].split(" ")[0];

    updateMultiple(fields);
  };

  const handleToggleAsociar = (val: boolean) => {
    setAsociarTransporte(val);
    if (!val) {
      updateMultiple({
        solicitud_transporte_id: "",
        vehiculo_id: "",
        motorista_id: "",
        destino_actividad: "",
        fecha_inicio_periodo: "",
        fecha_fin_periodo: "",
      });
    }
  };

  // Adaptar VehiculoCatalogo al shape { id, label } que espera SelectInput
  const vehiculosOpts = catalogos.vehiculos.map((v) => ({ id: v.id, label: v.label }));
  const motoristasOpts = catalogos.motoristas.map((m) => ({ id: m.id, label: m.nombre }));

  return (
    <div className="space-y-5">
      {/* ── Toggle asociar transporte ─────────────────────────────────── */}
      <div className="bg-transparent">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Asociar a solicitud de transporte</p>
              <p className="text-xs font-semibold text-slate-400">Opcional — pre-carga vehículo, motorista y destino</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggleAsociar(!asociarTransporte)}
            className={[
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
              asociarTransporte ? "bg-slate-900" : "bg-slate-200",
            ].join(" ")}
          >
            <span className={[
              "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
              asociarTransporte ? "translate-x-5" : "translate-x-0",
            ].join(" ")} />
          </button>
        </div>

        {/* Selector de solicitud de transporte */}
        {asociarTransporte && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <FieldLabel>Solicitud de transporte</FieldLabel>

            {catalogos.loadingSolicitudes ? (
              <div className="flex items-center gap-2 py-3">
                <Spinner className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">Cargando solicitudes...</span>
              </div>
            ) : catalogos.solicitudesTransporte.length === 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-400">
                  No tienes solicitudes de transporte aprobadas o programadas.
                </p>
              </section>
            ) : (
              <SelectInput
                value={data.solicitud_transporte_id}
                onChange={handleSelectTransporte}
                options={catalogos.solicitudesTransporte.map((s) => ({
                  id: s.id,
                  label: `${s.codigo} — ${s.destino}`,
                }))}
                placeholder="Seleccione una solicitud..."
              />
            )}

            {/* Card resumen solicitud seleccionada */}
            {solicitudTransporteSeleccionada && (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-black text-slate-700">{solicitudTransporteSeleccionada.codigo}</p>
                  <span className={[
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black ring-1",
                    estadoTransporteColor[solicitudTransporteSeleccionada.estado]
                      ?? "bg-slate-50 text-slate-600 ring-slate-200",
                  ].join(" ")}>
                    {solicitudTransporteSeleccionada.estado}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Destino",   value: solicitudTransporteSeleccionada.destino },
                    { label: "Motorista", value: solicitudTransporteSeleccionada.motorista?.nombre ?? "Sin asignar" },
                    { label: "Salida",    value: solicitudTransporteSeleccionada.fecha_salida?.split("T")[0] ?? "" },
                    { label: "Retorno",   value: solicitudTransporteSeleccionada.fecha_retorno?.split("T")[0] ?? "—" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{item.label}</p>
                      <p className="mt-0.5 truncate text-xs font-bold text-slate-700">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] font-medium text-slate-500">
                  ✓ Vehículo, motorista, destino y fechas pre-cargados. Puedes editarlos en los pasos siguientes.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Selector de vehículo ──────────────────────────────────────── */}
      <div>
        <FieldLabel required>Vehículo</FieldLabel>
        <SelectInput
          value={data.vehiculo_id}
          onChange={(v) => {
            const vData = catalogos.vehiculos.find(veh => String(veh.id) === v);
            const updates: Partial<FormData> = { vehiculo_id: v };
            
            // Si el vehículo tiene un motorista asignado, autoseleccionar
            if (vData?.motorista_id) {
               updates.motorista_id = String(vData.motorista_id);
            } else if (vData?.motorista?.id) {
               updates.motorista_id = String(vData.motorista.id);
            }
            
            updateMultiple(updates);
          }}
          options={vehiculosOpts}
          placeholder={catalogos.loading ? "Cargando vehículos..." : "Seleccione un vehículo..."}
          error={!!errors.vehiculo_id}
          disabled={catalogos.loading}
        />
        {errors.vehiculo_id && (
          <p className="mt-1 text-xs font-semibold text-red-500">{errors.vehiculo_id}</p>
        )}
      </div>

      {/* Card info vehículo seleccionado */}
      {vehiculoSeleccionado && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2" />
                <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Vehículo seleccionado</p>
              <p className="text-xs font-semibold text-slate-400">Información del activo</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Placa",  value: vehiculoSeleccionado.placa  },
              { label: "Marca",  value: vehiculoSeleccionado.marca  },
              { label: "Modelo", value: vehiculoSeleccionado.modelo },
              { label: "Tipo",   value: vehiculoSeleccionado.tipo   },
            ].map((item) => (
              <div key={item.label} className="bg-transparent py-2.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-800">{item.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Motorista ─────────────────────────────────────────────────── */}
      <div>
        <FieldLabel>
          Motorista <span className="font-normal text-slate-400">(opcional)</span>
        </FieldLabel>
        <SelectInput
          value={data.motorista_id}
          onChange={(v) => update("motorista_id", v)}
          options={motoristasOpts}
          placeholder={catalogos.loading ? "Cargando motoristas..." : "Sin motorista asignado"}
          disabled={catalogos.loading}
        />
      </div>
    </div>
  );
}
