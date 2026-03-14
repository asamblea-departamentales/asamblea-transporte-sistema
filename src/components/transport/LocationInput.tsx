// src/components/transport/LocationInput.tsx
// Input de ubicación con autocompletado de sedes de la Asamblea Legislativa
// + búsqueda en Nominatim como fallback

import { useState, useEffect, useRef } from "react";
import { buscarSedes, type SedeAsamblea } from "../../data/sedesAsamblea";

const NOMINATIM_EMAIL = "app@transporte.institucional.sv";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

type Suggestion =
  | { type: "sede"; data: SedeAsamblea }
  | { type: "nominatim"; data: NominatimResult };

type Props = {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  id?: string;
};

export default function LocationInput({
  value,
  onChange,
  placeholder = "Escribe una dirección o sede...",
  label,
  required,
  id,
}: Props) {
  const [suggestions, setSuggestions]   = useState<Suggestion[]>([]);
  const [open, setOpen]                 = useState(false);
  const [loading, setLoading]           = useState(false);
  const nominatimTimer                  = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef                        = useRef<AbortController | null>(null);
  const wrapperRef                      = useRef<HTMLDivElement>(null);

  // Cerrar al click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const q = value.trim();

    // ── 1. Siempre buscar sedes primero (instantáneo) ───────────────
    const sedeMatches = buscarSedes(q).map((s): Suggestion => ({ type: "sede", data: s }));

    if (sedeMatches.length > 0) {
      setSuggestions(sedeMatches);
      setOpen(true);
    }

    // ── 2. Nominatim con debounce si hay texto suficiente ───────────
    clearTimeout(nominatimTimer.current);
    if (q.length < 3) {
      if (sedeMatches.length === 0) { setSuggestions([]); setOpen(false); }
      return;
    }

    nominatimTimer.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=sv&limit=4&email=${NOMINATIM_EMAIL}`,
          { signal: abortRef.current.signal, headers: { "Accept-Language": "es" } }
        );
        const data: NominatimResult[] = await res.json();
        const nominatimSugs: Suggestion[] = data.map((r) => ({ type: "nominatim", data: r }));

        setSuggestions((prev) => {
          // Sedes primero, luego Nominatim (sin duplicados)
          const sedes = prev.filter((s) => s.type === "sede");
          return [...sedes, ...nominatimSugs].slice(0, 7);
        });
        setOpen(true);
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") console.error(e);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(nominatimTimer.current);
  }, [value]);

  function handleSelect(sug: Suggestion) {
    if (sug.type === "sede") {
      onChange(sug.data.nombreCompleto, sug.data.lat, sug.data.lng);
    } else {
      onChange(sug.data.display_name, parseFloat(sug.data.lat), parseFloat(sug.data.lon));
    }
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          {suggestions.map((sug, i) => {
            if (sug.type === "sede") {
              const esCentral = sug.data.tipo === "central";
              return (
                <li key={`sede-${sug.data.id}`}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(sug)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-indigo-50"
                  >
                    {/* Ícono */}
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${esCentral ? "bg-indigo-600" : "bg-indigo-100"}`}>
                      <svg className={`h-4 w-4 ${esCentral ? "text-white" : "text-indigo-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-slate-900">{sug.data.nombre}</p>
                      <p className="truncate text-xs text-slate-400">{sug.data.direccion}</p>
                    </div>

                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${esCentral ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                      {esCentral ? "Central" : "Departamental"}
                    </span>
                  </button>
                </li>
              );
            }

            // Nominatim result
            return (
              <li key={`nom-${i}`}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(sug)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="flex-1 truncate text-slate-700">{sug.data.display_name}</p>
                </button>
              </li>
            );
          })}

          {/* Footer separador */}
          <li className="border-t border-slate-100 px-4 py-2">
            <p className="text-[10px] text-slate-400">
              Sedes Asamblea Legislativa · OpenStreetMap
            </p>
          </li>
        </ul>
      )}
    </div>
  );
}