import { useState, useEffect, useRef } from "react";
import { inputCls } from "../../pages/solicitudes/Combustible/components/FormUI";

export interface Catalogo {
  id: string;
  label: string;
  image?: string | null;
  placa?: string | null;
}

interface VehicleDropdownProps {
  value: string;
  onChange: (v: string) => void;
  options: Catalogo[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

export function VehicleDropdown({
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled,
}: VehicleDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.id === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`${inputCls(error ? "error" : undefined)} flex min-h-[48px] w-full items-center justify-between gap-3 p-1.5 px-4 text-left ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
              {selected.image ? (
                <img
                  src={selected.image.startsWith("http") ? selected.image : `${import.meta.env.VITE_API_BASE_URL || ""}/storage/${selected.image}`}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-900 leading-tight">
                {selected.label}
              </p>
              {selected.placa && (
                <p className="text-[10px] font-semibold text-slate-500 uppercase">
                  {selected.placa}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[13px] text-slate-400">{placeholder}</span>
        )}

        <svg
          className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-xl shadow-slate-200/50 outline-none ring-1 ring-black/5">
          {options.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No hay vehículos disponibles</div>
          ) : (
            options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50/80 ${
                  o.id === value ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/50">
                  {o.image ? (
                    <img
                      src={o.image.startsWith("http") ? o.image : `${import.meta.env.VITE_API_BASE_URL || ""}/storage/${o.image}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-[13px] font-bold ${o.id === value ? "text-blue-900" : "text-slate-700"}`}>
                    {o.label}
                  </p>
                  {o.placa && (
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-500 uppercase">
                      Placa: {o.placa}
                    </p>
                  )}
                </div>
                {o.id === value && (
                  <div className="ml-auto">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
