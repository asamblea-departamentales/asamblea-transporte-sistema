

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES UI COMPARTIDOS
// ══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { cn } from "../../../../lib/utils";

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES UI COMPARTIDOS (Alineados con Transporte)
// ══════════════════════════════════════════════════════════════════════════════

export function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
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

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
      {children}
      {required && <span className="text-red-500 font-black normal-case tracking-normal">*</span>}
    </label>
  );
}

export const inputCls = (err?: string) => cn(
  "w-full rounded-xl border bg-white px-4 py-2.5 text-[13px] text-slate-900",
  "outline-none transition placeholder:text-slate-300",
  "focus:ring-[3px] focus:ring-offset-0",
  err
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100/60",
);


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
      className={cn(inputCls(error ? "error" : undefined), "cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed")}
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



export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-slate-900">{value || "—"}</span>
    </div>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-red-500">
      <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z" />
      </svg>
      {msg}
    </p>
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
