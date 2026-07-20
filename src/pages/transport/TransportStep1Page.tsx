// src/pages/transport/TransportStep1Page.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { transportDraftStorage } from "./useTransportDraft";

// ─── Types ────────────────────────────────────────────────────────────────────

type VehiculoId = "sedan" | "microbus" | "camion";

type FormState = {
  tipoVehiculo: VehiculoId | "";
  fecha: string;
  hora: string;
  encargado: string;
  subencargado: string;
  pasajeros: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_HOURS_AHEAD = 2;

const VEHICULOS = [
  { id: "sedan"    as VehiculoId, label: "Sedán",    sub: "Viajes ejecutivos",   capacity: "1 – 4 pasajeros",  image: "/vehicles/sedan.png"    },
  { id: "microbus" as VehiculoId, label: "Microbús", sub: "Grupos medianos",     capacity: "5 – 20 pasajeros", image: "/vehicles/microbus.png" },
  { id: "camion"   as VehiculoId, label: "Camión",   sub: "Transporte de carga", capacity: "Carga pesada",     image: "/vehicles/camion.png"   },
];

// ─── Date/time helpers ────────────────────────────────────────────────────────

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function calcMinTime(): string {
  const d = new Date();
  d.setHours(d.getHours() + MIN_HOURS_AHEAD);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState): FieldErrors {
  const errs: FieldErrors = {};
  const today = getTodayStr();

  if (!form.tipoVehiculo)
    errs.tipoVehiculo = "Seleccione un tipo de vehículo para continuar.";

  if (!form.fecha)
    errs.fecha = "La fecha de salida es requerida.";
  else if (form.fecha < today)
    errs.fecha = "No puede seleccionar una fecha anterior a hoy.";

  if (!form.hora)
    errs.hora = "La hora de salida es requerida.";
  else if (form.fecha === today && form.hora < calcMinTime())
    errs.hora = `Se requieren ${MIN_HOURS_AHEAD}h de anticipación. Hora mínima: ${calcMinTime()}.`;

  if (!form.encargado.trim())
    errs.encargado = "El nombre del encargado es requerido.";
  else if (form.encargado.trim().length < 3)
    errs.encargado = "Ingrese un nombre válido (mín. 3 caracteres).";

  if (!form.pasajeros)
    errs.pasajeros = "Indique el número de pasajeros.";
  else if (Number(form.pasajeros) < 1)
    errs.pasajeros = "Debe haber al menos 1 pasajero.";
  else if (Number(form.pasajeros) > 50)
    errs.pasajeros = "Máximo 50 pasajeros.";

  return errs;
}

// ─── Micro-components ────────────────────────────────────────────────────────

import { FieldError } from "../../components/ui/FieldError";

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
        style={{ background: "rgba(15,37,72,0.07)", color: "#0f2548" }}>
        {icon}
      </div>
      <span className="text-[14px] font-bold text-slate-800">{label}</span>
    </div>
  );
}

const inputCls = (err?: string) => cn(
  "w-full rounded-xl border bg-white px-4 py-2.5 text-[13px] text-slate-900",
  "outline-none transition placeholder:text-slate-300",
  "focus:ring-[3px] focus:ring-offset-0",
  err
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100/60",
);

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
      {children}
      {required && <span className="text-red-500 font-black normal-case tracking-normal">*</span>}
    </label>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

import TransportWizard from "../../components/ui/TransportWizard";

const WIZARD_STEPS = [
  { id: 1, label: "Datos"     },
  { id: 2, label: "Ruta"      },
  { id: 3, label: "Confirmar" },
];

function getInitialForm(): FormState {
  const fallback: FormState = {
    tipoVehiculo: "", fecha: "", hora: "", encargado: "", subencargado: "", pasajeros: "",
  };
  const saved = transportDraftStorage.read();
  return saved ? { ...fallback, ...saved } : fallback;
}
export default function TransportStep1Page() {
  const navigate = useNavigate();
  const today    = getTodayStr();

  const [form, setForm] = useState<FormState>(getInitialForm);
  const [errors,    setErrors]    = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);


  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((previous) => {
      const next = { ...previous, [k]: v };
      if (submitted) setErrors(validate(next));
      return next;
    });
  };

  function handleNext() {
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    transportDraftStorage.write({
      ...transportDraftStorage.read(),
      ...form,
      encargado:    form.encargado.trim(),
      subencargado: form.subencargado.trim(),
      tipoVehiculo: form.tipoVehiculo || undefined,
    });
    navigate("/solicitudes/transporte/paso-2");
  }

  const errorCount = Object.keys(errors).length;
  const minTime    = form.fecha === today ? calcMinTime() : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">

      {/* ── Wizard stepper ─────────────────────────────────────────────── */}
      <TransportWizard steps={WIZARD_STEPS} currentStep={1} />

      {/* ── Page heading ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block h-[2px] w-5 rounded-full bg-blue-700" />
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">
            Solicitud de Transporte
          </span>
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 leading-none">
          Datos del Viaje
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
          Complete los campos requeridos para continuar con la solicitud institucional.
        </p>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {submitted && errorCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 mt-0.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-bold text-red-900">
              {errorCount} campo{errorCount > 1 ? "s" : ""} con error
            </p>
            <p className="text-[11px] text-red-700 mt-0.5">
              Revise los campos resaltados antes de continuar.
            </p>
          </div>
        </div>
      )}

      {/* ── Main card ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">

        {/* ── Sección 1: Tipo de vehículo ─────────────────────────────── */}
        <div className="p-5 sm:p-6">
          <SectionTitle
            label="Tipo de vehículo"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {VEHICULOS.map(v => {
              const sel = form.tipoVehiculo === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => set("tipoVehiculo", v.id)}
                  aria-pressed={sel}
                  className={cn(
                    "group relative flex flex-row sm:flex-col items-center gap-3 sm:gap-0",
                    "rounded-2xl border-2 px-4 py-3.5 sm:px-4 sm:pt-6 sm:pb-5 text-left",
                    "transition-all duration-300 active:scale-[0.97]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                    sel
                      ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-4 ring-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50",
                    submitted && errors.tipoVehiculo && !sel ? "border-red-200 bg-red-50/20" : "",
                  )}
                  style={sel ? { background: "linear-gradient(160deg, #f0f7ff 0%, #ffffff 100%)" } : {}}
                >
                  {/* Radio */}
                  <span className={cn(
                    "absolute right-3.5 top-3.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 z-10",
                    sel ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white",
                  )}>
                    {sel && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>

                  {/* Imagen realista del vehículo */}
                  <div className="w-24 h-16 sm:w-36 sm:h-24 flex-shrink-0 sm:mb-3 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 drop-shadow-md">
                    <img src={v.image} alt={v.label} className="w-full h-full object-contain mix-blend-darken" />
                  </div>

                  {/* Texto */}
                  <div className="pr-4 sm:pr-0 min-w-0 w-full text-left sm:text-center">
                    <p className={cn("text-[15px] font-extrabold leading-tight tracking-tight", sel ? "text-blue-900" : "text-slate-800")}>
                      {v.label}
                    </p>
                    <p className={cn("text-[12px] mt-0.5 font-medium", sel ? "text-blue-600" : "text-slate-500")}>
                      {v.sub}
                    </p>
                    <span className={cn(
                      "inline-block mt-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide",
                      sel ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500",
                    )}>
                      {v.capacity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <FieldError msg={submitted ? errors.tipoVehiculo : undefined} />
        </div>

        {/* ── Sección 2: Fecha y hora ──────────────────────────────────── */}
        <div className="p-5 sm:p-6">
          <SectionTitle
            label="Fecha y hora del viaje"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            }
          />

          {/* Info de anticipación */}
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-2.5">
            <svg className="h-4 w-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-[11px] text-amber-700">
              Solicitudes del día actual requieren mínimo{" "}
              <strong>{MIN_HOURS_AHEAD} horas de anticipación</strong>. No se permiten fechas pasadas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Fecha de salida</Label>
              <input
                type="date"
                value={form.fecha}
                min={today}
                onChange={e => set("fecha", e.target.value)}
                className={inputCls(submitted ? errors.fecha : undefined)}
              />
              <FieldError msg={submitted ? errors.fecha : undefined} />
            </div>

            <div>
              <Label required>Hora de salida</Label>
              <input
                type="time"
                value={form.hora}
                min={minTime}
                onChange={e => set("hora", e.target.value)}
                className={inputCls(submitted ? errors.hora : undefined)}
              />
              {/* Hint hora mínima — solo si fecha = hoy y sin error activo */}
              {form.fecha === today && !(submitted && errors.hora) && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Hora mínima hoy:{" "}
                  <span className="font-semibold text-slate-600 ml-0.5">{minTime}</span>
                </p>
              )}
              <FieldError msg={submitted ? errors.hora : undefined} />
            </div>
          </div>
        </div>

        {/* ── Sección 3: Responsables ──────────────────────────────────── */}
        <div className="p-5 sm:p-6">
          <SectionTitle
            label="Información del responsable"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Encargado */}
            <div className="sm:col-span-2">
              <Label required>Nombre del Encargado</Label>
              <input
                type="text"
                value={form.encargado}
                onChange={e => set("encargado", e.target.value)}
                placeholder="Ej: Juan Pérez"
                className={inputCls(submitted ? errors.encargado : undefined)}
              />
              <FieldError msg={submitted ? errors.encargado : undefined} />
            </div>

            {/* Subencargado */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                Subencargado
                <span className="normal-case tracking-normal rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  Opcional
                </span>
              </label>
              <input
                type="text"
                value={form.subencargado}
                onChange={e => set("subencargado", e.target.value)}
                placeholder="Ej: María López"
                className={inputCls()}
              />
            </div>

            {/* Pasajeros */}
            <div>
              <Label required>Nº de Pasajeros</Label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.pasajeros}
                  onChange={e => set("pasajeros", e.target.value)}
                  placeholder="0"
                  className={cn(inputCls(submitted ? errors.pasajeros : undefined), "pr-10")}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>
              <FieldError msg={submitted ? errors.pasajeros : undefined} />
            </div>
          </div>
        </div>

        {/* ── Footer / Acciones ────────────────────────────────────────── */}
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between px-5 py-4 bg-slate-50/50">
          <button
            onClick={() => navigate("/nueva-solicitud")}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 hover:shadow-sm focus:outline-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Cancelar
          </button>

          <button
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-[13px] font-bold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            style={{
              background: "linear-gradient(135deg, #0f2548 0%, #2354b4 100%)",
              boxShadow: "0 4px 16px rgba(15,37,72,0.22), 0 1px 4px rgba(15,37,72,0.1)",
            }}
          >
            Continuar
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}