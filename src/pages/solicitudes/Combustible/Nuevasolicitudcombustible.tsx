// src/pages/solicitudes/combustible/NuevaSolicitudCombustible.tsx
//
// Refactorizado: toda la lógica de API vive en combustible.service.ts
// El componente solo maneja UI + estado local del formulario.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getVehiculos,
  getMotoristas,
  getSolicitudesTransporteAsociables,
  crearSolicitudCombustible,
  PRIORIDAD_CONFIG,
  type VehiculoCatalogo,
  type MotoristaCatalogo,
  type SolicitudTransporteRef,
  type Prioridad,
  type CrearSolicitudCombustiblePayload,
} from "../../../services/combustible.service";

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS LOCALES
// ══════════════════════════════════════════════════════════════════════════════

interface CatalogosState {
  vehiculos: VehiculoCatalogo[];
  motoristas: MotoristaCatalogo[];
  solicitudesTransporte: SolicitudTransporteRef[];
  loading: boolean;
  loadingSolicitudes: boolean;
  error: string | null;
}

interface FormData {
  solicitud_transporte_id: string;
  vehiculo_id: string;
  motorista_id: string;
  destino_actividad: string;
  fecha_solicitud: string;
  fecha_inicio_periodo: string;
  fecha_fin_periodo: string;
  cantidad_combustible: string;
  prioridad: Prioridad | "";
  observaciones: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

const INITIAL: FormData = {
  solicitud_transporte_id: "",
  vehiculo_id: "",
  motorista_id: "",
  destino_actividad: "",
  fecha_solicitud: new Date().toISOString().split("T")[0],
  fecha_inicio_periodo: "",
  fecha_fin_periodo: "",
  cantidad_combustible: "",
  prioridad: "",
  observaciones: "",
};

const STEPS = [
  { id: 1, title: "Vehículo",  subtitle: "Selección del activo"    },
  { id: 2, title: "Detalles",  subtitle: "Información de la carga" },
  { id: 3, title: "Revisión",  subtitle: "Confirmar y enviar"      },
];

const estadoTransporteColor: Record<string, string> = {
  aprobada:   "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  programada: "bg-blue-50 text-blue-700 ring-blue-200/70",
};

// ══════════════════════════════════════════════════════════════════════════════
// VALIDACIÓN POR STEP
// ══════════════════════════════════════════════════════════════════════════════

function validate(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const e: Partial<Record<keyof FormData, string>> = {};

  if (step === 1) {
    if (!data.vehiculo_id) e.vehiculo_id = "Seleccione un vehículo.";
  }

  if (step === 2) {
    if (!data.destino_actividad.trim())
      e.destino_actividad = "El destino o actividad es requerido.";
    if (!data.fecha_solicitud)
      e.fecha_solicitud = "La fecha de solicitud es requerida.";
    if (!data.cantidad_combustible || isNaN(Number(data.cantidad_combustible)) || Number(data.cantidad_combustible) <= 0)
      e.cantidad_combustible = "Ingrese una cantidad válida mayor a 0.";
    if (!data.prioridad)
      e.prioridad = "Seleccione una prioridad.";
    if (data.fecha_inicio_periodo && data.fecha_fin_periodo && data.fecha_fin_periodo < data.fecha_inicio_periodo)
      e.fecha_fin_periodo = "Debe ser posterior a la fecha de inicio.";
  }

  return e;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES UI COMPARTIDOS
// ══════════════════════════════════════════════════════════════════════════════

function StepperHeader({ current }: { current: number }) {
  return (
    <div className="relative mb-8 flex items-center justify-between">
      <div className="absolute left-0 right-0 top-5 h-[2px] bg-slate-100" />
      <div
        className="absolute left-0 top-5 h-[2px] bg-slate-900 transition-all duration-700"
        style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map((step) => {
        const done   = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <div className={[
              "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
              done
                ? "border-slate-900 bg-slate-900 text-white"
                : active
                ? "border-slate-900 bg-white text-slate-900 ring-4 ring-slate-100"
                : "border-slate-200 bg-white text-slate-400 font-medium",
            ].join(" ")}>
              {done ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : step.id}
            </div>
            <div className="text-center">
              <p className={["text-xs tracking-tight",
                active ? "text-slate-900 font-bold" : done ? "text-slate-700 font-bold" : "text-slate-500 font-semibold",
              ].join(" ")}>
                {step.title}
              </p>
              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">{step.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-semibold tracking-tight text-slate-800">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function inputCls(hasError = false) {
  return [
    "w-full rounded-lg border px-4 py-3 text-sm font-medium text-slate-800",
    "bg-white placeholder-slate-400 transition-all duration-200 outline-none",
    "focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900",
    hasError ? "border-red-300 ring-2 ring-red-100" : "border-slate-200 hover:border-slate-300 shadow-sm",
  ].join(" ");
}

function SelectInput({
  value, onChange, options, placeholder, error, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string | number; label: string }[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={inputCls(error) + " cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394a3b8' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.id} value={String(o.id)}>{o.label}</option>
      ))}
    </select>
  );
}

function PrioridadButton({
  value, current, onClick,
}: {
  value: Prioridad;
  current: Prioridad | "";
  onClick: () => void;
}) {
  const cfg = PRIORIDAD_CONFIG[value];
  const sel = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none",
        sel
          ? value === "baja"  ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/50"
          : value === "media" ? "border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-500/50"
          :                     "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500/50"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className={["h-2.5 w-2.5 rounded-full", cfg.dot].join(" ")} />
      {cfg.label}
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-slate-900">{value || "—"}</span>
    </div>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Vehículo + asociación a transporte
// ══════════════════════════════════════════════════════════════════════════════

function Step1({
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
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <Spinner className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">Cargando solicitudes...</span>
              </div>
            ) : catalogos.solicitudesTransporte.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-400">
                  No tienes solicitudes de transporte aprobadas o programadas.
                </p>
              </div>
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
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
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
                    <div key={item.label} className="rounded-lg border border-slate-100 bg-white px-2.5 py-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{item.label}</p>
                      <p className="mt-0.5 truncate text-xs font-bold text-slate-700">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] font-semibold text-slate-400">
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
          onChange={(v) => update("vehiculo_id", v)}
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
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
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

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Detalles de la carga
// ══════════════════════════════════════════════════════════════════════════════

function Step2({
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Revisión + confirmación
// ══════════════════════════════════════════════════════════════════════════════

function Step3({ data, catalogos }: { data: FormData; catalogos: CatalogosState }) {
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

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA DE ÉXITO
// ══════════════════════════════════════════════════════════════════════════════

function SuccessScreen({ onReset }: { onReset: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="pb-10">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 shadow-xl shadow-slate-900/10">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">¡Solicitud enviada!</h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            Tu solicitud de combustible fue enviada correctamente y está pendiente de aprobación.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/solicitudes/combustible")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
            >
              Ver mis solicitudes
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              Nueva solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA DE ERROR EN CATÁLOGOS
// ══════════════════════════════════════════════════════════════════════════════

function ErrorCatalogos({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="pb-10">
      <div className="rounded-3xl border border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-100 bg-red-50">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900">Error al cargar datos</h2>
          <p className="mt-2 text-sm font-semibold text-slate-400">{message}</p>
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function NuevaSolicitudCombustible() {
  const navigate = useNavigate();

  // ── Estado del stepper ────────────────────────────────────────────────────
  const [step, setStep]           = useState(1);
  const [data, setData]           = useState<FormData>(INITIAL);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);

  // ── Estado de catálogos ───────────────────────────────────────────────────
  const [catalogos, setCatalogos] = useState<CatalogosState>({
    vehiculos: [],
    motoristas: [],
    solicitudesTransporte: [],
    loading: true,
    loadingSolicitudes: true,
    error: null,
  });

  // ── Carga inicial de catálogos desde el servicio ──────────────────────────
  const fetchCatalogos = useCallback(async () => {
    setCatalogos((prev) => ({ ...prev, loading: true, loadingSolicitudes: true, error: null }));
    try {
      // Las tres llamadas en paralelo — el servicio ya maneja el token vía axios
      const [vehiculos, motoristas, solicitudesTransporte] = await Promise.all([
        getVehiculos(),
        getMotoristas(),
        getSolicitudesTransporteAsociables(),
      ]);

      setCatalogos({
        vehiculos,
        motoristas,
        solicitudesTransporte,
        loading: false,
        loadingSolicitudes: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los catálogos.";
      setCatalogos((prev) => ({
        ...prev,
        loading: false,
        loadingSolicitudes: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => { fetchCatalogos(); }, [fetchCatalogos]);

  // ── Helpers de estado del formulario ─────────────────────────────────────
  const update = useCallback((key: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const updateMultiple = useCallback((fields: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...fields }));
    setErrors((prev) => {
      const n = { ...prev };
      Object.keys(fields).forEach((k) => delete n[k as keyof FormData]);
      return n;
    });
  }, []);

  // ── Navegación entre steps ────────────────────────────────────────────────
  const handleNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  // ── Submit: usa el servicio en lugar de fetch directo ─────────────────────
  const handleSubmit = async () => {
    setApiError(null);
    setLoading(true);

    try {
      // Construir el payload tipado — solo incluir campos con valor
      const payload: CrearSolicitudCombustiblePayload = {
        vehiculo_id:          parseInt(data.vehiculo_id),
        destino_actividad:    data.destino_actividad,
        fecha_solicitud:      data.fecha_solicitud,
        cantidad_combustible: parseFloat(data.cantidad_combustible),
        prioridad:            data.prioridad as Prioridad,
      };

      if (data.solicitud_transporte_id)
        payload.solicitud_transporte_id = parseInt(data.solicitud_transporte_id);
      if (data.motorista_id)
        payload.motorista_id = parseInt(data.motorista_id);
      if (data.fecha_inicio_periodo)
        payload.fecha_inicio_periodo = data.fecha_inicio_periodo;
      if (data.fecha_fin_periodo)
        payload.fecha_fin_periodo = data.fecha_fin_periodo;
      if (data.observaciones.trim())
        payload.observaciones = data.observaciones.trim();

      // Una sola línea — sin fetch, sin headers, sin JSON.stringify manual
      await crearSolicitudCombustible(payload);

      setSubmitted(true);
    } catch (err: unknown) {
      // Axios lanza un AxiosError con err.response.data
      let message = "No se pudo conectar con el servidor.";

      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }).response;
        if (res?.data?.errors) {
          message = Object.entries(res.data.errors)
            .map(([k, v]) => `${k}: ${v[0]}`)
            .join("\n");
        } else if (res?.data?.message) {
          message = res.data.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setApiError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(INITIAL);
    setStep(1);
    setSubmitted(false);
    setApiError(null);
  };

  // ── Renders condicionales ─────────────────────────────────────────────────
  if (submitted) return <SuccessScreen onReset={handleReset} />;

  if (!catalogos.loading && catalogos.error) {
    return <ErrorCatalogos message={catalogos.error} onRetry={fetchCatalogos} />;
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="pb-10">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-10">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                Combustible Vehicular
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Nueva Solicitud
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Complete los datos para registrar la carga de combustible.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>

          {/* Banner de error de API */}
          {apiError && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-black text-red-800">No se pudo enviar la solicitud</p>
                <p className="mt-1 whitespace-pre-line text-xs font-semibold text-red-600">{apiError}</p>
              </div>
              <button onClick={() => setApiError(null)} className="text-red-300 hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <StepperHeader current={step} />

          {/* Contenedor del step activo */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white shadow-sm">
                {step}
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-slate-900">{STEPS[step - 1].title}</p>
                <p className="text-sm font-medium text-slate-500">{STEPS[step - 1].subtitle}</p>
              </div>
            </div>

            {step === 1 && (
              <Step1
                data={data}
                update={update}
                updateMultiple={updateMultiple}
                errors={errors}
                catalogos={catalogos}
              />
            )}
            {step === 2 && <Step2 data={data} update={update} errors={errors} />}
            {step === 3 && <Step3 data={data} catalogos={catalogos} />}

            {/* Navegación inferior */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
              ) : <span />}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={catalogos.loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {catalogos.loading && step === 1 ? (
                    <><Spinner /> Cargando...</>
                  ) : (
                    <>
                      Siguiente
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-7 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <><Spinner /> Enviando...</>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Confirmar y enviar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] font-bold text-slate-400">
            Paso {step} de {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}