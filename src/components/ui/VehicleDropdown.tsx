import { useState, useEffect, useRef, useId } from "react";
import { inputCls } from "../../pages/solicitudes/Combustible/components/FormUI";
import { getStorageUrl } from "../../lib/api";

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

export function VehicleDropdown({ value, onChange, options, placeholder, error, disabled }: VehicleDropdownProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.id === value);
  const activeIndex = options.length ? Math.min(highlightedIndex, options.length - 1) : 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (option?: Catalogo) => {
    if (!option) return;
    onChange(option.id);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((index) => Math.min(index + 1, Math.max(options.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) selectOption(options[activeIndex]);
      else setOpen(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        role="combobox"
        aria-label="Seleccionar vehículo"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={open && options[activeIndex] ? `${listboxId}-${options[activeIndex].id}` : undefined}
        onClick={() => setOpen((current) => { if (!current) { const selectedIndex = options.findIndex((option) => option.id === value); setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0); } return !current; })}
        onKeyDown={handleKeyDown}
        className={`${inputCls(error ? "error" : undefined)} flex min-h-[48px] w-full items-center justify-between gap-3 p-1.5 px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
              {selected.image ? <img src={getStorageUrl(selected.image)} alt={selected.label} className="h-full w-full object-cover" /> : <span aria-hidden className="text-slate-400">↔</span>}
            </div>
            <div>
              <p className="text-[13px] font-bold leading-tight text-slate-900">{selected.label}</p>
              {selected.placa && <p className="text-[10px] font-semibold uppercase text-slate-500">{selected.placa}</p>}
            </div>
          </div>
        ) : <span className="text-[13px] text-slate-400">{placeholder}</span>}
        <span aria-hidden className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {open && !disabled && (
        <div id={listboxId} role="listbox" aria-label="Vehículos disponibles" className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-xl shadow-slate-200/50 ring-1 ring-black/5">
          {options.length === 0 ? <div role="option" aria-disabled="true" className="p-4 text-center text-sm text-slate-500">No hay vehículos disponibles</div> : options.map((option, index) => (
            <button
              key={option.id}
              id={`${listboxId}-${option.id}`}
              type="button"
              role="option"
              aria-selected={option.id === value}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectOption(option)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${index === highlightedIndex ? "bg-blue-50" : "hover:bg-slate-50/80"}`}
            >
              <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/50">
                {option.image ? <img src={getStorageUrl(option.image)} alt={option.label} className="h-full w-full object-cover" /> : <span aria-hidden className="text-slate-400">↔</span>}
              </div>
              <div>
                <p className={`text-[13px] font-bold ${option.id === value ? "text-blue-900" : "text-slate-700"}`}>{option.label}</p>
                {option.placa && <p className="mt-0.5 text-[10px] font-semibold uppercase text-slate-500">Placa: {option.placa}</p>}
              </div>
              {option.id === value && <span aria-hidden className="ml-auto text-blue-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}