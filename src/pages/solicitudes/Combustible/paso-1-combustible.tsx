// src/pages/solicitudes/combustible/paso-1-combustible.tsx
//
// Paso 1 del wizard de solicitud de combustible.
// Responsabilidad: selección de vehículo, motorista y asociación opcional
// a una solicitud de transporte existente.
// Estado persistido en localStorage bajo la clave STORAGE_KEY.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getVehiculos,
  getMotoristas,
  getSolicitudesTransporteAsociables,
  type VehiculoCatalogo,
  type MotoristaCatalogo,
  type SolicitudTransporteRef,
} from "../../../services/combustible.service";

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

export const STORAGE_KEY = "solicitud_combustible";

export type WizardData = {
  // Paso 1
  vehiculo_id?:             number;
  vehiculo_label?:          string;
  vehiculo_placa?:          string;
  vehiculo_marca?:          string;
  vehiculo_modelo?:         string;
  vehiculo_tipo?:           string;
  motorista_id?:            number;
  motorista_nombre?:        string;
  solicitud_transporte_id?: number;
  solicitud_transporte_codigo?: string;
  // Paso 2
  destino_actividad?:       string;
  fecha_solicitud?:         string;
  cantidad_combustible?:    number;
  prioridad?:               "baja" | "media" | "alta";
  fecha_inicio_periodo?:    string;
  fecha_fin_periodo?:       string;
  observaciones?:           string;
};

function safeParse(json: string | null): WizardData {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
}

const estadoTransporteColor: Record<string, string> = {
  aprobada:   "bg-emerald-50 text-emerald-700 ring-emerald-100",
  programada: "bg-blue-50 text-blue-700 ring-blue-100",
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES UI
// ══════════════════════════════════════════════════════════════════════════════

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-widest text-slate-400">
      {children}
      {required && <span className="ml-1 text-emerald-500">*</span>}
    </label>
  );
}

function SelectField({
  value, onChange, disabled, children, error,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={[
        "w-full appearance-none rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-800",
        "bg-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400",
        "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        error ? "border-red-300 ring-2 ring-red-200/50" : "border-slate-200 hover:border-slate-300",
      ].join(" ")}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394a3b8' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
      }}
    >
      {children}
    </select>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function Paso1Combustible() {
  const navigate = useNavigate();

  // ── Catálogos ──────────────────────────────────────────────────────────────
  const [vehiculos,   setVehiculos]   = useState<VehiculoCatalogo[]>([]);
  const [motoristas,  setMotoristas]  = useState<MotoristaCatalogo[]>([]);
  const [transportes, setTransportes] = useState<SolicitudTransporteRef[]>([]);
  const [loadingCat,  setLoadingCat]  = useState(true);
  const [errorCat,    setErrorCat]    = useState<string | null>(null);

  // ── Formulario ─────────────────────────────────────────────────────────────
  const [vehiculoId,    setVehiculoId]    = useState("");
  const [motoristaId,   setMotoristaId]   = useState("");
  const [transporteId,  setTransporteId]  = useState("");
  const [asociarTransp, setAsociarTransp] = useState(false);
  const [errors,        setErrors]        = useState<Record<string, string>>({});

  // ── Cargar catálogos ───────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoadingCat(true);
      setErrorCat(null);
      try {
        const [v, m, t] = await Promise.all([
          getVehiculos(),
          getMotoristas(),
          getSolicitudesTransporteAsociables(),
        ]);
        setVehiculos(v);
        setMotoristas(m);
        setTransportes(t);
      } catch (err: unknown) {
        setErrorCat(err instanceof Error ? err.message : "Error al cargar catálogos.");
      } finally {
        setLoadingCat(false);
      }
    }
    load();
  }, []);

  // ── Hidratar desde localStorage si volvieron del paso 2 ───────────────────
  useEffect(() => {
    if (loadingCat) return;
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (saved.vehiculo_id)            setVehiculoId(String(saved.vehiculo_id));
    if (saved.motorista_id)           setMotoristaId(String(saved.motorista_id));
    if (saved.solicitud_transporte_id) {
      setTransporteId(String(saved.solicitud_transporte_id));
      setAsociarTransp(true);
    }
  }, [loadingCat]);

  // ── Datos del vehículo seleccionado ───────────────────────────────────────
  const vehiculoSel = vehiculos.find((v) => String(v.id) === vehiculoId);
  const motoristaSelNombre = motoristas.find((m) => String(m.id) === motoristaId)?.nombre;

  // ── Al seleccionar solicitud de transporte — pre-carga campos ─────────────
  function handleSelectTransporte(id: string) {
    setTransporteId(id);
    if (!id) return;
    const sol = transportes.find((s) => String(s.id) === id);
    if (!sol) return;
    if (sol.vehiculo?.id) setVehiculoId(String(sol.vehiculo.id));
    if (sol.motorista?.id) setMotoristaId(String(sol.motorista.id));
    setErrors((p) => { const n = { ...p }; delete n.vehiculo_id; return n; });
  }

  function handleToggleAsociar(val: boolean) {
    setAsociarTransp(val);
    if (!val) {
      setTransporteId("");
      setVehiculoId("");
      setMotoristaId("");
    }
  }

  // ── Validación y avanzar ──────────────────────────────────────────────────
  function handleNext() {
    const errs: Record<string, string> = {};
    if (!vehiculoId) errs.vehiculo_id = "Seleccione un vehículo.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const veh = vehiculos.find((v) => String(v.id) === vehiculoId);
    const mot = motoristas.find((m) => String(m.id) === motoristaId);
    const tsp = transportes.find((s) => String(s.id) === transporteId);

    // Leer datos previos del paso 2 para no pisarlos
    const prev = safeParse(localStorage.getItem(STORAGE_KEY));

    const data: WizardData = {
      ...prev,
      vehiculo_id:                 veh ? veh.id : parseInt(vehiculoId),
      vehiculo_label:              veh?.label ?? "",
      vehiculo_placa:              veh?.placa ?? "",
      vehiculo_marca:              veh?.marca ?? "",
      vehiculo_modelo:             veh?.modelo ?? "",
      vehiculo_tipo:               veh?.tipo ?? "",
      motorista_id:                mot ? mot.id : undefined,
      motorista_nombre:            mot?.nombre ?? undefined,
      solicitud_transporte_id:     tsp ? tsp.id : undefined,
      solicitud_transporte_codigo: tsp?.codigo ?? undefined,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    navigate("/solicitudes/combustible/paso-2");
  }

  const transporteSel = transportes.find((s) => String(s.id) === transporteId);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">

      {/* ── Barra de progreso ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">Nueva Solicitud de Combustible</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paso 1 de 3
          </span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/3 rounded-full bg-emerald-500 transition-all duration-500" />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Actual: <span className="font-semibold text-emerald-600">Vehículo</span>
          </span>
          <span className="italic text-slate-400">Selecciona el activo y motorista</span>
        </div>
      </div>

      {/* ── Título ────────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
          Selección del Vehículo
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          Elige el vehículo que necesita combustible. Opcionalmente puedes vincularlo
          a una solicitud de transporte existente para pre-cargar los datos automáticamente.
        </p>
      </div>

      {/* ── Error de catálogos ─────────────────────────────────────────────── */}
      {errorCat && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="font-bold text-red-900">Error al cargar datos</p>
            <p className="mt-0.5">{errorCat}</p>
          </div>
        </div>
      )}

      {/* ── Formulario ────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-7">

          {/* ── Asociar solicitud de transporte ──────────────────────────── */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Asociar a solicitud de transporte</p>
                  <p className="text-xs font-semibold text-slate-400">
                    Opcional — pre-carga vehículo, motorista y destino
                  </p>
                </div>
              </div>
              {/* Toggle */}
              <button
                type="button"
                onClick={() => handleToggleAsociar(!asociarTransp)}
                className={[
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                  asociarTransp ? "bg-emerald-500" : "bg-slate-200",
                ].join(" ")}
              >
                <span className={[
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                  asociarTransp ? "translate-x-5" : "translate-x-0",
                ].join(" ")} />
              </button>
            </div>

            {/* Selector de solicitud de transporte */}
            {asociarTransp && (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <FieldLabel>Solicitud de transporte</FieldLabel>
                {loadingCat ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <Spinner className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-400">Cargando solicitudes...</span>
                  </div>
                ) : transportes.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-sm font-semibold text-slate-400">
                      No hay solicitudes de transporte aprobadas o programadas disponibles.
                    </p>
                  </div>
                ) : (
                  <SelectField value={transporteId} onChange={handleSelectTransporte}>
                    <option value="">Seleccione una solicitud...</option>
                    {transportes.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.codigo} — {s.destino}
                      </option>
                    ))}
                  </SelectField>
                )}

                {/* Card resumen del transporte seleccionado */}
                {transporteSel && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-slate-700">{transporteSel.codigo}</p>
                      <span className={[
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black ring-1",
                        estadoTransporteColor[transporteSel.estado] ?? "bg-slate-50 text-slate-600 ring-slate-200",
                      ].join(" ")}>
                        {transporteSel.estado}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Destino",   value: transporteSel.destino },
                        { label: "Motorista", value: transporteSel.motorista?.nombre ?? "Sin asignar" },
                        { label: "Salida",    value: transporteSel.fecha_salida?.split("T")[0] ?? "—" },
                        { label: "Retorno",   value: transporteSel.fecha_retorno?.split("T")[0] ?? "—" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{item.label}</p>
                          <p className="mt-0.5 truncate text-xs font-bold text-slate-700">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] font-semibold text-slate-400">
                      ✓ Vehículo y motorista pre-cargados. Puedes modificarlos abajo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Selector de vehículo ─────────────────────────────────────── */}
          <section>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
              Vehículo
            </p>
            <div className="space-y-4">
              <div>
                <FieldLabel required>Seleccionar vehículo</FieldLabel>
                {loadingCat ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <Spinner className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-400">Cargando vehículos...</span>
                  </div>
                ) : (
                  <SelectField
                    value={vehiculoId}
                    onChange={(v) => {
                      setVehiculoId(v);
                      setErrors((p) => { const n = { ...p }; delete n.vehiculo_id; return n; });
                    }}
                    error={!!errors.vehiculo_id}
                  >
                    <option value="">Seleccione un vehículo...</option>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={String(v.id)}>{v.label}</option>
                    ))}
                  </SelectField>
                )}
                {errors.vehiculo_id && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.vehiculo_id}</p>
                )}
              </div>

              {/* Card info del vehículo seleccionado */}
              {vehiculoSel && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                    Información del activo
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Placa",  value: vehiculoSel.placa  },
                      { label: "Marca",  value: vehiculoSel.marca  },
                      { label: "Modelo", value: vehiculoSel.modelo },
                      { label: "Tipo",   value: vehiculoSel.tipo   },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{item.label}</p>
                        <p className="mt-0.5 truncate text-sm font-bold text-slate-800">{item.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Selector de motorista ─────────────────────────────────────── */}
          <section>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
              Motorista <span className="normal-case font-semibold tracking-normal">(opcional)</span>
            </p>
            {loadingCat ? (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Spinner className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">Cargando motoristas...</span>
              </div>
            ) : (
              <SelectField value={motoristaId} onChange={setMotoristaId}>
                <option value="">Sin motorista asignado</option>
                {motoristas.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.nombre}</option>
                ))}
              </SelectField>
            )}
            {motoristaSelNombre && (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                ✓ Motorista: <span className="font-black text-slate-700">{motoristaSelNombre}</span>
              </p>
            )}
          </section>

        </div>

        {/* ── Navegación ──────────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/solicitudes/combustible")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>

          <button
            onClick={handleNext}
            disabled={loadingCat}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingCat ? (
              <><Spinner className="h-4 w-4" /> Cargando...</>
            ) : (
              <>
                Siguiente
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}