import React from 'react';
import { PRIORIDAD_CONFIG } from "../../../../services/combustible.service";
import type { Prioridad } from "../../../../services/combustible.service";
import { STEPS } from "../types";

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES UI COMPARTIDOS
// ══════════════════════════════════════════════════════════════════════════════

export function StepperHeader({ current }: { current: number }) {
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

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-semibold tracking-tight text-slate-800">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

export function inputCls(hasError = false) {
  return [
    "w-full rounded-lg border px-4 py-3 text-sm font-medium text-slate-800",
    "bg-white placeholder-slate-400 transition-all duration-200 outline-none",
    "focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900",
    hasError ? "border-red-300 ring-2 ring-red-100" : "border-slate-200 hover:border-slate-300 shadow-sm",
  ].join(" ");
}

export function SelectInput({
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

export function PrioridadButton({
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

export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-slate-900">{value || "—"}</span>
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
